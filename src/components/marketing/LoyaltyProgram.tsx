
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Star,
  CreditCard,
  Ticket,
  Settings,
  BadgePercent,
  Gift
} from "lucide-react";

export function LoyaltyProgram() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4" />
              Programa de Pontos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Pontos por real gasto</Label>
              <Input type="number" placeholder="1" className="mt-1" />
            </div>
            <Button className="w-full">Configurar Recompensas</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Cashback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Percentual de retorno</Label>
              <Input type="number" placeholder="5" className="mt-1" />
            </div>
            <Button className="w-full">Ativar Cashback</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Cartão Fidelidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Serviços para ganhar 1 grátis</Label>
              <Input type="number" placeholder="10" className="mt-1" />
            </div>
            <Button className="w-full">Configurar Serviços</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Regras de Fidelização</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>Valor mínimo para pontuação</Label>
            <Input type="number" placeholder="50" />
          </div>
          <div>
            <Label>Validade dos pontos (dias)</Label>
            <Input type="number" placeholder="90" />
          </div>
          <div>
            <Label>Limite de cashback mensal</Label>
            <Input type="number" placeholder="200" />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Configurações Avançadas
        </Button>
        <Button>
          <BadgePercent className="mr-2 h-4 w-4" />
          Ativar Programa
        </Button>
      </div>
    </div>
  );
}
