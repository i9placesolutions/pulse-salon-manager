
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PerformanceMetrics } from "@/components/profissionais/PerformanceMetrics";
import { AppointmentHistory } from "@/components/profissionais/AppointmentHistory";
import { CommissionManagement } from "@/components/profissionais/CommissionManagement";
import { 
  Professional, 
  ProfessionalPerformance, 
  ProfessionalAppointment, 
  ProfessionalCommission 
} from "@/types/professional";

interface DashboardTabsProps {
  professional: Professional;
  performance: ProfessionalPerformance;
  appointments: ProfessionalAppointment[];
  commissions: ProfessionalCommission[];
}

export function DashboardTabs({
  professional,
  performance,
  appointments,
  commissions
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue="performance" className="space-y-4">
      <TabsList>
        <TabsTrigger value="performance">Desempenho</TabsTrigger>
        <TabsTrigger value="appointments">Atendimentos</TabsTrigger>
        <TabsTrigger value="commissions">
          {professional.paymentModel === 'fixed' ? 'Pagamentos' : 'Comissões'}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="performance">
        <PerformanceMetrics performance={performance} />
      </TabsContent>

      <TabsContent value="appointments">
        <AppointmentHistory appointments={appointments} />
      </TabsContent>

      <TabsContent value="commissions">
        <CommissionManagement commissions={commissions} />
      </TabsContent>
    </Tabs>
  );
}
