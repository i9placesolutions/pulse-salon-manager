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
import { Service } from "@/types/service";

// Interface para dados de desempenho adicionais
interface PerformanceData {
  appointmentsLastMonth: number;
  rating: number;
  popularityRank: number;
  avgDuration: number;
  priceHistory: { date: string; price: number }[];
  trend: 'up' | 'down' | 'stable';
}

// Estendendo a interface Service para incluir dados extras
interface ExtendedService extends Service {
  performanceData?: PerformanceData;
}

interface ServiceChartsProps {
  services: ExtendedService[];
  professionals: { id: number; name: string }[];
}

const COLORS = ["#db2777", "#8b5cf6", "#22c55e", "#eab308", "#ec4899"];

export function ServiceCharts({ services, professionals }: ServiceChartsProps) {
  // Dados para o gráfico de serviços mais populares
  const topServices = services
    .filter(service => service.performanceData)
    .map((service) => ({
      name: service.name,
      revenue: service.price,
      appointments: service.performanceData?.appointmentsLastMonth || 0,
      rating: service.performanceData?.rating || 0,
    }))
    .sort((a, b) => b.appointments - a.appointments)
    .slice(0, 5);

  // Dados para o gráfico de distribuição de serviços por categoria
  const servicesByCategory = services.reduce((acc: { name: string; value: number }[], service) => {
    const existingCategory = acc.find(cat => cat.name === service.category);
    
    if (existingCategory) {
      existingCategory.value += 1;
    } else {
      acc.push({ name: service.category, value: 1 });
    }
    
    return acc;
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Serviços Mais Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topServices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tickFormatter={(value) => formatCurrency(value)} 
                />
                <Tooltip
                  formatter={(value: any, name: string) => 
                    name === "revenue" ? formatCurrency(value) : value
                  }
                  labelFormatter={(label) => `Serviço: ${label}`}
                />
                <Legend />
                <Bar dataKey="appointments" name="Atendimentos" fill="#db2777" yAxisId="left" />
                <Bar dataKey="revenue" name="Preço" fill="#8b5cf6" yAxisId="right" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={servicesByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {servicesByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
