
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { saveAs } from 'file-saver';

/**
 * Converte dados para o formato CSV
 * @param data Array de objetos para converter em CSV
 * @param columns Configuração das colunas que serão incluídas no CSV
 * @returns String no formato CSV
 */
export function convertToCSV<T>(
  data: T[],
  columns: {
    key: keyof T | ((item: T) => any);
    label: string;
  }[]
): string {
  // Cabeçalho do CSV
  const header = columns.map(col => `"${col.label}"`).join(',');
  
  // Linhas de dados
  const rows = data.map(item => {
    return columns.map(col => {
      // Obtém o valor da coluna, seja diretamente pela chave ou pela função
      const value = typeof col.key === 'function' 
        ? col.key(item) 
        : item[col.key];
      
      // Formata o valor para CSV, escapando aspas e tratando valores especiais
      const formattedValue = formatCSVValue(value);
      return `"${formattedValue}"`;
    }).join(',');
  }).join('\n');
  
  return `${header}\n${rows}`;
}

/**
 * Formata um valor para o formato CSV
 */
function formatCSVValue(value: any): string {
  if (value === null || value === undefined) return '';
  
  // Se for uma data, formata para o padrão brasileiro
  if (value instanceof Date) {
    return value.toLocaleDateString('pt-BR');
  }
  
  // Se for um número, garante o formato correto
  if (typeof value === 'number') {
    return value.toString().replace('.', ',');
  }
  
  // Para strings, escapa aspas duplas
  if (typeof value === 'string') {
    return value.replace(/"/g, '""');
  }
  
  return String(value).replace(/"/g, '""');
}

/**
 * Gera e faz o download de um arquivo CSV
 * @param data Array de dados para exportar
 * @param columns Configuração das colunas
 * @param filename Nome do arquivo a ser baixado
 */
export function downloadCSV<T>(
  data: T[],
  columns: {
    key: keyof T | ((item: T) => any);
    label: string;
  }[],
  filename: string
): void {
  const csv = convertToCSV(data, columns);
  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
