import { useState, useEffect, useMemo, useCallback } from "react";
import { AppointmentDialog } from "@/components/appointments/AppointmentDialog";
import { AppointmentFilters } from "@/components/appointments/AppointmentFilters";
import { WeeklyCalendar } from "@/components/appointments/WeeklyCalendar";
import { BlockTimeDialog } from "@/components/appointments/BlockTimeDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Calendar as CalendarIcon, 
  List, 
  Plus,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  LayoutDashboard,
  Filter,
  Ban,
  BarChart,
  Download,
  FileText,
  Check,
  User,
  FileDown,
  File,
  Search,
  Loader2,
  X,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Activity,
  MoreVertical,
  Palette,
  Calendar
} from "lucide-react";
import type { BlockTimeData } from "@/components/appointments/BlockTimeDialog";
import { AppointmentList } from "@/components/appointments/AppointmentList";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, addMonths, subDays, eachDayOfInterval, endOfMonth, endOfWeek, isSameDay, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Appointment, Professional } from "@/types/appointment";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as ReactCalendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { DateRange } from "react-day-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormCard } from "@/components/shared/FormCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Temporary mock data
const professionals: Professional[] = [
  { 
    id: 1, 
    name: "Ana Silva",
    specialties: ["Corte", "Coloração"],
    schedule: {
      "1": { start: "09:00", end: "18:00" },
      "2": { start: "09:00", end: "18:00" },
      "3": { start: "09:00", end: "18:00" },
      "4": { start: "09:00", end: "18:00" },
      "5": { start: "09:00", end: "18:00" },
      "6": { start: "09:00", end: "14:00" }
    }
  },
  { 
    id: 2, 
    name: "Carlos Santos",
    specialties: ["Barba", "Corte Masculino"],
    schedule: {
      "1": { start: "10:00", end: "19:00" },
      "2": { start: "10:00", end: "19:00" },
      "3": { start: "10:00", end: "19:00" },
      "4": { start: "10:00", end: "19:00" },
      "5": { start: "10:00", end: "19:00" },
      "6": { start: "10:00", end: "15:00" }
    }
  },
  { 
    id: 3, 
    name: "Maria Oliveira",
    specialties: ["Manicure", "Pedicure"],
    schedule: {
      "1": { start: "08:00", end: "17:00" },
      "2": { start: "08:00", end: "17:00" },
      "3": { start: "08:00", end: "17:00" },
      "4": { start: "08:00", end: "17:00" },
      "5": { start: "08:00", end: "17:00" }
    }
  },
];

// Ampliando dados de exemplo para mostrar mais casos
const mockAppointments: Appointment[] = [
  {
    id: 1,
    clientId: 1,
    clientName: "João Paulo",
    professionalId: 1,
    professionalName: "Ana Silva",
    services: [
      { id: 1, name: "Corte Masculino", duration: 30, price: 50 }
    ],
    date: new Date(),
    startTime: "10:00",
    endTime: "10:30",
    duration: 30,
    status: "confirmed",
    paymentStatus: "pending",
    totalValue: 50,
    notes: "Cliente prefere corte mais curto"
  },
  {
    id: 2,
    clientId: 2,
    clientName: "Maria Clara",
    professionalId: 3,
    professionalName: "Maria Oliveira",
    services: [
      { id: 2, name: "Manicure", duration: 60, price: 45 }
    ],
    date: new Date(),
    startTime: "14:30",
    endTime: "15:30",
    duration: 60,
    status: "pending",
    paymentStatus: "pending",
    totalValue: 45
  },
  {
    id: 3,
    clientId: 3,
    clientName: "Carlos Mendes",
    professionalId: 2,
    professionalName: "Carlos Santos",
    services: [
      { id: 3, name: "Barba", duration: 30, price: 35 }
    ],
    date: addDays(new Date(), 1),
    startTime: "11:00",
    endTime: "11:30",
    duration: 30,
    status: "confirmed",
    paymentStatus: "paid",
    totalValue: 35
  },
  {
    id: 4,
    clientId: 4,
    clientName: "Fernanda Alves",
    professionalId: 1,
    professionalName: "Ana Silva",
    services: [
      { id: 4, name: "Coloração", duration: 120, price: 150 }
    ],
    date: subDays(new Date(), 1),
    startTime: "13:00",
    endTime: "15:00",
    duration: 120,
    status: "completed",
    paymentStatus: "paid",
    totalValue: 150
  }
];

// Extrair lista de clientes únicos dos agendamentos para filtro
const uniqueClients = Array.from(new Set(mockAppointments.map(app => app.clientId)))
  .map(clientId => {
    const appointment = mockAppointments.find(app => app.clientId === clientId);
    return {
      id: clientId,
      name: appointment?.clientName || ""
    };
  })
  .filter(client => client.name !== "")
  .sort((a, b) => a.name.localeCompare(b.name));

const Appointments = () => {
  const [openAppointmentDialog, setOpenAppointmentDialog] = useState(false);
  const [openBlockTimeDialog, setOpenBlockTimeDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedView, setSelectedView] = useState<"day" | "week" | "month">("week");
  const [selectedProfessional, setSelectedProfessional] = useState<number | null>(null);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<Appointment["status"][]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isTableView, setIsTableView] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date()),
  });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [isBlockTimeDialogOpen, setIsBlockTimeDialogOpen] = useState(false);
  const [blockTimeData, setBlockTimeData] = useState<BlockTimeData | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const { toast } = useToast();

  const formSchema = z.object({
    professional: z.string().min(2, {
      message: "Selecione um profissional.",
    }),
    client: z.string().min(2, {
      message: "Selecione um cliente.",
    }),
    date: z.date({
      required_error: "Uma data precisa ser selecionada.",
    }),
    startTime: z.string().min(5, {
      message: "Selecione um horário de início.",
    }),
    endTime: z.string().min(5, {
      message: "Selecione um horário de término.",
    }),
    services: z.array(z.object({
      id: z.number(),
      name: z.string(),
      duration: z.number(),
      price: z.number()
    })).min(1, {
      message: "Selecione pelo menos um serviço.",
    }),
    notes: z.string().optional(),
    status: z.enum(["confirmed", "pending", "canceled", "completed"]).default("pending"),
    paymentStatus: z.enum(["pending", "paid"]).default("pending"),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      professional: "",
      client: "",
      date: new Date(),
      startTime: "08:00",
      endTime: "08:30",
      services: [],
      notes: "",
      status: "pending",
      paymentStatus: "pending",
    },
  })

  const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    console.log("Form values:", values);
    toast({
      title: "Sucesso!",
      description: "Agendamento criado com sucesso.",
      variant: "success"
    });
    setOpenAppointmentDialog(false);
  }, [toast]);

  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];

    if (selectedProfessional) {
      filtered = filtered.filter(appointment => appointment.professionalId === selectedProfessional);
    }

    if (selectedClient) {
      filtered = filtered.filter(appointment => appointment.clientId === selectedClient);
    }

    if (appointmentStatusFilter.length > 0) {
      filtered = filtered.filter(appointment => appointmentStatusFilter.includes(appointment.status));
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(appointment =>
        appointment.clientName.toLowerCase().includes(lowerCaseSearchTerm) ||
        appointment.professionalName.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter(appointment => {
        const appointmentDate = appointment.date;
        return appointmentDate >= dateRange.from! && appointmentDate <= dateRange.to!;
      });
    }

    return filtered;
  }, [appointments, selectedProfessional, selectedClient, appointmentStatusFilter, searchTerm, dateRange]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleViewChange = (view: "day" | "week" | "month") => {
    setSelectedView(view);
  };

  const handleProfessionalFilterChange = (professionalId: number | null) => {
    setSelectedProfessional(professionalId);
  };

  const handleClientFilterChange = (clientId: number | null) => {
    setSelectedClient(clientId);
  };

  const handleStatusFilterChange = (status: Appointment["status"][]) => {
    setAppointmentStatusFilter(status);
  };

  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleOpenFilters = () => {
    setIsFiltersOpen(true);
  };

  const handleCloseFilters = () => {
    setIsFiltersOpen(false);
  };

  const handleToggleTableView = () => {
    setIsTableView(!isTableView);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const handleOpenAppointmentDialog = (appointment?: Appointment) => {
    if (appointment) {
      setSelectedAppointment(appointment);
      form.setValue("professional", String(appointment.professionalId));
      form.setValue("client", String(appointment.clientId));
      form.setValue("date", appointment.date);
      form.setValue("startTime", appointment.startTime);
      form.setValue("endTime", appointment.endTime);
      //form.setValue("services", appointment.services); // Ajuste aqui
      form.setValue("notes", appointment.notes || "");
      form.setValue("status", appointment.status);
      form.setValue("paymentStatus", appointment.paymentStatus);
    } else {
      setSelectedAppointment(null);
      form.reset();
    }
    setIsAppointmentDialogOpen(true);
  };

  const handleCloseAppointmentDialog = () => {
    setIsAppointmentDialogOpen(false);
    setSelectedAppointment(null);
    form.reset();
  };

  const handleOpenBlockTimeDialog = (data: BlockTimeData | null = null) => {
    setBlockTimeData(data);
    setIsBlockTimeDialogOpen(true);
  };

  const handleCloseBlockTimeDialog = () => {
    setIsBlockTimeDialogOpen(false);
    setBlockTimeData(null);
  };

  const handleAppointmentStatusChange = (appointmentId: number, status: Appointment["status"]) => {
    setAppointments(appointments.map(appointment => {
      if (appointment.id === appointmentId) {
        return { ...appointment, status: status };
      }
      return appointment;
    }));
  };

  const handleAppointmentReschedule = (appointmentId: number) => {
    const appointment = appointments.find(appointment => appointment.id === appointmentId);
    if (appointment) {
      handleOpenAppointmentDialog(appointment);
    }
  };

  const handleSlotClick = (date: Date, time: string) => {
    form.setValue("date", date);
    form.setValue("startTime", time);
    form.setValue("endTime", time);
    handleOpenAppointmentDialog();
  };

  const handleExportAppointments = async () => {
    setIsExporting(true);
    try {
      // Convertendo os dados para CSV
      const csvData = convertToCSV(appointments);

      // Criando um Blob com os dados CSV
      const blob = new Blob([csvData], { type: 'text/csv' });

      // Criando um link para download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `appointments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Exportação Completa!",
        description: "Os agendamentos foram exportados com sucesso para CSV.",
        variant: "success"
      });
    } catch (error) {
      console.error("Erro ao exportar agendamentos:", error);
      toast({
        title: "Erro ao Exportar",
        description: "Houve um erro ao exportar os agendamentos.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportAppointments = async () => {
    setIsImporting(true);
    try {
      if (!importedFile) {
        toast({
          title: "Nenhum Arquivo Selecionado",
          description: "Por favor, selecione um arquivo CSV para importar.",
          variant: "warning"
        });
        return;
      }

      const text = await importedFile.text();
      const importedAppointments = await convertCSVToAppointments(text);

      setAppointments(prevAppointments => [...prevAppointments, ...importedAppointments]);

      toast({
        title: "Importação Completa!",
        description: `${importedAppointments.length} agendamentos importados com sucesso.`,
        variant: "success"
      });
    } catch (error) {
      console.error("Erro ao importar agendamentos:", error);
      toast({
        title: "Erro ao Importar",
        description: "Houve um erro ao importar os agendamentos. Verifique o formato do arquivo.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      setImportedFile(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImportedFile(event.target.files[0]);
    }
  };

  const handleDeleteAppointment = (appointmentId: number) => {
    setAppointmentToDelete(appointmentId);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (appointmentToDelete !== null) {
      setAppointments(appointments.filter(appointment => appointment.id !== appointmentToDelete));
      setIsConfirmDeleteOpen(false);
      setAppointmentToDelete(null);
      toast({
        title: "Agendamento Excluído",
        description: "O agendamento foi excluído com sucesso.",
        variant: "success"
      });
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmDeleteOpen(false);
    setAppointmentToDelete(null);
  };

  return (
    <PageLayout header={(
      <PageHeader 
        title="Agendamentos" 
        subtitle="Gerencie seus agendamentos de forma eficiente"
        action={(
          <div className="flex gap-2">
            <Button onClick={handleOpenAppointmentDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
            <Button variant="outline" onClick={handleOpenBlockTimeDialog}>
              <Ban className="w-4 h-4 mr-2" />
              Bloquear Horário
            </Button>
          </div>
        )}
      />
    )}>
      <FormCard>
        <Tabs defaultValue="calendar" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 mr-2" />
                Calendário
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="w-4 h-4 mr-2" />
                Lista
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={handleOpenFilters}>
                <Filter className="w-4 h-4" />
              </Button>
              <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                    <SheetDescription>
                      Selecione os filtros desejados para refinar a lista de agendamentos.
                    </SheetDescription>
                  </SheetHeader>
                  <AppointmentFilters
                    selectedDate={selectedDate}
                    selectedView={selectedView}
                    selectedProfessional={selectedProfessional}
                    selectedClient={selectedClient}
                    appointmentStatusFilter={appointmentStatusFilter}
                    searchTerm={searchTerm}
                    dateRange={dateRange}
                    onDateSelect={handleDateSelect}
                    onViewChange={handleViewChange}
                    onProfessionalFilterChange={handleProfessionalFilterChange}
                    onClientFilterChange={handleClientFilterChange}
                    onStatusFilterChange={handleStatusFilterChange}
                    onSearchTermChange={handleSearchTermChange}
                    onDateRangeChange={handleDateRangeChange}
                    onClose={handleCloseFilters}
                    uniqueClients={uniqueClients}
                    professionals={professionals}
                  />
                </SheetContent>
              </Sheet>
              <Button variant="outline" size="icon" onClick={handleToggleTableView}>
                {isTableView ? <CalendarDays className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="flex flex-col space-y-2">
                    <Button variant="ghost" className="justify-start" onClick={handleExportAppointments} disabled={isExporting}>
                      {isExporting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Exportando...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Exportar para CSV
                        </>
                      )}
                    </Button>
                    <Separator />
                    <div>
                      <Label htmlFor="import" className="text-sm text-muted-foreground">
                        Importar de CSV
                      </Label>
                      <Input
                        type="file"
                        id="import"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="flex items-center justify-between">
                        <Label htmlFor="import" className="cursor-pointer mt-2 flex items-center gap-2">
                          <FileDown className="w-4 h-4" />
                          {importedFile ? importedFile.name : "Selecionar Arquivo"}
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleImportAppointments}
                          disabled={isImporting}
                        >
                          {isImporting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Importando...
                            </>
                          ) : (
                            <>
                              <File className="mr-2 h-4 w-4" />
                              Importar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <TabsContent value="calendar" className="space-y-4">
            <WeeklyCalendar 
              selectedDate={selectedDate}
              appointments={filteredAppointments}
              professionals={professionals}
              mode={selectedView}
              onStatusChange={handleAppointmentStatusChange}
              onReschedule={handleAppointmentReschedule}
              onSlotClick={handleSlotClick}
            />
          </TabsContent>
          <TabsContent value="list" className="space-y-4">
            <AppointmentList 
              appointments={filteredAppointments} 
              onEdit={handleOpenAppointmentDialog}
              onDelete={handleDeleteAppointment}
            />
          </TabsContent>
        </Tabs>
      </FormCard>

      <AppointmentDialog 
        open={isAppointmentDialogOpen}
        onOpenChange={setIsAppointmentDialogOpen}
        onClose={handleCloseAppointmentDialog}
        form={form}
        onSubmit={onSubmit}
        professionals={professionals}
        uniqueClients={uniqueClients}
      />

      <BlockTimeDialog 
        open={isBlockTimeDialogOpen}
        onOpenChange={setIsBlockTimeDialogOpen}
        onClose={handleCloseBlockTimeDialog}
        data={blockTimeData}
      />

      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleCancelDelete}>
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

// Importante: Adicionar a exportação padrão para resolver o problema de carregamento lazy
export default Appointments;

// Function to convert appointments data to CSV format
function convertToCSV(appointments: Appointment[]): string {
  const headers = [
    "ID",
    "Cliente",
    "Profissional",
    "Serviços",
    "Data",
    "Início",
    "Fim",
    "Duração",
    "Status",
    "Pagamento",
    "Valor Total",
    "Notas"
  ];

  const rows = appointments.map(appointment => {
    const services = appointment.services.map(service => service.name).join(", ");
    const formattedDate = format(appointment.date, "dd/MM/yyyy", { locale: ptBR });

    return [
      appointment.id,
      appointment.clientName,
      appointment.professionalName,
      services,
      formattedDate,
      appointment.startTime,
      appointment.endTime,
      appointment.duration,
      appointment.status,
      appointment.paymentStatus,
      appointment.totalValue,
      appointment.notes || ""
    ];
  });

  const csv = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  return csv;
}

// Function to convert CSV data to appointments array
async function convertCSVToAppointments(csvText: string): Promise<Appointment[]> {
  const lines = csvText.split("\n");
  const headers = lines[0].split(",").map(header => header.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",").map(cell => cell.trim());

    if (row.length === headers.length) {
      const appointment: Appointment = {
        id: parseInt(row[0]),
        clientId: 1, //parseInt(row[1]),
        clientName: row[1],
        professionalId: 1, //parseInt(row[2]),
        professionalName: row[2],
        services: [{ id: 1, name: row[3], duration: 60, price: 50 }],
        date: new Date(), //new Date(row[4]),
        startTime: row[5],
        endTime: row[6],
        duration: parseInt(row[7]),
        status: row[8] as Appointment["status"],
        paymentStatus: row[9] as Appointment["paymentStatus"],
        totalValue: parseFloat(row[10]),
        notes: row[11]
      };
      data.push(appointment);
    }
  }

  return data;
}
