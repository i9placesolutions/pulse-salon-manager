
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WhatsappIcon } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { AccountReceivable } from "@/types/financial";

interface AccountsReceivableProps {
  accounts: AccountReceivable[];
  onWhatsApp: (account: AccountReceivable) => void;
}

export const AccountsReceivable = ({ accounts, onWhatsApp }: AccountsReceivableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contas a Receber</CardTitle>
        <CardDescription>Pagamentos pendentes e parcelados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
            >
              <div>
                <p className="font-medium">{account.client}</p>
                <p className="text-sm text-muted-foreground">
                  Parcela {account.installment}
                </p>
                <p className="text-sm text-muted-foreground">
                  Vencimento: {account.dueDate}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(account.value)}</p>
                  <p className={`text-sm ${
                    account.status === "Atrasado" ? "text-destructive" : 
                    account.status === "Pago" ? "text-green-600" : 
                    "text-muted-foreground"
                  }`}>
                    {account.status}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onWhatsApp(account)}
                >
                  <WhatsappIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
