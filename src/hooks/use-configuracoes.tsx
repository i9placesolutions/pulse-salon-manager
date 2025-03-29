
import { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

export function useConfiguracoes() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("geral");
  const [isLoading, setIsLoading] = useState(false);
  
  // Obter a aba inicial da navegação, se disponível
  useEffect(() => {
    if (location.state && location.state.initialTab) {
      setActiveTab(location.state.initialTab);
    }
  }, [location.state]);

  // Função para salvar as configurações
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

  return {
    activeTab,
    setActiveTab,
    isLoading,
    handleSave
  };
}
