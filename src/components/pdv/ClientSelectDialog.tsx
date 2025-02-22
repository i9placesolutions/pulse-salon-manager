
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronsRight } from "lucide-react";

interface Client {
  id: number;
  name: string;
  phone: string;
}

interface ClientSelectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  onSelect: (client: Client) => void;
}

export function ClientSelectDialog({
  isOpen,
  onOpenChange,
  clients,
  onSelect,
}: ClientSelectDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selecionar Cliente</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Buscar cliente..."
            className="w-full"
          />
          
          <div className="space-y-2">
            {clients.map((client) => (
              <Card 
                key={client.id}
                className="cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => {
                  onSelect(client);
                  onOpenChange(false);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{client.name}</h3>
                      <p className="text-sm text-muted-foreground">{client.phone}</p>
                    </div>
                    <Button size="icon" variant="ghost">
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
