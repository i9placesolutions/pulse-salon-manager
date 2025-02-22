import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, MessageSquare } from "lucide-react";
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

const Financeiro = () => {
  const [period, setPeriod] = useState("daily");
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: "Exportando relatório",
      description: "O relatório será gerado em breve.",
    });
  };

  const handleWhatsApp = () => {
    toast({
      title: "Enviando cobrança",
      description: "A mensagem será enviada em breve.",
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-neutral">Gestão Financeira</h1>
        <div className="flex flex-wrap gap-2">
          <NewRevenueDialog />
          <NewExpenseDialog />
          <Button variant="outline" onClick={handleWhatsApp}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Enviar Cobranças
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      <SummaryCards />
      
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
            <RevenueChart data={revenueData} period={period} setPeriod={setPeriod} />
            <PaymentsList payments={payments} />
          </div>
        </TabsContent>

        <TabsContent value="cashflow">
          <CashFlowPanel data={cashFlowData} />
        </TabsContent>

        <TabsContent value="receivables">
          <AccountsReceivable accounts={accountsReceivable} onWhatsApp={handleWhatsApp} />
        </TabsContent>

        <TabsContent value="expenses">
          <div className="space-y-4">
            <ExpensesList expenses={expenses} />
            <CostControlPanel expenses={expenses} />
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
