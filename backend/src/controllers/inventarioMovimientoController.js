// controllers/inventarioMovimientoController.js
const mongoose = require('mongoose');
const Inventario = require('../models/inventario');
const Movimiento = require('../models/movimientoInventario');
const Pedido = require('../models/pedido'); // ✅ IMPORTANTE: agregado

function assertPositive(n, msg = 'Cantidad inválida') {
  if (typeof n !== 'number' || !isFinite(n) || n <= 0) {
    const e = new Error(msg);
    e.status = 400;
    throw e;
  }
}

exports.crearIngreso = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { insumoId, cantidad, unidadDeMedida, costoUnitario, motivo, referencia } = req.body;
    assertPositive(Number(cantidad), 'La cantidad de ingreso debe ser mayor a 0');
    if (!insumoId || !unidadDeMedida) {
      return res.status(400).json({ message: 'insumoId y unidadDeMedida son requeridos' });
    }

    await session.withTransaction(async () => {
      const insumo = await Inventario.findById(insumoId).session(session);
      if (!insumo) {
        const e = new Error('Insumo no encontrado');
        e.status = 404;
        throw e;
      }

      insumo.cantidadDisponible += Number(cantidad);
      await insumo.save({ session });

      await Movimiento.create([{
        insumo: insumo._id,
        tipo: 'INGRESO',
        cantidad: Number(cantidad),
        unidadDeMedida,
        costoUnitario: (costoUnitario ?? null),
        motivo: motivo || '',
        referencia: referencia || '',
        usuario: req.user?.email || req.user?.id || ''
      }], { session });
    });

    res.status(201).json({ message: 'Ingreso registrado correctamente' });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

exports.crearSalida = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { insumoId, cantidad, unidadDeMedida, motivo, referencia } = req.body;
    assertPositive(Number(cantidad), 'La cantidad de salida debe ser mayor a 0');
    if (!insumoId || !unidadDeMedida) {
      return res.status(400).json({ message: 'insumoId y unidadDeMedida son requeridos' });
    }

    await session.withTransaction(async () => {
      const insumo = await Inventario.findById(insumoId).session(session);
      if (!insumo) {
        const e = new Error('Insumo no encontrado');
        e.status = 404;
        throw e;
      }
      if (insumo.cantidadDisponible < Number(cantidad)) {
        const e = new Error('Stock insuficiente');
        e.status = 400;
        throw e;
      }

      insumo.cantidadDisponible -= Number(cantidad);
      await insumo.save({ session });

      await Movimiento.create([{
        insumo: insumo._id,
        tipo: 'SALIDA',
        cantidad: Number(cantidad),
        unidadDeMedida,
        costoUnitario: null,
        motivo: motivo || '',
        referencia: referencia || '',
        usuario: req.user?.email || req.user?.id || ''
      }], { session });
    });

    res.status(201).json({ message: 'Salida registrada correctamente' });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// Sumar stock a un insumo existente sin crear material duplicado
exports.agregarInsumoExistente = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const {
      insumoId, codigo,
      nombre, marca, unidadDeMedida, categoriaId,
      cantidad, costoUnitario, motivo, referencia
    } = req.body;

    if (!cantidad || Number(cantidad) <= 0) {
      return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
    }

    let where = null;
    if (insumoId) where = { _id: insumoId };
    else if (codigo) where = { codigo };
    else if (nombre && unidadDeMedida && categoriaId) {
      where = {
        nombre: String(nombre).trim(),
        unidadDeMedida: String(unidadDeMedida).trim(),
        categoria: categoriaId,
        marca: (marca || '').trim()
      };
    } else {
      return res.status(400).json({
        message: 'Debes enviar insumoId o codigo, o (nombre, unidadDeMedida, categoriaId[, marca])'
      });
    }

    const insumo = await Inventario.findOne(where);
    if (!insumo) {
      return res.status(404).json({ message: 'Insumo no encontrado. Crea el material primero.' });
    }

    await session.withTransaction(async () => {
      insumo.cantidadDisponible += Number(cantidad);
      await insumo.save({ session });

      await Movimiento.create([{
        insumo: insumo._id,
        tipo: 'INGRESO',
        cantidad: Number(cantidad),
        unidadDeMedida: insumo.unidadDeMedida,
        costoUnitario: (costoUnitario ?? null),
        motivo: motivo || 'Ingreso por agregar insumo',
        referencia: referencia || '',
        usuario: req.user?.email || req.user?.id || ''
      }], { session });
    });

    res.status(201).json({ message: 'Stock agregado al insumo existente', insumoId: insumo._id });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

exports.listarMovimientos = async (req, res) => {
  try {
    const { insumoId, tipo, desde, hasta, q, page = 1, limit = 20 } = req.query;
    const where = {};
    if (insumoId) where.insumo = insumoId;
    if (tipo && ['INGRESO', 'SALIDA'].includes(tipo)) where.tipo = tipo;
    if (desde || hasta) {
      where.fecha = {};
      if (desde) where.fecha.$gte = new Date(desde);
      if (hasta) where.fecha.$lte = new Date(hasta);
    }
    if (q) {
      where.$or = [
        { motivo: { $regex: q, $options: 'i' } },
        { referencia: { $regex: q, $options: 'i' } },
        { usuario: { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    let items = await Movimiento.find(where)
      .populate('insumo', 'nombre codigo unidadDeMedida')
      .sort({ fecha: -1, _id: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // 🔑 post-procesar referencia de pedidos
    for (const it of items) {
      if (typeof it.referencia === "string" && it.referencia.startsWith("PEDIDO:")) {
        const pedidoId = it.referencia.replace("PEDIDO:", "").trim();
        if (mongoose.isValidObjectId(pedidoId)) {
          try {
            const pedido = await Pedido.findById(pedidoId)
              .populate("cliente", "nombre apellido")
              .populate("producto", "nombre")
              .lean();
            if (pedido) {
              it.referencia = `Pedido ${pedido._id}`;
              it.motivo = `Consumo para producto "${pedido.producto?.nombre}" - Cliente ${pedido.cliente?.nombre || ""} ${pedido.cliente?.apellido || ""}`;
            }
          } catch (e) {
            console.error("Error populando pedido en listarMovimientos:", e.message);
          }
        }
      }
    }

    const total = await Movimiento.countDocuments(where);
    res.json({ total, page: Number(page), limit: Number(limit), items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.kardexPorInsumo = async (req, res) => {
  try {
    const { insumoId } = req.params;
    if (!insumoId) return res.status(400).json({ message: 'insumoId requerido' });

    const insumo = await Inventario.findById(insumoId).lean();
    if (!insumo) return res.status(404).json({ message: 'Insumo no encontrado' });

    const movimientos = await Movimiento.find({ insumo: insumoId })
      .sort({ fecha: 1, _id: 1 })
      .lean();

    let saldo = 0;
    const kardex = movimientos.map(m => {
      saldo += (m.tipo === 'INGRESO' ? m.cantidad : -m.cantidad);
      return {
        fecha: m.fecha,
        tipo: m.tipo,
        cantidad: m.cantidad,
        unidad: m.unidadDeMedida,
        motivo: m.motivo || '',
        referencia: m.referencia || '',
        saldo
      };
    });

    res.json({
      insumo: {
        id: insumo._id,
        codigo: insumo.codigo,
        nombre: insumo.nombre,
        unidad: insumo.unidadDeMedida
      },
      kardex,
      stockActual: insumo.cantidadDisponible
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
