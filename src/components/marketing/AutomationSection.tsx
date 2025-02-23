
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function AutomationSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Automação de Marketing</CardTitle>
        <CardDescription>
          Configure regras automáticas para suas campanhas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Clientes Inativos</CardTitle>
              <CardDescription>
                Envie mensagens automáticas para clientes que não visitam o salão há muito tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Configurar Regra
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recompensas VIP</CardTitle>
              <CardDescription>
                Benefícios automáticos para clientes que atingem metas de gastos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Configurar Regra
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horários Específicos</CardTitle>
              <CardDescription>
                Promoções automáticas para horários com menor movimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Configurar Regra
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
