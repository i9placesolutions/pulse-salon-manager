
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DangerZone() {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium">Desativar Estabelecimento</h3>
          <p className="text-sm text-muted-foreground">
            Temporariamente desativa seu estabelecimento na plataforma.
          </p>
          <Button variant="outline" className="mt-2">
            Desativar Estabelecimento
          </Button>
        </div>
        <div>
          <h3 className="font-medium">Excluir Conta</h3>
          <p className="text-sm text-muted-foreground">
            Permanentemente remove seu estabelecimento e todos os dados associados.
          </p>
          <Button variant="destructive" className="mt-2">
            Excluir Estabelecimento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
