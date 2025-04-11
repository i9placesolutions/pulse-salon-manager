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
  MessageSquare, 
  CreditCard, 
  FileText, 
  Shield, 
  Save,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfigWhatsApp } from "@/components/configuracoes/ConfigWhatsApp";
import { ConfigPagamentos } from "@/components/configuracoes/ConfigPagamentos";
import { ConfigLinkAgendamento } from "@/components/configuracoes/ConfigLinkAgendamento";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";

export default function Configuracoes() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("whatsapp");
  
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
        <TabsList className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-2 rounded-lg border border-blue-100 shadow-sm">

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
            Link de Agendamento
          </TabsTrigger>
          <TabsTrigger 
            value="pagamentos" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-700 data-[state=active]:shadow-md data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all rounded-md"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Pagamentos
          </TabsTrigger>
        </TabsList>

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
      </Tabs>
    </PageLayout>
  );
}
