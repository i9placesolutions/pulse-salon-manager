
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";
import { Service, ProfessionalCommission } from "@/types/service";

interface ServiceChartsProps {
  services: Service[];
  commissions: ProfessionalCommission[];
  professionals: { id: number; name: string }[];
}

const COLORS = ["#dc8c95", "#8b5cf6", "#22c55e", "#eab308", "#ec4899"];

export function ServiceCharts({ services, commissions, professionals }: ServiceChartsProps) {
  // Dados para o gráfico de serviços mais vendidos
  const topServices = services
    .map((service) => ({
      name: service.name,
      revenue: service.price,
      commissions: commissions
        .filter((c) => c.serviceId === service.id)
        .reduce((acc, curr) => {
          if (curr.type === "percentage") {
            return acc + (service.price * curr.value) / 100;
          }
          return acc + curr.value;
        }, 0),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Dados para o gráfico de distribuição de comissões por profissional
  const professionalEarnings = professionals.map((prof) => {
    const totalEarnings = commissions
      .filter((c) => c.professionalId === prof.id)
      .reduce((acc, curr) => {
        const service = services.find((s) => s.id === curr.serviceId);
        if (!service) return acc;
        
        if (curr.type === "percentage") {
          return acc + (service.price * curr.value) / 100;
        }
        return acc + curr.value;
      }, 0);

    return {
      name: prof.name,
      value: totalEarnings,
    };
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Serviços Mais Rentáveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topServices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Serviço: ${label}`}
                />
                <Legend />
                <Bar dataKey="revenue" name="Receita" fill="#dc8c95" />
                <Bar dataKey="commissions" name="Comissões" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Comissões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={professionalEarnings}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                >
                  {professionalEarnings.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
