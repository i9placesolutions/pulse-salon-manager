
import { useState } from "react";
import { WorkingHoursForm } from "@/components/profissionais/WorkingHoursForm";
import { DashboardHeader } from "@/components/profissionais/dashboard/DashboardHeader";
import { MetricsCards } from "@/components/profissionais/dashboard/MetricsCards";
import { DashboardTabs } from "@/components/profissionais/dashboard/DashboardTabs";
import { ProfessionalHeader } from "@/components/profissionais/dashboard/ProfessionalHeader";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { Professional, ProfessionalCommission, ProfessionalAppointment } from "@/types/professional";

// Mock data para teste
const mockProfessional: Professional = {
  id: 1,
  name: "João Silva",
  email: "joao@example.com",
  phone: "(11) 99999-9999",
  specialty: "Cabelereiro",
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
  clientReturnRate: 0.75
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
  const navigate = useNavigate();

  const handleToggleAgenda = () => {
    setAgendaOpen(!agendaOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfessionalHeader />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <DashboardHeader
              agendaOpen={agendaOpen}
              onToggleAgenda={handleToggleAgenda}
              onManageHours={() => setIsWorkingHoursOpen(true)}
            />
            <Button
              variant="outline"
              onClick={() => navigate("/profissional-profile")}
              className="flex items-center gap-2 hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <User className="h-4 w-4" />
              Meu Perfil
            </Button>
          </div>

          <MetricsCards 
            professional={mockProfessional}
            performance={mockPerformance}
          />

          <div className="bg-white p-6 rounded-lg shadow">
            <DashboardTabs
              professional={mockProfessional}
              performance={mockPerformance}
              appointments={mockAppointments}
              commissions={mockCommissions}
            />
          </div>
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
      </main>
    </div>
  );
}
