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
import type { BlockTimeFormData } from "@/components/appointments/BlockTimeDialog";
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
  
  // Novo estado para controlar o modal de relatórios
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  // Estados para os filtros do relatório
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
  
  // Estados para os resultados do relatório
  const [generatedReport, setGeneratedReport] = useState<Appointment[]>([]);
  const [filteredReport, setFilteredReport] = useState<Appointment[]>([]);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [showReportResults, setShowReportResults] = useState(false);
  
  // Estado para controlar o formato de exportação selecionado
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  
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

  // Função para filtrar agendamentos conforme os critérios do relatório
  const filterAppointmentsForReport = (): Appointment[] => {
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
        case 'value':
          return a.totalValue - b.totalValue;
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
        
        // Atualizar o estado com os resultados
        setGeneratedReport(sortedAppointments);
        setFilteredReport(sortedAppointments);
        setShowReportResults(true);
        setIsReportLoading(false);
        
        toast({
          title: "Relatório gerado",
          description: `Foram encontrados ${sortedAppointments.length} agendamentos. Para salvar o relatório, clique em Exportar.`,
        });
      } catch (error) {
        setIsReportLoading(false);
        toast({
          title: "Erro ao gerar relatório",
          description: "Ocorreu um erro ao processar os dados do relatório.",
          variant: "destructive"
        });
      }
    }, 800);
  };

  // Função para exportar o relatório para Excel
  const exportReportToExcel = () => {
    setIsReportLoading(true);
    
    try {
      // Filtrar e ordenar os agendamentos se ainda não tiver gerado
      const dataToExport = generatedReport.length > 0 
        ? generatedReport 
        : sortReportResults(filterAppointmentsForReport());
      
      // Criar cabeçalhos do Excel
      const headers = [
        'ID', 'Cliente', 'Profissional', 'Serviços', 
        'Data', 'Horário', 'Duração', 'Status', 
        'Pagamento', 'Valor Total', 'Observações'
      ];
      
      // Criar linhas do Excel
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
      
      // Criar conteúdo no formato CSV (que Excel pode abrir)
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Criar blob e link para download
      const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Configurar link para download
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_agendamentos_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
      document.body.appendChild(link);
      
      // Simular click no link
      link.click();
      
      // Remover o link após o download
      document.body.removeChild(link);
      
      setIsReportLoading(false);
      toast({
        title: "Relatório Excel exportado",
        description: "O arquivo Excel foi baixado com sucesso.",
      });
    } catch (error) {
      setIsReportLoading(false);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar o relatório para Excel.",
        variant: "destructive"
      });
    }
  };

  // Função para exportar para PDF (simulando com HTML)
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
          <h1>Relatório de Agendamentos</h1>
          <p>Data de geração: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          
          <div class="sumario">
            <h2>Resumo</h2>
            <p>Total de agendamentos: ${dataToExport.length}</p>
            <p>Valor total: R$ ${dataToExport.reduce((sum, app) => sum + app.totalValue, 0).toFixed(2)}</p>
            <p>Valor médio: R$ ${(dataToExport.reduce((sum, app) => sum + app.totalValue, 0) / (dataToExport.length || 1)).toFixed(2)}</p>
            <p>Período: ${reportDateRange.from ? format(reportDateRange.from, 'dd/MM/yyyy') : 'Início'} a ${reportDateRange.to ? format(reportDateRange.to, 'dd/MM/yyyy') : 'Fim'}</p>
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
          
          <p><small>Este relatório foi gerado pelo Pulse Salon Manager</small></p>
        </body>
        </html>
      `;
      
      // Criar blob e link para download
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Configurar link para download
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_agendamentos_${format(new Date(), 'dd-MM-yyyy')}.html`);
      document.body.appendChild(link);
      
      // Simular click no link
      link.click();
      
      // Remover o link após o download
      document.body.removeChild(link);
      
      setIsReportLoading(false);
      toast({
        title: "Relatório gerado",
        description: "O arquivo HTML foi baixado com sucesso. Abra-o no navegador e use a função de impressão para salvar como PDF.",
      });
    } catch (error) {
      setIsReportLoading(false);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao gerar o relatório para PDF.",
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

  // Efeito para atualizar o relatório quando os filtros são alterados
  useEffect(() => {
    if (showReportResults) {
      // Só atualiza se já estiver mostrando resultados
      const filteredAppointments = filterAppointmentsForReport();
      const sortedAppointments = sortReportResults(filteredAppointments);
      setGeneratedReport(sortedAppointments);
      setFilteredReport(sortedAppointments);
    }
  }, [reportClientSearch, reportClientFilter, showReportResults, reportDateRange, reportProfessionalFilter, reportStatusFilter, reportPaymentStatusFilter, reportSortBy]);

  return (
    <PageLayout variant="purple">
      <PageHeader 
        title="Agendamentos" 
        subtitle="Gerencie a agenda de serviços"
        variant="purple"
        badge="Calendário"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="appointments"
              onClick={() => setNewAppointmentOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Button>
            <Button
              variant="appointments-outline"
              onClick={() => setIsBlockTimeOpen(true)}
            >
              <Ban className="h-4 w-4" />
              Bloquear Horário
            </Button>
            <Button
              variant="appointments-secondary"
              onClick={() => setIsReportModalOpen(true)}
            >
              <BarChart className="h-4 w-4" />
              Relatórios
            </Button>
          </div>
        }
      />
      
      {/* Dashboard de status rápidos - mini cards com contadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <div className="h-2 bg-green-500" />
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Confirmados</p>
                <p className="text-2xl font-bold">{statusCounts.confirmed}</p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
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
                <X className="h-5 w-5 text-red-600" />
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

      {/* Controles de visão */}
      <FormCard variant="purple" className="mb-4" title="Visualização">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Tabs 
            value={viewMode} 
            onValueChange={(value) => setViewMode(value as typeof viewMode)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 bg-purple-50 border border-purple-200">
              <TabsTrigger 
                value="day"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <CalendarClock className="mr-2 h-4 w-4" />
                Dia
              </TabsTrigger>
              <TabsTrigger 
                value="week"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Semana
              </TabsTrigger>
              <TabsTrigger 
                value="month"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <CalendarRange className="mr-2 h-4 w-4" />
                Mês
              </TabsTrigger>
              <TabsTrigger 
                value="list"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <List className="mr-2 h-4 w-4" />
                Lista
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="appointments-outline"
                  className="ml-auto"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <ReactCalendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="appointments-outline"
              size="icon"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="appointments-outline"
              size="icon"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="appointments-secondary"
              onClick={() => setIsFilterOpen(true)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </div>
      </FormCard>

      {selectedProfessional && (
        <div className="mb-4 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 p-2 bg-purple-100 rounded-lg">
            <Badge variant="outline" className="border-purple-500 text-purple-700 border-2">
              Profissional
            </Badge>
            <span className="text-lg font-medium text-purple-700">
              {professionals.find(p => String(p.id) === selectedProfessional)?.name}
            </span>
          </div>
        </div>
      )}

      {/* Conteúdo do Calendário ou Lista */}
      <FormCard variant="purple" className="mb-4" title="">
        <div className={cn("transition-opacity duration-300", isCalendarLoading ? "opacity-50" : "opacity-100")}>
          <Tabs 
            value={viewMode} 
            onValueChange={(value) => setViewMode(value as typeof viewMode)}
            className="w-full"
          >
            <TabsContent value="day" className="m-0 p-0">
              <WeeklyCalendar
                selectedDate={selectedDate}
                appointments={filteredAppointments}
                professionals={professionals}
                mode="day"
                onStatusChange={handleStatusChange}
                onReschedule={handleReschedule}
                onSlotClick={handleSlotClick}
              />
            </TabsContent>

            <TabsContent value="week" className="m-0 p-0">
              {isCalendarLoading ? (
                <div className="flex justify-center items-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
              ) : (
                <WeeklyCalendar
                  selectedDate={selectedDate}
                  appointments={filteredAppointments}
                  professionals={professionals}
                  mode="week"
                  onStatusChange={handleStatusChange}
                  onReschedule={handleReschedule}
                  onSlotClick={handleSlotClick}
                />
              )}
            </TabsContent>

            <TabsContent value="month" className="m-0 p-0">
              <WeeklyCalendar
                selectedDate={selectedDate}
                appointments={filteredAppointments}
                professionals={professionals}
                mode="month"
                onStatusChange={handleStatusChange}
                onReschedule={handleReschedule}
                onSlotClick={handleSlotClick}
              />
            </TabsContent>

            <TabsContent value="list" className="m-0 p-0">
              <AppointmentList
                appointments={filteredAppointments}
                onStatusChange={handleStatusChange}
                onReschedule={handleReschedule}
                onStatusChangeWithConfirmation={handleStatusChangeWithConfirmation}
              />
            </TabsContent>
          </Tabs>
        </div>
      </FormCard>

      {/* Modal de bloqueio de horas */}
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

      {/* Modal para novo agendamento */}
      <AppointmentDialog
        isOpen={newAppointmentOpen}
        onOpenChange={setNewAppointmentOpen}
        initialDate={newAppointmentDate}
        initialTime={newAppointmentTime}
      />

      {/* Modal para confirmação de alteração de status */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold text-purple-700">
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
              onClick={() => setConfirmDialogOpen(false)}
            >
              Voltar
            </Button>
            <Button 
              variant={statusAction === "confirm" ? "appointments" : "destructive"}
              onClick={confirmStatusChange}
            >
              {statusAction === "confirm" ? "Confirmar" : "Cancelar Agendamento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para reagendamento */}
      <Dialog open={isRescheduleOpen} onOpenChange={(value) => !value && setIsRescheduleOpen(value)}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold flex items-center justify-center gap-2 text-purple-700">
              <CalendarClock className="h-6 w-6 text-purple-600" />
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
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  onClick={() => setIsRescheduleOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="appointments"
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

      {/* Modal de filtros */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent className="p-0 w-full max-w-full sm:max-w-md border-l flex flex-col h-full bg-white">
          <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-indigo-600 border-b">
            <SheetHeader className="p-6">
              <SheetTitle className="text-xl flex items-center gap-2 text-white">
                <Filter className="h-5 w-5 text-white" />
                Filtros
              </SheetTitle>
              <SheetDescription className="text-purple-100">
                Selecione os critérios para filtrar os agendamentos
              </SheetDescription>
            </SheetHeader>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <AppointmentFilters
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedProfessional={selectedProfessional}
              setSelectedProfessional={setSelectedProfessional}
              professionals={professionals}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>
          
          <div className="sticky bottom-0 mt-auto p-6 border-t bg-white shadow-sm">
            <div className="flex flex-row gap-3 w-full justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedProfessional("");
                  setStatusFilter("");
                  setSearchTerm("");
                }}
              >
                Limpar Filtros
              </Button>
              <Button 
                variant="appointments"
                onClick={() => setIsFilterOpen(false)}
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal de Relatórios */}
      <Sheet open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <SheetContent side="right" className="p-0 w-full max-w-[500px] border-l flex flex-col h-[100dvh] bg-white">
          {/* Cabeçalho fixo */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-indigo-600 border-b">
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
              <SheetDescription className="text-purple-100">
                Configure o relatório e clique em "Gerar" para exportar
              </SheetDescription>
            </SheetHeader>
          </div>
          
          {/* Conteúdo do modal */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="p-6 space-y-6">
              {/* Período do relatório */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-700" />
                  <h3 className="text-base font-medium">Período do relatório</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Data inicial */}
                  <div>
                    <Label htmlFor="report-start-date" className="block text-sm font-medium mb-2">
                      Data inicial
                    </Label>
                    <Input 
                      id="report-start-date"
                      type="date" 
                      value={reportDateRange.from ? format(reportDateRange.from, "yyyy-MM-dd") : ""}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        setReportDateRange(prev => ({ ...prev, from: date }));
                      }}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Data final */}
                  <div>
                    <Label htmlFor="report-end-date" className="block text-sm font-medium mb-2">
                      Data final
                    </Label>
                    <Input 
                      id="report-end-date"
                      type="date" 
                      value={reportDateRange.to ? format(reportDateRange.to, "yyyy-MM-dd") : ""}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : undefined;
                        setReportDateRange(prev => ({ ...prev, to: date }));
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              
              {/* Filtro de profissionais */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-purple-700" />
                  <h3 className="text-base font-medium">Profissionais</h3>
                </div>
                <Select 
                  onValueChange={(value) => {
                    if (value === "all") {
                      setReportProfessionalFilter([]);
                    } else {
                      setReportProfessionalFilter([value]);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos os profissionais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os profissionais</SelectItem>
                    {professionals.map((prof) => (
                      <SelectItem key={prof.id} value={String(prof.id)}>
                        {prof.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filtro de status */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-700" />
                  <h3 className="text-base font-medium">Status</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="report-status-confirmed" 
                      checked={reportStatusFilter.includes("confirmed") || reportStatusFilter.length === 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          if (!reportStatusFilter.includes("confirmed")) {
                            setReportStatusFilter([...reportStatusFilter, "confirmed"]);
                          }
                        } else {
                          setReportStatusFilter(reportStatusFilter.filter(s => s !== "confirmed"));
                        }
                      }}
                    />
                    <label 
                      htmlFor="report-status-confirmed" 
                      className="flex items-center text-sm font-medium leading-none gap-2"
                    >
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      Confirmados
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="report-status-pending" 
                      checked={reportStatusFilter.includes("pending") || reportStatusFilter.length === 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          if (!reportStatusFilter.includes("pending")) {
                            setReportStatusFilter([...reportStatusFilter, "pending"]);
                          }
                        } else {
                          setReportStatusFilter(reportStatusFilter.filter(s => s !== "pending"));
                        }
                      }}
                    />
                    <label 
                      htmlFor="report-status-pending" 
                      className="flex items-center text-sm font-medium leading-none gap-2"
                    >
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      Pendentes
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="report-status-canceled" 
                      checked={reportStatusFilter.includes("canceled") || reportStatusFilter.length === 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          if (!reportStatusFilter.includes("canceled")) {
                            setReportStatusFilter([...reportStatusFilter, "canceled"]);
                          }
                        } else {
                          setReportStatusFilter(reportStatusFilter.filter(s => s !== "canceled"));
                        }
                      }}
                    />
                    <label 
                      htmlFor="report-status-canceled" 
                      className="flex items-center text-sm font-medium leading-none gap-2"
                    >
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      Cancelados
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="report-status-completed" 
                      checked={reportStatusFilter.includes("completed") || reportStatusFilter.length === 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          if (!reportStatusFilter.includes("completed")) {
                            setReportStatusFilter([...reportStatusFilter, "completed"]);
                          }
                        } else {
                          setReportStatusFilter(reportStatusFilter.filter(s => s !== "completed"));
                        }
                      }}
                    />
                    <label 
                      htmlFor="report-status-completed" 
                      className="flex items-center text-sm font-medium leading-none gap-2"
                    >
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      Concluídos
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Filtro de status de pagamento */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <FileDown className="h-5 w-5 text-purple-700" />
                  <h3 className="text-base font-medium">Status de Pagamento</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="report-payment-paid" 
                      checked={reportPaymentStatusFilter.includes("paid") || reportPaymentStatusFilter.length === 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          if (!reportPaymentStatusFilter.includes("paid")) {
                            setReportPaymentStatusFilter([...reportPaymentStatusFilter, "paid"]);
                          }
                        } else {
                          setReportPaymentStatusFilter(reportPaymentStatusFilter.filter(s => s !== "paid"));
                        }
                      }}
                    />
                    <label 
                      htmlFor="report-payment-paid" 
                      className="flex items-center text-sm font-medium leading-none gap-2"
                    >
                      <Check className="h-3 w-3 text-green-500" />
                      Pagos
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="report-payment-pending" 
                      checked={reportPaymentStatusFilter.includes("pending") || reportPaymentStatusFilter.length === 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          if (!reportPaymentStatusFilter.includes("pending")) {
                            setReportPaymentStatusFilter([...reportPaymentStatusFilter, "pending"]);
                          }
                        } else {
                          setReportPaymentStatusFilter(reportPaymentStatusFilter.filter(s => s !== "pending"));
                        }
                      }}
                    />
                    <label 
                      htmlFor="report-payment-pending" 
                      className="flex items-center text-sm font-medium leading-none gap-2"
                    >
                      <Clock className="h-3 w-3 text-yellow-500" />
                      Pendentes
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Busca por cliente */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-700" />
                  <h3 className="text-base font-medium">Cliente</h3>
                </div>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Buscar por nome do cliente"
                    value={reportClientSearch}
                    onChange={(e) => setReportClientSearch(e.target.value)}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                
                <Select 
                  onValueChange={(value) => {
                    if (value === "all") {
                      setReportClientFilter([]);
                    } else {
                      setReportClientFilter([value]);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos os clientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os clientes</SelectItem>
                    {uniqueClients.map((client) => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Ordenação */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-purple-700" />
                  <h3 className="text-base font-medium">Ordenação</h3>
                </div>
                <Select 
                  value={reportSortBy}
                  onValueChange={(value) => setReportSortBy(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Ordenar por..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Data</SelectItem>
                    <SelectItem value="professional">Profissional</SelectItem>
                    <SelectItem value="client">Cliente</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="value">Valor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Resumo dos dados */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-700" />
                    <h3 className="text-base font-medium">Pré-visualização</h3>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearReportFilters}
                    className="text-xs px-2 h-8"
                  >
                    <X className="h-3 w-3 mr-1" /> Limpar filtros
                  </Button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <h4 className="font-medium text-sm mb-3 text-gray-700">Resumo</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total de agendamentos:</p>
                      <p className="font-semibold text-sm">{filterAppointmentsForReport().length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Valor total:</p>
                      <p className="font-semibold text-sm">
                        R$ {filterAppointmentsForReport().reduce((sum, app) => sum + app.totalValue, 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Valor médio:</p>
                      <p className="font-semibold text-sm">
                        R$ {filterAppointmentsForReport().length 
                          ? (filterAppointmentsForReport().reduce((sum, app) => sum + app.totalValue, 0) / 
                             filterAppointmentsForReport().length).toFixed(2) 
                          : "0.00"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Período:</p>
                      <p className="font-semibold text-sm">
                        {reportDateRange.from && reportDateRange.to 
                          ? `${format(reportDateRange.from, "dd/MM/yy")} - ${format(reportDateRange.to, "dd/MM/yy")}` 
                          : "Não definido"}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Mostrar uma prévia dos últimos 5 registros */}
                {showReportResults && filteredReport.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Últimos registros:</h4>
                    <div className="bg-white border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Data</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredReport.slice(0, 5).map((app) => (
                            <TableRow key={app.id}>
                              <TableCell className="font-medium">
                                {format(new Date(app.date), "dd/MM/yy")}
                              </TableCell>
                              <TableCell>{app.clientName}</TableCell>
                              <TableCell>
                                {app.status === "confirmed" ? (
                                  <Badge variant="default" className="bg-green-600">Confirmado</Badge>
                                ) : app.status === "pending" ? (
                                  <Badge variant="secondary" className="bg-yellow-500">Pendente</Badge>
                                ) : app.status === "canceled" ? (
                                  <Badge variant="destructive">Cancelado</Badge>
                                ) : (
                                  <Badge variant="default" className="bg-blue-600">Concluído</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                R$ {app.totalValue.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {filteredReport.length > 5 && (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          Mostrando 5 de {filteredReport.length} registros
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Rodapé fixo */}
          <div className="sticky bottom-0 mt-auto p-6 border-t bg-white shadow-sm">
            <div className="flex flex-col gap-3 w-full">
              {showReportResults && (
                <div className="flex flex-col gap-3 w-full">
                  <div className="space-y-2 mb-2">
                    <h3 className="text-sm font-medium">Formato de exportação:</h3>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="export-pdf"
                          name="export-format"
                          value="pdf"
                          checked={exportFormat === "pdf"}
                          onChange={() => setExportFormat("pdf")}
                          className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="export-pdf" className="text-sm font-medium text-gray-700">
                          <div className="flex items-center gap-1">
                            <File className="h-4 w-4 text-red-500" />
                            PDF
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="export-excel"
                          name="export-format"
                          value="excel"
                          checked={exportFormat === "excel"}
                          onChange={() => setExportFormat("excel")}
                          className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="export-excel" className="text-sm font-medium text-gray-700">
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-green-500" />
                            Excel
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={exportFormat === "pdf" ? exportReportToPDF : exportReportToExcel}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar {exportFormat === "pdf" ? "PDF" : "Excel"}
                  </Button>
                </div>
              )}
              <Button 
                variant="appointments"
                onClick={generateReport}
                className="bg-purple-600 hover:bg-purple-700 text-white w-full"
              >
                {isReportLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Gerar Relatório
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
};

export default Appointments;
