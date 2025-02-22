
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfessionalHeader } from "@/components/profissionais/dashboard/ProfessionalHeader";
import { PersonalInfo } from "@/components/profissionais/profile/PersonalInfo";
import { SecuritySettings } from "@/components/profissionais/profile/SecuritySettings";
import { NotificationPreferences } from "@/components/profissionais/profile/NotificationPreferences";
import { ActivityHistory } from "@/components/profissionais/profile/ActivityHistory";
import { DangerZone } from "@/components/profissionais/profile/DangerZone";
import { User, Lock, Bell, History } from "lucide-react";

export default function Profile() {
  return (
    <div>
      <ProfessionalHeader />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral">Meu Perfil</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>

        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="personal">
              <User className="h-4 w-4 mr-2" />
              Dados Pessoais
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="activity">
              <History className="h-4 w-4 mr-2" />
              Atividades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <PersonalInfo />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationPreferences />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityHistory />
          </TabsContent>
        </Tabs>

        <DangerZone />
      </div>
    </div>
  );
}
