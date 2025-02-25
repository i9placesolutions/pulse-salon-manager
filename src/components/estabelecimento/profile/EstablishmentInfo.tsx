
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function EstablishmentInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do Estabelecimento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Estabelecimento</Label>
            <Input id="name" defaultValue="Pulse Salon" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" defaultValue="12.345.678/0001-90" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="contato@pulsesalon.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" defaultValue="(11) 99999-9999" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Endereço</Label>
          <Input id="address" defaultValue="Rua Exemplo, 123 - São Paulo, SP" />
        </div>
        <Button>Salvar Alterações</Button>
      </CardContent>
    </Card>
  );
}
