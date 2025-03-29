
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PaymentMethodConfig } from "@/types/financial";

interface PaymentMethodsPanelProps {
  config: PaymentMethodConfig[];
}

export function PaymentMethodsPanel({ config }: PaymentMethodsPanelProps) {
  return (
    <div className="space-y-6">
      {config.map((method) => (
        <Card key={method.id.toString()}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{method.name}</CardTitle>
              <Switch checked={method.enabled || method.isActive} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Taxas</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Taxa (%)</Label>
                    <Input
                      type="number"
                      value={method.fee}
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tempo de Processamento (dias)</Label>
                    <Input
                      type="number"
                      value={method.processingTime}
                      step="1"
                    />
                  </div>
                </div>
              </div>

              {method.type === "Pix" && method.pixKeys && (
                <div className="space-y-4">
                  <h4 className="font-medium">Chaves PIX</h4>
                  <div className="space-y-2">
                    {method.pixKeys.map((keyItem, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input value={keyItem.key} readOnly />
                        <span className="text-sm text-muted-foreground">
                          ({keyItem.type})
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm">
                    Adicionar Chave PIX
                  </Button>
                </div>
              )}

              {method.type === "Cartão" && method.cardBrands && (
                <div className="space-y-4">
                  <h4 className="font-medium">Bandeiras</h4>
                  <div className="space-y-4">
                    {method.cardBrands.map((brand, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>{brand.name}</Label>
                          <Switch checked={brand.enabled} />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Parcelas Máximas</Label>
                            <Input
                              type="number"
                              value={brand.maxInstallments}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Valor Mínimo</Label>
                            <Input
                              type="number"
                              value={brand.minValue}
                              step="0.01"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
