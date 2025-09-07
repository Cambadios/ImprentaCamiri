const Counter = require('../models/counter');

async function generarCodigoPorCategoria({ tipo, prefijo }) {
  // tipo: 'insumo' | 'producto', prefijo: 'TIN' | 'PAP' ...
  const name = `${tipo}:${prefijo}`;
  const c = await Counter.findOneAndUpdate(
    { name },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
  ).lean();

  const numero = String(c.count).padStart(4, '0');
  return `${prefijo}-${numero}`;
}

module.exports = { generarCodigoPorCategoria };
