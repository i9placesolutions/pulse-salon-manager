import { useState, useEffect } from "react";
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
  CheckCircle2
} from "lucide-react";
import type { BlockTimeFormData } from "@/components/appointments/BlockTimeDialog";
import { AppointmentList } from "@/components/appointments/AppointmentList";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, addMonths, subMonths, subDays } from "date-fns";
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
  SheetDescription
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { DateRange } from "react-day-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "list">("week");
  const [isBlockTimeOpen, setIsBlockTimeOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>(mockAppointments);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  
  // Estados para controle de modais
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleTime, setRescheduleTime] = useState<string>("");
  const [rescheduleProfessional, setRescheduleProfessional] = useState<string>("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [statusAction, setStatusAction] = useState<"confirm" | "cancel" | null>(null);
  
  // Estado para controlar o modal de novo agendamento
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [newAppointmentDate, setNewAppointmentDate] = useState<Date | undefined>(undefined);
  const [newAppointmentTime, setNewAppointmentTime] = useState<string>("");
  
  // Estado para controlar o modal de relatórios
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportDateRange, setReportDateRange] = useState<DateRange>({ 
    from: new Date(), 
    to: addDays(new Date(), 30) 
  });
  const [reportProfessionalFilter, setReportProfessionalFilter] = useState<string[]>([]);
  const [reportStatusFilter, setReportStatusFilter] = useState<string[]>([]);
  const [reportServiceFilter, setReportServiceFilter] = useState<string[]>([]);
  const [reportPaymentStatusFilter, setReportPaymentStatusFilter] = useState<string[]>([]);
  const [reportSortBy, setReportSortBy] = useState<string>("date");
  const [reportClientSearch, setReportClientSearch] = useState<string>("");
  const [reportClientFilter, setReportClientFilter] = useState<string[]>([]);
  
  // Novos estados para o relatório
  const [generatedReport, setGeneratedReport] = useState<Appointment[]>([]);
  const [filteredReport, setFilteredReport] = useState<Appointment[]>([]);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [showReportResults, setShowReportResults] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    // Simulando um carregamento de dados
    setIsCalendarLoading(true);
    const filterAppointments = () => {
      return mockAppointments.filter(appointment => {
        const matchesProfessional = selectedProfessional 
          ? appointment.professionalId === parseInt(selectedProfessional)
          : true;
        
        const matchesStatus = statusFilter
          ? appointment.status === statusFilter
          : true;
        
        const matchesSearch = searchTerm
          ? appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.services.some(service => 
              service.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : true;
          
        return matchesProfessional && matchesStatus && matchesSearch;
      });
    };
    
    // Simulando um pequeno delay de carregamento para mostrar animação
    setTimeout(() => {
      setFilteredAppointments(filterAppointments());
      setIsCalendarLoading(false);
    }, 300);
  }, [selectedProfessional, statusFilter, searchTerm, selectedDate]);

  const handleStatusChange = (appointmentId: number, newStatus: Appointment["status"]) => {
    // Simulando uma atualização de estado com animação
    const updatedAppointments = filteredAppointments.map(app => 
      app.id === appointmentId ? {...app, status: newStatus} : app
    );
    
    setFilteredAppointments(updatedAppointments);
    
    // Feedback visual ao usuário
    toast({
      title: "Status atualizado",
      description: `Agendamento ${appointmentId} alterado para ${
        newStatus === "confirmed" ? "confirmado" : 
        newStatus === "canceled" ? "cancelado" : 
        newStatus === "pending" ? "pendente" : "concluído"
      }`,
      variant: newStatus === "confirmed" ? "default" : 
              newStatus === "canceled" ? "destructive" : undefined,
    });
  };

  // Nova função para iniciar o processo de alteração de status com confirmação
  const handleStatusChangeWithConfirmation = (appointment: Appointment, newStatus: "confirm" | "cancel") => {
    setSelectedAppointment(appointment);
    setStatusAction(newStatus);
    setConfirmDialogOpen(true);
  };

  // Função para confirmar a alteração de status após confirmação do usuário
  const confirmStatusChange = () => {
    if (selectedAppointment && statusAction) {
      handleStatusChange(
        selectedAppointment.id, 
        statusAction === "confirm" ? "confirmed" : "canceled"
      );
      setConfirmDialogOpen(false);
    }
  };

  const handleReschedule = (appointmentId: number) => {
    // Encontrar o agendamento selecionado
    const appointment = filteredAppointments.find(app => app.id === appointmentId);
    if (appointment) {
      setSelectedAppointment(appointment);
      setRescheduleDate(appointment.date);
      setRescheduleTime(appointment.startTime);
      setRescheduleProfessional(String(appointment.professionalId));
      setIsRescheduleOpen(true);
    }
  };

  // Nova função para confirmar o reagendamento
  const confirmReschedule = () => {
    if (selectedAppointment && rescheduleDate && rescheduleTime) {
      // Aqui você faria a chamada para a API para reagendar
      // Simulando atualização do agendamento
      const updatedAppointments = filteredAppointments.map(app => 
        app.id === selectedAppointment.id 
          ? {
              ...app, 
              date: rescheduleDate,
              startTime: rescheduleTime,
              professionalId: rescheduleProfessional ? parseInt(rescheduleProfessional) : app.professionalId,
              professionalName: rescheduleProfessional 
                ? professionals.find(p => p.id === parseInt(rescheduleProfessional))?.name || app.professionalName
                : app.professionalName
            } 
          : app
      );
      
      setFilteredAppointments(updatedAppointments);
      setIsRescheduleOpen(false);
      
      toast({
        title: "Reagendamento",
        description: "Agendamento reagendado com sucesso",
      });
    }
  };

  const handleBlockTime = (professionalId: number, date: Date, startTime: string, endTime: string) => {
    // Aqui seria a chamada para a API para bloquear horário
    toast({
      title: "Horário bloqueado",
      description: `Horário bloqueado para ${format(date, "dd/MM/yyyy")} das ${startTime} às ${endTime}`,
    });
  };
  
  const navigateDate = (direction: 'next' | 'prev') => {
    setIsCalendarLoading(true);
    
    // Efeito de feedback visual
    setTimeout(() => {
      if (direction === 'next') {
        if (viewMode === 'day') setSelectedDate(prev => addDays(prev, 1));
        else if (viewMode === 'week') setSelectedDate(prev => addDays(prev, 7));
        else setSelectedDate(prev => addMonths(prev, 1));
      } else {
        if (viewMode === 'day') setSelectedDate(prev => subDays(prev, 1));
        else if (viewMode === 'week') setSelectedDate(prev => subDays(prev, 7));
        else setSelectedDate(prev => subMonths(prev, 1));
      }
      setIsCalendarLoading(false);
    }, 200);
  };
  
  // Dashboard de metadados
  const getStatusCounts = () => {
    const counts = {
      confirmed: filteredAppointments.filter(a => a.status === 'confirmed').length,
      pending: filteredAppointments.filter(a => a.status === 'pending').length,
      canceled: filteredAppointments.filter(a => a.status === 'canceled').length,
      completed: filteredAppointments.filter(a => a.status === 'completed').length,
    };
    return counts;
  };
  
  const statusCounts = getStatusCounts();

  // Função para lidar com clique em um slot vazio
  const handleSlotClick = (date: Date, time: string) => {
    setNewAppointmentDate(date);
    setNewAppointmentTime(time);
    setNewAppointmentOpen(true);
  };

  // Efeito para atualizar o relatório quando os filtros são alterados
  useEffect(() => {
    if (showReportResults) {
      // Só atualiza se já estiver mostrando resultados
      const filteredAppointments = filterAppointmentsForReport();
      const sortedAppointments = sortReportResults(filteredAppointments);
      setGeneratedReport(sortedAppointments);
      
      // Log para debug
      console.log("Filtros atualizados:", {
        clientSearch: reportClientSearch,
        clientFilter: reportClientFilter,
        resultCount: sortedAppointments.length,
      });
    }
  }, [reportClientSearch, reportClientFilter, showReportResults, 
     // Incluímos todas as dependências do filterAppointmentsForReport e sortReportResults
     reportDateRange, reportProfessionalFilter, reportStatusFilter, 
     reportPaymentStatusFilter, reportSortBy]);

  // Função para filtrar agendamentos conforme os critérios do relatório
  const filterAppointmentsForReport = (): Appointment[] => {
    // Log para debug
    console.log("Executando filtro com busca:", reportClientSearch);
    
    return mockAppointments.filter(appointment => {
      // Filtragem por data
      const appointmentDate = new Date(appointment.date);
      const matchesDateRange = 
        (!reportDateRange.from || appointmentDate >= reportDateRange.from) &&
        (!reportDateRange.to || appointmentDate <= reportDateRange.to);
      
      // Filtragem por profissional
      const matchesProfessional = reportProfessionalFilter.length === 0 
        ? true 
        : reportProfessionalFilter.includes(String(appointment.professionalId));
      
      // Filtragem por status
      const matchesStatus = reportStatusFilter.length === 0
        ? true
        : reportStatusFilter.includes(appointment.status);
      
      // Filtragem por status de pagamento
      const matchesPaymentStatus = reportPaymentStatusFilter.length === 0
        ? true
        : reportPaymentStatusFilter.includes(appointment.paymentStatus);
      
      // Filtragem por cliente (busca por nome)
      const matchesClientSearch = reportClientSearch.trim() === ""
        ? true
        : appointment.clientName.toLowerCase().includes(reportClientSearch.toLowerCase());
      
      // Filtragem por cliente específico (dropdown)
      const matchesClientFilter = reportClientFilter.length === 0
        ? true
        : reportClientFilter.includes(String(appointment.clientId));
      
      // Resultado final combinando todos os filtros
      return matchesDateRange && matchesProfessional && matchesStatus && 
             matchesPaymentStatus && matchesClientSearch && matchesClientFilter;
    });
  };

  // Função para ordenar os resultados
  const sortReportResults = (appointments: Appointment[]): Appointment[] => {
    return [...appointments].sort((a, b) => {
      switch (reportSortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'professional':
          return a.professionalName.localeCompare(b.professionalName);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'client':
          return a.clientName.localeCompare(b.clientName);
        default:
          return 0;
      }
    });
  };

  // Função para gerar o relatório
  const generateReport = () => {
    setIsReportLoading(true);
    
    // Simulando processamento
    setTimeout(() => {
      try {
        // Filtrar e ordenar os agendamentos
        const filteredAppointments = filterAppointmentsForReport();
        const sortedAppointments = sortReportResults(filteredAppointments);
        
        // Aplicar o filtro de busca por nome, se houver
        let resultsWithClientFilter = sortedAppointments;
        if (reportClientSearch.trim() !== "") {
          resultsWithClientFilter = sortedAppointments.filter(app => 
            app.clientName.toLowerCase().includes(reportClientSearch.toLowerCase())
          );
        }
        
        // Atualizar o estado com os resultados
        setGeneratedReport(sortedAppointments);
        setFilteredReport(resultsWithClientFilter); // Inicializa já com o filtro de cliente aplicado
        setShowReportResults(true);
        setIsReportLoading(false);
        
        toast({
          title: "Relatório gerado",
          description: `Foram encontrados ${resultsWithClientFilter.length} agendamentos. Para salvar o relatório, clique em Exportar.`,
        });
      } catch (error) {
        setIsReportLoading(false);
        toast({
          title: "Erro ao gerar relatório",
          description: "Ocorreu um erro ao processar os dados do relatório.",
          variant: "destructive"
        });
      }
    }, 1000);
  };

  // Função para exportar o relatório para CSV
  const exportReportToCSV = () => {
    setIsReportLoading(true);
    
    try {
      // Filtrar e ordenar os agendamentos se ainda não tiver gerado
      const dataToExport = generatedReport.length > 0 
        ? generatedReport 
        : sortReportResults(filterAppointmentsForReport());
      
      // Criar cabeçalhos do CSV
      const headers = [
        'ID', 'Cliente', 'Profissional', 'Serviços', 
        'Data', 'Horário', 'Duração', 'Status', 
        'Pagamento', 'Valor Total', 'Observações'
      ];
      
      // Criar linhas do CSV
      const rows = dataToExport.map(appointment => [
        appointment.id,
        appointment.clientName,
        appointment.professionalName,
        appointment.services.map(s => s.name).join(' + '),
        format(new Date(appointment.date), 'dd/MM/yyyy'),
        `${appointment.startTime} - ${appointment.endTime}`,
        `${appointment.duration} min`,
        appointment.status === 'confirmed' ? 'Confirmado' :
          appointment.status === 'pending' ? 'Pendente' :
          appointment.status === 'canceled' ? 'Cancelado' : 'Concluído',
        appointment.paymentStatus === 'paid' ? 'Pago' : 'Pendente',
        `R$ ${appointment.totalValue.toFixed(2)}`,
        appointment.notes || ''
      ]);
      
      // Combinar cabeçalhos e linhas
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Criar blob e link para download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Configurar link para download
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_agendamentos_${format(new Date(), 'dd-MM-yyyy')}.csv`);
      document.body.appendChild(link);
      
      // Simular click no link
      link.click();
      
      // Remover o link após o download
      document.body.removeChild(link);
      
      setIsReportLoading(false);
      toast({
        title: "Relatório exportado",
        description: "O arquivo CSV foi baixado com sucesso.",
      });
    } catch (error) {
      setIsReportLoading(false);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar o relatório.",
        variant: "destructive"
      });
    }
  };

  // Função para exportar para PDF (implementando download real)
  const exportReportToPDF = () => {
    setIsReportLoading(true);
    
    try {
      // Filtrar e ordenar os agendamentos se ainda não tiver gerado
      const dataToExport = generatedReport.length > 0 
        ? generatedReport 
        : sortReportResults(filterAppointmentsForReport());
      
      // Simulando a criação de um PDF (na prática seria usado uma biblioteca como jsPDF)
      // Por enquanto, vamos simular com um arquivo HTML que pode ser convertido para PDF pelo navegador
      
      // Criar conteúdo HTML para download
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Relatório de Agendamentos</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2 { color: #333; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .confirmado { color: green; }
            .pendente { color: orange; }
            .cancelado { color: red; }
            .concluido { color: blue; }
            .sumario { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
            @media print {
              body { font-size: 12pt; }
              h1 { font-size: 18pt; }
              h2 { font-size: 16pt; }
              .pagebreak { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <h1>Relatório de Agendamentos (PDF)</h1>
          <p>Data de geração: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          
          <div class="sumario">
            <h2>Resumo</h2>
            <p>Total de agendamentos: ${dataToExport.length}</p>
            <p>Valor total: R$ ${dataToExport.reduce((sum, app) => sum + app.totalValue, 0).toFixed(2)}</p>
            <p>Valor médio: R$ ${(dataToExport.reduce((sum, app) => sum + app.totalValue, 0) / dataToExport.length).toFixed(2)}</p>
          </div>
          
          <table>
            <tr>
              <th>Data</th>
              <th>Cliente</th>
              <th>Profissional</th>
              <th>Serviço</th>
              <th>Horário</th>
              <th>Status</th>
              <th>Pagamento</th>
              <th>Valor</th>
            </tr>
            ${dataToExport.map(app => `
              <tr>
                <td>${format(new Date(app.date), 'dd/MM/yyyy')}</td>
                <td>${app.clientName}</td>
                <td>${app.professionalName}</td>
                <td>${app.services.map(s => s.name).join(', ')}</td>
                <td>${app.startTime} - ${app.endTime}</td>
                <td class="${app.status === 'confirmed' ? 'confirmado' : 
                            app.status === 'pending' ? 'pendente' : 
                            app.status === 'canceled' ? 'cancelado' : 'concluido'}">
                  ${app.status === 'confirmed' ? 'Confirmado' : 
                    app.status === 'pending' ? 'Pendente' : 
                    app.status === 'canceled' ? 'Cancelado' : 'Concluído'}
                </td>
                <td>${app.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}</td>
                <td>R$ ${app.totalValue.toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
        </body>
        </html>
      `;
      
      // Criar blob e link para download
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Configurar link para download
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_agendamentos_${format(new Date(), 'dd-MM-yyyy_HH-mm')}_pdf.html`);
      document.body.appendChild(link);
      
      // Simular click no link
      link.click();
      
      // Remover o link após o download
      document.body.removeChild(link);
      
      setIsReportLoading(false);
      toast({
        title: "PDF gerado",
        description: "O arquivo PDF foi baixado com sucesso.",
      });
    } catch (error) {
      setIsReportLoading(false);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar o relatório para PDF.",
        variant: "destructive"
      });
    }
  };
  
  // Função para limpar todos os filtros do relatório
  const clearReportFilters = () => {
    setReportDateRange({ from: new Date(), to: addDays(new Date(), 30) });
    setReportProfessionalFilter([]);
    setReportStatusFilter([]);
    setReportServiceFilter([]);
    setReportPaymentStatusFilter([]);
    setReportSortBy("date");
    setReportClientSearch("");
    setReportClientFilter([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-neutral">Agendamentos</h1>
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Agendamento
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-full max-w-full sm:max-w-2xl border-l flex flex-col h-[100dvh] bg-white">
              {/* Cabeçalho fixo */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 border-b">
                <SheetHeader className="p-6">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="text-xl flex items-center gap-2 text-white">
                      <CalendarClock className="h-5 w-5 text-white" />
                      Novo Agendamento
                    </SheetTitle>
                    <SheetClose className="rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-white">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Fechar</span>
                    </SheetClose>
                  </div>
                  <SheetDescription className="text-blue-100">
                    Preencha o formulário para criar um novo agendamento
                  </SheetDescription>
                </SheetHeader>
              </div>
              
              {/* Conteúdo rolável */}
              <div className="flex-1 overflow-y-auto bg-white">
                <div className="p-6">
                  <AppointmentDialog
                    isOpen={true}
                    onOpenChange={() => {}}
                    initialDate={newAppointmentDate}
                    initialTime={newAppointmentTime}
                  />
                </div>
              </div>
              
              {/* Rodapé fixo */}
              <div className="sticky bottom-0 mt-auto p-6 border-t bg-white shadow-sm">
                <div className="flex flex-row gap-3 w-full justify-end">
                  <Button variant="outline" onClick={() => setNewAppointmentOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    variant="pink"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Salvar Agendamento
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <Button variant="outline" onClick={() => setIsBlockTimeOpen(true)}>
            <Ban className="mr-2 h-4 w-4" />
            Bloquear Horário
          </Button>
          
          <Button variant="outline" onClick={() => setIsReportModalOpen(true)}>
            <BarChart className="mr-2 h-4 w-4" />
            Relatórios
          </Button>
        </div>
      </div>
      
      {/* Dashboard de status rápidos - mini cards com contadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <div className="h-2 bg-green-500" />
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Confirmados</p>
                <p className="text-2xl font-bold">{statusCounts.confirmed}</p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <CalendarClock className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <div className="h-2 bg-yellow-500" />
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{statusCounts.pending}</p>
              </div>
              <div className="p-2 rounded-full bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <div className="h-2 bg-red-500" />
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Cancelados</p>
                <p className="text-2xl font-bold">{statusCounts.canceled}</p>
              </div>
              <div className="p-2 rounded-full bg-red-100">
                <CalendarRange className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <div className="h-2 bg-blue-500" />
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">{statusCounts.completed}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AppointmentFilters
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedProfessional={selectedProfessional}
        setSelectedProfessional={setSelectedProfessional}
        professionals={professionals}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {selectedProfessional && (
        <div className="mb-4 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
            <Badge variant="outline" className="border-primary text-primary border-2">
              Profissional
            </Badge>
            <span className="text-lg font-medium text-primary">
              {professionals.find(p => String(p.id) === selectedProfessional)?.name}
            </span>
          </div>
        </div>
      )}

      {/* Navigation & View Controls */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => navigateDate('prev')}
            >
              <span>&lt;</span>
            </Button>
            
            <div className="text-sm font-medium">
              {viewMode === 'day' && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              {viewMode === 'week' && (
                <>
                  <span>Semana de </span>
                  {format(selectedDate, "dd/MM", { locale: ptBR })}
                </>
              )}
              {viewMode === 'month' && format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => navigateDate('next')}
            >
              <span>&gt;</span>
            </Button>
          </div>

          <Tabs 
            value={viewMode} 
            onValueChange={(value) => setViewMode(value as typeof viewMode)}
            className="w-auto"
          >
            <TabsList className="grid grid-cols-4 h-9 w-auto">
              <TabsTrigger value="day" className="h-8 text-xs px-3">
                <CalendarIcon className="mr-1 h-3.5 w-3.5" />
                Dia
              </TabsTrigger>
              <TabsTrigger value="week" className="h-8 text-xs px-3">
                <CalendarIcon className="mr-1 h-3.5 w-3.5" />
                Semana
              </TabsTrigger>
              <TabsTrigger value="month" className="h-8 text-xs px-3">
                <CalendarIcon className="mr-1 h-3.5 w-3.5" />
                Mês
              </TabsTrigger>
              <TabsTrigger value="list" className="h-8 text-xs px-3">
                <List className="mr-1 h-3.5 w-3.5" />
                Lista
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tabs Content Separated from Navigation Controls */}
        <div className={cn("transition-opacity duration-300", isCalendarLoading ? "opacity-50" : "opacity-100")}>
          <Tabs 
            value={viewMode} 
            onValueChange={(value) => setViewMode(value as typeof viewMode)}
            className="w-full"
          >
            <TabsContent value="day" className="m-0 p-0">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 bg-white rounded-md">
                  <WeeklyCalendar
                    selectedDate={selectedDate}
                    appointments={filteredAppointments}
                    professionals={professionals}
                    mode="day"
                    onStatusChange={handleStatusChange}
                    onReschedule={handleReschedule}
                    onSlotClick={handleSlotClick}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="week" className="m-0 p-0">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 bg-white rounded-md">
                  <WeeklyCalendar
                    selectedDate={selectedDate}
                    appointments={filteredAppointments}
                    professionals={professionals}
                    mode="week"
                    onStatusChange={handleStatusChange}
                    onReschedule={handleReschedule}
                    onSlotClick={handleSlotClick}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="month" className="m-0 p-0">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 bg-white rounded-md">
                  <WeeklyCalendar
                    selectedDate={selectedDate}
                    appointments={filteredAppointments}
                    professionals={professionals}
                    mode="month"
                    onStatusChange={handleStatusChange}
                    onReschedule={handleReschedule}
                    onSlotClick={handleSlotClick}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="list" className="m-0 p-0">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 bg-white rounded-md">
                  <AppointmentList
                    appointments={filteredAppointments}
                    onStatusChange={handleStatusChange}
                    onReschedule={handleReschedule}
                    onStatusChangeWithConfirmation={handleStatusChangeWithConfirmation}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <BlockTimeDialog
        open={isBlockTimeOpen}
        onOpenChange={setIsBlockTimeOpen}
        onConfirm={(blockData) => {
          toast({
            title: "Horários bloqueados",
            description: `Período bloqueado de ${blockData.startDate} até ${blockData.endDate}, das ${blockData.startTime} às ${blockData.endTime}`
          });
        }}
      />

      {/* Modal de agendamento */}
      <AppointmentDialog
        isOpen={newAppointmentOpen}
        onOpenChange={setNewAppointmentOpen}
        initialDate={newAppointmentDate}
        initialTime={newAppointmentTime}
      />

      {/* Diálogo de Confirmação */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              {statusAction === "confirm" ? "Confirmar agendamento?" : "Cancelar agendamento?"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {statusAction === "confirm" 
                ? "Deseja confirmar este agendamento? O cliente será notificado."
                : "Deseja realmente cancelar este agendamento? Esta ação não pode ser desfeita."}
            </DialogDescription>
          </DialogHeader>
          <Separator className="my-4" />
          <div className="flex justify-center gap-4 mt-2">
            <Button 
              variant="outline" 
              className="border-gray-300"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Voltar
            </Button>
            <Button 
              variant={statusAction === "confirm" ? "default" : "destructive"}
              className={statusAction === "confirm" ? "bg-primary hover:bg-primary/90" : ""}
              onClick={confirmStatusChange}
            >
              {statusAction === "confirm" ? "Confirmar" : "Cancelar Agendamento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Reagendamento */}
      <Dialog open={isRescheduleOpen} onOpenChange={(value) => !value && setIsRescheduleOpen(value)}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold flex items-center justify-center gap-2">
              <CalendarClock className="h-6 w-6 text-primary" />
              Reagendar Atendimento
            </DialogTitle>
            <DialogDescription className="text-center">
              Selecione a nova data e horário para o agendamento
            </DialogDescription>
          </DialogHeader>
          <Separator className="my-4" />
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Cliente:</p>
                <p className="text-sm">{selectedAppointment.clientName}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Serviço:</p>
                <p className="text-sm">{selectedAppointment.services.map(s => s.name).join(", ")}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Data atual:</p>
                <p className="text-sm">{format(selectedAppointment.date, "dd/MM/yyyy")}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Horário atual:</p>
                <p className="text-sm">{selectedAppointment.startTime}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="reschedule-date" className="text-sm font-medium">
                  Nova data:
                </Label>
                <Input
                  id="reschedule-date"
                  type="date"
                  min={format(new Date(), "yyyy-MM-dd")}
                  value={rescheduleDate ? format(rescheduleDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => setRescheduleDate(e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reschedule-time" className="text-sm font-medium">
                  Novo horário:
                </Label>
                <Input
                  id="reschedule-time"
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reschedule-professional" className="text-sm font-medium">
                  Profissional:
                </Label>
                <select
                  id="reschedule-professional"
                  value={rescheduleProfessional}
                  onChange={(e) => setRescheduleProfessional(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione um profissional</option>
                  {professionals.map(prof => (
                    <option key={prof.id} value={String(prof.id)}>
                      {prof.name}
                    </option>
                  ))}
                </select>
              </div>
              <Separator className="my-4" />
              <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                  variant="outline" 
                  className="border-gray-300"
                  onClick={() => setIsRescheduleOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={confirmReschedule}
                  disabled={!rescheduleDate || !rescheduleTime || !rescheduleProfessional}
                >
                  Reagendar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Relatórios */}
      <Sheet open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <SheetContent side="right" className="p-0 w-full max-w-full sm:max-w-2xl border-l flex flex-col h-[100dvh] bg-white">
          {/* Cabeçalho fixo */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 border-b">
            <SheetHeader className="p-6">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl flex items-center gap-2 text-white">
                  <FileText className="h-5 w-5 text-white" />
                  Relatórios de Agendamentos
                </SheetTitle>
                <SheetClose className="rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-white">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Fechar</span>
                </SheetClose>
              </div>
              <SheetDescription className="text-blue-100">
                Configure o relatório e clique em "Gerar" para exportar
              </SheetDescription>
            </SheetHeader>
          </div>
          
          {/* Conteúdo rolável */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="p-6">
              {/* Conteúdo do relatório existente */}
              <div className="space-y-6">
                {/* ... existing report content ... */}
                {showReportResults ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Resultados</h3>
                      <p className="text-sm text-muted-foreground">{filteredReport.length} registros encontrados</p>
                    </div>
                    
                    {/* Lista de resultados */}
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Serviço</TableHead>
                            <TableHead>Profissional</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredReport.slice(0, 10).map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell>{appointment.clientName}</TableCell>
                              <TableCell>{appointment.services.map(s => s.name).join(", ")}</TableCell>
                              <TableCell>{appointment.professionalName}</TableCell>
                              <TableCell>
                                {format(appointment.date, "dd/MM/yyyy")} {appointment.startTime}
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                  appointment.status === 'confirmed' 
                                    ? 'bg-green-50 text-green-700' 
                                    : appointment.status === 'canceled'
                                    ? 'bg-red-50 text-red-700'
                                    : 'bg-yellow-50 text-yellow-700'
                                }`}>
                                  {appointment.status === 'confirmed' ? 'Confirmado' 
                                    : appointment.status === 'canceled' ? 'Cancelado'
                                    : 'Pendente'}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {filteredReport.length > 10 && (
                        <div className="p-3 text-center text-sm text-muted-foreground">
                          Mostrando 10 de {filteredReport.length} resultados
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Categoria de Relatório */}
                    <div className="bg-muted/30 p-5 rounded-lg border">
                      <h3 className="text-lg font-medium mb-4">Tipo de Relatório</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div 
                          className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 ${reportSortBy === 'date' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                          onClick={() => setReportSortBy('date')}
                        >
                          <CalendarClock className="h-6 w-6 text-blue-600 mb-1" />
                          <span className="text-xs font-medium text-center">Por Data</span>
                        </div>
                        <div 
                          className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 ${reportSortBy === 'professional' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                          onClick={() => setReportSortBy('professional')}
                        >
                          <User className="h-6 w-6 text-green-600 mb-1" />
                          <span className="text-xs font-medium text-center">Por Profissional</span>
                        </div>
                        <div 
                          className={`flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 ${reportSortBy === 'status' ? 'bg-primary/10 border-primary' : 'bg-white'}`}
                          onClick={() => setReportSortBy('status')}
                        >
                          <CheckCircle2 className="h-6 w-6 text-orange-600 mb-1" />
                          <span className="text-xs font-medium text-center">Por Status</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Período */}
                    <div className="bg-muted/30 p-5 rounded-lg border">
                      <h3 className="text-lg font-medium mb-4">Período</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date-from">Data Inicial</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {reportDateRange.from ? (
                                  format(reportDateRange.from, "dd/MM/yyyy")
                                ) : (
                                  <span>Selecione a data inicial</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={reportDateRange.from}
                                onSelect={(date) =>
                                  setReportDateRange({
                                    ...reportDateRange,
                                    from: date,
                                  })
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date-to">Data Final</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {reportDateRange.to ? (
                                  format(reportDateRange.to, "dd/MM/yyyy")
                                ) : (
                                  <span>Selecione a data final</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={reportDateRange.to}
                                onSelect={(date) =>
                                  setReportDateRange({
                                    ...reportDateRange,
                                    to: date,
                                  })
                                }
                                initialFocus
                                disabled={(date) =>
                                  reportDateRange.from
                                    ? date < reportDateRange.from
                                    : false
                                }
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Rodapé fixo */}
          <div className="sticky bottom-0 mt-auto p-6 border-t bg-white shadow-sm">
            <div className="flex flex-row gap-3 w-full justify-end">
              {showReportResults ? (
                <>
                  <Button variant="outline" onClick={() => setShowReportResults(false)}>
                    Voltar para Filtros
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={exportReportToCSV}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </Button>
                  <Button 
                    variant="pink"
                    onClick={exportReportToPDF}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={generateReport}
                    variant="pink"
                  >
                    {isReportLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Gerar Relatório
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
};

export default Appointments;
