import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx'; // Para Excel/CSV
import jsPDF from 'jspdf';    // Para PDF (base)
import autoTable from 'jspdf-autotable'; // Para tablas en PDF

// Definimos un tipo genérico para los datos que esperamos recibir
type DataRow = Record<string, any>;

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  /**
   * Exporta un array de datos a un archivo Excel (.xlsx).
   * @param data El array de objetos a exportar.
   * @param filename El nombre deseado para el archivo (sin extensión).
   * @param sheetName El nombre de la hoja dentro del archivo Excel.
   */
  exportToExcel(data: DataRow[], filename: string, sheetName: string = 'Datos'): void {
    if (!data || data.length === 0) {
      console.warn('No hay datos para exportar a Excel.');
      return;
    }

    // 1. Convertir nuestro array de objetos a una 'WorkSheet' de Excel.
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    // 2. Crear un 'WorkBook' (libro de Excel) y añadirle la hoja.
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // 3. Generar el archivo y forzar la descarga.
    XLSX.writeFile(wb, `${filename}.xlsx`);
    console.log(`Exportado a ${filename}.xlsx`);
  }

  /**
   * Exporta un array de datos a un archivo PDF con formato de tabla.
   * @param data El array de objetos a exportar.
   * @param headerTitles Los títulos de las columnas que se mostrarán en el PDF.
   * @param dataKeys Las claves de propiedad correspondientes a cada columna para extraer los datos.
   * @param filename El nombre deseado para el archivo (sin extensión).
   * @param title El título del documento PDF.
   */
  exportToPdf(data: DataRow[], headerTitles: string[], dataKeys: string[], filename: string, title: string): void {
    if (!data || data.length === 0) {
      console.warn('No hay datos para exportar a PDF.');
      return;
    }

    // 1. Crear una instancia de jsPDF.
    const doc = new jsPDF('p', 'pt', 'a4');

    // 2. Preparar los datos para jspdf-autotable usando las `dataKeys` para el mapeo.
    const bodyData = data.map(row => dataKeys.map(key => row[key] ?? ''));

    // 3. Usar autoTable para generar la tabla, usando `headerTitles` para la cabecera.
    autoTable(doc, {
      head: [headerTitles], // Usa los títulos visibles para la cabecera.
      body: bodyData,
      startY: 60,
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
      styles: { cellPadding: 5, fontSize: 8 },
    });

    // 4. Añadir el título al documento.
    doc.setFontSize(18);
    doc.text(title, 40, 40);

    // 5. Guardar el archivo PDF.
    doc.save(`${filename}.pdf`);
    console.log(`Exportado a ${filename}.pdf`);
  }
}
