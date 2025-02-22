
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Professional,
  ProfessionalAppointment,
  ProfessionalCommission,
  ProfessionalPayment,
  ProfessionalPerformance,
} from "@/types/professional";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/currency";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Calendar,
  Clock,
  DollarSign,
  Download,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

interface ProfessionalDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professional: Professional;
  appointments: ProfessionalAppointment[];
  commissions: ProfessionalCommission[];
  payments: ProfessionalPayment[];
  performance: ProfessionalPerformance;
}

export function ProfessionalDetails({
  open,
  onOpenChange,
  professional,
  appointments,
  commissions,
  payments,
  performance,
}: ProfessionalDetailsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Profissional</DialogTitle>
          <DialogDescription>
            Informações detalhadas sobre {professional.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="appointments">Atendimentos</TabsTrigger>
            <TabsTrigger value="commissions">Comissões</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="performance">Desempenho</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Atendimentos
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {professional.totalAppointments}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Comissão Total
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(professional.totalCommission)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Média Mensal
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(professional.averageMonthlyRevenue)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">E-mail</p>
                  <p className="text-sm text-muted-foreground">
                    {professional.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Telefone</p>
                  <p className="text-sm text-muted-foreground">
                    {professional.phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Especialidade</p>
                  <p className="text-sm text-muted-foreground">
                    {professional.specialty}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Data de Contratação</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(professional.hiringDate).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Histórico de Atendimentos</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Comissão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          {new Date(appointment.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{appointment.clientName}</TableCell>
                        <TableCell>{appointment.serviceName}</TableCell>
                        <TableCell>{formatCurrency(appointment.value)}</TableCell>
                        <TableCell>
                          {formatCurrency(appointment.commission)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Histórico de Comissões</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Referência</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map((commission) => (
                      <TableRow key={commission.id}>
                        <TableCell>
                          {new Date(commission.paymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{commission.referenceName}</TableCell>
                        <TableCell>
                          {commission.referenceType === "service"
                            ? "Serviço"
                            : "Produto"}
                        </TableCell>
                        <TableCell>{formatCurrency(commission.value)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              commission.status === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {commission.status === "paid"
                              ? "Pago"
                              : "Pendente"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Histórico de Pagamentos</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mês Ref.</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data Pagamento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.referenceMonth}</TableCell>
                        <TableCell>{formatCurrency(payment.value)}</TableCell>
                        <TableCell>
                          {payment.paymentDate
                            ? new Date(payment.paymentDate).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              payment.status === "paid"
                                ? "bg-green-100 text-green-700"
                                : payment.status === "partial"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {payment.status === "paid"
                              ? "Pago"
                              : payment.status === "partial"
                              ? "Parcial"
                              : "Pendente"}
                          </span>
                        </TableCell>
                        <TableCell>{payment.notes || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Atendimentos
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performance.totalAppointments}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performance.rating.toFixed(1)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Taxa de Retorno
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(performance.clientReturnRate * 100).toFixed(0)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Faturamento Mensal</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performance.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#dc8c95"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Serviços Mais Realizados</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performance.topServices}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="serviceName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#dc8c95" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
