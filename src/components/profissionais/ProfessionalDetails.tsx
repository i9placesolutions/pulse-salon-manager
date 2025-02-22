
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Professional, 
  ProfessionalAppointment, 
  ProfessionalCommission,
  ProfessionalPayment,
  ProfessionalPerformance,
  WorkingHours,
  BlockedDate
} from "@/types/professional";
import { AppointmentHistory } from "./AppointmentHistory";
import { CommissionManagement } from "./CommissionManagement";
import { PaymentManagement } from "./PaymentManagement";
import { PerformanceMetrics } from "./PerformanceMetrics";
import { WorkingHoursForm } from "./WorkingHoursForm";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";

interface ProfessionalDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professional: Professional;
  appointments: ProfessionalAppointment[];
  commissions: ProfessionalCommission[];
  payments: ProfessionalPayment[];
  performance: ProfessionalPerformance;
}

export const ProfessionalDetails = ({
  open,
  onOpenChange,
  professional,
  appointments,
  commissions,
  payments,
  performance,
}: ProfessionalDetailsProps) => {
  const { toast } = useToast();

  const handleRegisterPayment = (payment: ProfessionalPayment) => {
    toast({
      title: "Pagamento registrado",
      description: "O pagamento foi registrado com sucesso!",
    });
  };

  const handleSaveWorkingHours = (
    workingHours: WorkingHours,
    blockedDates: BlockedDate[]
  ) => {
    toast({
      title: "Horários atualizados",
      description: "Os horários foram atualizados com sucesso!",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <Tabs defaultValue="overview" className="w-full space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="schedule">Horários</TabsTrigger>
            <TabsTrigger value="appointments">Atendimentos</TabsTrigger>
            <TabsTrigger value="commissions">Comissões</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="performance">Desempenho</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Nome:</strong> {professional.name}</p>
                  <p><strong>Email:</strong> {professional.email}</p>
                  <p><strong>Telefone:</strong> {professional.phone}</p>
                  <p><strong>Especialidade:</strong> {professional.specialty}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informações de Contrato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Data de Contratação:</strong> {professional.hiringDate}</p>
                  <p><strong>Nível de Experiência:</strong> {professional.experienceLevel}</p>
                  <p><strong>Status:</strong> {professional.status}</p>
                  <p><strong>Comissão Total:</strong> {formatCurrency(professional.totalCommission)}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule">
            <WorkingHoursForm
              open={true}
              onOpenChange={() => {}}
              workingHours={professional.workingHours}
              blockedDates={professional.blockedDates}
              onSave={handleSaveWorkingHours}
            />
          </TabsContent>

          <TabsContent value="appointments">
            <AppointmentHistory appointments={appointments} />
          </TabsContent>

          <TabsContent value="commissions">
            <CommissionManagement commissions={commissions} />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentManagement
              payments={payments}
              onRegisterPayment={handleRegisterPayment}
            />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceMetrics performance={performance} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
