import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfessionalHeader } from "@/components/profissionais/dashboard/ProfessionalHeader";
import { PersonalInfo } from "@/components/profissionais/profile/PersonalInfo";
import { SecuritySettings } from "@/components/profissionais/profile/SecuritySettings";
import { NotificationPreferences } from "@/components/profissionais/profile/NotificationPreferences";
import { ActivityHistory } from "@/components/profissionais/profile/ActivityHistory";
import { DangerZone } from "@/components/profissionais/profile/DangerZone";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";

export default function ProfissionalProfile() {
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <PageLayout variant="blue">
      <ProfessionalHeader />
      <PageHeader 
        title="Meu Perfil" 
        subtitle="Gerencie suas informações pessoais e preferências" 
        backTo="/profissional-dashboard"
        variant="blue"
        badge="Profissional"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="w-full max-w-md grid grid-cols-4 bg-blue-50 border border-blue-100 p-1 rounded-lg">
          <TabsTrigger 
            value="personal"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Dados Pessoais
          </TabsTrigger>
          <TabsTrigger 
            value="security"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Segurança
          </TabsTrigger>
          <TabsTrigger 
            value="notifications"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Notificações
          </TabsTrigger>
          <TabsTrigger 
            value="activity"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Atividades
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="mt-0">
          <div className="bg-white rounded-lg border border-blue-100 shadow-sm">
            <div className="p-1 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-100">
              <h2 className="text-xl font-medium px-4 py-3 text-blue-700">Informações Pessoais</h2>
            </div>
            <div className="p-6">
              <PersonalInfo />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="security" className="mt-0">
          <div className="bg-white rounded-lg border border-blue-100 shadow-sm">
            <div className="p-1 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-100">
              <h2 className="text-xl font-medium px-4 py-3 text-blue-700">Configurações de Segurança</h2>
            </div>
            <div className="p-6">
              <SecuritySettings />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-0">
          <div className="bg-white rounded-lg border border-blue-100 shadow-sm">
            <div className="p-1 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-100">
              <h2 className="text-xl font-medium px-4 py-3 text-blue-700">Preferências de Notificação</h2>
            </div>
            <div className="p-6">
              <NotificationPreferences />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-0">
          <div className="bg-white rounded-lg border border-blue-100 shadow-sm mb-6">
            <div className="p-1 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-100">
              <h2 className="text-xl font-medium px-4 py-3 text-blue-700">Histórico de Atividades</h2>
            </div>
            <div className="p-6">
              <ActivityHistory />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-red-100 shadow-sm">
            <div className="p-1 bg-gradient-to-r from-red-50 to-red-100 border-b border-red-100">
              <h2 className="text-xl font-medium px-4 py-3 text-red-700">Zona de Perigo</h2>
            </div>
            <div className="p-6">
              <DangerZone />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
} 