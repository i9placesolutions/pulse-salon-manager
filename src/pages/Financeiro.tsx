
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, WhatsappIcon } from "lucide-react";
import { SummaryCards } from "@/components/financeiro/SummaryCards";
import { RevenueChart } from "@/components/financeiro/RevenueChart";
import { PaymentsList } from "@/components/financeiro/PaymentsList";
import { ProfessionalsList } from "@/components/financeiro/ProfessionalsList";
import { AccountsReceivable } from "@/components/financeiro/AccountsReceivable";
import { ExpensesList } from "@/components/financeiro/ExpensesList";
import { Payment, Professional, RevenueData, AccountReceivable, Expense } from "@/types/financial";
import { useToast } from "@/hooks/use-toast";

// Mock data - Replace with real data from your backend
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
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-neutral">Gestão Financeira</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleWhatsApp()}>
            <WhatsappIcon className="mr-2 h-4 w-4" />
            Enviar Cobranças
          </Button>
          <Button onClick={() => handleExport()}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      <SummaryCards />
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="receivables">Contas a Receber</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
          <TabsTrigger value="commissions">Comissões</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <RevenueChart data={revenueData} period={period} setPeriod={setPeriod} />
          <PaymentsList payments={payments} />
        </TabsContent>

        <TabsContent value="receivables" className="space-y-4">
          <AccountsReceivable accounts={accountsReceivable} onWhatsApp={handleWhatsApp} />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <ExpensesList expenses={expenses} />
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <ProfessionalsList professionals={professionals} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financeiro;
