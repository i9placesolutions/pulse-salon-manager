import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Clock, PlusCircle, MinusCircle, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DiaConfig {
  ativo: boolean;
  inicio: string;
  fim: string;
  temIntervalo: boolean;
  intervaloInicio: string;
  intervaloFim: string;
}

export function ConfigGeral() {
  const [diasConfig, setDiasConfig] = useState<Record<string, DiaConfig>>({
    'Segunda': { ativo: true, inicio: '08:00', fim: '18:00', temIntervalo: false, intervaloInicio: '12:00', intervaloFim: '13:00' },
    'Terça': { ativo: true, inicio: '08:00', fim: '18:00', temIntervalo: false, intervaloInicio: '12:00', intervaloFim: '13:00' },
    'Quarta': { ativo: true, inicio: '08:00', fim: '18:00', temIntervalo: false, intervaloInicio: '12:00', intervaloFim: '13:00' },
    'Quinta': { ativo: true, inicio: '08:00', fim: '18:00', temIntervalo: false, intervaloInicio: '12:00', intervaloFim: '13:00' },
    'Sexta': { ativo: true, inicio: '08:00', fim: '18:00', temIntervalo: false, intervaloInicio: '12:00', intervaloFim: '13:00' },
    'Sábado': { ativo: true, inicio: '08:00', fim: '14:00', temIntervalo: false, intervaloInicio: '12:00', intervaloFim: '13:00' },
    'Domingo': { ativo: false, inicio: '08:00', fim: '12:00', temIntervalo: false, intervaloInicio: '12:00', intervaloFim: '13:00' },
  });

  const handleDiaAtivo = (dia: string, ativo: boolean) => {
    setDiasConfig(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        ativo
      }
    }));
  };

  const handleTempoChange = (dia: string, campo: keyof DiaConfig, valor: string) => {
    setDiasConfig(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [campo]: valor
      }
    }));
  };

  const toggleIntervalo = (dia: string) => {
    setDiasConfig(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        temIntervalo: !prev[dia].temIntervalo
      }
    }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Horário de Funcionamento</CardTitle>
          <CardDescription>
            Configure os horários de atendimento do seu salão, incluindo intervalos se necessário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(diasConfig).map(([dia, config]) => (
              <Collapsible key={dia} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch 
                      id={`dia-${dia}`} 
                      checked={config.ativo}
                      onCheckedChange={(checked) => handleDiaAtivo(dia, checked)}
                    />
                    <Label htmlFor={`dia-${dia}`} className={`font-medium ${!config.ativo ? 'text-gray-400' : ''}`}>
                      {dia}
                      {config.temIntervalo && config.ativo && (
                        <Badge variant="outline" className="ml-2 text-xs bg-amber-50 text-amber-700 border-amber-200">
                          <Coffee className="h-3 w-3 mr-1" />
                          Intervalo
                        </Badge>
                      )}
                    </Label>
                  </div>

                  {config.ativo ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Input 
                          type="time" 
                          className="w-24" 
                          value={config.inicio}
                          onChange={(e) => handleTempoChange(dia, 'inicio', e.target.value)}
                          disabled={!config.ativo}
                        />
                        <span className={`mx-1 ${!config.ativo ? 'text-gray-400' : ''}`}>às</span>
                        <Input 
                          type="time" 
                          className="w-24"
                          value={config.fim}
                          onChange={(e) => handleTempoChange(dia, 'fim', e.target.value)}
                          disabled={!config.ativo}
                        />
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="px-2">
                          {config.temIntervalo ? (
                            <MinusCircle className="h-4 w-4 text-amber-600" />
                          ) : (
                            <PlusCircle className="h-4 w-4 text-blue-600" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Fechado</span>
                  )}
                </div>
                
                <CollapsibleContent className="pt-3">
                  <div className="flex items-center gap-2 pt-3 border-t mt-3">
                    <div className="flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-amber-600" />
                      <span className="text-sm">Intervalo:</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Input 
                        type="time" 
                        className="w-24" 
                        value={config.intervaloInicio}
                        onChange={(e) => handleTempoChange(dia, 'intervaloInicio', e.target.value)}
                        disabled={!config.ativo}
                      />
                      <span className="mx-1">às</span>
                      <Input 
                        type="time" 
                        className="w-24"
                        value={config.intervaloFim}
                        onChange={(e) => handleTempoChange(dia, 'intervaloFim', e.target.value)}
                        disabled={!config.ativo}
                      />
                    </div>
                    <Button 
                      variant={config.temIntervalo ? "default" : "outline"} 
                      size="sm"
                      className={`ml-2 ${config.temIntervalo ? "bg-amber-600 hover:bg-amber-700" : "text-amber-600 border-amber-200 hover:bg-amber-50"}`}
                      onClick={() => toggleIntervalo(dia)}
                      disabled={!config.ativo}
                    >
                      {config.temIntervalo ? "Remover" : "Adicionar"} Intervalo
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
          
          <div className="mt-6 bg-blue-50 p-3 rounded-md border border-blue-100">
            <div className="flex gap-2 text-sm text-blue-700">
              <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Configuração de Intervalo</p>
                <p className="mt-1 text-blue-600">
                  O intervalo define um período em que o estabelecimento estará fechado para novos agendamentos (ex: horário de almoço). 
                  Durante esse período não serão exibidos horários disponíveis na agenda online.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
