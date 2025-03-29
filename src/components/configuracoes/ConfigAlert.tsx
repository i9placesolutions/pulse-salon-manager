
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function ConfigAlert() {
  return (
    <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-indigo-200 mb-6 shadow-sm">
      <AlertCircle className="h-4 w-4 text-indigo-600" />
      <AlertDescription className="text-sm text-indigo-700 font-medium">
        Todas as alterações realizadas nas configurações são armazenadas temporariamente até que você clique em "Salvar Alterações".
      </AlertDescription>
    </Alert>
  );
}
