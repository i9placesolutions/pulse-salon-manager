
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

export function ConfigPagamentos() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pagamento</CardTitle>
          <CardDescription>
            Configure as formas de pagamento aceitas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { metodo: 'Dinheiro', taxa: '0%' },
            { metodo: 'Cartão de Débito', taxa: '2%' },
            { metodo: 'Cartão de Crédito', taxa: '3%' },
            { metodo: 'PIX', taxa: '1%' }
          ].map((pagamento, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch id={`pagamento-${index}`} />
                <div>
                  <Label htmlFor={`pagamento-${index}`}>{pagamento.metodo}</Label>
                  <p className="text-sm text-muted-foreground">Taxa: {pagamento.taxa}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parcelamento</CardTitle>
          <CardDescription>
            Configure as opções de parcelamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Número máximo de parcelas</Label>
            <select className="w-full p-2 border rounded-md">
              <option>1x</option>
              <option>2x</option>
              <option>3x</option>
              <option>4x</option>
              <option>5x</option>
              <option>6x</option>
              <option>12x</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label>Valor mínimo para parcelamento</Label>
            <Input type="number" placeholder="R$ 0,00" />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="juros" />
            <Label htmlFor="juros">Cobrar juros no parcelamento</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
