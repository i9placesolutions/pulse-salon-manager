import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/currency";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

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
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between pb-8">
        <div>
          <CardTitle>Faturamento x Despesas</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={period === "daily" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("daily")}
          >
            Diário
          </Button>
          <Button
            variant={period === "weekly" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("weekly")}
          >
            Semanal
          </Button>
          <Button
            variant={period === "monthly" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("monthly")}
          >
            Mensal
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
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
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#db2777"
                fill="#db277720"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#94a3b8"
                fill="#f1f5f9"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
