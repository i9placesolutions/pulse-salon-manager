
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Download, Upload, Archive } from "lucide-react";

export function ConfigBackup() {
  return (
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
  );
}
