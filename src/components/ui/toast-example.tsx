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

export function ToastExample() {
  const { toast } = useToast();
  const [showInstructions, setShowInstructions] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(TOAST_DOCUMENTATION.uso);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <Button
          onClick={() => {
            toast({
              title: "Notificação Padrão",
              description: "Esta é uma notificação padrão do sistema.",
            });
          }}
          variant="outline"
        >
          Padrão
        </Button>

        <Button
          onClick={() => {
            toastSuccess({
              title: "Operação Concluída",
              description: "A operação foi realizada com sucesso!",
            });
          }}
          className="bg-green-600 hover:bg-green-700"
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
          className="bg-red-600 hover:bg-red-700"
        >
          Erro
        </Button>

        <Button
          onClick={() => {
            toastWarning({
              title: "Atenção",
              description: "Você está prestes a realizar uma ação irreversível.",
            });
          }}
          className="bg-amber-600 hover:bg-amber-700"
        >
          Aviso
        </Button>

        <Button
          onClick={() => {
            toastInfo({
              title: "Informação",
              description: "Esta é uma mensagem informativa do sistema.",
            });
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Informação
        </Button>

        <Button
          onClick={() => {
            toastPrimary({
              title: "Novidade",
              description: "O sistema foi atualizado com novos recursos!",
            });
          }}
          className="bg-pink-600 hover:bg-pink-700"
        >
          Destaque
        </Button>

        <Button
          onClick={() => {
            const loading = toastLoading({
              title: "Processando",
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
          className="bg-blue-600 hover:bg-blue-700 col-span-full"
        >
          Carregando (com atualização)
        </Button>
      </div>

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