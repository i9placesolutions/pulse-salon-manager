
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Client, ClientService, ClientPreference } from "@/types/client";
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Cliente</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
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
                    <div>
                      <dt className="text-sm font-medium">Endereço</dt>
                      <dd>{client.address || "-"}</dd>
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
                      <dt className="text-sm font-medium">Pontos Acumulados</dt>
                      <dd className="text-2xl font-bold">{client.points}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">Status</dt>
                      <dd className="capitalize">{client.status}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">Cliente desde</dt>
                      <dd>{format(new Date(client.firstVisit), "dd/MM/yyyy")}</dd>
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
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Serviços</CardTitle>
                <CardDescription>
                  Todos os serviços realizados por este cliente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between border-b pb-4"
                    >
                      <div>
                        <p className="font-medium">{service.service}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(service.date), "PPP", { locale: ptBR })} com{" "}
                          {service.professional}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(service.value)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {service.paymentMethod}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferências do Cliente</CardTitle>
                <CardDescription>
                  Preferências e observações registradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {preferences.map((pref) => (
                    <div
                      key={pref.id}
                      className="rounded-lg border p-4"
                    >
                      <p className="font-medium">{pref.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {pref.description}
                      </p>
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
