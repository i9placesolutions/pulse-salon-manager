
import { Button } from "@/components/ui/button";
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
import { Phone, Mail } from "lucide-react";

export function ConfigGeral() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Salão</CardTitle>
          <CardDescription>
            Configure as informações básicas do seu estabelecimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Salão</Label>
              <Input id="name" placeholder="Digite o nome do seu salão" />
            </div>
            <div className="grid gap-2">
              <Label>Logo do Salão</Label>
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                  <Button variant="ghost" className="h-full w-full">
                    Upload
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Contatos</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <Input placeholder="Telefone do salão" />
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <Input placeholder="E-mail do salão" />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Tema do Sistema</Label>
              <div className="flex items-center space-x-2">
                <Switch id="dark-mode" />
                <Label htmlFor="dark-mode">Modo Escuro</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horário de Funcionamento</CardTitle>
          <CardDescription>
            Configure os horários de atendimento do seu salão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((dia) => (
              <div key={dia} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch id={`dia-${dia}`} />
                  <Label htmlFor={`dia-${dia}`}>{dia}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="time" className="w-24" />
                  <span>às</span>
                  <Input type="time" className="w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
