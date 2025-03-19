import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, MessageSquare, Send, FileUp, Calendar, Filter, Eye, Settings, RotateCcw, ChevronLeft, ChevronRight, X, FileSpreadsheet } from "lucide-react";
import { SummaryCards } from "@/components/financeiro/SummaryCards";
import { RevenueChart } from "@/components/financeiro/RevenueChart";
import { PaymentsList } from "@/components/financeiro/PaymentsList";
import { ProfessionalsList } from "@/components/financeiro/ProfessionalsList";
import { AccountsReceivable } from "@/components/financeiro/AccountsReceivable";
import { ExpensesList } from "@/components/financeiro/ExpensesList";
import { NewRevenueDialog } from "@/components/financeiro/NewRevenueDialog";
import { NewExpenseDialog } from "@/components/financeiro/NewExpenseDialog";
import { CashFlowPanel } from "@/components/financeiro/CashFlowPanel";
import { CostControlPanel } from "@/components/financeiro/CostControlPanel";
import { TaxManagementPanel } from "@/components/financeiro/TaxManagementPanel";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

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
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [cashFlowState, setCashFlowState] = useState<CashFlow[]>(cashFlowData);
  const [expensesState, setExpensesState] = useState<Expense[]>(expenses);
  const [accountsReceivableState, setAccountsReceivableState] = useState<AccountReceivable[]>(accountsReceivable);
  const { toast } = useToast();
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf">("excel");
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [reportTabActive, setReportTabActive] = useState("filters");
  const [reportFiltersValid, setReportFiltersValid] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [reportType, setReportType] = useState("complete");
  const [reportCategory, setReportCategory] = useState("all");
  
  const handleDateChange = (type: "from" | "to", value: string) => {
    if (value) {
      const date = new Date(value);
      setDateRange((prev) => ({ ...prev, [type]: date }));
    } else {
      setDateRange((prev) => ({ ...prev, [type]: undefined }));
    }
  };

  // Validar os filtros do relatório para permitir avançar
  const validateReportFilters = () => {
    // Se o período personalizado for selecionado, verificar se as datas foram preenchidas
    if (selectedPeriod === "custom") {
      if (!dateRange.from || !dateRange.to) {
        toast({
          title: "Datas não selecionadas",
          description: "Por favor, selecione as datas inicial e final para o período personalizado.",
          variant: "destructive",
          className: "bg-white border border-gray-200",
        });
        setReportFiltersValid(false);
        return false;
      }
    }
    
    // Se chegou até aqui, os filtros são válidos
    setReportFiltersValid(true);
    return true;
  };
  
  // Função para avançar para a próxima aba após validar os filtros
  const handleNextTab = () => {
    if (validateReportFilters()) {
      setReportTabActive("format");
    } else {
      toast({
        title: "Preencha os filtros",
        description: "Por favor, selecione pelo menos um critério para gerar o relatório.",
        variant: "destructive",
        className: "bg-white border border-gray-200",
      });
    }
  };
  
  // Manipulador de evento para tentar mudar a aba diretamente
  const handleTabChange = (value: string) => {
    if (value === "format" && reportTabActive === "filters") {
      // Se estiver tentando ir para a aba de formato a partir da aba de filtros
      if (validateReportFilters()) {
        setReportTabActive(value);
      } else {
        toast({
          title: "Preencha os filtros",
          description: "Por favor, selecione pelo menos um critério para gerar o relatório.",
          variant: "destructive",
        });
      }
    } else {
      // Para outras transições, permitir diretamente
      setReportTabActive(value);
    }
  };

  const handleExportReport = async () => {
    setIsExporting(true);
    setExportProgress(10);

    // Simulação de processamento
    setTimeout(() => setExportProgress(30), 500);
    setTimeout(() => setExportProgress(50), 1000);
    setTimeout(() => setExportProgress(70), 1500);

    try {
      // Preparar dados para exportação
      const financialData = prepareReportData();

      setExportProgress(90);

      // Tratar qualquer erro que possa ocorrer durante a exportação
      try {
        // Exportar dados usando a função genérica
        exportData(financialData, exportFormat, 'Relatorio_Financeiro');
        
        setExportProgress(100);
        setTimeout(() => {
          setIsExporting(false);
          setExportModalOpen(false);
          setExportProgress(0);
          
          toast({
            title: "Relatório gerado com sucesso",
            description: `O relatório foi exportado no formato ${exportFormat === 'excel' ? 'Excel' : 'PDF'}.`,
            variant: "default",
            className: "bg-white border border-gray-200 text-foreground",
          });
        }, 500);
      } catch (exportError) {
        throw exportError;
      }

    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      setIsExporting(false);
      setExportProgress(0);
      
      toast({
        title: "Erro ao gerar relatório",
        description: "Ocorreu um erro ao gerar o relatório. Tente novamente.",
        variant: "destructive",
        className: "bg-white border border-gray-200 text-foreground",
      });
    }
  };

  // Função para preparar dados para exportação
  const prepareReportData = () => {
    const baseReport = {
      titulo: `Relatório ${
        reportCategory === 'all' ? 'Geral' : 
        reportCategory === 'cashflow' ? 'de Fluxo de Caixa' : 
        reportCategory === 'taxes' ? 'de Impostos' : 
        reportCategory === 'commissions' ? 'de Comissões' : 
        reportCategory === 'costs' ? 'de Análise de Custos' : 
        'de Projeções Financeiras'
      } - ${
        reportType === 'complete' ? 'Completo' : 
        reportType === 'revenue' ? 'Receitas' : 
        'Despesas'
      }`,
      periodo: selectedPeriod === "custom" && dateRange.from && dateRange.to ? 
        `${format(dateRange.from, "dd/MM/yyyy")} a ${format(dateRange.to, "dd/MM/yyyy")}` : 
        selectedPeriod === "all" ? "Todo o Período" :
        selectedPeriod === "current-month" ? "Mês Atual" :
        selectedPeriod === "last-month" ? "Mês Anterior" :
        selectedPeriod === "last-3months" ? "Últimos 3 Meses" :
        selectedPeriod === "current-year" ? "Ano Atual" : "Período Selecionado",
      tipo: reportType,
      categoria: reportCategory
    };
    
    // Dados específicos da categoria
    let categoryData = {};
    
    if (reportCategory === 'all' || reportCategory === 'cashflow') {
      categoryData = {
        ...categoryData,
        fluxoDeCaixa: cashFlowState.map(cf => ({
          id: cf.id,
          data: cf.date,
          tipo: cf.type,
          categoria: cf.category,
          descricao: cf.description,
          valor: cf.value,
          status: cf.status,
          metodoPagamento: cf.paymentMethod
        }))
      };
    }
    
    if (reportCategory === 'all' || reportCategory === 'taxes') {
      categoryData = {
        ...categoryData,
        impostos: taxRecords.map(tax => ({
          id: tax.id,
          nome: tax.name,
          tipo: tax.type,
          valor: tax.value,
          valorBase: tax.baseValue,
          aliquota: tax.rate,
          vencimento: tax.dueDate,
          status: tax.status
        }))
      };
    }
    
    if (reportCategory === 'all' || reportCategory === 'commissions') {
      categoryData = {
        ...categoryData,
        comissoes: professionals.map(prof => ({
          id: prof.id,
          nome: prof.name,
          comissao: prof.commission,
          servicos: prof.services,
          status: prof.status
        }))
      };
    }
    
    if (reportCategory === 'all' || reportCategory === 'costs') {
      categoryData = {
        ...categoryData,
        analise: {
          custoFixo: expensesState.filter(e => e.category === 'Fixo').reduce((total, e) => total + e.value, 0),
          custoVariavel: expensesState.filter(e => e.category === 'Variável').reduce((total, e) => total + e.value, 0),
          totalDespesas: expensesState.reduce((total, e) => total + e.value, 0),
          receitaTotal: payments.reduce((total, p) => total + p.value, 0),
          margemContribuicao: payments.reduce((total, p) => total + p.value, 0) - 
                              expensesState.filter(e => e.category === 'Variável').reduce((total, e) => total + e.value, 0)
        }
      };
    }
    
    if (reportCategory === 'all' || reportCategory === 'projections') {
      // Simulação de projeções para demonstração
      const hoje = new Date();
      const projecoes = [];
      
      for (let i = 0; i < 6; i++) {
        const mes = add(hoje, { months: i });
        projecoes.push({
          mes: format(mes, "MM/yyyy"),
          receita: 10000 + Math.floor(Math.random() * 5000), // Valores simulados
          despesa: 6000 + Math.floor(Math.random() * 3000),
          saldo: 0 // Será calculado abaixo
        });
      }
      
      // Calcular saldo
      projecoes.forEach(p => {
        p.saldo = p.receita - p.despesa;
      });
      
      categoryData = {
        ...categoryData,
        projecoes
      };
    }

    // Para relatório completo ou de receitas, inclua os pagamentos
    const receitas = (reportType === 'complete' || reportType === 'revenue') ? {
      receitas: payments.map(p => ({
        cliente: p.client,
        servico: p.service,
        valor: p.value,
        metodo: p.method,
        data: p.date,
        status: p.status
      }))
    } : {};

    // Para relatório completo ou de despesas, inclua as despesas
    const despesas = (reportType === 'complete' || reportType === 'expenses') ? {
      despesas: expensesState.map(e => ({
        nome: e.name,
        valor: e.value,
        data: e.date,
        categoria: e.category,
        status: e.status,
        recorrente: e.isRecurring
      }))
    } : {};

    return [
      {
        ...baseReport,
        ...receitas,
        ...despesas,
        ...categoryData
      }
    ];
  };

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

  // No início do componente, ao carregar a página, validar os filtros padrão
  useEffect(() => {
    // Definir os filtros como válidos por padrão quando não é necessário período personalizado
    if (selectedPeriod !== "custom") {
      setReportFiltersValid(true);
    } else {
      validateReportFilters();
    }
  }, [selectedPeriod, dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">
            Controle de receitas, despesas e fluxo de caixa
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="gap-2 text-blue-600" onClick={() => setExportModalOpen(true)}>
            <FileText className="h-4 w-4 text-blue-600" />
            Relatórios
          </Button>
          <NewRevenueDialog />
          <NewExpenseDialog />
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
        <TabsList className="flex w-full h-10 bg-white rounded-xl shadow-md overflow-hidden">
          <TabsTrigger 
            value="overview" 
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
          >
            <Eye className="h-4 w-4" />
            <span className="font-medium">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger 
            value="revenues" 
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
          >
            <FileUp className="h-4 w-4" />
            <span className="font-medium">Receitas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="expenses"
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
          >
            <FileText className="h-4 w-4" />
            <span className="font-medium">Despesas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="taxes"
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="font-medium">Impostos</span>
          </TabsTrigger>
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

        <TabsContent value="revenues">
          <CashFlowPanel data={cashFlowState} onUpdateData={handleUpdateCashFlow} />
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

        <TabsContent value="taxes">
          <TaxManagementPanel taxes={taxRecords} />
        </TabsContent>
      </Tabs>

      {/* Modal de Relatórios Financeiros */}
      <Sheet open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <SheetContent side="right" className="p-0 w-full max-w-full sm:max-w-2xl border-l flex flex-col h-[100dvh] bg-white">
          {/* Cabeçalho fixo */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 border-b">
            <SheetHeader className="p-6">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl flex items-center gap-2 text-white">
                  <FileText className="h-5 w-5 text-white" />
                  Relatórios Financeiros
                </SheetTitle>
                <SheetClose className="rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-white">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Fechar</span>
                </SheetClose>
              </div>
              <SheetDescription className="text-blue-100">
                Configure o relatório e clique em "Gerar" para exportar
              </SheetDescription>
            </SheetHeader>
          </div>
          
          {/* Conteúdo rolável */}
          <div className="flex-1 overflow-y-auto bg-white">
            {isExporting ? (
              <div className="py-12 space-y-6 px-6 flex flex-col items-center justify-center">
                <div className="w-full max-w-md">
                  <Progress value={exportProgress} className="h-2" />
                  <p className="text-center mt-4 text-sm text-muted-foreground">
                    Preparando relatório... {exportProgress}%
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-6">
                  {/* Categoria de Relatório */}
                  <div className="bg-muted/30 p-5 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Categoria de Relatório</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div 
                        className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 ${reportCategory === 'all' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setReportCategory('all')}
                      >
                        <FileText className="h-6 w-6 text-blue-600 mb-1" />
                        <span className="text-xs font-medium text-center">Geral</span>
                      </div>
                      <div 
                        className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 ${reportCategory === 'cashflow' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setReportCategory('cashflow')}
                      >
                        <FileText className="h-6 w-6 text-green-600 mb-1" />
                        <span className="text-xs font-medium text-center">Fluxo de Caixa</span>
                      </div>
                      <div 
                        className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 ${reportCategory === 'taxes' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setReportCategory('taxes')}
                      >
                        <FileText className="h-6 w-6 text-red-600 mb-1" />
                        <span className="text-xs font-medium text-center">Impostos</span>
                      </div>
                      <div 
                        className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 ${reportCategory === 'commissions' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setReportCategory('commissions')}
                      >
                        <FileText className="h-6 w-6 text-purple-600 mb-1" />
                        <span className="text-xs font-medium text-center">Comissões</span>
                      </div>
                      <div 
                        className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 ${reportCategory === 'costs' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setReportCategory('costs')}
                      >
                        <FileText className="h-6 w-6 text-orange-600 mb-1" />
                        <span className="text-xs font-medium text-center">Análise de Custos</span>
                      </div>
                      <div 
                        className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 ${reportCategory === 'projections' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setReportCategory('projections')}
                      >
                        <FileText className="h-6 w-6 text-cyan-600 mb-1" />
                        <span className="text-xs font-medium text-center">Projeções</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tipo de Relatório */}
                  <div className="bg-muted/30 p-5 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Tipo de Relatório</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div 
                        className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-muted/50 ${reportType === 'complete' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setReportType('complete')}
                      >
                        <FileSpreadsheet className="h-8 w-8 text-blue-600 mb-2" />
                        <span className="text-sm font-medium">Relatório Completo</span>
                      </div>
                      <div 
                        className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-muted/50 ${reportType === 'revenue' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setReportType('revenue')}
                      >
                        <FileText className="h-8 w-8 text-green-600 mb-2" />
                        <span className="text-sm font-medium">Receitas</span>
                      </div>
                      <div 
                        className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-muted/50 ${reportType === 'expenses' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setReportType('expenses')}
                      >
                        <FileText className="h-8 w-8 text-[#db2777] mb-2" />
                        <span className="text-sm font-medium">Despesas</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Período */}
                  <div className="bg-muted/30 p-5 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Período</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div 
                          className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-muted/50 ${selectedPeriod === 'all' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                          onClick={() => setSelectedPeriod('all')}
                        >
                          <Calendar className="h-8 w-8 text-blue-600 mb-2" />
                          <span className="text-sm font-medium">Todo Período</span>
                          <p className="text-xs text-muted-foreground mt-1">Incluir todos os dados disponíveis</p>
                        </div>
                        <div 
                          className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-muted/50 ${selectedPeriod === 'custom' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                          onClick={() => setSelectedPeriod('custom')}
                        >
                          <Calendar className="h-8 w-8 text-orange-500 mb-2" />
                          <span className="text-sm font-medium">Personalizado</span>
                          <p className="text-xs text-muted-foreground mt-1">Selecionar datas específicas</p>
                        </div>
                      </div>
                      
                      {/* Seleção de data personalizada */}
                      {selectedPeriod === "custom" && (
                        <div className="mt-4 p-4 border rounded-md bg-white">
                          <h4 className="text-sm font-medium mb-3">Selecione o intervalo de datas:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Data inicial */}
                            <div className="space-y-2">
                              <Label htmlFor="date-from">Data Inicial</Label>
                              <Input
                                id="date-from"
                                type="date"
                                value={dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
                                onChange={(e) => handleDateChange("from", e.target.value)}
                                className="w-full"
                              />
                            </div>
                            
                            {/* Data final */}
                            <div className="space-y-2">
                              <Label htmlFor="date-to">Data Final</Label>
                              <Input
                                id="date-to"
                                type="date"
                                value={dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
                                onChange={(e) => handleDateChange("to", e.target.value)}
                                className="w-full"
                                min={dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined}
                              />
                            </div>
                          </div>
                          
                          {/* Mensagem informativa sobre o intervalo de datas */}
                          {dateRange.from && dateRange.to && (
                            <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-100">
                              <p className="text-sm text-blue-800 flex items-center">
                                <Calendar className="h-3 w-3 mr-1 inline" />
                                <span>
                                  Período: {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} até {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                              </p>
                            </div>
                          )}
                          
                          {/* Botão para limpar o intervalo de datas */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs mt-3"
                            onClick={() => setDateRange({ from: undefined, to: undefined })}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Limpar datas
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Formato de Saída */}
                  <div className="bg-muted/30 p-5 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Formato de Saída</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div 
                        className={`border rounded-md p-4 cursor-pointer hover:border-primary ${exportFormat === 'excel' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setExportFormat('excel')}
                      >
                        <div className="flex items-center gap-3">
                          <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
                          <div>
                            <h4 className="font-medium">Excel (.xlsx)</h4>
                            <p className="text-xs text-muted-foreground">Planilha para análises detalhadas</p>
                          </div>
                        </div>
                      </div>
                      <div 
                        className={`border rounded-md p-4 cursor-pointer hover:border-primary ${exportFormat === 'pdf' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                        onClick={() => setExportFormat('pdf')}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-[#db2777]" />
                          <div>
                            <h4 className="font-medium">PDF (.pdf)</h4>
                            <p className="text-xs text-muted-foreground">Documento para impressão e apresentação</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Nome do Arquivo */}
                  <div className="space-y-2">
                    <Label>Nome do Arquivo</Label>
                    <Input 
                      placeholder="Relatório Financeiro" 
                      defaultValue="Relatório Financeiro"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Rodapé fixo */}
          <div className="sticky bottom-0 mt-auto p-6 border-t bg-white shadow-sm">
            <div className="flex flex-row gap-3 w-full justify-end">
              <Button variant="outline" onClick={() => setExportModalOpen(false)}>
                Cancelar
              </Button>
              {!isExporting && (
                <Button onClick={handleExportReport} variant="pink">
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Financeiro;