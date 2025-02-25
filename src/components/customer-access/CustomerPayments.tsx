
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface CustomerPaymentsProps {
  customerId: number;
}

export function CustomerPayments({ customerId }: CustomerPaymentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamentos</CardTitle>
        <CardDescription>Histórico de pagamentos</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Histórico de pagamentos em construção...</p>
      </CardContent>
    </Card>
  );
}
