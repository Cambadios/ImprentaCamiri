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

// === helpers ===
const toNum = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

// Crear pedido (descuenta inventario) — SIN TRANSACCIONES
// Estrategia:
//   1) Consolidar requerimientos por material
//   2) Verificar stock leyendo inventarios
//   3) Descontar con $inc condicional (cantidadDisponible >= req)
//   4) Si alguna actualización falla, reponer lo ya descontado (compensación)
//   5) Crear pedido
exports.crearPedido = async (req, res, next) => {
  try {
    let { cliente, clienteTelefono, producto, cantidad, pagoInicial = 0, fechaEntrega, debug } = req.body;

    // 0) Normalizaciones
    cantidad    = toNum(cantidad, 0);
    pagoInicial = toNum(pagoInicial, 0);
    if (!cliente && clienteTelefono) {
      const tel = normalizePhone(clienteTelefono);
      const cli = await Cliente.findOne({ telefono: tel });
      if (!cli) throw new Error('Cliente no encontrado por teléfono');
      cliente = cli._id;
    }
    if (!cliente || !producto || !cantidad) throw new Error('cliente, producto y cantidad son obligatorios');
    if (cantidad <= 0) throw new Error('La cantidad debe ser mayor a 0');
    if (pagoInicial < 0) throw new Error('El pago inicial no puede ser negativo');

    // 1) Cargar entidades
    const [cli, prod] = await Promise.all([
      Cliente.findById(cliente),
      Producto.findById(producto).populate('materiales.material')
    ]);
    if (!cli)  throw new Error('Cliente no encontrado');
    if (!prod) throw new Error('Producto no encontrado');

    // 2) Totales con snapshot de precio
    const precioUnitarioPedido = toNum(prod.precioUnitario, NaN);
    if (!Number.isFinite(precioUnitarioPedido) || precioUnitarioPedido < 0) {
      throw new Error('El producto no tiene precioUnitario válido');
    }
    const total   = precioUnitarioPedido * cantidad;
    const pagado  = Math.min(pagoInicial, total);
    const saldo   = Math.max(total - pagado, 0);
    const estadoPago = calcularEstadoPago(total, pagado);

    // 3) Consolidar requerimientos por material
    //    Map: inventarioIdStr -> cantidad total requerida
    const requiredById = new Map();
    for (const it of (prod.materiales || [])) {
      const matId = String(it.material?._id || it.material);
      const porUnidad = toNum(it.cantidadPorUnidad, 0);
      if (porUnidad < 0) throw new Error(`cantidadPorUnidad inválida para material ${matId}`);
      const reqTotal = porUnidad * cantidad;
      if (!requiredById.has(matId)) requiredById.set(matId, 0);
      requiredById.set(matId, requiredById.get(matId) + reqTotal);
    }

    // Si no requiere materiales, continuamos (podría ser un "servicio")
    // 4) Verificación de stock (lectura)
    const inventariosAfectados = []; // para debug/compensación
    for (const [matId, reqTotalRaw] of requiredById.entries()) {
      const reqTotal = toNum(reqTotalRaw, 0);
      if (reqTotal <= 0) continue;

      const inv = await Inventario.findById(matId).exec();
      if (!inv) throw new Error(`Material no encontrado: ${matId}`);

      const disponible = toNum(inv.cantidadDisponible, 0);
      if (disponible < reqTotal) {
        throw new Error(`Stock insuficiente de "${inv.nombre}". Requerido: ${reqTotal} ${inv.unidadDeMedida || ''}, Disponible: ${disponible}`);
      }

      inventariosAfectados.push({
        _id: inv._id,
        nombre: inv.nombre,
        unidad: inv.unidadDeMedida,
        antes: disponible,
        descontar: reqTotal
      });
    }

    // 5) Descuento con $inc condicional (sin sesiones/tx)
    const updated = []; // para poder revertir si algo falla
    try {
      for (const item of inventariosAfectados) {
        // Condición: solo descuenta si hay suficiente stock
        const r = await Inventario.updateOne(
          { _id: item._id, cantidadDisponible: { $gte: item.descontar } },
          { $inc: { cantidadDisponible: -item.descontar } }
        );
        if (r.matchedCount !== 1 || r.modifiedCount !== 1) {
          throw new Error(`No se pudo descontar inventario de ${item.nombre} (concurrencia/stock cambió)`);
        }
        updated.push(item);
      }
    } catch (err) {
      // Compensación: reponer lo ya descontado
      for (const item of updated) {
        await Inventario.updateOne(
          { _id: item._id },
          { $inc: { cantidadDisponible: item.descontar } }
        );
      }
      throw err;
    }

    // 6) Crear pedido (ya se descontó stock)
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

    const pedido = await Pedido.create(pedidoData);

    // 7) Respuesta
    const populated = await Pedido.findById(pedido._id)
      .populate('cliente', 'nombre apellido telefono')
      .populate('producto', 'nombre precioUnitario')
      .lean();

    if (debug) {
      populated._debugDescuento = inventariosAfectados.map(x => ({
        material: x.nombre,
        unidad: x.unidad,
        antes: x.antes,
        descontado: x.descontar,
        despues: x.antes - x.descontar
      }));
    }

    return res.status(201).json(populated);
  } catch (e) {
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
          { nombre:   { $regex: q, $options: 'i' } },
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
        .populate('producto', 'nombre precioUnitario')
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
      .populate('producto', 'nombre descripcion precioUnitario')
      .lean();
    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
    res.status(200).json(pedido);
  } catch (e) { next(e); }
};

// Actualizar estado/fechaEntrega
// Regla de negocio: 'Cancelado' = "cerrado/entregado".
exports.actualizarPedido = async (req, res, next) => {
  try {
    const { estado, fechaEntrega } = req.body;
    const cambios = {};
    if (estado) {
      cambios.estado = estado;
      if (estado === 'Entregado' || estado === 'Cancelado') {
        cambios.entregadoEn = new Date(); // sello de cierre
      }
    }
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

    // Permitimos pagar incluso si está Cancelado/Entregado (cerrado)
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

// Marcar entregado (atajo)
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

// Eliminar pedido (borrado físico) — SIN TRANSACCIONES
// Reglas inventario:
//   - Si 'Pendiente' o 'En proceso' => reponer inventario
//   - Si 'Entregado' o 'Cancelado'  => NO reponer
exports.eliminarPedido = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const pedido = await Pedido.findById(id);
    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });

    const estado = String(pedido.estado || '');
    const esCerrado = (estado === 'Entregado' || estado === 'Cancelado');

    if (!esCerrado) {
      try {
        const prod = await Producto.findById(pedido.producto).populate('materiales.material');
        if (prod && Array.isArray(prod.materiales)) {
          // Consolidar por material
          const devolverById = new Map();
          for (const it of prod.materiales) {
            const matId = String(it.material?._id || it.material);
            const porUnidad = toNum(it.cantidadPorUnidad, 0);
            const total = porUnidad * toNum(pedido.cantidad, 0);
            if (!devolverById.has(matId)) devolverById.set(matId, 0);
            devolverById.set(matId, devolverById.get(matId) + total);
          }
          // Reponer (best-effort; no lanzamos si falla alguna línea)
          for (const [matId, devolver] of devolverById.entries()) {
            if (devolver > 0) {
              await Inventario.updateOne(
                { _id: matId },
                { $inc: { cantidadDisponible: devolver } }
              );
            }
          }
        }
      } catch (restoreErr) {
        console.error('[DELETE pedido] Fallo al reponer stock:', restoreErr);
      }
    }

    await Pedido.deleteOne({ _id: pedido._id });
    return res.status(204).send();
  } catch (e) {
    const msg = e?.message || 'Error eliminando pedido';
    console.error('[DELETE pedido] Error:', msg);
    return res.status(500).json({ message: msg });
  }
};

// --- KPIs de Pedidos ---
exports.kpisPedidos = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const where = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.$gte = new Date(`${from}T00:00:00.000Z`);
      if (to)   where.createdAt.$lte = new Date(`${to}T23:59:59.999Z`);
    }

    const [porEstado, totales] = await Promise.all([
      Pedido.aggregate([
        { $match: where },
        { $group: { _id: '$estado', count: { $sum: 1 } } }
      ]),
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

    const realizadosCerrados = (countMap['Entregado'] || 0) + (countMap['Cancelado'] || 0);

    const payload = {
      realizados: realizadosCerrados,            // Cerrados: Entregado + Cancelado
      porHacer:   countMap['Pendiente'] || 0,   // Pendientes
      enEspera:   countMap['En proceso'] || 0,  // En proceso
      cancelados: countMap['Cancelado'] || 0,   // Mostrar aparte si quieres
      totalPedidos: t.totalPedidos || 0,
      totalMonto:   t.totalMonto   || 0,
      totalPagado:  t.totalPagado  || 0,
      totalSaldo:   t.totalSaldo   || 0,
    };

    res.json(payload);
  } catch (e) { next(e); }
};
