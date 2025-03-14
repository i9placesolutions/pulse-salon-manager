// Utilitário para exportação de dados em formato CSV e PDF
import { formatDate, formatCampaignType, formatCampaignStatus } from './formatters';
import { exportCampaignToPDF } from './pdfExport';

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

/**
 * Exporta dados no formato adequado para o relatório de campanhas de marketing
 * @param campaignData Dados da campanha
 * @param usageData Dados de uso da campanha
 * @param filename Nome do arquivo
 */
export function exportCampaignReport(
  campaignData: {
    id: string;
    name: string;
    type: string;
    startDate: string;
    endDate?: string;
    status: string;
    metrics: {
      totalUses: number;
      totalCustomers: number;
      conversionRate: number;
      averageSpend: number;
      totalRevenue: number;
      redemptionRate: number;
    };
  },
  usageData: {
    id: string;
    customer: {
      id: string;
      name: string;
    };
    date: string;
    amount: number;
    serviceOrProduct: string;
  }[],
  filename: string = 'relatorio-campanha'
): void {
  // Informações da campanha
  const campaignInfo = [
    { label: 'Nome da Campanha', value: campaignData.name },
    { label: 'Tipo', value: formatCampaignType(campaignData.type) },
    { label: 'Data de Início', value: new Date(campaignData.startDate).toLocaleDateString('pt-BR') },
    ...(campaignData.endDate 
      ? [{ label: 'Data de Término', value: new Date(campaignData.endDate).toLocaleDateString('pt-BR') }] 
      : []),
    { label: 'Status', value: formatCampaignStatus(campaignData.status) },
    { label: 'Total de Usos', value: campaignData.metrics.totalUses },
    { label: 'Clientes Únicos', value: campaignData.metrics.totalCustomers },
    { label: 'Taxa de Conversão', value: `${campaignData.metrics.conversionRate}%` },
    { label: 'Gasto Médio', value: `R$ ${campaignData.metrics.averageSpend.toFixed(2)}` },
    { label: 'Receita Total', value: `R$ ${campaignData.metrics.totalRevenue.toFixed(2)}` },
    { label: 'Taxa de Resgate', value: `${campaignData.metrics.redemptionRate}%` },
  ];

  // Cabeçalho
  let csvContent = "Relatório de Campanha\n\n";
  
  // Informações da campanha
  campaignInfo.forEach(info => {
    csvContent += `${info.label},${info.value}\n`;
  });
  
  // Espaço em branco
  csvContent += "\n\nHistórico de Uso\n\n";
  
  // Detalhes de uso
  const usageColumns = [
    { key: (item: any) => item.customer.name, label: 'Cliente' },
    { key: 'date', label: 'Data', format: (value: string) => new Date(value).toLocaleDateString('pt-BR') },
    { key: 'serviceOrProduct', label: 'Serviço/Produto' },
    { key: 'amount', label: 'Valor (R$)', format: (value: number) => value.toFixed(2) }
  ];
  
  // Cabeçalho do histórico
  csvContent += usageColumns.map(col => col.label).join(',') + '\n';
  
  // Linhas de dados
  usageData.forEach(usage => {
    const row = usageColumns.map(col => {
      // Especifica o tipo correto para a função de chave
      let key: any;
      if (typeof col.key === 'function') {
        // Aplicando tipagem segura para evitar erro de 'any' para 'never'
        const typedFunction = col.key as (item: any) => string | number;
        key = typedFunction(usage);
      } else {
        key = usage[col.key as keyof typeof usage];
      }
      
      const value = col.format ? col.format(key) : key;
      return `"${value}"`;
    }).join(',');
    csvContent += row + '\n';
  });
  
  // Cria o arquivo e faz o download
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${formatDate(new Date())}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Exporta também relatórios em PDF
export { exportCampaignToPDF };
