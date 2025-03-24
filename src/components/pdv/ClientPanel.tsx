
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { Client } from "@/types/pdv";

interface ClientPanelProps {
  selectedClient: Client | null;
  onSelectClient: () => void;
}

export function ClientPanel({ selectedClient, onSelectClient }: ClientPanelProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Cliente</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectClient}
          >
            <User className="mr-2 h-4 w-4" />
            {selectedClient ? "Trocar" : "Selecionar"}
          </Button>
        </div>
        
        {selectedClient ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{selectedClient.name}</span>
            </div>
            {selectedClient.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{selectedClient.phone}</span>
              </div>
            )}
            {selectedClient.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{selectedClient.email}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-md">
            <User className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground text-sm mb-2">
              Nenhum cliente selecionado
            </p>
            <Button
              size="sm"
              onClick={onSelectClient}
            >
              Selecionar Cliente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
