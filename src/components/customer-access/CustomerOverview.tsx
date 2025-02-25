
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Calendar, DollarSign, Clock, ChevronRight } from "lucide-react";
import type { CustomerAccessInfo } from "@/types/customerAccess";
import { formatCurrency } from "@/utils/currency";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CustomerOverviewProps {
  customer: CustomerAccessInfo;
}

export function CustomerOverview({ customer }: CustomerOverviewProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Cliente desde {format(new Date(customer.registrationDate), "PP", { locale: ptBR })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-2xl font-semibold">{customer.name}</p>
            <p className="text-sm text-muted-foreground">
              {customer.totalAppointments} atendimentos realizados
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cashback Disponível</CardTitle>
          <CardDescription>
            Você pode usar seu cashback em qualquer serviço
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(customer.cashbackBalance)}
            </p>
            <Button variant="outline" className="w-full">
              <DollarSign className="mr-2 h-4 w-4" />
              Usar Cashback
            </Button>
          </div>
        </CardContent>
      </Card>

      {customer.nextAppointment ? (
        <Card>
          <CardHeader>
            <CardTitle>Próximo Atendimento</CardTitle>
            <CardDescription>
              {format(new Date(customer.nextAppointment.date), "PPP", { locale: ptBR })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="font-medium">{customer.nextAppointment.service}</p>
                <p className="text-sm text-muted-foreground">
                  com {customer.nextAppointment.professional}
                </p>
                <p className="text-sm font-medium">
                  {customer.nextAppointment.time}h
                </p>
              </div>
              <Button variant="outline" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Agendar Atendimento</CardTitle>
            <CardDescription>
              Faça seu próximo agendamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Agendar Agora
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
