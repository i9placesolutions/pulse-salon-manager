
import { Expense, AccountReceivable, CashFlow } from '@/types/financial';
import { format, isAfter, isBefore, parse, subDays } from 'date-fns';

export interface FilterOptions {
  period?: string;
  category?: string;
  paymentMethod?: string;
  status?: string;
}

export const calculateTotalRevenue = (cashFlow: CashFlow[], options: FilterOptions = {}): number => {
  return cashFlow
    .filter(entry => {
      // Convertemos para garantir que os tipos sejam comparáveis
      const entryType = typeof entry.type === 'string' ?
        (entry.type === 'entrada' || entry.type === 'income') ? 'income' : 'expense' : entry.type;
      
      if (entryType !== 'income' && entryType !== 'entrada') return false;
      
      // Filtrar por período, se especificado
      if (options.period) {
        const today = new Date();
        const entryDate = new Date(entry.date);
        
        switch (options.period) {
          case 'today':
            if (!isSameDay(entryDate, today)) return false;
            break;
          case 'week':
            if (isAfter(subDays(today, 7), entryDate)) return false;
            break;
          case 'month':
            if (entryDate.getMonth() !== today.getMonth() || entryDate.getFullYear() !== today.getFullYear()) return false;
            break;
          case 'year':
            if (entryDate.getFullYear() !== today.getFullYear()) return false;
            break;
        }
      }
      
      // Filtrar por categoria, se especificada
      if (options.category && entry.category !== options.category) return false;
      
      // Filtrar por método de pagamento, se especificado
      if (options.paymentMethod && entry.paymentMethod !== options.paymentMethod) return false;
      
      // Filtrar por status, se especificado
      if (options.status && entry.status !== options.status) return false;
      
      return true;
    })
    .reduce((total, entry) => total + entry.value, 0);
};

export const calculateTotalExpenses = (expenses: Expense[], options: FilterOptions = {}): number => {
  return expenses
    .filter(expense => {
      // Filtrar por período, se especificado
      if (options.period) {
        const today = new Date();
        const expenseDate = expense.date ? new Date(expense.date) : new Date(expense.dueDate);
        
        switch (options.period) {
          case 'today':
            if (!isSameDay(expenseDate, today)) return false;
            break;
          case 'week':
            if (isAfter(subDays(today, 7), expenseDate)) return false;
            break;
          case 'month':
            if (expenseDate.getMonth() !== today.getMonth() || expenseDate.getFullYear() !== today.getFullYear()) return false;
            break;
          case 'year':
            if (expenseDate.getFullYear() !== today.getFullYear()) return false;
            break;
        }
      }
      
      // Filtrar por categoria, se especificada
      if (options.category && expense.category !== options.category) return false;
      
      return true;
    })
    .reduce((total, expense) => total + expense.value, 0);
};

export const calculateCashFlowBalance = (cashFlow: CashFlow[]): number => {
  let income = 0;
  let expenses = 0;
  
  cashFlow.forEach(entry => {
    // Convertemos para garantir que os tipos sejam comparáveis
    const entryType = typeof entry.type === 'string' ?
      (entry.type === 'entrada' || entry.type === 'income') ? 'income' : 'expense' : entry.type;
    
    if (entryType === 'income' || entryType === 'entrada') {
      income += entry.value;
    } else if (entryType === 'expense' || entryType === 'saida') {
      expenses += entry.value;
    }
  });
  
  return income - expenses;
};

export const getOverdueAccounts = (accounts: AccountReceivable[]): AccountReceivable[] => {
  const today = new Date();
  
  return accounts.filter(account => {
    const dueDate = new Date(account.dueDate);
    return account.status !== "Pago" && isAfter(today, dueDate);
  });
};

export const countOverdueAccounts = (accounts: AccountReceivable[]): number => {
  return getOverdueAccounts(accounts).length;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getDate() === date2.getDate() && 
         date1.getMonth() === date2.getMonth() && 
         date1.getFullYear() === date2.getFullYear();
};

export const filterCashFlowData = (data: CashFlow[], filter: string): CashFlow[] => {
  switch (filter) {
    case 'income':
      return data.filter(item => 
        item.type === 'income' || item.type === 'entrada'
      );
    case 'expense':
      return data.filter(item =>
        item.type === 'expense' || item.type === 'saida'
      );
    default:
      return data;
  }
};

export const calculateAverageTicket = (payments: any[], period?: string): number => {
  if (!payments || payments.length === 0) return 0;
  
  const filteredPayments = period ? filterByPeriod(payments, period, 'date') : payments;
  
  if (filteredPayments.length === 0) return 0;
  
  const totalValue = filteredPayments.reduce((acc, payment) => acc + payment.value, 0);
  return totalValue / filteredPayments.length;
};

export const calculateTotalCommissions = (professionals: any[], period?: string): number => {
  if (!professionals || professionals.length === 0) return 0;
  
  return professionals.reduce((acc, professional) => acc + professional.commission, 0);
};

export const filterByPeriod = (items: any[], period: string, dateField: string): any[] => {
  const today = new Date();
  
  return items.filter(item => {
    const itemDate = new Date(item[dateField]);
    
    switch (period) {
      case 'today':
        return isSameDay(itemDate, today);
      case 'week':
        return isAfter(itemDate, subDays(today, 7));
      case 'month':
        return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
      case 'year':
        return itemDate.getFullYear() === today.getFullYear();
      default:
        return true;
    }
  });
};

export const prepareFinancialReportData = (data: any, type: string, format: string): any => {
  // Implementação básica para preparar dados do relatório financeiro
  return {
    type,
    format,
    data
  };
};

export type CashFlowEntry = {
  id?: string | number;
  type: 'income' | 'expense' | 'entrada' | 'saida';
  category: string;
  amount: number;
  date: string;
  description?: string;
  paymentMethod?: string;
  recurring?: boolean;
  status?: 'realizado' | 'previsto';
};

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  income?: number;
  expense?: number;
  previousPeriodIncome?: number;
  previousPeriodExpenses?: number;
  previousPeriodBalance?: number;
  incomeChange?: number;
  expensesChange?: number;
  balanceChange?: number;
}
