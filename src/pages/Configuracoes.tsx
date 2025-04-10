import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  CalendarDays,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfigGeral } from "@/components/configuracoes/ConfigGeral";
import { ConfigWhatsApp } from "@/components/configuracoes/ConfigWhatsApp";
import { ConfigSeguranca } from "@/components/configuracoes/ConfigSeguranca";
import { ConfigUsuarios } from "@/components/configuracoes/ConfigUsuarios";
import { ConfigPagamentos } from "@/components/configuracoes/ConfigPagamentos";
import { ConfigRelatorios } from "@/components/configuracoes/ConfigRelatorios";
import { ConfigLinkAgendamento } from "@/components/configuracoes/ConfigLinkAgendamento";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";

export default function Configuracoes() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("geral");
  
  // Obter a aba inicial da navegação, se disponível
  useEffect(() => {
    if (location.state && location.state.initialTab) {
      setActiveTab(location.state.initialTab);
    }
  }, [location]);
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
    <PageLayout variant="blue">
      <PageHeader 
        title="Configurações" 
        subtitle="Gerencie as configurações do seu salão"
        variant="blue"
        badge="Sistema"
        action={
          <Button 
            onClick={handleSave} 
            disabled={isLoading} 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
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
        }
      />
      
      <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-indigo-200 mb-6 shadow-sm">
        <AlertCircle className="h-4 w-4 text-indigo-600" />
        <AlertDescription className="text-sm text-indigo-700 font-medium">
          Todas as alterações realizadas nas configurações são armazenadas temporariamente até que você clique em "Salvar Alterações".
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-2 rounded-lg border border-blue-100 shadow-sm">

          <TabsTrigger 
            value="geral" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:shadow-md data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all rounded-md"
          >
            <Settings className="h-4 w-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger 
            value="whatsapp" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-700 data-[state=active]:shadow-md data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all rounded-md"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger 
            value="agendamento" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:shadow-md data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all rounded-md"
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            Agendamento
          </TabsTrigger>
          <TabsTrigger 
            value="usuarios" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-indigo-700 data-[state=active]:shadow-md data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all rounded-md"
          >
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger 
            value="pagamentos" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-700 data-[state=active]:shadow-md data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all rounded-md"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger 
            value="relatorios" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:shadow-md data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all rounded-md"
          >
            <FileText className="h-4 w-4 mr-2" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger 
            value="seguranca" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:shadow-md data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all rounded-md"
          >
            <Shield className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="animate-in fade-in-50 duration-300">
          <div className="bg-white rounded-lg border border-blue-100 shadow-md overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
            <div className="p-2 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 border-b border-blue-100">
              <h2 className="text-xl font-medium px-4 py-3 text-blue-700 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                Configurações Gerais
              </h2>
            </div>
            <div className="p-6">
              <ConfigGeral />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="whatsapp" className="animate-in fade-in-50 duration-300">
          <div className="bg-white rounded-lg border border-green-100 shadow-md overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-green-400 via-green-500 to-emerald-600"></div>
            <div className="p-2 bg-gradient-to-r from-green-50 via-green-100 to-green-50 border-b border-green-100">
              <h2 className="text-xl font-medium px-4 py-3 text-green-700 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
                Configurações do WhatsApp
              </h2>
            </div>
            <div className="p-6">
              <ConfigWhatsApp />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="agendamento" className="animate-in fade-in-50 duration-300">
          <div className="bg-white rounded-lg border border-purple-100 shadow-md overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600"></div>
            <div className="p-2 bg-gradient-to-r from-purple-50 via-purple-100 to-purple-50 border-b border-purple-100">
              <h2 className="text-xl font-medium px-4 py-3 text-purple-700 flex items-center">
                <CalendarDays className="h-5 w-5 mr-2 text-purple-600" />
                Link de Agendamento
              </h2>
            </div>
            <div className="p-6">
              <ConfigLinkAgendamento />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="usuarios" className="animate-in fade-in-50 duration-300">
          <div className="bg-white rounded-lg border border-indigo-100 shadow-md overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-indigo-500 to-violet-600"></div>
            <div className="p-2 bg-gradient-to-r from-indigo-50 via-indigo-100 to-indigo-50 border-b border-indigo-100">
              <h2 className="text-xl font-medium px-4 py-3 text-indigo-700 flex items-center">
                <Users className="h-5 w-5 mr-2 text-indigo-600" />
                Gerenciamento de Usuários
              </h2>
            </div>
            <div className="p-6">
              <ConfigUsuarios />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pagamentos" className="animate-in fade-in-50 duration-300">
          <div className="bg-white rounded-lg border border-amber-100 shadow-md overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-600"></div>
            <div className="p-2 bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 border-b border-amber-100">
              <h2 className="text-xl font-medium px-4 py-3 text-amber-700 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-amber-600" />
                Configurações de Pagamentos
              </h2>
            </div>
            <div className="p-6">
              <ConfigPagamentos />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="relatorios" className="animate-in fade-in-50 duration-300">
          <div className="bg-white rounded-lg border border-cyan-100 shadow-md overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-teal-600"></div>
            <div className="p-2 bg-gradient-to-r from-cyan-50 via-cyan-100 to-cyan-50 border-b border-cyan-100">
              <h2 className="text-xl font-medium px-4 py-3 text-cyan-700 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-cyan-600" />
                Configurações de Relatórios
              </h2>
            </div>
            <div className="p-6">
              <ConfigRelatorios />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seguranca" className="animate-in fade-in-50 duration-300">
          <div className="bg-white rounded-lg border border-rose-100 shadow-md overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-rose-400 via-rose-500 to-red-600"></div>
            <div className="p-2 bg-gradient-to-r from-rose-50 via-rose-100 to-rose-50 border-b border-rose-100">
              <h2 className="text-xl font-medium px-4 py-3 text-rose-700 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-rose-600" />
                Configurações de Segurança
              </h2>
            </div>
            <div className="p-6">
              <ConfigSeguranca />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
