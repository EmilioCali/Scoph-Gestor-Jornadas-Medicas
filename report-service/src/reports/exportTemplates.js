import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';

export const BRAND_HEX = '#F27405';
export const EMPTY_LABEL = 'Sin registros';

export function formatDateGT(value = new Date()) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('es-GT', { timeZone: 'America/Guatemala' });
}

function sheetName(name) {
    return String(name || 'Reporte').slice(0, 31);
}

export function buildExcelBuffer({ title, sheet, columns, rows }) {
    const headers = columns.map((column) => column.header);
    const dataRows = rows.length
        ? rows.map((row) => columns.map((column) => row[column.key] ?? ''))
        : [columns.map((_, index) => (index === 0 ? EMPTY_LABEL : ''))];

    const aoa = [
        [`${title} - SCOPH URL`],
        [`Generado: ${formatDateGT()}`],
        [],
        headers,
        ...dataRows,
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    const lastCol = Math.max(columns.length - 1, 0);
    worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } },
    ];
    worksheet['!cols'] = columns.map((column) => ({ wch: column.width || 16 }));

    const headerRow = 3;
    columns.forEach((_, index) => {
        const cell = worksheet[XLSX.utils.encode_cell({ r: headerRow, c: index })];
        if (cell) {
            cell.s = {
                fill: { patternType: 'solid', fgColor: { rgb: 'F27405' } },
                font: { bold: true, color: { rgb: 'FFFFFF' } },
            };
        }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName(sheet));
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', cellStyles: true });
}

function columnWidths(doc, columns, margin) {
    const usable = doc.page.width - margin * 2;
    const weight = columns.reduce((sum, column) => sum + (column.weight || 1), 0);
    return columns.map((column) => ((column.weight || 1) / weight) * usable);
}

function measureRowHeight(doc, values, widths) {
    return Math.max(
        16,
        ...values.map((value, index) =>
            doc.heightOfString(String(value), { width: Math.max(widths[index] - 6, 8) }) + 8
        ),
    );
}

function paintBrandBar(doc) {
    doc.rect(0, 0, doc.page.width, 46).fill(BRAND_HEX);
}

export function buildPdfBuffer({ title, columns, rows }) {
    const landscape = columns.length > 7;

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            margin: 36,
            size: 'A4',
            layout: landscape ? 'landscape' : 'portrait',
            bufferPages: true,
        });
        const buffers = [];
        const margin = 36;

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        paintBrandBar(doc);
        doc.fillColor('#FFFFFF')
            .font('Helvetica-Bold')
            .fontSize(15)
            .text(`${title} - SCOPH URL`, margin, 14, { width: doc.page.width - margin * 2 });
        doc.fillColor('#444444')
            .font('Helvetica')
            .fontSize(9)
            .text(`Generado: ${formatDateGT()}`, margin, 56);

        const widths = columnWidths(doc, columns, margin);
        const pageBottom = () => doc.page.height - 40;

        const drawHeader = (y) => {
            const height = 18;
            let x = margin;
            columns.forEach((column, index) => {
                doc.rect(x, y, widths[index], height).fill(BRAND_HEX);
                doc.fillColor('#FFFFFF')
                    .font('Helvetica-Bold')
                    .fontSize(7)
                    .text(column.header, x + 3, y + 5, {
                        width: widths[index] - 6,
                        ellipsis: true,
                    });
                x += widths[index];
            });
            return y + height;
        };

        let y = drawHeader(72);
        const tableRows = rows.length
            ? rows
            : [Object.fromEntries(columns.map((column, index) => [column.key, index === 0 ? EMPTY_LABEL : '']))];

        tableRows.forEach((row) => {
            const values = columns.map((column) => String(row[column.key] ?? ''));
            doc.font('Helvetica').fontSize(7);
            const rowHeight = measureRowHeight(doc, values, widths);

            if (y + rowHeight > pageBottom()) {
                doc.addPage({
                    size: 'A4',
                    layout: landscape ? 'landscape' : 'portrait',
                    margin: 36,
                });
                paintBrandBar(doc);
                doc.fillColor('#FFFFFF')
                    .font('Helvetica-Bold')
                    .fontSize(12)
                    .text(`${title} - SCOPH URL`, margin, 16, { width: doc.page.width - margin * 2 });
                y = drawHeader(56);
            }

            let x = margin;
            columns.forEach((_, index) => {
                doc.strokeColor('#E5E5E5').lineWidth(0.5).rect(x, y, widths[index], rowHeight).stroke();
                doc.fillColor('#222222')
                    .font('Helvetica')
                    .fontSize(7)
                    .text(values[index], x + 3, y + 3, { width: widths[index] - 6 });
                x += widths[index];
            });
            y += rowHeight;
        });

        const range = doc.bufferedPageRange();
        for (let i = 0; i < range.count; i += 1) {
            doc.switchToPage(i);
            doc.fillColor('#888888')
                .fontSize(8)
                .text(`Página ${i + 1} de ${range.count}`, margin, doc.page.height - 28, {
                    width: doc.page.width - margin * 2,
                    align: 'right',
                });
        }

        doc.end();
    });
}
