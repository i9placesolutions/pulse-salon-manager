import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product, StockMovement } from "@/types/stock";

interface EstoqueChartsProps {
  products: Product[];
  movements: StockMovement[];
}

export function EstoqueCharts({ products, movements }: EstoqueChartsProps) {
  // Dados para o gráfico de produtos mais vendidos
  const topProducts = products
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map((product) => ({
      name: product.name,
      quantidade: product.quantity,
    }));

  // Dados para o gráfico de movimentações
  const movementsByDay = movements.reduce((acc: any[], movement) => {
    const date = new Date(movement.date).toLocaleDateString();
    const existingDate = acc.find((item) => item.date === date);

    if (existingDate) {
      if (movement.type === "in") {
        existingDate.entradas += movement.quantity;
      } else {
        existingDate.saidas += movement.quantity;
      }
    } else {
      acc.push({
        date,
        entradas: movement.type === "in" ? movement.quantity : 0,
        saidas: movement.type === "out" ? movement.quantity : 0,
      });
    }

    return acc;
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Produtos Mais Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" fill="#db2777" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações do Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={movementsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="entradas"
                  stroke="#28a745"
                  name="Entradas"
                />
                <Line
                  type="monotone"
                  dataKey="saidas"
                  stroke="#dc3545"
                  name="Saídas"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
