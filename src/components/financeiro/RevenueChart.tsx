import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { formatCurrency } from "@/utils/currency";
import { RevenueData } from "@/types/financial";

interface RevenueChartProps {
  data: RevenueData[];
  period: "week" | "month" | "year";
  setPeriod: (period: "week" | "month" | "year") => void;
}

export const RevenueChart = ({ data, period, setPeriod }: RevenueChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Faturamento</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant={period === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("week")}
          >
            Semanal
          </Button>
          <Button
            variant={period === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("month")}
          >
            Mensal
          </Button>
          <Button
            variant={period === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("year")}
          >
            Anual
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), "Faturamento"]}
                labelStyle={{ color: '#666' }}
              />
              <Bar dataKey="revenue" fill="#db2777" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
