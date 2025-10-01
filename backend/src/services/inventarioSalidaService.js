// services/inventarioSalidaService.js
const Pedido = require('../models/pedido');
const Producto = require('../models/producto');
const Movimiento = require('../models/movimientoInventario');

const toNum = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

/**
 * REGISTRO de SALIDA al pasar a "Hecho".
 * - No modifica stock (solo registra auditoría).
 * - Idempotente: si pedido.procesadoSalida === true, no hace nada.
 * - Calcula requerimientos = sum(material.cantidadPorUnidad * pedido.cantidad)
 * - Crea movimientos SALIDA (referencia PEDIDO:<id>)
 * - Guarda snapshot en pedido.materialesConsumidos
 */
exports.registrarSalidaLogPorPedidoHecho = async (pedidoId, userId = null) => {
  try {
    const pedido = await Pedido.findById(pedidoId);
    if (!pedido) throw new Error('Pedido no encontrado');
    if (pedido.procesadoSalida) {
      console.log(`ℹ️ Pedido ${pedidoId} ya tiene procesadoSalida=true, no se vuelve a registrar.`);
      return;
    }

    const prod = await Producto.findById(pedido.producto).populate('materiales.material');
    if (!prod) throw new Error('Producto no encontrado');

    const snapshot = [];

    for (const it of (prod.materiales || [])) {
      const insumoDoc = it.material;
      if (!insumoDoc) continue;
      const porUnidad = toNum(it.cantidadPorUnidad, 0);
      const reqTotal = porUnidad * toNum(pedido.cantidad, 0);
      if (reqTotal <= 0) continue;

      // Crear movimiento
      await Movimiento.create({
        insumo: insumoDoc._id,
        tipo: 'SALIDA',
        cantidad: reqTotal,
        unidadDeMedida: insumoDoc.unidadDeMedida || it.unidad || '',
        costoUnitario: null,
        motivo: 'Salida automática por pedido Hecho (Maquinaria)',
        referencia: `PEDIDO:${pedido._id}`,
        usuario: userId || '',
        fecha: new Date()
      });

      snapshot.push({
        insumo: insumoDoc._id,
        cantidad: reqTotal,
        unidad: insumoDoc.unidadDeMedida || it.unidad || ''
      });
    }

    pedido.procesadoSalida = true;
    pedido.materialesConsumidos = snapshot;
    await pedido.save();

    console.log("✅ Salida registrada para pedido:", pedidoId, snapshot);
  } catch (err) {
    console.error("❌ Error registrando salida:", err.message);
  }
};
