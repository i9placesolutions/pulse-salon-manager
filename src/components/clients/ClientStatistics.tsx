
import { Card } from "@/components/ui/card";
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
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-neutral-600">Total de Clientes</h3>
            <Users className="h-5 w-5 text-neutral-500" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-semibold text-neutral-900">{totalClients}</p>
            <p className="text-sm text-muted-foreground">clientes cadastrados</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-neutral-600">Clientes Ativos</h3>
            <Users className="h-5 w-5 text-pink-500" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-semibold text-neutral-900">{activeClients}</p>
            <p className="text-sm text-muted-foreground">clientes ativos</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-neutral-600">Clientes VIP</h3>
            <Crown className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-semibold text-yellow-500">{vipClients}</p>
            <p className="text-sm text-muted-foreground">clientes VIP</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-neutral-600">Aniversariantes</h3>
            <Cake className="h-5 w-5 text-pink-500" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-semibold text-pink-500">{birthdaysThisMonth}</p>
            <p className="text-sm text-muted-foreground">neste mês</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
