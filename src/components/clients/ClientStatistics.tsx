import {
  Users,
  UserCheck,
  Crown,
  Clock,
  Cake,
  Wallet,
  TrendingUp
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatItem {
  title: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
}

interface ClientStatisticsProps {
  totalClients: number;
  activeClients: number;
  vipClients: number;
  inactiveClients: number;
  birthdayClients: number;
  cashbackClients: number;
  birthdaysThisMonth: number;
  birthdaysLastMonth: number;
}

export function ClientStatistics({
  totalClients = 0,
  activeClients = 0,
  vipClients = 0,
  inactiveClients = 0,
  birthdayClients = 0,
  cashbackClients = 0,
  birthdaysThisMonth = 0,
  birthdaysLastMonth = 0,
}: ClientStatisticsProps) {
  const stats: StatItem[] = [
    {
      title: "Total de Clientes",
      value: totalClients || 0,
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Clientes Ativos",
      value: activeClients || 0,
      icon: UserCheck,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Clientes VIP",
      value: vipClients || 0,
      icon: Crown,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      title: "Clientes Inativos",
      value: inactiveClients || 0,
      icon: Clock,
      color: "bg-gray-100 text-gray-700",
    },
    {
      title: "Com Cashback",
      value: cashbackClients || 0,
      icon: Wallet,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Aniversariantes do Mês",
      value: birthdaysThisMonth || 0,
      icon: Cake,
      color: "bg-[#db2777]/10 text-[#db2777]",
      change: {
        value: (birthdaysThisMonth || 0) - (birthdaysLastMonth || 0),
        type: (birthdaysThisMonth || 0) > (birthdaysLastMonth || 0) ? "increase" : "decrease"
      }
    }
  ];

  // Add placeholder cards to fill the grid evenly
  while (stats.length % 3 !== 0) {
    stats.push({
      title: "",
      value: 0,
      icon: Users,
      color: "hidden" // Will be hidden
    });
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        if (!stat || !stat.icon) return null;
        
        // Skip rendering placeholder cards
        if (stat.color === "hidden") return null;
        
        const IconComponent = stat.icon;
        
        return (
          <Card 
            key={index} 
            className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-lg overflow-hidden"
          >
            <CardContent className="p-6 flex items-center">
              <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center flex-shrink-0 mr-4`}>
                <IconComponent className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
                {stat.change && (
                  <p className={`text-sm mt-1 ${stat.change.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change.type === 'increase' ? '+' : ''}{stat.change.value}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
