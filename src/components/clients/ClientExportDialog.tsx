import { useState, useEffect } from "react";
import { ClientExportOptions } from "@/types/client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSpreadsheet, FileText, Download, Mail, CreditCard, Heart, Calendar, Scissors, Tag, BarChart, Users, Filter, Settings, Clock, Phone, Cake, User, CalendarRange, Check, Lock, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, subDays, subMonths, startOfDay, endOfDay, isBefore, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ClientExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientCount: number;
  onExport: (options: ClientExportOptions) => void;
}

// Definição dos passos do processo de exportação
type StepName = 'formato' | 'periodo' | 'dados' | 'opcoes';
type StepStatus = 'pending' | 'current' | 'complete';

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

  // Estado para controlar a aba ativa e o status de cada passo
  const [activeTab, setActiveTab] = useState<StepName>("formato");
  const [dateError, setDateError] = useState<string | null>(null);
  const [steps, setSteps] = useState<Record<StepName, StepStatus>>({
    formato: 'current',
    periodo: 'pending',
    dados: 'pending',
    opcoes: 'pending'
  });

  // Resetar o estado quando o painel é aberto
  useEffect(() => {
    if (isOpen) {
      setDateError(null);
      setActiveTab("formato");
      setSteps({
        formato: 'current',
        periodo: 'pending',
        dados: 'pending',
        opcoes: 'pending'
      });
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

  // Função para avançar para o próximo passo
  const goToNextStep = (current: StepName, next: StepName) => {
    // Marca o passo atual como completo e o próximo como atual
    setSteps(prev => ({
      ...prev,
      [current]: 'complete',
      [next]: 'current'
    }));
    
    // Atualiza a aba ativa
    setActiveTab(next);
  };

  // Função para voltar ao passo anterior
  const goToPreviousStep = (current: StepName, previous: StepName) => {
    // Marca o passo atual como pendente e o anterior como atual
    setSteps(prev => ({
      ...prev,
      [current]: 'pending',
      [previous]: 'current'
    }));
    
    // Atualiza a aba ativa
    setActiveTab(previous);
  };

  // Verifica se o usuário pode acessar uma determinada aba
  const canAccessTab = (tab: StepName): boolean => {
    const stepOrder: StepName[] = ['formato', 'periodo', 'dados', 'opcoes'];
    const currentIndex = stepOrder.indexOf(activeTab);
    const targetIndex = stepOrder.indexOf(tab);
    
    // Permite acessar a aba atual, abas já completadas ou a aba anterior
    return tab === activeTab || 
           steps[tab] === 'complete' || 
           targetIndex === currentIndex - 1;
  };

  // Função para tentar mudar para uma aba específica
  const tryChangeTab = (tab: StepName) => {
    if (canAccessTab(tab)) {
      setActiveTab(tab);
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
      setActiveTab("periodo");
      return;
    }

    // Verificar se o período personalizado tem ambas as datas preenchidas quando selecionado
    if (options.timeRange === 'custom' && (!options.dateFrom || !options.dateTo)) {
      toast({
        title: "Datas incompletas",
        description: "Para período personalizado, defina data inicial e final",
        variant: "destructive"
      });
      setActiveTab("periodo");
      return;
    }

    // Ajustar as opções com base no tipo de relatório selecionado
    let finalOptions = { ...options };

    // Definir automaticamente as opções de acordo com o tipo de relatório
    if (finalOptions.exportFormat === "summary") {
      // Relatório Resumido (lista básica) - dados essenciais
      finalOptions = {
        ...finalOptions,
        includeContact: true,
        includeAddress: false,
        includeServices: false,
        includeSpending: true,
        includePreferences: false,
        includeBirthday: true,
        includeTags: true,
        includeVisitHistory: false,
        includeCashbackHistory: false,
        includeAverageTicket: false,
        includeCharts: false,
        includeAnalytics: false
      };
      
      toast({
        title: "Relatório resumido",
        description: "Gerando lista básica com informações essenciais dos clientes"
      });
    } 
    else if (finalOptions.exportFormat === "detailed") {
      // Relatório Detalhado (com histórico) - inclui históricos
      finalOptions = {
        ...finalOptions,
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
        includeCharts: false,
        includeAnalytics: true
      };
      
      toast({
        title: "Relatório detalhado",
        description: "Gerando relatório completo com histórico de serviços e visitas"
      });
    } 
    else if (finalOptions.exportFormat === "analytics") {
      // Relatório Estatístico (com gráficos) - foco em métricas
      finalOptions = {
        ...finalOptions,
        includeContact: true,
        includeAddress: false,
        includeServices: true,
        includeSpending: true,
        includePreferences: false,
        includeBirthday: true,
        includeTags: true,
        includeVisitHistory: true,
        includeCashbackHistory: true,
        includeAverageTicket: true,
        includeCharts: true,
        includeAnalytics: true
      };
      
      // Forçar formato PDF para relatórios com gráficos
      if (finalOptions.format !== "pdf") {
        finalOptions.format = "pdf";
        toast({
          title: "Formato ajustado para PDF",
          description: "Relatórios estatísticos com gráficos são gerados em PDF"
        });
      } else {
        toast({
          title: "Relatório estatístico",
          description: "Gerando relatório com métricas e gráficos de análise"
        });
      }
    }

    // Marca a etapa final como concluída
    setSteps(prev => ({
      ...prev,
      opcoes: 'complete'
    }));

    // Enviar as opções ajustadas para a função de exportação
    onExport(finalOptions);
    onClose();
  };

  // Componente reutilizável para seleção de formato
  const FormatSelector = () => (
    <div className="mb-3 p-2 border rounded-md bg-muted/20">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">Formato do Relatório</h4>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={options.format === "excel" ? "default" : "outline"} 
            className={`h-7 px-2 gap-1 ${options.format === "excel" ? "bg-green-600 hover:bg-green-700" : ""}`}
            onClick={() => handleFormatChange("excel")}
          >
            <FileSpreadsheet className="w-3 h-3" />
            <span className="text-xs">Excel</span>
          </Button>
          
          <Button 
            size="sm" 
            variant={options.format === "pdf" ? "default" : "outline"} 
            className={`h-7 px-2 gap-1 ${options.format === "pdf" ? "bg-red-600 hover:bg-red-700" : ""}`}
            onClick={() => handleFormatChange("pdf")}
          >
            <FileText className="w-3 h-3" />
            <span className="text-xs">PDF</span>
          </Button>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        Formato para o relatório de {clientCount} cliente{clientCount !== 1 ? "s" : ""}
      </div>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="p-0 w-full max-w-full sm:max-w-2xl border-l flex flex-col h-[100dvh] bg-white"
      >
        {/* Cabeçalho fixo */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 border-b">
          <SheetHeader className="p-6">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl flex items-center gap-2 text-white">
                <FileText className="h-5 w-5 text-white" />
                Relatórios de Clientes
              </SheetTitle>
              <SheetClose className="rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-white">
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </SheetClose>
            </div>
            <SheetDescription className="text-blue-100">
              Configure seu relatório com {clientCount} cliente{clientCount !== 1 ? "s" : ""}. Selecione o formato e os dados desejados.
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Conteúdo rolável */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="p-6">
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => tryChangeTab(value as StepName)} 
              className="flex flex-col"
            >
              <TabsList className="grid grid-cols-4 mb-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger 
                        value="formato" 
                        className="text-xs py-1 relative" 
                        disabled={!canAccessTab('formato')}
                      >
                        <FileSpreadsheet className="w-3 h-3 mr-1" />
                        Formato
                        {steps.formato === 'complete' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className={canAccessTab('formato') ? "hidden" : ""}>
                      Complete as etapas anteriores primeiro
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger 
                        value="periodo" 
                        className="text-xs py-1 relative" 
                        disabled={!canAccessTab('periodo')}
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        Período
                        {steps.periodo === 'complete' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" />
                          </div>
                        )}
                        {!canAccessTab('periodo') && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-slate-400 rounded-full flex items-center justify-center">
                            <Lock className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className={canAccessTab('periodo') ? "hidden" : ""}>
                      Complete as etapas anteriores primeiro
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger 
                        value="dados" 
                        className="text-xs py-1 relative" 
                        disabled={!canAccessTab('dados')}
                      >
                        <Users className="w-3 h-3 mr-1" />
                        Dados
                        {steps.dados === 'complete' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" />
                          </div>
                        )}
                        {!canAccessTab('dados') && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-slate-400 rounded-full flex items-center justify-center">
                            <Lock className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className={canAccessTab('dados') ? "hidden" : ""}>
                      Complete as etapas anteriores primeiro
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger 
                        value="opcoes" 
                        className="text-xs py-1 relative" 
                        disabled={!canAccessTab('opcoes')}
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Opções
                        {steps.opcoes === 'complete' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" />
                          </div>
                        )}
                        {!canAccessTab('opcoes') && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-slate-400 rounded-full flex items-center justify-center">
                            <Lock className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className={canAccessTab('opcoes') ? "hidden" : ""}>
                      Complete as etapas anteriores primeiro
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsList>

              <div className="space-y-4">
                {/* Aba de escolha do formato */}
                <TabsContent value="formato" className="space-y-4 mt-0">
                  <div className="space-y-3 p-4 rounded-md border bg-muted/30">
                    <h4 className="text-sm font-medium mb-2">Escolha o Formato</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div 
                        className={`border rounded-md p-3 cursor-pointer ${options.format === 'excel' ? 'bg-green-50 border-green-200' : 'hover:bg-slate-50'}`}
                        onClick={() => handleFormatChange("excel")}
                      >
                        <div className="flex items-center mb-2">
                          <FileSpreadsheet className="w-8 h-8 text-green-600 mr-2" />
                          <div>
                            <h5 className="text-sm font-medium">Excel</h5>
                            <p className="text-xs text-muted-foreground">Planilha editável</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Ideal para filtrar dados</p>
                        {options.format === 'excel' && (
                          <div className="text-xs text-green-600 mt-2 flex items-center">
                            <Check className="w-3 h-3 mr-1" /> Selecionado
                          </div>
                        )}
                      </div>
                      
                      <div 
                        className={`border rounded-md p-3 cursor-pointer ${options.format === 'pdf' ? 'bg-red-50 border-red-200' : 'hover:bg-slate-50'}`}
                        onClick={() => handleFormatChange("pdf")}
                      >
                        <div className="flex items-center mb-2">
                          <FileText className="w-8 h-8 text-red-600 mr-2" />
                          <div>
                            <h5 className="text-sm font-medium">PDF</h5>
                            <p className="text-xs text-muted-foreground">Documento formatado</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Ideal para impressão</p>
                        {options.format === 'pdf' && (
                          <div className="text-xs text-red-600 mt-2 flex items-center">
                            <Check className="w-3 h-3 mr-1" /> Selecionado
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <h4 className="text-sm font-medium">Tipo de Relatório</h4>
                      <RadioGroup
                        value={options.exportFormat}
                        onValueChange={(value) => handleSelectChange("exportFormat", value)}
                        className="grid grid-cols-1 gap-2"
                      >
                        <div className="flex items-center space-x-2 border rounded-md px-3 py-2 cursor-pointer hover:bg-slate-50">
                          <RadioGroupItem value="summary" id="summary" />
                          <Label htmlFor="summary" className="cursor-pointer">Resumido (lista básica)</Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-md px-3 py-2 cursor-pointer hover:bg-slate-50">
                          <RadioGroupItem value="detailed" id="detailed" />
                          <Label htmlFor="detailed" className="cursor-pointer">Detalhado (com histórico)</Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-md px-3 py-2 cursor-pointer hover:bg-slate-50">
                          <RadioGroupItem value="analytics" id="analytics" />
                          <Label htmlFor="analytics" className="cursor-pointer">Estatístico (com gráficos)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-3 gap-2">
                    <Button size="sm" onClick={() => goToNextStep('formato', 'periodo')}>
                      Próximo: Período
                    </Button>
                  </div>
                </TabsContent>
                
                {/* Aba de período do relatório */}
                <TabsContent value="periodo" className="space-y-4 mt-0">
                  <FormatSelector />
                  
                  <div className="space-y-3 p-4 rounded-md border bg-muted/30">
                    <h4 className="text-sm font-medium mb-2">Escolha o Período</h4>
                    
                    <div className="space-y-2">
                      <Select 
                        value={options.timeRange} 
                        onValueChange={(value) => handleSelectChange("timeRange", value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todo o histórico</SelectItem>
                          <SelectItem value="last30">Últimos 30 dias</SelectItem>
                          <SelectItem value="last90">Últimos 90 dias</SelectItem>
                          <SelectItem value="last180">Últimos 6 meses</SelectItem>
                          <SelectItem value="last365">Último ano</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {options.timeRange === 'custom' && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div className="space-y-1">
                            <Label htmlFor="date-from" className="text-xs">De</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !options.dateFrom && "text-muted-foreground"
                                  )}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {options.dateFrom ? (
                                    format(options.dateFrom, "dd/MM/yyyy", { locale: ptBR })
                                  ) : (
                                    <span>Data inicial</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={options.dateFrom}
                                  onSelect={(date) => handleDateChange('dateFrom', date)}
                                  disabled={(date) => isAfter(date, new Date())}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          
                          <div className="space-y-1">
                            <Label htmlFor="date-to" className="text-xs">Até</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !options.dateTo && "text-muted-foreground"
                                  )}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {options.dateTo ? (
                                    format(options.dateTo, "dd/MM/yyyy", { locale: ptBR })
                                  ) : (
                                    <span>Data final</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={options.dateTo}
                                  onSelect={(date) => handleDateChange('dateTo', date)}
                                  disabled={(date) => isAfter(date, new Date())}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      )}
                      
                      {dateError && (
                        <div className="text-xs text-red-500 mt-1">
                          {dateError}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-3 gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => goToPreviousStep('periodo', 'formato')}
                    >
                      Voltar: Formato
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => goToNextStep('periodo', 'dados')}
                    >
                      Próximo: Dados
                    </Button>
                  </div>
                </TabsContent>
                
                {/* Conteúdo para as outras abas */}
                {/* ... resto do conteúdo ... */}

                {/* Aba de dados para incluir no relatório */}
                <TabsContent value="dados" className="space-y-4 mt-0">
                  <FormatSelector />
                  
                  <div className="space-y-3 p-4 rounded-md border bg-muted/30">
                    <h4 className="text-sm font-medium mb-2">Dados a incluir no relatório</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-blue-500" />
                          <Label htmlFor="include-contact" className="text-sm">Informações de contato</Label>
                        </div>
                        <Switch 
                          id="include-contact" 
                          checked={options.includeContact}
                          onCheckedChange={(checked) => handleToggleOption("includeContact", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-blue-500" />
                          <Label htmlFor="include-address" className="text-sm">Endereço completo</Label>
                        </div>
                        <Switch 
                          id="include-address" 
                          checked={options.includeAddress}
                          onCheckedChange={(checked) => handleToggleOption("includeAddress", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Scissors className="w-4 h-4 text-purple-500" />
                          <Label htmlFor="include-services" className="text-sm">Histórico de serviços</Label>
                        </div>
                        <Switch 
                          id="include-services" 
                          checked={options.includeServices}
                          onCheckedChange={(checked) => handleToggleOption("includeServices", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-green-500" />
                          <Label htmlFor="include-spending" className="text-sm">Gastos e pagamentos</Label>
                        </div>
                        <Switch 
                          id="include-spending" 
                          checked={options.includeSpending}
                          onCheckedChange={(checked) => handleToggleOption("includeSpending", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Cake className="w-4 h-4 text-pink-500" />
                          <Label htmlFor="include-birthday" className="text-sm">Aniversários</Label>
                        </div>
                        <Switch 
                          id="include-birthday" 
                          checked={options.includeBirthday}
                          onCheckedChange={(checked) => handleToggleOption("includeBirthday", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Tag className="w-4 h-4 text-yellow-500" />
                          <Label htmlFor="include-tags" className="text-sm">Tags e categorias</Label>
                        </div>
                        <Switch 
                          id="include-tags" 
                          checked={options.includeTags}
                          onCheckedChange={(checked) => handleToggleOption("includeTags", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CalendarRange className="w-4 h-4 text-indigo-500" />
                          <Label htmlFor="include-visit-history" className="text-sm">Histórico de visitas</Label>
                        </div>
                        <Switch 
                          id="include-visit-history" 
                          checked={options.includeVisitHistory}
                          onCheckedChange={(checked) => handleToggleOption("includeVisitHistory", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          <Label htmlFor="include-preferences" className="text-sm">Preferências dos clientes</Label>
                        </div>
                        <Switch 
                          id="include-preferences" 
                          checked={options.includePreferences}
                          onCheckedChange={(checked) => handleToggleOption("includePreferences", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <BarChart className="w-4 h-4 text-blue-500" />
                          <Label htmlFor="include-analytics" className="text-sm">Análises e métricas</Label>
                        </div>
                        <Switch 
                          id="include-analytics" 
                          checked={options.includeAnalytics}
                          onCheckedChange={(checked) => handleToggleOption("includeAnalytics", checked)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-3 gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => goToPreviousStep('dados', 'periodo')}
                    >
                      Voltar: Período
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => goToNextStep('dados', 'opcoes')}
                    >
                      Próximo: Opções
                    </Button>
                  </div>
                </TabsContent>

                {/* Aba de opções avançadas */}
                <TabsContent value="opcoes" className="space-y-4 mt-0">
                  <FormatSelector />
                  
                  <div className="space-y-3 p-4 rounded-md border bg-muted/30">
                    <h4 className="text-sm font-medium mb-2">Opções Avançadas</h4>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="group-by" className="text-xs">Agrupar por</Label>
                        <Select 
                          value={options.groupBy} 
                          onValueChange={(value) => handleSelectChange("groupBy", value)}
                        >
                          <SelectTrigger id="group-by" className="h-9">
                            <SelectValue placeholder="Selecione o agrupamento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sem agrupamento</SelectItem>
                            <SelectItem value="status">Status do cliente</SelectItem>
                            <SelectItem value="tag">Tags</SelectItem>
                            <SelectItem value="lastVisit">Última visita</SelectItem>
                            <SelectItem value="birthMonth">Mês de aniversário</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="sort-by" className="text-xs">Ordenar por</Label>
                        <Select 
                          value={options.sortBy} 
                          onValueChange={(value) => handleSelectChange("sortBy", value)}
                        >
                          <SelectTrigger id="sort-by" className="h-9">
                            <SelectValue placeholder="Selecione a ordenação" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">Nome</SelectItem>
                            <SelectItem value="lastVisit">Última visita</SelectItem>
                            <SelectItem value="totalSpent">Total gasto</SelectItem>
                            <SelectItem value="visitsCount">Número de visitas</SelectItem>
                            <SelectItem value="birthDate">Data de aniversário</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                          <BarChart className="w-4 h-4 text-blue-500" />
                          <Label htmlFor="include-charts" className="text-sm">Incluir gráficos</Label>
                          <p className="text-xs text-muted-foreground">(apenas PDF)</p>
                        </div>
                        <Switch 
                          id="include-charts" 
                          checked={options.includeCharts}
                          onCheckedChange={(checked) => handleToggleOption("includeCharts", checked)}
                          disabled={options.format !== "pdf"}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-md border bg-blue-50">
                    <div className="flex items-center mb-2">
                      <BarChart className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="text-sm font-medium text-blue-800">Resumo do Relatório</h4>
                    </div>
                    <div className="space-y-2 text-xs text-blue-800">
                      <p>Formato: <span className="font-medium">{options.format === "excel" ? "Excel" : "PDF"}</span></p>
                      <p>Tipo: <span className="font-medium">
                        {options.exportFormat === "summary" ? "Resumido" : 
                         options.exportFormat === "detailed" ? "Detalhado" : "Estatístico"}
                      </span></p>
                      <p>Período: <span className="font-medium">
                        {options.timeRange === "all" ? "Todo o histórico" : 
                         options.timeRange === "last30" ? "Últimos 30 dias" :
                         options.timeRange === "last90" ? "Últimos 90 dias" :
                         options.timeRange === "last180" ? "Últimos 6 meses" :
                         options.timeRange === "last365" ? "Último ano" : "Personalizado"}
                      </span></p>
                      <p>Clientes incluídos: <span className="font-medium">{clientCount}</span></p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-3 gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => goToPreviousStep('opcoes', 'dados')}
                    >
                      Voltar: Dados
                    </Button>
                    <Button 
                      size="sm" 
                      variant="pink"
                      onClick={handleExport}
                    >
                      Concluir e Gerar
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
        
        {/* Rodapé fixo */}
        <div className="sticky bottom-0 mt-auto p-6 border-t bg-white shadow-sm">
          <div className="flex flex-row gap-3 w-full justify-end">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button 
              variant="pink"
              onClick={handleExport}
              disabled={dateError !== null || steps.opcoes !== 'complete' && steps.opcoes !== 'current'}
            >
              <Download className="mr-2 h-4 w-4" />
              Gerar Relatório
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 