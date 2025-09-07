// controllers/pedidoController.js
const mongoose = require('mongoose');
const Pedido = require('../models/pedido');
const Producto = require('../models/producto');
const Inventario = require('../models/inventario');
const Cliente = require('../models/cliente');

const normalizePhone = v => (v ? String(v).replace(/\D+/g, '') : v);

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
    let { cliente, clienteTelefono, producto, cantidad, pagoInicial = 0, fechaEntrega } = req.body;

    // Resolver cliente por teléfono si no viene _id
    if (!cliente && clienteTelefono) {
      const tel = normalizePhone(clienteTelefono);
      const cli = await Cliente.findOne({ telefono: tel }).session(session);
      if (!cli) throw new Error('Cliente no encontrado por teléfono');
      cliente = cli._id;
    }

    if (!cliente || !producto || cantidad == null) {
      throw new Error('cliente, producto y cantidad son obligatorios');
    }

    cantidad = Number(cantidad);
    pagoInicial = Number(pagoInicial || 0);
    if (cantidad <= 0) throw new Error('La cantidad debe ser mayor a 0');
    if (pagoInicial < 0) throw new Error('El pago inicial no puede ser negativo');

    // Verificar entidades
    const [cli, prod] = await Promise.all([
      Cliente.findById(cliente).session(session),
      Producto.findById(producto).populate('materiales.material').session(session)
    ]);
    if (!cli) throw new Error('Cliente no encontrado');
    if (!prod) throw new Error('Producto no encontrado');

    // Calcular totales usando snapshot de precio del producto
    const precioUnitarioPedido = Number(prod.precioUnitario || 0);
    if (Number.isNaN(precioUnitarioPedido) || precioUnitarioPedido < 0) {
      throw new Error('El producto no tiene precioUnitario válido');
    }
    const total = precioUnitarioPedido * cantidad;
    const pagado = Math.min(pagoInicial, total);
    const saldo  = Math.max(total - pagado, 0);
    const estadoPago = calcularEstadoPago(total, pagado);

    // Verificar stock de materiales
    for (const item of (prod.materiales || [])) {
      const reqPorUnidad = Number(item.cantidadPorUnidad || 0);
      const reqTotal = reqPorUnidad * cantidad;
      const inv = await Inventario.findById(item.material?._id || item.material).session(session).exec();
      if (!inv) throw new Error(`Material no encontrado: ${item.material?.nombre || item.material}`);
      if (inv.cantidadDisponible < reqTotal) {
        throw new Error(`Stock insuficiente de "${inv.nombre}". Requerido: ${reqTotal} ${inv.unidadDeMedida}, Disponible: ${inv.cantidadDisponible}`);
      }
    }

    // Descontar inventario
    for (const item of (prod.materiales || [])) {
      const reqTotal = Number(item.cantidadPorUnidad || 0) * cantidad;
      const inv = await Inventario.findById(item.material?._id || item.material).session(session).exec();
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
      .populate('producto', 'nombre precioUnitario') // <- incluye precio
      .exec();

    res.status(201).json(populated);
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    next(e);
  }
};

// Listar pedidos
exports.listarPedidos = async (req, res, next) => {
  try {
    const { q = '', estado, page = 1, limit = 50 } = req.query;
    const skip = (Math.max(parseInt(page, 10), 1) - 1) * Math.max(parseInt(limit, 10), 1);

    const where = {};
    if (estado) where.estado = estado;
    if (q) {
      const clientes = await Cliente.find({
        $or: [
          { nombre: { $regex: q, $options: 'i' } },
          { apellido: { $regex: q, $options: 'i' } },
          { telefono: { $regex: q.replace(/\D+/g, ''), $options: 'i' } },
        ]
      }, { _id: 1 }).lean();

      const productos = await Producto.find({
        nombre: { $regex: q, $options: 'i' }
      }, { _id: 1 }).lean();

      where.$or = [
        { cliente:  { $in: clientes.map(c => c._id) } },
        { producto: { $in: productos.map(p => p._id) } }
      ];
    }

    const [data, total] = await Promise.all([
      Pedido.find(where)
        .populate('cliente', 'nombre apellido telefono')
        .populate('producto', 'nombre precioUnitario') // <- incluye precio
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

// Obtener pedido
exports.getPedido = async (req, res, next) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('cliente', 'nombre apellido telefono correo')
      .populate('producto', 'nombre descripcion precioUnitario') // <- incluye precio
      .lean();
    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
    res.status(200).json(pedido);
  } catch (e) { next(e); }
};

// Actualizar estado/fechaEntrega
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
    )
    .populate('cliente', 'nombre apellido')
    .populate('producto', 'nombre precioUnitario');

    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
    res.status(200).json(pedido);
  } catch (e) { next(e); }
};

// Registrar pago
exports.registrarPago = async (req, res, next) => {
  try {
    const { monto, metodo = 'efectivo', nota } = req.body;
    const m = Number(monto);
    if (!m || m <= 0) throw new Error('El monto del pago debe ser mayor a 0');

    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
    if (pedido.estado === 'Cancelado') throw new Error('No se puede pagar un pedido cancelado');

    const nuevoPagado = Number(pedido.pagado) + m;
    const nuevoSaldo  = Math.max(Number(pedido.total) - nuevoPagado, 0);
    const nuevoEstadoPago = calcularEstadoPago(Number(pedido.total), nuevoPagado);

    pedido.pagos.push({ monto: m, metodo, nota });
    pedido.pagado    = nuevoPagado;
    pedido.saldo     = nuevoSaldo;
    pedido.estadoPago= nuevoEstadoPago;

    await pedido.save();

    const populated = await Pedido.findById(pedido._id)
      .populate('cliente', 'nombre apellido')
      .populate('producto', 'nombre precioUnitario');

    res.status(200).json(populated);
  } catch (e) { next(e); }
};

// Entregar
exports.entregarPedido = async (req, res, next) => {
  try {
    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado: 'Entregado', entregadoEn: new Date() },
      { new: true }
    )
    .populate('cliente', 'nombre apellido')
    .populate('producto', 'nombre precioUnitario');

    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
    res.status(200).json(pedido);
  } catch (e) { next(e); }
};

// Cancelar (restaura inventario)
exports.cancelarPedido = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const pedido = await Pedido.findById(req.params.id).session(session);
    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
    if (pedido.estado === 'Entregado') throw new Error('No se puede cancelar un pedido ya entregado');
    if (pedido.estado === 'Cancelado') {
      await session.commitTransaction();
      session.endSession();
      return res.status(200).json(pedido);
    }

    const prod = await Producto.findById(pedido.producto)
      .populate('materiales.material')
      .session(session);

    if (!prod) throw new Error('Producto del pedido no encontrado');

    for (const item of (prod.materiales || [])) {
      const devolver = Number(item.cantidadPorUnidad || 0) * Number(pedido.cantidad || 0);
      const inv = await Inventario.findById(item.material?._id || item.material).session(session).exec();
      inv.cantidadDisponible += devolver;
      await inv.save({ session });
    }

    pedido.estado = 'Cancelado';
    await pedido.save({ session });

    await session.commitTransaction();
    session.endSession();

    const populated = await Pedido.findById(pedido._id)
      .populate('cliente', 'nombre apellido')
      .populate('producto', 'nombre precioUnitario');

    res.status(200).json(populated);
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    next(e);
  }
};
// --- KPIs de Pedidos: counts y montos por estado ---
exports.kpisPedidos = async (req, res, next) => {
  try {
    // Filtros opcionales ?from=YYYY-MM-DD&to=YYYY-MM-DD
    const { from, to } = req.query;
    const where = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.$gte = new Date(`${from}T00:00:00.000Z`);
      if (to)   where.createdAt.$lte = new Date(`${to}T23:59:59.999Z`);
    }

    const [porEstado, totales] = await Promise.all([
      // Conteos por estado
      Pedido.aggregate([
        { $match: where },
        { $group: { _id: '$estado', count: { $sum: 1 } } }
      ]),
      // Totales de dinero
      Pedido.aggregate([
        { $match: where },
        {
          $group: {
            _id: null,
            totalPedidos: { $sum: 1 },
            totalMonto: { $sum: { $ifNull: ['$total', 0] } },
            totalPagado: { $sum: { $ifNull: ['$pagado', 0] } },
            totalSaldo:  { $sum: { $ifNull: ['$saldo', 0] } },
          }
        }
      ])
    ]);

    const countMap = porEstado.reduce((acc, r) => {
      acc[r._id || 'Desconocido'] = r.count;
      return acc;
    }, {});

    const t = totales[0] || { totalPedidos: 0, totalMonto: 0, totalPagado: 0, totalSaldo: 0 };

    // Mapeo a tus nombres:
    // - "realizados"   => Entregado
    // - "porHacer"     => Pendiente
    // - "enEspera"     => En proceso
    // - "cancelados"   => Cancelado
    const payload = {
      realizados: countMap['Entregado'] || 0,
      porHacer:   countMap['Pendiente'] || 0,
      enEspera:   countMap['En proceso'] || 0,
      cancelados: countMap['Cancelado'] || 0,

      totalPedidos: t.totalPedidos || 0,
      totalMonto:   t.totalMonto   || 0,
      totalPagado:  t.totalPagado  || 0,
      totalSaldo:   t.totalSaldo   || 0,
    };

    res.json(payload);
  } catch (e) { next(e); }
};

