import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FormCard } from "@/components/shared/FormCard";

interface Activity {
  id: number;
  action: string;
  details: string;
  date: string;
  ip: string;
}

const activities: Activity[] = [
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

export function ActivityHistory() {
  const headerActions = (
    <div className="flex gap-2">
      <Button variant="outline" size="sm">
        PDF
      </Button>
      <Button variant="outline" size="sm">
        Excel
      </Button>
    </div>
  );

  return (
    <FormCard 
      title="Histórico de Atividades"
      action={headerActions}
    >
      <div className="space-y-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input type="date" placeholder="Data Inicial" />
          <Input type="date" placeholder="Data Final" />
          <select className="w-full p-2 border rounded-md">
            <option value="">Todos os tipos</option>
            <option value="login">Login</option>
            <option value="security">Segurança</option>
            <option value="profile">Perfil</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
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
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Mostrando 10 de 50 registros
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Anterior</Button>
          <Button variant="outline" size="sm">Próxima</Button>
        </div>
      </div>
    </FormCard>
  );
}
