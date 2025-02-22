
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { SummaryCards } from "@/components/financeiro/SummaryCards";
import { RevenueChart } from "@/components/financeiro/RevenueChart";
import { PaymentsList } from "@/components/financeiro/PaymentsList";
import { ProfessionalsList } from "@/components/financeiro/ProfessionalsList";
import { Payment, Professional, RevenueData } from "@/types/financial";

// Mock data - Replace with real data from your backend
const revenueData: RevenueData[] = [
  { date: "01/03", revenue: 1200 },
  { date: "02/03", revenue: 1800 },
  { date: "03/03", revenue: 1400 },
  { date: "04/03", revenue: 2200 },
  { date: "05/03", revenue: 1600 },
  { date: "06/03", revenue: 2400 },
  { date: "07/03", revenue: 2800 },
];

const payments: Payment[] = [
  { id: 1, client: "João Silva", service: "Corte + Barba", value: 80, method: "Pix", date: "2024-03-07" },
  { id: 2, client: "Maria Santos", service: "Hidratação", value: 150, method: "Cartão", date: "2024-03-07" },
  { id: 3, client: "Pedro Costa", service: "Corte", value: 50, method: "Dinheiro", date: "2024-03-06" },
];

const professionals: Professional[] = [
  { id: 1, name: "Ana Silva", commission: 1200, services: 24 },
  { id: 2, name: "Carlos Santos", commission: 980, services: 18 },
  { id: 3, name: "Maria Oliveira", commission: 1450, services: 29 },
];

const Financeiro = () => {
  const [period, setPeriod] = useState("daily");

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-neutral">Gestão Financeira</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      <SummaryCards />
      <RevenueChart data={revenueData} period={period} setPeriod={setPeriod} />

      <div className="grid gap-4 md:grid-cols-2">
        <PaymentsList payments={payments} />
        <ProfessionalsList professionals={professionals} />
      </div>
    </div>
  );
};

export default Financeiro;
