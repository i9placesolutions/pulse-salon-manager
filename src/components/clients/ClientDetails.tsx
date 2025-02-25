
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Client, ClientService, ClientPreference, AppointmentHistory, PaymentHistory, CouponHistory } from "@/types/client";
import { Download, Calendar, CreditCard, Ticket, Gift, History, BadgePercent } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  services: ClientService[];
  preferences: ClientPreference[];
}

export const ClientDetails = ({ isOpen, onClose, client, services, preferences }: ClientDetailsProps) => {
  const totalSpent = services.reduce((acc, service) => acc + service.value, 0);

  const handleExportData = () => {
    // Implementar lógica de exportação
    console.log("Exportando dados do cliente...");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Cliente desde {format(new Date(client.firstVisit), "dd/MM/yyyy")}
            </p>
          </div>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Dados
          </Button>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
            <TabsTrigger value="cashback">Cashback</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="coupons">Cupons</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium">Nome</dt>
                      <dd>{client.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">Email</dt>
                      <dd>{client.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">Telefone</dt>
                      <dd>{client.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">CPF</dt>
                      <dd>{client.cpf || "-"}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Programa Fidelidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium">Status</dt>
                      <dd className="capitalize">{client.status}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">Pontos</dt>
                      <dd className="text-2xl font-bold">{client.points}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">Última visita</dt>
                      <dd>
                        {client.lastVisit
                          ? format(new Date(client.lastVisit), "dd/MM/yyyy")
                          : "-"}
                      </dd>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Métricas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium">Total Gasto</dt>
                      <dd className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(totalSpent)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">Total de Visitas</dt>
                      <dd>{services.length}</dd>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Agendamentos</CardTitle>
                <CardDescription>Todos os agendamentos do cliente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {client.appointmentHistory?.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between border-b pb-4"
                    >
                      <div>
                        <p className="font-medium">{appointment.service}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(appointment.date), "PPP", { locale: ptBR })} - {appointment.time}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          com {appointment.professional}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(appointment.value)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.paymentMethod}
                        </p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            appointment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {appointment.status === "completed"
                            ? "Realizado"
                            : appointment.status === "cancelled"
                            ? "Cancelado"
                            : "Pendente"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cashback" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Saldo de Cashback</CardTitle>
                <CardDescription>Histórico e saldo disponível</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Saldo Disponível</p>
                    <p className="text-3xl font-bold text-green-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(client.balance.cashback)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Bônus VIP</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(client.balance.vipBonus)}
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <Button className="w-full">
                    <BadgePercent className="mr-2 h-4 w-4" />
                    Usar Cashback Disponível
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campanhas Participadas</CardTitle>
                <CardDescription>Histórico de participação em campanhas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {client.campaignHistory?.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between border-b pb-4"
                    >
                      <div>
                        <p className="font-medium">{campaign.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(campaign.date), "dd/MM/yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(campaign.value)}
                        </p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            campaign.status === "active"
                              ? "bg-green-100 text-green-800"
                              : campaign.status === "used"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coupons" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cupons Utilizados</CardTitle>
                <CardDescription>Histórico de cupons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {client.couponHistory?.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="flex items-center justify-between border-b pb-4"
                    >
                      <div>
                        <p className="font-medium">Código: {coupon.code}</p>
                        <p className="text-sm text-muted-foreground">
                          Serviço: {coupon.service}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(coupon.usedDate), "dd/MM/yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          -{new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(coupon.discount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pagamentos</CardTitle>
                <CardDescription>Todos os pagamentos realizados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {client.paymentHistory?.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between border-b pb-4"
                    >
                      <div>
                        <p className="font-medium">{payment.method}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(payment.date), "dd/MM/yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(payment.value)}
                        </p>
                        {payment.discount && (
                          <p className="text-sm text-green-600">
                            Desconto: -{new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(payment.discount)}
                          </p>
                        )}
                        {payment.cashbackUsed && (
                          <p className="text-sm text-purple-600">
                            Cashback: -{new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(payment.cashbackUsed)}
                          </p>
                        )}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
