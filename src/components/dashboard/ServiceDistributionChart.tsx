
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Cores para os gráficos (usando as cores do sidebar)
const COLORS = ['#0284c7', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'];

interface ServiceDistributionProps {
  data: { name: string; value: number }[];
}

export const ServiceDistributionChart = React.memo(({ data }: ServiceDistributionProps) => {
  return (
    <Card className="border-purple-200 shadow-sm hover:shadow transition-all">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-full">
            <ShoppingBag className="h-4 w-4 text-purple-600" />
          </div>
          <CardTitle className="text-purple-700">Distribuição de Serviços</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Percentual']} 
                contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

ServiceDistributionChart.displayName = "ServiceDistributionChart";
