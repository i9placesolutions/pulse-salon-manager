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
  
  // Inicializar posição Y
  let yPosition = 45;
  
  // Verificar se deve incluir gráficos (apenas para relatórios analytics e formato PDF)
  if (options.includeCharts && options.exportFormat === 'analytics') {
    // --- Seção de análise estatística ---
    doc.setFontSize(14);
    doc.text('Análise Estatística', 14, yPosition);
    yPosition += 10;
    
    // --- Status dos clientes ---
    
    // Calcular contagens para cada status
    const statusCounts = {
      active: clients.filter(c => c.status === 'active').length,
      vip: clients.filter(c => c.status === 'vip').length,
      inactive: clients.filter(c => c.status === 'inactive').length
    };
    
    // Título da seção
    doc.setFontSize(12);
    doc.text('Distribuição por Status', 14, yPosition);
    yPosition += 6;
    
    // Desenhar barras simples para representar os dados
    const barStartX = 14;
    const barMaxWidth = 80;
    const barHeight = 8;
    const total = statusCounts.active + statusCounts.vip + statusCounts.inactive;
    
    // Barra Ativos
    if (total > 0) {
      const activePercent = Math.round(statusCounts.active / total * 100);
      const activeWidth = (statusCounts.active / total) * barMaxWidth;
      
      doc.setFillColor(76, 175, 80); // Verde
      doc.rect(barStartX, yPosition, activeWidth, barHeight, 'F');
      doc.setFontSize(9);
      doc.text(`Ativos: ${statusCounts.active} (${activePercent}%)`, barStartX + activeWidth + 2, yPosition + 6);
      yPosition += barHeight + 4;
      
      // Barra VIPs
      const vipPercent = Math.round(statusCounts.vip / total * 100);
      const vipWidth = (statusCounts.vip / total) * barMaxWidth;
      
      doc.setFillColor(255, 193, 7); // Amarelo
      doc.rect(barStartX, yPosition, vipWidth, barHeight, 'F');
      doc.text(`VIPs: ${statusCounts.vip} (${vipPercent}%)`, barStartX + vipWidth + 2, yPosition + 6);
      yPosition += barHeight + 4;
      
      // Barra Inativos
      const inactivePercent = Math.round(statusCounts.inactive / total * 100);
      const inactiveWidth = (statusCounts.inactive / total) * barMaxWidth;
      
      doc.setFillColor(244, 67, 54); // Vermelho
      doc.rect(barStartX, yPosition, inactiveWidth, barHeight, 'F');
      doc.text(`Inativos: ${statusCounts.inactive} (${inactivePercent}%)`, barStartX + inactiveWidth + 2, yPosition + 6);
      yPosition += barHeight + 12;
    }
    
    // --- Frequência de visitas ---
    
    // Categorizar visitas
    const visitBuckets = [
      { label: 'Nenhuma', count: clients.filter(c => !c.visitsCount || c.visitsCount === 0).length },
      { label: '1-5 visitas', count: clients.filter(c => c.visitsCount && c.visitsCount >= 1 && c.visitsCount <= 5).length },
      { label: '6-10 visitas', count: clients.filter(c => c.visitsCount && c.visitsCount >= 6 && c.visitsCount <= 10).length },
      { label: '11-20 visitas', count: clients.filter(c => c.visitsCount && c.visitsCount >= 11 && c.visitsCount <= 20).length },
      { label: '21+ visitas', count: clients.filter(c => c.visitsCount && c.visitsCount > 20).length }
    ];
    
    // Título da seção
    doc.setFontSize(12);
    doc.text('Frequência de Visitas', 14, yPosition);
    yPosition += 6;
    
    // Encontrar o valor máximo para escalar as barras
    const maxVisits = Math.max(...visitBuckets.map(b => b.count));
    
    // Desenhar barras para cada categoria
    if (maxVisits > 0) {
      visitBuckets.forEach(bucket => {
        const barWidth = (bucket.count / maxVisits) * barMaxWidth;
        
        doc.setFillColor(41, 128, 185); // Azul
        doc.rect(barStartX, yPosition, barWidth, barHeight, 'F');
        doc.setFontSize(9);
        doc.text(`${bucket.label}: ${bucket.count}`, barStartX + barWidth + 2, yPosition + 6);
        yPosition += barHeight + 4;
      });
      yPosition += 8;
    }
    
    // --- Faixas de Gastos ---
    
    // Categorizar gastos
    const spendingBuckets = [
      { label: 'R$0', count: clients.filter(c => !c.totalSpent || c.totalSpent === 0).length },
      { label: 'Até R$500', count: clients.filter(c => c.totalSpent && c.totalSpent > 0 && c.totalSpent <= 500).length },
      { label: 'R$501-1000', count: clients.filter(c => c.totalSpent && c.totalSpent > 500 && c.totalSpent <= 1000).length },
      { label: 'R$1001-2000', count: clients.filter(c => c.totalSpent && c.totalSpent > 1000 && c.totalSpent <= 2000).length },
      { label: 'Acima de R$2000', count: clients.filter(c => c.totalSpent && c.totalSpent > 2000).length }
    ];
    
    // Título da seção
    doc.setFontSize(12);
    doc.text('Faixas de Gastos Totais', 14, yPosition);
    yPosition += 6;
    
    // Encontrar o valor máximo para escalar as barras
    const maxSpending = Math.max(...spendingBuckets.map(b => b.count));
    
    // Desenhar barras para cada categoria
    if (maxSpending > 0) {
      spendingBuckets.forEach(bucket => {
        const barWidth = (bucket.count / maxSpending) * barMaxWidth;
        
        doc.setFillColor(76, 175, 80); // Verde
        doc.rect(barStartX, yPosition, barWidth, barHeight, 'F');
        doc.setFontSize(9);
        doc.text(`${bucket.label}: ${bucket.count}`, barStartX + barWidth + 2, yPosition + 6);
        yPosition += barHeight + 4;
      });
      yPosition += 8;
    }
    
    // --- Estatísticas Gerais ---
    
    // Calcular métricas importantes
    const totalSpent = clients.reduce((sum, client) => sum + (client.totalSpent || 0), 0);
    const avgSpent = clients.length > 0 ? totalSpent / clients.length : 0;
    const avgVisits = clients.length > 0 ? 
      clients.reduce((sum, client) => sum + (client.visitsCount || 0), 0) / clients.length : 0;
    
    // Adicionar resumo de métricas
    doc.setFontSize(12);
    doc.text('Resumo', 14, yPosition);
    yPosition += 5;
    
    doc.setFontSize(10);
    doc.text(`• Total Gasto: ${formatCurrency(totalSpent)}`, 20, yPosition);
    yPosition += 5;
    doc.text(`• Gasto Médio por Cliente: ${formatCurrency(avgSpent)}`, 20, yPosition);
    yPosition += 5;
    doc.text(`• Média de Visitas por Cliente: ${avgVisits.toFixed(1)}`, 20, yPosition);
    yPosition += 5;
    doc.text(`• Total de Clientes Ativos: ${statusCounts.active + statusCounts.vip} (${Math.round((statusCounts.active + statusCounts.vip) / total * 100)}%)`, 20, yPosition);
    yPosition += 15;
    
    // Adicionar nota
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('* Os dados detalhados de cada cliente estão disponíveis na tabela abaixo', 14, yPosition);
    yPosition += 10;
    
    // Reiniciar cor do texto para preto
    doc.setTextColor(0);
  }
  
  // Configurar cabeçalhos para a tabela
  const headers = fields.map(field => field.header);
  
  // Extrair valores para a tabela
  const rows = data.map(item => headers.map(header => item[header] || ''));
  
  // Criar tabela
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: yPosition,
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