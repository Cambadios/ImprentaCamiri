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

  // Paleta de colores profesional
  const COLORS = {
    primary: '#1a56db',
    secondary: '#0e7490',
    accent: '#d97706',
    dark: '#1f2937',
    gray: '#6b7280',
    lightGray: '#f3f4f6',
    border: '#d1d5db',
    white: '#ffffff',
  };

  // Configuración de fuentes
  const FONTS = {
    title: { font: 'Helvetica-Bold', size: 28 },
    subtitle: { font: 'Helvetica-Bold', size: 14 },
    header: { font: 'Helvetica-Bold', size: 11 },
    body: { font: 'Helvetica', size: 10 },
    small: { font: 'Helvetica', size: 8.5 },
  };

  // Configurar respuesta HTTP
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // Crear documento
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 140, bottom: 70, left: 50, right: 50 },
    bufferPages: true,
  });

  doc.pipe(res);

  // Variables de página
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const contentWidth = pageWidth - 100;

  // ============================================================
  // FUNCIONES AUXILIARES
  // ============================================================

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num || 0);
  };

  const formatCurrency = (num) => {
    return `Bs ${formatNumber(num)}`;
  };

  // ============================================================
  // PROCESAR DATOS
  // ============================================================

  const processedRows = rows.map((row) => {
    if (Array.isArray(row)) {
      return row.map((cell, idx) => {
        const col = columns[idx];
        if (!col) return cell || '-';
        if (col.isCurrency) return formatCurrency(cell);
        if (col.isNumeric) return cell != null ? formatNumber(cell) : '-';
        return cell || '-';
      });
    } else {
      return columns.map((col) => {
        const cell = row[col.key];
        if (col.isCurrency) return formatCurrency(cell);
        if (col.isNumeric) return cell != null ? formatNumber(cell) : '-';
        return cell || '-';
      });
    }
  });

  // ============================================================
  // GENERAR CONTENIDO
  // ============================================================

  if (processedRows.length === 0) {
    // Mensaje cuando no hay datos
    doc.moveDown(3);
    doc
      .font(FONTS.subtitle.font)
      .fontSize(FONTS.subtitle.size)
      .fillColor(COLORS.gray)
      .text('No hay datos disponibles', { align: 'center' });
    
    doc.moveDown(0.5);
    
    doc
      .font(FONTS.body.font)
      .fontSize(FONTS.body.size)
      .fillColor(COLORS.gray)
      .text('No se encontraron registros para mostrar en este reporte.', {
        align: 'center',
      });
  } else {
    // Mostrar contador de registros
    doc
      .font(FONTS.body.font)
      .fontSize(FONTS.body.size)
      .fillColor(COLORS.gray)
      .text(`Total de registros: ${processedRows.length}`, { align: 'left' });
    
    doc.moveDown(1);

    // Generar tabla
    doc.table(
      {
        headers: columns.map((col) => col.header || col.key),
        rows: processedRows,
      },
      {
        columnsSize: columns.map((col) => col.width || undefined),
        width: contentWidth,
        padding: 8,
        columnSpacing: 5,
        prepareHeader: () => {
          doc
            .font(FONTS.header.font)
            .fontSize(FONTS.header.size)
            .fillColor(COLORS.white);
        },
        prepareRow: (row, indexColumn, indexRow) => {
          doc
            .font(FONTS.body.font)
            .fontSize(FONTS.body.size)
            .fillColor(COLORS.dark);
        },
        headerRows: 1,
      }
    );
  }

  // ============================================================
  // FUNCIONES PARA HEADER Y FOOTER
  // ============================================================

  const drawHeader = () => {
    // Guardar posición Y actual para no perderla
    const currentY = doc.y;
    
    // Fondo decorativo superior
    doc.save();
    doc.rect(0, 0, pageWidth, 120).fill(COLORS.primary);
    doc.restore();

    // Logo (si existe)
    if (logoPath && fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, 50, 25, { width: 50, height: 50, fit: [50, 50] });
      } catch (error) {
        console.error('Error al cargar logo:', error.message);
      }
    }

    // Título principal
    doc
      .font(FONTS.title.font)
      .fontSize(FONTS.title.size)
      .fillColor(COLORS.white)
      .text(title, 110, 30, { 
        width: contentWidth - 110, 
        align: 'left',
        lineBreak: false 
      });

    // Fecha y hora
    const now = dayjs();
    doc
      .font(FONTS.small.font)
      .fontSize(FONTS.small.size)
      .fillColor(COLORS.lightGray)
      .text(now.format('DD/MM/YYYY'), pageWidth - 100, 35, {
        width: 50,
        align: 'right',
        lineBreak: false
      });
    
    doc
      .fontSize(FONTS.small.size)
      .text(now.format('HH:mm'), pageWidth - 100, 48, {
        width: 50,
        align: 'right',
        lineBreak: false
      });

    // Subtítulo del reporte
    if (listLabel) {
      doc
        .font(FONTS.subtitle.font)
        .fontSize(FONTS.subtitle.size)
        .fillColor(COLORS.white)
        .text(listLabel, 50, 85, { 
          width: contentWidth, 
          align: 'left',
          lineBreak: false 
        });
    }

    // Usuario que genera
    if (createdBy) {
      doc
        .font(FONTS.body.font)
        .fontSize(FONTS.body.size)
        .fillColor(COLORS.lightGray)
        .text(`Generado por: ${createdBy}`, 50, 105, {
          width: contentWidth,
          align: 'left',
          lineBreak: false
        });
    }

    // Línea separadora
    doc
      .save()
      .moveTo(50, 128)
      .lineTo(pageWidth - 50, 128)
      .strokeColor(COLORS.accent)
      .lineWidth(2)
      .stroke()
      .restore();
    
    // Restaurar posición Y
    doc.y = currentY;
  };

  const drawFooter = (currentPage, totalPages) => {
    // Guardar posición Y actual
    const currentY = doc.y;
    
    const footerY = pageHeight - 50;

    // Línea superior del footer
    doc
      .save()
      .moveTo(50, footerY - 10)
      .lineTo(pageWidth - 50, footerY - 10)
      .strokeColor(COLORS.border)
      .lineWidth(1)
      .stroke()
      .restore();

    // Preparar textos
    const empresaText = 'Imprenta Camiri';
    const paginaText = `Página ${currentPage} de ${totalPages}`;
    const fechaText = dayjs().format('DD/MM/YYYY HH:mm');

    // Calcular posiciones X para centrar cada texto en su columna
    const col1X = 50;
    const col1Width = contentWidth / 3;
    
    const col2X = 50 + contentWidth / 3;
    const col2Width = contentWidth / 3;
    
    const col3X = 50 + (contentWidth * 2) / 3;
    const col3Width = contentWidth / 3;

    // IMPORTANTE: Usar lineBreak: false para evitar páginas extras
    
    // Nombre de la empresa (izquierda)
    doc
      .font(FONTS.small.font)
      .fontSize(FONTS.small.size)
      .fillColor(COLORS.gray)
      .text(empresaText, col1X, footerY, {
        width: col1Width,
        align: 'left',
        lineBreak: false,
        continued: false
      });

    // Número de página (centro)
    doc
      .fillColor(COLORS.primary)
      .text(paginaText, col2X, footerY, {
        width: col2Width,
        align: 'center',
        lineBreak: false,
        continued: false
      });

    // Fecha de generación (derecha)
    doc
      .fillColor(COLORS.gray)
      .text(fechaText, col3X, footerY, {
        width: col3Width,
        align: 'right',
        lineBreak: false,
        continued: false
      });
    
    // Restaurar posición Y original
    doc.y = currentY;
  };

  // ============================================================
  // APLICAR HEADER Y FOOTER A TODAS LAS PÁGINAS
  // ============================================================

  const range = doc.bufferedPageRange();
  
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    drawHeader();
    drawFooter(i + 1, range.count);
  }

  // Finalizar documento
  doc.end();
}

module.exports = { exportTablePdf };