// controllers/dashboardControllerMaquinaria.js
const mongoose = require('mongoose');
const Pedido = require('../models/pedido');
const Producto = require('../models/producto');
const Inventario = require('../models/inventario');
const Cliente = require('../models/cliente');

// Utiles
const to2 = (n) => Math.round(Number(n || 0) * 100) / 100;

// Parse rangos tipo "30d", "6m"
function parseRange(range = '30d') {
  const now = new Date();
  const start = new Date(now);
  const m = String(range).match(/^(\d+)([md])$/i);
  if (m) {
    const n = parseInt(m[1], 10);
    if (m[2].toLowerCase() === 'm') start.setMonth(start.getMonth() - n);
    else start.setDate(start.getDate() - n);
  } else {
    start.setDate(start.getDate() - 30);
  }
  return { start, end: now };
}

const DashboardControllerMaquinaria = {
  /**
   * KPIs principales del panel (todos basados en tus modelos):
   * - pendingOrders: # de Pedidos en 'Pendiente'
   * - inProgress:    # de Pedidos en 'En proceso'
   * - deliveredToday:# de Pedidos con 'Entregado' y entregadoEn = hoy
   * - ingresosPeriodo: SUM(pagado) en rango (default 30d)
   * - saldoPendiente: SUM(saldo) de Pedidos activos (Pendiente/En proceso)
   * - clientesUnicosPeriodo: # clientes distintos con pedidos en el rango
   * - productosBajoStock: # items Inventario con cantidadDisponible <= lowStock (query, default 10)
   */
  async getMetrics(req, res) {
    try {
      const range = req.query.range || '30d';
      const lowStock = Math.max(0, parseInt(req.query.lowStock || '10', 10));
      const { start, end } = parseRange(range);

      const activos = ['Pendiente', 'En proceso'];

      // 1) Conteos por estado activo
      const byStateActivos = await Pedido.aggregate([
        { $match: { estado: { $in: activos } } },
        { $group: { _id: '$estado', c: { $sum: 1 } } }
      ]);
      const pendingOrders = byStateActivos.find(x => x._id === 'Pendiente')?.c || 0;
      const inProgress    = byStateActivos.find(x => x._id === 'En proceso')?.c || 0;

      // 2) Entregados hoy (según 'entregadoEn' = hoy)
      const startDay = new Date(); startDay.setHours(0,0,0,0);
      const endDay   = new Date(); endDay.setHours(23,59,59,999);
      const deliveredToday = await Pedido.countDocuments({
        estado: 'Entregado',
        entregadoEn: { $gte: startDay, $lte: endDay }
      });

      // 3) Ingresos período: sum(pagado) en rango
      const ingresosAgg = await Pedido.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, totalPagado: { $sum: '$pagado' } } }
      ]);
      const ingresosPeriodo = to2(ingresosAgg[0]?.totalPagado || 0);

      // 4) Saldo pendiente (activos)
      const saldoAgg = await Pedido.aggregate([
        { $match: { estado: { $in: activos } } },
        { $group: { _id: null, saldo: { $sum: '$saldo' } } }
      ]);
      const saldoPendiente = to2(saldoAgg[0]?.saldo || 0);

      // 5) Clientes únicos en el período
      const clientesIds = await Pedido.distinct('cliente', { createdAt: { $gte: start, $lte: end } });
      const clientesUnicosPeriodo = clientesIds.length;

      // 6) Bajo stock
      const productosBajoStock = await Inventario.countDocuments({
        cantidadDisponible: { $lte: lowStock }
      });

      res.json({
        pendingOrders,
        inProgress,
        deliveredToday,
        ingresosPeriodo,
        saldoPendiente,
        clientesUnicosPeriodo,
        productosBajoStock,
        range, lowStock
      });
    } catch (err) {
      console.error('getMetrics error', err);
      res.status(500).json({ error: 'Error obteniendo métricas' });
    }
  },

  /**
   * Breakdown de pedidos por estado en un rango (default 30d)
   * Útil para donut o chips: [{ estado:'Pendiente', total: 12 }, ...]
   */
  async getStatusBreakdown(req, res) {
    try {
      const range = req.query.range || '30d';
      const { start, end } = parseRange(range);

      const agg = await Pedido.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: '$estado', total: { $sum: 1 } } },
        { $project: { _id: 0, estado: '$_id', total: 1 } },
        { $sort: { total: -1 } }
      ]);

      res.json(agg);
    } catch (err) {
      console.error('getStatusBreakdown error', err);
      res.status(500).json({ error: 'Error obteniendo distribución por estado' });
    }
  },

  /**
   * Tendencia de pedidos por periodo (default: últimos 12 meses).
   */
  async getOrdersTrend(req, res) {
    try {
      const scope = String(req.query.scope || '12m');
      const now = new Date();
      const start = new Date(now);

      const m = scope.match(/^(\d+)([md])$/i);
      if (m) {
        const n = parseInt(m[1], 10);
        if (m[2].toLowerCase() === 'm') start.setMonth(start.getMonth() - n);
        else start.setDate(start.getDate() - n);
      } else {
        start.setMonth(start.getMonth() - 12);
      }

      const agg = await Pedido.aggregate([
        { $match: { createdAt: { $gte: start, $lte: now } } },
        { $group: {
            _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
            pedidos: { $sum: 1 }
          }
        },
        { $sort: { '_id.y': 1, '_id.m': 1 } }
      ]);

      const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      const points = [];
      const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

      while (cursor <= now) {
        const y = cursor.getFullYear();
        const mIdx = cursor.getMonth() + 1;
        const found = agg.find(r => r._id.y === y && r._id.m === mIdx);
        points.push({ period: months[mIdx - 1], pedidos: found ? found.pedidos : 0 });
        cursor.setMonth(cursor.getMonth() + 1);
      }

      res.json(points.slice(-12));
    } catch (err) {
      console.error('getOrdersTrend error', err);
      res.status(500).json({ error: 'Error obteniendo tendencia de pedidos' });
    }
  },

  /**
   * Top productos/servicios más vendidos en un rango (default 30d).
   */
  async getTopSales(req, res) {
    try {
      const limit = Math.max(1, Math.min(50, parseInt(req.query.limit || '7', 10)));
      const range = String(req.query.range || '30d');
      const { start, end } = parseRange(range);

      const agg = await Pedido.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: '$producto', ventas: { $sum: '$cantidad' } } },
        { $sort: { ventas: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'productos',
            localField: '_id',
            foreignField: '_id',
            as: 'prod'
          }
        },
        { $unwind: '$prod' },
        { $project: { _id: 0, nombre: '$prod.nombre', ventas: 1 } }
      ]);

      res.json(agg);
    } catch (err) {
      console.error('getTopSales error', err);
      res.status(500).json({ error: 'Error obteniendo top de ventas' });
    }
  },

  /**
   * Lista de compras (insumos críticos) calculada en base a:
   * pedidos activos + materiales por producto + stock disponible.
   */
  async getPurchaseNeeds(req, res) {
    try {
      const activos = ['Pendiente', 'En proceso'];
      const pedidosActivos = await Pedido.find(
        { estado: { $in: activos } },
        { producto: 1, cantidad: 1 }
      )
        .populate({
          path: 'producto',
          select: 'materiales nombre',
          populate: {
            path: 'materiales.material',
            model: 'Inventario',
            select: 'nombre cantidadDisponible unidadDeMedida'
          }
        })
        .lean();

      const neededByMaterial = new Map(); // mat._id -> { requerido, nombre, unidad }
      for (const p of pedidosActivos) {
        const qty = Number(p.cantidad || 0);
        const mats = p.producto?.materiales || [];
        for (const m of mats) {
          const mat = m.material;
          if (!mat || !mat._id) continue;
          const key = String(mat._id);
          const reqQty = qty * Number(m.cantidadPorUnidad || 0);
          if (!neededByMaterial.has(key)) {
            neededByMaterial.set(key, {
              requerido: 0,
              nombre: mat.nombre,
              unidad: mat.unidadDeMedida
            });
          }
          const row = neededByMaterial.get(key);
          row.requerido += reqQty;
        }
      }

      const ids = Array.from(neededByMaterial.keys()).map(id => new mongoose.Types.ObjectId(id));
      const inv = await Inventario.find({ _id: { $in: ids } }, { cantidadDisponible: 1 }).lean();
      const dispMap = new Map(inv.map(i => [String(i._id), Number(i.cantidadDisponible || 0)]));

      const items = [];
      for (const [id, row] of neededByMaterial.entries()) {
        const disponible = dispMap.get(id) ?? 0;
        const requerido = to2(row.requerido);
        if (requerido > disponible) {
          const deficitRatio = (requerido - disponible) / Math.max(1, requerido);
          let prioridad = 'baja';
          if (deficitRatio >= 0.5) prioridad = 'alta';
          else if (deficitRatio >= 0.2) prioridad = 'media';

          items.push({
            id,
            insumo: row.nombre,
            requerido,
            disponible: to2(disponible),
            unidad: row.unidad,
            prioridad
          });
        }
      }

      const order = { alta: 0, media: 1, baja: 2 };
      items.sort((a, b) =>
        (order[a.prioridad] - order[b.prioridad]) ||
        ((b.requerido - b.disponible) - (a.requerido - a.disponible))
      );

      res.json(items);
    } catch (err) {
      console.error('getPurchaseNeeds error', err);
      res.status(500).json({ error: 'Error calculando necesidades de compra' });
    }
  },

  /**
   * Alertas de mantenimiento (placeholder).
   */
  async getMaintAlerts(req, res) {
    try {
      res.json([]); // sin modelo aún
    } catch (err) {
      console.error('getMaintAlerts error', err);
      res.status(500).json({ error: 'Error obteniendo alertas de mantenimiento' });
    }
  },
};

module.exports = DashboardControllerMaquinaria;
