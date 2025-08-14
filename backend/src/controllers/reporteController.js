// src/controllers/reporteController.js
const PDFDocument = require('pdfkit');
const { datosPedidos, datosIngresos } = require('../services/reporte.service');

/**
 * GET /api/reporte-pdf?tipo=pedidos|ingresos&desde=YYYY-MM-DD&hasta=YYYY-MM-DD
 * Devuelve un PDF generado al vuelo.
 */
exports.reportePdf = async (req, res, next) => {
  try {
    const { tipo, desde, hasta } = req.query;
    if (!tipo || !desde || !hasta) {
      return res.status(400).json({ error: 'Parámetros requeridos: tipo, desde, hasta' });
    }

    let payload;
    if (tipo === 'pedidos') {
      payload = await datosPedidos({ desde, hasta });
    } else if (tipo === 'ingresos') {
      payload = await datosIngresos({ desde, hasta });
    } else {
      return res.status(400).json({ error: 'Tipo inválido. Use: pedidos | ingresos' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte_${tipo}.pdf"`);

    const doc = new PDFDocument({ margin: 36 });
    doc.pipe(res);

    // Encabezado
    doc.fontSize(18).text(payload.titulo, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Rango: ${desde} a ${hasta}`);
    doc.moveDown();

    // Cuerpo
    doc.fontSize(11);
    payload.datos.forEach((d) => {
      if (tipo === 'pedidos') {
        const linea = `#${d.n} ${d.producto} | Cant: ${d.cantidad} | Entrega: ${new Date(d.fechaEntrega).toLocaleDateString()} | Cliente: ${d.clienteNombre || ''}`;
        doc.text(linea);
      } else {
        const linea = `#${d.n} ${d.nombre} | Cant: ${d.cantidad} | Ingreso: ${new Date(d.fechaIngreso).toLocaleDateString()} | ${d.codigo || ''}`;
        doc.text(linea);
      }
    });

    // Pie
    doc.moveDown();
    doc.fontSize(9).text('Generado por Imprenta Camiri', { align: 'right' });

    doc.end();
  } catch (e) {
    next(e);
  }
};

/**
 * (Opcional) GET /api/reporte-datos?tipo=pedidos|ingresos&desde=YYYY-MM-DD&hasta=YYYY-MM-DD
 * Útil para depurar/ver JSON sin PDF.
 */
exports.reporteDatos = async (req, res, next) => {
  try {
    const { tipo, desde, hasta } = req.query;
    if (!tipo || !desde || !hasta) {
      return res.status(400).json({ error: 'Parámetros requeridos: tipo, desde, hasta' });
    }
    if (tipo === 'pedidos') {
      const payload = await datosPedidos({ desde, hasta });
      return res.json(payload);
    }
    if (tipo === 'ingresos') {
      const payload = await datosIngresos({ desde, hasta });
      return res.json(payload);
    }
    return res.status(400).json({ error: 'Tipo inválido. Use: pedidos | ingresos' });
  } catch (e) {
    next(e);
  }
};
