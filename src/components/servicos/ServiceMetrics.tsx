import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Users, Package, TrendingUp } from "lucide-react";

interface ServiceMetricsProps {
  totalServices: number;
  activeServices: number;
  totalProfessionals: number;
  totalPackages: number;
}

export function ServiceMetrics({
  totalServices,
  activeServices,
  totalProfessionals,
  totalPackages,
}: ServiceMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-indigo-100">
          <CardTitle className="text-sm font-medium text-indigo-700">Total de Serviços</CardTitle>
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Scissors className="h-4 w-4 text-indigo-600" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-indigo-700">{totalServices}</div>
          <p className="text-xs text-indigo-500">serviços cadastrados</p>
        </CardContent>
      </Card>

      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-emerald-100">
          <CardTitle className="text-sm font-medium text-emerald-700">Serviços Ativos</CardTitle>
          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-emerald-700">{activeServices}</div>
          <p className="text-xs text-emerald-500">disponíveis para agendamento</p>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-blue-100">
          <CardTitle className="text-sm font-medium text-blue-700">Profissionais</CardTitle>
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-blue-700">{totalProfessionals}</div>
          <p className="text-xs text-blue-500">realizando serviços</p>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-amber-100">
          <CardTitle className="text-sm font-medium text-amber-700">Pacotes</CardTitle>
          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
            <Package className="h-4 w-4 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-bold text-amber-700">{totalPackages}</div>
          <p className="text-xs text-amber-500">combos disponíveis</p>
        </CardContent>
      </Card>
    </div>
  );
}
