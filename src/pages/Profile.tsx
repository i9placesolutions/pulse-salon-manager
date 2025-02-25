
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Bell, History } from "lucide-react";

// Vamos importar os componentes corretos para o perfil do estabelecimento
import { EstablishmentInfo } from "@/components/estabelecimento/profile/EstablishmentInfo";
import { SecuritySettings } from "@/components/estabelecimento/profile/SecuritySettings";
import { NotificationPreferences } from "@/components/estabelecimento/profile/NotificationPreferences";
import { ActivityHistory } from "@/components/estabelecimento/profile/ActivityHistory";
import { DangerZone } from "@/components/estabelecimento/profile/DangerZone";

export default function Profile() {
  return (
    <div>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral">Perfil do Estabelecimento</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie as informações e preferências do seu estabelecimento
            </p>
          </div>
        </div>

        <Tabs defaultValue="establishment" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="establishment">
              <User className="h-4 w-4 mr-2" />
              Dados do Estabelecimento
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

          <TabsContent value="establishment">
            <EstablishmentInfo />
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
