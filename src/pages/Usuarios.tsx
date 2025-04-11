import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfigUsuarios } from "@/components/configuracoes/ConfigUsuarios";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { useToast } from "@/components/ui/use-toast";
import { Save, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Usuarios() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    setIsLoading(true);
    // Implementar lógica de salvamento
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Alterações salvas",
        description: "As configurações de usuários foram salvas com sucesso!",
      });
    }, 1000);
  };

  return (
    <PageLayout variant="indigo">
      <PageHeader 
        title="Gerenciamento de Usuários" 
        subtitle="Configure funções e permissões dos usuários do sistema"
        variant="indigo"
        badge="Sistema"
        action={
          <Button 
            onClick={handleSave} 
            disabled={isLoading} 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
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
      
      <Alert className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 mb-6 shadow-sm">
        <AlertCircle className="h-4 w-4 text-indigo-600" />
        <AlertDescription className="text-sm text-indigo-700 font-medium">
          Gerencie usuários, funções e permissões de acesso ao sistema.
        </AlertDescription>
      </Alert>

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
    </PageLayout>
  );
}
