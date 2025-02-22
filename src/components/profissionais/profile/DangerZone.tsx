
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export function DangerZone() {
  return (
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
  );
}
