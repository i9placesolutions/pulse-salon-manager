import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, PackageCheck, AlertTriangle, TrendingUp } from "lucide-react";

interface EstoqueMetricsProps {
  totalProducts: number;
  inStockProducts: number;
  lowStockProducts: number;
  topSellingProducts: number;
}

export function EstoqueMetrics({
  totalProducts,
  inStockProducts,
  lowStockProducts,
  topSellingProducts,
}: EstoqueMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-indigo-200 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-indigo-400 to-blue-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-indigo-50 to-blue-50">
          <CardTitle className="text-sm font-medium text-indigo-700">Total de Produtos</CardTitle>
          <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-1.5 rounded-full">
            <Package className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-indigo-700">{totalProducts}</div>
          <p className="text-xs text-indigo-500">produtos cadastrados</p>
        </CardContent>
      </Card>

      <Card className="border-emerald-200 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardTitle className="text-sm font-medium text-emerald-700">Em Estoque</CardTitle>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 rounded-full">
            <PackageCheck className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-emerald-700">{inStockProducts}</div>
          <p className="text-xs text-emerald-500">produtos disponíveis</p>
        </CardContent>
      </Card>

      <Card className="border-amber-200 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardTitle className="text-sm font-medium text-amber-700">Estoque Baixo</CardTitle>
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-1.5 rounded-full">
            <AlertTriangle className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-amber-700">{lowStockProducts}</div>
          <p className="text-xs text-amber-500">produtos com estoque crítico</p>
        </CardContent>
      </Card>

      <Card className="border-purple-200 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-purple-400 to-fuchsia-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-purple-50 to-fuchsia-50">
          <CardTitle className="text-sm font-medium text-purple-700">Mais Vendidos</CardTitle>
          <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 p-1.5 rounded-full">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-purple-700">{topSellingProducts}</div>
          <p className="text-xs text-purple-500">produtos em destaque</p>
        </CardContent>
      </Card>
    </div>
  );
}
