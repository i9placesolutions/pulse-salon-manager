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
  Save,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfigGeral } from "@/components/configuracoes/ConfigGeral";
import { ConfigWhatsApp } from "@/components/configuracoes/ConfigWhatsApp";
import { ConfigSeguranca } from "@/components/configuracoes/ConfigSeguranca";
import { ConfigUsuarios } from "@/components/configuracoes/ConfigUsuarios";
import { ConfigPagamentos } from "@/components/configuracoes/ConfigPagamentos";
import { ConfigRelatorios } from "@/components/configuracoes/ConfigRelatorios";

export default function Configuracoes() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    // Implementar lógica de salvamento
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Configurações salvas",
        description: "As configurações foram salvas com sucesso!",
      });
    }, 1000);
  };
  


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Configurações</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as configurações do seu salão
          </p>
        </div>
        <div className="flex flex-wrap">
          <Button 
            onClick={handleSave} 
            disabled={isLoading} 
            className="bg-primary hover:bg-primary/90 transition-all"
          >
            {isLoading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>
      
      <Alert className="bg-primary/5 border-primary/20 mb-6">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          Todas as alterações realizadas nas configurações são armazenadas temporariamente até que você clique em "Salvar Alterações".
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 bg-muted/50 p-1 rounded-lg border shadow-sm">

          <TabsTrigger value="geral" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <Settings className="h-4 w-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>

          <TabsTrigger value="pagamentos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <CreditCard className="h-4 w-4 mr-2" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <FileText className="h-4 w-4 mr-2" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <Shield className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>

        </TabsList>

        <TabsContent value="geral" className="animate-in fade-in-50 duration-300">
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <div className="p-1 bg-muted/50">
              <h2 className="text-xl font-medium px-4 py-3">Configurações Gerais</h2>
            </div>
            <div className="p-6">
              <ConfigGeral />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="whatsapp" className="animate-in fade-in-50 duration-300">
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <div className="p-1 bg-muted/50">
              <h2 className="text-xl font-medium px-4 py-3">Configurações do WhatsApp</h2>
            </div>
            <div className="p-6">
              <ConfigWhatsApp />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="usuarios" className="animate-in fade-in-50 duration-300">
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <div className="p-1 bg-muted/50">
              <h2 className="text-xl font-medium px-4 py-3">Gerenciamento de Usuários</h2>
            </div>
            <div className="p-6">
              <ConfigUsuarios />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pagamentos" className="animate-in fade-in-50 duration-300">
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <div className="p-1 bg-muted/50">
              <h2 className="text-xl font-medium px-4 py-3">Configurações de Pagamentos</h2>
            </div>
            <div className="p-6">
              <ConfigPagamentos />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="relatorios" className="animate-in fade-in-50 duration-300">
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <div className="p-1 bg-muted/50">
              <h2 className="text-xl font-medium px-4 py-3">Configurações de Relatórios</h2>
            </div>
            <div className="p-6">
              <ConfigRelatorios />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seguranca" className="animate-in fade-in-50 duration-300">
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <div className="p-1 bg-muted/50">
              <h2 className="text-xl font-medium px-4 py-3">Configurações de Segurança</h2>
            </div>
            <div className="p-6">
              <ConfigSeguranca />
            </div>
          </div>
        </TabsContent>


      </Tabs>
    </div>
  );
}
