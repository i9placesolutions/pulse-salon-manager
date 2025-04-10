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
  bgGradient: string;
  iconGradient: string;
  borderColor: string;
  textColor: string;
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
      color: "bg-indigo-100 text-indigo-700",
      bgGradient: "bg-gradient-to-br from-indigo-50 to-blue-50",
      iconGradient: "bg-gradient-to-br from-indigo-500 to-blue-600",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-700"
    },
    {
      title: "Clientes Ativos",
      value: activeClients || 0,
      icon: UserCheck,
      color: "bg-emerald-100 text-emerald-700",
      bgGradient: "bg-gradient-to-br from-emerald-50 to-teal-50",
      iconGradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700"
    },
    {
      title: "Clientes VIP",
      value: vipClients || 0,
      icon: Crown,
      color: "bg-amber-100 text-amber-700",
      bgGradient: "bg-gradient-to-br from-amber-50 to-yellow-50",
      iconGradient: "bg-gradient-to-br from-amber-500 to-yellow-600",
      borderColor: "border-amber-200",
      textColor: "text-amber-700"
    },
    {
      title: "Clientes Inativos",
      value: inactiveClients || 0,
      icon: Clock,
      color: "bg-red-100 text-red-700",
      bgGradient: "bg-gradient-to-br from-red-50 to-rose-50",
      iconGradient: "bg-gradient-to-br from-red-500 to-rose-600",
      borderColor: "border-red-200",
      textColor: "text-red-700"
    },
    {
      title: "Com Cashback",
      value: cashbackClients || 0,
      icon: Wallet,
      color: "bg-sky-100 text-sky-700",
      bgGradient: "bg-gradient-to-br from-sky-50 to-blue-50",
      iconGradient: "bg-gradient-to-br from-sky-500 to-blue-600",
      borderColor: "border-sky-200",
      textColor: "text-sky-700"
    },
    {
      title: "Aniversariantes do Mês",
      value: birthdaysThisMonth || 0,
      icon: Cake,
      color: "bg-purple-100 text-purple-700",
      bgGradient: "bg-gradient-to-br from-purple-50 to-fuchsia-50",
      iconGradient: "bg-gradient-to-br from-purple-500 to-fuchsia-600",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
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
      color: "hidden", // Will be hidden
      bgGradient: "",
      iconGradient: "",
      borderColor: "",
      textColor: ""
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
            className={`border ${stat.borderColor} shadow-sm hover:shadow-md transition-shadow rounded-lg overflow-hidden`}
          >
            <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-blue-500 to-sky-400"></div>
            <CardContent className={`p-6 flex items-center ${stat.bgGradient}`}>
              <div className={`w-12 h-12 rounded-full ${stat.iconGradient} flex items-center justify-center flex-shrink-0 mr-4 shadow-sm`}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <p className={`text-sm font-medium ${stat.textColor}`}>{stat.title}</p>
                <p className={`text-3xl font-bold mt-1 ${stat.textColor}`}>{stat.value}</p>
                {stat.change && (
                  <p className={`text-sm mt-1 ${stat.change.type === 'increase' 
                    ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block' 
                    : 'text-red-600 bg-red-50 px-2 py-0.5 rounded-full inline-block'}`}>
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
