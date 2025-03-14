import { useState } from "react";
import { QuickServiceCard } from "@/components/servicos/QuickServiceCard";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Dados de exemplo
const serviceCards = [
  {
    id: 1,
    clientName: "João Paulo",
    serviceName: "Corte Masculino",
    price: 50,
    duration: 30,
    status: 'waiting',
    time: undefined,
    professionalName: undefined
  },
  {
    id: 2,
    clientName: "Maria Silva",
    serviceName: "Coloração",
    price: 150,
    duration: 120,
    status: 'scheduled',
    time: "14:30",
    professionalName: "Ana Oliveira"
  },
  {
    id: 3,
    clientName: "Carlos Santos",
    serviceName: "Barba",
    price: 35,
    duration: 25,
    status: 'waiting',
    time: undefined,
    professionalName: undefined
  },
  {
    id: 4,
    clientName: "Fernanda Costa",
    serviceName: "Corte Feminino",
    price: 70,
    duration: 45,
    status: 'completed',
    time: "10:15",
    professionalName: "Patricia Mendes"
  },
  {
    id: 5,
    clientName: "Roberto Alves",
    serviceName: "Corte Masculino + Barba",
    price: 75,
    duration: 50,
    status: 'scheduled',
    time: "16:00",
    professionalName: "João Silva"
  },
  {
    id: 6,
    clientName: "Amanda Rocha",
    serviceName: "Manicure",
    price: 45,
    duration: 40,
    status: 'waiting',
    time: undefined,
    professionalName: undefined
  }
];

export default function ServiceCards() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const handleSchedule = (id: number) => {
    toast({
      title: "Serviço agendado",
      description: `O serviço #${id} foi agendado com sucesso!`,
    });
  };

  const handleComplete = (id: number) => {
    toast({
      title: "Serviço concluído",
      description: `O serviço #${id} foi marcado como concluído!`,
    });
  };

  const handleCall = (id: number) => {
    toast({
      title: "Contato iniciado",
      description: `Iniciando contato com o cliente do serviço #${id}.`,
    });
  };

  const handleViewDetails = (id: number) => {
    toast({
      title: "Detalhes",
      description: `Visualizando detalhes do serviço #${id}.`,
    });
  };

  // Filtrar os cards com base no termo de busca e na tab ativa
  const filteredCards = serviceCards.filter(card => {
    const matchesSearch = 
      card.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      card.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "waiting") return matchesSearch && card.status === 'waiting';
    if (activeTab === "scheduled") return matchesSearch && card.status === 'scheduled';
    if (activeTab === "completed") return matchesSearch && card.status === 'completed';
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral">Serviços Rápidos</h1>
          <p className="text-sm text-muted-foreground">
            Visualize e gerencie os serviços do salão
          </p>
        </div>
        <Button className="md:w-auto">
          <PlusCircle className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por cliente ou serviço..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 md:w-[400px]">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="waiting">Em Espera</TabsTrigger>
          <TabsTrigger value="scheduled">Agendados</TabsTrigger>
          <TabsTrigger value="completed">Concluídos</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCards.map(card => (
              <QuickServiceCard
                key={card.id}
                id={card.id}
                clientName={card.clientName}
                serviceName={card.serviceName}
                price={card.price}
                duration={card.duration}
                status={card.status as any}
                time={card.time}
                professionalName={card.professionalName}
                onSchedule={handleSchedule}
                onComplete={handleComplete}
                onCall={handleCall}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="waiting" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCards.map(card => (
              <QuickServiceCard
                key={card.id}
                id={card.id}
                clientName={card.clientName}
                serviceName={card.serviceName}
                price={card.price}
                duration={card.duration}
                status={card.status as any}
                time={card.time}
                professionalName={card.professionalName}
                onSchedule={handleSchedule}
                onComplete={handleComplete}
                onCall={handleCall}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCards.map(card => (
              <QuickServiceCard
                key={card.id}
                id={card.id}
                clientName={card.clientName}
                serviceName={card.serviceName}
                price={card.price}
                duration={card.duration}
                status={card.status as any}
                time={card.time}
                professionalName={card.professionalName}
                onSchedule={handleSchedule}
                onComplete={handleComplete}
                onCall={handleCall}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCards.map(card => (
              <QuickServiceCard
                key={card.id}
                id={card.id}
                clientName={card.clientName}
                serviceName={card.serviceName}
                price={card.price}
                duration={card.duration}
                status={card.status as any}
                time={card.time}
                professionalName={card.professionalName}
                onSchedule={handleSchedule}
                onComplete={handleComplete}
                onCall={handleCall}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 