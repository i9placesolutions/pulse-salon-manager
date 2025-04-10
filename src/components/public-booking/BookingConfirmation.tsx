import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Check, Calendar, Clock, User, Scissors, ArrowLeft } from "lucide-react";
import { ClientInfo } from "./ClientForm";

interface BookingConfirmationProps {
  service: {
    id: number;
    name: string;
    price: number;
    duration: number;
  };
  professional: {
    id: number;
    name: string;
    photoUrl?: string;
  };
  date: Date;
  timeSlot: {
    id: string;
    time: string;
  };
  clientInfo: ClientInfo;
  onConfirm: () => void;
  onBack: () => void;
  loading?: boolean;
}

export function BookingConfirmation({
  service,
  professional,
  date,
  timeSlot,
  clientInfo,
  onConfirm,
  onBack,
  loading = false,
}: BookingConfirmationProps) {
  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        disabled={loading}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 -ml-2 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-pink-600">Confirme seu agendamento</h2>
        <p className="text-gray-600">
          Verifique os detalhes do seu agendamento antes de finalizar
        </p>
      </div>

      <Card className="p-6 divide-y divide-gray-100">
        <div className="flex items-center gap-4 pb-4">
          <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
            <Scissors className="h-5 w-5 text-pink-600" />
          </div>
          <div>
            <h3 className="font-medium">Serviço</h3>
            <p className="text-gray-600">{service.name}</p>
          </div>
          <div className="ml-auto">
            <span className="font-medium text-pink-600">
              {formatCurrency(service.price)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 py-4">
          <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
            <User className="h-5 w-5 text-pink-600" />
          </div>
          <div>
            <h3 className="font-medium">Profissional</h3>
            <p className="text-gray-600">{professional.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 py-4">
          <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-pink-600" />
          </div>
          <div>
            <h3 className="font-medium">Data</h3>
            <p className="text-gray-600">{formatDate(date)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 py-4">
          <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
            <Clock className="h-5 w-5 text-pink-600" />
          </div>
          <div>
            <h3 className="font-medium">Horário</h3>
            <p className="text-gray-600">{timeSlot.time}</p>
          </div>
        </div>

        <div className="pt-4">
          <h3 className="font-medium mb-2">Informações do Cliente</h3>
          <div className="grid gap-2 text-sm">
            <div className="flex">
              <span className="text-gray-500 w-20">Nome:</span>
              <span>{clientInfo.name}</span>
            </div>
            <div className="flex">
              <span className="text-gray-500 w-20">Email:</span>
              <span>{clientInfo.email}</span>
            </div>
            <div className="flex">
              <span className="text-gray-500 w-20">Telefone:</span>
              <span>{clientInfo.phone}</span>
            </div>
            {clientInfo.notes && (
              <div>
                <span className="text-gray-500 block">Observações:</span>
                <p className="mt-1 text-gray-600 bg-gray-50 p-2 rounded">
                  {clientInfo.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="flex justify-end mt-6">
        <Button
          onClick={onConfirm}
          className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <span>Processando...</span>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Confirmar agendamento
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 