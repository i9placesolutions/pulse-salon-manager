
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { Client, ClientExportOptions } from '@/types/client';
import { formatDateString, formatCurrency } from './formatters';

// Define a specific type for field definitions
export interface FieldDefinition<T = any> {
  header: string;
  key: string | keyof T;
  format?: (value: any) => string;
}

// Preparar dados para exportação com base nas opções selecionadas
export const prepareExportData = (clients: Client[], options: ClientExportOptions) => {
  // Diferentes níveis de detalhamento baseado no formato escolhido
  const { exportFormat } = options;
  
  // Dados básicos (incluídos em todos os formatos)
  const baseFields: FieldDefinition<Client>[] = [
    { header: 'Nome', key: 'name' },
    { header: 'CPF', key: 'cpf' }
  ];
  
  // Dados de contato
  const contactFields: FieldDefinition<Client>[] = options.includeContact ? [
    { header: 'Email', key: 'email' },
    { header: 'Telefone', key: 'phone' }
  ] : [];
  
  // Data de aniversário
  const birthdayFields: FieldDefinition<Client>[] = options.includeBirthday ? [
    { 
      header: 'Data de Nascimento', 
      key: 'birthDate', 
      format: (value: string) => formatDateString(value) 
    }
  ] : [];
  
  // Tags
  const tagFields: FieldDefinition<Client>[] = options.includeTags ? [
    { 
      header: 'Tags', 
      key: 'tags', 
      format: (value: string[] | undefined) => value?.join(', ') || '' 
    }
  ] : [];
  
  // Dados financeiros
  const financialFields: FieldDefinition<Client>[] = options.includeSpending ? [
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
  const visitFields: FieldDefinition<Client>[] = options.includeVisitHistory ? [
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
  const statusFields: FieldDefinition<Client>[] = [
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
  const preferencesFields: FieldDefinition<Client>[] = options.includePreferences ? [
    { header: 'Observações', key: 'observations' }
  ] : [];
  
  // Montar a lista de campos a incluir
  let fields: FieldDefinition<Client>[] = [];
  
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
      // Obter o nome da chave do campo
      const keyName = field.key;
      
      // Obter valor do cliente para este campo
      let value: any;
      
      if (typeof keyName === 'string') {
        // Acesso seguro à propriedade do cliente usando index signature
        value = client[keyName as keyof Client];
      } else {
        // Se keyName já é keyof Client, use-o diretamente
        value = client[keyName];
      }
      
      // Aplicar formatação se disponível e o valor existir
      if (field.format && value !== undefined) {
        clientData[field.header] = field.format(value);
      } else {
        // Converter valor para string ou usar string vazia
        clientData[field.header] = value?.toString() || '';
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
export const exportToExcel = async (clients: Client[], options: ClientExportOptions) => {
  const { data, reportTitle } = prepareExportData(clients, options);
  
  // Criar workbook e worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Clientes');
  
  if (data.length > 0) {
    // Adiciona cabeçalhos
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);
    
    // Adiciona dados
    data.forEach(row => {
      const rowValues = headers.map(header => row[header]);
      worksheet.addRow(rowValues);
    });
    
    // Estiliza cabeçalhos
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    });
    
    // Ajusta largura das colunas
    worksheet.columns.forEach(column => {
      column.width = 20;
    });
  }
  
  // Gerar arquivo binário
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Criar Blob e salvar arquivo
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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
export const exportClientReport = async (clients: Client[], options: ClientExportOptions) => {
  const { format } = options;
  
  if (format === 'excel') {
    await exportToExcel(clients, options);
  } else if (format === 'pdf') {
    exportToPDF(clients, options);
  }
};
