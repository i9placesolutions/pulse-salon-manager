import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Lock,
  Bell,
  Shield,
  History,
  LogOut,
  Camera,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  SmartphoneNfc,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Laptop,
  Smartphone,
  Tablet,
  Eye,
  EyeOff
} from "lucide-react";

const connectedDevices = [
  {
    id: 1,
    device: "MacBook Pro",
    browser: "Chrome",
    ip: "192.168.1.1",
    lastActive: "2024-03-15T10:30:00",
    isCurrentSession: true,
    type: "laptop"
  },
  {
    id: 2,
    device: "iPhone 13",
    browser: "Safari",
    ip: "192.168.1.2",
    lastActive: "2024-03-14T15:45:00",
    isCurrentSession: false,
    type: "mobile"
  }
];

const activities = [
  {
    id: 1,
    action: "Login realizado",
    details: "Login via Chrome em MacBook Pro",
    date: "2024-03-15T10:30:00",
    ip: "192.168.1.1"
  },
  {
    id: 2,
    action: "Alteração de senha",
    details: "Senha alterada com sucesso",
    date: "2024-03-14T15:45:00",
    ip: "192.168.1.1"
  }
];

export default function Profile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral">Meu Perfil</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie suas informações pessoais e preferências
        </p>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="personal">
            <User className="h-4 w-4 mr-2" />
            Dados Pessoais
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Shield className="h-4 w-4 mr-2" />
            Permissões
          </TabsTrigger>
          <TabsTrigger value="activity">
            <History className="h-4 w-4 mr-2" />
            Atividades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>JP</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Alterar Foto
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" placeholder="Seu nome" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" placeholder="(00) 00000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input id="birthDate" type="date" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input id="address" placeholder="Seu endereço completo" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Autenticação de Dois Fatores</Label>
                      <p className="text-sm text-muted-foreground">
                        Adicione uma camada extra de segurança à sua conta
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="mr-2 h-4 w-4" />
                    Alterar Senha
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dispositivos Conectados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connectedDevices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {device.type === 'laptop' ? (
                          <Laptop className="h-8 w-8 text-muted-foreground" />
                        ) : (
                          <Smartphone className="h-8 w-8 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">{device.device}</p>
                          <p className="text-sm text-muted-foreground">
                            {device.browser} • {device.ip}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Último acesso: {new Date(device.lastActive).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {device.isCurrentSession ? (
                        <Badge>Sessão Atual</Badge>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-destructive">
                          Encerrar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por E-mail</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba atualizações importantes no seu e-mail
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por WhatsApp</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba mensagens importantes via WhatsApp
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações no Sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas dentro do sistema
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Permissões do Usuário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Acesso ao Financeiro</Label>
                    <p className="text-sm text-muted-foreground">
                      Visualizar e gerenciar informações financeiras
                    </p>
                  </div>
                  <Switch disabled />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Gerenciamento de Usuários</Label>
                    <p className="text-sm text-muted-foreground">
                      Criar e editar outros usuários do sistema
                    </p>
                  </div>
                  <Switch disabled />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Relatórios Avançados</Label>
                    <p className="text-sm text-muted-foreground">
                      Acessar relatórios detalhados e análises
                    </p>
                  </div>
                  <Switch disabled />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Configurações do Sistema</Label>
                    <p className="text-sm text-muted-foreground">
                      Modificar configurações gerais do sistema
                    </p>
                  </div>
                  <Switch disabled />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                * As permissões são definidas pelo administrador do sistema
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Detalhes</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        {new Date(activity.date).toLocaleString()}
                      </TableCell>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell>{activity.details}</TableCell>
                      <TableCell>{activity.ip}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <Button variant="outline">
                  <History className="mr-2 h-4 w-4" />
                  Ver Histórico Completo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Zona de Perigo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="destructive" className="w-full">
            Excluir Minha Conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
