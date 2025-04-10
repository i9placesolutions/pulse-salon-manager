import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface DateTimeSelectorProps {
  availableTimeSlots: TimeSlot[];
  onSelectDateTime: (date: Date, timeSlot: TimeSlot) => void;
  onBack: () => void;
  selectedDate?: Date;
  selectedTimeSlot?: TimeSlot;
}

export function DateTimeSelector({
  availableTimeSlots,
  onSelectDateTime,
  onBack,
  selectedDate,
  selectedTimeSlot,
}: DateTimeSelectorProps) {
  const [date, setDate] = useState<Date | undefined>(selectedDate);
  const [timeSlot, setTimeSlot] = useState<TimeSlot | undefined>(selectedTimeSlot);

  // Função para verificar se a data tem horários disponíveis
  const isDateDisabled = (date: Date) => {
    // Aqui você pode implementar a lógica para verificar se a data tem horários disponíveis
    // Por exemplo, verificar feriados, domingos, ou dias específicos sem disponibilidade
    const day = date.getDay();
    return day === 0; // Desabilita domingos
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    setTimeSlot(undefined);
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    setTimeSlot(slot);
  };

  const handleContinue = () => {
    if (date && timeSlot) {
      onSelectDateTime(date, timeSlot);
    }
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 -ml-2 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-4">Selecione uma data</h3>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            className="border rounded-md p-3"
          />
        </div>

        <div>
          <h3 className="font-medium mb-4">
            {date
              ? `Horários disponíveis para ${formatDate(date)}`
              : "Selecione uma data para ver os horários disponíveis"}
          </h3>

          {date ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableTimeSlots.length > 0 ? (
                availableTimeSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={timeSlot?.id === slot.id ? "default" : "outline"}
                    className={`flex items-center gap-2 ${
                      !slot.available
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:border-pink-300"
                    }`}
                    disabled={!slot.available}
                    onClick={() => handleTimeSelect(slot)}
                  >
                    <Clock className="h-3 w-3" />
                    {slot.time}
                  </Button>
                ))
              ) : (
                <p className="text-gray-500 col-span-3">
                  Não há horários disponíveis para esta data.
                </p>
              )}
            </div>
          ) : (
            <div className="h-40 border rounded-md flex items-center justify-center text-gray-400">
              Selecione uma data primeiro
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleContinue}
          disabled={!date || !timeSlot}
          className="bg-pink-600 hover:bg-pink-700"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
} 