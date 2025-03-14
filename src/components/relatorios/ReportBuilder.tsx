import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, Calendar, Users, UserCheck, Package,
  TrendingUp, Star, Clock, Activity, Scissors, ShoppingBag,
  Download, Filter, Eye, Settings, FileDown
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format, sub } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ptBR } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";

// Tipos de relatórios disponíveis
type ReportType = "financeiro" | "atendimentos" | "clientes" | "profissionais" | "estoque" | "personalizado";
type ReportSubtype = "receitas" | "despesas" | "completo" | "agendados" | "realizados" | "cancelados" | 
                    "novos" | "recorrentes" | "performance" | "disponibilidade" | "maisVendidos" | "estoqueBaixo";

// Interfaces para os filtros e opções de relatório
interface ReportOptions {
  type: ReportType;
  subtype: ReportSubtype;
  periodStart: string;
  periodEnd: string;
  filters: {
    profissionais: string[];
    servicos: string[];
    categorias: string[];
    statusPagamento: string[];
    statusAtendimento: string[];
    tipoCliente: string[];
    produtos: string[];
  };
  visualizacao: {
    tabelas: boolean;
    graficos: boolean;
    resumo: boolean;
  };
}

// Lista de profissionais para filtros
const profissionais = [
  { id: "1", nome: "Ana Silva" },
  { id: "2", nome: "João Santos" },
  { id: "3", nome: "Maria Oliveira" },
];

// Lista de serviços para filtros
const servicos = [
  { id: "1", nome: "Corte Feminino" },
  { id: "2", nome: "Corte Masculino" },
  { id: "3", nome: "Coloração" },
  { id: "4", nome: "Manicure" },
  { id: "5", nome: "Hidratação" },
];

// Categorias financeiras
const categoriasFinanceiras = [
  { id: "1", nome: "Serviços" },
  { id: "2", nome: "Produtos" },
  { id: "3", nome: "Assinaturas" },
  { id: "4", nome: "Aluguel" },
  { id: "5", nome: "Salários" },
  { id: "6", nome: "Materiais" },
];

// Status de pagamento
const statusPagamento = [
  { id: "1", nome: "Pago" },
  { id: "2", nome: "Pendente" },
  { id: "3", nome: "Cancelado" },
  { id: "4", nome: "Estornado" },
];

// Status de atendimento
const statusAtendimento = [
  { id: "1", nome: "Agendado" },
  { id: "2", nome: "Realizado" },
  { id: "3", nome: "Cancelado" },
  { id: "4", nome: "Remarcado" },
  { id: "5", nome: "Não compareceu" },
];

// Tipos de cliente
const tiposCliente = [
  { id: "1", nome: "Novo" },
  { id: "2", nome: "Recorrente" },
  { id: "3", nome: "Inativo" },
  { id: "4", nome: "VIP" },
];

// Lista de produtos
const produtos = [
  { id: "1", nome: "Shampoo Pro" },
  { id: "2", nome: "Condicionador Pro" },
  { id: "3", nome: "Máscara Capilar" },
  { id: "4", nome: "Tintura #7" },
  { id: "5", nome: "Óleo Capilar" },
];

export interface ReportBuilderProps {
  onGenerateReport: (options: ReportOptions) => void;
}

export function ReportBuilder({ onGenerateReport }: ReportBuilderProps) {
  // Estado para controlar as opções de relatório
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    type: "financeiro",
    subtype: "completo",
    periodStart: format(sub(new Date(), { months: 1 }), "yyyy-MM-dd"),
    periodEnd: format(new Date(), "yyyy-MM-dd"),
    filters: {
      profissionais: [],
      servicos: [],
      categorias: [],
      statusPagamento: [],
      statusAtendimento: [],
      tipoCliente: [],
      produtos: [],
    },
    visualizacao: {
      tabelas: true,
      graficos: true,
      resumo: true,
    }
  });

  // Atualiza o tipo de relatório e reseta os subtipos
  const handleTypeChange = (type: ReportType) => {
    let defaultSubtype: ReportSubtype = "completo";
    
    // Define o subtipo padrão com base no tipo principal
    switch(type) {
      case "financeiro":
        defaultSubtype = "completo";
        break;
      case "atendimentos":
        defaultSubtype = "realizados";
        break;
      case "clientes":
        defaultSubtype = "recorrentes";
        break;
      case "profissionais":
        defaultSubtype = "performance";
        break;
      case "estoque":
        defaultSubtype = "maisVendidos";
        break;
    }
    
    setReportOptions({
      ...reportOptions,
      type,
      subtype: defaultSubtype
    });
  };

  // Função para atualizar período com botões rápidos
  const handleQuickPeriod = (days: number) => {
    setReportOptions({
      ...reportOptions,
      periodStart: format(sub(new Date(), { days }), "yyyy-MM-dd"),
      periodEnd: format(new Date(), "yyyy-MM-dd")
    });
  };

  // Função para atualizar filtros específicos por categoria
  const updateFilter = (
    category: keyof ReportOptions["filters"], 
    values: string[]
  ) => {
    setReportOptions({
      ...reportOptions,
      filters: {
        ...reportOptions.filters,
        [category]: values
      }
    });
  };

  // Controla quais filtros exibir com base no tipo de relatório
  const renderFiltersByType = () => {
    switch (reportOptions.type) {
      case "financeiro":
        return (
          <>
            <div className="space-y-2">
              <Label className="font-medium">Categorias Financeiras</Label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {categoriasFinanceiras.map(categoria => (
                  <div key={categoria.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`categoria-${categoria.id}`}
                      checked={reportOptions.filters.categorias.includes(categoria.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter("categorias", [...reportOptions.filters.categorias, categoria.id]);
                        } else {
                          updateFilter("categorias", reportOptions.filters.categorias.filter(id => id !== categoria.id));
                        }
                      }}
                    />
                    <Label htmlFor={`categoria-${categoria.id}`}>{categoria.nome}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Status de Pagamento</Label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {statusPagamento.map(status => (
                  <div key={status.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`status-pag-${status.id}`}
                      checked={reportOptions.filters.statusPagamento.includes(status.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter("statusPagamento", [...reportOptions.filters.statusPagamento, status.id]);
                        } else {
                          updateFilter("statusPagamento", reportOptions.filters.statusPagamento.filter(id => id !== status.id));
                        }
                      }}
                    />
                    <Label htmlFor={`status-pag-${status.id}`}>{status.nome}</Label>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      
      case "atendimentos":
        return (
          <>
            <div className="space-y-2">
              <Label className="font-medium">Profissionais</Label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {profissionais.map(prof => (
                  <div key={prof.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`prof-${prof.id}`}
                      checked={reportOptions.filters.profissionais.includes(prof.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter("profissionais", [...reportOptions.filters.profissionais, prof.id]);
                        } else {
                          updateFilter("profissionais", reportOptions.filters.profissionais.filter(id => id !== prof.id));
                        }
                      }}
                    />
                    <Label htmlFor={`prof-${prof.id}`}>{prof.nome}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Serviços</Label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {servicos.map(servico => (
                  <div key={servico.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`serv-${servico.id}`}
                      checked={reportOptions.filters.servicos.includes(servico.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter("servicos", [...reportOptions.filters.servicos, servico.id]);
                        } else {
                          updateFilter("servicos", reportOptions.filters.servicos.filter(id => id !== servico.id));
                        }
                      }}
                    />
                    <Label htmlFor={`serv-${servico.id}`}>{servico.nome}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Status do Atendimento</Label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {statusAtendimento.map(status => (
                  <div key={status.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`status-atend-${status.id}`}
                      checked={reportOptions.filters.statusAtendimento.includes(status.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter("statusAtendimento", [...reportOptions.filters.statusAtendimento, status.id]);
                        } else {
                          updateFilter("statusAtendimento", reportOptions.filters.statusAtendimento.filter(id => id !== status.id));
                        }
                      }}
                    />
                    <Label htmlFor={`status-atend-${status.id}`}>{status.nome}</Label>
                  </div>
                ))}
              </div>
            </div>
          </>
        );

      case "clientes":
        return (
          <>
            <div className="space-y-2">
              <Label className="font-medium">Tipo de Clientes</Label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {tiposCliente.map(tipo => (
                  <div key={tipo.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`tipo-cliente-${tipo.id}`}
                      checked={reportOptions.filters.tipoCliente.includes(tipo.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter("tipoCliente", [...reportOptions.filters.tipoCliente, tipo.id]);
                        } else {
                          updateFilter("tipoCliente", reportOptions.filters.tipoCliente.filter(id => id !== tipo.id));
                        }
                      }}
                    />
                    <Label htmlFor={`tipo-cliente-${tipo.id}`}>{tipo.nome}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Serviços Utilizados</Label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {servicos.map(servico => (
                  <div key={servico.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`cl-serv-${servico.id}`}
                      checked={reportOptions.filters.servicos.includes(servico.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter("servicos", [...reportOptions.filters.servicos, servico.id]);
                        } else {
                          updateFilter("servicos", reportOptions.filters.servicos.filter(id => id !== servico.id));
                        }
                      }}
                    />
                    <Label htmlFor={`cl-serv-${servico.id}`}>{servico.nome}</Label>
                  </div>
                ))}
              </div>
            </div>
          </>
        );

      case "profissionais":
        return (
          <>
            <div className="space-y-2">
              <Label className="font-medium">Profissionais</Label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {profissionais.map(prof => (
                  <div key={prof.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`prof-perf-${prof.id}`}
                      checked={reportOptions.filters.profissionais.includes(prof.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter("profissionais", [...reportOptions.filters.profissionais, prof.id]);
                        } else {
                          updateFilter("profissionais", reportOptions.filters.profissionais.filter(id => id !== prof.id));
                        }
                      }}
                    />
                    <Label htmlFor={`prof-perf-${prof.id}`}>{prof.nome}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Serviços</Label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {servicos.map(servico => (
                  <div key={servico.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`prof-serv-${servico.id}`}
                      checked={reportOptions.filters.servicos.includes(servico.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter("servicos", [...reportOptions.filters.servicos, servico.id]);
                        } else {
                          updateFilter("servicos", reportOptions.filters.servicos.filter(id => id !== servico.id));
                        }
                      }}
                    />
                    <Label htmlFor={`prof-serv-${servico.id}`}>{servico.nome}</Label>
                  </div>
                ))}
              </div>
            </div>
          </>
        );

      case "estoque":
        return (
          <>
            <div className="space-y-2">
              <Label className="font-medium">Produtos</Label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {produtos.map(produto => (
                  <div key={produto.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`estoque-prod-${produto.id}`}
                      checked={reportOptions.filters.produtos.includes(produto.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter("produtos", [...reportOptions.filters.produtos, produto.id]);
                        } else {
                          updateFilter("produtos", reportOptions.filters.produtos.filter(id => id !== produto.id));
                        }
                      }}
                    />
                    <Label htmlFor={`estoque-prod-${produto.id}`}>{produto.nome}</Label>
                  </div>
                ))}
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // Subtipos disponíveis com base no tipo de relatório
  const renderSubtypeOptions = () => {
    switch (reportOptions.type) {
      case "financeiro":
        return (
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="completo" id="completo" />
              <Label htmlFor="completo">Completo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="receitas" id="receitas" />
              <Label htmlFor="receitas">Apenas Receitas</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="despesas" id="despesas" />
              <Label htmlFor="despesas">Apenas Despesas</Label>
            </div>
          </div>
        );

      case "atendimentos":
        return (
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="realizados" id="realizados" />
              <Label htmlFor="realizados">Realizados</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="agendados" id="agendados" />
              <Label htmlFor="agendados">Agendados</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cancelados" id="cancelados" />
              <Label htmlFor="cancelados">Cancelados</Label>
            </div>
          </div>
        );

      case "clientes":
        return (
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="recorrentes" id="recorrentes" />
              <Label htmlFor="recorrentes">Recorrentes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="novos" id="novos" />
              <Label htmlFor="novos">Novos</Label>
            </div>
          </div>
        );

      case "profissionais":
        return (
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="performance" id="performance" />
              <Label htmlFor="performance">Performance</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="disponibilidade" id="disponibilidade" />
              <Label htmlFor="disponibilidade">Disponibilidade</Label>
            </div>
          </div>
        );

      case "estoque":
        return (
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="maisVendidos" id="maisVendidos" />
              <Label htmlFor="maisVendidos">Mais Vendidos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="estoqueBaixo" id="estoqueBaixo" />
              <Label htmlFor="estoqueBaixo">Estoque Baixo</Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          Construtor de Relatórios
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Tipo de Relatório */}
          <div className="space-y-2">
            <Label className="font-medium">Tipo de Relatório</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              <Button 
                variant={reportOptions.type === "financeiro" ? "default" : "outline"} 
                className="flex flex-col items-center justify-center h-20 p-2"
                onClick={() => handleTypeChange("financeiro")}
              >
                <FileText className="h-6 w-6 mb-1" />
                <span>Financeiro</span>
              </Button>
              <Button 
                variant={reportOptions.type === "atendimentos" ? "default" : "outline"} 
                className="flex flex-col items-center justify-center h-20 p-2"
                onClick={() => handleTypeChange("atendimentos")}
              >
                <Calendar className="h-6 w-6 mb-1" />
                <span>Atendimentos</span>
              </Button>
              <Button 
                variant={reportOptions.type === "clientes" ? "default" : "outline"} 
                className="flex flex-col items-center justify-center h-20 p-2"
                onClick={() => handleTypeChange("clientes")}
              >
                <Users className="h-6 w-6 mb-1" />
                <span>Clientes</span>
              </Button>
              <Button 
                variant={reportOptions.type === "profissionais" ? "default" : "outline"} 
                className="flex flex-col items-center justify-center h-20 p-2"
                onClick={() => handleTypeChange("profissionais")}
              >
                <UserCheck className="h-6 w-6 mb-1" />
                <span>Profissionais</span>
              </Button>
              <Button 
                variant={reportOptions.type === "estoque" ? "default" : "outline"} 
                className="flex flex-col items-center justify-center h-20 p-2"
                onClick={() => handleTypeChange("estoque")}
              >
                <Package className="h-6 w-6 mb-1" />
                <span>Estoque</span>
              </Button>
            </div>
          </div>

          {/* Subtipo de relatório */}
          <div className="space-y-2">
            <Label className="font-medium">O que você gostaria de analisar?</Label>
            <RadioGroup 
              value={reportOptions.subtype} 
              onValueChange={(value) => setReportOptions({
                ...reportOptions, 
                subtype: value as ReportSubtype
              })}
            >
              {renderSubtypeOptions()}
            </RadioGroup>
          </div>

          {/* Período */}
          <div className="space-y-2">
            <Label className="font-medium">Período</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-start">Data Inicial</Label>
                <Input 
                  id="date-start" 
                  type="date" 
                  value={reportOptions.periodStart}
                  onChange={(e) => setReportOptions({...reportOptions, periodStart: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-end">Data Final</Label>
                <Input 
                  id="date-end" 
                  type="date" 
                  value={reportOptions.periodEnd}
                  onChange={(e) => setReportOptions({...reportOptions, periodEnd: e.target.value})}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuickPeriod(7)}
              >
                Última Semana
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuickPeriod(30)}
              >
                Último Mês
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuickPeriod(90)}
              >
                Último Trimestre
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuickPeriod(365)}
              >
                Último Ano
              </Button>
            </div>
          </div>

          {/* Filtros específicos por categoria */}
          <div className="space-y-4">
            <Label className="font-medium text-lg">Filtros Específicos</Label>
            {renderFiltersByType()}
          </div>

          {/* Opções de Visualização */}
          <div className="space-y-2">
            <Label className="font-medium">Opções de Visualização</Label>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tabelas" 
                  checked={reportOptions.visualizacao.tabelas}
                  onCheckedChange={(checked) => 
                    setReportOptions({
                      ...reportOptions, 
                      visualizacao: {
                        ...reportOptions.visualizacao,
                        tabelas: !!checked
                      }
                    })
                  }
                />
                <Label htmlFor="tabelas">Incluir tabelas de dados</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="graficos" 
                  checked={reportOptions.visualizacao.graficos}
                  onCheckedChange={(checked) => 
                    setReportOptions({
                      ...reportOptions, 
                      visualizacao: {
                        ...reportOptions.visualizacao,
                        graficos: !!checked
                      }
                    })
                  }
                />
                <Label htmlFor="graficos">Incluir gráficos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="resumo" 
                  checked={reportOptions.visualizacao.resumo}
                  onCheckedChange={(checked) => 
                    setReportOptions({
                      ...reportOptions, 
                      visualizacao: {
                        ...reportOptions.visualizacao,
                        resumo: !!checked
                      }
                    })
                  }
                />
                <Label htmlFor="resumo">Incluir resumo executivo</Label>
              </div>
            </div>
          </div>

          {/* Botão de Gerar Relatório */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={() => {
                onGenerateReport(reportOptions);
                toast({
                  title: "Relatório gerado com sucesso!",
                  description: "Os dados solicitados foram atualizados.",
                });
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <Eye className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
