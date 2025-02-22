import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Store, 
  MessageSquare, 
  Users, 
  CreditCard, 
  FileText, 
  Shield, 
  Cloud,
  Save,
  Undo,
  Phone,
  Mail,
  Calendar,
  Bell,
  Download,
  Upload,
  Archive
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Configuracoes() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    // Implementar lógica de salvamento
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral">Configurações</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie as configurações do seu salão
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => {}}>
            <Undo className="mr-2 h-4 w-4" />
            Restaurar Padrões
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      <Tabs defaultValue="geral" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          <TabsTrigger value="geral">
            <Settings className="h-4 w-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="usuarios">
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="mensagens">
            <MessageSquare className="h-4 w-4 mr-2" />
            Mensagens
          </TabsTrigger>
          <TabsTrigger value="pagamentos">
            <CreditCard className="h-4 w-4 mr-2" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="relatorios">
            <FileText className="h-4 w-4 mr-2" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="seguranca">
            <Shield className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="backup">
            <Cloud className="h-4 w-4 mr-2" />
            Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Salão</CardTitle>
              <CardDescription>
                Configure as informações básicas do seu estabelecimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome do Salão</Label>
                  <Input id="name" placeholder="Digite o nome do seu salão" />
                </div>
                <div className="grid gap-2">
                  <Label>Logo do Salão</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                      <Button variant="ghost" className="h-full w-full">
                        Upload
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Contatos</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <Input placeholder="Telefone do salão" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <Input placeholder="E-mail do salão" />
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Tema do Sistema</Label>
                  <div className="flex items-center space-x-2">
                    <Switch id="dark-mode" />
                    <Label htmlFor="dark-mode">Modo Escuro</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horário de Funcionamento</CardTitle>
              <CardDescription>
                Configure os horários de atendimento do seu salão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((dia) => (
                  <div key={dia} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch id={`dia-${dia}`} />
                      <Label htmlFor={`dia-${dia}`}>{dia}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input type="time" className="w-24" />
                      <span>às</span>
                      <Input type="time" className="w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conexão WhatsApp</CardTitle>
              <CardDescription>
                Configure a integração com o WhatsApp para envio de mensagens automáticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="apiToken">Token da API Uazapi</Label>
                  <Input id="apiToken" type="password" placeholder="Digite seu token da API" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm">Desconectado</span>
                </div>
                <Button variant="secondary">Conectar WhatsApp</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mensagens Automáticas</CardTitle>
              <CardDescription>
                Configure mensagens automáticas para seus clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Confirmação de Agendamento</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar mensagem quando um novo agendamento for realizado
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lembrete de Agendamento</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar lembrete 24h antes do horário marcado
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Aniversário</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar mensagem de felicitação no aniversário do cliente
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Autenticação</CardTitle>
              <CardDescription>
                Configure as políticas de segurança do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticação de Dois Fatores</Label>
                    <p className="text-sm text-muted-foreground">
                      Exigir 2FA para todos os usuários
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Senha Forte</Label>
                    <p className="text-sm text-muted-foreground">
                      Exigir senhas com números, letras e caracteres especiais
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backup Automático</CardTitle>
              <CardDescription>
                Configure a frequência dos backups do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Frequência</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Realizar backup automático do sistema
                    </p>
                  </div>
                  <Switch />
                </div>
                <Button variant="secondary" className="w-full">
                  Fazer Backup Manual
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Configure as permissões e acesso dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-end">
                <Button>
                  <Users className="mr-2 h-4 w-4" />
                  Adicionar Usuário
                </Button>
              </div>
              
              <div className="space-y-4">
                {[
                  { nome: 'João Silva', cargo: 'Administrador', email: 'joao@exemplo.com', status: 'Ativo' },
                  { nome: 'Maria Santos', cargo: 'Profissional', email: 'maria@exemplo.com', status: 'Ativo' },
                  { nome: 'Pedro Costa', cargo: 'Recepcionista', email: 'pedro@exemplo.com', status: 'Inativo' }
                ].map((usuario, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{usuario.nome}</p>
                      <p className="text-sm text-muted-foreground">{usuario.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={usuario.status === 'Ativo' ? 'default' : 'secondary'}>
                        {usuario.status}
                      </Badge>
                      <p className="text-sm">{usuario.cargo}</p>
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mensagens">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Mensagens</CardTitle>
              <CardDescription>
                Configure os modelos de mensagens automáticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {[
                  {
                    titulo: 'Confirmação de Agendamento',
                    descricao: 'Mensagem enviada após confirmar um horário',
                    variaveis: ['nome_cliente', 'data_horario', 'servico']
                  },
                  {
                    titulo: 'Lembrete de Consulta',
                    descricao: 'Mensagem enviada 24h antes do horário',
                    variaveis: ['nome_cliente', 'data_horario', 'profissional']
                  },
                  {
                    titulo: 'Aniversário',
                    descricao: 'Mensagem de felicitação de aniversário',
                    variaveis: ['nome_cliente', 'cupom_desconto']
                  }
                ].map((template, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{template.titulo}</h4>
                        <p className="text-sm text-muted-foreground">{template.descricao}</p>
                      </div>
                      <Button variant="outline" size="sm">Editar</Button>
                    </div>
                    <div>
                      <Label>Variáveis disponíveis</Label>
                      <div className="flex gap-2 mt-2">
                        {template.variaveis.map((variavel, idx) => (
                          <Badge key={idx} variant="secondary">
                            {variavel}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagamentos">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pagamento</CardTitle>
                <CardDescription>
                  Configure as formas de pagamento aceitas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { metodo: 'Dinheiro', taxa: '0%' },
                  { metodo: 'Cartão de Débito', taxa: '2%' },
                  { metodo: 'Cartão de Crédito', taxa: '3%' },
                  { metodo: 'PIX', taxa: '1%' }
                ].map((pagamento, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch id={`pagamento-${index}`} />
                      <div>
                        <Label htmlFor={`pagamento-${index}`}>{pagamento.metodo}</Label>
                        <p className="text-sm text-muted-foreground">Taxa: {pagamento.taxa}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Parcelamento</CardTitle>
                <CardDescription>
                  Configure as opções de parcelamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Número máximo de parcelas</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>1x</option>
                    <option>2x</option>
                    <option>3x</option>
                    <option>4x</option>
                    <option>5x</option>
                    <option>6x</option>
                    <option>12x</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Valor mínimo para parcelamento</Label>
                  <Input type="number" placeholder="R$ 0,00" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="juros" />
                  <Label htmlFor="juros">Cobrar juros no parcelamento</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="relatorios">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Relatórios</CardTitle>
                <CardDescription>
                  Personalize seus relatórios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Relatório Diário</Label>
                      <p className="text-sm text-muted-foreground">
                        Resumo do dia anterior
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Relatório Semanal</Label>
                      <p className="text-sm text-muted-foreground">
                        Resumo da semana anterior
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Relatório Mensal</Label>
                      <p className="text-sm text-muted-foreground">
                        Resumo do mês anterior
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Destinatários</CardTitle>
                <CardDescription>
                  Quem receberá os relatórios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>E-mails</Label>
                    <Input placeholder="Digite os e-mails separados por vírgula" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="export-pdf" />
                    <Label htmlFor="export-pdf">Exportar como PDF</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="export-excel" />
                    <Label htmlFor="export-excel">Exportar como Excel</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backup">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Backup e Restauração</CardTitle>
                <CardDescription>
                  Gerencie os backups do seu sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Frequência do Backup</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="daily">Diário</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Backup Automático</Label>
                      <p className="text-sm text-muted-foreground">
                        Realizar backup automático do sistema
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="grid gap-2">
                    <Label>Local de Armazenamento</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="local">Armazenamento Local</option>
                      <option value="cloud">Nuvem</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações de Backup</CardTitle>
                <CardDescription>
                  Execute ações de backup e restauração
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Button className="w-full" variant="secondary">
                    <Download className="mr-2 h-4 w-4" />
                    Fazer Backup Agora
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Restaurar Backup
                  </Button>
                  <div className="space-y-2">
                    <Label>Backups Anteriores</Label>
                    <div className="space-y-2">
                      {[
                        { data: '2024-03-10 09:00', tamanho: '25MB' },
                        { data: '2024-03-09 09:00', tamanho: '24MB' },
                        { data: '2024-03-08 09:00', tamanho: '25MB' }
                      ].map((backup, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <Archive className="h-4 w-4" />
                            <span className="text-sm">{backup.data}</span>
                            <Badge variant="secondary">{backup.tamanho}</Badge>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
