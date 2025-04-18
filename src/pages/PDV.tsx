import { useState, useEffect, lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Receipt, ChevronRight, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Terminal } from "@/components/pdv/Terminal";
import { ListaPedidos } from "@/components/pdv/ListaPedidos";
import { AberturaCaixaModal } from "@/components/pdv/AberturaCaixaModal";
import { FechamentoCaixaModal } from "@/components/pdv/FechamentoCaixaModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { usePDVManagement } from "@/hooks/usePDVManagement";

// Componente de carregamento
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200 p-6">
    <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
    <p className="text-gray-500">Carregando...</p>
  </div>
);

export default function PDV() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("terminal");
  const [showAberturaCaixa, setShowAberturaCaixa] = useState(false);
  const [showFechamentoCaixa, setShowFechamentoCaixa] = useState(false);
  
  // Usar o hook de gerenciamento do PDV
  const {
    loading,
    error,
    caixaStatus,
    caixaPendente,
    abrirCaixa,
    fecharCaixa
  } = usePDVManagement();

  // Verifica status do caixa ao carregar a página
  useEffect(() => {
    // Se não houver caixa anterior pendente e o caixa ainda não estiver aberto
    if (!caixaPendente && !caixaStatus.aberto) {
      setShowAberturaCaixa(true);
    } else if (caixaPendente) {
      // Aviso sobre caixa pendente
      toast({
        variant: "destructive",
        title: "Caixa pendente",
        description: "Existe um fechamento de caixa pendente do dia anterior. Resolva antes de abrir um novo caixa.",
      });
    }
  }, [caixaPendente, caixaStatus.aberto, toast]);

  const handleAbrirCaixa = async (valorAbertura: number) => {
    const resultado = await abrirCaixa(valorAbertura);
    if (resultado) {
      setShowAberturaCaixa(false);
    }
  };

  const handleFecharCaixa = () => {
    setShowFechamentoCaixa(true);
  };

  const handleConfirmarFechamento = async (valorFinal: number, justificativa?: string) => {
    const resultado = await fecharCaixa(valorFinal, justificativa);
    if (resultado) {
      setShowFechamentoCaixa(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Exibir toast de erro quando o erro mudar
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar PDV",
        description: error,
      });
    }
  }, [error, toast]);

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-gradient-to-r from-green-50 to-emerald-100 p-6 rounded-xl border border-emerald-100 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-100 p-3 rounded-full">
            <ChevronRight className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-green-700">
                PDV
              </h1>
              <Badge variant="outline" className="bg-emerald-500 text-white border-emerald-600 uppercase text-xs font-semibold">
                Vendas
              </Badge>
            </div>
            <p className="text-sm text-emerald-700/70">
              Terminal de vendas e gerenciamento de pedidos
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {loading ? (
            <div className="flex items-center bg-blue-50 rounded-lg border border-blue-200 px-3 py-1.5 text-sm text-blue-700">
              <Loader2 className="h-4 w-4 mr-2 text-blue-500 animate-spin" />
              <span>Carregando status do caixa...</span>
            </div>
          ) : caixaStatus.aberto ? (
            <>
              <div className="flex items-center bg-white rounded-lg border border-emerald-200 px-3 py-1.5 text-sm text-emerald-700">
                <Clock className="h-4 w-4 mr-2 text-emerald-500" />
                <span>
                  Aberto às {caixaStatus.dataAbertura?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} por {caixaStatus.responsavelAbertura}
                </span>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleFecharCaixa}
                className="bg-red-500 hover:bg-red-600"
              >
                Fechar Caixa
              </Button>
            </>
          ) : (
            <div className="flex items-center bg-red-50 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
              <span>Caixa fechado</span>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="terminal" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Terminal
          </TabsTrigger>
          <TabsTrigger value="pedidos" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Pedidos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="terminal" className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200 p-6">
              <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
              <p className="text-gray-500">Carregando terminal...</p>
            </div>
          ) : caixaStatus.aberto ? (
            <Terminal />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200 p-6">
              <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Caixa Fechado</h3>
              <p className="text-gray-500 text-center mb-4">
                É necessário abrir o caixa para iniciar as vendas.
              </p>
              <Button onClick={() => setShowAberturaCaixa(true)}>
                Abrir Caixa
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pedidos" className="space-y-4">
          {activeTab === "pedidos" && (
            <Suspense fallback={<LoadingFallback />}>
              <ListaPedidos />
            </Suspense>
          )}
        </TabsContent>
      </Tabs>

      {/* Modais */}
      <AberturaCaixaModal 
        isOpen={showAberturaCaixa} 
        onClose={() => setShowAberturaCaixa(false)}
        onConfirm={handleAbrirCaixa}
      />

      <FechamentoCaixaModal 
        isOpen={showFechamentoCaixa} 
        onClose={() => setShowFechamentoCaixa(false)}
        onConfirm={handleConfirmarFechamento}
      />
    </div>
  );
} 