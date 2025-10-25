// src/controllers/reportesController.js
const mongoose = require('mongoose');
const Pedido = require('../models/pedido');
const Cliente = require('../models/cliente');
const Producto = require('../models/producto');
const Inventario = require('../models/inventario');

function ensureDate(d) {
  const x = new Date(d);
  return isNaN(x.getTime()) ? new Date() : x;
}
function parseRange(query) {
  const now = new Date();
  const to = query.to ? ensureDate(query.to) : now;
  const from = query.from ? ensureDate(query.from) : new Date(to.getTime() - 29 * 24 * 60 * 60 * 1000);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}
function unitFromGran(gran = 'day') {
  const ok = ['day','week','month','quarter','year'];
  return ok.includes(gran) ? gran : 'day';
}
function intParam(v, def) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

// ------------------ VENTAS ------------------

// 1. Ingresos por período
exports.ventasIngresos = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const gran = unitFromGran(req.query.gran);
    const data = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: {
          _id: { $dateTrunc: { date: "$createdAt", unit: gran } },
          ingreso: { $sum: "$total" }
      }},
      { $sort: { "_id": 1 } }
    ]);
    res.json({ range: { from, to }, granularity: gran, data });
  } catch (err) { next(err); }
};

// 2. Volumen de pedidos
exports.ventasVolumen = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const gran = unitFromGran(req.query.gran);
    const data = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: {
          _id: { $dateTrunc: { date: "$createdAt", unit: gran } },
          pedidos: { $sum: 1 }
      }},
      { $sort: { "_id": 1 } }
    ]);
    res.json({ range: { from, to }, granularity: gran, data });
  } catch (err) { next(err); }
};

// 3. Ticket promedio
exports.ventasTicketPromedio = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const data = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: null, total: { $sum: "$total" }, pedidos: { $sum: 1 } } },
      { $project: { _id: 0, ticket: { $cond: [{ $gt: ["$pedidos", 0] }, { $divide: ["$total", "$pedidos"] }, 0] } } }
    ]);
    res.json({ range: { from, to }, ticket: data[0]?.ticket ?? 0 });
  } catch (err) { next(err); }
};

// 4. Top productos por ingreso
exports.productosTopIngreso = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const limit = intParam(req.query.limit, 10);
    const data = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: "$producto", ingreso: { $sum: "$total" }, pedidos: { $sum: 1 }, unidades: { $sum: "$cantidad" } } },
      { $sort: { ingreso: -1 } },
      { $limit: limit },
      { $lookup: { from: "productos", localField: "_id", foreignField: "_id", as: "prod" } },
      { $unwind: "$prod" },
      { $project: { _id: 0, productoId: "$_id", nombre: "$prod.nombre", ingreso: 1, pedidos: 1, unidades: 1 } }
    ]);
    res.json({ range: { from, to }, data });
  } catch (err) { next(err); }
};

// 5. Productos más pedidos (unidades)
exports.productosMasPedidos = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const limit = intParam(req.query.limit, 10);
    const data = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: "$producto", unidades: { $sum: "$cantidad" }, pedidos: { $sum: 1 }, ingreso: { $sum: "$total" } } },
      { $sort: { unidades: -1 } },
      { $limit: limit },
      { $lookup: { from: "productos", localField: "_id", foreignField: "_id", as: "prod" } },
      { $unwind: "$prod" },
      { $project: { _id: 0, productoId: "$_id", nombre: "$prod.nombre", unidades: 1, pedidos: 1, ingreso: 1 } }
    ]);
    res.json({ range: { from, to }, data });
  } catch (err) { next(err); }
};

// 6. Pareto de ingresos por producto (80/20)
exports.productosPareto = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const rows = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: "$producto", ingreso: { $sum: "$total" } } },
      { $sort: { ingreso: -1 } },
      { $lookup: { from: "productos", localField: "_id", foreignField: "_id", as: "prod" } },
      { $unwind: "$prod" },
      { $project: { _id: 0, productoId: "$_id", nombre: "$prod.nombre", ingreso: 1 } }
    ]);
    const total = rows.reduce((a,b)=>a+b.ingreso,0) || 1;
    let acc = 0;
    const data = rows.map(r => {
      acc += r.ingreso;
      return { ...r, acumulado: acc, pct: acc/total };
    });
    res.json({ range: { from, to }, total, data });
  } catch (err) { next(err); }
};

// 7. Distribución estado de pago
exports.ventasEstadoPago = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const data = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: "$estadoPago", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ range: { from, to }, data });
  } catch (err) { next(err); }
};

// ------------------ COBRANZA ------------------

// 8. Aging de saldos (0-30/31-60/61-90/90+)
exports.cobranzaAging = async (req, res, next) => {
  try {
    const buckets = await Pedido.aggregate([
      { $match: { saldo: { $gt: 0 } } },
      { $project: {
          saldo: 1,
          dias: { $dateDiff: { startDate: "$createdAt", endDate: "$$NOW", unit: "day" } }
      }},
      { $bucket: {
          groupBy: "$dias",
          boundaries: [0,31,61,91,100000],
          default: "90+",
          output: { totalSaldo: { $sum: "$saldo" }, count: { $sum: 1 } }
      }}
    ]);
    res.json({ data: buckets });
  } catch (err) { next(err); }
};

// 9. Pagos por método
exports.pagosPorMetodo = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const data = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $unwind: "$pagos" },
      { $group: { _id: "$pagos.metodo", monto: { $sum: "$pagos.monto" }, count: { $sum: 1 } } },
      { $sort: { monto: -1 } }
    ]);
    res.json({ range: { from, to }, data });
  } catch (err) { next(err); }
};

// ------------------ CLIENTES ------------------

// 10. Nuevos clientes por período
exports.clientesNuevos = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const gran = unitFromGran(req.query.gran || 'month');
    const data = await Cliente.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: {
          _id: { $dateTrunc: { date: "$createdAt", unit: gran } },
          nuevos: { $sum: 1 }
      }},
      { $sort: { "_id": 1 } }
    ]);
    res.json({ range: { from, to }, granularity: gran, data });
  } catch (err) { next(err); }
};

// 11. Recurrentes vs únicos
exports.clientesRecurrentesVsUnicos = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const rows = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: "$cliente", pedidos: { $sum: 1 } } },
      { $group: {
          _id: null,
          unicos: { $sum: { $cond: [{ $eq: ["$pedidos",1] }, 1, 0] } },
          recurrentes: { $sum: { $cond: [{ $gt: ["$pedidos",1] }, 1, 0] } }
      }},
      { $project: { _id: 0, unicos: 1, recurrentes: 1 } }
    ]);
    res.json(rows[0] || { unicos:0, recurrentes:0 });
  } catch (err) { next(err); }
};

// 12. Top clientes por ingreso/saldo
exports.clientesTop = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const limit = intParam(req.query.limit, 10);
    const data = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: "$cliente", ingreso: { $sum: "$total" }, saldo: { $sum: "$saldo" }, pedidos: { $sum: 1 } } },
      { $sort: { ingreso: -1 } },
      { $limit: limit },
      { $lookup: { from: "clientes", localField: "_id", foreignField: "_id", as: "cli" } },
      { $unwind: "$cli" },
      { $project: {
          _id: 0,
          clienteId: "$_id",
          nombre: { $concat: ["$cli.nombre", " ", "$cli.apellido"] },
          telefono: "$cli.telefono",
          ingreso: 1, saldo: 1, pedidos: 1
      } }
    ]);
    res.json({ range: { from, to }, data });
  } catch (err) { next(err); }
};

// 13. Cohortes de retención (básico por mes de alta)
exports.clientesCohortesRetencion = async (req, res, next) => {
  try {
    // Cohorte = mes de registro del cliente. Medimos si compra en meses siguientes (presencia binaria).
    const { from, to } = parseRange(req.query);
    const pedidos = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $project: {
          cliente: 1,
          mesPedido: { $dateTrunc: { date: "$createdAt", unit: "month" } }
      }},
      { $group: { _id: { cliente: "$cliente", mesPedido: "$mesPedido" }, pedidos: { $sum: 1 } } }
    ]);

    const clientes = await Cliente.aggregate([
      { $match: { createdAt: { $lte: to } } },
      { $project: { cliente: "$_id", cohorte: { $dateTrunc: { date: "$createdAt", unit: "month" } } } }
    ]);

    // Mapear cliente -> cohorte
    const cohorteByCliente = new Map();
    for (const c of clientes) cohorteByCliente.set(String(c.cliente), c.cohorte.getTime());

    // Construir matriz: fila = cohorte (timestamp), col = offset (0..n), valor = #clientes con compra en ese mes offset
    const byCohorte = {};
    for (const p of pedidos) {
      const cId = String(p._id.cliente);
      const coh = cohorteByCliente.get(cId);
      if (!coh) continue;
      const offset = Math.round( (p._id.mesPedido.getTime() - coh) / (30*24*60*60*1000) );
      if (offset < 0) continue;
      const key = String(coh);
      byCohorte[key] = byCohorte[key] || {};
      byCohorte[key][offset] = (byCohorte[key][offset] || 0) + 1; // presencia (conteo de clientes con compra)
    }
    res.json({ range: { from, to }, data: byCohorte });
  } catch (err) { next(err); }
};

// ------------------ PRODUCTOS ------------------

// 14. Margen por producto (costo estimado por receta)
exports.productosMargen = async (req, res, next) => {
  try {
    const prods = await Producto.aggregate([
      { $unwind: "$materiales" },
      { $lookup: { from: "inventarios", localField: "materiales.material", foreignField: "_id", as: "mat" } },
      { $unwind: "$mat" },
      { $project: {
          _id: 1,
          nombre: 1,
          precioUnitario: 1,
          costoMaterial: { $multiply: ["$materiales.cantidadPorUnidad", "$mat.precioUnitario"] }
      }},
      { $group: {
          _id: "$_id",
          nombre: { $first: "$nombre" },
          precioUnitario: { $first: "$precioUnitario" },
          costoUnitario: { $sum: "$costoMaterial" }
      }},
      { $project: {
          _id: 0,
          productoId: "$_id",
          nombre: 1,
          precioUnitario: 1,
          costoUnitario: 1,
          margen: { $subtract: ["$precioUnitario", "$costoUnitario"] },
          margenPct: {
            $cond: [{ $gt: ["$precioUnitario", 0] },
              { $divide: [{ $subtract: ["$precioUnitario", "$costoUnitario"] }, "$precioUnitario"] },
              0
            ]
          }
      }},
      { $sort: { margenPct: -1 } }
    ]);
    res.json({ data: prods });
  } catch (err) { next(err); }
};

// 15. Consumo de materiales (desde pedidos)
exports.productosConsumoMateriales = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const rows = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $lookup: { from: "productos", localField: "producto", foreignField: "_id", as: "p" } },
      { $unwind: "$p" },
      { $unwind: "$p.materiales" },
      { $project: {
          material: "$p.materiales.material",
          consumo: { $multiply: ["$cantidad", "$p.materiales.cantidadPorUnidad"] }
      }},
      { $group: { _id: "$material", totalConsumo: { $sum: "$consumo" } } },
      { $lookup: { from: "inventarios", localField: "_id", foreignField: "_id", as: "inv" } },
      { $unwind: "$inv" },
      { $project: { _id: 0, materialId: "$_id", nombre: "$inv.nombre", unidad: "$inv.unidadDeMedida", totalConsumo: 1 } },
      { $sort: { totalConsumo: -1 } }
    ]);
    res.json({ range: { from, to }, data: rows });
  } catch (err) { next(err); }
};

// ------------------ INVENTARIO ------------------

// 16. Bajo stock (threshold)
exports.inventarioBajoStock = async (req, res, next) => {
  try {
    const thr = Number(req.query.threshold ?? 5);
    const data = await Inventario.find({ cantidadDisponible: { $lte: thr } })
      .select("nombre categoria cantidadDisponible unidadDeMedida precioUnitario")
      .sort({ cantidadDisponible: 1 })
      .lean();
    res.json({ threshold: thr, data });
  } catch (err) { next(err); }
};

// 17. Valor de inventario por categoría (con nombre)
exports.inventarioValorPorCategoria = async (req, res, next) => {
  try {
    const data = await Inventario.aggregate([
      // Calcula valor por ítem
      { $project: {
          categoria: 1,
          valor: { $multiply: ["$cantidadDisponible", "$precioUnitario"] }
      }},
      // Une con categorías para obtener el nombre
      { $lookup: {
          from: "categorias",              // <-- ajusta si tu colección tiene otro nombre
          localField: "categoria",
          foreignField: "_id",
          as: "cat"
      }},
      { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true }},

      // Agrupa por categoría y suma el valor
      { $group: {
          _id: "$categoria",
          categoriaNombre: { $first: { $ifNull: ["$cat.nombre", "Sin categoría"] } },
          valor: { $sum: "$valor" }
      }},

      // Formato final (compat: incluimos Id y nombre)
      { $project: {
          _id: 0,
          categoriaId: "$_id",
          categoriaNombre: 1,
          valor: { $round: ["$valor", 2] }
      }},
      { $sort: { valor: -1 } }
    ]);

    const totalInventario = data.reduce((acc, r) => acc + (r.valor || 0), 0);
    res.json({ ok: true, totalInventario, data });
  } catch (err) { next(err); }
};


// 18. Rotación de materiales (aprox.)
exports.inventarioRotacion = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const days = Math.max(1, Math.round((to - from) / (24*60*60*1000)));
    // Consumo en el período
    const consumo = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $lookup: { from: "productos", localField: "producto", foreignField: "_id", as: "p" } },
      { $unwind: "$p" },
      { $unwind: "$p.materiales" },
      { $project: {
          material: "$p.materiales.material",
          consumo: { $multiply: ["$cantidad", "$p.materiales.cantidadPorUnidad"] }
      }},
      { $group: { _id: "$material", consumoPeriodo: { $sum: "$consumo" } } }
    ]);
    const consumoMap = new Map(consumo.map(r => [String(r._id), r.consumoPeriodo]));
    const inv = await Inventario.find({}).select("nombre unidadDeMedida cantidadDisponible").lean();
    const data = inv.map(i => {
      const used = consumoMap.get(String(i._id)) || 0;
      const diario = used / days;
      const rotacion = diario > 0 ? (used / Math.max(i.cantidadDisponible, 1)) : 0; // aproximación
      return { materialId: i._id, nombre: i.nombre, unidad: i.unidadDeMedida, consumoPeriodo: used, consumoDiario: diario, rotacion };
    }).sort((a,b)=> b.rotacion - a.rotacion);
    res.json({ range: { from, to }, days, data });
  } catch (err) { next(err); }
};

// 19. Proyección de quiebre (días restantes)
exports.inventarioQuiebreProyeccion = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const days = Math.max(1, Math.round((to - from) / (24*60*60*1000)));
    const consumo = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $lookup: { from: "productos", localField: "producto", foreignField: "_id", as: "p" } },
      { $unwind: "$p" },
      { $unwind: "$p.materiales" },
      { $project: {
          material: "$p.materiales.material",
          consumo: { $multiply: ["$cantidad", "$p.materiales.cantidadPorUnidad"] }
      }},
      { $group: { _id: "$material", consumoPeriodo: { $sum: "$consumo" } } }
    ]);
    const consumoMap = new Map(consumo.map(r => [String(r._id), r.consumoPeriodo]));
    const inv = await Inventario.find({}).select("nombre unidadDeMedida cantidadDisponible").lean();
    const data = inv.map(i => {
      const used = consumoMap.get(String(i._id)) || 0;
      const diario = used / days;
      const diasRestantes = diario > 0 ? (i.cantidadDisponible / diario) : null;
      return { materialId: i._id, nombre: i.nombre, unidad: i.unidadDeMedida, cantidadDisponible: i.cantidadDisponible, consumoDiario: diario, diasRestantes };
    }).sort((a,b)=> (a.diasRestantes ?? Infinity) - (b.diasRestantes ?? Infinity));
    res.json({ range: { from, to }, days, data });
  } catch (err) { next(err); }
};

// ------------------ OPERACIONES ------------------

// 20. OTIF (On Time In Full) básico
exports.operacionesOTIF = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const rows = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to }, entregadoEn: { $ne: null }, fechaEntrega: { $ne: null } } },
      { $project: {
          ok: { $lte: ["$entregadoEn", "$fechaEntrega"] } // a tiempo (no tenemos cantidad entregada, asumimos in full)
      }},
      { $group: { _id: null, total: { $sum: 1 }, otif: { $sum: { $cond: ["$ok", 1, 0] } } } },
      { $project: { _id: 0, total: 1, otif: 1, pct: { $cond: [{ $gt: ["$total",0] }, { $divide: ["$otif", "$total"] }, 0] } } }
    ]);
    res.json({ range: { from, to }, ...(rows[0] || { total:0, otif:0, pct:0 }) });
  } catch (err) { next(err); }
};

// 21. Lead time (días) distribución y promedio
exports.operacionesLeadTime = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const rows = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to }, entregadoEn: { $ne: null } } },
      { $project: {
          dias: { $dateDiff: { startDate: "$createdAt", endDate: "$entregadoEn", unit: "day" } }
      }},
      { $group: { _id: null, avg: { $avg: "$dias" }, min: { $min: "$dias" }, max: { $max: "$dias" }, count: { $sum: 1 } } }
    ]);
    res.json({ range: { from, to }, ...(rows[0] || { avg:null, min:null, max:null, count:0 }) });
  } catch (err) { next(err); }
};

// 22. Funnel de estados
exports.operacionesFunnelEstados = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const data = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: "$estado", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ range: { from, to }, data });
  } catch (err) { next(err); }
};

// ------------------ CALIDAD DE DATOS ------------------

// 23. Duplicados/invalidos en clientes
exports.calidadClientes = async (req, res, next) => {
  try {
    const cli = await Cliente.find({}).select("nombre apellido telefono correo").lean();

    // Teléfonos duplicados
    const mapTel = new Map();
    for (const c of cli) {
      const k = c.telefono || "";
      mapTel.set(k, (mapTel.get(k) || 0) + 1);
    }
    const dupTel = new Set([...mapTel.entries()].filter(([k,v]) => k && v>1).map(([k])=>k));

    // Correos duplicados
    const mapMail = new Map();
    for (const c of cli) {
      const k = (c.correo || "").toLowerCase();
      mapMail.set(k, (mapMail.get(k) || 0) + 1);
    }
    const dupMail = new Set([...mapMail.entries()].filter(([k,v]) => k && v>1).map(([k])=>k));

    // Invalidos (por regex del modelo de cliente — ojo tu regex tenía typos; aquí solo chequeo formato simple)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const telRegex = /^\d{7,12}$/;

    const invalid = cli.filter(c => (c.correo && !emailRegex.test(c.correo)) || (c.telefono && !telRegex.test(c.telefono)));
    const duplicados = cli.filter(c => dupTel.has(c.telefono) || dupMail.has((c.correo||"").toLowerCase()));

    res.json({ invalidos: invalid, duplicados });
  } catch (err) { next(err); }
};

// 24. Discrepancias de saldo (verifica saldo === total - pagado)
exports.calidadSaldo = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req.query);
    const rows = await Pedido.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $project: {
          total: 1, pagado: 1, saldo: 1,
          saldoCalc: { $max: [{ $subtract: ["$total", "$pagado"] }, 0] }
      }},
      { $match: { $expr: { $ne: ["$saldo", "$saldoCalc"] } } }
    ]);
    res.json({ range: { from, to }, discrepancias: rows });
  } catch (err) { next(err); }
};
