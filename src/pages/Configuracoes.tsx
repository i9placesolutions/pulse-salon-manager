import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Settings, 
  MessageSquare, 
  Users, 
  CreditCard, 
  FileText, 
  Shield, 
  Cloud,
  Save,
  Undo,
} from "lucide-react";
import { ConfigGeral } from "@/components/configuracoes/ConfigGeral";
import { ConfigWhatsApp } from "@/components/configuracoes/ConfigWhatsApp";
import { ConfigSeguranca } from "@/components/configuracoes/ConfigSeguranca";
import { ConfigUsuarios } from "@/components/configuracoes/ConfigUsuarios";
import { ConfigMensagens } from "@/components/configuracoes/ConfigMensagens";
import { ConfigPagamentos } from "@/components/configuracoes/ConfigPagamentos";
import { ConfigRelatorios } from "@/components/configuracoes/ConfigRelatorios";
import { ConfigBackup } from "@/components/configuracoes/ConfigBackup";

export default function Configuracoes() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    // Implementar lógica de salvamento
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral">Configurações</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie as configurações do seu salão
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => {}}>
            <Undo className="mr-2 h-4 w-4" />
            Restaurar Padrões
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      <Tabs defaultValue="geral" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          <TabsTrigger value="geral">
            <Settings className="h-4 w-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="usuarios">
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="mensagens">
            <MessageSquare className="h-4 w-4 mr-2" />
            Mensagens
          </TabsTrigger>
          <TabsTrigger value="pagamentos">
            <CreditCard className="h-4 w-4 mr-2" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="relatorios">
            <FileText className="h-4 w-4 mr-2" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="seguranca">
            <Shield className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="backup">
            <Cloud className="h-4 w-4 mr-2" />
            Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral">
          <ConfigGeral />
        </TabsContent>

        <TabsContent value="whatsapp">
          <ConfigWhatsApp />
        </TabsContent>

        <TabsContent value="usuarios">
          <ConfigUsuarios />
        </TabsContent>

        <TabsContent value="mensagens">
          <ConfigMensagens />
        </TabsContent>

        <TabsContent value="pagamentos">
          <ConfigPagamentos />
        </TabsContent>

        <TabsContent value="relatorios">
          <ConfigRelatorios />
        </TabsContent>

        <TabsContent value="seguranca">
          <ConfigSeguranca />
        </TabsContent>

        <TabsContent value="backup">
          <ConfigBackup />
        </TabsContent>
      </Tabs>
    </div>
  );
}
