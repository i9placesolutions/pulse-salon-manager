
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Crown, UserMinus, Cake } from "lucide-react";

interface ClientStatisticsProps {
  totalClients: number;
  activeClients: number;
  vipClients: number;
  birthdaysThisMonth: number;
}

export function ClientStatistics({
  totalClients,
  activeClients,
  vipClients,
  birthdaysThisMonth,
}: ClientStatisticsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalClients}</div>
          <p className="text-xs text-muted-foreground">
            clientes cadastrados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeClients}</div>
          <p className="text-xs text-muted-foreground">
            clientes ativos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes VIP</CardTitle>
          <Crown className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{vipClients}</div>
          <p className="text-xs text-muted-foreground">
            clientes VIP
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aniversariantes</CardTitle>
          <Cake className="h-4 w-4 text-pink-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-pink-500">{birthdaysThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            neste mês
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
