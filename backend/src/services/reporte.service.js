// src/services/reporte.service.js
const Pedido = require('../models/pedido');
const Inventario = require('../models/inventario');
const { parseRange } = require('../utils/date');
const { HttpError } = require('../utils/httpError');

/**
 * Retorna datos normalizados para el reporte de pedidos.
 */
async function datosPedidos({ desde, hasta }) {
  const range = parseRange({ desde, hasta });
  if (!range.ok) throw HttpError.badRequest(range.error);
  const { gte, lte } = range;

  const datos = await Pedido.find({ fechaEntrega: { $gte: gte, $lte: lte } })
    .populate('producto')
    .sort({ fechaEntrega: 1 });

  const mapped = datos.map((d, i) => ({
    n: i + 1,
    producto: d?.producto?.nombre || 'N/D',
    cantidad: d.cantidad,
    fechaEntrega: d.fechaEntrega,
    clienteNombre: d.clienteNombre || '',
  }));

  return { titulo: 'Reporte de Pedidos', datos: mapped };
}

/**
 * Retorna datos normalizados para el reporte de ingresos a inventario.
 */
async function datosIngresos({ desde, hasta }) {
  const range = parseRange({ desde, hasta });
  if (!range.ok) throw HttpError.badRequest(range.error);
  const { gte, lte } = range;

  const datos = await Inventario.find({ fechaIngreso: { $gte: gte, $lte: lte } })
    .sort({ fechaIngreso: 1 });

  const mapped = datos.map((d, i) => ({
    n: i + 1,
    nombre: d.nombre,
    cantidad: d.cantidad,
    fechaIngreso: d.fechaIngreso,
    codigo: d.codigo,
  }));

  return { titulo: 'Reporte de Ingresos a Inventario', datos: mapped };
}

module.exports = { datosPedidos, datosIngresos };
