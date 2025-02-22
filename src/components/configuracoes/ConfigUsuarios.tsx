
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export function ConfigUsuarios() {
  return (
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
  );
}
