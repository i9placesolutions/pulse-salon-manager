
import { useState } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { ProfessionalHeader } from "@/components/profissionais/dashboard/ProfessionalHeader";
import { DashboardHeader } from "@/components/profissionais/dashboard/DashboardHeader";
import { MetricsCards } from "@/components/profissionais/dashboard/MetricsCards";
import { DashboardTabs } from "@/components/profissionais/dashboard/DashboardTabs";
import { WorkingHoursManager } from "@/components/profissionais/dashboard/WorkingHoursManager";
import { 
  mockProfessional,
  mockPerformance,
  mockAppointments,
  mockCommissions
} from "@/components/profissionais/dashboard/MockData";

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

      <WorkingHoursManager
        isOpen={isWorkingHoursOpen}
        onOpenChange={setIsWorkingHoursOpen}
      />
    </PageLayout>
  );
}
