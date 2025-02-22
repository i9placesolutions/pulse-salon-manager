
import { Client } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Crown } from "lucide-react";

interface ClientListProps {
  clients: Partial<Client>[];
}

export function ClientList({ clients }: ClientListProps) {
  const handleWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {clients.map((client) => (
        <Card key={client.id} className="hover:bg-secondary/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {client.photo ? (
                  <img
                    src={client.photo}
                    alt={client.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-medium text-primary">
                      {client.name?.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{client.name}</h3>
                    {client.status === 'vip' && (
                      <Crown className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{client.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => client.phone && handleWhatsApp(client.phone)}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button variant="default">Ver Perfil</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
