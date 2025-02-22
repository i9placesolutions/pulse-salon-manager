import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, DollarSign, ChartBar, Lock, Unlock } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { WorkingHoursForm } from "@/components/profissionais/WorkingHoursForm";
import { AppointmentHistory } from "@/components/profissionais/AppointmentHistory";
import { PerformanceMetrics } from "@/components/profissionais/PerformanceMetrics";
import { CommissionManagement } from "@/components/profissionais/CommissionManagement";
import { Professional, ProfessionalCommission } from "@/types/professional";

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

  const handleToggleAgenda = () => {
    setAgendaOpen(!agendaOpen);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral">Dashboard do Profissional</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie sua agenda, comissões e desempenho
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={agendaOpen ? "destructive" : "default"}
            onClick={handleToggleAgenda}
          >
            {agendaOpen ? (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Fechar Agenda
              </>
            ) : (
              <>
                <Unlock className="mr-2 h-4 w-4" />
                Abrir Agenda
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => setIsWorkingHoursOpen(true)}>
            <Clock className="mr-2 h-4 w-4" />
            Gerenciar Horários
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Atendimentos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPerformance.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              +20% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {mockProfessional.paymentModel === 'fixed' ? 'Salário Fixo' : 'Comissões do Mês'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mockProfessional.paymentModel === 'fixed' 
                ? mockProfessional.fixedSalary || 0 
                : 3500)}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockProfessional.paymentModel === 'fixed' 
                ? 'Salário base mensal'
                : '+15% em relação ao mês anterior'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próximos Atendimentos
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Agendamentos para hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Retorno
            </CardTitle>
            <ChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(mockPerformance.clientReturnRate * 100)}%</div>
            <p className="text-xs text-muted-foreground">
              Clientes que retornam
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Desempenho</TabsTrigger>
          <TabsTrigger value="appointments">Atendimentos</TabsTrigger>
          <TabsTrigger value="commissions">
            {mockProfessional.paymentModel === 'fixed' ? 'Pagamentos' : 'Comissões'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <PerformanceMetrics performance={mockPerformance} />
        </TabsContent>

        <TabsContent value="appointments">
          <AppointmentHistory appointments={mockAppointments} />
        </TabsContent>

        <TabsContent value="commissions">
          <CommissionManagement commissions={mockCommissions} />
        </TabsContent>
      </Tabs>

      <WorkingHoursForm
        open={isWorkingHoursOpen}
        onOpenChange={setIsWorkingHoursOpen}
        onSave={(workingHours, blockedDates) => {
          console.log("Horários salvos:", workingHours);
          console.log("Datas bloqueadas:", blockedDates);
          setIsWorkingHoursOpen(false);
        }}
      />
    </div>
  );
}
