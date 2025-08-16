const mongoose = require('mongoose');
const Pedido = require('../models/pedido');
const Producto = require('../models/producto');
const Inventario = require('../models/inventario');
const Cliente = require('../models/cliente');

// Helpers
const calcularEstadoPago = (total, pagado) => {
  if (pagado <= 0) return 'Sin pago';
  if (pagado < total) return 'Parcial';
  return 'Pagado';
};

// Crear pedido (descuenta inventario)
exports.crearPedido = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { cliente, producto, cantidad, pagoInicial = 0, fechaEntrega } = req.body;

    if (!cliente || !producto || !cantidad) {
      throw new Error('cliente, producto y cantidad son obligatorios');
    }
    if (cantidad <= 0) throw new Error('La cantidad debe ser mayor a 0');
    if (pagoInicial < 0) throw new Error('El pago inicial no puede ser negativo');

    // Verificar entidades
    const [cli, prod] = await Promise.all([
      Cliente.findById(cliente).session(session),
      Producto.findById(producto).populate('materiales.material').session(session)
    ]);
    if (!cli) throw new Error('Cliente no encontrado');
    if (!prod) throw new Error('Producto no encontrado');

    // Calcular totales
    const precioUnitarioPedido = prod.precioUnitario;
    const total = precioUnitarioPedido * cantidad;
    const pagado = Math.min(pagoInicial, total);
    const saldo = Math.max(total - pagado, 0);
    const estadoPago = calcularEstadoPago(total, pagado);

    // Verificar stock por cada material requerido
    for (const item of prod.materiales) {
      const reqPorUnidad = item.cantidadPorUnidad;
      const reqTotal = reqPorUnidad * cantidad;

      const inv = await Inventario.findById(item.material._id).session(session).exec();
      if (!inv) throw new Error(`Material no encontrado: ${item.material?.nombre || item.material}`);
      if (inv.cantidadDisponible < reqTotal) {
        throw new Error(`Stock insuficiente de "${inv.nombre}". Requerido: ${reqTotal} ${inv.unidadDeMedida}, Disponible: ${inv.cantidadDisponible}`);
      }
    }

    // Descontar inventario
    for (const item of prod.materiales) {
      const reqTotal = item.cantidadPorUnidad * cantidad;
      const inv = await Inventario.findById(item.material._id).session(session).exec();
      inv.cantidadDisponible -= reqTotal;
      await inv.save({ session });
    }

    // Construir pedido
    const pedidoData = {
      cliente,
      producto,
      cantidad,
      precioUnitarioPedido,
      total,
      pagado,
      saldo,
      estadoPago,
      fechaEntrega,
      pagos: []
    };
    if (pagado > 0) {
      pedidoData.pagos.push({ monto: pagado, metodo: 'inicial', nota: 'Pago inicial' });
    }

    const pedido = await Pedido.create([pedidoData], { session });
    await session.commitTransaction();
    session.endSession();

    const populated = await Pedido.findById(pedido[0]._id)
      .populate('cliente', 'nombre apellido telefono')
      .populate('producto', 'nombre')
      .exec();

    res.status(201).json(populated);
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    next(e);
  }
};

// Listar pedidos (con filtros básicos)
exports.listarPedidos = async (req, res, next) => {
  try {
    const { q = '', estado, page = 1, limit = 50 } = req.query;
    const skip = (Math.max(parseInt(page, 10), 1) - 1) * Math.max(parseInt(limit, 10), 1);

    const where = {};
    if (estado) where.estado = estado;
    if (q) {
      // búsqueda por nombre de cliente o producto
      // hacemos dos subconsultas para obtener ids coincidentes
      const clientes = await Cliente.find({
        $or: [
          { nombre: { $regex: q, $options: 'i' } },
          { apellido: { $regex: q, $options: 'i' } },
          { telefono: { $regex: q, $options: 'i' } },
        ]
      }, { _id: 1 }).lean();

      const productos = await Producto.find({
        nombre: { $regex: q, $options: 'i' }
      }, { _id: 1 }).lean();

      where.$or = [
        { cliente: { $in: clientes.map(c => c._id) } },
        { producto: { $in: productos.map(p => p._id) } }
      ];
    }

    const [data, total] = await Promise.all([
      Pedido.find(where)
        .populate('cliente', 'nombre apellido telefono')
        .populate('producto', 'nombre')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Pedido.countDocuments(where)
    ]);

    res.status(200).json({
      data, total,
      page: Number(page), limit: Number(limit),
      pages: Math.ceil(total / Number(limit) || 1)
    });
  } catch (e) { next(e); }
};

// Obtener pedido por ID
exports.getPedido = async (req, res, next) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('cliente', 'nombre apellido telefono correo')
      .populate('producto', 'nombre descripcion')
      .lean();
    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
    res.status(200).json(pedido);
  } catch (e) { next(e); }
};

// Actualizar estado / fechaEntrega
exports.actualizarPedido = async (req, res, next) => {
  try {
    const { estado, fechaEntrega } = req.body;

    const cambios = {};
    if (estado) cambios.estado = estado;
    if (fechaEntrega !== undefined) cambios.fechaEntrega = fechaEntrega;

    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      cambios,
      { new: true }
    ).populate('cliente', 'nombre apellido')
     .populate('producto', 'nombre');

    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
    res.status(200).json(pedido);
  } catch (e) { next(e); }
};

// Agregar un pago parcial o total
exports.registrarPago = async (req, res, next) => {
  try {
    const { monto, metodo = 'efectivo', nota } = req.body;
    if (monto === undefined || monto <= 0) throw new Error('El monto del pago debe ser mayor a 0');

    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
    if (pedido.estado === 'Cancelado') throw new Error('No se puede pagar un pedido cancelado');

    const nuevoPagado = pedido.pagado + monto;
    const nuevoSaldo  = Math.max(pedido.total - nuevoPagado, 0);
    const nuevoEstadoPago = calcularEstadoPago(pedido.total, nuevoPagado);

    pedido.pagos.push({ monto, metodo, nota });
    pedido.pagado = nuevoPagado;
    pedido.saldo = nuevoSaldo;
    pedido.estadoPago = nuevoEstadoPago;

    await pedido.save();

    const populated = await Pedido.findById(pedido._id)
      .populate('cliente', 'nombre apellido')
      .populate('producto', 'nombre');

    res.status(200).json(populated);
  } catch (e) { next(e); }
};

// Marcar como entregado
exports.entregarPedido = async (req, res, next) => {
  try {
    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado: 'Entregado', entregadoEn: new Date() },
      { new: true }
    ).populate('cliente', 'nombre apellido')
     .populate('producto', 'nombre');

    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
    res.status(200).json(pedido);
  } catch (e) { next(e); }
};

// Cancelar pedido (restaura inventario si aún no estaba entregado)
exports.cancelarPedido = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const pedido = await Pedido.findById(req.params.id).session(session);
    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
    if (pedido.estado === 'Entregado') throw new Error('No se puede cancelar un pedido ya entregado');
    if (pedido.estado === 'Cancelado') return res.status(200).json(pedido);

    // Restaurar inventario según receta del producto
    const prod = await Producto.findById(pedido.producto).populate('materiales.material').session(session);
    if (!prod) throw new Error('Producto del pedido no encontrado');

    for (const item of prod.materiales) {
      const devolver = item.cantidadPorUnidad * pedido.cantidad;
      const inv = await Inventario.findById(item.material._id).session(session).exec();
      inv.cantidadDisponible += devolver;
      await inv.save({ session });
    }

    pedido.estado = 'Cancelado';
    await pedido.save({ session });

    await session.commitTransaction();
    session.endSession();

    const populated = await Pedido.findById(pedido._id)
      .populate('cliente', 'nombre apellido')
      .populate('producto', 'nombre');

    res.status(200).json(populated);
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    next(e);
  }
};
