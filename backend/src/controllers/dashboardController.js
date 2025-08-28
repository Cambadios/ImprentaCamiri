// src/controllers/dashboard.controller.js
const mongoose = require('mongoose');
const Pedido = require('../models/pedido');
const Cliente = require('../models/cliente');
const Producto = require('../models/producto');
const Inventario = require('../models/inventario');

// --------- Helpers de fechas y redondeo ---------
function parseRange(query) {
  const now = new Date();
  const to = query.to ? new Date(query.to) : now;
  const from = query.from ? new Date(query.from) : new Date(to.getTime() - 29 * 24 * 60 * 60 * 1000); // 30 días
  // Normaliza límites del día
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

function toNumber(v, def = 10) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

function to2(n) {
  if (n === null || n === undefined) return n;
  return Math.round(Number(n) * 100) / 100;
}

// --------- Ventas & Pagos ---------

// 1) Ingresos por período (día/mes) => ?granularity=day|month
exports.ventasIngresos = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const gran = (req.query.granularity || 'day').toLowerCase();
    const format = gran === 'month' ? '%Y-%m' : '%Y-%m-%d';

    const data = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: { $dateToString: { format, date: '$createdAt' } },
          ingresos: { $sum: '$total' },
          pedidos: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ range: { from, to }, granularity: gran, data });
  } catch (err) { next(err); }
};

// 2) Distribución del estado de pago en el rango
exports.ventasEstadoPago = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const data = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: '$estadoPago', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ range: { from, to }, data });
  } catch (err) { next(err); }
};

// 3) Top clientes por facturación
exports.ventasTopClientes = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const limit = toNumber(req.query.limit, 10);
    const data = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: '$cliente', total: { $sum: '$total' } } },
      { $sort: { total: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'clientes',
          localField: '_id',
          foreignField: '_id',
          as: 'cli'
        }
      },
      { $unwind: '$cli' },
      {
        $project: {
          _id: 0,
          clienteId: '$cli._id',
          nombre: { $concat: ['$cli.nombre', ' ', '$cli.apellido'] },
          total: 1
        }
      }
    ]);
    res.json({ range: { from, to }, data });
  } catch (err) { next(err); }
};

// 4) Cobranza (pagado vs saldo)
exports.ventasCobranza = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const [agg] = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: null, pagado: { $sum: '$pagado' }, saldo: { $sum: '$saldo' }, total: { $sum: '$total' } } }
    ]);

    const pagado = to2(agg?.pagado || 0);
    const saldo = to2(agg?.saldo || 0);
    const total = to2(agg?.total || 0);

    res.json({ range: { from, to }, resumen: { pagado, saldo, total, porcentajeCobrado: total ? to2((pagado / total) * 100) : 0 } });
  } catch (err) { next(err); }
};

// --------- Productos (BOM + rentabilidad) ---------

// 8) Top productos por ingresos (y unidades)
exports.productosTop = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const limit = toNumber(req.query.limit, 10);
    const data = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: '$producto', ingresos: { $sum: '$total' }, unidades: { $sum: '$cantidad' } } },
      { $sort: { ingresos: -1 } },
      { $limit: limit },
      {
        $lookup: { from: 'productos', localField: '_id', foreignField: '_id', as: 'prod' }
      },
      { $unwind: '$prod' },
      {
        $project: { _id: 0, productoId: '$prod._id', nombre: '$prod.nombre', ingresos: 1, unidades: 1 }
      }
    ]);

    res.json({ range: { from, to }, data });
  } catch (err) { next(err); }
};

// 9) Consumo de materiales estimado por período (BOM expandido)
exports.productosConsumoMateriales = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const data = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: '$producto', unidadesVendidas: { $sum: '$cantidad' } } },
      // Une a productos para obtener BOM
      { $lookup: { from: 'productos', localField: '_id', foreignField: '_id', as: 'prod' } },
      { $unwind: '$prod' },
      { $unwind: '$prod.materiales' },
      {
        $project: {
          materialId: '$prod.materiales.material',
          consumo: { $multiply: ['$unidadesVendidas', '$prod.materiales.cantidadPorUnidad'] }
        }
      },
      { $group: { _id: '$materialId', totalConsumido: { $sum: '$consumo' } } },
      { $lookup: { from: 'inventarios', localField: '_id', foreignField: '_id', as: 'mat' } },
      { $unwind: '$mat' },
      {
        $project: {
          _id: 0,
          inventarioId: '$mat._id',
          nombre: '$mat.nombre',
          unidadDeMedida: '$mat.unidadDeMedida',
          totalConsumido: 1
        }
      },
      { $sort: { totalConsumido: -1 } }
    ]);

    res.json({ range: { from, to }, data });
  } catch (err) { next(err); }
};

// 10) Margen estimado por producto (precioUnitario - costoBOM)
exports.productosMargen = async (req, res, next) => {
  try {
    // Margen estático por configuración de producto (independiente del rango)
    // costoBOM = Σ (cantidadPorUnidad * Inventario.precioUnitario)
    const data = await Producto.aggregate([
      { $unwind: '$materiales' },
      {
        $lookup: {
          from: 'inventarios',
          localField: 'materiales.material',
          foreignField: '_id',
          as: 'mat'
        }
      },
      { $unwind: '$mat' },
      {
        $project: {
          _id: 1,
          nombre: 1,
          precioUnitario: 1,
          costoParcial: { $multiply: ['$materiales.cantidadPorUnidad', '$mat.precioUnitario'] }
        }
      },
      {
        $group: {
          _id: '$_id',
          nombre: { $first: '$nombre' },
          precioUnitario: { $first: '$precioUnitario' },
          costoBOM: { $sum: '$costoParcial' }
        }
      },
      {
        $project: {
          _id: 0,
          productoId: '$_id',
          nombre: 1,
          precioUnitario: 1,
          costoBOM: { $round: ['$costoBOM', 2] },
          margenEstimado: { $round: [{ $subtract: ['$precioUnitario', '$costoBOM'] }, 2] }
        }
      },
      { $sort: { margenEstimado: -1 } }
    ]);

    res.json({ data });
  } catch (err) { next(err); }
};

// --------- Inventario (stock & rotación) ---------

// 11) Stock bajo / crítico => ?umbral=10
exports.inventarioBajoStock = async (req, res, next) => {
  try {
    const umbral = toNumber(req.query.umbral, 10);
    const data = await Inventario.aggregate([
      { $match: { cantidadDisponible: { $lte: umbral } } },
      { $project: { _id: 0, inventarioId: '$_id', nombre: 1, categoria: 1, cantidadDisponible: 1, unidadDeMedida: 1 } },
      { $sort: { cantidadDisponible: 1 } }
    ]);
    res.json({ umbral, data });
  } catch (err) { next(err); }
};

// 12) Valor del inventario por categoría
exports.inventarioValorPorCategoria = async (req, res, next) => {
  try {
    const data = await Inventario.aggregate([
      { $project: { categoria: 1, valor: { $multiply: ['$cantidadDisponible', '$precioUnitario'] } } },
      { $group: { _id: '$categoria', valor: { $sum: '$valor' } } },
      { $project: { _id: 0, categoria: '$_id', valor: { $round: ['$valor', 2] } } },
      { $sort: { valor: -1 } }
    ]);
    res.json({ data });
  } catch (err) { next(err); }
};

// 13) Rotación/consumo de materiales (igual a consumo de #9, solo renombrado)
exports.inventarioRotacionMateriales = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const data = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: '$producto', unidadesVendidas: { $sum: '$cantidad' } } },
      { $lookup: { from: 'productos', localField: '_id', foreignField: '_id', as: 'prod' } },
      { $unwind: '$prod' },
      { $unwind: '$prod.materiales' },
      {
        $project: {
          materialId: '$prod.materiales.material',
          consumo: { $multiply: ['$unidadesVendidas', '$prod.materiales.cantidadPorUnidad'] }
        }
      },
      { $group: { _id: '$materialId', totalConsumido: { $sum: '$consumo' } } },
      { $lookup: { from: 'inventarios', localField: '_id', foreignField: '_id', as: 'mat' } },
      { $unwind: '$mat' },
      {
        $project: {
          _id: 0,
          inventarioId: '$mat._id',
          nombre: '$mat.nombre',
          categoria: '$mat.categoria',
          unidadDeMedida: '$mat.unidadDeMedida',
          totalConsumido: 1
        }
      },
      { $sort: { totalConsumido: -1 } }
    ]);

    res.json({ range: { from, to }, data });
  } catch (err) { next(err); }
};

// --------- Clientes ---------

// 14) Nuevos clientes por mes (o día si ?granularity=day)
exports.clientesNuevos = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const gran = (req.query.granularity || 'month').toLowerCase();
    const format = gran === 'day' ? '%Y-%m-%d' : '%Y-%m';

    const data = await Cliente.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: { $dateToString: { format, date: '$createdAt' } },
          nuevos: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ range: { from, to }, granularity: gran, data });
  } catch (err) { next(err); }
};

// 15) Clientes recurrentes (frecuencia)
exports.clientesRecurrentes = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const limit = toNumber(req.query.limit, 10);
    const data = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: '$cliente', veces: { $sum: 1 }, total: { $sum: '$total' } } },
      { $sort: { veces: -1, total: -1 } },
      { $limit: limit },
      { $lookup: { from: 'clientes', localField: '_id', foreignField: '_id', as: 'cli' } },
      { $unwind: '$cli' },
      {
        $project: {
          _id: 0,
          clienteId: '$cli._id',
          nombre: { $concat: ['$cli.nombre', ' ', '$cli.apellido'] },
          veces: 1,
          total: 1
        }
      }
    ]);

    res.json({ range: { from, to }, data });
  } catch (err) { next(err); }
};
