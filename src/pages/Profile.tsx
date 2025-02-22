
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProfessionalHeader } from "@/components/profissionais/dashboard/ProfessionalHeader";
import { PersonalInfo } from "@/components/profissionais/profile/PersonalInfo";
import { SecuritySettings } from "@/components/profissionais/profile/SecuritySettings";
import { NotificationPreferences } from "@/components/profissionais/profile/NotificationPreferences";
import { ActivityHistory } from "@/components/profissionais/profile/ActivityHistory";
import { DangerZone } from "@/components/profissionais/profile/DangerZone";
import { User, Lock, Bell, History, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  return (
    <div>
      <ProfessionalHeader />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => navigate("/profissional-dashboard")}
                className="hover:bg-secondary/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </div>
            <h1 className="text-2xl font-semibold text-neutral">Meu Perfil</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie suas informações pessoais e preferências
            </p>
          </div>
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
