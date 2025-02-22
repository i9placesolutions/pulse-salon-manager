
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
  Undo
} from "lucide-react";

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
              {/* Implementar grade de horários */}
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
        </TabsContent>

        {/* Outras abas serão implementadas conforme necessário */}
        <TabsContent value="usuarios">
          {/* Implementar gerenciamento de usuários */}
        </TabsContent>

        <TabsContent value="mensagens">
          {/* Implementar templates de mensagens */}
        </TabsContent>

        <TabsContent value="pagamentos">
          {/* Implementar configurações de pagamento */}
        </TabsContent>

        <TabsContent value="relatorios">
          {/* Implementar configurações de relatórios */}
        </TabsContent>

        <TabsContent value="seguranca">
          {/* Implementar configurações de segurança */}
        </TabsContent>

        <TabsContent value="backup">
          {/* Implementar configurações de backup */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
