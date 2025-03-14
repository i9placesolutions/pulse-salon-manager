import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/currency";
import { AccountReceivable } from "@/types/financial";
import { NewCashFlowEntryDialog } from "./NewCashFlowEntryDialog";

interface AccountsReceivableProps {
  accounts: AccountReceivable[];
  onNewEntry?: (entry: any) => void;
}

export const AccountsReceivable = ({ accounts, onNewEntry }: AccountsReceivableProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Contas a Receber</CardTitle>
          <CardDescription>Pagamentos pendentes e parcelados</CardDescription>
        </div>
        <div className="flex space-x-2">
          <NewCashFlowEntryDialog
            type="entrada"
            onNewEntry={onNewEntry || (() => {})}
          />
          <NewCashFlowEntryDialog
            type="saida"
            onNewEntry={onNewEntry || (() => {})}
          />
        </div>
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
            </div>
          ))}
          
          {accounts.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              Nenhuma conta a receber pendente.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
