import { Button } from "@/components/ui/button";
import { 
  useToast, 
  toastSuccess, 
  toastError, 
  toastWarning, 
  toastInfo, 
  toastPrimary, 
  toastLoading,
  TOAST_DOCUMENTATION 
} from "@/components/ui/use-toast";
import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function ToastExample() {
  const { toast } = useToast();
  const [showInstructions, setShowInstructions] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(TOAST_DOCUMENTATION.uso);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
        Notificações Animadas e Coloridas
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Button
          onClick={() => {
            toast({
              title: "Notificação Padrão",
              description: "Esta é uma notificação padrão do sistema.",
            });
          }}
          variant="outline"
          className="border-2 border-dashed"
        >
          Padrão
        </Button>

        <Button
          onClick={() => {
            toastSuccess({
              title: "Sucesso na Operação",
              description: "A operação foi realizada com sucesso!",
            });
          }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md"
        >
          Sucesso
        </Button>

        <Button
          onClick={() => {
            toastError({
              title: "Erro Encontrado",
              description: "Ocorreu um erro ao processar sua solicitação.",
            });
          }}
          className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-md"
        >
          Erro
        </Button>

        <Button
          onClick={() => {
            toastWarning({
              title: "Atenção Necessária",
              description: "Você está prestes a realizar uma ação irreversível.",
            });
          }}
          className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 shadow-md"
        >
          Aviso
        </Button>

        <Button
          onClick={() => {
            toastInfo({
              title: "Informação Importante",
              description: "Esta é uma mensagem informativa do sistema.",
            });
          }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md"
        >
          Informação
        </Button>

        <Button
          onClick={() => {
            toastPrimary({
              title: "Novidade Exclusiva",
              description: "O sistema foi atualizado com novos recursos!",
            });
          }}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-md"
        >
          Destaque
        </Button>

        <Button
          onClick={() => {
            const loading = toastLoading({
              title: "Processando Dados",
              description: "Aguarde enquanto processamos sua solicitação...",
            });

            // Simular uma operação assíncrona
            setTimeout(() => {
              // Atualiza o toast com o resultado
              toastSuccess({
                id: loading.id, // Substitui o toast de carregamento
                title: "Processamento Concluído",
                description: "Sua solicitação foi processada com sucesso!",
              });
            }, 2000);
          }}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-md col-span-full"
        >
          Carregando (com atualização)
        </Button>
      </div>

      <Button 
        onClick={() => setShowAlerts(!showAlerts)}
        variant="outline" 
        className="w-full flex justify-between items-center mt-6 border-dashed border-2 bg-gradient-to-r from-purple-50 to-indigo-50"
      >
        <span>Exemplos de Alertas</span>
        {showAlerts ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {showAlerts && (
        <div className="mt-2 space-y-4">
          <Alert variant="default">
            <AlertTitle>Alerta Padrão</AlertTitle>
            <AlertDescription>
              Este é um alerta padrão do sistema para informações gerais.
            </AlertDescription>
          </Alert>
          
          <Alert variant="success">
            <AlertTitle>Operação Bem-Sucedida</AlertTitle>
            <AlertDescription>
              Seus dados foram salvos com sucesso no sistema!
            </AlertDescription>
          </Alert>
          
          <Alert variant="destructive">
            <AlertTitle>Erro no Sistema</AlertTitle>
            <AlertDescription>
              Não foi possível completar a operação solicitada.
            </AlertDescription>
          </Alert>
          
          <Alert variant="warning">
            <AlertTitle>Atenção Necessária</AlertTitle>
            <AlertDescription>
              Esta ação não poderá ser desfeita após confirmação.
            </AlertDescription>
          </Alert>
          
          <Alert variant="info">
            <AlertTitle>Informação Importante</AlertTitle>
            <AlertDescription>
              A atualização do sistema será realizada amanhã às 22h.
            </AlertDescription>
          </Alert>
          
          <Alert variant="primary">
            <AlertTitle>Novidade Exclusiva</AlertTitle>
            <AlertDescription>
              Novos recursos foram adicionados ao seu painel!
            </AlertDescription>
          </Alert>
          
          <Alert variant="loading">
            <AlertTitle>Processamento em Andamento</AlertTitle>
            <AlertDescription>
              Por favor, aguarde enquanto processamos sua solicitação.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <Button 
        onClick={() => setShowInstructions(!showInstructions)}
        variant="outline" 
        className="w-full flex justify-between items-center mt-4 border-dashed"
      >
        <span>Instruções de Uso</span>
        {showInstructions ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {showInstructions && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
          <h3 className="font-medium mb-2">Tipos de Notificações Disponíveis:</h3>
          <ul className="space-y-1 mb-4 text-gray-700">
            {Object.entries(TOAST_DOCUMENTATION.variants).map(([key, value]) => (
              <li key={key} className="flex gap-2">
                <span className="font-medium">{key}:</span> {value}
              </li>
            ))}
          </ul>

          <h3 className="font-medium mb-2">Como usar:</h3>
          <div className="relative">
            <pre className="p-3 bg-gray-900 text-gray-100 rounded-md overflow-x-auto text-xs">
              {TOAST_DOCUMENTATION.uso}
            </pre>
            <Button 
              className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full bg-gray-700 hover:bg-gray-600"
              onClick={copyCode}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          
          <p className="mt-3 text-gray-600">
            <strong>Dica:</strong> {TOAST_DOCUMENTATION.atualizacao}
          </p>
        </div>
      )}
    </div>
  );
} 