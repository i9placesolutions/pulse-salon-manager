
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CashFlowEntry } from '@/types/dashboard';

// Adicionar funções de conversão de tipos financeiros
const convertCashFlowType = (type: string): 'income' | 'expense' => {
  if (type === 'entrada') return 'income';
  return 'expense';
};

export type ReportType = 'financial' | 'inventory' | 'appointments' | 'clients' | 'professionals';

interface ReportData {
  income: number;
  expense: number;
  balance: number;
}

const generateHeader = (doc: jsPDF, title: string) => {
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text(title, 14, 22);
};

const generateTable = (doc: jsPDF, columnTitles: string[], data: any[], startY: number) => {
  (doc as any).autoTable({
    head: [columnTitles],
    body: data,
    startY: startY,
    margin: { horizontal: 14 },
    styles: { overflow: 'linebreak' },
    columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 40 }, 2: { cellWidth: 40 } },
  });
};

const generateSummary = (doc: jsPDF, data: ReportData, startY: number) => {
  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.text(`Total Income: $${data.income.toFixed(2)}`, 14, startY);
  doc.text(`Total Expense: $${data.expense.toFixed(2)}`, 14, startY + 10);
  doc.text(`Balance: $${data.balance.toFixed(2)}`, 14, startY + 20);
};

export const generateFlowReport = async (entries: CashFlowEntry[], period: string): Promise<string> => {
  const doc = new jsPDF();
  const title = `Cash Flow Report - ${period}`;

  generateHeader(doc, title);

  const columnTitles = ['Date', 'Category', 'Amount'];
  const data = entries.map(entry => [entry.date, entry.category, `$${entry.amount.toFixed(2)}`]);

  // Agrupar entradas e saídas
  const incomeEntries = entries.filter(entry => {
    // Converter o tipo se necessário
    const type = typeof entry.type === 'string' ? 
      (entry.type === 'entrada' || entry.type === 'income') ? 'income' : 'expense' : entry.type;
    return type === 'income';
  });
  
  const expenseEntries = entries.filter(entry => {
    // Converter o tipo se necessário
    const type = typeof entry.type === 'string' ? 
      (entry.type === 'entrada' || entry.type === 'income') ? 'income' : 'expense' : entry.type;
    return type === 'expense';
  });

  // Calcular o balanço
  const summaryData = generateSummaryData(entries);

  // Gerar tabelas e sumário
  generateTable(doc, columnTitles, data, 30);
  generateSummary(doc, summaryData, (doc as any).autoTable.previous.finalY + 10);

  // Salvar o PDF
  const pdfBlob = doc.output('blob');
  return URL.createObjectURL(pdfBlob);
};

export const saveFinancialReport = async (data: any, type: string) => {
  const doc = new jsPDF();
  // Implementação básica
  doc.text(`Financial Report - ${type}`, 20, 20);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `financial-report-${type}.pdf`;
  link.click();
  return url;
};

export const generateSummaryData = (entries: CashFlowEntry[]): { income: number; expense: number; balance: number } => {
  let income = 0;
  let expense = 0;
  
  entries.forEach(entry => {
    // Converter o tipo se necessário
    const type = typeof entry.type === 'string' ? 
      (entry.type === 'entrada' || entry.type === 'income') ? 'income' : 'expense' : entry.type;
      
    if (type === 'income') {
      income += entry.amount;
    } else {
      expense += entry.amount;
    }
  });
  
  return {
    income,
    expense,
    balance: income - expense
  };
};
