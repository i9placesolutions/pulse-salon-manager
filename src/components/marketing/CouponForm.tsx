
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Gift, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CouponFormData {
  code: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: string;
  endDate: string;
  maxUses: number;
  minPurchaseValue: number;
  restrictions: string[];
  services: string[];
}

interface CouponFormProps {
  data: CouponFormData;
  onClose: () => void;
  onChange: (data: CouponFormData) => void;
  onSave: () => void;
}

export function CouponForm({ data, onClose, onChange, onSave }: CouponFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Novo Cupom</CardTitle>
        <CardDescription>Configure um novo cupom promocional</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="coupon-code">Código do Cupom</Label>
            <Input 
              id="coupon-code"
              placeholder="Ex: SALAO10"
              value={data.code}
              onChange={(e) => onChange({ ...data, code: e.target.value.toUpperCase() })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="coupon-name">Nome da Promoção</Label>
            <Input 
              id="coupon-name"
              placeholder="Ex: Desconto de Boas-vindas"
              value={data.name}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <Label>Tipo de Desconto</Label>
            <RadioGroup
              value={data.type}
              onValueChange={(value: 'percentage' | 'fixed') => 
                onChange({ ...data, type: value })
              }
            >
              <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="percentage" id="discount-percentage" />
                  <Label htmlFor="discount-percentage">Porcentagem (%)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="discount-fixed" />
                  <Label htmlFor="discount-fixed">Valor Fixo (R$)</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="discount-value">Valor do Desconto</Label>
            <Input 
              id="discount-value"
              type="number"
              placeholder={data.type === 'percentage' ? '10' : '50'}
              value={data.value}
              onChange={(e) => onChange({ ...data, value: Number(e.target.value) })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Validade</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="start-date">Data de Início</Label>
                <Input 
                  id="start-date"
                  type="date"
                  value={data.startDate}
                  onChange={(e) => onChange({ ...data, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-date">Data de Término</Label>
                <Input 
                  id="end-date"
                  type="date"
                  value={data.endDate}
                  onChange={(e) => onChange({ ...data, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="max-uses">Limite de Uso</Label>
            <Input 
              id="max-uses"
              type="number"
              placeholder="Ex: 100"
              value={data.maxUses}
              onChange={(e) => onChange({ ...data, maxUses: Number(e.target.value) })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="min-purchase">Valor Mínimo da Compra</Label>
            <Input 
              id="min-purchase"
              type="number"
              placeholder="Ex: 100"
              value={data.minPurchaseValue}
              onChange={(e) => onChange({ ...data, minPurchaseValue: Number(e.target.value) })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Aplicação do Cupom</Label>
            <Select 
              value={data.services.length === 0 ? "all" : "specific"}
              onValueChange={(value) => {
                onChange({
                  ...data,
                  services: value === "all" ? [] : data.services
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a aplicação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os serviços</SelectItem>
                <SelectItem value="specific">Serviços específicos</SelectItem>
                <SelectItem value="products">Apenas produtos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSave}>
            <Gift className="mr-2 h-4 w-4" />
            Criar Cupom
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
