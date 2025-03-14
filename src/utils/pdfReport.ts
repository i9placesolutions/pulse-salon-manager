import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './currency';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  CashFlow, 
  Expense, 
  Payment, 
  AccountReceivable 
} from '@/types/financial';

// Interface para definir os tipos de relatórios disponíveis
export type ReportType = 
  | 'cashflow' 
  | 'expenses' 
  | 'revenue' 
  | 'accounts-receivable' 
  | 'summary'
  | 'complete';

// Opções para personalização do relatório
export interface ReportOptions {
  title?: string;
  subtitle?: string;
  showDate?: boolean;
  showLogo?: boolean;
  startDate?: Date;
  endDate?: Date;
  filters?: Record<string, any>;
}

// Cores para o relatório
const COLORS = {
  primary: '#0f172a',
  secondary: '#64748b',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
};

// Interface para customizar tipos que estão faltando
interface ExtendedPayment extends Payment {
  clientName: string;
  serviceName: string;
  professionalName: string;
}

interface ExtendedAccountReceivable extends AccountReceivable {
  clientName: string;
  description: string;
  status: 'Em Aberto' | 'Atrasado' | 'Pago';
}

/**
 * Gera um relatório financeiro em PDF
 */
export function generateFinancialReport(
  reportType: ReportType,
  data: any[],
  options: ReportOptions = {}
): jsPDF {
  // Criar nova instância do PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Adicionar data ao relatório
  const currentDate = format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
  
  // Definir título padrão baseado no tipo de relatório
  const defaultTitles: Record<ReportType, string> = {
    'cashflow': 'Relatório de Fluxo de Caixa',
    'expenses': 'Relatório de Despesas',
    'revenue': 'Relatório de Receitas',
    'accounts-receivable': 'Relatório de Contas a Receber',
    'summary': 'Resumo Financeiro',
    'complete': 'Relatório Financeiro Completo',
  };

  // Usar título personalizado ou o padrão
  const title = options.title || defaultTitles[reportType];
  
  // Adicionar cabeçalho
  pdf.setFontSize(18);
  pdf.setTextColor(COLORS.primary);
  pdf.text(title, 14, 20);
  
  // Adicionar subtítulo se fornecido
  if (options.subtitle) {
    pdf.setFontSize(12);
    pdf.setTextColor(COLORS.secondary);
    pdf.text(options.subtitle, 14, 28);
  }
  
  // Adicionar data se solicitado
  if (options.showDate !== false) {
    pdf.setFontSize(10);
    pdf.setTextColor(COLORS.secondary);
    pdf.text(`Gerado em: ${currentDate}`, 14, options.subtitle ? 36 : 28);
  }

  // Adicionar informações sobre o período se fornecido
  if (options.startDate && options.endDate) {
    const startDateStr = format(options.startDate, "dd/MM/yyyy");
    const endDateStr = format(options.endDate, "dd/MM/yyyy");
    
    pdf.setFontSize(10);
    pdf.setTextColor(COLORS.secondary);
    pdf.text(`Período: ${startDateStr} a ${endDateStr}`, 14, options.subtitle ? 42 : (options.showDate !== false ? 36 : 28));
  }

  // Adicionar conteúdo de acordo com o tipo de relatório
  switch (reportType) {
    case 'cashflow':
      addCashFlowTable(pdf, data as CashFlow[], options);
      break;
    case 'expenses':
      addExpensesTable(pdf, data as Expense[], options);
      break;
    case 'revenue':
      addRevenueTable(pdf, data as Payment[], options);
      break;
    case 'accounts-receivable':
      addAccountsReceivableTable(pdf, data as AccountReceivable[], options);
      break;
    case 'summary':
      addSummaryReport(pdf, data, options);
      break;
    default:
      pdf.setFontSize(12);
      pdf.setTextColor(COLORS.danger);
      pdf.text('Tipo de relatório não suportado', 14, 50);
  }

  // Adicionar rodapé
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(COLORS.secondary);
    pdf.text(
      'Pulse Salon Manager - Sistema de Gestão para Salões de Beleza',
      14,
      pdf.internal.pageSize.height - 10
    );
    pdf.text(
      `Página ${i} de ${pageCount}`,
      pdf.internal.pageSize.width - 30,
      pdf.internal.pageSize.height - 10
    );
  }

  return pdf;
}

/**
 * Adiciona tabela de fluxo de caixa ao relatório
 */
function addCashFlowTable(pdf: jsPDF, data: CashFlow[], options: ReportOptions) {
  // Calcular totais
  const totalEntries = data
    .filter(item => item.type === 'entrada')
    .reduce((sum, item) => sum + item.value, 0);
    
  const totalExits = data
    .filter(item => item.type === 'saida')
    .reduce((sum, item) => sum + item.value, 0);
    
  const balance = totalEntries - totalExits;

  // Adicionar resumo antes da tabela
  pdf.setFontSize(12);
  pdf.setTextColor(COLORS.primary);
  pdf.text('Resumo do Fluxo de Caixa', 14, options.startDate ? 50 : 40);

  pdf.setFontSize(10);
  pdf.text(`Total de Entradas: ${formatCurrency(totalEntries)}`, 14, options.startDate ? 58 : 48);
  pdf.text(`Total de Saídas: ${formatCurrency(totalExits)}`, 14, options.startDate ? 64 : 54);
  
  pdf.setFontSize(12);
  pdf.setTextColor(balance >= 0 ? COLORS.success : COLORS.danger);
  pdf.text(`Saldo: ${formatCurrency(balance)}`, 14, options.startDate ? 72 : 62);

  // Adicionar tabela de movimentações
  const tableColumn = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'];
  const tableRows = data.map(item => [
    item.date,
    item.description,
    item.category,
    item.type === 'entrada' ? 'Entrada' : 'Saída',
    formatCurrency(item.value)
  ]);

  autoTable(pdf, {
    head: [tableColumn],
    body: tableRows,
    startY: options.startDate ? 80 : 70,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [15, 23, 42] },
    columnStyles: {
      3: { 
        textColor: function(cellData, rowIndex) {
          const type = cellData.raw[rowIndex][3];
          return type === 'Entrada' ? [16, 185, 129] : [239, 68, 68];
        } 
      } as any,
      4: { halign: 'right' }
    },
  });
}

/**
 * Adiciona tabela de despesas ao relatório
 */
function addExpensesTable(pdf: jsPDF, data: Expense[], options: ReportOptions) {
  // Calcular totais por categoria
  const fixedExpenses = data
    .filter(expense => expense.category === 'Fixo')
    .reduce((sum, expense) => sum + expense.value, 0);
    
  const variableExpenses = data
    .filter(expense => expense.category === 'Variável')
    .reduce((sum, expense) => sum + expense.value, 0);
    
  const totalExpenses = fixedExpenses + variableExpenses;
  
  // Calcular totais por status
  const paidExpenses = data
    .filter(expense => expense.status === 'Pago')
    .reduce((sum, expense) => sum + expense.value, 0);
    
  const pendingExpenses = data
    .filter(expense => expense.status === 'Pendente')
    .reduce((sum, expense) => sum + expense.value, 0);
    
  const overdueExpenses = data
    .filter(expense => expense.status === 'Vencido')
    .reduce((sum, expense) => sum + expense.value, 0);

  // Adicionar resumo antes da tabela
  pdf.setFontSize(12);
  pdf.setTextColor(COLORS.primary);
  pdf.text('Resumo de Despesas', 14, options.startDate ? 50 : 40);

  pdf.setFontSize(10);
  pdf.text(`Despesas Fixas: ${formatCurrency(fixedExpenses)}`, 14, options.startDate ? 58 : 48);
  pdf.text(`Despesas Variáveis: ${formatCurrency(variableExpenses)}`, 14, options.startDate ? 64 : 54);
  pdf.text(`Total de Despesas: ${formatCurrency(totalExpenses)}`, 14, options.startDate ? 70 : 60);
  
  pdf.setFontSize(10);
  pdf.text(`Despesas Pagas: ${formatCurrency(paidExpenses)}`, 120, options.startDate ? 58 : 48);
  pdf.text(`Despesas Pendentes: ${formatCurrency(pendingExpenses)}`, 120, options.startDate ? 64 : 54);
  pdf.text(`Despesas Vencidas: ${formatCurrency(overdueExpenses)}`, 120, options.startDate ? 70 : 60);

  // Adicionar tabela de despesas
  const tableColumn = ['Data', 'Nome', 'Categoria', 'Valor', 'Status', 'Recorrente'];
  const tableRows = data.map(expense => [
    expense.date,
    expense.name,
    expense.category,
    formatCurrency(expense.value),
    expense.status,
    expense.isRecurring ? 'Sim' : 'Não'
  ]);

  autoTable(pdf, {
    head: [tableColumn],
    body: tableRows,
    startY: options.startDate ? 80 : 70,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [15, 23, 42] },
    columnStyles: {
      3: { halign: 'right' },
      4: { 
        textColor: function(cellData, rowIndex) {
          const status = cellData.raw[rowIndex][4] as string;
          if (status === 'Pago') return [16, 185, 129];
          if (status === 'Vencido') return [239, 68, 68];
          return [245, 158, 11];
        } 
      } as any
    },
  });
}

/**
 * Adiciona tabela de receitas ao relatório
 */
function addRevenueTable(pdf: jsPDF, data: Payment[], options: ReportOptions) {
  // Calcular total de receitas
  const totalRevenue = data.reduce((sum, payment) => sum + payment.value, 0);
  
  // Agrupar por método de pagamento
  const paymentMethods: Record<string, number> = {};
  data.forEach(payment => {
    const method = payment.method;
    paymentMethods[method] = (paymentMethods[method] || 0) + payment.value;
  });

  // Adicionar resumo antes da tabela
  pdf.setFontSize(12);
  pdf.setTextColor(COLORS.primary);
  pdf.text('Resumo de Receitas', 14, options.startDate ? 50 : 40);

  pdf.setFontSize(10);
  pdf.text(`Total de Receitas: ${formatCurrency(totalRevenue)}`, 14, options.startDate ? 58 : 48);
  
  // Adicionar detalhes por método de pagamento
  let yPos = options.startDate ? 66 : 56;
  pdf.text('Receitas por Método de Pagamento:', 14, yPos);
  yPos += 6;
  
  Object.entries(paymentMethods).forEach(([method, value]) => {
    pdf.text(`${method}: ${formatCurrency(value)}`, 14, yPos);
    yPos += 6;
  });

  // Adicionar tabela de receitas
  const tableColumn = ['Data', 'Cliente', 'Serviço', 'Profissional', 'Método', 'Valor'];
  const tableRows = data.map(payment => {
    // Tratar payment como ExtendedPayment ou fornecer valores padrão
    const extendedPayment = payment as unknown as ExtendedPayment;
    return [
      payment.date,
      extendedPayment.clientName || 'Cliente',
      extendedPayment.serviceName || 'Serviço',
      extendedPayment.professionalName || 'Profissional',
      payment.method,
      formatCurrency(payment.value)
    ];
  });

  autoTable(pdf, {
    head: [tableColumn],
    body: tableRows,
    startY: yPos + 4,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [15, 23, 42] },
    columnStyles: {
      5: { halign: 'right' }
    },
  });
}

/**
 * Adiciona tabela de contas a receber ao relatório
 */
function addAccountsReceivableTable(pdf: jsPDF, data: AccountReceivable[], options: ReportOptions) {
  // Calcular totais
  const totalValue = data.reduce((sum, account) => sum + account.value, 0);
  
  const pendingValue = data
    .filter(account => (account as unknown as ExtendedAccountReceivable).status === 'Em Aberto')
    .reduce((sum, account) => sum + account.value, 0);
    
  const overdueValue = data
    .filter(account => (account as unknown as ExtendedAccountReceivable).status === 'Atrasado')
    .reduce((sum, account) => sum + account.value, 0);

  // Adicionar resumo antes da tabela
  pdf.setFontSize(12);
  pdf.setTextColor(COLORS.primary);
  pdf.text('Resumo de Contas a Receber', 14, options.startDate ? 50 : 40);

  pdf.setFontSize(10);
  pdf.text(`Total a Receber: ${formatCurrency(totalValue)}`, 14, options.startDate ? 58 : 48);
  pdf.text(`Pendente: ${formatCurrency(pendingValue)}`, 14, options.startDate ? 64 : 54);
  pdf.text(`Atrasado: ${formatCurrency(overdueValue)}`, 14, options.startDate ? 70 : 60);

  // Adicionar tabela de contas a receber
  const tableColumn = ['Cliente', 'Descrição', 'Data Vencimento', 'Valor', 'Status'];
  const tableRows = data.map(account => {
    const extendedAccount = account as unknown as ExtendedAccountReceivable;
    return [
      extendedAccount.clientName || 'Cliente',
      extendedAccount.description || 'Descrição',
      account.dueDate,
      formatCurrency(account.value),
      extendedAccount.status || 'Em Aberto'
    ];
  });

  autoTable(pdf, {
    head: [tableColumn],
    body: tableRows,
    startY: options.startDate ? 80 : 70,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [15, 23, 42] },
    columnStyles: {
      3: { halign: 'right' },
      4: { 
        textColor: function(cellData, rowIndex) {
          const status = cellData.raw[rowIndex][4] as string;
          if (status === 'Atrasado') return [239, 68, 68];
          return [245, 158, 11];
        } 
      } as any
    },
  });
}

/**
 * Adiciona resumo financeiro ao relatório
 */
function addSummaryReport(pdf: jsPDF, data: any, options: ReportOptions) {
  const {
    revenue = 0,
    expenses = 0,
    accountsReceivable = 0,
    accountsPayable = 0,
    cashFlowBalance = 0,
    paymentMethods = {},
    expenseCategories = {},
  } = data;

  // Adicionar resumo principal
  pdf.setFontSize(14);
  pdf.setTextColor(COLORS.primary);
  pdf.text('Resumo Financeiro Geral', 14, options.startDate ? 50 : 40);

  // Adicionar balanço principal
  pdf.setFontSize(11);
  pdf.text('Balanço Atual', 14, options.startDate ? 60 : 50);
  
  pdf.setFontSize(10);
  pdf.text(`Receitas: ${formatCurrency(revenue)}`, 14, options.startDate ? 68 : 58);
  pdf.text(`Despesas: ${formatCurrency(expenses)}`, 14, options.startDate ? 74 : 64);
  
  pdf.setFontSize(11);
  pdf.setTextColor(cashFlowBalance >= 0 ? COLORS.success : COLORS.danger);
  pdf.text(`Saldo: ${formatCurrency(cashFlowBalance)}`, 14, options.startDate ? 82 : 72);

  // Adicionar informações sobre contas
  pdf.setFontSize(11);
  pdf.setTextColor(COLORS.primary);
  pdf.text('Contas Futuras', 100, options.startDate ? 60 : 50);
  
  pdf.setFontSize(10);
  pdf.text(`A Receber: ${formatCurrency(accountsReceivable)}`, 100, options.startDate ? 68 : 58);
  pdf.text(`A Pagar: ${formatCurrency(accountsPayable)}`, 100, options.startDate ? 74 : 64);
  
  pdf.setFontSize(11);
  pdf.setTextColor((accountsReceivable - accountsPayable) >= 0 ? COLORS.success : COLORS.danger);
  pdf.text(`Saldo Futuro: ${formatCurrency(accountsReceivable - accountsPayable)}`, 100, options.startDate ? 82 : 72);

  // Adicionar detalhes por método de pagamento
  pdf.setFontSize(11);
  pdf.setTextColor(COLORS.primary);
  pdf.text('Receitas por Método de Pagamento', 14, options.startDate ? 95 : 85);
  
  let yPos = options.startDate ? 103 : 93;
  pdf.setFontSize(9);
  
  Object.entries(paymentMethods).forEach(([method, value]) => {
    pdf.text(`${method}: ${formatCurrency(value as number)}`, 14, yPos);
    yPos += 6;
  });

  // Adicionar detalhes por categoria de despesa
  pdf.setFontSize(11);
  pdf.setTextColor(COLORS.primary);
  pdf.text('Despesas por Categoria', 100, options.startDate ? 95 : 85);
  
  yPos = options.startDate ? 103 : 93;
  pdf.setFontSize(9);
  
  Object.entries(expenseCategories).forEach(([category, value]) => {
    pdf.text(`${category}: ${formatCurrency(value as number)}`, 100, yPos);
    yPos += 6;
  });

  // Adicionar observações ou recomendações
  const maxY = Math.max(yPos, options.startDate ? 130 : 120);
  
  pdf.setFontSize(11);
  pdf.setTextColor(COLORS.primary);
  pdf.text('Observações e Recomendações', 14, maxY);
  
  pdf.setFontSize(9);
  pdf.setTextColor(COLORS.secondary);
  
  // Adicionar recomendações baseadas nos dados
  const recommendations = [];
  
  if (cashFlowBalance < 0) {
    recommendations.push('Atenção: O saldo do fluxo de caixa está negativo. Considere estratégias para aumentar as receitas ou reduzir despesas.');
  }
  
  if (accountsPayable > accountsReceivable) {
    recommendations.push('Alerta: As contas a pagar superam as contas a receber. Planeje com antecedência para evitar problemas de fluxo de caixa.');
  }
  
  if (overdueAccountsReceivable(data)) {
    recommendations.push('Existem contas a receber atrasadas. Considere implementar estratégias de cobrança mais eficientes.');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Situação financeira estável. Continue monitorando o fluxo de caixa regularmente.');
  }
  
  // Adicionar as recomendações ao PDF com quebras de linha
  let recYPos = maxY + 8;
  recommendations.forEach(rec => {
    const lines = pdf.splitTextToSize(rec, 180);
    lines.forEach(line => {
      pdf.text(line as string, 14, recYPos);
      recYPos += 6;
    });
    recYPos += 2;
  });
}

// Função auxiliar para verificar se há contas a receber atrasadas
function overdueAccountsReceivable(data: any): boolean {
  return data.overdueAccounts > 0;
}

/**
 * Salva o relatório PDF com um nome de arquivo baseado no tipo e data
 */
export function saveFinancialReport(
  reportType: ReportType,
  data: any[],
  options: ReportOptions = {}
): void {
  const pdf = generateFinancialReport(reportType, data, options);
  
  // Criar nome do arquivo com data
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const titleMap: Record<ReportType, string> = {
    'cashflow': 'fluxo-de-caixa',
    'expenses': 'despesas',
    'revenue': 'receitas',
    'accounts-receivable': 'contas-a-receber',
    'summary': 'resumo-financeiro',
    'complete': 'relatorio-completo',
  };
  
  const fileName = `${titleMap[reportType]}-${dateStr}.pdf`;
  
  // Salvar arquivo
  pdf.save(fileName);
} 