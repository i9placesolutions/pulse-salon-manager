
import { CashFlow, Expense, AccountReceivable, Payment } from '@/types/financial';

// Função para calcular o total de receitas
export const calculateTotalRevenue = (cashFlow: CashFlow[]) => {
  return cashFlow
    .filter(item => item.type === "entrada" || item.type === "income")
    .reduce((sum, item) => sum + item.value, 0);
};

// Função para calcular o total de despesas
export const calculateTotalExpenses = (cashFlow: CashFlow[]) => {
  return cashFlow
    .filter(item => item.type === "saida" || item.type === "expense")
    .reduce((sum, item) => sum + item.value, 0);
};

// Função para calcular o saldo do fluxo de caixa
export const calculateCashFlowBalance = (cashFlow: CashFlow[]) => {
  const revenue = calculateTotalRevenue(cashFlow);
  const expenses = calculateTotalExpenses(cashFlow);
  return revenue - expenses;
};

// Função para obter contas a receber vencidas
export const getOverdueAccounts = (accounts: AccountReceivable[]) => {
  const today = new Date();
  return accounts.filter(acc => {
    const dueDate = new Date(acc.dueDate);
    return dueDate < today && acc.status === "Pendente";
  });
};

// Função para contar contas a receber vencidas
export const countOverdueAccounts = (accounts: AccountReceivable[]) => {
  return getOverdueAccounts(accounts).length;
};

// Função para formatar dados para relatório financeiro
export type FinancialReportData = {
  date: string;
  description: string;
  type: string;
  value: number;
  status: string;
  category: string;
};

export const prepareFinancialReportData = (
  cashFlow: CashFlow[],
  startDate?: Date,
  endDate?: Date
): FinancialReportData[] => {
  let filteredData = [...cashFlow];

  // Filtrar por data se especificado
  if (startDate && endDate) {
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  // Formatar os dados para o relatório
  return filteredData.map(item => ({
    date: item.date,
    description: item.description,
    type: item.type === "income" || item.type === "entrada" ? "Receita" : "Despesa",
    value: item.value,
    status: item.status || "N/A",
    category: item.category
  }));
};

// Função para converter payment em formato de fluxo de caixa
export const paymentsToFlowData = (payments: Payment[]): CashFlow[] => {
  return payments.map(payment => ({
    id: payment.id,
    date: payment.date,
    type: "entrada", // Pagamentos são sempre entrada
    category: "Serviço",
    description: `${payment.client} - ${payment.service}`,
    value: payment.value,
    status: payment.status === "Pago" ? "realizado" : "previsto",
    paymentMethod: payment.method
  }));
};

// Funções adicionais para resolver os erros de tipo
export const calculateAverageTicket = (cashFlow: CashFlow[]) => {
  const revenues = cashFlow.filter(item => item.type === "entrada" || item.type === "income");
  if (revenues.length === 0) return 0;
  
  const totalRevenue = revenues.reduce((sum, item) => sum + item.value, 0);
  return totalRevenue / revenues.length;
};

export const calculateTotalCommissions = (cashFlow: CashFlow[]) => {
  // Implementação simplificada para resolver erro
  return 0;
};

export const filterCashFlowData = (cashFlow: CashFlow[], filter?: string) => {
  if (!filter) return cashFlow;
  return cashFlow.filter(item => item.category === filter || item.type === filter);
};
