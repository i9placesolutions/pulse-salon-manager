
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
        <Card key={method.type}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{method.type}</CardTitle>
              <Switch checked={method.enabled} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Taxas</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {method.fees.fixed !== undefined && (
                    <div className="space-y-2">
                      <Label>Taxa Fixa</Label>
                      <Input
                        type="number"
                        value={method.fees.fixed}
                        step="0.01"
                      />
                    </div>
                  )}
                  {method.fees.percentage !== undefined && (
                    <div className="space-y-2">
                      <Label>Taxa Percentual (%)</Label>
                      <Input
                        type="number"
                        value={method.fees.percentage}
                        step="0.01"
                      />
                    </div>
                  )}
                </div>
              </div