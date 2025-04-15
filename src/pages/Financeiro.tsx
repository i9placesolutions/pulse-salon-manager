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
import { useFinancialManagement } from "@/hooks/useFinancialManagement";
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
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";

const Financeiro = () => {
  const {
    payments,
    professionals,
    revenueData,
    accountsReceivable,
    expenses,
    cashFlow,
    taxRecords,
    paymentMethodConfigs,
    isLoading,
    updateCashFlow,
    updateAccountReceivableStatus,
    updateExpenseStatus,
    addPayment,
    addExpense,
    addCashFlowItem,
    updateTaxStatus
  } = useFinancialManagement();
  const [view, setView] = useState<"week" | "month" | "year">("month");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [cashFlowState, setCashFlowState] = useState<CashFlow[]>(cashFlow);
  const [expensesState, setExpensesState] = useState<Expense[]>(expenses);
  const [accountsReceivableState, setAccountsReceivableState] = useState<AccountReceivable[]>(accountsReceivable);
  const { toast } = useToast();
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf" | "csv">("excel");
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
            description: `O relatório foi exportado no formato ${exportFormat === 'excel' ? 'Excel' : exportFormat === 'pdf' ? 'PDF' : 'CSV'}.`,
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
    updateCashFlow(newData);
    toast({
      title: "Fluxo de caixa atualizado",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  // Função para marcar um item como pago/recebido
  const handleMarkItemAsPaid = async (type: 'expense' | 'account', id: number) => {
    try {
      if (type === 'expense') {
        await updateExpenseStatus(id, 'Pago');
        toast({
          title: "Despesa paga",
          description: "A despesa foi marcada como paga com sucesso.",
        });
      } else {
        await updateAccountReceivableStatus(id, 'Pago');
        toast({
          title: "Conta recebida",
          description: "A conta foi marcada como recebida com sucesso.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar a operação.",
        variant: "destructive"
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
    <PageLayout variant="blue">
      <PageHeader 
        title="Financeiro" 
        subtitle="Controle de receitas, despesas e fluxo de caixa"
        variant="blue"
        badge="Finanças"
        action={
          <div className="flex space-x-2">
            <Button 
              variant="dashboard-outline"
              onClick={() => setExportModalOpen(true)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Relatórios
            </Button>
            <NewRevenueDialog />
            <NewExpenseDialog />
          </div>
        }
      />

      {/* SummaryCards movido para o topo, fora das abas */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-blue-700">Visão Geral Financeira</h2>
        </div>
        
        <SummaryCards 
          payments={payments} 
          expenses={expensesState} 
          professionals={professionals} 
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex w-full h-10 bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
          <TabsTrigger 
            value="overview" 
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
          >
            <Eye className="h-4 w-4" />
            <span className="font-medium">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger 
            value="revenues" 
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
          >
            <FileUp className="h-4 w-4" />
            <span className="font-medium">Receitas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="expenses"
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
          >
            <FileText className="h-4 w-4" />
            <span className="font-medium">Despesas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="taxes"
            className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all duration-200 rounded-lg"
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
                {/* Componente FinancialAlerts removido conforme existente */}
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
                  <Progress value={exportProgress} className="h-2 bg-blue-100" />
                  <p className="text-center mt-4 text-sm text-blue-700">
                    Preparando relatório... {exportProgress}%
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <Tabs value={reportTabActive} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                    <TabsTrigger 
                      value="filters" 
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      Filtros
                    </TabsTrigger>
                    <TabsTrigger 
                      value="format" 
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Formato
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="filters" className="p-4 border border-blue-100 rounded-md mt-4 bg-blue-50/50">
                    <div className="space-y-6">
                      {/* Tipo de relatório */}
                      <div className="space-y-2">
                        <h3 className="font-medium text-blue-700">Tipo de Relatório</h3>
                        <RadioGroup 
                          defaultValue="cashflow" 
                          value={reportType} 
                          onValueChange={(value) => setReportType(value as ReportType)}
                          className="grid gap-4 md:grid-cols-2"
                        >
                          <div className={`flex items-start gap-3 border rounded-md p-4 cursor-pointer hover:border-blue-400 ${reportType === 'cashflow' ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
                            <RadioGroupItem value="cashflow" id="report-cashflow" className="mt-1" />
                            <div>
                              <Label htmlFor="report-cashflow" className="font-medium text-blue-700">Fluxo de Caixa</Label>
                              <p className="text-xs text-blue-600/70">Entradas e saídas de caixa no período</p>
                            </div>
                          </div>
                          <div className={`flex items-start gap-3 border rounded-md p-4 cursor-pointer hover:border-blue-400 ${reportType === 'expense' ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
                            <RadioGroupItem value="expense" id="report-expense" className="mt-1" />
                            <div>
                              <Label htmlFor="report-expense" className="font-medium text-blue-700">Despesas</Label>
                              <p className="text-xs text-blue-600/70">Detalhamento das despesas no período</p>
                            </div>
                          </div>
                          <div className={`flex items-start gap-3 border rounded-md p-4 cursor-pointer hover:border-blue-400 ${reportType === 'revenue' ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
                            <RadioGroupItem value="revenue" id="report-revenue" className="mt-1" />
                            <div>
                              <Label htmlFor="report-revenue" className="font-medium text-blue-700">Receitas</Label>
                              <p className="text-xs text-blue-600/70">Detalhamento das receitas no período</p>
                            </div>
                          </div>
                          <div className={`flex items-start gap-3 border rounded-md p-4 cursor-pointer hover:border-blue-400 ${reportType === 'full' ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
                            <RadioGroupItem value="full" id="report-full" className="mt-1" />
                            <div>
                              <Label htmlFor="report-full" className="font-medium text-blue-700">Relatório Completo</Label>
                              <p className="text-xs text-blue-600/70">Visão completa das finanças</p>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      {/* Período */}
                      <div className="space-y-2">
                        <h3 className="font-medium text-blue-700">Período</h3>
                        <div className="space-y-4">
                          <Select 
                            value={selectedPeriod} 
                            onValueChange={setSelectedPeriod}
                          >
                            <SelectTrigger className="w-full border-blue-200">
                              <SelectValue placeholder="Selecione um período" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="current-month">Mês atual</SelectItem>
                              <SelectItem value="last-month">Mês anterior</SelectItem>
                              <SelectItem value="last-3-months">Últimos 3 meses</SelectItem>
                              <SelectItem value="year-to-date">Ano até o momento</SelectItem>
                              <SelectItem value="custom">Período personalizado</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {selectedPeriod === "custom" && (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm text-blue-700">Data Inicial</Label>
                                <Input 
                                  type="date"
                                  value={dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                                  onChange={(e) => handleDateChange('from', e.target.value)}
                                  className="border-blue-200"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm text-blue-700">Data Final</Label>
                                <Input 
                                  type="date"
                                  value={dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                                  onChange={(e) => handleDateChange('to', e.target.value)}
                                  className="border-blue-200"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={handleNextTab}
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Próximo
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="format" className="p-4 border border-blue-100 rounded-md mt-4 bg-blue-50/50">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="font-medium text-blue-700">Formato de Saída</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div 
                            className={`border rounded-md p-3 cursor-pointer ${exportFormat === 'excel' ? 'bg-blue-100 border-blue-300' : 'bg-white border-blue-100'}`}
                            onClick={() => setExportFormat('excel')}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <FileSpreadsheet className="h-8 w-8 text-green-600" />
                              <span className="text-sm text-blue-700">Excel</span>
                            </div>
                          </div>
                          <div 
                            className={`border rounded-md p-3 cursor-pointer ${exportFormat === 'csv' ? 'bg-blue-100 border-blue-300' : 'bg-white border-blue-100'}`}
                            onClick={() => setExportFormat('csv')}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <FileText className="h-8 w-8 text-amber-600" />
                              <span className="text-sm text-blue-700">CSV</span>
                            </div>
                          </div>
                          <div 
                            className={`border rounded-md p-3 cursor-pointer ${exportFormat === 'pdf' ? 'bg-blue-100 border-blue-300' : 'bg-white border-blue-100'}`}
                            onClick={() => setExportFormat('pdf')}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <FileText className="h-8 w-8 text-red-600" />
                              <span className="text-sm text-blue-700">PDF</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setReportTabActive('filters')}
                        className="gap-2 border-blue-200 text-blue-700"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Voltar
                      </Button>
                      
                      <Button
                        onClick={handleExportReport}
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Exportar
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
};

export default Financeiro;