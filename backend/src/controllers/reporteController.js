// src/controllers/reporteController.js
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv'); // para CSV simple si lo quieres
// Para XLSX puedes usar exceljs si prefieres
const Pedido = require('../models/pedido'); // ajusta ruta
const Producto = require('../models/producto');

const toDateRange = (from, to) => {
  const start = from ? new Date(from) : new Date('2000-01-01');
  const end = to ? new Date(to) : new Date();
  // incluir fin del día
  end.setHours(23,59,59,999);
  return { start, end };
};

exports.ventas = async (req, res, next) => {
  try {
    const { start, end } = toDateRange(req.query.from, req.query.to);
    const groupBy = req.query.groupBy === 'month' ? { y: { $year: '$fecha' }, m: { $month: '$fecha' } }
                                                  : { y: { $year: '$fecha' }, m: { $month: '$fecha' }, d: { $dayOfMonth: '$fecha' } };
    const pipeline = [
      { $match: { fecha: { $gte: start, $lte: end }, estado: { $in: ['pagado','entregado'] } } },
      { $group: {
          _id: groupBy,
          ingresos: { $sum: '$total' },
          pedidos: { $sum: 1 }
      }},
      { $addFields: { ticketPromedio: { $cond: [{ $gt: ['$pedidos', 0] }, { $divide: ['$ingresos', '$pedidos'] }, 0] } } },
      { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } }
    ];
    const data = await Pedido.aggregate(pipeline);
    res.json({ data });
  } catch (e) { next(e); }
};

exports.topProductos = async (req, res, next) => {
  try {
    const { start, end } = toDateRange(req.query.from, req.query.to);
    const limit = parseInt(req.query.limit || '10', 10);
    const pipeline = [
      { $match: { fecha: { $gte: start, $lte: end }, estado: { $in: ['pagado','entregado'] } } },
      { $unwind: '$items' },
      { $group: {
          _id: '$items.productoId',
          unidades: { $sum: '$items.cantidad' },
          ingresos: { $sum: { $multiply: ['$items.cantidad', '$items.precioUnit'] } }
      }},
      { $lookup: { from: 'productos', localField: '_id', foreignField: '_id', as: 'producto' } },
      { $unwind: '$producto' },
      { $project: { _id: 0, productoId: '$producto._id', nombre: '$producto.nombre', unidades: 1, ingresos: 1 } },
      { $sort: { unidades: -1, ingresos: -1 } },
      { $limit: limit }
    ];
    const data = await Pedido.aggregate(pipeline);
    res.json({ data });
  } catch (e) { next(e); }
};

exports.topClientes = async (req, res, next) => {
  try {
    const { start, end } = toDateRange(req.query.from, req.query.to);
    const limit = parseInt(req.query.limit || '10', 10);
    const pipeline = [
      { $match: { fecha: { $gte: start, $lte: end } } },
      { $group: {
          _id: '$clienteId',
          pedidos: { $sum: 1 },
          total: { $sum: '$total' }
      }},
      { $lookup: { from: 'usuarios', localField: '_id', foreignField: '_id', as: 'cliente' } },
      { $unwind: '$cliente' },
      { $project: { _id: 0, clienteId: '$cliente._id', cliente: '$cliente.nombre', pedidos: 1, total: 1 } },
      { $sort: { total: -1 } },
      { $limit: limit }
    ];
    const data = await Pedido.aggregate(pipeline);
    res.json({ data });
  } catch (e) { next(e); }
};

exports.pedidosPorEstado = async (req, res, next) => {
  try {
    const { start, end } = toDateRange(req.query.from, req.query.to);
    const pipeline = [
      { $match: { fecha: { $gte: start, $lte: end } } },
      { $group: { _id: '$estado', cantidad: { $sum: 1 } } },
      { $project: { estado: '$_id', cantidad: 1, _id: 0 } },
      { $sort: { cantidad: -1 } }
    ];
    const data = await Pedido.aggregate(pipeline);
    res.json({ data });
  } catch (e) { next(e); }
};

exports.bajoStock = async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold || '10', 10);
    const data = await Producto.find({ stock: { $lte: threshold } })
      .select('_id nombre stock minimo')
      .sort({ stock: 1 })
      .lean();
    res.json({ data });
  } catch (e) { next(e); }
};

exports.kardex = async (req, res, next) => {
  try {
    const { productoId } = req.query;
    const { start, end } = toDateRange(req.query.from, req.query.to);
    if (!productoId) return res.status(400).json({ error: 'productoId requerido' });

    const pid = new mongoose.Types.ObjectId(productoId);
    const pipeline = [
      { $match: { productoId: pid, fecha: { $gte: start, $lte: end } } },
      { $sort: { fecha: 1, _id: 1 } },
      { $project: { tipo: 1, cantidad: 1, fecha: 1, referencia: 1 } }
    ];
    const movimientos = await InventarioMovimiento.aggregate(pipeline);

    // calcular saldo acumulado en memoria
    let saldo = 0;
    const data = movimientos.map(m => {
      saldo += (m.tipo === 'entrada' ? m.cantidad : -m.cantidad);
      return { ...m, saldo };
    });

    res.json({ data });
  } catch (e) { next(e); }
};

exports.leadTime = async (req, res, next) => {
  try {
    const { start, end } = toDateRange(req.query.from, req.query.to);
    const pipeline = [
      { $match: { fecha: { $gte: start, $lte: end }, fechaEntrega: { $ne: null } } },
      { $project: {
          diffHoras: { $divide: [{ $subtract: ['$fechaEntrega', '$fecha'] }, 1000*60*60] }
      }},
      { $group: { _id: null, avgHoras: { $avg: '$diffHoras' }, maxHoras: { $max: '$diffHoras' }, minHoras: { $min: '$diffHoras' } } }
    ];
    const [r] = await Pedido.aggregate(pipeline);
    res.json({ data: r || { avgHoras: 0, maxHoras: 0, minHoras: 0 } });
  } catch (e) { next(e); }
};

// Descargas (ejemplo PDF con pdfkit para /reporte/ventas)
exports.descargar = async (req, res, next) => {
  try {
    const { tipo, formato } = req.query;
    if (formato !== 'pdf') return res.status(400).json({ error: 'Solo PDF en este ejemplo' });

    if (tipo === 'ventas') {
      // Reutiliza la lógica:
      req.query.groupBy = req.query.groupBy || 'day';
      const { start, end } = toDateRange(req.query.from, req.query.to);
      const fakeReq = { query: { ...req.query } };
      // Vuelve a ejecutar agregación:
      const groupBy = req.query.groupBy === 'month' ? { y: { $year: '$fecha' }, m: { $month: '$fecha' } }
                                                    : { y: { $year: '$fecha' }, m: { $month: '$fecha' }, d: { $dayOfMonth: '$fecha' } };
      const pipeline = [
        { $match: { fecha: { $gte: start, $lte: end }, estado: { $in: ['pagado','entregado'] } } },
        { $group: { _id: groupBy, ingresos: { $sum: '$total' }, pedidos: { $sum: 1 } } },
        { $addFields: { ticketPromedio: { $cond: [{ $gt: ['$pedidos', 0] }, { $divide: ['$ingresos', '$pedidos'] }, 0] } } },
        { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } }
      ];
      const rows = await Pedido.aggregate(pipeline);

      // PDF
      const doc = new PDFDocument({ size: 'A4', margin: 36 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte-ventas.pdf"');
      doc.fontSize(16).text('Reporte de Ventas', { align: 'center' });
      doc.moveDown().fontSize(10);
      rows.forEach(r => {
        const f = `${r._id.y}-${String(r._id.m).padStart(2,'0')}${r._id.d ? '-' + String(r._id.d).padStart(2,'0') : ''}`;
        doc.text(`${f} | Ingresos: ${r.ingresos.toFixed(2)} | Pedidos: ${r.pedidos} | Ticket: ${r.ticketPromedio.toFixed(2)}`);
      });
      doc.end();
      doc.pipe(res);
      return;
    }

    res.status(400).json({ error: 'tipo no soportado en ejemplo' });
  } catch (e) { next(e); }
};
