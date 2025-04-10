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
import { BarChart3, Calendar, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <Tabs defaultValue="performance" className="w-full">
      <TabsList className="w-full max-w-md grid grid-cols-3 mb-6 p-1 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border border-blue-100 shadow-sm">
        <TabsTrigger 
          value="performance" 
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md flex gap-2 items-center justify-center data-[state=active]:border-none transition-all"
        >
          <BarChart3 className="h-4 w-4" />
          <span>Desempenho</span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="appointments"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md flex gap-2 items-center justify-center data-[state=active]:border-none transition-all"
        >
          <Calendar className="h-4 w-4" />
          <span>Atendimentos</span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="commissions"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md flex gap-2 items-center justify-center data-[state=active]:border-none transition-all"
        >
          <DollarSign className="h-4 w-4" />
          <span>
            {professional.paymentModel === 'fixed' ? 'Pagamentos' : 'Comissões'}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="performance" className="mt-0 animate-in slide-in-from-left-4 duration-300 transition-all">
        <PerformanceMetrics performance={performance} />
      </TabsContent>

      <TabsContent value="appointments" className="mt-0 animate-in slide-in-from-left-4 duration-300 transition-all">
        <AppointmentHistory appointments={appointments} />
      </TabsContent>

      <TabsContent value="commissions" className="mt-0 animate-in slide-in-from-left-4 duration-300 transition-all">
        <CommissionManagement commissions={commissions} />
      </TabsContent>
    </Tabs>
  );
}
