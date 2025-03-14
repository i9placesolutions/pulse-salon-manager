import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, MessageSquare, Send, FileUp, Calendar, Filter, Eye, Settings, RotateCcw } from "lucide-react";
import { SummaryCards } from "@/components/financeiro/SummaryCards";
import { RevenueChart } from "@/components/financeiro/RevenueChart";
import { PaymentsList } from "@/components/financeiro/PaymentsList";
import { ProfessionalsList } from "@/components/financeiro/ProfessionalsList";
import { AccountsReceivable } from "@/components/financeiro/AccountsReceivable";
import { ExpensesList } from "@/components/financeiro/ExpensesList";
import { NewRevenueDialog } from "@/components/financeiro/NewRevenueDialog";
import { NewExpenseDialog } from "@/components/financeiro/NewExpenseDialog";
import { NewSupplierDialog } from "@/components/financeiro/NewSupplierDialog";
import { CashFlowPanel } from "@/components/financeiro/CashFlowPanel";
import { CostControlPanel } from "@/components/financeiro/CostControlPanel";
import { TaxManagementPanel } from "@/components/financeiro/TaxManagementPanel";
import { PaymentMethodsPanel } from "@/components/financeiro/PaymentMethodsPanel";
import { useToast } from "@/hooks/use-toast";
import {
  Payment,
  Professional,
  RevenueData,
  AccountReceivable,
  Expense,
  CashFlow,
  TaxRecord,
  PaymentMethodConfig
} from "@/types/financial";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { prepareFinancialReportData } from "@/utils/financial";
import { exportData } from "@/utils/export";
import { Progress } from "@/components/ui/progress";
import { ReportType, saveFinancialReport } from '@/utils/pdfReport';
import { 
  calculateTotalRevenue, 
  calculateTotalExpenses, 
  calculateCashFlowBalance,
  getOverdueAccounts,
  countOverdueAccounts
} from '@/utils/financial';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandList, CommandGroup, CommandItem } from "@/components/ui/command";
import { sub, format, parse, isAfter, isBefore, add } from "date-fns";
import { DateRange } from "react-day-picker";
import { PeriodSelectButton } from "@/components/financeiro/PeriodSelectButton";
import { FinancialProjections } from "@/components/financeiro/FinancialProjections";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/currency";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ptBR } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";

const revenueData: RevenueData[] = [
  { date: "01/03", revenue: 1200, expenses: 800 },
  { date: "02/03", revenue: 1800, expenses: 900 },
  { date: "03/03", revenue: 1400, expenses: 750 },
  { date: "04/03", revenue: 2200, expenses: 1100 },
  { date: "05/03", revenue: 1600, expenses: 850 },
  { date: "06/03", revenue: 2400, expenses: 1200 },
  { date: "07/03", revenue: 2800, expenses: 1400 },
];

const payments: Payment[] = [
  { id: 1, client: "João Silva", service: "Corte + Barba", value: 80, method: "Pix", date: "2024-03-07", status: "Pago" },
  { id: 2, client: "Maria Santos", service: "Hidratação", value: 150, method: "Cartão", date: "2024-03-07", status: "Pendente" },
  { id: 3, client: "Pedro Costa", service: "Corte", value: 50, method: "Dinheiro", date: "2024-03-06", status: "Pago" },
];

const professionals: Professional[] = [
  { id: 1, name: "Ana Silva", commission: 1200, services: 24, status: "A Pagar" },
  { id: 2, name: "Carlos Santos", commission: 980, services: 18, status: "Pago" },
  { id: 3, name: "Maria Oliveira", commission: 1450, services: 29, status: "A Pagar" },
];

const accountsReceivable: AccountReceivable[] = [
  { id: 1, client: "Roberto Almeida", value: 300, dueDate: "2024-03-15", status: "Em Aberto", installment: "2/3" },
  { id: 2, client: "Sandra Pereira", value: 450, dueDate: "2024-03-10", status: "Atrasado", installment: "1/2" },
];

const expenses: Expense[] = [
  { id: 1, name: "Aluguel", value: 2500, date: "2024-03-05", category: "Fixo", status: "Pago", isRecurring: true },
  { id: 2, name: "Produtos", value: 1200, date: "2024-03-10", category: "Variável", status: "Pendente", isRecurring: false },
  { id: 3, name: "Água/Luz", value: 800, date: "2024-03-15", category: "Fixo", status: "Pendente", isRecurring: true },
];

const cashFlowData: CashFlow[] = [
  {
    id: 1,
    date: "2024-03-07",
    type: "entrada",
    category: "Serviços",
    description: "Serviços do dia",
    value: 1500,
    status: "realizado",
    paymentMethod: "Pix",
  },
  {
    id: 2,
    date: "2024-03-08",
    type: "saida",
    category: "Fornecedores",
    description: "Produtos de beleza",
    value: 800,
    status: "previsto",
    paymentMethod: "Boleto",
    relatedDocument: "NF-123456",
  },
];

const taxRecords: TaxRecord[] = [
  {
    id: 1,
    name: "ISS",
    type: "Municipal",
    value: 150,
    baseValue: 3000,
    rate: 5,
    dueDate: "2024-03-15",
    status: "Pendente",
  },
  {
    id: 2,
    name: "SIMPLES",
    type: "Federal",
    value: 450,
    baseValue: 15000,
    rate: 3,
    dueDate: "2024-03-20",
    status: "Pendente",
  },
];

const paymentMethodsConfig: PaymentMethodConfig[] = [
  {
    type: "Pix",
    enabled: true,
    fees: {
      percentage: 0.99,
    },
    pixKeys: [
      {
        key: "exemplo@email.com",
        type: "Email",
      },
    ],
  },
  {
    type: "Cartão",
    enabled: true,
    fees: {
      percentage: 2.99,
    },
    cardBrands: [
      {
        name: "Mastercard",
        enabled: true,
        maxInstallments: 12,
        minValue: 10,
        fees: {
          percentage: 2.99,
        },
      },
      {
        name: "Visa",
        enabled: true,
        maxInstallments: 12,
        minValue: 10,
        fees: {
          percentage: 2.99,
        },
      },
    ],
  },
];

// Dados de exemplo para o relatório completo
const servicesData = [
  { id: 1, name: 'Corte de Cabelo', price: 50, duration: 30, category: 'Cabelo', status: 'Ativo' },
  { id: 2, name: 'Coloração', price: 120, duration: 90, category: 'Cabelo', status: 'Ativo' },
  { id: 3, name: 'Manicure', price: 35, duration: 45, category: 'Unhas', status: 'Ativo' },
  { id: 4, name: 'Pedicure', price: 45, duration: 60, category: 'Unhas', status: 'Ativo' },
  { id: 5, name: 'Hidratação', price: 80, duration: 60, category: 'Tratamento', status: 'Ativo' },
];

const professionalsData = [
  { id: 1, name: 'Ana Silva', role: 'Cabeleireira', appointments: 120, rating: 4.8, revenue: 5600 },
  { id: 2, name: 'Carlos Santos', role: 'Barbeiro', appointments: 95, rating: 4.7, revenue: 4200 },
  { id: 3, name: 'Juliana Oliveira', role: 'Manicure', appointments: 150, rating: 4.9, revenue: 3800 },
  { id: 4, name: 'Marcos Pereira', role: 'Esteticista', appointments: 85, rating: 4.6, revenue: 6200 },
];

const clientsData = [
  { id: 1, name: 'Maria Souza', email: 'maria@email.com', phone: '(11) 98765-4321', visits: 8, lastVisit: '15/05/2023', totalSpent: 780 },
  { id: 2, name: 'João Almeida', email: 'joao@email.com', phone: '(11) 91234-5678', visits: 5, lastVisit: '22/06/2023', totalSpent: 450 },
  { id: 3, name: 'Fernanda Lima', email: 'fernanda@email.com', phone: '(11) 99876-5432', visits: 12, lastVisit: '10/07/2023', totalSpent: 1250 },
  { id: 4, name: 'Ricardo Gomes', email: 'ricardo@email.com', phone: '(11) 92345-6789', visits: 3, lastVisit: '05/08/2023', totalSpent: 320 },
];

const appointmentsData = [
  { id: 1, date: '15/07/2023', time: '10:00', clientName: 'Maria Souza', serviceName: 'Corte de Cabelo', professionalName: 'Ana Silva', status: 'Concluído', value: 50 },
  { id: 2, date: '16/07/2023', time: '14:30', clientName: 'João Almeida', serviceName: 'Barba', professionalName: 'Carlos Santos', status: 'Concluído', value: 35 },
  { id: 3, date: '18/07/2023', time: '11:15', clientName: 'Fernanda Lima', serviceName: 'Manicure', professionalName: 'Juliana Oliveira', status: 'Concluído', value: 35 },
  { id: 4, date: '20/07/2023', time: '16:00', clientName: 'Ricardo Gomes', serviceName: 'Massagem', professionalName: 'Marcos Pereira', status: 'Agendado', value: 120 },
];

// Interface para o objeto de dados do relatório
interface ReportData {
  title: string;
  period: string;
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    balance: number;
  };
  transactions: Array<{
    date: string;
    description: string;
    category: string;
    type: string;
    value: number;
    status: string;
    paymentMethod: string;
  }>;
  categories?: Array<{
    category: string;
    value: number;
    percentage: number;
  }>;
  projections?: Array<{
    month: string;
    projectedRevenue: number;
    projectedExpenses: number;
    projectedBalance: number;
  }>;
  services?: Array<{
    id: number;
    name: string;
    price: number;
    duration: number;
    category: string;
    status: string;
  }>;
  professionals?: Array<{
    id: number;
    name: string;
    role: string;
    appointments: number;
    rating: number;
    revenue: number;
  }>;
  clients?: Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    visits: number;
    lastVisit: string;
    totalSpent: number;
  }>;
  appointments?: Array<{
    id: number;
    date: string;
    time: string;
    clientName: string;
    serviceName: string;
    professionalName: string;
    status: string;
    value: number;
  }>;
}

const Financeiro = () => {
  const [view, setView] = useState<"week" | "month" | "year">("month");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: sub(new Date(), { months: 1 }),
    to: new Date(),
  });
  const [cashFlowState, setCashFlowState] = useState<CashFlow[]>(cashFlowData);
  const [expensesState, setExpensesState] = useState<Expense[]>(expenses);
  const [accountsReceivableState, setAccountsReceivableState] = useState<AccountReceivable[]>(accountsReceivable);
  const { toast } = useToast();

  const handleUpdateCashFlow = (newData: CashFlow[]) => {
    setCashFlowState(newData);
    // Aqui seria o lugar para persistir os dados em uma API ou localStorage
    toast({
      title: "Fluxo de caixa atualizado",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  // Função para marcar um item como pago/recebido
  const handleMarkItemAsPaid = (type: 'expense' | 'account', id: number) => {
    if (type === 'expense') {
      // Atualizar status da despesa
      const updatedExpenses = expensesState.map(expense => 
        expense.id === id ? { ...expense, status: 'Pago' as const } : expense
      );
      setExpensesState(updatedExpenses);
      
      toast({
        title: "Despesa atualizada",
        description: "A despesa foi marcada como paga com sucesso.",
      });
    } else {
      // Atualizar status da conta a receber
      const updatedAccounts = accountsReceivableState.map(account => 
        account.id === id ? { ...account, status: 'Pago' as const } : account
      );
      setAccountsReceivableState(updatedAccounts);
      
      toast({
        title: "Conta atualizada",
        description: "A conta foi marcada como recebida com sucesso.",
      });
    }
  };

  const handleMarkAlertItem = (item: Expense | AccountReceivable, action: string) => {
    if ('dueDate' in item) {
      // É uma conta a receber
      handleMarkItemAsPaid('account', item.id);
    } else {
      // É uma despesa
      handleMarkItemAsPaid('expense', item.id);
    }
    
    toast({
      title: action === "pagar" ? "Despesa marcada como paga" : "Pagamento registrado",
      description: `A atualização foi realizada com sucesso.`
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">
            Controle de receitas, despesas e fluxo de caixa
          </p>
        </div>
      </div>

      {/* SummaryCards movido para o topo, fora das abas */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Visão Geral Financeira</h2>
        </div>
        
        <SummaryCards 
          payments={payments} 
          expenses={expensesState} 
          professionals={professionals} 
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="receivables">Contas a Receber</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
          <TabsTrigger value="commissions">Comissões</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="taxes">Impostos</TabsTrigger>
          <TabsTrigger value="payments">Meios de Pagamento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-8">
                <RevenueChart data={revenueData} period={view} setPeriod={setView} />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <PaymentsList payments={payments} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfessionalsList professionals={professionals} />
              <AccountsReceivable 
                accounts={accountsReceivableState} 
                onNewEntry={(entry) => {
                  // Usando a mesma função para atualizar o fluxo de caixa
                  const newEntry = {
                    ...entry,
                    id: cashFlowState.length > 0 ? Math.max(...cashFlowState.map(item => item.id)) + 1 : 1
                  };
                  handleUpdateCashFlow([...cashFlowState, newEntry]);
                }} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="col-span-12">
                {/* Componente FinancialAlerts removido conforme solicitado */}
              </div>
            </div>
            
            <FinancialProjections 
              expenses={expensesState}
              accountsReceivable={accountsReceivableState}
              cashFlow={cashFlowState}
            />
          </div>
        </TabsContent>

        <TabsContent value="cashflow">
          <CashFlowPanel data={cashFlowState} onUpdateData={handleUpdateCashFlow} />
        </TabsContent>

        <TabsContent value="receivables">
          <AccountsReceivable 
            accounts={accountsReceivableState} 
            onNewEntry={(entry) => {
              // Usando a mesma função para atualizar o fluxo de caixa
              const newEntry = {
                ...entry,
                id: cashFlowState.length > 0 ? Math.max(...cashFlowState.map(item => item.id)) + 1 : 1
              };
              handleUpdateCashFlow([...cashFlowState, newEntry]);
            }} 
          />
        </TabsContent>

        <TabsContent value="expenses">
          <div className="space-y-4">
            <ExpensesList 
              expenses={expensesState} 
              onUpdateExpense={(updatedExpense) => {
                const updatedExpenses = expensesState.map(expense => 
                  expense.id === updatedExpense.id ? updatedExpense : expense
                );
                setExpensesState(updatedExpenses);
              }}
              onNewEntry={(entry) => {
                // Usando a mesma função para atualizar o fluxo de caixa
                const newEntry = {
                  ...entry,
                  id: cashFlowState.length > 0 ? Math.max(...cashFlowState.map(item => item.id)) + 1 : 1
                };
                handleUpdateCashFlow([...cashFlowState, newEntry]);
              }}
            />
            <CostControlPanel expenses={expensesState} />
          </div>
        </TabsContent>

        <TabsContent value="commissions">
          <ProfessionalsList professionals={professionals} />
        </TabsContent>

        <TabsContent value="suppliers">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold">Fornecedores</h2>
              <p className="text-sm text-muted-foreground">
                Gerencie seus fornecedores e pagamentos
              </p>
            </div>
            <NewSupplierDialog />
          </div>
        </TabsContent>

        <TabsContent value="taxes">
          <TaxManagementPanel taxes={taxRecords} />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentMethodsPanel config={paymentMethodsConfig} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financeiro;
