
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Lock, 
  Bell, 
  History, 
  Scissors, 
  Calendar,
  AlertTriangle 
} from "lucide-react";

// Importando os componentes do perfil do profissional
import { Professional } from "@/types/professional";
import { ProfessionalInfo } from "@/components/profissionais/profile/PersonalInfo";
import { SecuritySettings } from "@/components/profissionais/profile/SecuritySettings";
import { NotificationPreferences } from "@/components/profissionais/profile/NotificationPreferences";
import { ActivityHistory } from "@/components/profissionais/profile/ActivityHistory";
import { DangerZone } from "@/components/profissionais/profile/DangerZone";
import { WorkingHoursForm } from "@/components/profissionais/working-hours/WorkingHoursForm";

export default function Profile() {
  return (
    <div>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral">Meu Perfil Profissional</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie suas informações pessoais e preferências
            </p>
          </div>
        </div>

        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="personal">
              <User className="h-4 w-4 mr-2" />
              Dados Pessoais
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="h-4 w-4 mr-2" />
              Horários
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="activity">
              <History className="h-4 w-4 mr-2" />
              Atividades
            </TabsTrigger>
            <TabsTrigger value="danger">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Zona de Perigo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <ProfessionalInfo />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="schedule">
            <WorkingHoursForm 
              open={true}
              onOpenChange={() => {}}
              workingHours={{
                monday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
                tuesday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
                wednesday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
                thursday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
                friday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
                saturday: { isWorking: true, startTime: "09:00", endTime: "13:00" },
                sunday: { isWorking: false }
              }}
              onSave={() => {}}
            />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationPreferences />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityHistory />
          </TabsContent>

          <TabsContent value="danger">
            <DangerZone />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
