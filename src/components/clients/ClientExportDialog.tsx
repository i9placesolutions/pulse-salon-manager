import { useState, useEffect } from "react";
import { ClientExportOptions } from "@/types/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSpreadsheet, FileText, Download, Mail, CreditCard, Heart, Calendar, Scissors, Tag, BarChart, Users, Filter, Settings, Clock, Phone, Cake, User, CalendarRange, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, subDays, subMonths, startOfDay, endOfDay, isBefore, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";

interface ClientExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientCount: number;
  onExport: (options: ClientExportOptions) => void;
}

export function ClientExportDialog({
  isOpen,
  onClose,
  clientCount,
  onExport,
}: ClientExportDialogProps) {
  const { toast } = useToast();
  const today = new Date();

  const [options, setOptions] = useState<ClientExportOptions>({
    includeContact: true,
    includeAddress: false,
    includeServices: true,
    includeSpending: true,
    includePreferences: false,
    includeBirthday: true,
    format: "excel",
    includeTags: true,
    includeVisitHistory: true,
    includeCashbackHistory: false,
    includeAverageTicket: true,
    includeCharts: true,
    groupBy: "none",
    sortBy: "name",
    timeRange: "all",
    exportFormat: "detailed",
    includeAnalytics: true,
    dateFrom: undefined,
    dateTo: undefined,
  });

  const [activeTab, setActiveTab] = useState("dados");
  const [dateError, setDateError] = useState<string | null>(null);

  // Resetar o estado quando o modal é aberto
  useEffect(() => {
    if (isOpen) {
      setDateError(null);
      setOptions({
        includeContact: true,
        includeAddress: false,
        includeServices: true,
        includeSpending: true,
        includePreferences: false,
        includeBirthday: true,
        format: "excel",
        includeTags: true,
        includeVisitHistory: true,
        includeCashbackHistory: false,
        includeAverageTicket: true,
        includeCharts: true,
        groupBy: "none",
        sortBy: "name",
        timeRange: "all",
        exportFormat: "detailed",
        includeAnalytics: true,
        dateFrom: undefined,
        dateTo: undefined,
      });
    }
  }, [isOpen]);

  // Quando o período predefinido muda, atualiza as datas de início e fim
  useEffect(() => {
    if (options.timeRange !== 'custom') {
      updateDatesByRange(options.timeRange);
    }
  }, [options.timeRange]);

  // Função para atualizar o período com base na seleção predefinida
  const updateDatesByRange = (range: string) => {
    const now = new Date();
    let fromDate: Date | undefined = undefined;
    let toDate: Date | undefined = endOfDay(now);

    switch (range) {
      case 'last30':
        fromDate = startOfDay(subDays(now, 30));
        break;
      case 'last90':
        fromDate = startOfDay(subDays(now, 90));
        break;
      case 'last180':
        fromDate = startOfDay(subDays(now, 180));
        break;
      case 'last365':
        fromDate = startOfDay(subDays(now, 365));
        break;
      case 'all':
        fromDate = undefined;
        toDate = undefined;
        break;
      default:
        // Não altera as datas para seleção personalizada
        return;
    }

    setOptions(prev => ({
      ...prev,
      dateFrom: fromDate,
      dateTo: toDate
    }));
  };

  const handleToggleOption = (key: keyof ClientExportOptions, value: boolean) => {
    setOptions({ ...options, [key]: value });
  };

  const handleFormatChange = (format: "pdf" | "excel") => {
    setOptions({ ...options, format });
  };

  const handleSelectChange = (key: keyof ClientExportOptions, value: string) => {
    setOptions({ ...options, [key]: value });
  };

  const handleDateChange = (key: 'dateFrom' | 'dateTo', value: Date | undefined) => {
    // Atualizar para modo personalizado quando as datas são alteradas manualmente
    setOptions({ 
      ...options, 
      [key]: value,
      timeRange: 'custom'
    });

    // Validar datas
    validateDates(key === 'dateFrom' ? value : options.dateFrom, key === 'dateTo' ? value : options.dateTo);
  };

  // Validar se a data final não é anterior à data inicial
  const validateDates = (from: Date | undefined, to: Date | undefined) => {
    if (from && to && isAfter(from, to)) {
      setDateError('A data inicial não pode ser posterior à data final');
    } else {
      setDateError(null);
    }
  };

  const handleExport = () => {
    // Verificar se há erro de datas antes de exportar
    if (dateError) {
      toast({
        title: "Erro nas datas",
        description: dateError,
        variant: "destructive"
      });
      setActiveTab("filtros");
      return;
    }

    // Verificar se o período personalizado tem ambas as datas preenchidas quando selecionado
    if (options.timeRange === 'custom' && (!options.dateFrom || !options.dateTo)) {
      toast({
        title: "Datas incompletas",
        description: "Para período personalizado, defina data inicial e final",
        variant: "destructive"
      });
      setActiveTab("filtros");
      return;
    }

    onExport(options);
    onClose();
  };

  // Componente reutilizável para seleção de período
  const DateRangeSelector = () => (
    <div className="space-y-4 mb-4 bg-muted/30 p-3 rounded-md">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Período do Relatório</h4>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="timeRange">Selecione o Período</Label>
        <Select 
          value={options.timeRange} 
          onValueChange={(value) => handleSelectChange("timeRange", value)}
        >
          <SelectTrigger id="timeRange">
            <SelectValue placeholder="Selecione uma opção" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo o histórico</SelectItem>
            <SelectItem value="last30">Últimos 30 dias</SelectItem>
            <SelectItem value="last90">Últimos 90 dias</SelectItem>
            <SelectItem value="last180">Últimos 6 meses</SelectItem>
            <SelectItem value="last365">Último ano</SelectItem>
            <SelectItem value="custom">Período personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={cn("grid grid-cols-2 gap-4", 
        options.timeRange !== 'custom' && options.timeRange !== 'all' ? "opacity-50 pointer-events-none" : ""
      )}>
        <div className="space-y-2">
          <Label htmlFor="dateFrom">Data Inicial</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !options.dateFrom && "text-muted-foreground"
                )}
              >
                <CalendarRange className="mr-2 h-4 w-4" />
                {options.dateFrom ? (
                  format(options.dateFrom, 'dd/MM/yyyy')
                ) : (
                  "Selecione uma data"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={options.dateFrom}
                onSelect={(date) => handleDateChange('dateFrom', date)}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateTo">Data Final</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !options.dateTo && "text-muted-foreground"
                )}
              >
                <CalendarRange className="mr-2 h-4 w-4" />
                {options.dateTo ? (
                  format(options.dateTo, 'dd/MM/yyyy')
                ) : (
                  "Selecione uma data"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={options.dateTo}
                onSelect={(date) => handleDateChange('dateTo', date)}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {dateError && (
        <div className="text-sm font-medium text-destructive mt-1">
          {dateError}
        </div>
      )}

      {options.timeRange !== 'all' && options.timeRange !== 'custom' && (
        <div className="flex items-center space-x-2 p-2 bg-muted/40 rounded-md text-sm mt-2">
          <Check className="h-4 w-4 text-primary" />
          {options.dateFrom && options.dateTo ? (
            <span>
              Período selecionado: {format(options.dateFrom, 'dd/MM/yyyy')} até {format(options.dateTo, 'dd/MM/yyyy')}
            </span>
          ) : (
            <span>Período automático será aplicado ao exportar</span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Relatório Avançado de Clientes</DialogTitle>
          <DialogDescription>
            Configure seu relatório detalhado com {clientCount} cliente{clientCount !== 1 ? "s" : ""}.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="dados">
              <Users className="w-4 h-4 mr-2" />
              Dados
            </TabsTrigger>
            <TabsTrigger value="historico">
              <Clock className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="filtros">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </TabsTrigger>
            <TabsTrigger value="exportacao">
              <Download className="w-4 h-4 mr-2" />
              Exportação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4">
            <DateRangeSelector />
            
            <h4 className="text-sm font-medium">Informações do Cliente</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-primary/70" />
                  <Label htmlFor="basicInfo" className="cursor-pointer">Informações básicas (nome, CPF)</Label>
                </div>
                <Switch
                  id="basicInfo"
                  checked={true}
                  disabled={true}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-primary/70" />
                  <Label htmlFor="contact" className="cursor-pointer">Contato (email, telefone)</Label>
                </div>
                <Switch
                  id="contact"
                  checked={options.includeContact}
                  onCheckedChange={(checked) =>
                    handleToggleOption("includeContact", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-primary/70" />
                  <Label htmlFor="tags" className="cursor-pointer">Tags do cliente</Label>
                </div>
                <Switch
                  id="tags"
                  checked={options.includeTags}
                  onCheckedChange={(checked) =>
                    handleToggleOption("includeTags", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Cake className="w-4 h-4 text-primary/70" />
                  <Label htmlFor="birthday" className="cursor-pointer">Data de aniversário</Label>
                </div>
                <Switch
                  id="birthday"
                  checked={options.includeBirthday}
                  onCheckedChange={(checked) =>
                    handleToggleOption("includeBirthday", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-primary/70" />
                  <Label htmlFor="preferences" className="cursor-pointer">Preferências do cliente</Label>
                </div>
                <Switch
                  id="preferences"
                  checked={options.includePreferences}
                  onCheckedChange={(checked) =>
                    handleToggleOption("includePreferences", checked)
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="historico" className="space-y-4">
            <DateRangeSelector />
            
            <h4 className="text-sm font-medium">Histórico e Estatísticas</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Scissors className="w-4 h-4 text-primary/70" />
                  <Label htmlFor="services" className="cursor-pointer">Histórico de serviços</Label>
                </div>
                <Switch
                  id="services"
                  checked={options.includeServices}
                  onCheckedChange={(checked) =>
                    handleToggleOption("includeServices", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-primary/70" />
                  <Label htmlFor="visitHistory" className="cursor-pointer">Histórico de visitas</Label>
                </div>
                <Switch
                  id="visitHistory"
                  checked={options.includeVisitHistory}
                  onCheckedChange={(checked) =>
                    handleToggleOption("includeVisitHistory", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-primary/70" />
                  <Label htmlFor="spending" className="cursor-pointer">Gastos e cashback</Label>
                </div>
                <Switch
                  id="spending"
                  checked={options.includeSpending}
                  onCheckedChange={(checked) =>
                    handleToggleOption("includeSpending", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <BarChart className="w-4 h-4 text-primary/70" />
                  <Label htmlFor="analytics" className="cursor-pointer">Estatísticas de cliente (frequência, status)</Label>
                </div>
                <Switch
                  id="analytics"
                  checked={options.includeAnalytics}
                  onCheckedChange={(checked) =>
                    handleToggleOption("includeAnalytics", checked)
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="filtros" className="space-y-4">
            <DateRangeSelector />
            
            <h4 className="text-sm font-medium">Organização</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupBy">Agrupar por</Label>
                <Select 
                  value={options.groupBy} 
                  onValueChange={(value) => handleSelectChange("groupBy", value)}
                >
                  <SelectTrigger id="groupBy">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem agrupamento</SelectItem>
                    <SelectItem value="status">Status (Ativo, VIP, Inativo)</SelectItem>
                    <SelectItem value="services">Serviços</SelectItem>
                    <SelectItem value="tags">Tags</SelectItem>
                    <SelectItem value="frequency">Frequência de visitas</SelectItem>
                    <SelectItem value="spending">Valor gasto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortBy">Ordenar por</Label>
                <Select 
                  value={options.sortBy} 
                  onValueChange={(value) => handleSelectChange("sortBy", value)}
                >
                  <SelectTrigger id="sortBy">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nome</SelectItem>
                    <SelectItem value="lastVisit">Última visita</SelectItem>
                    <SelectItem value="spending">Gastos (maior para menor)</SelectItem>
                    <SelectItem value="frequency">Frequência (maior para menor)</SelectItem>
                    <SelectItem value="birthday">Aniversário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="exportacao" className="space-y-4">
            <DateRangeSelector />
            
            <h4 className="text-sm font-medium">Tipo de Relatório</h4>
            
            <RadioGroup
              value={options.exportFormat}
              onValueChange={(value) => handleSelectChange("exportFormat", value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-slate-50">
                <RadioGroupItem value="summary" id="summary" />
                <Label htmlFor="summary" className="cursor-pointer">
                  <div className="font-medium">Resumido</div>
                  <div className="text-sm text-muted-foreground">Dados principais e totais por cliente</div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-slate-50">
                <RadioGroupItem value="detailed" id="detailed" />
                <Label htmlFor="detailed" className="cursor-pointer">
                  <div className="font-medium">Detalhado</div>
                  <div className="text-sm text-muted-foreground">Todas as informações selecionadas por cliente</div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-slate-50">
                <RadioGroupItem value="analytics" id="analytics" />
                <Label htmlFor="analytics" className="cursor-pointer">
                  <div className="font-medium">Estatístico</div>
                  <div className="text-sm text-muted-foreground">Foco em métricas e totais por categoria</div>
                </Label>
              </div>
            </RadioGroup>

            <Separator className="my-4" />

            <h4 className="text-sm font-medium">Tipo de Arquivo</h4>
            <RadioGroup
              value={options.format}
              onValueChange={(value) => handleFormatChange(value as "pdf" | "excel")}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-slate-50" onClick={() => handleFormatChange("excel")}>
                <RadioGroupItem value="excel" id="excel" />
                <FileSpreadsheet className="w-5 h-5 text-green-600 mr-1" />
                <Label htmlFor="excel" className="cursor-pointer">Excel (.xlsx)</Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-slate-50" onClick={() => handleFormatChange("pdf")}>
                <RadioGroupItem value="pdf" id="pdf" />
                <FileText className="w-5 h-5 text-red-600 mr-1" />
                <Label htmlFor="pdf" className="cursor-pointer">PDF (.pdf)</Label>
              </div>
            </RadioGroup>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            className="bg-primary hover:bg-primary/90"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 