import { 
  Payment, 
  Expense, 
  CashFlow, 
  RevenueData, 
  AccountReceivable, 
  Professional 
} from "@/types/financial";
import { formatDate } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Calcula o total de receitas para um período específico
 * @param payments Lista de pagamentos
 * @param startDate Data inicial (opcional)
 * @param endDate Data final (opcional)
 * @returns Total de receitas
 */
export function calculateTotalRevenue(
  payments: Payment[], 
  startDate?: Date, 
  endDate?: Date
): number {
  return payments
    .filter(payment => {
      // Se não houver filtro de data, retorna todos
      if (!startDate && !endDate) return true;
      
      const paymentDate = new Date(payment.date);
      
      // Filtra por data
      if (startDate && endDate) {
        return paymentDate >= startDate && paymentDate <= endDate;
      } else if (startDate) {
        return paymentDate >= startDate;
      } else if (endDate) {
        return paymentDate <= endDate;
      }
      
      return true;
    })
    .filter(payment => payment.status !== "Cancelado")
    .reduce((acc, payment) => acc + payment.value, 0);
}

/**
 * Calcula o total de despesas para um período específico
 * @param expenses Lista de despesas
 * @param startDate Data inicial (opcional)
 * @param endDate Data final (opcional)
 * @returns Total de despesas
 */
export function calculateTotalExpenses(
  expenses: Expense[],
  startDate?: Date,
  endDate?: Date
): number {
  return expenses
    .filter(expense => {
      // Se não houver filtro de data, retorna todos
      if (!startDate && !endDate) return true;
      
      const expenseDate = new Date(expense.date);
      
      // Filtra por data
      if (startDate && endDate) {
        return expenseDate >= startDate && expenseDate <= endDate;
      } else if (startDate) {
        return expenseDate >= startDate;
      } else if (endDate) {
        return expenseDate <= endDate;
      }
      
      return true;
    })
    .filter(expense => expense.status !== "Pendente")
    .reduce((acc, expense) => acc + expense.value, 0);
}

/**
 * Calcula o ticket médio dos pagamentos
 * @param payments Lista de pagamentos
 * @returns Ticket médio
 */
export function calculateAverageTicket(payments: Payment[]): number {
  const validPayments = payments.filter(payment => payment.status === "Pago");
  
  if (validPayments.length === 0) return 0;
  
  const total = validPayments.reduce((acc, payment) => acc + payment.value, 0);
  return total / validPayments.length;
}

/**
 * Calcula o total de comissões a pagar
 * @param professionals Lista de profissionais
 * @returns Total de comissões a pagar
 */
export function calculateTotalCommissions(professionals: Professional[]): number {
  return professionals
    .filter(pro => pro.status === "A Pagar")
    .reduce((acc, pro) => acc + pro.commission, 0);
}

/**
 * Formata dados para exportação de relatório financeiro
 * @param cashFlowData Dados do fluxo de caixa
 * @returns Dados formatados para relatório
 */
export function prepareFinancialReportData(
  cashFlowData: CashFlow[]
): Record<string, any>[] {
  return cashFlowData.map(flow => ({
    Data: flow.date,
    Tipo: flow.type === "entrada" ? "Entrada" : "Saída",
    Categoria: flow.category,
    Descrição: flow.description,
    Valor: flow.value,
    Status: flow.status === "realizado" ? "Realizado" : "Previsto",
    "Método de Pagamento": flow.paymentMethod || "",
    "Documento Relacionado": flow.relatedDocument || ""
  }));
}

/**
 * Calcula o saldo do fluxo de caixa
 * @param cashFlowData Dados do fluxo de caixa
 * @returns Objeto contendo total de entradas, saídas e saldo
 */
export function calculateCashFlowBalance(cashFlowData: CashFlow[]): {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
} {
  const totalIncome = cashFlowData
    .filter(flow => flow.type === "entrada" && flow.status === "realizado")
    .reduce((acc, flow) => acc + flow.value, 0);
  
  const totalExpenses = cashFlowData
    .filter(flow => flow.type === "saida" && flow.status === "realizado")
    .reduce((acc, flow) => acc + flow.value, 0);
  
  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses
  };
}

/**
 * Filtra dados do fluxo de caixa por tipo e data
 * @param cashFlowData Dados do fluxo de caixa
 * @param type Tipo de transação (opcional: 'entrada', 'saida' ou 'all')
 * @param date Data para filtrar (opcional)
 * @returns Dados filtrados
 */
export function filterCashFlowData(
  cashFlowData: CashFlow[],
  type: 'entrada' | 'saida' | 'all' = 'all',
  date?: string
): CashFlow[] {
  return cashFlowData.filter(flow => {
    // Filtra por tipo
    const typeMatches = type === 'all' || flow.type === type;
    
    // Filtra por data
    const dateMatches = !date || flow.date === date;
    
    return typeMatches && dateMatches;
  });
}

/**
 * Verifica se há contas atrasadas e retorna alertas formatados
 * @param accounts Lista de contas a receber
 * @param expenses Lista de despesas
 * @returns Lista de alertas financeiros
 */
export function getOverdueAccounts(
  accounts: AccountReceivable[], 
  expenses?: Expense[]
): Array<{
  type: string;
  description: string;
  amount: number;
  dueDate: string;
  status: string;
}> {
  const alerts = [];
  
  // Alertas de contas a receber
  const overdueAccounts = accounts.filter(account => account.status === "Atrasado");
  for (const account of overdueAccounts) {
    alerts.push({
      type: "Conta a Receber",
      description: `Cliente: ${account.client}`,
      amount: account.value,
      dueDate: account.dueDate,
      status: account.status
    });
  }
  
  // Alertas de despesas vencidas (se fornecido)
  if (expenses) {
    const overdueExpenses = expenses.filter(expense => expense.status === "Vencido");
    for (const expense of overdueExpenses) {
      alerts.push({
        type: "Despesa",
        description: expense.name,
        amount: expense.value,
        dueDate: expense.date,
        status: expense.status
      });
    }
  }
  
  return alerts;
}

// Para manter retrocompatibilidade
export function countOverdueAccounts(accounts: AccountReceivable[]): number {
  return accounts.filter(account => account.status === "Atrasado").length;
} 