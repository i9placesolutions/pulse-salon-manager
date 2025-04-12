import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, CalendarDays, ArrowRight, Plus, Trash2, AlarmClock, AlarmClockOff, Calendar, CalendarCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface WorkingHour {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  hasBreak: boolean;
  breakStart: string;
  breakEnd: string;
}

interface WorkingHoursSectionProps {
  workingHours: WorkingHour[];
  addWorkingHour: () => void;
  removeWorkingHour: (index: number) => void;
  updateWorkingHour: (index: number, field: string, value: string | boolean) => void;
}

export const WorkingHoursSection: React.FC<WorkingHoursSectionProps> = ({
  workingHours,
  addWorkingHour,
  removeWorkingHour,
  updateWorkingHour
}) => {
  const diasDaSemana = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira", 
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
    "Domingo"
  ];

  // Mapeia os dias da semana para suas abreviações
  const diaCurto = {
    "Segunda-feira": "SEG",
    "Terça-feira": "TER",
    "Quarta-feira": "QUA", 
    "Quinta-feira": "QUI",
    "Sexta-feira": "SEX",
    "Sábado": "SÁB",
    "Domingo": "DOM"
  };

  // Organizar os horários por dia da semana
  const sortedHours = [...workingHours].sort((a, b) => {
    const daysOrder = {};
    diasDaSemana.forEach((day, index) => {
      daysOrder[day] = index;
    });
    return daysOrder[a.dayOfWeek] - daysOrder[b.dayOfWeek];
  });

  // Função para formatar a hora em um formato mais legível
  const formatTime = (time: string) => {
    if (!time) return "";
    return time;
  };

  return (
    <Card className="mb-6 border-indigo-200 shadow-md overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-indigo-400 to-indigo-600"></div>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium flex items-center text-indigo-700">
            <Clock className="mr-2 h-5 w-5 text-indigo-600" />
            Horários de Funcionamento
          </h3>
          <Button 
            onClick={addWorkingHour} 
            size="sm" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>

        {/* Resumo visual dos horários */}
        <div className="mb-8 bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
          <h4 className="text-sm font-medium mb-3 text-indigo-700 flex items-center">
            <CalendarDays className="mr-2 h-4 w-4" />
            Resumo Semanal
          </h4>
          <div className="grid grid-cols-7 gap-1">
            {diasDaSemana.map((dia) => {
              const horario = sortedHours.find(h => h.dayOfWeek === dia);
              const temHorario = !!horario && horario.openTime && horario.closeTime;
              
              return (
                <div 
                  key={dia} 
                  className={`text-center py-2 px-1 rounded-md ${temHorario 
                    ? 'bg-white border border-indigo-200 shadow-sm' 
                    : 'bg-gray-100 border border-gray-200 opacity-60'}`}
                >
                  <div className="text-xs font-bold text-indigo-700 mb-1">{diaCurto[dia]}</div>
                  {temHorario ? (
                    <div className="text-xs">
                      <div className="font-medium text-indigo-800">{formatTime(horario.openTime)}</div>
                      <div className="text-gray-400 my-1">às</div>
                      <div className="font-medium text-indigo-800">{formatTime(horario.closeTime)}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">Fechado</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="space-y-4">
          {sortedHours.map((hour, index) => {
            // Calcular a duração do expediente
            const openHours = hour.openTime ? parseInt(hour.openTime.split(':')[0]) : 0;
            const openMinutes = hour.openTime ? parseInt(hour.openTime.split(':')[1]) : 0;
            const closeHours = hour.closeTime ? parseInt(hour.closeTime.split(':')[0]) : 0;
            const closeMinutes = hour.closeTime ? parseInt(hour.closeTime.split(':')[1]) : 0;
            
            const totalOpenMinutes = (openHours * 60) + openMinutes;
            const totalCloseMinutes = (closeHours * 60) + closeMinutes;
            
            let durationHours = Math.floor((totalCloseMinutes - totalOpenMinutes) / 60);
            let durationMinutes = (totalCloseMinutes - totalOpenMinutes) % 60;
            
            // Ajustar para valores negativos ou zero
            if (durationHours < 0 || (durationHours === 0 && durationMinutes <= 0)) {
              durationHours = 0;
              durationMinutes = 0;
            }
            
            const duration = `${durationHours}h${durationMinutes > 0 ? ` ${durationMinutes}min` : ''}`;
            
            return (
              <div key={index} className="border rounded-md bg-white border-indigo-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-100 to-indigo-50 px-4 py-3 border-b border-indigo-200 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300 px-3 py-1">
                      {hour.dayOfWeek}
                    </Badge>
                    
                    {hour.openTime && hour.closeTime && (
                      <div className="text-sm text-indigo-700 font-medium flex items-center gap-1">
                        <AlarmClock className="h-3.5 w-3.5" />
                        <span>{duration}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeWorkingHour(index)}
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-2">
                      <Label htmlFor={`dayOfWeek-${index}`} className="text-indigo-700 mb-1.5 block">Dia da Semana</Label>
                      <Select
                        defaultValue={hour.dayOfWeek}
                        onValueChange={(value) => updateWorkingHour(index, 'dayOfWeek', value)}
                      >
                        <SelectTrigger className="w-full border-indigo-200 focus:ring-indigo-500">
                          <SelectValue placeholder="Selecione o dia" />
                        </SelectTrigger>
                        <SelectContent>
                          {diasDaSemana.map((dia) => (
                            <SelectItem key={dia} value={dia}>
                              {dia}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor={`openTime-${index}`} className="text-indigo-700 mb-1.5 block">Abertura</Label>
                      <Input 
                        id={`openTime-${index}`}
                        type="time"
                        value={hour.openTime}
                        onChange={(e) => updateWorkingHour(index, 'openTime', e.target.value)}
                        className="border-indigo-200 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`closeTime-${index}`} className="text-indigo-700 mb-1.5 block">Fechamento</Label>
                      <Input 
                        id={`closeTime-${index}`}
                        type="time"
                        value={hour.closeTime}
                        onChange={(e) => updateWorkingHour(index, 'closeTime', e.target.value)}
                        className="border-indigo-200 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div className="flex flex-col justify-end h-full">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id={`hasBreak-${index}`}
                          checked={hour.hasBreak}
                          onCheckedChange={(checked) => 
                            updateWorkingHour(index, 'hasBreak', checked)
                          }
                          className="data-[state=checked]:bg-indigo-600"
                        />
                        <Label 
                          htmlFor={`hasBreak-${index}`}
                          className="text-sm font-medium text-indigo-700"
                        >
                          Intervalo
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  {hour.hasBreak && (
                    <div className="mt-4 pt-4 border-t border-indigo-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`breakStart-${index}`} className="text-indigo-700 mb-1.5 block">Início do Intervalo</Label>
                          <Input 
                            id={`breakStart-${index}`}
                            type="time"
                            value={hour.breakStart}
                            onChange={(e) => updateWorkingHour(index, 'breakStart', e.target.value)}
                            className="border-indigo-200 focus:ring-indigo-500"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`breakEnd-${index}`} className="text-indigo-700 mb-1.5 block">Fim do Intervalo</Label>
                          <Input 
                            id={`breakEnd-${index}`}
                            type="time"
                            value={hour.breakEnd}
                            onChange={(e) => updateWorkingHour(index, 'breakEnd', e.target.value)}
                            className="border-indigo-200 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {sortedHours.length === 0 && (
          <div className="text-center py-8 bg-indigo-50 rounded-md border border-indigo-100 mb-4">
            <Calendar className="mx-auto h-12 w-12 text-indigo-300 mb-2" />
            <h3 className="text-indigo-700 font-medium mb-1">Nenhum horário definido</h3>
            <p className="text-indigo-600 text-sm">Adicione os horários de funcionamento do seu estabelecimento</p>
          </div>
        )}
        
        <div className="mt-4">
          <Button
            onClick={addWorkingHour}
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white shadow-sm hover:shadow gap-2"
          >
            <CalendarCheck className="h-4 w-4" />
            Adicionar Novo Horário
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
