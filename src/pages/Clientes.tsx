import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ClientList } from "@/components/clients/ClientList";
import { ClientStatistics } from "@/components/clients/ClientStatistics";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientDetails } from "@/components/clients/ClientDetails";
import { Client, ClientService, ClientPreference } from "@/types/client";
import { useToast } from "@/components/ui/use-toast";

// Dados mockados para demonstração
const mockClients: Client[] = [
  {
    id: 1,
    name: "Maria Silva",
    email: "maria@email.com",
    phone: "(11) 99999-9999",
    birthDate: "1990-01-01",
    firstVisit: "2023-01-15",
    status: "active",
    points: 150,
    lastVisit: "2024-03-01",
    balance: {
      cashback: 0,
      vipBonus: 0
    },
    campaignHistory: []
  },
  {
    id: 2,
    name: "João Santos",
    email: "joao@email.com",
    phone: "(11) 98888-8888",
    birthDate: "1985-05-10",
    firstVisit: "2023-02-20",
    status: "vip",
    points: 300,
    lastVisit: "2024-03-10",
    balance: {
      cashback: 100,
      vipBonus: 50
    },
    campaignHistory: []
  },
  {
    id: 3,
    name: "Ana Oliveira",
    email: "ana@email.com",
    phone: "(11) 97777-7777",
    birthDate: "1988-07-15",
    firstVisit: "2023-03-25",
    status: "inactive",
    points: 50,
    lastVisit: "2023-08-10",
    balance: {
      cashback: 0,
      vipBonus: 0
    },
    campaignHistory: []
  },
];

// Mock de serviços
const mockServices: ClientService[] = [
  {
    id: 1,
    clientId: 1,
    date: "2024-03-01",
    professional: "João Silva",
    service: "Corte de Cabelo",
    value: 80,
    paymentMethod: "Cartão de Crédito",
  },
  {
    id: 2,
    clientId: 1,
    date: "2024-02-15",
    professional: "Maria Santos",
    service: "Manicure",
    value: 50,
    paymentMethod: "PIX",
  },
];

// Mock de preferências
const mockPreferences: ClientPreference[] = [
  {
    id: 1,
    clientId: 1,
    category: "Coloração",
    description: "Prefere tons mais naturais",
  },
  {
    id: 2,
    clientId: 1,
    category: "Atendimento",
    description: "Gosta de ser atendida pela Maria",
  },
];

export default function Clientes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  const handleSaveClient = (client: Partial<Client>) => {
    // Aqui você implementaria a lógica para salvar o cliente
    toast({
      title: "Cliente salvo com sucesso!",
      description: "Os dados do cliente foram atualizados.",
    });
  };

  const handleViewProfile = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsOpen(true);
  };

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

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
          <Button onClick={() => setIsNewClientOpen(true)}>
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
          <ClientList clients={filteredClients} onViewProfile={handleViewProfile} />
        </TabsContent>

        <TabsContent value="vip" className="space-y-4">
          <ClientList
            clients={filteredClients.filter(client => client.status === "vip")}
            onViewProfile={handleViewProfile}
          />
        </TabsContent>

        <TabsContent value="inativos" className="space-y-4">
          <ClientList
            clients={filteredClients.filter(client => client.status === "inactive")}
            onViewProfile={handleViewProfile}
          />
        </TabsContent>

        <TabsContent value="aniversarios" className="space-y-4">
          <ClientList
            clients={filteredClients.filter(client => {
              const birthMonth = new Date(client.birthDate).getMonth();
              const currentMonth = new Date().getMonth();
              return birthMonth === currentMonth;
            })}
            onViewProfile={handleViewProfile}
          />
        </TabsContent>
      </Tabs>

      <ClientForm
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        onSave={handleSaveClient}
      />

      {selectedClient && (
        <ClientDetails
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          client={selectedClient}
          services={mockServices.filter(s => s.clientId === selectedClient.id)}
          preferences={mockPreferences.filter(p => p.clientId === selectedClient.id)}
        />
      )}
    </div>
  );
}
