
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CustomerHistoryProps {
  customerId: number;
}

export function CustomerHistory({ customerId }: CustomerHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Atendimentos</CardTitle>
        <CardDescription>Seus atendimentos anteriores e futuros</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Histórico em construção...</p>
      </CardContent>
    </Card>
  );
}
