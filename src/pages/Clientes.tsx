
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ClientList } from "@/components/clients/ClientList";
import { ClientStatistics } from "@/components/clients/ClientStatistics";

// Dados mockados para demonstração
const mockClients = [
  {
    id: 1,
    name: "Maria Silva",
    email: "maria@email.com",
    phone: "(11) 99999-9999",
    birthDate: "1990-01-01",
    firstVisit: "2023-01-15",
    status: "active" as const,
    points: 150,
    lastVisit: "2024-03-01",
  },
  {
    id: 2,
    name: "João Santos",
    email: "joao@email.com",
    phone: "(11) 98888-8888",
    birthDate: "1985-05-10",
    firstVisit: "2023-02-20",
    status: "vip" as const,
    points: 300,
    lastVisit: "2024-03-10",
  },
];

export default function Clientes() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus clientes e acompanhe seu histórico
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </div>

      <ClientStatistics
        totalClients={150}
        activeClients={120}
        vipClients={30}
        birthdaysThisMonth={5}
      />

      <Tabs defaultValue="todos" className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList>
            <TabsTrigger value="todos">Todos os Clientes</TabsTrigger>
            <TabsTrigger value="vip">Clientes VIP</TabsTrigger>
            <TabsTrigger value="inativos">Inativos</TabsTrigger>
            <TabsTrigger value="aniversarios">Aniversariantes</TabsTrigger>
          </TabsList>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
        </div>

        <TabsContent value="todos" className="space-y-4">
          <ClientList clients={mockClients} />
        </TabsContent>

        <TabsContent value="vip" className="space-y-4">
          <ClientList clients={mockClients.filter(client => client.status === 'vip')} />
        </TabsContent>

        <TabsContent value="inativos" className="space-y-4">
          <ClientList clients={mockClients.filter(client => client.status === 'inactive')} />
        </TabsContent>

        <TabsContent value="aniversarios" className="space-y-4">
          <ClientList 
            clients={mockClients.filter(client => {
              const birthMonth = new Date(client.birthDate).getMonth();
              const currentMonth = new Date().getMonth();
              return birthMonth === currentMonth;
            })} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
