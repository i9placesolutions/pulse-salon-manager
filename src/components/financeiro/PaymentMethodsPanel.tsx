
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaymentMethodConfig } from "@/types/financial";
import { Plus, CreditCard, Banknote, Wallet, QrCode, Coins, MoreHorizontal } from "lucide-react";

interface PaymentMethodsPanelProps {
  paymentMethods: PaymentMethodConfig[];
  onUpdateMethod?: (method: PaymentMethodConfig) => void;
  onAddMethod?: (method: PaymentMethodConfig) => void;
}

export function PaymentMethodsPanel({ paymentMethods }: PaymentMethodsPanelProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodConfig | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const getFeeLabel = (method: PaymentMethodConfig) => {
    const feeValue = method.fee || (method.fees as number);
    if (method.type === 'pix') return `${feeValue}%`;
    if (method.type === 'credit') return `${feeValue}% por transação`;
    if (method.type === 'debit') return `${feeValue}% por transação`;
    return 'Sem taxa';
  };

  const getInstallmentsLabel = (method: PaymentMethodConfig) => {
    if (method.maxInstallments && method.maxInstallments > 1) {
      return `Até ${method.maxInstallments}x`;
    }
    return "À vista";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métodos de Pagamento</CardTitle>
        <CardDescription>
          Configure os métodos de pagamento aceitos pelo seu estabelecimento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Métodos Digitais */}
          <div>
            <h3 className="text-lg font-medium mb-4">Métodos Digitais</h3>
            <div className="space-y-2">
              {paymentMethods
                .filter(method => method.type === 'pix' || method.type === 'transfer')
                .map(method => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      {method.type === 'pix' && <QrCode className="h-5 w-5" />}
                      {method.type === 'transfer' && <Coins className="h-5 w-5" />}
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">{getFeeLabel(method)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={method.enabled ? "default" : "outline"}>
                        {method.enabled ? "Ativo" : "Inativo"}
                      </Badge>
                      <Switch checked={method.enabled} />
                    </div>
                  </div>
                ))}
            </div>
            
            {/* PIX Keys */}
            <div className="mt-4 border rounded-md p-4">
              <h4 className="text-sm font-medium mb-2">Chaves PIX Cadastradas</h4>
              <div className="space-y-2">
                {paymentMethods
                  .filter(method => method.type === 'pix')
                  .flatMap(method => method.pixKeys || [])
                  .map((pixKey, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{pixKey.key}</p>
                        <p className="text-xs text-muted-foreground">{pixKey.type}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Chave PIX
                </Button>
              </div>
            </div>
          </div>

          {/* Cartões */}
          <div>
            <h3 className="text-lg font-medium mb-4">Cartões</h3>
            <div className="space-y-2">
              {paymentMethods
                .filter(method => method.type === 'credit' || method.type === 'debit')
                .map(method => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5" />
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">{getFeeLabel(method)}</p>
                          <span className="text-muted-foreground">•</span>
                          <p className="text-sm text-muted-foreground">
                            {getInstallmentsLabel(method)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={method.enabled ? "default" : "outline"}>
                        {method.enabled ? "Ativo" : "Inativo"}
                      </Badge>
                      <Switch checked={method.enabled} />
                    </div>
                  </div>
                ))}
            </div>

            {/* Bandeiras de Cartão */}
            <div className="mt-4 border rounded-md p-4">
              <h4 className="text-sm font-medium mb-2">Bandeiras Aceitas</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bandeira</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Max Parcelas</TableHead>
                    <TableHead>Valor Mínimo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentMethods
                    .filter(method => method.type === 'credit')
                    .flatMap(method => method.cardBrands || [])
                    .map((brand, index) => (
                      <TableRow key={index}>
                        <TableCell>{brand.name}</TableCell>
                        <TableCell>
                          <Badge variant={brand.enabled ? "default" : "outline"} className="w-[70px] justify-center">
                            {brand.enabled ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{brand.maxInstallments}x</TableCell>
                        <TableCell>R$ {brand.minValue.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <Button variant="outline" size="sm" className="mt-4 w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Bandeira
              </Button>
            </div>
          </div>

          {/* Outros Métodos */}
          <div>
            <h3 className="text-lg font-medium mb-4">Outros Métodos</h3>
            <div className="space-y-2">
              {paymentMethods
                .filter(method => method.type === 'cash' || method.type === 'other')
                .map(method => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      {method.type === 'cash' ? (
                        <Banknote className="h-5 w-5" />
                      ) : (
                        <Wallet className="h-5 w-5" />
                      )}
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {method.type === 'cash' ? 'Pagamento em espécie' : 'Método alternativo'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={method.enabled ? "default" : "outline"}>
                        {method.enabled ? "Ativo" : "Inativo"}
                      </Badge>
                      <Switch checked={method.enabled} />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between pt-4">
        <Button variant="outline">Cancelar</Button>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Método
        </Button>
      </CardFooter>
    </Card>
  );
}
