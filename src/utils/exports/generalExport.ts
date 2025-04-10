
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format as formatDate } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Exporta dados para um arquivo Excel (.xlsx)
 * @param data Array de objetos com os dados a serem exportados
 * @param filename Nome do arquivo sem extensão
 * @param sheetName Nome da planilha
 */
export function exportToExcel(data: Record<string, any>[], filename: string, sheetName: string = 'Dados') {
  try {
    // Cria uma nova planilha
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Cria um novo workbook e adiciona a planilha
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Gera o arquivo Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Converte o buffer para Blob
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Faz o download do arquivo
    saveAs(blob, `${filename}.xlsx`);
  } catch (error) {
    console.error("Erro ao exportar para Excel:", error);
    throw new Error("Falha ao exportar para Excel");
  }
}

/**
 * Exporta dados para um arquivo CSV
 * @param data Array de objetos com os dados a serem exportados
 * @param filename Nome do arquivo sem extensão
 */
export function exportToCSV(data: Record<string, any>[], filename: string) {
  try {
    // Converte para planilha
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Gera o arquivo CSV
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    
    // Converte o CSV para Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Faz o download do arquivo
    saveAs(blob, `${filename}.csv`);
  } catch (error) {
    console.error("Erro ao exportar para CSV:", error);
    throw new Error("Falha ao exportar para CSV");
  }
}

/**
 * Exporta dados para um arquivo PDF com tabela
 * @param data Array de objetos com os dados a serem exportados
 * @param filename Nome do arquivo sem extensão
 * @param title Título para o documento PDF
 */
export function exportToPDF(data: Record<string, any>[], filename: string, title: string = 'Relatório') {
  try {
    const pdf = new jsPDF();
    
    // Adiciona título
    pdf.setFontSize(18);
    pdf.text(title, 14, 22);
    
    // Adiciona data
    pdf.setFontSize(11);
    const dateStr = formatDate(new Date(), 'dd/MM/yyyy HH:mm');
    pdf.text(`Gerado em: ${dateStr}`, 14, 30);
    
    // Prepara cabeçalhos e dados para a tabela
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      const rows = data.map(row => headers.map(key => row[key]));
      
      // Função do tipo autotable disponível através do jspdf-autotable
      (pdf as any).autoTable({
        head: [headers],
        body: rows,
        startY: 40,
        margin: { top: 35 },
        styles: { overflow: 'linebreak' },
        headStyles: { fillColor: [75, 75, 75] },
        didDrawPage: (data: any) => {
          // Adiciona numeração de páginas
          pdf.setFontSize(10);
          pdf.text(
            `Página ${data.pageNumber} de ${pdf.getNumberOfPages()}`,
            pdf.internal.pageSize.getWidth() / 2,
            pdf.internal.pageSize.getHeight() - 10,
            { align: 'center' }
          );
        }
      });
    } else {
      pdf.setFontSize(12);
      pdf.text('Nenhum dado disponível para exportação.', 14, 40);
    }
    
    // Salva o arquivo PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Erro ao exportar para PDF:", error);
    throw new Error("Falha ao exportar para PDF");
  }
}

/**
 * Função genérica para exportar dados
 * @param data Dados a serem exportados
 * @param format Formato de exportação ('excel', 'csv' ou 'pdf')
 * @param filename Nome do arquivo (sem extensão)
 * @param title Título para documentos PDF
 */
export function exportData(
  data: Record<string, any>[], 
  format: 'excel' | 'csv' | 'pdf', 
  filename: string,
  title?: string
) {
  try {
    const dateStr = formatDate(new Date(), 'yyyy-MM-dd');
    const fullFilename = `${filename}_${dateStr}`;
    
    if (format === 'excel') {
      exportToExcel(data, fullFilename);
    } else if (format === 'csv') {
      exportToCSV(data, fullFilename);
    } else if (format === 'pdf') {
      exportToPDF(data, fullFilename, title || filename);
    }
  } catch (error) {
    console.error("Erro na exportação:", error);
    throw error;
  }
}
