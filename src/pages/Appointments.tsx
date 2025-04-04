
import { useState, useEffect, useMemo, useCallback } from "react";
import { AppointmentDialog } from "@/components/appointments/AppointmentDialog";
import { AppointmentFilters } from "@/components/appointments/AppointmentFilters";
import { WeeklyCalendar } from "@/components/appointments/WeeklyCalendar";
import { BlockTimeDialog, BlockTimeData } from "@/components/appointments/BlockTimeDialog";
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
import { format, parseISO, isToday, isThisWeek, isThisMonth, addDays, subDays, subMonths, addMonths } from "date-fns";
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
import { supabase } from "@/integrations/supabase/client";
import { AppointmentList } from "@/components/appointments/AppointmentList";
import { useToast } from "@/hooks/use-toast";
import { BlockedTime } from "@/types/supabase";

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
  const [newAppointmentDate, setNewAppointmentDate] = useState<Date | null>(null);
  const [newAppointmentTime, setNewAppointmentTime] = useState<string | null>(null);
  
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
  
  const [existingBlocks, setExistingBlocks] = useState<BlockTimeData[]>([]);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  
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
  
  // Função para buscar bloqueios existentes
  const fetchExistingBlocks = async () => {
    try {
      setIsLoadingBlocks(true);
      
      // Utilizando a RPC para buscar bloqueios
      const { data, error } = await supabase.rpc('get_blocked_times', {
        establishment_id_input: '123e4567-e89b-12d3-a456-426614174000' // ID do estabelecimento (exemplo)
      });
      
      if (error) {
        console.error("Erro ao buscar bloqueios:", error);
        toast({
          title: "Erro ao carregar bloqueios",
          description: "Não foi possível carregar os bloqueios de horário.",
          variant: "destructive"
        });
        return;
      }
      
      // Converter os dados da resposta para o formato esperado
      const blocks = data.map((block: BlockedTime) => ({
        id: block.id,
        professionalId: block.professional_id ? block.professional_id : '',
        startDate: new Date(block.start_date),
        endDate: new Date(block.end_date),
        startTime: block.start_time || '',
        endTime: block.end_time || '',
        reason: block.reason || '',
        isFullDay: block.is_full_day
      }));
      
      setExistingBlocks(blocks);
    } catch (error) {
      console.error("Erro inesperado ao buscar bloqueios:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao buscar bloqueios de horário.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingBlocks(false);
    }
  };
  
  // Função para adicionar um novo bloqueio
  const addBlockedTime = async (blockData: BlockTimeData) => {
    try {
      // Preparar dados para a chamada RPC
      const { data, error } = await supabase.rpc('create_blocked_time', {
        establishment_id_input: '123e4567-e89b-12d3-a456-426614174000', // ID do estabelecimento (exemplo)
        professional_id_input: blockData.professionalId,
        start_date_input: format(blockData.startDate, 'yyyy-MM-dd'),
        end_date_input: format(blockData.endDate, 'yyyy-MM-dd'),
        start_time_input: blockData.startTime,
        end_time_input: blockData.endTime,
        reason_input: blockData.reason,
        is_full_day_input: blockData.isFullDay
      });
      
      if (error) {
        console.error("Erro ao bloquear horário:", error);
        toast({
          title: "Erro ao bloquear horário",
          description: "Não foi possível salvar o bloqueio de horário.",
          variant: "destructive"
        });
        return;
      }
      
      // Se bem-sucedido, atualizar a lista de bloqueios
      toast({
        title: "Horário bloqueado",
        description: "O bloqueio de horário foi salvo com sucesso."
      });
      
      // Recarregar bloqueios
      fetchExistingBlocks();
    } catch (error) {
      console.error("Erro inesperado ao bloquear horário:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o bloqueio de horário.",
        variant: "destructive"
      });
    }
  };
  
  // Função para excluir um bloqueio
  const deleteBlockedTime = async (blockId: string) => {
    try {
      // Chamada RPC para excluir o bloqueio
      const { data, error } = await supabase.rpc('delete_blocked_time', {
        block_id_input: blockId
      });
      
      if (error) {
        console.error("Erro ao excluir bloqueio:", error);
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o bloqueio de horário.",
          variant: "destructive"
        });
        return;
      }
      
      // Atualizar a lista de bloqueios
      toast({
        title: "Bloqueio excluído",
        description: "O bloqueio de horário foi removido com sucesso."
      });
      
      // Recarregar bloqueios
      fetchExistingBlocks();
    } catch (error) {
      console.error("Erro inesperado ao excluir bloqueio:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o bloqueio de horário.",
        variant: "destructive"
      });
    }
  };
  
  // Carregar bloqueios ao montar o componente
  useEffect(() => {
    fetchExistingBlocks();
  }, []);

  return (
    <PageLayout>
      <PageHeader 
        title="Agendamentos"
        description="Gerencie a agenda de serviços e profissionais"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" onClick={() => setIsBlockTimeOpen(true)}>
              <Ban className="w-4 h-4 mr-2" />
              Bloquear Horário
            </Button>
            <Button onClick={() => setNewAppointmentOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
            <Button variant="outline" onClick={() => setIsReportModalOpen(true)}>
              <BarChart className="w-4 h-4 mr-2" />
              Relatórios
            </Button>
          </div>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Seleção de visualização */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="mr-4">
              <TabsList>
                <TabsTrigger value="day" className="flex items-center">
                  <CalendarClock className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Dia</span>
                </TabsTrigger>
                <TabsTrigger value="week" className="flex items-center">
                  <CalendarDays className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Semana</span>
                </TabsTrigger>
                <TabsTrigger value="month" className="flex items-center">
                  <CalendarRange className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Mês</span>
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center">
                  <List className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Lista</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[200px] justify-center">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {
                    viewMode === "day" && format(selectedDate, "PPPP", { locale: ptBR })
                  }
                  {
                    viewMode === "week" && `${format(selectedDate, "dd/MM", { locale: ptBR })} - ${format(addDays(selectedDate, 6), "dd/MM", { locale: ptBR })}`
                  }
                  {
                    viewMode === "month" && format(selectedDate, "MMMM yyyy", { locale: ptBR })
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <ReactCalendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                />
              </PopoverContent>
            </Popover>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedDate(new Date())}
              className="text-xs"
            >
              Hoje
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos os profissionais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os profissionais</SelectItem>
                {professionals.map(professional => (
                  <SelectItem key={professional.id} value={String(professional.id)}>
                    {professional.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmados</p>
                <p className="text-2xl font-bold">{statusCounts.confirmed}</p>
              </div>
              <Badge className="bg-green-500">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {Math.round((statusCounts.confirmed / (filteredAppointments.length || 1)) * 100)}%
              </Badge>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{statusCounts.pending}</p>
              </div>
              <Badge className="bg-yellow-500">
                <Clock className="h-4 w-4 mr-1" />
                {Math.round((statusCounts.pending / (filteredAppointments.length || 1)) * 100)}%
              </Badge>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancelados</p>
                <p className="text-2xl font-bold">{statusCounts.canceled}</p>
              </div>
              <Badge className="bg-red-500">
                <X className="h-4 w-4 mr-1" />
                {Math.round((statusCounts.canceled / (filteredAppointments.length || 1)) * 100)}%
              </Badge>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">{statusCounts.completed}</p>
              </div>
              <Badge className="bg-blue-500">
                <Check className="h-4 w-4 mr-1" />
                {Math.round((statusCounts.completed / (filteredAppointments.length || 1)) * 100)}%
              </Badge>
            </CardContent>
          </Card>
        </div>
        
        {/* Barra de pesquisa */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar cliente ou serviço..."
              className="pl-8"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Conteúdo principal - calendário ou lista */}
        <TabsContent value="week" className="mt-0">
          {isCalendarLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <WeeklyCalendar 
              appointments={filteredAppointments} 
              professionals={professionals}
              selectedDate={selectedDate}
              selectedProfessionalId={selectedProfessional ? parseInt(selectedProfessional) : undefined}
              onAppointmentClick={(appointment) => setSelectedAppointment(appointment)}
              onSlotClick={handleSlotClick}
            />
          )}
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          {isCalendarLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <AppointmentList 
              appointments={filteredAppointments} 
              onStatusChange={handleStatusChangeWithConfirmation}
              onReschedule={handleReschedule}
            />
          )}
        </TabsContent>
      </div>
      
      {/* Modal para filtros */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filtros de Agendamento</SheetTitle>
            <SheetDescription>
              Filtre os agendamentos por diferentes critérios
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-4 space-y-4">
            <AppointmentFilters 
              onFilter={(filters) => {
                setStatusFilter(filters.status || "");
                setSelectedProfessional(filters.professionalId || "");
                setSearchTerm(filters.searchTerm || "");
              }}
              onClear={() => {
                setStatusFilter("");
                setSelectedProfessional("");
                setSearchTerm("");
              }}
              professionals={professionals}
            />
          </div>
          
          <SheetFooter>
            <SheetClose asChild>
              <Button>Aplicar Filtros</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      {/* Modal para bloqueio de horário */}
      <BlockTimeDialog 
        open={isBlockTimeOpen} 
        onOpenChange={setIsBlockTimeOpen}
        professionals={professionals}
        onSave={addBlockedTime}
        existingBlocks={existingBlocks}
        onDeleteBlock={deleteBlockedTime}
      />
      
      {/* Modal para novo agendamento */}
      <AppointmentDialog 
        open={newAppointmentOpen}
        onOpenChange={setNewAppointmentOpen}
        initialDate={newAppointmentDate}
        initialTime={newAppointmentTime}
        onSave={(appointment) => {
          // Aqui seria feita a chamada para a API para salvar o agendamento
          toast({
            title: "Agendamento criado",
            description: "O agendamento foi criado com sucesso",
          });
        }}
      />
      
      {/* Diálogo de confirmação de alteração de status */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {statusAction === "confirm" ? "Confirmar Agendamento" : "Cancelar Agendamento"}
            </DialogTitle>
            <DialogDescription>
              {statusAction === "confirm" 
                ? "Tem certeza que deseja confirmar este agendamento?"
                : "Tem certeza que deseja cancelar este agendamento?"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="py-4">
              <p><strong>Cliente:</strong> {selectedAppointment.clientName}</p>
              <p><strong>Serviço:</strong> {selectedAppointment.services.map(s => s.name).join(", ")}</p>
              <p><strong>Data:</strong> {format(new Date(selectedAppointment.date), "dd/MM/yyyy")}</p>
              <p><strong>Horário:</strong> {selectedAppointment.startTime} - {selectedAppointment.endTime}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant={statusAction === "confirm" ? "default" : "destructive"}
              onClick={confirmStatusChange}
            >
              {statusAction === "confirm" ? "Confirmar" : "Cancelar Agendamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de reagendamento */}
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reagendar Atendimento</DialogTitle>
            <DialogDescription>
              Altere a data, horário ou profissional para este atendimento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reschedule-date">Nova Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal w-full"
                    id="reschedule-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {rescheduleDate ? format(rescheduleDate, "PPP") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <ReactCalendar
                    mode="single"
                    selected={rescheduleDate}
                    onSelect={(date) => date && setRescheduleDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="reschedule-time">Novo Horário</Label>
              <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                <SelectTrigger id="reschedule-time">
                  <SelectValue placeholder="Selecionar horário" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                    <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                      {`${hour.toString().padStart(2, '0')}:00`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="reschedule-professional">Profissional</Label>
              <Select value={rescheduleProfessional} onValueChange={setRescheduleProfessional}>
                <SelectTrigger id="reschedule-professional">
                  <SelectValue placeholder="Selecionar profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map(professional => (
                    <SelectItem key={professional.id} value={String(professional.id)}>
                      {professional.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmReschedule}>
              Reagendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de relatórios */}
      <Sheet open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Relatório de Agendamentos</SheetTitle>
            <SheetDescription>
              Configure os filtros para gerar um relatório personalizado
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <Label>Período</Label>
              <div className="flex items-center space-x-2 mt-1.5">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {reportDateRange?.from ? (
                        reportDateRange.to ? (
                          <>
                            {format(reportDateRange.from, "dd/MM/yyyy")} -{" "}
                            {format(reportDateRange.to, "dd/MM/yyyy")}
                          </>
                        ) : (
                          format(reportDateRange.from, "dd/MM/yyyy")
                        )
                      ) : (
                        <span>Selecione o período</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <ReactCalendar
                      mode="range"
                      defaultMonth={reportDateRange?.from}
                      selected={reportDateRange}
                      onSelect={setReportDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div>
              <Label>Profissionais</Label>
              <Select
                value={reportProfessionalFilter.length === 1 ? reportProfessionalFilter[0] : ""}
                onValueChange={(value) => {
                  if (value) {
                    setReportProfessionalFilter([value]);
                  } else {
                    setReportProfessionalFilter([]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os profissionais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os profissionais</SelectItem>
                  {professionals.map(professional => (
                    <SelectItem key={professional.id} value={String(professional.id)}>
                      {professional.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Status do Agendamento</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {["confirmed", "pending", "canceled", "completed"].map(status => (
                  <Badge
                    key={status}
                    variant={reportStatusFilter.includes(status) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (reportStatusFilter.includes(status)) {
                        setReportStatusFilter(reportStatusFilter.filter(s => s !== status));
                      } else {
                        setReportStatusFilter([...reportStatusFilter, status]);
                      }
                    }}
                  >
                    {status === "confirmed" ? "Confirmado" : 
                     status === "pending" ? "Pendente" : 
                     status === "canceled" ? "Cancelado" : "Concluído"}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Status de Pagamento</Label>
              <div className="flex gap-2 mt-1.5">
                <Badge
                  variant={reportPaymentStatusFilter.includes("paid") ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (reportPaymentStatusFilter.includes("paid")) {
                      setReportPaymentStatusFilter(reportPaymentStatusFilter.filter(s => s !== "paid"));
                    } else {
                      setReportPaymentStatusFilter([...reportPaymentStatusFilter, "paid"]);
                    }
                  }}
                >
                  Pago
                </Badge>
                <Badge
                  variant={reportPaymentStatusFilter.includes("pending") ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (reportPaymentStatusFilter.includes("pending")) {
                      setReportPaymentStatusFilter(reportPaymentStatusFilter.filter(s => s !== "pending"));
                    } else {
                      setReportPaymentStatusFilter([...reportPaymentStatusFilter, "pending"]);
                    }
                  }}
                >
                  Pendente
                </Badge>
              </div>
            </div>
            
            <div>
              <Label>Cliente</Label>
              <div className="space-y-2 mt-1.5">
                <Input
                  placeholder="Buscar cliente pelo nome"
                  value={reportClientSearch}
                  onChange={e => setReportClientSearch(e.target.value)}
                />
                
                <Select
                  value={reportClientFilter.length === 1 ? reportClientFilter[0] : ""}
                  onValueChange={(value) => {
                    if (value) {
                      setReportClientFilter([value]);
                    } else {
                      setReportClientFilter([]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os clientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os clientes</SelectItem>
                    {uniqueClients.map(client => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Ordenar por</Label>
              <Select value={reportSortBy} onValueChange={setReportSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Data" />
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
            
            <div>
              <Label>Formato de Exportação</Label>
              <div className="flex gap-2 mt-1.5">
                <Badge
                  variant={exportFormat === "pdf" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setExportFormat("pdf")}
                >
                  <FileText className="w-3 h-3 mr-1" />
                  PDF
                </Badge>
                <Badge
                  variant={exportFormat === "excel" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setExportFormat("excel")}
                >
                  <FileDown className="w-3 h-3 mr-1" />
                  Excel
                </Badge>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={clearReportFilters}>
                Limpar Filtros
              </Button>
              <Button onClick={generateReport} disabled={isReportLoading}>
                {isReportLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <BarChart className="mr-2 h-4 w-4" />
                    Gerar Relatório
                  </>
                )}
              </Button>
            </div>
            
            {showReportResults && (
              <div className="mt-6">
                <Separator className="mb-4" />
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Resultados</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportFormat === "pdf" ? exportReportToPDF : exportReportToExcel}
                    disabled={isReportLoading}
                  >
                    {isReportLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Exportar {exportFormat === "pdf" ? "PDF" : "Excel"}
                  </Button>
                </div>
                
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Data</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Profissional</TableHead>
                        <TableHead>Serviço</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReport.slice(0, 10).map(appointment => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            {format(new Date(appointment.date), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>{appointment.clientName}</TableCell>
                          <TableCell>{appointment.professionalName}</TableCell>
                          <TableCell>
                            {appointment.services.map(s => s.name).join(", ")}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                appointment.status === "confirmed" ? "border-green-500 text-green-500" :
                                appointment.status === "pending" ? "border-yellow-500 text-yellow-500" :
                                appointment.status === "canceled" ? "border-red-500 text-red-500" :
                                "border-blue-500 text-blue-500"
                              }
                            >
                              {appointment.status === "confirmed" ? "Confirmado" :
                               appointment.status === "pending" ? "Pendente" :
                               appointment.status === "canceled" ? "Cancelado" : "Concluído"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            R$ {appointment.totalValue.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {filteredReport.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Nenhum resultado encontrado para os filtros selecionados.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  
                  {filteredReport.length > 10 && (
                    <div className="px-4 py-2 text-center text-sm text-muted-foreground">
                      Mostrando 10 de {filteredReport.length} resultados. Exporte o relatório para ver todos.
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Total de agendamentos</p>
                      <p className="text-2xl font-bold">{filteredReport.length}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Valor total</p>
                      <p className="text-2xl font-bold">
                        R$ {filteredReport.reduce((sum, app) => sum + app.totalValue, 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
};

export default Appointments;
