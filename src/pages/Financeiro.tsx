import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageLayout } from "@/components/shared/PageLayout";
import { SummaryCards } from "@/components/financeiro/SummaryCards";
import { ExpensesList } from "@/components/financeiro/ExpensesList";
import { RevenueChart } from "@/components/financeiro/RevenueChart";
import { PaymentsList } from "@/components/financeiro/PaymentsList";
import { Expense, AccountReceivable, Alert } from "@/types/financial";
import { CostControlPanel } from "@/components/financeiro/CostControlPanel";
import { TaxManagementPanel } from "@/components/financeiro/TaxManagementPanel";
import { FinancialAlerts } from "@/components/financeiro/FinancialAlerts";
import { CashFlowPanel } from "@/components/financeiro/CashFlowPanel";
import { PaymentMethodsPanel } from "@/components/financeiro/PaymentMethodsPanel";
import { ProfessionalsList } from "@/components/financeiro/ProfessionalsList";
import { FinancialProjections } from "@/components/financeiro/FinancialProjections";
import { AccountsReceivable } from "@/components/financeiro/AccountsReceivable";
import { Button } from "@/components/ui/button";
import { 
  Payment, 
  Professional,
  RevenueData,
  CommissionConfig,
  CashFlow,
  TaxRecord,
  PaymentMethodConfig
} from "@/types/financial";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Eye,
  FileUp,
  FileText,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Filter,
  Settings,
  X,
  Download
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { NewRevenueDialog } from "@/components/financeiro/NewRevenueDialog";
import { NewExpenseDialog } from "@/components/financeiro/NewExpenseDialog";

export default function Financeiro() {
  const mockRevenueData: RevenueData[] = [
    {
      date: "2023-01",
      income: 12500,
      expenses: 7800,
      balance: 4700,
      revenue: 12500
    },
    {
      date: "2023-02",
      income: 13800,
      expenses: 8200,
      balance: 5600,
      revenue: 13800
    },
    {
      date: "2023-03",
      income: 15200,
      expenses: 9000,
      balance: 6200,
      revenue: 15200
    },
    {
      date: "2023-04",
      income: 14300,
      expenses: 8500,
      balance: 5800,
      revenue: 14300
    },
    {
      date: "2023-05",
      income: 16800,
      expenses: 9200,
      balance: 7600,
      revenue: 16800
    },
    {
      date: "2023-06",
      income: 18500,
      expenses: 10200,
      balance: 8300,
      revenue: 18500
    },
    {
      date: "2023-07",
      income: 17900,
      expenses: 9800,
      balance: 8100,
      revenue: 17900
    },
  ];

  const mockPayments: Payment[] = [
    { id: 1, date: "2023-07-28", value: 120, client: "Maria Silva", method: "Cartão", status: "completed", service: "Corte Feminino" },
    { id: 2, date: "2023-07-27", value: 180, client: "João Santos", method: "Pix", status: "completed", service: "Barba e Cabelo" },
    { id: 3, date: "2023-07-25", value: 250, client: "Ana Oliveira", method: "Dinheiro", status: "completed", service: "Coloração" },
  ];

  const mockProfessionals: Professional[] = [
    { id: 1, name: "Ana Silva", role: "Cabeleireira", commission: 50, commissionType: "percentage", status: "active", services: ["Corte Feminino", "Coloração"] },
    { id: 2, name: "Pedro Souza", role: "Barbeiro", commission: 50, commissionType: "percentage", status: "active", services: ["Barba", "Corte Masculino"] },
    { id: 3, name: "Carla Santos", role: "Manicure", commission: 60, commissionType: "percentage", status: "inactive", services: ["Manicure", "Pedicure", "Unhas de Gel"] },
  ];

  const mockCashFlow: CashFlow[] = [
    {
      id: 1,
      date: "2023-07-28",
      type: "income",
      category: "Serviços",
      description: "Pagamento de serviços do dia",
      value: 850,
      status: "realizado",
      paymentMethod: "Diversos",
    },
    {
      id: 2,
      date: "2023-07-27",
      type: "expense",
      category: "Produtos",
      description: "Compra de produtos de cabelo",
      value: 320,
      status: "realizado",
      paymentMethod: "Transferência",
      isRecurring: false,
    },
    {
      id: 3,
      date: "2023-07-25",
      type: "income",
      category: "Produtos",
      description: "Venda de produtos para cliente",
      value: 180,
      status: "realizado",
      paymentMethod: "Pix",
    },
    {
      id: 4,
      date: "2023-08-05",
      type: "expense",
      category: "Aluguel",
      description: "Pagamento de aluguel",
      value: 1500,
      status: "previsto",
      paymentMethod: "Transferência",
      isRecurring: true,
    },
    {
      id: 5,
      date: "2023-08-10",
      type: "expense",
      category: "Salários",
      description: "Pagamento de salários",
      value: 3200,
      status: "previsto",
      paymentMethod: "Transferência",
      isRecurring: true,
    },
  ];

  const mockTaxes: TaxRecord[] = [
    {
      id: 1,
      name: "Simples Nacional",
      description: "Pagamento mensal do Simples Nacional",
      value: 720,
      dueDate: "2023-08-20",
      status: "pending",
      type: "federal",
      baseValue: 18000,
      rate: 4,
    },
    {
      id: 2,
      name: "ISS",
      description: "Imposto sobre Serviços",
      value: 450,
      dueDate: "2023-08-15",
      status: "pending",
      type: "municipal",
      baseValue: 15000,
      rate: 3,
    },
  ];

  const mockPaymentMethods: PaymentMethodConfig[] = [
    {
      id: 1,
      name: "Cartão de Crédito",
      description: "Pagamento com cartão de crédito",
      fee: 2.5,
      isActive: true,
      processingTime: 30,
      type: "card",
      enabled: true,
      cardBrands: ["Visa", "Mastercard", "Elo", "American Express"],
    },
    {
      id: 2,
      name: "Pix",
      description: "Pagamento instantâneo",
      fee: 0,
      isActive: true,
      processingTime: 0,
      type: "pix",
      enabled: true,
      pixKeys: ["CNPJ", "Email", "Telefone"],
    },
  ];

  const [revenueData, setRevenueData] = useState<RevenueData[]>(mockRevenueData);
  const [view, setView] = useState<'month' | 'week' | 'year'>('month');
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [professionals, setProfessionals] = useState<Professional[]>(mockProfessionals);
  const [cashFlowState, setCashFlowState] = useState<CashFlow[]>(mockCashFlow);
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>(mockTaxes);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(mockPaymentMethods);
  const [expensesState, setExpensesState] = useState<Expense[]>([
    { id: 1, name: "Aluguel", value: 2500, date: "2023-07-05", status: "paid", category: "Operacional" },
    { id: 2, name: "Água", value: 150, date: "2023-07-10", status: "pending", category: "Utilidades" },
    { id: 3, name: "Luz", value: 320, date: "2023-07-15", status: "pending", category: "Utilidades" },
    { id: 4, name: "Internet", value: 180, date: "2023-07-08", status: "paid", category: "Tecnologia" },
  ]);
  const [accountsReceivableState, setAccountsReceivableState] = useState<AccountReceivable[]>([
    { id: 1, client: "Maria Silva", value: 250, dueDate: "2023-08-05", status: "pending", description: "Coloração e Corte" },
    { id: 2, client: "João Santos", value: 120, dueDate: "2023-08-12", status: "pending", description: "Barba e Cabelo" },
    { id: 3, client: "Ana Oliveira", value: 180, dueDate: "2023-07-25", status: "overdue", description: "Tratamento Capilar" },
  ]);

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [reportTabActive, setReportTabActive] = useState('filters');
  const [reportType, setReportType] = useState<'cashflow' | 'expense' | 'revenue' | 'full'>('cashflow');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: new Date(),
    to: new Date(),
  });

  const handleUpdateCashFlow = (newCashFlow: CashFlow[]) => {
    setCashFlowState(newCashFlow);
  };

  const handleTabChange = (tab: string) => {
    setReportTabActive(tab);
  };

  const handleNextTab = () => {
    setReportTabActive('format');
  };

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value ? new Date(value) : null
    }));
  };

  const handleExportReport = () => {
    setIsExporting(true);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setExportProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsExporting(false);
        setExportModalOpen(false);
      }
    }, 300);
  };

  return (
    <PageLayout>
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
                  const newEntry = {
                    ...entry,
                    id: cashFlowState.length > 0 
                      ? Math.max(...cashFlowState.map(item => typeof item.id === 'number' ? item.id : 0)) + 1 
                      : 1
                  };
                  handleUpdateCashFlow([...cashFlowState, newEntry]);
                }} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="col-span-12">
                <FinancialAlerts 
                  expenses={expensesState}
                  accountsReceivable={accountsReceivableState}
                />
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
                const newEntry = {
                  ...entry,
                  id: cashFlowState.length > 0 
                    ? Math.max(...cashFlowState.map(item => typeof item.id === 'number' ? item.id : 0)) + 1 
                    : 1
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

      <Sheet open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <SheetContent side="right" className="p-0 w-full max-w-full sm:max-w-2xl border-l flex flex-col h-[100dvh] bg-white">
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
                      <div className="space-y-2">
                        <h3 className="font-medium text-blue-700">Tipo de Relatório</h3>
                        <RadioGroup 
                          defaultValue="cashflow" 
                          value={reportType} 
                          onValueChange={(value) => setReportType(value as typeof reportType)}
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
}
