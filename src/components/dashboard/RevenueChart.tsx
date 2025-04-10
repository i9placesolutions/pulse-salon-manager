
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { DollarSign, TrendingUp } from "lucide-react";

interface RevenueData {
  date: string;
  revenue: number;
  expenses: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  period: string;
  setPeriod: (period: string) => void;
}

export function RevenueChart({
  data,
  period,
  setPeriod
}: RevenueChartProps) {
  return (
    <Card className="col-span-4 border-blue-200 shadow-sm hover:shadow transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2.5 rounded-full">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-blue-700">Faturamento x Despesas</CardTitle>
            <p className="text-sm text-blue-600/70 mt-1">
              Acompanhe a evolução de receitas e gastos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={period === "daily" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("daily")}
            className={period === "daily" 
              ? "bg-blue-600 hover:bg-blue-700" 
              : "border-blue-200 text-blue-700 hover:bg-blue-50"
            }
          >
            Diário
          </Button>
          <Button
            variant={period === "weekly" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("weekly")}
            className={period === "weekly" 
              ? "bg-blue-600 hover:bg-blue-700" 
              : "border-blue-200 text-blue-700 hover:bg-blue-50"
            }
          >
            Semanal
          </Button>
          <Button
            variant={period === "monthly" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("monthly")}
            className={period === "monthly" 
              ? "bg-blue-600 hover:bg-blue-700" 
              : "border-blue-200 text-blue-700 hover:bg-blue-50"
            }
          >
            Mensal
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-4 pt-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickMargin={10}
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value)}
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickMargin={10}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value)]}
                labelStyle={{ color: '#666' }}
                contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                fill="rgba(59, 130, 246, 0.2)"
                strokeWidth={2}
                name="Receita"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#16a34a"
                fill="rgba(22, 163, 74, 0.1)"
                strokeWidth={2}
                name="Despesas"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-around mt-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-blue-700">Receita</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span className="text-sm text-green-700">Despesas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
