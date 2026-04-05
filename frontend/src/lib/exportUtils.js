import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportRowsToExcel(filename, rows) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, filename);
}

export function exportRowsToPdf(filename, title, rows) {
  const doc = new jsPDF();
  doc.text(title, 14, 16);

  const keys = rows.length ? Object.keys(rows[0]) : [];
  const body = rows.map((row) => keys.map((key) => String(row[key] ?? '')));

  autoTable(doc, {
    startY: 24,
    head: [keys],
    body
  });

  doc.save(filename);
}
