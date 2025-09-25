// backend/src/controllers/biController.js
/* eslint-disable no-console */
const mongoose  = require('mongoose');
const Pedido    = require('../models/pedido');
const Cliente   = require('../models/cliente');
const Producto  = require('../models/producto');
const Inventario= require('../models/inventario');

/** ========= Helpers ========= */
const TZ_DEFAULT = 'America/La_Paz';
const isObjId = (v) => mongoose.isValidObjectId(v);
const oid = (v) => (isObjId(v) ? new mongoose.Types.ObjectId(v) : null);
const to2 = (n) => (n == null ? 0 : Math.round(Number(n) * 100) / 100);
const asArray = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v.flatMap(x => String(x).split(',')).map(s => s.trim()).filter(Boolean);
  return String(v).split(',').map(s => s.trim()).filter(Boolean);
};

/** Rango de fechas (cierra a las 23:59:59.999) */
function parseRange(query) {
  const now = new Date();
  const to = query.to ? new Date(query.to) : now;
  const from = query.from ? new Date(query.from) : new Date(to.getTime() - 89 * 24 * 60 * 60 * 1000); // 90 días
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    const err = new Error('Parámetros de fecha inválidos');
    err.status = 400;
    throw err;
  }
  if (from > to) {
    const err = new Error('El parámetro "from" no puede ser mayor que "to"');
    err.status = 400;
    throw err;
  }
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

/** Construye filtros comunes para Pedido */
function buildPedidoMatch(q) {
  const { from, to } = parseRange(q);
  const match = { createdAt: { $gte: from, $lte: to } };

  const clienteId   = oid(q.clienteId);
  const productoId  = oid(q.productoId);
  const categoriaId = oid(q.categoriaId);
  const estados     = asArray(q.estado);
  const estadosPago = asArray(q.estadoPago);

  if (clienteId)   match.cliente   = clienteId;
  if (productoId)  match.producto  = productoId;
  if (estados.length)     match.estado     = { $in: estados };
  if (estadosPago.length) match.estadoPago = { $in: estadosPago };

  return { match, from, to, categoriaId };
}

/** Si hay categoriaId, filtra pedidos por categoría del producto (añade $lookup si hace falta) */
function withCategoriaFilterPipeline(categoriaId, tz) {
  if (!categoriaId) return [];
  return [
    { $lookup: {
        from: 'productos',
        localField: 'producto',
        foreignField: '_id',
        as: 'prod'
    }},
    { $unwind: '$prod' },
    { $match: { 'prod.categoria': categoriaId } },
    // Mantenemos tz en mano para series (no afecta aquí)
  ];
}

/** ========= Endpoints ========= */

/** GET /api/bi/kpis?from&to&clienteId&productoId&categoriaId&estado&estadoPago */
exports.kpis = async (req, res, next) => {
  try {
    const { match, from, to, categoriaId } = buildPedidoMatch(req.query);
    const tz = req.query.tz || TZ_DEFAULT;

    const pipeline = [
      { $match: match },
      ...withCategoriaFilterPipeline(categoriaId, tz),
      {
        $facet: {
          totales: [
            { $group: {
                _id: null,
                pedidos: { $sum: 1 },
                ingresos:{ $sum: '$total' },
                pagado:  { $sum: '$pagado' },
                saldo:   { $sum: '$saldo' }
            }},
          ],
          costo: [
            // Para costo necesitamos BOM e insumos
            { $lookup: {
                from: 'productos',
                localField: 'producto',
                foreignField: '_id',
                as: 'prod'
            }},
            { $unwind: '$prod' },
            { $unwind: '$prod.materiales' },
            { $lookup: {
                from: 'inventarios',
                localField: 'prod.materiales.material',
                foreignField: '_id',
                as: 'insumo'
            }},
            { $unwind: '$insumo' },
            { $group: {
                _id: null,
                costo: { $sum: {
                  $multiply: [
                    '$cantidad',
                    '$prod.materiales.cantidadPorUnidad',
                    '$insumo.precioUnitario'
                  ]
                }}
            }},
          ],
        }
      },
      {
        $project: {
          pedidos: { $ifNull: [{ $first: '$totales.pedidos' }, 0] },
          ingresos:{ $ifNull: [{ $first: '$totales.ingresos' }, 0] },
          pagado:  { $ifNull: [{ $first: '$totales.pagado' }, 0] },
          saldo:   { $ifNull: [{ $first: '$totales.saldo' }, 0] },
          costoMateriales: { $ifNull: [{ $first: '$costo.costo' }, 0] }
        }
      }
    ];

    const [row] = await Pedido.aggregate(pipeline);
    const ingresos = to2(row?.ingresos || 0);
    const costo    = to2(row?.costoMateriales || 0);
    const margen   = to2(ingresos - costo);

    const meta = {
      from, to,
      tz,
      filtros: {
        clienteId: req.query.clienteId || null,
        productoId: req.query.productoId || null,
        categoriaId: req.query.categoriaId || null,
        estado: asArray(req.query.estado),
        estadoPago: asArray(req.query.estadoPago),
      },
      conteo: {
        clientes: await Cliente.estimatedDocumentCount(),
        productos: await Producto.estimatedDocumentCount(),
      }
    };

    res.json({
      meta,
      kpis: {
        pedidos: row?.pedidos || 0,
        ingresos,
        pagado:  to2(row?.pagado || 0),
        saldo:   to2(row?.saldo || 0),
        costoMateriales: costo,
        margenEstimado:  margen
      }
    });
  } catch (e) { next(e); }
};

/** GET /api/bi/series?from&to&groupBy=day|week|month&clienteId&productoId&categoriaId&estado&estadoPago&tz */
exports.series = async (req, res, next) => {
  try {
    const { match, from, to, categoriaId } = buildPedidoMatch(req.query);
    const groupBy = (req.query.groupBy || 'day').toLowerCase();
    const tz = req.query.tz || TZ_DEFAULT;

    const unit = groupBy === 'month' ? 'month' : groupBy === 'week' ? 'week' : 'day';

    const pipeline = [
      { $match: match },
      ...withCategoriaFilterPipeline(categoriaId, tz),
      { $addFields: {
          bucket: { $dateTrunc: { date: '$createdAt', unit, timezone: tz } }
      }},
      { $group: {
          _id: '$bucket',
          pedidos:  { $sum: 1 },
          ingresos: { $sum: '$total' },
          pagado:   { $sum: '$pagado' },
          saldo:    { $sum: '$saldo' }
      }},
      { $sort: { _id: 1 } },
      { $project: {
          _id: 0,
          date: '$_id',
          pedidos: 1,
          ingresos: 1,
          pagado: 1,
          saldo: 1
      }}
    ];

    const data = await Pedido.aggregate(pipeline);
    res.json({ from, to, groupBy: unit, tz, data });
  } catch (e) { next(e); }
};

/** GET /api/bi/clientes?from&to&q&page=1&limit=10 */
exports.clientesResumen = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const q = (req.query.q || '').trim();
    const page  = Math.max(1, Number(req.query.page || 1));
    const limit = Math.max(1, Math.min(50, Number(req.query.limit || 10)));
    const skip  = (page - 1) * limit;

    // Búsqueda básica; si quieres collation por acentos, añade { collation: { locale:'es', strength:1 } }
    const matchCli = q ? {
      $or: [
        { nombre:   new RegExp(q, 'i') },
        { apellido: new RegExp(q, 'i') },
        { telefono: new RegExp(q, 'i') },
        { correo:   new RegExp(q, 'i') },
      ]
    } : {};

    const items = await Cliente.aggregate([
      { $match: matchCli },
      { $lookup: {
          from: 'pedidos',
          let: { cid: '$_id' },
          pipeline: [
            { $match: {
                $expr: { $eq: ['$cliente', '$$cid'] },
                createdAt: { $gte: from, $lte: to }
            }},
            { $project: { total:1, pagado:1, saldo:1, createdAt:1 } }
          ],
          as: 'ped'
      }},
      { $project: {
          nombre: 1, apellido: 1, telefono: 1, correo: 1,
          pedidos: { $size: '$ped' },
          ingresos: { $sum: '$ped.total' },
          pagado: { $sum: '$ped.pagado' },
          saldo: { $sum: '$ped.saldo' },
          ultimaCompra: { $max: '$ped.createdAt' }
      }},
      { $sort: { ingresos: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const total = await Cliente.countDocuments(matchCli);
    // Redondeo
    items.forEach(it => {
      it.ingresos = to2(it.ingresos);
      it.pagado   = to2(it.pagado);
      it.saldo    = to2(it.saldo);
    });

    res.json({ from, to, page, limit, total, items });
  } catch (e) { next(e); }
};

/** GET /api/bi/clientes/:id?from&to */
exports.clienteDetalle = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const id = oid(req.params.id);
    if (!id) return res.status(400).json({ error: 'clienteId inválido' });

    const cliente = await Cliente.findById(id).lean();
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    const pedidos = await Pedido.find({ cliente: id, createdAt: { $gte: from, $lte: to } })
      .populate({ path: 'producto', select: 'codigo nombre precioUnitario categoria' })
      .sort({ createdAt: -1 })
      .lean();

    const tot = pedidos.reduce((a, p) => ({
      pedidos:  a.pedidos + 1,
      ingresos: a.ingresos + (p.total  || 0),
      pagado:   a.pagado  + (p.pagado || 0),
      saldo:    a.saldo   + (p.saldo  || 0)
    }), { pedidos: 0, ingresos: 0, pagado: 0, saldo: 0 });

    const top = await Pedido.aggregate([
      { $match: { cliente: id, createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: '$producto', unidades: { $sum: '$cantidad' }, ingresos: { $sum: '$total' } } },
      { $lookup: { from: 'productos', localField: '_id', foreignField: '_id', as: 'prod' } },
      { $unwind: '$prod' },
      { $project: {
          _id: 0,
          productoId: '$prod._id',
          codigo: '$prod.codigo',
          nombre: '$prod.nombre',
          unidades: 1,
          ingresos: 1
      }},
      { $sort: { ingresos: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      from, to, cliente,
      totales: {
        pedidos:  tot.pedidos,
        ingresos: to2(tot.ingresos),
        pagado:   to2(tot.pagado),
        saldo:    to2(tot.saldo)
      },
      topProductos: top,
      pedidos
    });
  } catch (e) { next(e); }
};

/** GET /api/bi/pedidos/estado?from&to&clienteId&productoId&categoriaId */
exports.estadoPedidos = async (req, res, next) => {
  try {
    const { match, from, to, categoriaId } = buildPedidoMatch(req.query);

    const data = await Pedido.aggregate([
      { $match: match },
      ...withCategoriaFilterPipeline(categoriaId),
      {
        $facet: {
          porEstado: [
            { $group: { _id: '$estado', count: { $sum: 1 }, ingresos: { $sum: '$total' } } },
            { $project: { _id: 0, estado: '$_id', count: 1, ingresos: 1 } },
            { $sort: { count: -1 } }
          ],
          porEstadoPago: [
            { $group: {
                _id: '$estadoPago',
                count:  { $sum: 1 },
                total:  { $sum: '$total' },
                pagado: { $sum: '$pagado' },
                saldo:  { $sum: '$saldo' }
            }},
            { $project: { _id: 0, estadoPago: '$_id', count: 1, total: 1, pagado: 1, saldo: 1 } },
            { $sort: { count: -1 } }
          ]
        }
      }
    ]);

    const { porEstado = [], porEstadoPago = [] } = data[0] || {};
    // Redondeo
    porEstado.forEach(x => x.ingresos = to2(x.ingresos));
    porEstadoPago.forEach(x => {
      x.total  = to2(x.total);
      x.pagado = to2(x.pagado);
      x.saldo  = to2(x.saldo);
    });

    res.json({ from, to, porEstado, porEstadoPago });
  } catch (e) { next(e); }
};

/** GET /api/bi/insumos/stock?sort=valuacion|-valuacion|cantidad|-cantidad&q&categoriaId&page=1&limit=50 */
exports.insumosStock = async (req, res, next) => {
  try {
    const sortParam = (req.query.sort || '-valuacion').toLowerCase();
    const q = (req.query.q || '').trim();
    const categoriaId = oid(req.query.categoriaId);
    const page  = Math.max(1, Number(req.query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 50)));
    const skip  = (page - 1) * limit;

    const match = {};
    if (q) match.$or = [
      { nombre: new RegExp(q, 'i') },
      { marca:  new RegExp(q, 'i') },
      { descripcion: new RegExp(q, 'i') }
    ];
    if (categoriaId) match.categoria = categoriaId;

    const sort = {};
    if (sortParam === 'valuacion') sort.valuacion = 1;
    else if (sortParam === '-valuacion') sort.valuacion = -1;
    else if (sortParam === 'cantidad') sort.cantidadDisponible = 1;
    else if (sortParam === '-cantidad') sort.cantidadDisponible = -1;
    else sort.valuacion = -1;

    const pipeline = [
      { $match: match },
      { $project: {
          inventarioId: '$_id',
          codigo: 1, nombre: 1, categoria: 1, marca: 1, descripcion: 1,
          cantidadDisponible: 1, precioUnitario: 1,
          valuacion: { $multiply: ['$cantidadDisponible', '$precioUnitario'] }
      }},
      { $sort: sort },
      { $skip: skip },
      { $limit: limit }
    ];

    const [items, total] = await Promise.all([
      Inventario.aggregate(pipeline),
      Inventario.countDocuments(match)
    ]);

    items.forEach(it => {
      it.valuacion = to2(it.valuacion);
      it.precioUnitario = to2(it.precioUnitario);
      it.cantidadDisponible = to2(it.cantidadDisponible);
    });

    res.json({ page, limit, total, items });
  } catch (e) { next(e); }
};
