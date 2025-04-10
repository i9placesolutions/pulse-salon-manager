
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export function ConfigBackup() {
  return (
    <div className="flex items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Recurso Indisponível</CardTitle>
          <CardDescription>
            Funcionalidade de backup em desenvolvimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            A funcionalidade de backup e restauração está temporariamente indisponível.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
