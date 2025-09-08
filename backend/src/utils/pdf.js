// backend/src/utils/pdf.js
const PDFDocument = require('pdfkit-table');
const dayjs = require('dayjs');
const fs = require('fs');

function exportTablePdf(res, options) {
  const {
    title = 'IMPRENTA CAMIRI',
    listLabel = '',
    createdBy = '',
    logoPath = '',
    filename = 'reporte.pdf',
    columns = [],
    rows = [],
  } = options;

  // Paleta/tipografías
  const COLORS = {
    primary: '#2563eb',
    headerBg: '#eef2ff',
    zebraBg: '#f8fafc',
    border:  '#e5e7eb',
    text:    '#111827',
    text2:   '#374151',
    muted:   '#6b7280',
  };
  const FONTS = {
    title:    ['Helvetica-Bold', 20],
    subtitle: ['Helvetica', 11],
    body:     ['Helvetica', 10],
    small:    ['Helvetica', 8.5],
    th:       ['Helvetica-Bold', 10.5],
    td:       ['Helvetica', 10],
  };

  // HTTP headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // Márgenes: reservamos espacio de header/footer para que el contenido no los pise
  const BASE_LEFT = 40, BASE_RIGHT = 40;
  const BASE_TOP = 36, BASE_BOTTOM = 36;
  const HEADER_H = 86, FOOTER_H = 30;

  const doc = new PDFDocument({
    size: 'A4',
    bufferPages: true, // clave para post-procesar header/footer
    margins: {
      top:    BASE_TOP + HEADER_H,
      right:  BASE_RIGHT,
      bottom: BASE_BOTTOM + FOOTER_H,
      left:   BASE_LEFT,
    },
  });

  // stream -> respuesta
  doc.pipe(res);

  // Geometría
  const pageWidth  = doc.page.width;
  const contentWidth = pageWidth - BASE_LEFT - BASE_RIGHT;

  // Helpers de formato
  const nf = (n) =>
    new Intl.NumberFormat('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
  const money = (n) => (n == null ? '-' : `Bs ${nf(Number(n) || 0)}`);

  // Normalizar filas
  const safeRows = rows.map((r) => (Array.isArray(r) ? r : columns.map((c) => r?.[c.key] ?? '')));
  const processedRows = safeRows.map((row) =>
    row.map((cell, idx) => {
      const col = columns[idx] || {};
      if (col.isCurrency) return money(cell);
      if (col.isNumeric)  return (cell === '' || cell == null) ? '-' : nf(cell);
      return cell ?? '-';
    })
  );

  // ======== CONTENIDO (solo contenido; NADA de header/footer aquí) ========
  if (processedRows.length > 0) {
    doc.font(FONTS.body[0]).fontSize(FONTS.body[1]).fillColor(COLORS.muted)
       .text(`Total de registros: ${processedRows.length}`);
    doc.moveDown(0.5);
  } else {
    doc.moveDown(2);
    doc.font(FONTS.subtitle[0]).fontSize(FONTS.subtitle[1]).fillColor(COLORS.muted)
       .text('No hay datos disponibles', { align: 'center' });
    doc.moveDown(0.5);
    doc.font(FONTS.body[0]).fontSize(FONTS.body[1]).fillColor(COLORS.muted)
       .text('Los datos solicitados no están disponibles en este momento.', { align: 'center' });
  }

  if (columns.length > 0 && processedRows.length > 0) {
    const baseRowH = Math.max(20, doc.currentLineHeight() + 10);

    doc.table(
      {
        headers: columns.map((c) => c.header),
        rows: processedRows,
      },
      {
        columnsSize: columns.map((c) => c.width || null),
        width: contentWidth,
        padding: [7, 9],
        columnSpacing: 10,

        prepareHeader: () => {
          const yStart = doc.y - 3;
          doc.save()
             .rect(doc.page.margins.left, yStart, contentWidth, baseRowH)
             .fill(COLORS.headerBg)
             .restore();
          doc.font(FONTS.th[0]).fontSize(FONTS.th[1]).fillColor(COLORS.text);
        },

        prepareRow: (row, iRow) => {
          const yRow = doc.y - 2;
          if (iRow % 2 === 1) {
            doc.save()
               .rect(doc.page.margins.left, yRow, contentWidth, baseRowH)
               .fill(COLORS.zebraBg)
               .restore();
          }
          doc.font(FONTS.td[0]).fontSize(FONTS.td[1]).fillColor(COLORS.text2);
        },

        divider: {
          header:    { disabled: true },
          horizontal:{ disabled: false, width: 0.6, opacity: 0.25, color: COLORS.border },
        },
      }
    );
  }

  // ======== POST-PROCESADO: HEADER y FOOTER por página ========
  const drawHeader = () => {
    const topY = BASE_TOP;
    // barra superior
    doc.save()
       .rect(doc.page.margins.left, topY, contentWidth, 3)
       .fill(COLORS.primary)
       .restore();

    const y0 = topY + 14;

    // fecha (derecha) — lineBreak:false para NO forzar saltos
    const dateText = dayjs().format('DD/MM/YYYY • HH:mm');
    doc.font(FONTS.small[0]).fontSize(FONTS.small[1]).fillColor(COLORS.muted)
       .text(dateText, doc.page.margins.left, y0, {
         width: contentWidth, align: 'right', lineBreak: false
       });

    // logo (izquierda)
    let logoW = 0;
    if (logoPath && fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, doc.page.margins.left, y0 - 4, { width: 38, height: 38, fit: [38, 38] });
        logoW = 46;
      } catch {}
    }

    // título (centrado)
    doc.font(FONTS.title[0]).fontSize(FONTS.title[1]).fillColor(COLORS.text)
       .text(title, doc.page.margins.left + logoW, y0 + 6, {
         width: contentWidth - logoW, align: 'center', lineBreak: false
       });

    // subtítulos
    let y = y0 + 46;
    if (listLabel) {
      doc.font(FONTS.subtitle[0]).fontSize(FONTS.subtitle[1]).fillColor(COLORS.primary)
         .text(listLabel, doc.page.margins.left, y, { lineBreak: false });
      y += 18;
    }
    if (createdBy) {
      doc.font(FONTS.body[0]).fontSize(FONTS.body[1]).fillColor(COLORS.muted)
         .text(`Generado por: ${createdBy}`, doc.page.margins.left, y, { lineBreak: false });
      y += 14;
    }

    // separador
    doc.save()
       .moveTo(doc.page.margins.left, y + 8)
       .lineTo(doc.page.width - doc.page.margins.right, y + 8)
       .strokeColor(COLORS.border).lineWidth(1).stroke()
       .restore();
  };

  const drawFooter = (pageIndex, pageCount) => {
    const footerY = doc.page.height - (BASE_BOTTOM + 12);
    // línea superior
    doc.save()
       .moveTo(doc.page.margins.left, footerY - 10)
       .lineTo(doc.page.width - doc.page.margins.right, footerY - 10)
       .strokeColor(COLORS.border).lineWidth(1).stroke()
       .restore();

    // “Página X de Y”
    const footerText = `Imprenta Camiri • ${dayjs().format('DD/MM/YYYY HH:mm')} • Página ${pageIndex + 1} de ${pageCount}`;
    doc.font(FONTS.small[0]).fontSize(FONTS.small[1]).fillColor(COLORS.muted)
       .text(footerText, doc.page.margins.left, footerY, {
         width: contentWidth, align: 'center', lineBreak: false
       });
  };

  // Recorremos páginas en buffer y dibujamos header/footer UNA sola vez
  const range = doc.bufferedPageRange(); // { start, count }
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    drawHeader();
    drawFooter(i, range.count);
  }

  // Cerrar
  doc.end();
}

module.exports = { exportTablePdf };
