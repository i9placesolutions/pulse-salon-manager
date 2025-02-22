
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, RepeatIcon } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { Expense } from "@/types/financial";

interface ExpensesListProps {
  expenses: Expense[];
}

export const ExpensesList = ({ expenses }: ExpensesListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas</CardTitle>
        <CardDescription>Controle de contas a pagar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
            >
              <div className="flex items-start gap-3">
                <div>
                  <p className="font-medium">
                    {expense.name}
                    {expense.isRecurring && (
                      <RepeatIcon className="inline-block ml-2 h-4 w-4 text-muted-foreground" />
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {expense.category}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarIcon className="h-3 w-3" />
                    {expense.date}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(expense.value)}</p>
                <p className={`text-sm ${
                  expense.status === "Vencido" ? "text-destructive" : 
                  expense.status === "Pago" ? "text-green-600" : 
                  "text-muted-foreground"
                }`}>
                  {expense.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
