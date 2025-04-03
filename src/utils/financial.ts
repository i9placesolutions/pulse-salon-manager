import { Expense, AccountReceivable, CashFlow } from "@/types/financial";
import { Payment } from "@/types/financial";
import { CashFlowEntry, FinancialSummary } from "@/types/dashboard";
import { RevenueData } from "@/types/financial";
import { formatCurrency } from "@/utils/currency";
import { Professional } from "@/types/financial";
import { sub, parse, format, isAfter, isBefore, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

// Implementações adicionadas para funções ausentes
export const calculateAverageTicket = (payments = [], period?: string) => {
  if (!payments || payments.length === 0) return 0;
  const total = payments.reduce((sum, payment) => sum + payment.value, 0);
  return total / payments.length;
};

export const calculateTotalCommissions = (professionals = [], period?: string) => {
  if (!professionals || professionals.length === 0) return 0;
  return professionals.reduce((sum, professional) => sum + professional.commission, 0);
};

export const filterCashFlowData = (data = [], filter = {}) => {
  if (!data || data.length === 0) return [];
  
  // Implementação básica de filtro por período
  if (filter.period) {
    const today = new Date();
    let startDate;
    
    switch (filter.period) {
      case 'day':
        startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(today.setDate(today.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(today.setDate(1));
        break;
      case 'year':
        startDate = new Date(today.setMonth(0, 1));
        break;
      default:
        startDate = new Date(0); // início do tempo Unix
    }
    
    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate;
    });
  }
  
  return data;
};

// Função para formatar a data
export const formatDate = (date: Date | string): string => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
};

// Função para formatar a data para o formato YYYY-MM
export const formatDateToYYYYMM = (date: Date): string => {
  return format(date, 'yyyy-MM');
};

// Função para obter o primeiro dia do mês
export const getFirstDayOfMonth = (date: Date): Date => {
  return startOfMonth(date);
};

// Função para obter o último dia do mês
export const getLastDayOfMonth = (date: Date): Date => {
  return endOfMonth(date);
};

// Função para adicionar meses a uma data
export const addMonthsToDate = (date: Date, months: number): Date => {
  return addMonths(date, months);
};

// Função para verificar se uma data está dentro de um intervalo
export const isDateWithinRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return isAfter(date, startDate) && isBefore(date, endDate);
};

// Função para calcular o total de receita
export const calculateTotalRevenue = (payments = []) => {
  return payments.reduce((total, payment) => total + payment.value, 0);
};

// Função para calcular o total de despesas
export const calculateTotalExpenses = (expenses = []) => {
  return expenses.reduce((total, expense) => total + expense.value, 0);
};

// Função para calcular o balanço do fluxo de caixa
export const calculateCashFlowBalance = (cashFlow = []) => {
  return cashFlow.reduce((balance, entry) => {
    // Convert entrada/saida to income/expense if needed
    const type = entry.type === 'entrada' ? 'income' : 
                entry.type === 'saida' ? 'expense' : entry.type;
    
    return type === 'income' ? balance + entry.value : balance - entry.value;
  }, 0);
};

// Função para contar contas vencidas
export const countOverdueAccounts = (accounts = []) => {
  const today = new Date();
  return accounts.filter(account => {
    const dueDate = new Date(account.dueDate);
    return dueDate < today && account.status !== 'Pago';
  }).length;
};

// Função para obter contas vencidas
export const getOverdueAccounts = (accounts = []) => {
  const today = new Date();
  return accounts.filter(account => {
    const dueDate = new Date(account.dueDate);
    return dueDate < today && account.status !== 'Pago';
  });
};

// Função para simular dados de receita mensal
export const generateMonthlyRevenueData = (start: Date, months: number): RevenueData[] => {
  const data: RevenueData[] = [];
  for (let i = 0; i < months; i++) {
    const date = addMonths(start, i);
    const revenue = Math.floor(Math.random() * 2000) + 1000; // Simula receita entre 1000 e 3000
    const expenses = Math.floor(revenue * (0.3 + Math.random() * 0.2)); // Simula despesas como uma porcentagem da receita
    data.push({
      date: format(date, 'MM/yy', { locale: ptBR }),
      revenue: revenue,
      expenses: expenses,
    });
  }
  return data;
};

// Preparar dados para relatórios financeiros
export const prepareFinancialReportData = (cashFlowData: CashFlowEntry[] = [], period = '30days'): FinancialSummary => {
  // Implementação básica
  let income = 0;
  let expense = 0;
  
  cashFlowData.forEach(entry => {
    // Convert entrada/saida to income/expense if needed
    const type = entry.type === 'entrada' ? 'income' : 
                entry.type === 'saida' ? 'expense' : entry.type;
                
    if (type === 'income') {
      income += entry.amount;
    } else {
      expense += entry.amount;
    }
  });
  
  return {
    totalIncome: income,
    totalExpenses: expense,
    balance: income - expense,
    incomeChange: 0,
    expensesChange: 0,
    balanceChange: 0,
  };
};
