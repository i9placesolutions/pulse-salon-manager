// Utilitário para exportação de dados em formato CSV e PDF
import { formatDate, formatCampaignType, formatCampaignStatus } from './formatters';
import { exportCampaignToPDF } from './pdfExport';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { Client, ClientExportOptions } from '@/types/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

// Função para formatar data
const formatDateString = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (e) {
    return 'Data inválida';
  }
};

// Função para formatar valor monetário
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

interface FieldDefinition {
  header: string;
  key: string;
  format?: (value: any) => string;
}

// Preparar dados para exportação com base nas opções selecionadas
export const prepareExportData = (clients: Client[], options: ClientExportOptions) => {
  // Diferentes níveis de detalhamento baseado no formato escolhido
  const { exportFormat } = options;
  
  // Dados básicos (incluídos em todos os formatos)
  const baseFields: FieldDefinition[] = [
    { header: 'Nome', key: 'name' },
    { header: 'CPF', key: 'cpf' }
  ];
  
  // Dados de contato
  const contactFields: FieldDefinition[] = options.includeContact ? [
    { header: 'Email', key: 'email' },
    { header: 'Telefone', key: 'phone' }
  ] : [];
  
  // Data de aniversário
  const birthdayFields: FieldDefinition[] = options.includeBirthday ? [
    { header: 'Data de Nascimento', key: 'birthDate', format: (value: string) => formatDateString(value) }
  ] : [];
  
  // Tags
  const tagFields: FieldDefinition[] = options.includeTags ? [
    { header: 'Tags', key: 'tags', format: (value: string[]) => value?.join(', ') || '' }
  ] : [];
  
  // Dados financeiros
  const financialFields: FieldDefinition[] = options.includeSpending ? [
    { header: 'Total Gasto', key: 'totalSpent', format: (value: number) => formatCurrency(value) },
    { header: 'Cashback', key: 'cashback', format: (value: number) => formatCurrency(value) }
  ] : [];
  
  // Dados de visitas
  const visitFields: FieldDefinition[] = options.includeVisitHistory ? [
    { header: 'Número de Visitas', key: 'visitsCount' },
    { header: 'Primeira Visita', key: 'firstVisit', format: (value: string) => formatDateString(value) },
    { header: 'Última Visita', key: 'lastVisit', format: (value: string) => formatDateString(value) }
  ] : [];
  
  // Status do cliente
  const statusFields: FieldDefinition[] = [
    { 
      header: 'Status', 
      key: 'status', 
      format: (value: string) => {
        const statusMap: Record<string, string> = {
          active: 'Ativo',
          vip: 'VIP',
          inactive: 'Inativo'
        };
        return statusMap[value] || value;
      } 
    }
  ];

  // Observações/preferências
  const preferencesFields: FieldDefinition[] = options.includePreferences ? [
    { header: 'Observações', key: 'observations' }
  ] : [];
  
  // Montar a lista de campos a incluir
  let fields: FieldDefinition[] = [];
  
  if (exportFormat === 'summary') {
    // Formato resumido: incluir apenas informações básicas
    fields = [
      ...baseFields,
      ...statusFields,
      ...contactFields,
      ...financialFields
    ];
  } else if (exportFormat === 'analytics') {
    // Formato analítico: foco em métricas
    fields = [
      ...baseFields,
      ...statusFields,
      ...visitFields,
      ...financialFields,
      ...tagFields
    ];
  } else {
    // Formato detalhado: incluir tudo que foi selecionado
    fields = [
      ...baseFields,
      ...statusFields,
      ...contactFields,
      ...birthdayFields,
      ...tagFields,
      ...visitFields,
      ...financialFields,
      ...preferencesFields
    ];
  }
  
  // Formatar os dados dos clientes conforme os campos selecionados
  const formattedData = clients.map(client => {
    const clientData: Record<string, any> = {};
    
    fields.forEach(field => {
      const value = client[field.key as keyof Client];
      clientData[field.header] = field.format ? field.format(value as any) : value || '';
    });
    
    return clientData;
  });
  
  return {
    fields,
    data: formattedData,
    reportTitle: `Relatório de Clientes - ${new Date().toLocaleDateString('pt-BR')}`
  };
};

// Exportar para Excel
export const exportToExcel = (clients: Client[], options: ClientExportOptions) => {
  const { data, reportTitle } = prepareExportData(clients, options);
  
  // Criar workbook e worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
  
  // Gerar arquivo binário
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
  // Criar Blob e salvar arquivo
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${reportTitle}.xlsx`);
};

// Exportar para PDF
export const exportToPDF = (clients: Client[], options: ClientExportOptions) => {
  const { data, fields, reportTitle } = prepareExportData(clients, options);
  
  // Criar documento PDF
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  // Adicionar título e data
  const currentDate = new Date().toLocaleDateString('pt-BR');
  doc.setFontSize(18);
  doc.text(reportTitle, 14, 22);
  doc.setFontSize(11);
  doc.text(`Gerado em: ${currentDate}`, 14, 30);
  doc.text(`Total de clientes: ${clients.length}`, 14, 36);
  
  // Configurar cabeçalhos para a tabela
  const headers = fields.map(field => field.header);
  
  // Extrair valores para a tabela
  const rows = data.map(item => headers.map(header => item[header] || ''));
  
  // Criar tabela
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 45,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });
  
  // Salvar o arquivo PDF
  doc.save(`${reportTitle}.pdf`);
};

// Função principal para exportar relatório
export const exportClientReport = (clients: Client[], options: ClientExportOptions) => {
  const { format } = options;
  
  if (format === 'excel') {
    exportToExcel(clients, options);
  } else if (format === 'pdf') {
    exportToPDF(clients, options);
  }
};
