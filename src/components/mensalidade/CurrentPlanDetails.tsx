
// Se este arquivo não existir ainda, ele será criado com o conteúdo atualizado para o período de 7 dias
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { SubscriptionDetails } from "@/types/subscription";

interface CurrentPlanDetailsProps {
  subscription: SubscriptionDetails | null;
  isLoading: boolean;
  onUpgrade: () => void;
  onCancel: () => void;
}

export function CurrentPlanDetails({ subscription, isLoading, onUpgrade, onCancel }: CurrentPlanDetailsProps) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  
  useEffect(() => {
    if (subscription?.trialEndsAt) {
      const trialEnd = new Date(subscription.trialEndsAt);
      const today = new Date();
      const diffTime = trialEnd.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysLeft(diffDays > 0 ? diffDays : 0);
    }
  }, [subscription]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    );
  }

  const isTrial = subscription?.status === 'trial';
  const isActive = subscription?.status === 'active';
  const isExpired = subscription?.status === 'expired';
  
  return (
    <Card className="w-full shadow-md border border-gray-200">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">Seu plano atual</CardTitle>
          {isTrial && (
            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
              Período de teste (7 dias)
            </Badge>
          )}
          {isActive && (
            <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
              Ativo
            </Badge>
          )}
          {isExpired && (
            <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
              Expirado
            </Badge>
          )}
        </div>
        <CardDescription>
          {isTrial ? 'Aproveite todos os recursos durante o período de avaliação' : 
           isActive ? 'Sua assinatura está ativa' : 
           'Sua assinatura expirou'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTrial && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">
                {daysLeft === 1 ? 'Último dia de teste' : 
                 daysLeft === 0 ? 'Seu período de teste termina hoje' : 
                 `${daysLeft} dias restantes no período de teste`}
              </p>
              <p className="text-sm text-blue-700">
                {daysLeft && daysLeft < 3 ? 'Escolha um plano para continuar usando o sistema' : 
                'Explore todos os recursos durante o período de avaliação'}
              </p>
            </div>
          </div>
        )}

        {isActive && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Assinatura ativa</p>
              <p className="text-sm text-green-700">
                Próxima cobrança em {new Date(subscription?.endDate || '').toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {isExpired && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Acesso limitado</p>
              <p className="text-sm text-red-700">
                Renove sua assinatura para continuar usando todos os recursos
              </p>
            </div>
          </div>
        )}

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Detalhes do plano:</h4>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">Plano:</span> {subscription?.planId || 'Plano Básico (Teste)'}</p>
            {isTrial ? (
              <p><span className="font-medium">Período de teste:</span> 7 dias</p>
            ) : (
              <p><span className="font-medium">Período:</span> Mensal</p>
            )}
            <p>
              <span className="font-medium">Método de pagamento:</span> 
              {subscription?.paymentMethod === 'credit_card' ? 'Cartão de crédito' : 
              subscription?.paymentMethod === 'pix' ? 'PIX' : 
              subscription?.paymentMethod === 'boleto' ? 'Boleto' : 'Não configurado'}
            </p>
            {isActive && subscription?.autoRenew && (
              <p><span className="font-medium">Renovação:</span> Automática</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        {(isTrial || isExpired) && (
          <Button 
            onClick={onUpgrade} 
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
          >
            {isTrial ? 'Assinar agora' : 'Renovar assinatura'}
          </Button>
        )}
        {isActive && (
          <Button 
            variant="outline" 
            onClick={onCancel} 
            className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar assinatura
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
