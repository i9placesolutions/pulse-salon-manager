
import { useState } from "react";
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
import { AlertCircle, Lock, Shield, Eye, EyeOff, Clock, UserCog, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type HistoricoAcesso = {
  usuario: string;
  data: string;
  acao: string;
  ip: string;
};

export function ConfigSeguranca() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [limiteHistorico, setLimiteHistorico] = useState("30");
  const [historicoAcessos, setHistoricoAcessos] = useState<HistoricoAcesso[]>([
    { usuario: "Rafael Mendes", data: "09/03/2025 15:42", acao: "Login no sistema", ip: "189.28.45.72" },
    { usuario: "Ana Silva", data: "09/03/2025 14:30", acao: "Alteração de permissões", ip: "189.28.45.73" },
    { usuario: "Carlos Oliveira", data: "09/03/2025 11:15", acao: "Exportação de relatório financeiro", ip: "201.18.65.43" },
    { usuario: "Mariana Santos", data: "08/03/2025 18:25", acao: "Acesso aos dados de clientes", ip: "189.28.45.72" },
    { usuario: "Rafael Mendes", data: "08/03/2025 10:10", acao: "Alteração de configurações", ip: "179.125.87.34" },
  ]);

  const salvarConfiguracoes = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações de segurança foram atualizadas com sucesso."
    });
  };



  const limparHistorico = () => {
    setHistoricoAcessos([]);
    toast({
      title: "Histórico limpo",
      description: "O histórico de acessos foi limpo com sucesso."
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="autenticacao" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="autenticacao">Autenticação</TabsTrigger>
          <TabsTrigger value="privacidade">Privacidade</TabsTrigger>
          <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
        </TabsList>

        {/* Aba de Autenticação */}
        <TabsContent value="autenticacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" /> Políticas de Autenticação
              </CardTitle>
              <CardDescription>
                Configure as políticas de segurança de acesso ao sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium">Autenticação de Dois Fatores</Label>
                    <p className="text-sm text-muted-foreground">
                      Exigir verificação em dois fatores para todos os usuários
                    </p>
                  </div>
                  <Switch id="two-factor" />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium">Política de Senhas Fortes</Label>
                    <p className="text-sm text-muted-foreground">
                      Exigir senhas com pelo menos 8 caracteres, incluindo letras, números e símbolos
                    </p>
                  </div>
                  <Switch id="strong-password" defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium">Bloqueio de Tentativas</Label>
                    <p className="text-sm text-muted-foreground">
                      Bloquear acesso após 5 tentativas falhas de login
                    </p>
                  </div>
                  <Switch id="login-attempt" defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium">Expiração de Senha</Label>
                    <p className="text-sm text-muted-foreground">
                      Solicitar troca de senha a cada 60 dias
                    </p>
                  </div>
                  <Switch id="password-expiry" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Privacidade */}
        <TabsContent value="privacidade" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> Privacidade e Proteção de Dados
              </CardTitle>
              <CardDescription>
                Defina como o sistema gerencia os dados pessoais conforme a LGPD
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium">Anonimização de Dados</Label>
                    <p className="text-sm text-muted-foreground">
                      Anonimizar dados pessoais em relatórios e exportações
                    </p>
                  </div>
                  <Switch id="anonymize-data" defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium">Termo de Consentimento</Label>
                    <p className="text-sm text-muted-foreground">
                      Exigir aceitação do termo de uso de dados ao cadastrar novos clientes
                    </p>
                  </div>
                  <Switch id="consent-term" defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium">Exclusão Automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Excluir dados de clientes inativos após 5 anos
                    </p>
                  </div>
                  <Switch id="auto-delete" />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium">Mascaramento de Cartão</Label>
                    <p className="text-sm text-muted-foreground">
                      Exibir apenas os últimos 4 dígitos de cartões de crédito
                    </p>
                  </div>
                  <Switch id="card-masking" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>



        {/* Aba de Auditoria */}
        <TabsContent value="auditoria" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Logs e Auditoria
              </CardTitle>
              <CardDescription>
                Monitore ações realizadas no sistema e configure políticas de log
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium">Registro de Acesso a Dados Sensíveis</Label>
                    <p className="text-sm text-muted-foreground">
                      Registrar quem acessou informações de pagamentos e dados pessoais
                    </p>
                  </div>
                  <Switch id="sensitive-data-log" defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-medium">Alerta de Ações Críticas</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar administradores sobre exclusões e alterações massivas
                    </p>
                  </div>
                  <Switch id="critical-action-alert" defaultChecked />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="history-limit">Período de Retenção</Label>
                    <Select
                      value={limiteHistorico}
                      onValueChange={setLimiteHistorico}
                    >
                      <SelectTrigger id="history-limit">
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
                    <Button variant="outline" onClick={limparHistorico} className="w-full">
                      Limpar Histórico
                    </Button>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <h3 className="font-medium mb-2">Histórico de Acessos Recentes</h3>
                  <div className="border rounded-md divide-y">
                    {historicoAcessos.length > 0 ? (
                      historicoAcessos.map((item, index) => (
                        <div key={index} className="p-3 text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{item.usuario}</span>
                            <span className="text-muted-foreground">{item.data}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{item.acao}</span>
                            <span className="text-muted-foreground text-xs">IP: {item.ip}</span>
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
        </TabsContent>
      </Tabs>

      <Button onClick={salvarConfiguracoes} className="w-full">
        Salvar Todas as Configurações de Segurança
      </Button>
    </div>
  );
}
