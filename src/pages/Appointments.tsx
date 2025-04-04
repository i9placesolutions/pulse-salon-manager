Here's the complete code for src/pages/Appointments.tsx, with all placeholders replaced with the actual code:

<lov-code>
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
