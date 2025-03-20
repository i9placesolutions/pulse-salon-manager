
import { useState } from "react";
import { useToast } from "./use-toast";
import { Client } from "@/types/pdv";

export function useClientDialog() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);

  // Handle select client
  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    toast({
      title: "Cliente selecionado",
      description: `${client.name} foi selecionado para este pedido.`,
    });
  };

  return {
    selectedClient,
    setSelectedClient,
    isClientDialogOpen,
    setIsClientDialogOpen,
    handleSelectClient,
  };
}
