import {
  Users,
  UserCheck,
  Crown,
  Clock,
  Cake,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ClientStatisticsProps {
  totalClients: number;
  activeClients: number;
  vipClients: number;
  inactiveClients: number;
  birthdayClients: number;
}

export function ClientStatistics({
  totalClients,
  activeClients,
  vipClients,
  inactiveClients,
  birthdayClients,
}: ClientStatisticsProps) {
  const stats = [
    {
      title: "Total de Clientes",
      value: totalClients,
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Clientes Ativos",
      value: activeClients,
      icon: UserCheck,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Clientes VIP",
      value: vipClients,
      icon: Crown,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      title: "Clientes Inativos",
      value: inactiveClients,
      icon: Clock,
      color: "bg-gray-100 text-gray-700",
    },
    {
      title: "Aniversariantes",
      value: birthdayClients,
      icon: Cake,
      color: "bg-pink-100 text-pink-700",
    },
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="border-none shadow-md hover:shadow-lg transition-shadow"
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
