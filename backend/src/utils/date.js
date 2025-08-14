function normalizeDate(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

function parseRange({ desde, hasta }) {
  const start = normalizeDate(desde);
  const end = normalizeDate(hasta);
  if (!start || !end) {
    return { ok: false, error: 'Fechas inválidas. Usa formato YYYY-MM-DD.' };
  }
  if (start > end) {
    return { ok: false, error: 'El rango de fechas es inconsistente (desde > hasta).' };
  }
  // normaliza a límites de día
  const gte = new Date(start); gte.setHours(0,0,0,0);
  const lte = new Date(end);   lte.setHours(23,59,59,999);
  return { ok: true, gte, lte };
}

module.exports = { parseRange };
