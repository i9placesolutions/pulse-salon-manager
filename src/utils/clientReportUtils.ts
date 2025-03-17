import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { Client, ClientExportOptions } from '@/types/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para formatar data
const formatDateString = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (e) {
    return 'Data inválida';
  }
};

// Função para formatar valor monetário
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Interface para definir os campos do relatório
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
    { 
      header: 'Data de Nascimento', 
      key: 'birthDate', 
      format: (value: string) => formatDateString(value) 
    }
  ] : [];
  
  // Tags
  const tagFields: FieldDefinition[] = options.includeTags ? [
    { 
      header: 'Tags', 
      key: 'tags', 
      format: (value: string[]) => Array.isArray(value) ? value.join(', ') : ''
    }
  ] : [];
  
  // Dados financeiros
  const financialFields: FieldDefinition[] = options.includeSpending ? [
    { 
      header: 'Total Gasto', 
      key: 'totalSpent', 
      format: (value: number) => formatCurrency(value) 
    },
    { 
      header: 'Cashback', 
      key: 'cashback', 
      format: (value: number) => formatCurrency(value) 
    }
  ] : [];
  
  // Dados de visitas
  const visitFields: FieldDefinition[] = options.includeVisitHistory ? [
    { header: 'Número de Visitas', key: 'visitsCount' },
    { 
      header: 'Primeira Visita', 
      key: 'firstVisit', 
      format: (value: string) => formatDateString(value) 
    },
    { 
      header: 'Última Visita', 
      key: 'lastVisit', 
      format: (value: string) => formatDateString(value) 
    }
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
    const clientData: Record<string, string> = {};
    
    fields.forEach(field => {
      // Obter valor do cliente para este campo
      const value = client[field.key as keyof Client];
      
      // Formatar o valor se houver função de formatação
      if (field.format && value !== undefined) {
        clientData[field.header] = field.format(value);
      } else {
        // Usar valor como string ou string vazia se for undefined
        clientData[field.header] = (value as any)?.toString() || '';
      }
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
export const exportToExcel = (clients: Client[], options: ClientExportOptions): void => {
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
export const exportToPDF = (clients: Client[], options: ClientExportOptions): void => {
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
export const exportClientReport = (clients: Client[], options: ClientExportOptions): void => {
  const { format } = options;
  
  if (format === 'excel') {
    exportToExcel(clients, options);
  } else if (format === 'pdf') {
    exportToPDF(clients, options);
  }
}; 