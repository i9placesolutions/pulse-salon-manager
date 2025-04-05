import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { 
  AlertCircle, 
  Lock, 
  Shield, 
  Eye, 
  EyeOff, 
  Clock, 
  UserCog, 
  FileText, 
  KeyRound, 
  ShieldAlert, 
  FileBarChart,
  Download,
  Trash2,
  Loader2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type HistoricoAcesso = {
  id: number;
  username: string;
  created_at: string;
  action: string;
  ip_address: string;
};

// Interface para configurações de segurança
interface ConfiguracoesSeguranca {
  autenticacao: {
    doisFatores: boolean;
    senhasFortes: boolean;
    bloqueioTentativas: boolean;
    expiracaoSenha: boolean;
    tempoExpiracaoSenha: string;
    tempoInatividade: string;
  };
  privacidade: {
    anonimizacaoDados: boolean;
    termoConsentimento: boolean;
    exclusaoAutomatica: boolean;
    mascaramentoCartao: boolean;
    periodoExclusao: string;
  };
  auditoria: {
    registroAcessoDadosSensiveis: boolean;
    alertaAcoesCriticas: boolean;
    periodoRetencao: string;
  };
}

export const ConfigSeguranca = forwardRef((props, ref) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);
  
  // Estado para armazenar todas as configurações
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesSeguranca>({
    autenticacao: {
      doisFatores: false,
      senhasFortes: true,
      bloqueioTentativas: true,
      expiracaoSenha: false,
      tempoExpiracaoSenha: '60',
      tempoInatividade: '30'
    },
    privacidade: {
      anonimizacaoDados: true,
      termoConsentimento: true,
      exclusaoAutomatica: false,
      mascaramentoCartao: true,
      periodoExclusao: '5'
    },
    auditoria: {
      registroAcessoDadosSensiveis: true,
      alertaAcoesCriticas: true,
      periodoRetencao: '30'
    }
  });

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [limiteHistorico, setLimiteHistorico] = useState("30");
  const [historicoAcessos, setHistoricoAcessos] = useState<HistoricoAcesso[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(true);

  // Expor o método getFormData para o componente pai
  useImperativeHandle(ref, () => ({
    getFormData: () => ({
      autenticacao: configuracoes.autenticacao,
      privacidade: configuracoes.privacidade,
      auditoria: {
        ...configuracoes.auditoria,
        periodoRetencao: limiteHistorico
      }
    })
  }));

  // Carregar configurações salvas do Supabase
  useEffect(() => {
    const carregarConfiguracoes = async () => {
      try {
        setLoading(true);
        // Obter o usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        // Buscar configurações do estabelecimento
        const { data, error } = await supabase
          .from('establishment_details')
          .select('security_settings')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data && data.security_settings) {
          const configsSalvas = data.security_settings as ConfiguracoesSeguranca;
          setConfiguracoes(configsSalvas);
          if (configsSalvas.auditoria && configsSalvas.auditoria.periodoRetencao) {
            setLimiteHistorico(configsSalvas.auditoria.periodoRetencao);
          }
        }
        
        // Carregar histórico de logs
        await carregarHistoricoAcessos();
      } catch (error) {
        console.error('Erro ao carregar configurações de segurança:', error);
        toast({
          title: "Erro ao carregar configurações",
          description: "Não foi possível carregar as configurações de segurança.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    carregarConfiguracoes();
  }, []);
  
  // Função para carregar histórico de acessos do Supabase
  const carregarHistoricoAcessos = async () => {
    try {
      setCarregandoHistorico(true);
      
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      // Buscar logs de segurança
      const { data, error } = await supabase
        .from('security_audit_logs')
        .select('*')
        .eq('establishment_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      
      if (data) {
        const historicoFormatado = data.map(log => ({
          id: log.id,
          username: log.username || log.user_email || 'Usuário desconhecido',
          created_at: format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
          action: log.action,
          ip_address: log.ip_address || 'Desconhecido'
        }));
        
        setHistoricoAcessos(historicoFormatado);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de acessos:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico de acessos.",
        variant: "destructive",
      });
    } finally {
      setCarregandoHistorico(false);
    }
  };

  // Handler para atualizar as configurações de autenticação
  const handleAutenticacaoChange = (campo: keyof ConfiguracoesSeguranca['autenticacao'], valor: any) => {
    setConfiguracoes(prev => ({
      ...prev,
      autenticacao: {
        ...prev.autenticacao,
        [campo]: valor
      }
    }));
  };

  // Handler para atualizar as configurações de privacidade
  const handlePrivacidadeChange = (campo: keyof ConfiguracoesSeguranca['privacidade'], valor: any) => {
    setConfiguracoes(prev => ({
      ...prev,
      privacidade: {
        ...prev.privacidade,
        [campo]: valor
      }
    }));
  };

  // Handler para atualizar as configurações de auditoria
  const handleAuditoriaChange = (campo: keyof ConfiguracoesSeguranca['auditoria'], valor: any) => {
    setConfiguracoes(prev => ({
      ...prev,
      auditoria: {
        ...prev.auditoria,
        [campo]: valor
      }
    }));
  };

  const salvarConfiguracoes = async () => {
    try {
      setLoading(true);
      
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro ao salvar",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }
      
      // Atualizar configurações de segurança
      const configsAtualizadas = {
        ...configuracoes,
        auditoria: {
          ...configuracoes.auditoria,
          periodoRetencao: limiteHistorico
        }
      };
      
      const { error } = await supabase
        .from('establishment_details')
        .update({
          security_settings: configsAtualizadas,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Registrar log de alteração das configurações
      await supabase.rpc('fn_create_audit_log', {
        p_action: 'Alteração de configurações de segurança',
        p_resource_type: 'security_settings',
        p_resource_id: user.id,
        p_details: { configuracoes_alteradas: true }
      });
      
      toast({
        title: "Configurações salvas",
        description: "As configurações de segurança foram atualizadas com sucesso.",
        variant: "default",
      });
      
      // Recarregar histórico após salvar
      await carregarHistoricoAcessos();
      
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações de segurança.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const limparHistorico = async () => {
    try {
      setLoadingLogs(true);
      
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      // Excluir logs antigos (mantendo apenas os mais recentes)
      const { error } = await supabase.rpc('limpar_registros_antigos', {
        p_dias: parseInt(limiteHistorico)
      });
      
      if (error) throw error;
      
      // Registrar a ação de limpeza
      await supabase.rpc('fn_create_audit_log', {
        p_action: 'Limpeza de logs de segurança',
        p_resource_type: 'security_audit_logs',
        p_details: { dias_mantidos: parseInt(limiteHistorico) }
      });
      
      // Recarregar a lista de registros
      await carregarHistoricoAcessos();
      
      toast({
        title: "Histórico limpo",
        description: `Logs mais antigos que ${limiteHistorico} dias foram removidos.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
      toast({
        title: "Erro ao limpar histórico",
        description: "Não foi possível limpar o histórico de acessos.",
        variant: "destructive",
      });
    } finally {
      setLoadingLogs(false);
    }
  };

  const exportarHistorico = async () => {
    try {
      setLoadingLogs(true);
      
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      // Buscar todos os logs para exportação
      const { data, error } = await supabase
        .from('security_audit_logs')
        .select('*')
        .eq('establishment_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast({
          title: "Sem registros",
          description: "Não há registros para exportar.",
          variant: "default",
        });
        return;
      }
      
      // Formatar os dados para exportação
      const dataFormatada = data.map(log => ({
        id: log.id,
        usuario: log.username || log.user_email || 'Desconhecido',
        acao: log.action,
        recurso: log.resource_type || '-',
        id_recurso: log.resource_id || '-',
        detalhes: log.details,
        ip: log.ip_address || 'Desconhecido',
        data_hora: format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })
      }));
      
      // Criar o arquivo para download
      const dataStr = JSON.stringify(dataFormatada, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-seguranca-${format(new Date(), 'yyyy-MM-dd')}.json`;
      
      // Registrar a ação de exportação
      await supabase.rpc('fn_create_audit_log', {
        p_action: 'Exportação de logs de segurança',
        p_resource_type: 'security_audit_logs',
        p_details: { quantidade: data.length }
      });
      
      // Simular um clique e liberar o URL
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Histórico exportado",
        description: `${data.length} registros foram exportados com sucesso.`,
        variant: "default",
      });
      
      // Recarregar histórico após exportação
      await carregarHistoricoAcessos();
      
    } catch (error) {
      console.error('Erro ao exportar histórico:', error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o histórico de acessos.",
        variant: "destructive",
      });
    } finally {
      setLoadingLogs(false);
    }
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>Carregando configurações...</span>
        </div>
      )}
      
      {!loading && (
        <>
          <Tabs defaultValue="autenticacao" className="w-full">
            <TabsList className="bg-gradient-to-r from-red-50 via-red-100 to-red-50 p-1 rounded-lg border border-red-100 shadow-sm">
              <TabsTrigger 
                value="autenticacao" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all"
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Autenticação
              </TabsTrigger>
              <TabsTrigger 
                value="privacidade" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all"
              >
                <ShieldAlert className="h-4 w-4 mr-2" />
                Privacidade
              </TabsTrigger>
              <TabsTrigger 
                value="auditoria" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-amber-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all"
              >
                <FileBarChart className="h-4 w-4 mr-2" />
                Auditoria
              </TabsTrigger>
            </TabsList>

            {/* Aba de Autenticação */}
            <TabsContent value="autenticacao" className="space-y-4 mt-4 animate-in fade-in-50 duration-300">
              <div className="bg-white rounded-lg border border-red-100 shadow-md overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-red-400 via-red-500 to-red-600"></div>
                <div className="p-4">
                  <Card className="border-0 shadow-none">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="flex items-center gap-2 text-red-700">
                        <Lock className="h-5 w-5 text-red-600" /> Políticas de Autenticação
                      </CardTitle>
                      <CardDescription>
                        Configure as políticas de segurança de acesso ao sistema
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="font-medium">Autenticação de Dois Fatores</Label>
                            <p className="text-sm text-muted-foreground">
                              Exigir verificação em dois fatores para todos os usuários
                            </p>
                          </div>
                          <Switch 
                            id="two-factor" 
                            checked={configuracoes?.autenticacao?.doisFatores || false}
                            onCheckedChange={(checked) => handleAutenticacaoChange('doisFatores', checked)}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="font-medium">Política de Senhas Fortes</Label>
                            <p className="text-sm text-muted-foreground">
                              Exigir senhas com pelo menos 8 caracteres, incluindo letras, números e símbolos
                            </p>
                          </div>
                          <Switch 
                            id="strong-password" 
                            checked={configuracoes?.autenticacao?.senhasFortes || false}
                            onCheckedChange={(checked) => handleAutenticacaoChange('senhasFortes', checked)}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="font-medium">Bloqueio de Tentativas</Label>
                            <p className="text-sm text-muted-foreground">
                              Bloquear acesso após 5 tentativas falhas de login
                            </p>
                          </div>
                          <Switch 
                            id="login-attempt" 
                            checked={configuracoes?.autenticacao?.bloqueioTentativas || false}
                            onCheckedChange={(checked) => handleAutenticacaoChange('bloqueioTentativas', checked)}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="font-medium">Expiração de Senha</Label>
                            <p className="text-sm text-muted-foreground">
                              Solicitar troca de senha a cada {configuracoes?.autenticacao?.tempoExpiracaoSenha || '60'} dias
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {configuracoes?.autenticacao?.expiracaoSenha && (
                              <Select
                                value={configuracoes?.autenticacao?.tempoExpiracaoSenha || '60'}
                                onValueChange={(value) => handleAutenticacaoChange('tempoExpiracaoSenha', value)}
                              >
                                <SelectTrigger className="w-24 border-red-200 focus:border-red-400">
                                  <SelectValue placeholder="Dias" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="30">30 dias</SelectItem>
                                  <SelectItem value="60">60 dias</SelectItem>
                                  <SelectItem value="90">90 dias</SelectItem>
                                  <SelectItem value="180">180 dias</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            <Switch 
                              id="password-expiry" 
                              checked={configuracoes?.autenticacao?.expiracaoSenha || false}
                              onCheckedChange={(checked) => handleAutenticacaoChange('expiracaoSenha', checked)}
                            />
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="font-medium">Bloqueio por Inatividade</Label>
                            <p className="text-sm text-muted-foreground">
                              Bloquear sessão após período de inatividade
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              value={configuracoes?.autenticacao?.tempoInatividade || '30'}
                              onValueChange={(value) => handleAutenticacaoChange('tempoInatividade', value)}
                            >
                              <SelectTrigger className="w-24 border-red-200 focus:border-red-400">
                                <SelectValue placeholder="Minutos" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 min</SelectItem>
                                <SelectItem value="30">30 min</SelectItem>
                                <SelectItem value="60">60 min</SelectItem>
                                <SelectItem value="120">120 min</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Aba de Privacidade */}
            <TabsContent value="privacidade" className="space-y-4 mt-4 animate-in fade-in-50 duration-300">
              <div className="bg-white rounded-lg border border-purple-100 shadow-md overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600"></div>
                <div className="p-4">
                  <Card className="border-0 shadow-none">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="flex items-center gap-2 text-purple-700">
                        <Shield className="h-5 w-5 text-purple-600" /> Privacidade e Proteção de Dados
                      </CardTitle>
                      <CardDescription>
                        Defina como o sistema gerencia os dados pessoais conforme a LGPD
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="font-medium">Anonimização de Dados</Label>
                            <p className="text-sm text-muted-foreground">
                              Anonimizar dados pessoais em relatórios e exportações
                            </p>
                          </div>
                          <Switch 
                            id="anonymize-data" 
                            checked={configuracoes?.privacidade?.anonimizacaoDados || false}
                            onCheckedChange={(checked) => handlePrivacidadeChange('anonimizacaoDados', checked)}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="font-medium">Termo de Consentimento</Label>
                            <p className="text-sm text-muted-foreground">
                              Exigir aceitação do termo de uso de dados ao cadastrar novos clientes
                            </p>
                          </div>
                          <Switch 
                            id="consent-term" 
                            checked={configuracoes?.privacidade?.termoConsentimento || false}
                            onCheckedChange={(checked) => handlePrivacidadeChange('termoConsentimento', checked)}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="font-medium">Exclusão Automática</Label>
                            <p className="text-sm text-muted-foreground">
                              Excluir dados de clientes inativos após {configuracoes?.privacidade?.periodoExclusao || '5'} anos
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {configuracoes?.privacidade?.exclusaoAutomatica && (
                              <Select
                                value={configuracoes?.privacidade?.periodoExclusao || '5'}
                                onValueChange={(value) => handlePrivacidadeChange('periodoExclusao', value)}
                              >
                                <SelectTrigger className="w-24 border-purple-200 focus:border-purple-400">
                                  <SelectValue placeholder="Anos" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="2">2 anos</SelectItem>
                                  <SelectItem value="3">3 anos</SelectItem>
                                  <SelectItem value="5">5 anos</SelectItem>
                                  <SelectItem value="7">7 anos</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            <Switch 
                              id="auto-delete" 
                              checked={configuracoes?.privacidade?.exclusaoAutomatica || false}
                              onCheckedChange={(checked) => handlePrivacidadeChange('exclusaoAutomatica', checked)}
                            />
                          </div>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="font-medium">Mascaramento de Cartão</Label>
                            <p className="text-sm text-muted-foreground">
                              Exibir apenas os últimos 4 dígitos de cartões de crédito
                            </p>
                          </div>
                          <Switch 
                            id="credit-card-masking" 
                            checked={configuracoes?.privacidade?.mascaramentoCartao || false}
                            onCheckedChange={(checked) => handlePrivacidadeChange('mascaramentoCartao', checked)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Aba de Auditoria */}
            <TabsContent value="auditoria" className="space-y-4 mt-4 animate-in fade-in-50 duration-300">
              <div className="bg-white rounded-lg border border-amber-100 shadow-md overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"></div>
                <div className="p-4">
                  <Card className="border-0 shadow-none">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="flex items-center gap-2 text-amber-700">
                        <FileText className="h-5 w-5 text-amber-600" /> Logs e Auditoria
                      </CardTitle>
                      <CardDescription>
                        Monitore ações realizadas no sistema e configure políticas de log
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="font-medium">Registro de Acesso a Dados Sensíveis</Label>
                            <p className="text-sm text-muted-foreground">
                              Registrar quem acessou informações de pagamentos e dados pessoais
                            </p>
                          </div>
                          <Switch 
                            id="sensitive-data-log" 
                            checked={configuracoes?.auditoria?.registroAcessoDadosSensiveis || false}
                            onCheckedChange={(checked) => handleAuditoriaChange('registroAcessoDadosSensiveis', checked)}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="font-medium">Alerta de Ações Críticas</Label>
                            <p className="text-sm text-muted-foreground">
                              Notificar administradores sobre exclusões e alterações massivas
                            </p>
                          </div>
                          <Switch 
                            id="critical-action-alert" 
                            checked={configuracoes?.auditoria?.alertaAcoesCriticas || false}
                            onCheckedChange={(checked) => handleAuditoriaChange('alertaAcoesCriticas', checked)}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="history-limit">Período de Retenção</Label>
                            <Select
                              value={limiteHistorico}
                              onValueChange={setLimiteHistorico}
                            >
                              <SelectTrigger id="history-limit" className="border-amber-200 focus:border-amber-400">
                                <SelectValue placeholder="Selecione o período" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 dias</SelectItem>
                                <SelectItem value="30">30 dias</SelectItem>
                                <SelectItem value="60">60 dias</SelectItem>
                                <SelectItem value="90">90 dias</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end">
                            <Button 
                              variant="outline" 
                              onClick={exportarHistorico}
                              disabled={loadingLogs}
                              className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
                            >
                              {loadingLogs ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                              Exportar Logs
                            </Button>
                          </div>
                          <div className="flex items-end">
                            <Button 
                              variant="outline" 
                              onClick={limparHistorico}
                              disabled={loadingLogs}
                              className="w-full border-red-200 text-red-700 hover:bg-red-50"
                            >
                              {loadingLogs ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                              Limpar Logs Antigos
                            </Button>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div>
                          <h3 className="font-medium mb-2 text-amber-800">Histórico de Acessos Recentes</h3>
                          <div className="border rounded-md divide-y border-amber-200">
                            {carregandoHistorico ? (
                              <div className="p-8 flex justify-center items-center">
                                <Loader2 className="h-6 w-6 animate-spin text-amber-600 mr-2" />
                                <span className="text-muted-foreground">Carregando registros...</span>
                              </div>
                            ) : historicoAcessos.length > 0 ? (
                              historicoAcessos.map((item, index) => (
                                <div key={item.id || index} className="p-3 text-sm">
                                  <div className="flex justify-between mb-1">
                                    <span className="font-medium">{item.username}</span>
                                    <span className="text-muted-foreground">{item.created_at}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>{item.action}</span>
                                    <span className="text-muted-foreground text-xs">IP: {item.ip_address}</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-muted-foreground">
                                Nenhum registro de acesso encontrado
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button 
            onClick={salvarConfiguracoes} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Salvar Configurações de Segurança
          </Button>
        </>
      )}
    </div>
  );
});
