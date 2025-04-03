import { useState } from "react";
import { WorkingHoursForm } from "@/components/profissionais/WorkingHoursForm";
import { DashboardHeader } from "@/components/profissionais/dashboard/DashboardHeader";
import { MetricsCards } from "@/components/profissionais/dashboard/MetricsCards";
import { DashboardTabs } from "@/components/profissionais/dashboard/DashboardTabs";
import { ProfessionalHeader } from "@/components/profissionais/dashboard/ProfessionalHeader";
import { PageLayout } from "@/components/shared/PageLayout";
import { Professional, ProfessionalCommission, ProfessionalAppointment } from "@/types/professional";

// Mock data para teste
const mockProfessional: Professional = {
  id: "1",
  name: "João Silva",
  email: "joao@example.com",
  phone: "(11) 99999-9999",
  specialty: "Cabelereiro",
  specialties: [{ id: "1", name: "Cabelereiro", color: "#1e40af", isActive: true }],
  hiringDate: "2024-01-01",
  experienceLevel: "expert",
  status: "active",
  totalAppointments: 150,
  totalCommission: 5000,
  averageMonthlyRevenue: 8000,
  paymentModel: "commission",
  commissionRate: 50
};

const mockPerformance = {
  totalAppointments: 45,
  topServices: [
    { serviceName: "Corte", count: 20 },
    { serviceName: "Barba", count: 15 },
    { serviceName: "Coloração", count: 10 }
  ],
  monthlyRevenue: [
    { month: "Jan", revenue: 2500 },
    { month: "Fev", revenue: 2800 },
    { month: "Mar", revenue: 3200 }
  ],
  rating: 4.8,
  clientReturnRate: 0.75,
  newClientsPerMonth: 10,
  scheduleOccupancy: 0.8,
  quoteConversionRate: 0.6,
  additionalSalesRate: 0.25
};

const mockCommissions: ProfessionalCommission[] = [
  {
    id: 1,
    paymentDate: "2024-03-01",
    value: 250,
    referenceType: "service",
    referenceName: "Corte + Barba",
    status: "paid"
  },
  {
    id: 2,
    paymentDate: "2024-03-05",
    value: 180,
    referenceType: "service",
    referenceName: "Coloração",
    status: "pending"
  }
];

const mockAppointments: ProfessionalAppointment[] = [
  {
    id: 1,
    date: "2024-03-07",
    clientName: "João Silva",
    serviceName: "Corte + Barba",
    value: 80,
    commission: 40,
    notes: "Cliente prefere corte mais curto",
    status: "confirmed"
  },
  {
    id: 2,
    date: "2024-03-07",
    clientName: "Maria Santos",
    serviceName: "Coloração",
    value: 150,
    commission: 75,
    status: "pending"
  }
];

export default function ProfissionalDashboard() {
  const [isWorkingHoursOpen, setIsWorkingHoursOpen] = useState(false);
  const [agendaOpen, setAgendaOpen] = useState(true);

  const handleToggleAgenda = () => {
    setAgendaOpen(!agendaOpen);
  };

  return (
    <PageLayout variant="blue">
      <ProfessionalHeader />
      <DashboardHeader
        agendaOpen={agendaOpen}
        onToggleAgenda={handleToggleAgenda}
        onManageHours={() => setIsWorkingHoursOpen(true)}
      />

      <MetricsCards 
        professional={mockProfessional}
        performance={mockPerformance}
      />

      <div className="bg-white p-6 rounded-lg shadow border border-blue-100">
        <DashboardTabs
          professional={mockProfessional}
          performance={mockPerformance}
          appointments={mockAppointments}
          commissions={mockCommissions}
        />
      </div>

      <WorkingHoursForm
        open={isWorkingHoursOpen}
        onOpenChange={setIsWorkingHoursOpen}
        onSave={(workingHours, blockedDates) => {
          console.log("Horários salvos:", workingHours);
          console.log("Datas bloqueadas:", blockedDates);
          setIsWorkingHoursOpen(false);
        }}
      />
    </PageLayout>
  );
}
