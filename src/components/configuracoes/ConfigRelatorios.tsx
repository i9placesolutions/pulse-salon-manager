import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  LineChart
} from "lucide-react";

type RelatorioAutomatico = {
  id: string;
  titulo: string;
  descricao: string;
  frequencia: 'diario' | 'semanal' | 'mensal';
  ativo: boolean;
  categoria: 'financeiro' | 'operacional' | 'clientes' | 'estoque' | 'marketing';
};

type Destinatario = {
  email: string;
};

type ConfiguracaoRelatorios = {
  destinatarios: Destinatario[];
  formatoPdf: boolean;
  formatoExcel: boolean;
  horarioEnvio: string;
};

export function ConfigRelatorios() {
  // Estado para todos os relatórios disponíveis no sistema
  const [relatoriosAutomaticos, setRelatoriosAutomaticos] = useState<RelatorioAutomatico[]>([
    // Relatórios Financeiros
    { id: 'faturamento-diario', titulo: 'Faturamento Diário', descricao: 'Resumo do faturamento do dia anterior', frequencia: 'diario', ativo: false, categoria: 'financeiro' },
    { id: 'faturamento-semanal', titulo: 'Faturamento Semanal', descricao: 'Resumo do faturamento da semana anterior', frequencia: 'semanal', ativo: false, categoria: 'financeiro' },
    { id: 'faturamento-mensal', titulo: 'Faturamento Mensal', descricao: 'Resumo do faturamento do mês anterior', frequencia: 'mensal', ativo: false, categoria: 'financeiro' },
    { id: 'receitas-despesas', titulo: 'Receitas e Despesas', descricao: 'Balancete de receitas e despesas', frequencia: 'mensal', ativo: false, categoria: 'financeiro' },
    { id: 'pagamentos-metodos', titulo: 'Métodos de Pagamento', descricao: 'Análise dos métodos de pagamento utilizados', frequencia: 'mensal', ativo: false, categoria: 'financeiro' },
    { id: 'comissoes', titulo: 'Comissões', descricao: 'Resumo das comissões dos profissionais', frequencia: 'mensal', ativo: false, categoria: 'financeiro' },
    
    // Relatórios Operacionais
    { id: 'agendamentos-diarios', titulo: 'Agendamentos Diários', descricao: 'Lista de agendamentos do dia seguinte', frequencia: 'diario', ativo: false, categoria: 'operacional' },
    { id: 'agendamentos-semanais', titulo: 'Agendamentos Semanais', descricao: 'Resumo dos agendamentos da próxima semana', frequencia: 'semanal', ativo: false, categoria: 'operacional' },
    { id: 'taxa-ocupacao', titulo: 'Taxa de Ocupação', descricao: 'Análise da ocupação do salão por horário', frequencia: 'semanal', ativo: false, categoria: 'operacional' },
    { id: 'servicos-populares', titulo: 'Serviços Populares', descricao: 'Ranking dos serviços mais solicitados', frequencia: 'mensal', ativo: false, categoria: 'operacional' },
    { id: 'desempenho-profissionais', titulo: 'Desempenho dos Profissionais', descricao: 'Análise de produtividade dos profissionais', frequencia: 'mensal', ativo: false, categoria: 'operacional' },
    { id: 'cancelamentos', titulo: 'Cancelamentos', descricao: 'Análise de cancelamentos e reagendamentos', frequencia: 'semanal', ativo: false, categoria: 'operacional' },
    
    // Relatórios de Clientes
    { id: 'novos-clientes', titulo: 'Novos Clientes', descricao: 'Lista de novos clientes cadastrados', frequencia: 'semanal', ativo: false, categoria: 'clientes' },
    { id: 'aniversariantes', titulo: 'Aniversariantes', descricao: 'Lista de clientes aniversariantes da semana', frequencia: 'semanal', ativo: false, categoria: 'clientes' },
    { id: 'clientes-inativos', titulo: 'Clientes Inativos', descricao: 'Lista de clientes que não retornam há mais de 60 dias', frequencia: 'mensal', ativo: false, categoria: 'clientes' },
    { id: 'preferencias-clientes', titulo: 'Preferências dos Clientes', descricao: 'Análise das preferências e perfil dos clientes', frequencia: 'mensal', ativo: false, categoria: 'clientes' },
    { id: 'fidelidade', titulo: 'Fidelidade', descricao: 'Ranking de clientes por frequência de visitas', frequencia: 'mensal', ativo: false, categoria: 'clientes' },
    
    // Relatórios de Estoque
    { id: 'produtos-baixo-estoque', titulo: 'Produtos em Baixo Estoque', descricao: 'Lista de produtos com estoque abaixo do mínimo', frequencia: 'semanal', ativo: false, categoria: 'estoque' },
    { id: 'consumo-produtos', titulo: 'Consumo de Produtos', descricao: 'Análise do consumo de produtos por serviço', frequencia: 'mensal', ativo: false, categoria: 'estoque' },
    { id: 'validade-produtos', titulo: 'Validade de Produtos', descricao: 'Lista de produtos próximos ao vencimento', frequencia: 'mensal', ativo: false, categoria: 'estoque' },
    
    // Relatórios de Marketing
    { id: 'eficacia-promocoes', titulo: 'Eficácia de Promoções', descricao: 'Análise do desempenho das promoções', frequencia: 'mensal', ativo: false, categoria: 'marketing' },
    { id: 'engajamento-redes', titulo: 'Engajamento em Redes Sociais', descricao: 'Resumo do engajamento nas campanhas de redes sociais', frequencia: 'semanal', ativo: false, categoria: 'marketing' },
    { id: 'conversao-campanhas', titulo: 'Conversão de Campanhas', descricao: 'Taxa de conversão das campanhas de marketing', frequencia: 'mensal', ativo: false, categoria: 'marketing' },
  ]);
  
  // Estado para configurações dos relatórios
  const [configuracao, setConfiguracao] = useState<ConfiguracaoRelatorios>({
    destinatarios: [{ email: '' }],
    formatoPdf: true,
    formatoExcel: false,
    horarioEnvio: '08:00',
  });
  
  // Estado para controlar a categoria selecionada
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('financeiro');
  
  // Filtrar relatórios por categoria
  const relatoriosFiltrados = relatoriosAutomaticos.filter(r => r.categoria === categoriaSelecionada);
  
  // Alternar ativação do relatório
  const alternarAtivacao = (id: string) => {
    setRelatoriosAutomaticos(rel => 
      rel.map(r => r.id === id ? { ...r, ativo: !r.ativo } : r)
    );
  };
  
  // Adicionar novo destinatário
  const adicionarDestinatario = () => {
    setConfiguracao({
      ...configuracao,
      destinatarios: [...configuracao.destinatarios, { email: '' }]
    });
  };
  
  // Atualizar email de destinatário
  const atualizarEmailDestinatario = (index: number, email: string) => {
    const novosDestinatarios = [...configuracao.destinatarios];
    novosDestinatarios[index] = { email };
    setConfiguracao({
      ...configuracao,
      destinatarios: novosDestinatarios
    });
  };
  
  // Remover destinatário
  const removerDestinatario = (index: number) => {
    if (configuracao.destinatarios.length > 1) {
      const novosDestinatarios = [...configuracao.destinatarios];
      novosDestinatarios.splice(index, 1);
      setConfiguracao({
        ...configuracao,
        destinatarios: novosDestinatarios
      });
    }
  };
  
  // Salvar configurações
  const salvarConfiguracoes = () => {
    // Aqui implementaríamos a lógica para salvar no backend
    toast({
      title: "Configurações salvas",
      description: "As configurações de relatórios automáticos foram salvas com sucesso."
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Relatórios Automáticos</CardTitle>
          <CardDescription>
            Configure quais relatórios automáticos o estabelecimento deseja receber
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="financeiro" onValueChange={setCategoriaSelecionada}>
            <TabsList className="bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 p-1 rounded-lg border border-emerald-100 shadow-sm">
              <TabsTrigger 
                value="financeiro" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all"
              >
                <BarChart className="h-4 w-4 mr-2" />
                Financeiro
              </TabsTrigger>
              <TabsTrigger 
                value="operacional" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all"
              >
                <LineChart className="h-4 w-4 mr-2" />
                Operacional
              </TabsTrigger>
              <TabsTrigger 
                value="clientes" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all"
              >
                <Users className="h-4 w-4 mr-2" />
                Clientes
              </TabsTrigger>
              <TabsTrigger 
                value="estoque" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Estoque
              </TabsTrigger>
              <TabsTrigger 
                value="marketing" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Marketing
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={categoriaSelecionada} className="space-y-4 mt-4 animate-in fade-in-50 duration-300">
              <div className="bg-white rounded-lg border border-emerald-100 shadow-md overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"></div>
                <div className="p-4">
                  {relatoriosFiltrados.map((relatorio) => (
                    <div key={relatorio.id} className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
                      <div className="space-y-0.5">
                        <Label className="font-medium">{relatorio.titulo}</Label>
                        <p className="text-sm text-muted-foreground">{relatorio.descricao}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full">
                            {relatorio.frequencia === 'diario' ? 'Diário' : 
                             relatorio.frequencia === 'semanal' ? 'Semanal' : 'Mensal'}
                          </span>
                        </div>
                      </div>
                      <Switch 
                        checked={relatorio.ativo} 
                        onCheckedChange={() => alternarAtivacao(relatorio.id)}
                      />
                    </div>
                  ))}
                  
                  {relatoriosFiltrados.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Não há relatórios disponíveis nesta categoria no momento.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="border-emerald-100">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-100">
            <CardTitle className="text-emerald-700">Destinatários</CardTitle>
            <CardDescription>
              Quem receberá os relatórios automáticos
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {configuracao.destinatarios.map((dest, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input 
                    value={dest.email} 
                    onChange={(e) => atualizarEmailDestinatario(index, e.target.value)}
                    placeholder="email@exemplo.com.br" 
                    className="flex-1 border-emerald-200 focus:border-emerald-400"
                  />
                  {configuracao.destinatarios.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removerDestinatario(index)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={adicionarDestinatario}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                Adicionar destinatário
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-100">
            <CardTitle className="text-emerald-700">Formato e Horário</CardTitle>
            <CardDescription>
              Configure como e quando os relatórios serão enviados
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch 
                  id="export-pdf" 
                  checked={configuracao.formatoPdf}
                  onCheckedChange={(checked) => setConfiguracao({...configuracao, formatoPdf: checked})}
                />
                <Label htmlFor="export-pdf">Exportar como PDF</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  id="export-excel" 
                  checked={configuracao.formatoExcel}
                  onCheckedChange={(checked) => setConfiguracao({...configuracao, formatoExcel: checked})}
                />
                <Label htmlFor="export-excel">Exportar como Excel</Label>
              </div>
              
              <div className="grid gap-2 pt-2">
                <Label>Horário de envio</Label>
                <Input 
                  type="time" 
                  value={configuracao.horarioEnvio}
                  onChange={(e) => setConfiguracao({...configuracao, horarioEnvio: e.target.value})}
                  className="border-emerald-200 focus:border-emerald-400"
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={salvarConfiguracoes}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                >
                  Salvar Configurações
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
