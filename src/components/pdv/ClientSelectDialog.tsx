import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Search, User, Phone, Mail, ChevronsRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Client {
  id: number;
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
}

interface ClientSelectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  onSelect: (client: Client) => void;
  isRequired?: boolean;
}

export function ClientSelectDialog({
  isOpen,
  onOpenChange,
  clients,
  onSelect,
  isRequired = false,
}: ClientSelectDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.phone.includes(searchTerm) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.cpf?.includes(searchTerm)
    );
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Selecionar Cliente
          </DialogTitle>
          <DialogDescription>
            {isRequired 
              ? "Selecione um cliente para criar o pedido" 
              : "Busque e selecione um cliente para o pedido"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone, email ou CPF..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {filteredClients.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">Nenhum cliente encontrado</p>
                </div>
              ) : (
                filteredClients.map((client) => (
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
                        <div className="space-y-1.5">
                          <h3 className="font-medium flex items-center gap-2">
                            {client.name}
                            {client.cpf && (
                              <span className="text-xs text-muted-foreground">
                                CPF: {client.cpf}
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5" />
                              {client.phone}
                            </span>
                            {client.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3.5 w-3.5" />
                                {client.email}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button size="icon" variant="ghost">
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
