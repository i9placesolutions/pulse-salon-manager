import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { FormCard } from "@/components/shared/FormCard";

export function DangerZone() {
  const title = (
    <div className="flex items-center gap-2 text-destructive">
      <AlertTriangle className="h-4 w-4" />
      Zona de Perigo
    </div>
  );

  return (
    <FormCard 
      title={title}
      className="border-destructive w-full mt-6"
    >
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground mb-4">
          Ações irreversíveis que afetam sua conta. Tenha cuidado.
        </p>
        <Button variant="destructive" className="w-full">
          Excluir Minha Conta
        </Button>
      </div>
    </FormCard>
  );
}
