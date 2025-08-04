const express = require('express');
const PDFDocument = require('pdfkit');
const moment = require('moment');
const Pedido = require('../models/pedido');
const Inventario = require('../models/inventario');

const router = express.Router();

router.get('/reporte-pdf', async (req, res) => {
  try {
    const { tipo, desde, hasta } = req.query;

    if (!desde || !hasta || !tipo) {
      return res.status(400).json({ error: 'Faltan parámetros: tipo, desde o hasta' });
    }

    const desdeFecha = new Date(desde);
    const hastaFecha = new Date(hasta);
    let datos = [];
    let titulo = '';

    if (tipo === 'pedidos') {
      datos = await Pedido.find({
        fechaEntrega: { $gte: desdeFecha, $lte: hastaFecha }
      }).populate('producto');
      titulo = 'Reporte de Pedidos';
    } else if (tipo === 'ingresos') {
      datos = await Inventario.find({
        fechaIngreso: { $gte: desdeFecha, $lte: hastaFecha }
      });
      titulo = 'Reporte de Ingresos al Inventario';
    } else {
      return res.status(400).json({ error: 'Tipo de reporte no válido' });
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${tipo}-${Date.now()}.pdf`);
    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).text(titulo, { align: 'center' });
    doc.fontSize(10).text(`Desde: ${moment(desdeFecha).format('DD/MM/YYYY')}  Hasta: ${moment(hastaFecha).format('DD/MM/YYYY')}`, { align: 'center' });
    doc.moveDown();

    // Contenido
    datos.forEach((item, index) => {
      doc.fontSize(12).text(`${index + 1}.`, { continued: true });

      if (tipo === 'pedidos') {
        doc.text(` Cliente: ${item.cliente} | Producto: ${item.producto?.nombre || 'N/A'}`);
        doc.text(`    Cantidad: ${item.cantidad}, Estado: ${item.estado}`);
        doc.text(`    Precio Total: Bs ${item.precioTotal}, Pago del Cliente: Bs ${item.pagoCliente}`);
        doc.text(`    Fecha Entrega: ${moment(item.fechaEntrega).format('DD/MM/YYYY')}`);
      } else if (tipo === 'ingresos') {
        doc.text(` Código: ${item.codigo} | Nombre: ${item.nombre}`);
        doc.text(`    Descripción: ${item.descripcion}`);
        doc.text(`    Cantidad: ${item.cantidad}, Por docena: ${item.esPorDocena ? 'Sí' : 'No'}, Docenas: ${item.numDocenas}`);
        doc.text(`    Fecha de Ingreso: ${moment(item.fechaIngreso).format('DD/MM/YYYY')}`);
      }

      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
