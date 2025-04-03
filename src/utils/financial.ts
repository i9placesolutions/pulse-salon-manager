
import { Expense, AccountReceivable, CashFlow } from "@/types/financial";
import { Payment } from "@/types/financial";
import { CashFlowEntry, FinancialSummary } from "@/types/dashboard";
import { format, parseISO, isAfter, isBefore, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RevenueData } from "@/types/financial";
import { formatCurrency } from "./currency";
import { Professional } from "@/types/financial";

/**
 * Calcula o total de receitas com base nos dados fornecidos
 */
export const calculateTotalRevenue = (payments: Payment[] = []): number => {
  return payments.reduce((total, payment) => {
    if (payment.status === 'Pago') {
      return total + payment.value;
    }
    return total;
  }, 0);
};

/**
 * Calcula o total de despesas com base nos dados fornecidos
 */
export const calculateTotalExpenses = (expenses: Expense[] = []): number => {
  return expenses.reduce((total, expense) => {
    if (expense.status === 'Pago') {
      return total + expense.value;
    }
    return total;
  }, 0);
};

/**
 * Calcula o balanço de caixa com base nos dados fornecidos
 */
export const calculateCashFlowBalance = (
  payments: Payment[] = [], 
  expenses: Expense[] = []
): number => {
  const totalRevenue = calculateTotalRevenue(payments);
  const totalExpenses = calculateTotalExpenses(expenses);
  return totalRevenue - totalExpenses;
};

/**
 * Obtém contas a receber em atraso
 */
export const getOverdueAccounts = (
  accountsReceivable: AccountReceivable[] = []
): AccountReceivable[] => {
  const today = new Date();
  return accountsReceivable.filter(account => {
    if (account.status === 'Pago' || account.status === 'Cancelado') {
      return false;
    }
    const dueDate = new Date(account.dueDate);
    return isAfter(today, dueDate);
  });
};

/**
 * Conta o número de contas a receber em atraso
 */
export const countOverdueAccounts = (
  accountsReceivable: AccountReceivable[] = []
): number => {
  return getOverdueAccounts(accountsReceivable).length;
};

/**
 * Formata uma data no formato DD/MM/YYYY
 */
export const formatDate = (dateStr: string): string => {
  try {
    const date = parseISO(dateStr);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    return dateStr; // Retorna a string original se não conseguir formatar
  }
};

/**
 * Prepara dados para exportação de relatórios financeiros
 */
export const prepareFinancialReportData = (
  revenues: any[] = [],
  expenses: Expense[] = [],
  cashFlow: CashFlow[] = [],
  period: string = 'month'
): any => {
  // Dados básicos
  const reportData = {
    title: `Relatório Financeiro - ${period === 'month' ? 'Mensal' : 'Anual'}`,
    date: format(new Date(), 'dd/MM/yyyy'),
    summary: {
      totalRevenue: 0,
      totalExpenses: 0,
      balance: 0
    },
    revenues: [],
    expenses: [],
    cashFlow: []
  };

  // Processar receitas
  const processedRevenues = revenues.map(rev => ({
    date: formatDate(rev.date),
    client: rev.client || rev.clientName || 'N/A',
    description: rev.description || rev.service || 'N/A',
    value: rev.value,
    paymentMethod: rev.method || rev.paymentMethod || 'N/A',
    status: rev.status
  }));

  // Processar despesas
  const processedExpenses = expenses.map(exp => ({
    date: formatDate(exp.date || exp.dueDate),
    description: exp.name || exp.description,
    category: exp.category,
    value: exp.value,
    status: exp.status,
    recurring: exp.recurring || exp.isRecurring
  }));

  // Processar fluxo de caixa
  const processedCashFlow = cashFlow.map(flow => {
    const isIncome = flow.type === 'entrada' || flow.type === 'income';
    return {
      date: formatDate(flow.date),
      type: isIncome ? 'Entrada' : 'Saída',
      category: flow.category,
      description: flow.description,
      value: flow.value,
      status: flow.status || 'realizado',
      document: flow.relatedDocument || 'N/A'
    };
  });

  // Calcular o sumário
  let totalRevenue = 0;
  let totalExpenses = 0;

  cashFlow.forEach(flow => {
    if (flow.type === 'entrada' || flow.type === 'income') {
      totalRevenue += flow.value;
    } else if (flow.type === 'saida' || flow.type === 'expense') {
      totalExpenses += flow.value;
    }
  });

  reportData.summary.totalRevenue = totalRevenue;
  reportData.summary.totalExpenses = totalExpenses;
  reportData.summary.balance = totalRevenue - totalExpenses;

  return {
    ...reportData,
    revenues: processedRevenues,
    expenses: processedExpenses,
    cashFlow: processedCashFlow
  };
};

/**
 * Formata uma lista de tarefas financeiras para exibição
 */
export const formatFinancialTasks = (
  expenses: Expense[] = [],
  accountsReceivable: AccountReceivable[] = []
): any[] => {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // Processar despesas
  const expenseTasks = expenses
    .filter(expense => expense.status !== 'Pago' && expense.status !== 'Cancelado')
    .map(expense => {
      const dueDate = new Date(expense.dueDate);
      const isOverdue = isAfter(today, dueDate);
      const isDueSoon = isBefore(dueDate, nextWeek) && !isOverdue;

      return {
        id: `expense-${expense.id}`,
        title: expense.name || expense.description,
        type: 'expense',
        dueDate: expense.date || expense.dueDate,
        formattedDate: formatDate(expense.date || expense.dueDate),
        value: expense.value,
        status: isOverdue ? 'Vencido' : expense.status,
        priority: isOverdue ? 'high' : isDueSoon ? 'medium' : 'normal',
        item: expense
      };
    });

  // Processar contas a receber
  const receivableTasks = accountsReceivable
    .filter(account => account.status !== 'Pago' && account.status !== 'Cancelado')
    .map(account => {
      const dueDate = new Date(account.dueDate);
      const isOverdue = isAfter(today, dueDate);
      const isDueSoon = isBefore(dueDate, nextWeek) && !isOverdue;

      return {
        id: `receivable-${account.id}`,
        title: `${account.client} - ${account.description}`,
        type: 'receivable',
        dueDate: account.dueDate,
        formattedDate: formatDate(account.dueDate),
        value: account.value,
        status: account.status,
        priority: isOverdue ? 'medium' : isDueSoon ? 'low' : 'normal',
        item: account
      };
    });

  // Combinar e ordenar por data de vencimento
  return [...expenseTasks, ...receivableTasks].sort((a, b) => {
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    return dateA.getTime() - dateB.getTime();
  });
};

/**
 * Converte CashFlow para CashFlowEntry para uso em gráficos e relatórios
 */
export const convertCashFlowToEntries = (cashflows: CashFlow[]): CashFlowEntry[] => {
  return cashflows.map(cf => ({
    id: cf.id,
    type: cf.type === 'entrada' ? 'income' : 'expense',
    category: cf.category,
    amount: cf.value,
    date: cf.date,
    description: cf.description,
    paymentMethod: cf.paymentMethod,
    recurring: cf.recurring,
    status: cf.status
  }));
};

/**
 * Calcula o resumo financeiro baseado em entradas do fluxo de caixa
 */
export const calculateFinancialSummary = (entries: CashFlowEntry[]): FinancialSummary => {
  let totalIncome = 0;
  let totalExpenses = 0;
  
  entries.forEach(entry => {
    if (entry.type === 'income' || entry.type === 'entrada') {
      totalIncome += entry.amount;
    } else {
      totalExpenses += entry.amount;
    }
  });
  
  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    income: totalIncome,
    expense: totalExpenses
  };
};
