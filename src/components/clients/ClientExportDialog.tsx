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
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <div className="space-y-3 mb-3 bg-muted/30 p-2 rounded-md">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Período do Relatório</h4>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="timeRange" className="text-sm">Selecione o Período</Label>
        <Select 
          value={options.timeRange} 
          onValueChange={(value) => handleSelectChange("timeRange", value)}
        >
          <SelectTrigger id="timeRange" className="h-8 text-xs">
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

      <div className={cn("grid grid-cols-2 gap-3", 
        options.timeRange !== 'custom' && options.timeRange !== 'all' ? "opacity-50 pointer-events-none" : ""
      )}>
        <div className="space-y-1">
          <Label htmlFor="dateFrom" className="text-xs">Data Inicial</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full h-8 justify-start text-left font-normal text-xs",
                  !options.dateFrom && "text-muted-foreground"
                )}
              >
                <CalendarRange className="mr-2 h-3 w-3" />
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

        <div className="space-y-1">
          <Label htmlFor="dateTo" className="text-xs">Data Final</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full h-8 justify-start text-left font-normal text-xs",
                  !options.dateTo && "text-muted-foreground"
                )}
              >
                <CalendarRange className="mr-2 h-3 w-3" />
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
        <div className="text-xs font-medium text-destructive mt-1">
          {dateError}
        </div>
      )}

      {options.timeRange !== 'all' && options.timeRange !== 'custom' && (
        <div className="flex items-center space-x-2 p-1 bg-muted/40 rounded-md text-xs mt-1">
          <Check className="h-3 w-3 text-primary" />
          {options.dateFrom && options.dateTo ? (
            <span>
              Período: {format(options.dateFrom, 'dd/MM/yyyy')} até {format(options.dateTo, 'dd/MM/yyyy')}
            </span>
          ) : (
            <span>Período automático será aplicado</span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-4">
        <DialogHeader className="pb-2">
          <DialogTitle>Relatório Avançado de Clientes</DialogTitle>
          <DialogDescription className="text-xs">
            Configure seu relatório com {clientCount} cliente{clientCount !== 1 ? "s" : ""}.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-2">
            <TabsTrigger value="dados" className="text-xs py-1">
              <Users className="w-3 h-3 mr-1" />
              Dados
            </TabsTrigger>
            <TabsTrigger value="historico" className="text-xs py-1">
              <Clock className="w-3 h-3 mr-1" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="filtros" className="text-xs py-1">
              <Filter className="w-3 h-3 mr-1" />
              Filtros
            </TabsTrigger>
            <TabsTrigger value="exportacao" className="text-xs py-1">
              <Download className="w-3 h-3 mr-1" />
              Exportação
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(90vh-200px)] pr-3">
            <TabsContent value="dados" className="space-y-3">
              <DateRangeSelector />
              
              <h4 className="text-sm font-medium">Informações do Cliente</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-primary/70" />
                    <Label htmlFor="basicInfo" className="cursor-pointer text-sm">Informações básicas (nome, CPF)</Label>
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
                    <Label htmlFor="contact" className="cursor-pointer text-sm">Contato (email, telefone)</Label>
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
                    <Label htmlFor="tags" className="cursor-pointer text-sm">Tags do cliente</Label>
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
                    <Label htmlFor="birthday" className="cursor-pointer text-sm">Data de aniversário</Label>
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
                    <Label htmlFor="preferences" className="cursor-pointer text-sm">Preferências do cliente</Label>
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

            <TabsContent value="historico" className="space-y-3">
              <DateRangeSelector />
              
              <h4 className="text-sm font-medium">Histórico e Estatísticas</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-2">
                    <Scissors className="w-4 h-4 text-primary/70" />
                    <Label htmlFor="services" className="cursor-pointer text-sm">Histórico de serviços</Label>
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
                    <Label htmlFor="visitHistory" className="cursor-pointer text-sm">Histórico de visitas</Label>
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
                    <Label htmlFor="spending" className="cursor-pointer text-sm">Gastos e cashback</Label>
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
                    <Label htmlFor="analytics" className="cursor-pointer text-sm">Estatísticas de cliente</Label>
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

            <TabsContent value="filtros" className="space-y-3">
              <DateRangeSelector />
              
              <h4 className="text-sm font-medium">Organização</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="groupBy" className="text-sm">Agrupar por</Label>
                  <Select 
                    value={options.groupBy} 
                    onValueChange={(value) => handleSelectChange("groupBy", value)}
                  >
                    <SelectTrigger id="groupBy" className="h-8 text-xs">
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

                <div className="space-y-1">
                  <Label htmlFor="sortBy" className="text-sm">Ordenar por</Label>
                  <Select 
                    value={options.sortBy} 
                    onValueChange={(value) => handleSelectChange("sortBy", value)}
                  >
                    <SelectTrigger id="sortBy" className="h-8 text-xs">
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

            <TabsContent value="exportacao" className="space-y-3">
              <DateRangeSelector />
              
              <h4 className="text-sm font-medium">Tipo de Relatório</h4>
              
              <RadioGroup
                value={options.exportFormat}
                onValueChange={(value) => handleSelectChange("exportFormat", value)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 rounded-md border p-2 cursor-pointer hover:bg-slate-50">
                  <RadioGroupItem value="summary" id="summary" />
                  <Label htmlFor="summary" className="cursor-pointer">
                    <div className="font-medium text-sm">Resumido</div>
                    <div className="text-xs text-muted-foreground">Dados principais e totais por cliente</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-md border p-2 cursor-pointer hover:bg-slate-50">
                  <RadioGroupItem value="detailed" id="detailed" />
                  <Label htmlFor="detailed" className="cursor-pointer">
                    <div className="font-medium text-sm">Detalhado</div>
                    <div className="text-xs text-muted-foreground">Todas as informações selecionadas por cliente</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-md border p-2 cursor-pointer hover:bg-slate-50">
                  <RadioGroupItem value="analytics" id="analytics" />
                  <Label htmlFor="analytics" className="cursor-pointer">
                    <div className="font-medium text-sm">Estatístico</div>
                    <div className="text-xs text-muted-foreground">Foco em métricas e totais por categoria</div>
                  </Label>
                </div>
              </RadioGroup>

              <Separator className="my-3" />

              <h4 className="text-sm font-medium">Tipo de Arquivo</h4>
              <RadioGroup
                value={options.format}
                onValueChange={(value) => handleFormatChange(value as "pdf" | "excel")}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2 rounded-md border p-2 cursor-pointer hover:bg-slate-50" onClick={() => handleFormatChange("excel")}>
                  <RadioGroupItem value="excel" id="excel" />
                  <FileSpreadsheet className="w-4 h-4 text-green-600 mr-1" />
                  <Label htmlFor="excel" className="cursor-pointer text-sm">Excel (.xlsx)</Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-2 cursor-pointer hover:bg-slate-50" onClick={() => handleFormatChange("pdf")}>
                  <RadioGroupItem value="pdf" id="pdf" />
                  <FileText className="w-4 h-4 text-red-600 mr-1" />
                  <Label htmlFor="pdf" className="cursor-pointer text-sm">PDF (.pdf)</Label>
                </div>
              </RadioGroup>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0 mt-3 pt-2 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            size="sm"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            className="bg-primary hover:bg-primary/90"
            size="sm"
          >
            <Download className="w-3 h-3 mr-1" />
            Exportar Relatório
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 