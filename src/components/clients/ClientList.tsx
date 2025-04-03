import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pencil,
  Plus,
  Search,
  Download,
  Send,
  Eye,
  MoreHorizontal,
  Trash2,
  UserPlus,
  Filter,
  Copy,
  File,
  FileText,
  Columns,
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
} from "lucide-react";
import { Client, ClientExportOptions } from "@/types/client";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils";

interface ClientListProps {
  clients: Client[];
  onEditClient?: (client: Client) => void;
  onDeleteClient?: (clientId: string) => void;
  onCreateClient?: () => void;
}

interface ClientTotals {
  total: number;
  active: number;
  vip: number;
  inactive: number;
  percentageActive: number;
  percentageVip: number;
  percentageInactive: number;
}

export function ClientList() {
  const [clients, setClients] = useState<Client[]>([
    {
      id: "1",
      name: "João Silva",
      email: "joao.silva@example.com",
      phone: "5511999999999",
      birthDate: "1985-05-20",
      firstVisit: "2022-08-15",
      cpf: "123.456.789-00",
      address: "Rua das Flores, 123",
      photo: "/placeholder-client.jpg",
      status: "active",
      points: 120,
      cashback: 50.00,
      totalSpent: 1500.00,
      visitsCount: 10,
      lastVisit: "2023-11-05",
      observations: "Cliente fiel e sempre pontual.",
      tags: ["fiel", "pontual"],
      benefits: [{ type: "desconto", value: 10 }],
    },
    {
      id: "2",
      name: "Maria Oliveira",
      email: "maria.oliveira@example.com",
      phone: "5521988888888",
      birthDate: "1990-12-10",
      firstVisit: "2023-01-20",
      cpf: "456.789.123-11",
      address: "Avenida Central, 456",
      photo: "/placeholder-client.jpg",
      status: "vip",
      points: 250,
      cashback: 120.00,
      totalSpent: 3200.00,
      visitsCount: 22,
      lastVisit: "2023-11-12",
      observations: "Cliente VIP, sempre experimenta novos serviços.",
      tags: ["vip", "experimentador"],
      benefits: [{ type: "produto_gratis", value: 1 }],
    },
    {
      id: "3",
      name: "Carlos Souza",
      email: "carlos.souza@example.com",
      phone: "5531977777777",
      birthDate: "1978-03-25",
      firstVisit: "2022-11-01",
      cpf: "789.123.456-22",
      address: "Travessa da Paz, 789",
      photo: "/placeholder-client.jpg",
      status: "inactive",
      points: 30,
      cashback: 15.00,
      totalSpent: 450.00,
      visitsCount: 3,
      lastVisit: "2023-02-10",
      observations: "Cliente inativo, não visita há muito tempo.",
      tags: ["inativo"],
      benefits: [{ type: "desconto_reativacao", value: 15 }],
    },
    {
      id: "4",
      name: "Ana Pereira",
      email: "ana.pereira@example.com",
      phone: "5541966666666",
      birthDate: "1995-07-14",
      firstVisit: "2023-05-05",
      cpf: "234.567.890-33",
      address: "Largo do Sol, 101",
      photo: "/placeholder-client.jpg",
      status: "active",
      points: 80,
      cashback: 35.00,
      totalSpent: 900.00,
      visitsCount: 7,
      lastVisit: "2023-11-18",
      observations: "Cliente regular, gosta de serviços de manicure.",
      tags: ["regular", "manicure"],
      benefits: [{ type: "desconto_fidelidade", value: 5 }],
    },
    {
      id: "5",
      name: "Ricardo Alves",
      email: "ricardo.alves@example.com",
      phone: "5551955555555",
      birthDate: "1982-09-30",
      firstVisit: "2022-09-10",
      cpf: "567.890.123-44",
      address: "Praça da Estrela, 222",
      photo: "/placeholder-client.jpg",
      status: "vip",
      points: 300,
      cashback: 150.00,
      totalSpent: 4000.00,
      visitsCount: 28,
      lastVisit: "2023-11-25",
      observations: "Cliente VIP, sempre indica novos clientes.",
      tags: ["vip", "indicador"],
      benefits: [{ type: "servico_gratis", value: 1 }],
    },
  ]);
  const [search, setSearch] = useState("");
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);
  const [clientTotals, setClientTotals] = useState<ClientTotals>({
    total: 0,
    active: 0,
    vip: 0,
    inactive: 0,
    percentageActive: 0,
    percentageVip: 0,
    percentageInactive: 0,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterBirthdate, setFilterBirthdate] = useState<Date | undefined>(undefined);
  const [sorting, setSorting] = useState<{ column: string; direction: "asc" | "desc" } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    calculateTotals();
  }, [clients]);

  const calculateTotals = () => {
    const total = clients.length;
    const active = clients.filter(client => client.status === 'active').length;
    const vip = clients.filter(client => client.status === 'vip').length;
    const inactive = clients.filter(client => client.status === 'inactive').length;
    
    setClientTotals({
      total,
      active, 
      vip,
      inactive,
      percentageActive: total > 0 ? Math.round((active / total) * 100) : 0,
      percentageVip: total > 0 ? Math.round((vip / total) * 100) : 0,
      percentageInactive: total > 0 ? Math.round((inactive / total) * 100) : 0
    });
  };

  const filteredClients = clients.filter((client) => {
    const searchTerm = search.toLowerCase();
    const nameMatch = client.name.toLowerCase().includes(searchTerm);
    const emailMatch = client.email.toLowerCase().includes(searchTerm);
    const phoneMatch = client.phone.includes(searchTerm);

    let statusMatch = true;
    if (filterStatus.length > 0) {
      statusMatch = filterStatus.includes(client.status);
    }

    let birthdateMatch = true;
    if (filterBirthdate) {
      const birthdate = new Date(client.birthDate);
      birthdateMatch =
        birthdate.getDate() === filterBirthdate.getDate() &&
        birthdate.getMonth() === filterBirthdate.getMonth() &&
        birthdate.getFullYear() === filterBirthdate.getFullYear();
    }

    return nameMatch || emailMatch || phoneMatch && statusMatch && birthdateMatch;
  });

  const sortedClients = useCallback(
    (clients: Client[]) => {
      if (!sorting) return clients;

      const { column, direction } = sorting;
      return [...clients].sort((a, b) => {
        const aValue = a[column as keyof Client];
        const bValue = b[column as keyof Client];

        if (aValue === undefined || bValue === undefined) {
          return 0;
        }

        let comparison = 0;

        if (typeof aValue === "string" && typeof bValue === "string") {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue;
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }

        return direction === "asc" ? comparison : -comparison;
      });
    },
    [sorting]
  );

  const toggleSelectClient = (clientId: string) => {
    setSelectedClients((prevSelected) => {
      if (prevSelected.includes(clientId)) {
        return prevSelected.filter((id) => id !== clientId);
      } else {
        return [...prevSelected, clientId];
      }
    });
  };

  const toggleSelectAll = () => {
    setSelectAll((prevSelectAll) => {
      const newSelectAll = !prevSelectAll;
      setSelectAll(newSelectAll);

      if (newSelectAll) {
        setSelectedClients(clients.map((client) => client.id));
      } else {
        setSelectedClients([]);
      }

      return newSelectAll;
    });
  };

  const handleDeleteClient = (clientId: string) => {
    setClientToDelete(clientId);
    setDeleteConfirmationOpen(true);
  };

  const confirmDeleteClient = () => {
    if (clientToDelete) {
      setClients((prevClients) =>
        prevClients.filter((client) => client.id !== clientToDelete)
      );
      setDeleteConfirmationOpen(false);
      setClientToDelete(null);
      toast({
        title: "Cliente excluído",
        description: "O cliente foi removido da sua lista.",
      });
    }
  };

  const handleExport = async (format: string) => {
    setIsExporting(true);
    setExportFormat(format);
    
    const options: ClientExportOptions = {
      includeContact: true,
      includeAddress: true,
      includeServices: true,
      includeSpending: true,
      includePreferences: true,
      includeBirthday: true,
      includeTags: true,
      includeVisitHistory: true,
      includeCashbackHistory: true,
      includeAverageTicket: true,
      includeCharts: format !== 'excel',
      groupBy: 'none',
      sortBy: 'name',
      timeRange: '365',
      exportFormat: format,
      includeAnalytics: true
    };
    
    const selectedIds = selectedClients.length > 0 
      ? selectedClients 
      : clients.map(client => client.id);

    try {
      console.log("Exporting clients", { format, options, selectedIds });
      toast({
        title: "Exportando clientes",
        description: `O arquivo será gerado em formato ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao exportar",
        description: "Houve um problema ao gerar o arquivo.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyClientData = async () => {
    if (selectedClients.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum cliente selecionado",
        description: "Selecione ao menos um cliente para copiar os dados.",
      });
      return;
    }

    const copiedData = clients
      .filter((client) => selectedClients.includes(client.id))
      .map((client) => {
        return `Nome: ${client.name}\nEmail: ${client.email}\nTelefone: ${client.phone}`;
      })
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(copiedData);
      toast({
        title: "Dados copiados",
        description: "As informações dos clientes foram copiadas para a área de transferência.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao copiar",
        description: "Não foi possível copiar os dados para a área de transferência.",
      });
    }
  };

  const handleSendMessage = (clientId: string) => {
    const clientIdNum = parseInt(clientId);
    const client = clients.find(c => c.id === clientIdNum.toString());
    setSelectedClient(client);
    setMessageOpen(true);
  };

  const handleOpenClientProfile = (clientId: string) => {
    const clientIdNum = parseInt(clientId);
    const client = clients.find(c => c.id === clientIdNum.toString());
    setSelectedClient(client);
    setProfileOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            Gerencie seus clientes e veja informações importantes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
            <div className="col-span-3">
              <Input
                type="search"
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                <Filter className="mr-2 h-4 w-4" />
                Filtrar
              </Button>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </div>
        </CardContent>
        <ScrollArea>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setSorting({
                        column: "name",
                        direction:
                          sorting?.column === "name" && sorting.direction === "asc"
                            ? "desc"
                            : "asc",
                      })
                    }
                  >
                    Nome
                    {sorting?.column === "name" ? (
                      sorting.direction === "asc" ? (
                        <ArrowDown className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowUp className="ml-2 h-4 w-4" />
                      )
                    ) : (
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setSorting({
                        column: "email",
                        direction:
                          sorting?.column === "email" && sorting.direction === "asc"
                            ? "desc"
                            : "asc",
                      })
                    }
                  >
                    Email
                    {sorting?.column === "email" ? (
                      sorting.direction === "asc" ? (
                        <ArrowDown className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowUp className="ml-2 h-4 w-4" />
                      )
                    ) : (
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedClients(filteredClients).map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <Checkbox
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={() => toggleSelectClient(client.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={client.photo} />
                        <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{client.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`mailto:${client.email}`}
                      className="underline underline-offset-2 hover:text-primary"
                    >
                      {client.email}
                    </a>
                  </TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        client.status === "active"
                          ? "default"
                          : client.status === "vip"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenClientProfile(client.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendMessage(client.id)}>
                          <Send className="mr-2 h-4 w-4" />
                          Enviar Mensagem
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:bg-destructive/20"
                          onClick={() => handleDeleteClient(client.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <CardFooter className="flex items-center justify-between">
          <div>
            <p>
              Total: {clientTotals.total} | Ativos: {clientTotals.active} (
              {clientTotals.percentageActive}%) | VIP: {clientTotals.vip} (
              {clientTotals.percentageVip}%) | Inativos: {clientTotals.inactive} (
              {clientTotals.percentageInactive}%)
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={clients.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Exportar Clientes</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport("pdf")} disabled={isExporting}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")} disabled={isExporting}>
                <File className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyClientData}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar Dados
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>

      <AlertDialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá excluir o cliente permanentemente. Tem certeza que
              deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteClient}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedClient && (
        <AlertDialog open={messageOpen} onOpenChange={setMessageOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Enviar mensagem para {selectedClient.name}</AlertDialogTitle>
              <AlertDialogDescription>
                Digite a mensagem que você deseja enviar para o cliente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  placeholder="Digite sua mensagem aqui."
                  className="h-24"
                />
              </div>
            </AlertDialogContent>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction>Enviar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {selectedClient && (
        <AlertDialog open={profileOpen} onOpenChange={setProfileOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Perfil de {selectedClient.name}</AlertDialogTitle>
              <AlertDialogDescription>
                Veja as informações do cliente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={selectedClient.name} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={selectedClient.email} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={selectedClient.phone} disabled />
              </div>
            </AlertDialogContent>
            <AlertDialogFooter>
              <AlertDialogCancel>Fechar</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <AlertDialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Filtrar Clientes</AlertDialogTitle>
            <AlertDialogDescription>
              Selecione os filtros que você deseja aplicar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>Status</Label>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    checked={filterStatus.includes("active")}
                    onCheckedChange={(checked) =>
                      setFilterStatus((prev) =>
                        checked
                          ? [...prev, "active"]
                          : prev.filter((s) => s !== "active")
                      )
                    }
                  />
                  <Label htmlFor="active">Ativo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vip"
                    checked={filterStatus.includes("vip")}
                    onCheckedChange={(checked) =>
                      setFilterStatus((prev) =>
                        checked
                          ? [...prev, "vip"]
                          : prev.filter((s) => s !== "vip")
                      )
                    }
                  />
                  <Label htmlFor="vip">VIP</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inactive"
                    checked={filterStatus.includes("inactive")}
                    onCheckedChange={(checked) =>
                      setFilterStatus((prev) =>
                        checked
                          ? [...prev, "inactive"]
                          : prev.filter((s) => s !== "inactive")
                      )
                    }
                  />
                  <Label htmlFor="inactive">Inativo</Label>
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Data de Nascimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !filterBirthdate && "text-muted-foreground"
                    )}
                  >
                    {filterBirthdate ? (
                      format(filterBirthdate, "PPP", {locale: ptBR})
                    ) : (
                      <span>Selecionar data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center" side="bottom">
                  <Calendar
                    mode="single"
                    selected={filterBirthdate}
                    onSelect={setFilterBirthdate}
                    disabled={(date) =>
                      date > new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </AlertDialogContent>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setFilterStatus([]);
              setFilterBirthdate(undefined);
            }}>Limpar</AlertDialogCancel>
            <AlertDialogAction onClick={() => setIsFilterOpen(false)}>Filtrar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
