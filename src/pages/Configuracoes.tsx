
import { useState, useEffect, useCallback, useMemo } from "react";
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
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfigGeral } from "@/components/configuracoes/ConfigGeral";
import { ConfigWhatsApp } from "@/components/configuracoes/ConfigWhatsApp";
import { ConfigSeguranca } from "@/components/configuracoes/ConfigSeguranca";
import { ConfigUsuarios } from "@/components/configuracoes/ConfigUsuarios";
import { ConfigPagamentos } from "@/components/configuracoes/ConfigPagamentos";
import { ConfigRelatorios } from "@/components/configuracoes/ConfigRelatorios";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";

export default function Configuracoes() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("geral");
  const [isLoading, setIsLoading] = useState(false);
  
  // Obter a aba inicial da navegação, se disponível - otimização com useEffect com dependências corretas
  useEffect(() => {
    if (location.state && location.state.initialTab) {
      setActiveTab(location.state.initialTab);
    }
  }, [location.state]);

  // Memorizar o SaveButton para prevenir renderizações desnecessárias
  const SaveButton = useMemo(() => {
    return (
      <Button 
        onClick={() => handleSave()} 
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
    );
  }, [isLoading]);

  // Usar useCallback para funções que são passadas para componentes filhos
  const handleSave = useCallback(() => {
    setIsLoading(true);
    // Implementar lógica de salvamento
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Configurações salvas",
        description: "As configurações foram salvas com sucesso!",
      });
    }, 1000);
  }, []);
  
  // Memorizar os TabsTriggers para evitar re-renderização quando apenas muda a aba ativa
  const tabsTriggers = useMemo(() => {
    return (
      <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-2 rounded-lg border border-blue-100 shadow-sm">
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
          value="usuarios" 
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-violet-700 data-[state=active]:shadow-md data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all rounded-md"
        >
          <Users className="h-4 w-4 mr-2" />
          Usuários
        </TabsTrigger>
        <TabsTrigger 
          value="pagamentos" 
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-700 data-[state=active]:shadow-md data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all rounded-md"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Pagamentos
        </TabsTrigger>
        <TabsTrigger 
          value="relatorios" 
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-teal-700 data-[state=active]:shadow-md data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all rounded-md"
        >
          <FileText className="h-4 w-4 mr-2" />
          Relatórios
        </TabsTrigger>
        <TabsTrigger 
          value="seguranca" 
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-red-700 data-[state=active]:shadow-md data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all rounded-md"
        >
          <Shield className="h-4 w-4 mr-2" />
          Segurança
        </TabsTrigger>
      </TabsList>
    );
  }, []);
  
  // Otimizar a renderização de conteúdos de abas
  const renderTabContent = useCallback((value: string, title: string, icon: React.ReactNode, gradient: string, component: React.ReactNode) => (
    <TabsContent value={value} className="animate-in fade-in-50 duration-300">
      <div className={`bg-white rounded-lg border border-${value === 'geral' ? 'blue' : value === 'whatsapp' ? 'green' : value === 'usuarios' ? 'indigo' : value === 'pagamentos' ? 'amber' : value === 'relatorios' ? 'cyan' : 'rose'}-100 shadow-md overflow-hidden`}>
        <div className={`h-1 w-full bg-gradient-to-r from-${value === 'geral' ? 'blue' : value === 'whatsapp' ? 'green' : value === 'usuarios' ? 'indigo' : value === 'pagamentos' ? 'amber' : value === 'relatorios' ? 'cyan' : 'rose'}-400 via-${value === 'geral' ? 'blue' : value === 'whatsapp' ? 'green' : value === 'usuarios' ? 'indigo' : value === 'pagamentos' ? 'amber' : value === 'relatorios' ? 'cyan' : 'rose'}-500 to-${value === 'geral' ? 'blue' : value === 'whatsapp' ? 'emerald' : value === 'usuarios' ? 'violet' : value === 'pagamentos' ? 'orange' : value === 'relatorios' ? 'teal' : 'red'}-600`}></div>
        <div className={`p-2 bg-gradient-to-r from-${value === 'geral' ? 'blue' : value === 'whatsapp' ? 'green' : value === 'usuarios' ? 'indigo' : value === 'pagamentos' ? 'amber' : value === 'relatorios' ? 'cyan' : 'rose'}-50 via-${value === 'geral' ? 'blue' : value === 'whatsapp' ? 'green' : value === 'usuarios' ? 'indigo' : value === 'pagamentos' ? 'amber' : value === 'relatorios' ? 'cyan' : 'rose'}-100 to-${value === 'geral' ? 'blue' : value === 'whatsapp' ? 'green' : value === 'usuarios' ? 'indigo' : value === 'pagamentos' ? 'amber' : value === 'relatorios' ? 'cyan' : 'rose'}-50 border-b border-${value === 'geral' ? 'blue' : value === 'whatsapp' ? 'green' : value === 'usuarios' ? 'indigo' : value === 'pagamentos' ? 'amber' : value === 'relatorios' ? 'cyan' : 'rose'}-100`}>
          <h2 className={`text-xl font-medium px-4 py-3 text-${value === 'geral' ? 'blue' : value === 'whatsapp' ? 'green' : value === 'usuarios' ? 'indigo' : value === 'pagamentos' ? 'amber' : value === 'relatorios' ? 'cyan' : 'rose'}-700 flex items-center`}>
            {icon}
            {title}
          </h2>
        </div>
        <div className="p-6">
          {component}
        </div>
      </div>
    </TabsContent>
  ), []);

  return (
    <PageLayout variant="blue">
      <PageHeader 
        title="Configurações" 
        subtitle="Gerencie as configurações do seu salão"
        variant="blue"
        badge="Sistema"
        action={SaveButton}
      />
      
      <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-indigo-200 mb-6 shadow-sm">
        <AlertCircle className="h-4 w-4 text-indigo-600" />
        <AlertDescription className="text-sm text-indigo-700 font-medium">
          Todas as alterações realizadas nas configurações são armazenadas temporariamente até que você clique em "Salvar Alterações".
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {tabsTriggers}

        {renderTabContent("geral", "Configurações Gerais", <Settings className="h-5 w-5 mr-2 text-blue-600" />, "blue", <ConfigGeral />)}
        {renderTabContent("whatsapp", "Configurações do WhatsApp", <MessageSquare className="h-5 w-5 mr-2 text-green-600" />, "green", <ConfigWhatsApp />)}
        {renderTabContent("usuarios", "Gerenciamento de Usuários", <Users className="h-5 w-5 mr-2 text-indigo-600" />, "indigo", <ConfigUsuarios />)}
        {renderTabContent("pagamentos", "Configurações de Pagamentos", <CreditCard className="h-5 w-5 mr-2 text-amber-600" />, "amber", <ConfigPagamentos />)}
        {renderTabContent("relatorios", "Configurações de Relatórios", <FileText className="h-5 w-5 mr-2 text-cyan-600" />, "cyan", <ConfigRelatorios />)}
        {renderTabContent("seguranca", "Configurações de Segurança", <Shield className="h-5 w-5 mr-2 text-rose-600" />, "rose", <ConfigSeguranca />)}
      </Tabs>
    </PageLayout>
  );
}
