// controllers/pedidoController.js
const mongoose = require('mongoose');
const Pedido = require('../models/pedido');
const Producto = require('../models/producto');
const Inventario = require('../models/inventario');
const Cliente = require('../models/cliente');

const { registrarSalidaLogPorPedidoHecho } = require('../services/inventarioSalidaService');

// ===== Helpers básicos =====
const normalizePhone = v => (v ? String(v).replace(/\D+/g, '') : v);

const calcularEstadoPago = (total, pagado) => {
  if (pagado <= 0) return 'Sin pago';
  if (pagado < total) return 'Parcial';
  return 'Pagado';
};

const toNum = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

// ===== FSM (estados canónicos) =====
const ORDER_STATES = ['Pendiente', 'En Produccion', 'Hecho', 'Entregado'];
const TRANSITIONS = {
  'Pendiente':     ['En Produccion'],
  'En Produccion': ['Hecho'],
  'Hecho':         ['Entregado'],
  'Entregado':     []
};
function canTransition(from, to) {
  return (TRANSITIONS[from] || []).includes(to);
}

// Alias → canónico (tolerante a datos antiguos)
const CANON = {
  'pendiente': 'Pendiente',
  'en produccion': 'En Produccion',
  'en producción': 'En Produccion',
  'en proceso': 'En Produccion',
  'hecho': 'Hecho',
  'entregado': 'Entregado',
};
const canonEstado = (s) => CANON[String(s || '').trim().toLowerCase()] || s;

// ===== Crear pedido (descuenta inventario) =====
// 1) Consolida requerimientos del producto
// 2) Verifica stock
// 3) Descuenta con $inc condicional
// 4) Crea pedido (snapshot de precio/cálculos de pago)
exports.crearPedido = async (req, res, next) => {
  try {
    let { cliente, clienteTelefono, producto, cantidad, pagoInicial = 0, fechaEntrega, debug } = req.body;

    // Normalizaciones
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

    // Cargar entidades
    const [cli, prod] = await Promise.all([
      Cliente.findById(cliente),
      Producto.findById(producto).populate('materiales.material')
    ]);
    if (!cli)  throw new Error('Cliente no encontrado');
    if (!prod) throw new Error('Producto no encontrado');

    // Snapshot de precio
    const precioUnitarioPedido = toNum(prod.precioUnitario, NaN);
    if (!Number.isFinite(precioUnitarioPedido) || precioUnitarioPedido < 0) {
      throw new Error('El producto no tiene precioUnitario válido');
    }
    const total   = toNum(precioUnitarioPedido * cantidad, 0);
    const pagado  = Math.min(toNum(pagoInicial, 0), total);
    const saldo   = Math.max(total - pagado, 0);
    const estadoPago = calcularEstadoPago(total, pagado);

    // Consolidar requerimientos por material
    const requiredById = new Map();
    for (const it of (prod.materiales || [])) {
      const matId = String(it.material?._id || it.material);
      const porUnidad = toNum(it.cantidadPorUnidad, 0);
      if (porUnidad < 0) throw new Error(`cantidadPorUnidad inválida para material ${matId}`);
      const reqTotal = porUnidad * cantidad;
      if (!requiredById.has(matId)) requiredById.set(matId, 0);
      requiredById.set(matId, requiredById.get(matId) + reqTotal);
    }

    // Verificación de stock
    const inventariosAfectados = [];
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

    // Descuento (con compensación si algo falla)
    const updated = [];
    try {
      for (const item of inventariosAfectados) {
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
      // Compensación
      for (const item of updated) {
        await Inventario.updateOne(
          { _id: item._id },
          { $inc: { cantidadDisponible: item.descontar } }
        );
      }
      throw err;
    }

    // Crear pedido
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
      estado: 'Pendiente',
      pagos: []
    };
    if (pagado > 0) {
      pedidoData.pagos.push({ monto: pagado, metodo: 'inicial', nota: 'Pago inicial' });
    }

    const pedido = await Pedido.create(pedidoData);

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

// ===== Listar pedidos =====
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

// ===== Obtener pedido =====
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

// ===== Actualizar pedido (FSM + salida en Hecho + entrega) =====
exports.actualizarPedido = async (req, res, next) => {
  try {
    let { estado, fechaEntrega } = req.body;

    const pedido = await Pedido.findById(req.params.id)
      .populate({
        path: 'producto',
        select: 'nombre materiales.precio materiales.material materiales.cantidadPorUnidad',
        populate: { path: 'materiales.material', select: 'nombre unidadDeMedida codigo' }
      });
    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });

    const estadoActualCanon  = canonEstado(pedido.estado);
    const estadoDestinoCanon = canonEstado(estado);

    if (estadoActualCanon === 'Entregado') {
      await Pedido.deleteOne({ _id: pedido._id });
      return res.status(200).json({ deleted: true, message: 'El pedido ya estaba en Entregado y fue eliminado.' });
    }

    const cambios = {};
    let salidaRegistradaAhora = false;

    if (estado) {
      if (!ORDER_STATES.includes(estadoDestinoCanon)) {
        return res.status(400).json({ message: `Estado inválido: ${estado}` });
      }

      if (estadoDestinoCanon !== estadoActualCanon) {
        if (!canTransition(estadoActualCanon, estadoDestinoCanon)) {
          return res.status(400).json({
            message: `Transición inválida: ${pedido.estado} → ${estado}. Flujo permitido: Pendiente → En Produccion → Hecho → Entregado`
          });
        }

        // === Registrar SALIDA (log) al pasar a "Hecho" ===
        if (estadoDestinoCanon === 'Hecho' && !pedido.procesadoSalida) {
          try {
            // usuario opcional (si tu auth no setea req.user, pasa null)
            const userId = req.user?._id || req.user?.id || null;
            await registrarSalidaLogPorPedidoHecho(pedido._id, userId);
            salidaRegistradaAhora = true;
          } catch (err) {
            // Fallback: no tiramos el server; dejamos evidencia y snapshot mínimo
            console.error('[actualizarPedido] ERROR en registrarSalidaLogPorPedidoHecho:', err?.message, err?.stack);
            // Creamos snapshot mínimo para que el front vea “en qué se gastó”
            const materialesConsumidos = [];
            for (const it of (pedido.producto?.materiales || [])) {
              const insumo = it.material?._id || it.material;
              const unidad = it.material?.unidadDeMedida || '';
              const porUnidad = Number(it.cantidadPorUnidad || 0);
              const total = porUnidad * Number(pedido.cantidad || 0);
              if (insumo && total > 0) {
                materialesConsumidos.push({ insumo, cantidad: total, unidad });
              }
            }
            // Marcamos como procesado para no volver a intentarlo en siguientes transiciones
            cambios.procesadoSalida = true;
            cambios.materialesConsumidos = materialesConsumidos;
            salidaRegistradaAhora = true; // para informar al front
          }
        }

        // === Entregado ===
        if (estadoDestinoCanon === 'Entregado') {
          if (pedido.estadoPago !== 'Pagado') {
            return res.status(400).json({ message: 'Para marcar Entregado, el pedido debe estar Pagado al 100%.' });
          }
          const entregadoEn = new Date();
          await Pedido.deleteOne({ _id: pedido._id });
          return res.status(200).json({
            deleted: true,
            message: 'Pedido entregado y eliminado.',
            entregadoEn
          });
        }

        cambios.estado = estadoDestinoCanon; // guardar canónico
      }
    }

    if (fechaEntrega !== undefined) cambios.fechaEntrega = fechaEntrega;

    const actualizado = await Pedido.findByIdAndUpdate(
      pedido._id,
      cambios,
      { new: true }
    )
      .populate('cliente', 'nombre apellido')
      .populate('producto', 'nombre precioUnitario materiales.material materiales.cantidadPorUnidad');

    if (!actualizado) {
      // Muy raro, pero evita toObject de null
      return res.status(500).json({ message: 'No se pudo actualizar el pedido.' });
    }

    const payload = actualizado.toObject();
    if (salidaRegistradaAhora) {
      payload._salidaRegistrada = true;
      payload._materialesConsumidos = actualizado.materialesConsumidos;
    }

    return res.status(200).json(payload);
  } catch (e) {
    console.error('[actualizarPedido] 500:', e?.message, e?.stack);
    next(e);
  }
};


// ===== Registrar pago =====
exports.registrarPago = async (req, res, next) => {
  try {
    const { monto, metodo = 'efectivo', nota } = req.body;
    const m = Number(monto);
    if (!m || m <= 0) throw new Error('El monto del pago debe ser mayor a 0');

    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });

    // Si por alguna razón estaba entregado, aseguro integridad
    if (canonEstado(pedido.estado) === 'Entregado') {
      await Pedido.deleteOne({ _id: pedido._id });
      return res.status(410).json({ message: 'El pedido ya fue entregado y eliminado.' });
    }

    const nuevoPagado = Number(pedido.pagado) + m;
    const nuevoSaldo  = Math.max(Number(pedido.total) - nuevoPagado, 0);
    const nuevoEstadoPago = calcularEstadoPago(Number(pedido.total), nuevoPagado);

    pedido.pagos.push({ monto: m, metodo, nota });
    pedido.pagado     = nuevoPagado;
    pedido.saldo      = nuevoSaldo;
    pedido.estadoPago = nuevoEstadoPago;

    await pedido.save();

    const populated = await Pedido.findById(pedido._id)
      .populate('cliente', 'nombre apellido')
      .populate('producto', 'nombre precioUnitario');

    res.status(200).json(populated);
  } catch (e) { next(e); }
};

// ===== Atajo: entregar (reutiliza actualizarPedido) =====
exports.entregarPedido = async (req, res, next) => {
  try {
    req.body = { ...req.body, estado: 'Entregado' };
    return exports.actualizarPedido(req, res, next);
  } catch (e) {
    next(e);
  }
};

// ===== Eliminar pedido =====
// Si NO está entregado, reponer inventario (best-effort)
exports.eliminarPedido = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const pedido = await Pedido.findById(id);
    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });

    const estadoCanon = canonEstado(pedido.estado);

    if (estadoCanon !== 'Entregado') {
      try {
        const prod = await Producto.findById(pedido.producto).populate('materiales.material');
        if (prod && Array.isArray(prod.materiales)) {
          const devolverById = new Map();
          for (const it of prod.materiales) {
            const matId = String(it.material?._id || it.material);
            const porUnidad = toNum(it.cantidadPorUnidad, 0);
            const total = porUnidad * toNum(pedido.cantidad, 0);
            if (!devolverById.has(matId)) devolverById.set(matId, 0);
            devolverById.set(matId, devolverById.get(matId) + total);
          }
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

// ===== KPIs =====
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
            totalMonto:   { $sum: { $ifNull: ['$total', 0] } },
            totalPagado:  { $sum: { $ifNull: ['$pagado', 0] } },
            totalSaldo:   { $sum: { $ifNull: ['$saldo', 0] } },
          }
        }
      ])
    ]);

    const countMap = porEstado.reduce((acc, r) => {
      acc[r._id || 'Desconocido'] = r.count;
      return acc;
    }, {});

    const t = totales[0] || { totalPedidos: 0, totalMonto: 0, totalPagado: 0, totalSaldo: 0 };

    const payload = {
      pendientes:   countMap['Pendiente']     || 0,
      produccion:   countMap['En Produccion'] || 0,
      hechos:       countMap['Hecho']         || 0,
      totalPedidos: t.totalPedidos || 0,
      totalMonto:   t.totalMonto   || 0,
      totalPagado:  t.totalPagado  || 0,
      totalSaldo:   t.totalSaldo   || 0,
    };

    res.json(payload);
  } catch (e) { next(e); }
};
