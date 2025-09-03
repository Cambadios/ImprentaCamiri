// backend/src/utils/pdf.js
const PDFDocument = require('pdfkit-table');
const dayjs = require('dayjs');
const fs = require('fs');

/**
 * exportTablePdf - Generador de PDF limpio y profesional
 * @param {import('express').Response} res
 * @param {{
 *   title?: string,
 *   listLabel?: string,
 *   createdBy?: string,
 *   logoPath?: string,
 *   filename?: string,
 *   columns: Array<{ header: string, key?: string, width?: number, isNumeric?: boolean }>,
 *   rows: Array<object|Array>,
 *   brand?: object
 * }} options
 */
function exportTablePdf(res, options) {
  const {
    title = 'IMPRENTA CAMIRI',
    listLabel = '',
    createdBy = '',
    logoPath = '',
    filename = 'reporte.pdf',
    columns = [],
    rows = [],
    brand = {},
  } = options;

  // Paleta minimalista y profesional
  const COLORS = {
    primary: '#3b82f6',
    primaryLight: '#dbeafe',
    text: '#1f2937',
    textLight: '#6b7280',
    textMuted: '#9ca3af',
    border: '#e5e7eb',
    headerBg: '#f8fafc',
    zebraBg: '#f9fafb',
    success: '#10b981',
    warning: '#f59e0b',
    white: '#ffffff',
  };

  // Sistema de tipografía consistente
  const TYPOGRAPHY = {
    title: { size: 24, font: 'Helvetica-Bold' },
    subtitle: { size: 12, font: 'Helvetica' },
    sectionTitle: { size: 16, font: 'Helvetica-Bold' },
    body: { size: 10, font: 'Helvetica' },
    tableHeader: { size: 10, font: 'Helvetica-Bold' },
    tableBody: { size: 9, font: 'Helvetica' },
    small: { size: 8, font: 'Helvetica' },
  };

  // Configuración HTTP
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // Documento con márgenes cómodos - QUITAMOS bufferPages
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40
  });
  doc.pipe(res);

  // Helpers
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const leftMargin = doc.page.margins.left;
  const rightMargin = doc.page.width - doc.page.margins.right;

  // Variable para controlar el número de páginas
  let pageCount = 0;

  // Header limpio y profesional
  const drawHeader = () => {
    let currentY = 40;

    // Header principal con línea de acento
    doc.save()
      .rect(leftMargin, currentY, pageWidth, 3)
      .fill(COLORS.primary)
      .restore();

    currentY += 20;

    // Logo (si existe)
    let logoWidth = 0;
    if (logoPath && fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, leftMargin, currentY, { 
          width: 40, 
          height: 40,
          fit: [40, 40]
        });
        logoWidth = 50; // Espacio para el logo
      } catch (error) {
        console.warn('Error cargando logo:', error.message);
      }
    }

    // Título principal CENTRADO - CORREGIDO
    doc.font(TYPOGRAPHY.title.font)
      .fontSize(TYPOGRAPHY.title.size)
      .fillColor(COLORS.text)
      .text(title, leftMargin + logoWidth, currentY + 8, {
        width: pageWidth - logoWidth,
        align: 'center' // Cambiado de 'left' a 'center'
      });

    // Fecha y hora en la esquina superior derecha
    const dateText = dayjs().format('DD/MM/YYYY • HH:mm');
    doc.font(TYPOGRAPHY.small.font)
      .fontSize(TYPOGRAPHY.small.size)
      .fillColor(COLORS.textMuted)
      .text(dateText, leftMargin, currentY, {
        width: pageWidth - 10,
        align: 'right'
      });

    currentY += 60;

    // Información del reporte
    if (listLabel) {
      doc.font(TYPOGRAPHY.sectionTitle.font)
        .fontSize(TYPOGRAPHY.sectionTitle.size)
        .fillColor(COLORS.primary)
        .text(listLabel, leftMargin, currentY);
      currentY += 25;
    }

    if (createdBy) {
      doc.font(TYPOGRAPHY.body.font)
        .fontSize(TYPOGRAPHY.body.size)
        .fillColor(COLORS.textLight)
        .text(`Generado por: ${createdBy}`, leftMargin, currentY);
      currentY += 20;
    }

    // Línea separadora sutil
    doc.save()
      .moveTo(leftMargin, currentY)
      .lineTo(rightMargin, currentY)
      .strokeColor(COLORS.border)
      .lineWidth(1)
      .stroke()
      .restore();

    doc.y = currentY + 20;
  };

  // Footer minimalista - MODIFICADO para evitar páginas extra
  const drawFooter = () => {
    const footerY = doc.page.height - 35;
    
    // Solo dibujar footer si hay espacio suficiente
    if (doc.y < footerY - 50) {
      // Línea superior del footer
      doc.save()
        .moveTo(leftMargin, footerY - 10)
        .lineTo(rightMargin, footerY - 10)
        .strokeColor(COLORS.border)
        .lineWidth(1)
        .stroke()
        .restore();

      // Información del footer
      const footerText = `Imprenta Camiri • ${dayjs().format('DD/MM/YYYY HH:mm')} • Página ${pageCount}`;
      
      doc.font(TYPOGRAPHY.small.font)
        .fontSize(TYPOGRAPHY.small.size)
        .fillColor(COLORS.textMuted)
        .text(footerText, leftMargin, footerY, {
          width: pageWidth,
          align: 'center'
        });
    }
  };

  // Dibujar header inicial
  drawHeader();
  pageCount = 1;

  // Evento para nuevas páginas - MODIFICADO
  doc.on('pageAdded', () => {
    pageCount++;
    drawHeader();
  });

  // Procesar datos
  const safeRows = rows.map(r => 
    Array.isArray(r) ? r : columns.map(c => r?.[c.key] ?? '')
  );

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(num)) return String(value);
    return new Intl.NumberFormat('es-BO', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    }).format(num);
  };

  const processedRows = safeRows.map(row =>
    row.map((cell, idx) => {
      if (columns[idx]?.isNumeric) {
        return formatNumber(cell);
      }
      return cell || '-';
    })
  );

  // Información estadística
  if (processedRows.length > 0) {
    doc.font(TYPOGRAPHY.body.font)
      .fontSize(TYPOGRAPHY.body.size)
      .fillColor(COLORS.textLight)
      .text(`Total de registros: ${processedRows.length}`, leftMargin, doc.y);
    doc.moveDown(1);
  }

  // Tabla limpia y profesional
  if (columns.length > 0 && processedRows.length > 0) {
    doc.table(
      {
        headers: columns.map(c => c.header),
        rows: processedRows,
      },
      {
        columnsSize: columns.map(c => c.width || null),
        width: pageWidth,
        padding: [10, 8],
        columnSpacing: 12,
        
        prepareHeader: () => {
          doc.save()
            .rect(leftMargin, doc.y - 5, pageWidth, 30)
            .fill(COLORS.headerBg)
            .restore();
          
          doc.font(TYPOGRAPHY.tableHeader.font)
            .fontSize(TYPOGRAPHY.tableHeader.size)
            .fillColor(COLORS.text);
        },

        prepareRow: (row, rowIndex) => {
          if (rowIndex % 2 === 1) {
            doc.save()
              .rect(leftMargin, doc.y - 3, pageWidth, 25)
              .fill(COLORS.zebraBg)
              .restore();
          }

          doc.font(TYPOGRAPHY.tableBody.font)
            .fontSize(TYPOGRAPHY.tableBody.size)
            .fillColor(COLORS.text);
        },

        divider: {
          header: { disabled: true },
          horizontal: { 
            disabled: false, 
            width: 0.5, 
            opacity: 0.2,
            color: COLORS.border
          },
        },
      }
    );
  } else {
    // Estado vacío elegante
    doc.moveDown(3);
    
    doc.font(TYPOGRAPHY.sectionTitle.font)
      .fontSize(TYPOGRAPHY.sectionTitle.size)
      .fillColor(COLORS.textMuted)
      .text('No hay datos disponibles', leftMargin, doc.y, {
        width: pageWidth,
        align: 'center'
      });
      
    doc.moveDown(1);
    
    doc.font(TYPOGRAPHY.body.font)
      .fontSize(TYPOGRAPHY.body.size)
      .fillColor(COLORS.textLight)
      .text('Los datos solicitados no están disponibles en este momento.', leftMargin, doc.y, {
        width: pageWidth,
        align: 'center'
      });
  }

  // Resumen final discreto
  const numericColumns = columns.filter(c => c.isNumeric);
  if (numericColumns.length > 0 && processedRows.length > 0) {
    doc.moveDown(2);
    
    const summaryY = doc.y;
    const summaryHeight = 40;
    
    // Verificar que haya espacio para el resumen
    if (summaryY + summaryHeight < doc.page.height - 50) {
      doc.save()
        .rect(leftMargin, summaryY, pageWidth, summaryHeight)
        .fill(COLORS.zebraBg)
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .fillAndStroke()
        .restore();
      
      doc.font(TYPOGRAPHY.body.font)
        .fontSize(TYPOGRAPHY.body.size)
        .fillColor(COLORS.textLight)
        .text('Resumen:', leftMargin + 15, summaryY + 12);
      
      doc.text(`${processedRows.length} registros procesados • ${numericColumns.length} columnas numéricas`, 
        leftMargin + 15, summaryY + 25);
    }
  }

  // Dibujar footer al final - SOLO UNA VEZ
  drawFooter();
  doc.end();
}

module.exports = { exportTablePdf };