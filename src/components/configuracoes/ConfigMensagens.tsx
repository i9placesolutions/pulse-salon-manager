
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function ConfigMensagens() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Templates de Mensagens</CardTitle>
        <CardDescription>
          Configure os modelos de mensagens automáticas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {[
            {
              titulo: 'Confirmação de Agendamento',
              descricao: 'Mensagem enviada após confirmar um horário',
              variaveis: ['nome_cliente', 'data_horario', 'servico']
            },
            {
              titulo: 'Lembrete de Consulta',
              descricao: 'Mensagem enviada 24h antes do horário',
              variaveis: ['nome_cliente', 'data_horario', 'profissional']
            },
            {
              titulo: 'Aniversário',
              descricao: 'Mensagem de felicitação de aniversário',
              variaveis: ['nome_cliente', 'cupom_desconto']
            }
          ].map((template, index) => (
            <div key={index} className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{template.titulo}</h4>
                  <p className="text-sm text-muted-foreground">{template.descricao}</p>
                </div>
                <Button variant="outline" size="sm">Editar</Button>
              </div>
              <div>
                <Label>Variáveis disponíveis</Label>
                <div className="flex gap-2 mt-2">
                  {template.variaveis.map((variavel, idx) => (
                    <Badge key={idx} variant="secondary">
                      {variavel}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
