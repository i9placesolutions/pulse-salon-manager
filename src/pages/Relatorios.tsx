import { useState, useEffect, Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Download, FileText, Calendar, Users, UserCheck, Package,
  TrendingUp, Star, Clock, Activity, Scissors, ShoppingBag,
  AlertTriangle, Filter, Eye, Settings, FileDown, FileSpreadsheet,
  BarChart3, FileBarChart, BookOpen, Save, Heart, History, Mail,
  Share, Copy, Sun, Moon, Target, Bell, ChevronDown, Image, Send,
  ExternalLink, HeartOff, Trash, X, 
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { RevenueChart } from "@/components/financeiro/RevenueChart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { format, startOfMonth, endOfMonth, subMonths, sub, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";
import { ReportBuilder } from "@/components/relatorios/ReportBuilder";
import { v4 as uuidv4 } from 'uuid';

// Dados mockados para demonstração
const salesData = [
  { date: "01/03", revenue: 3200, expenses: 1800, services: 28, clients: 22 },
  { date: "02/03", revenue: 2800, expenses: 1600, services: 24, clients: 20 },
  { date: "03/03", revenue: 3600, expenses: 2000, services: 32, clients: 25 },
  { date: "04/03", revenue: 4200, expenses: 2200, services: 38, clients: 30 },
  { date: "05/03", revenue: 3800, expenses: 1900, services: 34, clients: 28 },
  { date: "06/03", revenue: 4500, expenses: 2400, services: 40, clients: 32 },
  { date: "07/03", revenue: 5000, expenses: 2600, services: 45, clients: 36 },
];

const metrics = [
  {
    title: "Faturamento do Mês",
    value: formatCurrency(27100),
    change: 12.5,
    icon: FileText,
    description: "vs. mês anterior"
  },
  {
    title: "Atendimentos",
    value: "241",
    change: 8.2,
    icon: Calendar,
    description: "neste mês"
  },
  {
    title: "Clientes Atendidos",
    value: "193",
    change: 5.3,
    icon: Users,
    description: "clientes únicos"
  },
  {
    title: "Novos Clientes",
    value: "28",
    change: -2.1,
    icon: UserCheck,
    description: "este mês"
  },
];

// Dados para relatório de atendimentos
const appointmentsData = {
  occupationRate: [
    { professional: "Ana Silva", rate: 85 },
    { professional: "João Santos", rate: 75 },
    { professional: "Maria Oliveira", rate: 90 },
  ],
  servicesDuration: [
    { service: "Corte Feminino", avgDuration: 45 },
    { service: "Coloração", avgDuration: 120 },
    { service: "Manicure", avgDuration: 60 },
  ],
  hourlyDistribution: Array.from({ length: 12 }, (_, i) => ({
    hour: `${i + 8}:00`,
    appointments: Math.floor(Math.random() * 8) + 1,
  })),
};

// Dados para relatório de clientes
const clientsData = {
  visitFrequency: [
    { frequency: "Semanal", clients: 45 },
    { frequency: "Quinzenal", clients: 78 },
    { frequency: "Mensal", clients: 125 },
    { frequency: "Ocasional", clients: 89 },
  ],
  topServices: [
    { name: "Corte Feminino", count: 156 },
    { name: "Coloração", count: 98 },
    { name: "Manicure", count: 87 },
    { name: "Corte Masculino", count: 76 },
  ],
  retention: Array.from({ length: 6 }, (_, i) => ({
    month: format(subDays(new Date(), i * 30), "MMM", { locale: ptBR }),
    rate: 70 + Math.floor(Math.random() * 20),
  })),
};

// Dados para relatório de profissionais
const professionalsData = {
  performance: [
    { name: "Ana Silva", revenue: 8500, clients: 85, rating: 4.8 },
    { name: "João Santos", revenue: 7200, clients: 72, rating: 4.6 },
    { name: "Maria Oliveira", revenue: 9100, clients: 91, rating: 4.9 },
  ],
  serviceDistribution: [
    { professional: "Ana Silva", services: [
      { name: "Corte", count: 45 },
      { name: "Coloração", count: 28 },
      { name: "Hidratação", count: 15 },
    ]},
    { professional: "João Santos", services: [
      { name: "Corte", count: 52 },
      { name: "Barba", count: 38 },
      { name: "Hidratação", count: 12 },
    ]},
  ],
};

// Dados para relatório de estoque
const stockData = {
  topProducts: [
    { name: "Shampoo Pro", sold: 45, revenue: 2250 },
    { name: "Condicionador Pro", sold: 38, revenue: 1900 },
    { name: "Máscara Capilar", sold: 32, revenue: 1600 },
  ],
  lowStock: [
    { name: "Shampoo Pro", current: 5, minimum: 10 },
    { name: "Tintura #7", current: 3, minimum: 8 },
    { name: "Óleo Capilar", current: 4, minimum: 12 },
  ],
  stockTurnover: Array.from({ length: 6 }, (_, i) => ({
    month: format(subDays(new Date(), i * 30), "MMM", { locale: ptBR }),
    turnover: 2 + Math.random(),
  })),
};

const CHART_COLORS = ["#dc8c95", "#8b5cf6", "#22c55e", "#eab308"];

// Interfaces para as novas funcionalidades
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  options: any;
  createdAt: Date;
  isDefault?: boolean;
}

interface ReportHistory {
  id: string;
  name: string;
  type: string;
  generatedAt: Date;
  options: any;
  data?: any;
}

interface BasePeriod {
  start: string;
  end: string;
  label: string;
}

interface ComparisonOptions {
  basePeriod: BasePeriod;
  comparisonPeriod: BasePeriod;
  sections: {
    financeiro: boolean;
    atendimentos: boolean;
    clientes: boolean;
    produtos: boolean;
  };
  displayType: string;
}

interface GoalSettings {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  generatedAt: Date;
}

interface SelectedReportsType {
  financeiro: boolean;
  atendimentos: boolean;
  clientes: boolean;
  profissionais: boolean;
  estoque: boolean;
}

interface RecommendationType {
  title: string;
  description: string;
}

// Componente reutilizável para recomendações
const MarketingRecommendation = ({ title, description }: RecommendationType) => (
  <div className="border-l-4 border-primary p-3 bg-primary/5 rounded-sm">
    <h3 className="font-medium">{title}</h3>
    <p className="text-sm mt-1">{description}</p>
  </div>
);

export default function Relatorios() {
  const [period, setPeriod] = useState<'month' | 'week' | 'year'>("month");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [viewMode, setViewMode] = useState<"dashboard" | "builder">("dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [customReportData, setCustomReportData] = useState<any>(null);
  const [customReportOptions, setCustomReportOptions] = useState<any>(null);
  
  // Estados para novas funcionalidades
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<ReportHistory[]>([]);
  
  // Estados para modais
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [goals, setGoals] = useState<GoalSettings[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [scheduledReports, setScheduledReports] = useState<any[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleOptions, setScheduleOptions] = useState({
    frequency: "weekly",
    day: "1",
    time: "08:00",
    recipients: "",
    format: "pdf"
  });
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [comparisonOptions, setComparisonOptions] = useState<ComparisonOptions>({
    basePeriod: {
      start: format(sub(new Date(), { days: 30 }), "yyyy-MM-dd"),
      end: format(new Date(), "yyyy-MM-dd"),
      label: "Período Atual"
    },
    comparisonPeriod: {
      start: format(sub(new Date(), { days: 60 }), "yyyy-MM-dd"),
      end: format(sub(new Date(), { days: 31 }), "yyyy-MM-dd"),
      label: "Mês Anterior"
    },
    sections: {
      financeiro: true,
      atendimentos: true,
      clientes: true,
      produtos: true
    },
    displayType: "side-by-side"
  });
  const [cachedReports, setCachedReports] = useState<Record<string, {data: any, timestamp: number}>>({});
  
  // Estados para controle de filtros e seleções
  const [selectedFilters, setSelectedFilters] = useState<{
    profissionais: string[];
    servicos: string[];
    categorias: string[];
    dataInicio?: string;
    dataFim?: string;
  }>({
    profissionais: [],
    servicos: [],
    categorias: []
  });
  const [selectedReports, setSelectedReports] = useState<SelectedReportsType>({
    financeiro: true,
    atendimentos: true,
    clientes: true,
    profissionais: true,
    estoque: true
  });
  
  // Estado para controlar a visualização (relatórios predefinidos ou personalizados)
  
  // Estado para armazenar os dados do relatório personalizado gerado
  
  // Dados para recomendações de marketing que podem ser reutilizados
  const marketingRecommendations = [
    {
      title: "Promoção para Serviços em Queda",
      description: "Crie uma campanha específica para os serviços em queda de procura, oferecendo desconto de 15% ou serviço adicional gratuito."
    },
    {
      title: "Fidelização de Clientes Novos",
      description: "53% dos clientes novos não retornaram. Crie um programa de fidelidade com descontos progressivos ou cartão de pontos para incentivar o retorno."
    },
    {
      title: "Destaque para Tendências",
      description: "Aproveite o crescimento em coloração fantasia e tratamentos veganos para criar conteúdo em redes sociais e atrair novos clientes."
    },
    {
      title: "Horários Ociosos",
      description: "Terças e quintas entre 10h e 14h apresentam baixa ocupação. Crie promoções específicas para estes horários para aumentar o fluxo."
    }
  ];
  
  // Dados para análise de periodicidade
  const periodicityAnalysis = [
    {
      title: "Dias de Maior Movimento",
      description: "Sextas e sábados concentram 64% dos atendimentos. Considere escalar mais profissionais nesses dias."
    },
    {
      title: "Sazonalidade Mensal",
      description: "Dezembro e janeiro apresentam picos de 32% acima da média. Prepare estoque e equipe com antecedência."
    },
    {
      title: "Horários de Pico",
      description: "Entre 17h e 20h ocorrem 45% dos atendimentos nos dias de semana. Otimize a escala de profissionais."
    }
  ];
  
  // Função para renderizar conteúdo personalizado com base no tipo de relatório
  const renderCustomReportContent = (data: any, options: any) => {
    if (!data) return null;
    
    switch(options.type) {
      case "financeiro":
        if (options.subtype === "receitas") {
          return (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#22c55e" name="Receitas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        } else if (options.subtype === "despesas") {
          return (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="expenses" fill="#ef4444" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        } else {
          return (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#22c55e" name="Receitas" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        }
        break;
        
      case "atendimentos":
        if (options.subtype === "cancelados" && data.cancelados) {
          return (
            <div>
              <h3 className="text-lg font-medium mb-4">Atendimentos Cancelados</h3>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-100">
                    <tr>
                      <th className="px-4 py-2">Data</th>
                      <th className="px-4 py-2">Profissional</th>
                      <th className="px-4 py-2">Cliente</th>
                      <th className="px-4 py-2">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.cancelados.map((item: any, index: number) => (
                      <tr key={index} className="bg-white border-b">
                        <td className="px-4 py-2">{item.data}</td>
                        <td className="px-4 py-2">{item.profissional}</td>
                        <td className="px-4 py-2">{item.cliente}</td>
                        <td className="px-4 py-2">{item.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        } else {
          return (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Ocupação</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.occupationRate}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="professional" />
                      <YAxis unit="%" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="rate" fill="#dc8c95" name="Taxa de Ocupação" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Duração Média dos Serviços</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.servicesDuration}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="service" />
                      <YAxis unit="min" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="avgDuration" fill="#8b5cf6" name="Duração Média" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          );
        }
        
      case "profissionais":
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Performance dos Profissionais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {data.performance.map((prof: any) => (
                    <div key={prof.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{prof.name}</h3>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            {formatCurrency(prof.revenue)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-blue-500" />
                            {prof.clients} clientes
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            {prof.rating}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${(prof.clients / 100) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
        break;
        
      case "estoque":
        if (options.subtype === "estoqueBaixo") {
          return (
            <Card>
              <CardHeader>
                <CardTitle>Alertas de Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.lowStock.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span>{item.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.current}/{item.minimum} unidades
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        } else {
          return (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Mais Vendidos</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topProducts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="sold" fill="#dc8c95" name="Unidades Vendidas" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          );
        }
        break;
        
      default:
        return <p>Selecione as opções desejadas para gerar um relatório personalizado.</p>;
    }
  };

  // Função para gerar relatório personalizado com base nas opções selecionadas
  const handleGenerateReport = (options: any) => {
    console.log("Gerando relatório com as opções:", options);
    setCustomReportOptions(options);
    
    // Simulando geração de dados baseados nas seleções do usuário
    let reportData;
    
    switch(options.type) {
      case "financeiro":
        if (options.subtype === "receitas") {
          reportData = salesData.map(item => ({
            date: item.date,
            revenue: item.revenue,
          }));
        } else if (options.subtype === "despesas") {
          reportData = salesData.map(item => ({
            date: item.date,
            expenses: item.expenses,
          }));
        } else {
          reportData = salesData;
        }
        break;
        
      case "atendimentos":
        if (options.subtype === "cancelados") {
          reportData = {
            ...appointmentsData,
            cancelados: [
              { data: "01/03", profissional: "Ana Silva", cliente: "Carlos Oliveira", motivo: "Cliente desmarcou" },
              { data: "03/03", profissional: "João Santos", cliente: "Maria Santos", motivo: "Profissional ausente" },
              { data: "05/03", profissional: "Maria Oliveira", cliente: "Pedro Souza", motivo: "Cliente não compareceu" },
            ]
          };
        } else {
          reportData = appointmentsData;
        }
        break;
        
      case "clientes":
        reportData = clientsData;
        break;
        
      case "profissionais":
        if (options.filters.profissionais.length > 0) {
          // Filtrando para mostrar apenas profissionais selecionados
          reportData = {
            performance: professionalsData.performance.filter(prof => 
              options.filters.profissionais.includes(prof.name === "Ana Silva" ? "1" : 
                                                  prof.name === "João Santos" ? "2" : "3")),
            serviceDistribution: professionalsData.serviceDistribution.filter(prof => 
              options.filters.profissionais.includes(prof.professional === "Ana Silva" ? "1" : "2"))
          };
        } else {
          reportData = professionalsData;
        }
        break;
        
      case "estoque":
        if (options.subtype === "estoqueBaixo") {
          reportData = { lowStock: stockData.lowStock };
        } else {
          reportData = stockData;
        }
        break;
        
      default:
        reportData = {};
    }
    
    setCustomReportData(reportData);
  };

  // --- Funções para novas funcionalidades ---
  // 1. Funções para Templates e Favoritos
  const saveAsTemplate = () => {
    const newTemplate: ReportTemplate = {
      id: `template-${Date.now()}`,
      name: templateName || `Template ${templates.length + 1}`,
      description: templateDescription || `Criado em ${format(new Date(), "dd/MM/yyyy")}`,
      options: viewMode === "dashboard" 
        ? { type: "dashboard", period, filters: selectedFilters } 
        : { ...customReportOptions },
      createdAt: new Date()
    };
    
    setTemplates([...templates, newTemplate]);
    setShowTemplateModal(false);
    setTemplateName("");
    setTemplateDescription("");
    
    toast({
      title: "Template salvo com sucesso",
      description: "Você pode acessá-lo a qualquer momento na lista de templates",
    });
  };

  const loadTemplate = (template: ReportTemplate) => {
    if (template.options.type === "dashboard") {
      setViewMode("dashboard");
      setPeriod(template.options.period);
      setSelectedFilters(template.options.filters);
    } else {
      setViewMode("builder");
      setCustomReportOptions(template.options);
      generateCustomReport(template.options);
    }
    
    toast({
      title: "Template carregado",
      description: `O template "${template.name}" foi carregado com sucesso`,
    });
  };

  const toggleFavorite = (templateId: string) => {
    if (favorites.includes(templateId)) {
      setFavorites(favorites.filter(id => id !== templateId));
    } else {
      setFavorites([...favorites, templateId]);
    }
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(template => template.id !== templateId));
    setFavorites(favorites.filter(id => id !== templateId));
    
    toast({
      title: "Template excluído",
      description: "O template foi removido com sucesso",
    });
  };

  // 2. Funções para histórico de relatórios
  const addToHistory = (reportData: any, reportOptions: any) => {
    const historyItem: ReportHistory = {
      id: `history-${Date.now()}`,
      name: `Relatório ${reportOptions.type} - ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
      type: reportOptions.type,
      generatedAt: new Date(),
      options: reportOptions,
      data: reportData
    };
    
    // Mantém apenas os últimos 20 relatórios no histórico
    const updatedHistory = [historyItem, ...history].slice(0, 20);
    setHistory(updatedHistory);
  };

  const loadFromHistory = (historyItem: ReportHistory) => {
    if (historyItem.options.type === "dashboard") {
      setViewMode("dashboard");
      setPeriod(historyItem.options.period);
      setSelectedFilters(historyItem.options.filters);
    } else {
      setViewMode("builder");
      setCustomReportOptions(historyItem.options);
      setCustomReportData(historyItem.data);
    }
  };

  // 3. Funções para tema
  // Removido o estado chartTheme e definido cores padrão diretamente no código

  // 4. Funções para comparações e metas
  const enableComparison = () => {
    const today = new Date();
    // Definir valores padrão para as datas se não existirem
    const defaultStartDate = format(sub(today, { days: 30 }), "yyyy-MM-dd");
    const defaultEndDate = format(today, "yyyy-MM-dd");
    
    const startDate = selectedFilters.dataInicio ? new Date(selectedFilters.dataInicio) : sub(today, { months: 1 });
    const endDate = selectedFilters.dataFim ? new Date(selectedFilters.dataFim) : today;
    
    const previousPeriod = {
      start: format(sub(startDate, { months: 1 }), "yyyy-MM-dd"),
      end: format(sub(endDate, { months: 1 }), "yyyy-MM-dd"),
      label: "Mês Anterior"
    };
    
    setShowComparisonModal(true);
    
    setComparisonOptions({
      ...comparisonOptions,
      basePeriod: {
        start: selectedFilters.dataInicio || defaultStartDate,
        end: selectedFilters.dataFim || defaultEndDate,
        label: "Período Atual"
      },
      comparisonPeriod: previousPeriod
    });
  };

  const disableComparison = () => {
    setCompareMode(false);
    setComparisonOptions({
      ...comparisonOptions,
      basePeriod: {
        start: format(sub(new Date(), { days: 30 }), "yyyy-MM-dd"),
        end: format(new Date(), "yyyy-MM-dd"),
        label: "Período Atual"
      }
    });
  };

  const saveGoal = (goal: any) => {
    // Criar nova meta ou atualizar existente
    if (goal.id) {
      // Atualizar meta existente
      const updatedGoals = goals.map(g => 
        g.id === goal.id ? {
          ...g,
          ...goal,
          period: goal.period as "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
        } : g
      );
      setGoals(updatedGoals);
    } else {
      // Criar nova meta com tipagem corrigida
      const newGoal: GoalSettings = {
        id: Date.now().toString(),
        name: goal.name,
        target: goal.target,
        current: goal.current || 0,
        unit: goal.unit,
        period: goal.period as "daily" | "weekly" | "monthly" | "quarterly" | "yearly",
        generatedAt: new Date()
      };
      setGoals([...goals, newGoal]);
    }
    
    // Fechar modal
    setShowGoalsModal(false);
  };

  const removeGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
  };

  // 5. Funções para exportação e agendamento
  const exportReport = (format: string) => {
    setIsLoading(true);
    
    // Simulação de exportação
    setTimeout(() => {
      const message = `Relatório exportado em formato ${format.toUpperCase()}`;
      toast({
        title: "Exportação concluída",
        description: message
      });
      
      setIsLoading(false);
      setShowExportModal(false);
    }, 1500);
  };

  const scheduleReport = () => {
    // Simular agendamento de relatório
    const newSchedule = {
      id: Date.now().toString(),
      ...scheduleOptions,
      createdAt: new Date()
    };
    
    setScheduledReports([...scheduledReports, newSchedule]);
    setShowScheduleModal(false);
    
    toast({
      title: "Relatório agendado",
      description: `O relatório será gerado ${scheduleOptions.frequency === 'weekly' ? 'semanalmente' : 
                    scheduleOptions.frequency === 'monthly' ? 'mensalmente' : 
                    scheduleOptions.frequency === 'daily' ? 'diariamente' : 'uma vez'} às ${scheduleOptions.time}`
    });
  };

  const deleteSchedule = (scheduleId: string) => {
    setScheduledReports(scheduledReports.filter(s => s.id !== scheduleId));
    
    toast({
      title: "Agendamento removido",
      description: "O relatório não será mais enviado automaticamente",
    });
  };

  const shareReport = (method: "email" | "whatsapp" | "copy") => {
    // Criar uma URL de relatório simulada para demonstração
    const reportId = uuidv4().substring(0, 8);
    const reportUrl = `https://pulse-salon.app/relatorio/${reportId}`;
    
    switch (method) {
      case "email":
        // Simula o envio por email
        navigator.clipboard.writeText(reportUrl);
        toast({
          title: "E-mail preparado",
          description: "Link copiado para a área de transferência. Abrindo o cliente de email...",
        });
        
        // Em uma implementação real, use mailto: ou uma API de email
        setTimeout(() => {
          window.open(`mailto:?subject=Relatório Pulse Salon&body=Acesse o relatório em: ${reportUrl}`, '_blank');
        }, 500);
        break;
        
      case "whatsapp":
        // Simula o compartilhamento por WhatsApp
        const whatsappText = encodeURIComponent(`Relatório Pulse Salon: ${reportUrl}`);
        toast({
          title: "Abrindo WhatsApp",
          description: "Compartilhe o relatório via WhatsApp",
        });
        
        // Abre o WhatsApp com a mensagem pré-preenchida
        window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
        break;
        
      case "copy":
        // Copia o link para a área de transferência
        navigator.clipboard.writeText(reportUrl);
        toast({
          title: "Link copiado",
          description: "O link para o relatório foi copiado para a área de transferência",
        });
        break;
    }
    
    // Fecha o modal após o compartilhamento
    setShowExportModal(false);
  };

  // 6. Funções para cache e melhoria de performance
  const getCachedReport = (options: any) => {
    const key = JSON.stringify(options);
    
    if (cachedReports && cachedReports[key] && 
        (Date.now() - cachedReports[key].timestamp) < 5 * 60 * 1000) {
      return cachedReports[key].data;
    }
    
    return null;
  };

  const setCachedReport = (options: any, data: any) => {
    const key = JSON.stringify(options);
    setCachedReports({
      ...cachedReports,
      [key]: {
        data,
        timestamp: Date.now()
      }
    });
  };

  const generateCustomReport = (options: any) => {
    setIsLoading(true);
    
    // Verificar se existe em cache
    const cachedData = getCachedReport(options);
    if (cachedData) {
      setCustomReportData(cachedData);
      setCustomReportOptions(options);
      setIsLoading(false);
      return;
    }
    
    // Simulação de geração de relatório
    setTimeout(() => {
      let reportData;
      
      switch (options.type) {
        case "financeiro":
          reportData = salesData;
          break;
        case "atendimentos":
          reportData = appointmentsData;
          break;
        case "clientes":
          reportData = clientsData;
          break;
        case "profissionais":
          reportData = professionalsData;
          break;
        case "estoque":
          reportData = stockData;
          break;
        default:
          reportData = salesData;
      }
      
      setCustomReportData(reportData);
      setCustomReportOptions(options);
      
      // Salvar no cache
      setCachedReport(options, reportData);
      
      // Adicionar ao histórico
      addToHistory(reportData, options);
      
      setIsLoading(false);
    }, 1500);
  };
  
  // 7. Função para pré-visualização de relatório
  const previewReport = () => {
    setPreviewMode(true);
    
    setTimeout(() => {
      const previewData = viewMode === "dashboard" 
        ? { salesData, appointmentsData, clientsData } 
        : customReportData;
      
      setPreviewData(previewData);
    }, 800);
  };
  
  const closePreview = () => {
    setPreviewMode(false);
    setPreviewData(null);
  };

  // Função para gerar prévia de relatórios (substituindo generatePreview)
  const generatePreview = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const previewData = viewMode === "dashboard" 
        ? { salesData, appointmentsData, clientsData } 
        : customReportData;
      
      setPreviewData(previewData);
      setPreviewMode(true);
      setIsLoading(false);
    }, 800);
  };

  // Função para comparação de relatórios
  const compareReports = () => {
    // Ativa o modo de comparação
    setCompareMode(true);
    
    // Adiciona ao histórico
    const newHistoryItem: ReportHistory = {
      id: uuidv4(),
      generatedAt: new Date(),
      name: `Comparação: ${format(new Date(comparisonOptions.basePeriod.start), "dd/MM")} - ${format(new Date(comparisonOptions.comparisonPeriod.end), "dd/MM")}`,
      type: "comparison",
      options: {
        ...selectedFilters,
        compareMode: true,
        comparisonOptions
      },
      data: customReportData
    };
    
    setHistory(prev => [newHistoryItem, ...prev]);
    
    // Salvar no localStorage
    localStorage.setItem('reportHistory', JSON.stringify([newHistoryItem, ...history]));
    
    console.log("Comparação ativada:", comparisonOptions);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Analise dados detalhados sobre o desempenho do seu salão
          </p>
        </div>
        
        {/* Barra de ações superior com novas funcionalidades */}
        <div className="flex flex-wrap gap-2">
          {/* Botão Pré-visualizar */}
          <Button variant="outline" size="sm" onClick={previewReport} disabled={isLoading}>
            <Eye className="mr-2 h-4 w-4" />
            Pré-visualizar
          </Button>
          
          {/* Botão Meus Templates */}
          <Button variant="outline" size="sm" onClick={() => setShowTemplateModal(true)}>
            <Copy className="mr-2 h-4 w-4" />
            Meus Templates
            <span className="ml-1 rounded-full bg-primary px-1.5 text-[10px] text-white">
              {templates.length}
            </span>
          </Button>
          
          {/* Botão Histórico */}
          <Button variant="outline" size="sm" onClick={() => setShowHistoryModal(true)}>
            <History className="mr-2 h-4 w-4" />
            Histórico
          </Button>
          
          {/* Botão Comparar */}
          <Button 
            variant={compareMode ? "default" : "outline"} 
            size="sm" 
            onClick={compareMode ? disableComparison : enableComparison}
          >
            <Activity className="mr-2 h-4 w-4" />
            {compareMode ? "Desativar Comparação" : "Comparar Períodos"}
          </Button>
          
          {/* Botão Metas */}
          <Button variant="outline" size="sm" onClick={() => setShowGoalsModal(true)}>
            <Target className="mr-2 h-4 w-4" />
            Metas
          </Button>
          
          {/* Botão Exportar (já existente, atualizado) */}
          <Button onClick={() => setShowExportModal(true)}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Barra de acessos rápidos para templates e favoritos */}
      {templates.length > 0 && (
        <div className="overflow-x-auto pb-2">
          <div className="flex space-x-2">
            <p className="text-sm font-medium text-gray-500 flex items-center mr-2">
              Templates:
            </p>
            {templates.map(template => (
              <Button 
                key={template.id} 
                variant="outline" 
                size="sm" 
                className="flex items-center whitespace-nowrap"
                onClick={() => loadTemplate(template)}
              >
                {template.name}
                <Heart 
                  className={`ml-1 h-3 w-3 ${favorites.includes(template.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(template.id);
                  }}
                />
              </Button>
            ))}
          </div>
        </div>
      )}

      {viewMode === "dashboard" && (
        <>
          {/* Seção de Análise Detalhada */}
          <div className="grid gap-4 md:grid-cols-2 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Desempenho Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: "Jan", revenue: 42000, expenses: 25000 },
                      { name: "Fev", revenue: 38000, expenses: 23000 },
                      { name: "Mar", revenue: 45000, expenses: 26000 },
                      { name: "Abr", revenue: 52000, expenses: 29000 },
                      { name: "Mai", revenue: 48000, expenses: 27000 },
                      { name: "Jun", revenue: 58430, expenses: 31330 }
                    ]}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#22c55e" name="Receitas" />
                      <Bar dataKey="expenses" fill="#ef4444" name="Despesas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Receita Total:</span>
                    <span className="text-sm font-bold">{formatCurrency(58430)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Despesas Totais:</span>
                    <span className="text-sm font-bold">{formatCurrency(31330)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Lucro Líquido:</span>
                    <span className="text-sm font-bold text-green-600">{formatCurrency(27100)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Margem de Lucro:</span>
                    <span className="text-sm font-bold text-green-600">46.4%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Análise de Atendimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Serviços', value: 157, fill: '#22c55e' },
                          { name: 'Produtos', value: 84, fill: '#0ea5e9' },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Ticket Médio:</span>
                    <span className="text-sm font-bold">{formatCurrency(245)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Duração Média:</span>
                    <span className="text-sm font-bold">52 minutos</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Taxa de Retorno:</span>
                    <span className="text-sm font-bold text-green-600">78%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Agendamentos Online:</span>
                    <span className="text-sm font-bold">143 (59%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mais detalhes */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Serviços Mais Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Corte de Cabelo Feminino", count: 47, percentage: 29.9 },
                    { name: "Coloração", count: 38, percentage: 24.2 },
                    { name: "Manicure", count: 31, percentage: 19.7 },
                    { name: "Hidratação", count: 22, percentage: 14.0 },
                    { name: "Corte de Cabelo Masculino", count: 19, percentage: 12.1 }
                  ].map((service, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-full">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{service.name}</span>
                          <span className="text-sm text-muted-foreground">{service.count}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${service.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profissionais Destaque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Ana Silva", role: "Cabeleireira", atendimentos: 63, avaliacao: 4.9 },
                    { name: "Carlos Santos", role: "Barbeiro", atendimentos: 58, avaliacao: 4.8 },
                    { name: "Juliana Oliveira", role: "Manicure", atendimentos: 51, avaliacao: 4.7 },
                    { name: "Pedro Almeida", role: "Esteticista", atendimentos: 42, avaliacao: 4.9 },
                    { name: "Mariana Costa", role: "Cabeleireira", atendimentos: 27, avaliacao: 4.6 }
                  ].map((prof, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{prof.name}</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                            <span className="text-xs">{prof.avaliacao}</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{prof.role}</span>
                          <span>{prof.atendimentos} atendimentos</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Segmentação de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Novos', value: 42, fill: '#0ea5e9' },
                          { name: 'Recorrentes', value: 93, fill: '#22c55e' },
                          { name: 'Inativos Retornados', value: 28, fill: '#f59e0b' },
                          { name: 'VIP', value: 30, fill: '#8b5cf6' },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Taxa de Retenção:</span>
                    <span className="text-sm font-bold text-green-600">78%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Valor Médio por Cliente:</span>
                    <span className="text-sm font-bold">{formatCurrency(303)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Clientes Premium:</span>
                    <span className="text-sm font-bold">30 (15.5%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Análise de Tendências */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Análise de Tendências</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <h3 className="font-semibold">Em Alta</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span>Coloração Fantasia</span>
                        <span className="text-green-600">+32%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Tratamentos Veganos</span>
                        <span className="text-green-600">+28%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Massagem Relaxante</span>
                        <span className="text-green-600">+21%</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <h3 className="font-semibold">Estáveis</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span>Corte Feminino</span>
                        <span className="text-blue-600">+3%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Manicure</span>
                        <span className="text-blue-600">+1%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Depilação</span>
                        <span className="text-blue-600">-2%</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                      <h3 className="font-semibold">Em Queda</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span>Escova Progressiva</span>
                        <span className="text-red-600">-15%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Luzes</span>
                        <span className="text-red-600">-12%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Sombrancelha com Henna</span>
                        <span className="text-red-600">-8%</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    Insights e Recomendações
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="min-w-4 mt-0.5">•</div>
                      <p>Os tratamentos veganos e sustentáveis mostram forte crescimento - considere expandir a linha de produtos naturais.</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="min-w-4 mt-0.5">•</div>
                      <p>Há um aumento significativo nos atendimentos aos sábados - avalie a possibilidade de ampliar a equipe neste dia.</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="min-w-4 mt-0.5">•</div>
                      <p>Clientes novos têm preferido o agendamento online - considere investir mais na presença digital.</p>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saúde Financeira e Recomendações */}
          <div className="grid gap-4 md:grid-cols-2 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Saúde Financeira</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Lucratividade</span>
                      <span className="text-sm font-medium">46.4% (Bom)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "46.4%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Taxa de Ocupação</span>
                      <span className="text-sm font-medium">85% (Excelente)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Fluxo de Caixa</span>
                      <span className="text-sm font-medium">72% (Bom)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "72%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Controle de Despesas</span>
                      <span className="text-sm font-medium">63% (Regular)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: "63%" }}></div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg mt-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      Parecer Financeiro
                    </h3>
                    <p className="text-sm">
                      Seu salão apresenta boa saúde financeira com margem de lucro saudável. 
                      Há oportunidade de melhoria no controle de despesas, principalmente 
                      em produtos e insumos (representam 32% dos gastos).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recomendações de Marketing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketingRecommendations.map((recommendation, index) => (
                    <MarketingRecommendation key={index} title={recommendation.title} description={recommendation.description} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Segunda ocorrência substituída por uma seção diferente */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Análise de Periodicidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {periodicityAnalysis.map((analysis, index) => (
                    <div key={index} className="border-l-4 border-blue-500 p-3 bg-blue-50 rounded-sm">
                      <h3 className="font-medium">{analysis.title}</h3>
                      <p className="text-sm mt-1">{analysis.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {viewMode === "dashboard" && (
        <>
          {/* Mais detalhes */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Serviços Mais Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Corte de Cabelo Feminino", count: 47, percentage: 29.9 },
                    { name: "Coloração", count: 38, percentage: 24.2 },
                    { name: "Manicure", count: 31, percentage: 19.7 },
                    { name: "Hidratação", count: 22, percentage: 14.0 },
                    { name: "Corte de Cabelo Masculino", count: 19, percentage: 12.1 }
                  ].map((service, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-full">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{service.name}</span>
                          <span className="text-sm text-muted-foreground">{service.count}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${service.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profissionais Destaque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Ana Silva", role: "Cabeleireira", atendimentos: 63, avaliacao: 4.9 },
                    { name: "Carlos Santos", role: "Barbeiro", atendimentos: 58, avaliacao: 4.8 },
                    { name: "Juliana Oliveira", role: "Manicure", atendimentos: 51, avaliacao: 4.7 },
                    { name: "Pedro Almeida", role: "Esteticista", atendimentos: 42, avaliacao: 4.9 },
                    { name: "Mariana Costa", role: "Cabeleireira", atendimentos: 27, avaliacao: 4.6 }
                  ].map((prof, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{prof.name}</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                            <span className="text-xs">{prof.avaliacao}</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{prof.role}</span>
                          <span>{prof.atendimentos} atendimentos</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Segmentação de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Novos', value: 42, fill: '#0ea5e9' },
                          { name: 'Recorrentes', value: 93, fill: '#22c55e' },
                          { name: 'Inativos Retornados', value: 28, fill: '#f59e0b' },
                          { name: 'VIP', value: 30, fill: '#8b5cf6' },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Taxa de Retenção:</span>
                    <span className="text-sm font-bold text-green-600">78%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Valor Médio por Cliente:</span>
                    <span className="text-sm font-bold">{formatCurrency(303)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Clientes Premium:</span>
                    <span className="text-sm font-bold">30 (15.5%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Análise de Tendências */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Análise de Tendências</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <h3 className="font-semibold">Em Alta</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span>Coloração Fantasia</span>
                        <span className="text-green-600">+32%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Tratamentos Veganos</span>
                        <span className="text-green-600">+28%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Massagem Relaxante</span>
                        <span className="text-green-600">+21%</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <h3 className="font-semibold">Estáveis</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span>Corte Feminino</span>
                        <span className="text-blue-600">+3%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Manicure</span>
                        <span className="text-blue-600">+1%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Depilação</span>
                        <span className="text-blue-600">-2%</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                      <h3 className="font-semibold">Em Queda</h3>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span>Escova Progressiva</span>
                        <span className="text-red-600">-15%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Luzes</span>
                        <span className="text-red-600">-12%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Sombrancelha com Henna</span>
                        <span className="text-red-600">-8%</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    Insights e Recomendações
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="min-w-4 mt-0.5">•</div>
                      <p>Os tratamentos veganos e sustentáveis mostram forte crescimento - considere expandir a linha de produtos naturais.</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="min-w-4 mt-0.5">•</div>
                      <p>Há um aumento significativo nos atendimentos aos sábados - avalie a possibilidade de ampliar a equipe neste dia.</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="min-w-4 mt-0.5">•</div>
                      <p>Clientes novos têm preferido o agendamento online - considere investir mais na presença digital.</p>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saúde Financeira e Recomendações */}
          <div className="grid gap-4 md:grid-cols-2 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Saúde Financeira</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Lucratividade</span>
                      <span className="text-sm font-medium">46.4% (Bom)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "46.4%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Taxa de Ocupação</span>
                      <span className="text-sm font-medium">85% (Excelente)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Fluxo de Caixa</span>
                      <span className="text-sm font-medium">72% (Bom)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "72%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Controle de Despesas</span>
                      <span className="text-sm font-medium">63% (Regular)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: "63%" }}></div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg mt-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      Parecer Financeiro
                    </h3>
                    <p className="text-sm">
                      Seu salão apresenta boa saúde financeira com margem de lucro saudável. 
                      Há oportunidade de melhoria no controle de despesas, principalmente 
                      em produtos e insumos (representam 32% dos gastos).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recomendações de Marketing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketingRecommendations.map((recommendation, index) => (
                    <MarketingRecommendation key={index} title={recommendation.title} description={recommendation.description} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Segunda ocorrência substituída por uma seção diferente */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Análise de Periodicidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {periodicityAnalysis.map((analysis, index) => (
                    <div key={index} className="border-l-4 border-blue-500 p-3 bg-blue-50 rounded-sm">
                      <h3 className="font-medium">{analysis.title}</h3>
                      <p className="text-sm mt-1">{analysis.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Download className="h-5 w-5" />
              Exportação Avançada de Relatórios
            </DialogTitle>
            <DialogDescription>
              Personalize completamente seus relatórios selecionando as áreas, filtros e opções de visualização desejadas.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="geral" className="mt-6">
            <TabsList className="grid grid-cols-7 mb-4">
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
              <TabsTrigger value="atendimentos">Atendimentos</TabsTrigger>
              <TabsTrigger value="clientes">Clientes</TabsTrigger>
              <TabsTrigger value="profissionais">Profissionais</TabsTrigger>
              <TabsTrigger value="estoque">Estoque</TabsTrigger>
              <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
            </TabsList>
            
            {/* Aba Geral */}
            <TabsContent value="geral" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Formato e Período */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Configurações Gerais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Formato de Exportação */}
                    <div className="space-y-2">
                      <Label className="font-medium">Formato de Exportação</Label>
                      <RadioGroup 
                        value={exportFormat} 
                        onValueChange={setExportFormat}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pdf" id="pdf" />
                          <Label htmlFor="pdf" className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-primary" />
                            PDF
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="excel" id="excel" />
                          <Label htmlFor="excel" className="flex items-center gap-1">
                            <FileDown className="h-4 w-4 text-green-600" />
                            Excel
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="csv" id="csv" />
                          <Label htmlFor="csv" className="flex items-center gap-1">
                            <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                            CSV
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {/* Período Global */}
                    <div className="space-y-2">
                      <Label className="font-medium">Período</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date-start">Data Inicial</Label>
                          <Input 
                            id="date-start" 
                            type="date" 
                            value={selectedFilters.dataInicio || format(sub(new Date(), { months: 1 }), "yyyy-MM-dd")}
                            onChange={(e) => setSelectedFilters({...selectedFilters, dataInicio: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date-end">Data Final</Label>
                          <Input 
                            id="date-end" 
                            type="date" 
                            value={selectedFilters.dataFim || format(new Date(), "yyyy-MM-dd")}
                            onChange={(e) => setSelectedFilters({...selectedFilters, dataFim: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedFilters({...selectedFilters, dataInicio: format(sub(new Date(), { days: 7 }), "yyyy-MM-dd"), dataFim: format(new Date(), "yyyy-MM-dd")})}>
                          Última Semana
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedFilters({...selectedFilters, dataInicio: format(sub(new Date(), { months: 1 }), "yyyy-MM-dd"), dataFim: format(new Date(), "yyyy-MM-dd")})}>
                          Último Mês
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedFilters({...selectedFilters, dataInicio: format(sub(new Date(), { months: 3 }), "yyyy-MM-dd"), dataFim: format(new Date(), "yyyy-MM-dd")})}>
                          Último Trimestre
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedFilters({...selectedFilters, dataInicio: format(sub(new Date(), { months: 6 }), "yyyy-MM-dd"), dataFim: format(new Date(), "yyyy-MM-dd")})}>
                          Último Semestre
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedFilters({...selectedFilters, dataInicio: format(sub(new Date(), { years: 1 }), "yyyy-MM-dd"), dataFim: format(new Date(), "yyyy-MM-dd")})}>
                          Último Ano
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Seleção de Relatórios */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Áreas do Relatório</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="financeiro" 
                          checked={selectedReports.financeiro}
                          onCheckedChange={(checked) => setSelectedReports({...selectedReports, financeiro: !!checked})}
                        />
                        <Label htmlFor="financeiro" className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-primary" />
                          Financeiro
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="atendimentos" 
                          checked={selectedReports.atendimentos}
                          onCheckedChange={(checked) => setSelectedReports({...selectedReports, atendimentos: !!checked})}
                        />
                        <Label htmlFor="atendimentos" className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-primary" />
                          Atendimentos
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="clientes" 
                          checked={selectedReports.clientes}
                          onCheckedChange={(checked) => setSelectedReports({...selectedReports, clientes: !!checked})}
                        />
                        <Label htmlFor="clientes" className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-primary" />
                          Clientes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="profissionais" 
                          checked={selectedReports.profissionais}
                          onCheckedChange={(checked) => setSelectedReports({...selectedReports, profissionais: !!checked})}
                        />
                        <Label htmlFor="profissionais" className="flex items-center gap-1">
                          <UserCheck className="h-4 w-4 text-primary" />
                          Profissionais
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="estoque" 
                          checked={selectedReports.estoque}
                          onCheckedChange={(checked) => setSelectedReports({...selectedReports, estoque: !!checked})}
                        />
                        <Label htmlFor="estoque" className="flex items-center gap-1">
                          <Package className="h-4 w-4 text-primary" />
                          Estoque
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="agendamentos" 
                          defaultChecked
                        />
                        <Label htmlFor="agendamentos" className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-primary" />
                          Agendamentos
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="comissoes" 
                          defaultChecked
                        />
                        <Label htmlFor="comissoes" className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          Comissões
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="acessos" 
                          defaultChecked
                        />
                        <Label htmlFor="acessos" className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-primary" />
                          Acessos ao Sistema
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Opções de Visualização */}
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Opções de Visualização</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="include-charts" defaultChecked />
                        <Label htmlFor="include-charts">Incluir gráficos</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="include-tables" defaultChecked />
                        <Label htmlFor="include-tables">Incluir tabelas de dados</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="include-summary" defaultChecked />
                        <Label htmlFor="include-summary">Incluir resumo executivo</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="include-metrics" defaultChecked />
                        <Label htmlFor="include-metrics">Incluir métricas principais</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="include-comparisons" defaultChecked />
                        <Label htmlFor="include-comparisons">Incluir comparações temporais</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="include-projections" defaultChecked />
                        <Label htmlFor="include-projections">Incluir projeções futuras</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Aba Financeiro */}
            <TabsContent value="financeiro" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Relatório Financeiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de Relatório Financeiro</Label>
                      <Select defaultValue="completo">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de relatório" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completo">Relatório Completo</SelectItem>
                          <SelectItem value="receitas">Apenas Receitas</SelectItem>
                          <SelectItem value="despesas">Apenas Despesas</SelectItem>
                          <SelectItem value="lucros">Lucros e Margens</SelectItem>
                          <SelectItem value="fluxo">Fluxo de Caixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Categorização</Label>
                      <Select defaultValue="todos">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categorização" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas as Categorias</SelectItem>
                          <SelectItem value="servicos">Serviços</SelectItem>
                          <SelectItem value="produtos">Produtos</SelectItem>
                          <SelectItem value="operacionais">Despesas Operacionais</SelectItem>
                          <SelectItem value="pessoal">Despesas com Pessoal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="fin-balanco" defaultChecked />
                      <Label htmlFor="fin-balanco">Balanço Patrimonial</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="fin-dre" defaultChecked />
                      <Label htmlFor="fin-dre">DRE</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="fin-impostos" defaultChecked />
                      <Label htmlFor="fin-impostos">Impostos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="fin-comparativo" defaultChecked />
                      <Label htmlFor="fin-comparativo">Comparativo com períodos anteriores</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="fin-projecao" defaultChecked />
                      <Label htmlFor="fin-projecao">Projeção Futura</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="fin-inadimplencia" defaultChecked />
                      <Label htmlFor="fin-inadimplencia">Análise de Inadimplência</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Restante das abas com suas configurações */}
            {/* ... */}
          </Tabs>
          
          <DialogFooter className="flex justify-between items-center mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Configurações avançadas disponíveis em cada aba
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowExportModal(false)}>Cancelar</Button>
              <Button 
                onClick={() => {
                  exportReport(exportFormat);
                  setShowExportModal(false);
                }}
                className="bg-primary hover:bg-primary/90"
              >
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório Completo
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Templates */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Meus Templates</DialogTitle>
            <DialogDescription>
              Gerenciar templates de relatórios salvos
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {templates.length > 0 ? (
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Criado em {format(new Date(template.createdAt), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => loadTemplate(template)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleFavorite(template.id)}
                      >
                        {favorites.includes(template.id) ? (
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        ) : (
                          <Heart className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteTemplate(template.id)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Nenhum template salvo ainda</p>
              </div>
            )}
            
            <div className="border-t mt-4 pt-4">
              <h3 className="font-medium mb-3">Salvar Template Atual</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="templateName">Nome do Template</Label>
                  <Input 
                    id="templateName" 
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Ex: Relatório Financeiro Mensal"
                  />
                </div>
                <div>
                  <Label htmlFor="templateDescription">Descrição</Label>
                  <Input 
                    id="templateDescription" 
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Ex: Template para análise financeira mensal"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowTemplateModal(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={saveAsTemplate}>
              Salvar Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Histórico */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Relatórios</DialogTitle>
            <DialogDescription>
              Relatórios gerados anteriormente
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Gerado em {format(new Date(item.generatedAt), "dd/MM/yyyy HH:mm")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tipo: {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => loadFromHistory(item)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setShowHistoryModal(false)}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Nenhum relatório no histórico ainda</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" onClick={() => setShowHistoryModal(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Metas */}
      <Dialog open={showGoalsModal} onOpenChange={setShowGoalsModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Metas e Objetivos</DialogTitle>
            <DialogDescription>
              Defina e acompanhe metas para seu salão
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {goals.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="font-medium text-sm">Metas Atuais</h3>
                {goals.map((goal) => (
                  <div key={goal.id} className="border rounded-md p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{goal.name}</h4>
                      <Button variant="ghost" size="sm" onClick={() => removeGoal(goal.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{goal.current} de {goal.target} {goal.unit}</span>
                        <span>{Math.round((goal.current / goal.target) * 100)}%</span>
                      </div>
                      <Progress value={(goal.current / goal.target) * 100} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Período: {goal.period.charAt(0).toUpperCase() + goal.period.slice(1)}
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Adicionar Nova Meta</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="goalName">Nome da Meta</Label>
                  <Input id="goalName" placeholder="Ex: Faturamento Mensal" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="goalTarget">Valor Alvo</Label>
                    <Input id="goalTarget" type="number" placeholder="Ex: 10000" />
                  </div>
                  <div>
                    <Label htmlFor="goalUnit">Unidade</Label>
                    <Select defaultValue="reais">
                      <SelectTrigger id="goalUnit">
                        <SelectValue placeholder="Unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reais">R$</SelectItem>
                        <SelectItem value="clientes">Clientes</SelectItem>
                        <SelectItem value="atendimentos">Atendimentos</SelectItem>
                        <SelectItem value="porcentagem">%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="goalPeriod">Período</Label>
                  <Select defaultValue="monthly">
                    <SelectTrigger id="goalPeriod">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowGoalsModal(false)}>
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={() => saveGoal({
                name: (document.getElementById('goalName') as HTMLInputElement).value,
                target: parseFloat((document.getElementById('goalTarget') as HTMLInputElement).value),
                unit: (document.getElementById('goalUnit') as HTMLSelectElement).value,
                period: (document.getElementById('goalPeriod') as HTMLSelectElement).value,
              })}
            >
              Salvar Meta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Comparação */}
      <Dialog open={showComparisonModal} onOpenChange={setShowComparisonModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Comparar Períodos</DialogTitle>
            <DialogDescription>
              Configure as opções para comparação de períodos
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Período Base</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="baseStart">Data Inicial</Label>
                  <Input 
                    id="baseStart" 
                    type="date" 
                    value={comparisonOptions.basePeriod.start}
                    onChange={(e) => setComparisonOptions({
                      ...comparisonOptions,
                      basePeriod: {
                        ...comparisonOptions.basePeriod,
                        start: e.target.value
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="baseEnd">Data Final</Label>
                  <Input 
                    id="baseEnd" 
                    type="date" 
                    value={comparisonOptions.basePeriod.end}
                    onChange={(e) => setComparisonOptions({
                      ...comparisonOptions,
                      basePeriod: {
                        ...comparisonOptions.basePeriod,
                        end: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
              <div className="mt-2">
                <Label htmlFor="baseLabel">Rótulo</Label>
                <Input 
                  id="baseLabel" 
                  value={comparisonOptions.basePeriod.label}
                  onChange={(e) => setComparisonOptions({
                    ...comparisonOptions,
                    basePeriod: {
                      ...comparisonOptions.basePeriod,
                      label: e.target.value
                    }
                  })}
                  placeholder="Ex: Período Atual"
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Período de Comparação</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="compStart">Data Inicial</Label>
                  <Input 
                    id="compStart" 
                    type="date" 
                    value={comparisonOptions.comparisonPeriod.start}
                    onChange={(e) => setComparisonOptions({
                      ...comparisonOptions,
                      comparisonPeriod: {
                        ...comparisonOptions.comparisonPeriod,
                        start: e.target.value
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="compEnd">Data Final</Label>
                  <Input 
                    id="compEnd" 
                    type="date" 
                    value={comparisonOptions.comparisonPeriod.end}
                    onChange={(e) => setComparisonOptions({
                      ...comparisonOptions,
                      comparisonPeriod: {
                        ...comparisonOptions.comparisonPeriod,
                        end: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
              <div className="mt-2">
                <Label htmlFor="compLabel">Rótulo</Label>
                <Input 
                  id="compLabel" 
                  value={comparisonOptions.comparisonPeriod.label}
                  onChange={(e) => setComparisonOptions({
                    ...comparisonOptions,
                    comparisonPeriod: {
                      ...comparisonOptions.comparisonPeriod,
                      label: e.target.value
                    }
                  })}
                  placeholder="Ex: Período Anterior"
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Seções para Comparar</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Checkbox 
                    id="compareFinanceiro" 
                    checked={comparisonOptions.sections.financeiro}
                    onCheckedChange={(checked) => setComparisonOptions({
                      ...comparisonOptions,
                      sections: {
                        ...comparisonOptions.sections,
                        financeiro: checked as boolean
                      }
                    })}
                  />
                  <Label htmlFor="compareFinanceiro" className="ml-2">Financeiro</Label>
                </div>
                <div className="flex items-center">
                  <Checkbox 
                    id="compareAtendimentos" 
                    checked={comparisonOptions.sections.atendimentos}
                    onCheckedChange={(checked) => setComparisonOptions({
                      ...comparisonOptions,
                      sections: {
                        ...comparisonOptions.sections,
                        atendimentos: checked as boolean
                      }
                    })}
                  />
                  <Label htmlFor="compareAtendimentos" className="ml-2">Atendimentos</Label>
                </div>
                <div className="flex items-center">
                  <Checkbox 
                    id="compareClientes" 
                    checked={comparisonOptions.sections.clientes}
                    onCheckedChange={(checked) => setComparisonOptions({
                      ...comparisonOptions,
                      sections: {
                        ...comparisonOptions.sections,
                        clientes: checked as boolean
                      }
                    })}
                  />
                  <Label htmlFor="compareClientes" className="ml-2">Clientes</Label>
                </div>
                <div className="flex items-center">
                  <Checkbox 
                    id="compareProdutos" 
                    checked={comparisonOptions.sections.produtos}
                    onCheckedChange={(checked) => setComparisonOptions({
                      ...comparisonOptions,
                      sections: {
                        ...comparisonOptions.sections,
                        produtos: checked as boolean
                      }
                    })}
                  />
                  <Label htmlFor="compareProdutos" className="ml-2">Produtos</Label>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="displayType">Tipo de Visualização</Label>
              <Select 
                value={comparisonOptions.displayType} 
                onValueChange={(value) => setComparisonOptions({
                  ...comparisonOptions,
                  displayType: value
                })}
              >
                <SelectTrigger id="displayType">
                  <SelectValue placeholder="Escolha a visualização" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="side-by-side">Lado a Lado</SelectItem>
                  <SelectItem value="overlay">Sobreposição</SelectItem>
                  <SelectItem value="difference">Apenas Diferenças</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowComparisonModal(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={() => {
              compareReports();
              setShowComparisonModal(false);
            }}>
              Comparar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  );
}
