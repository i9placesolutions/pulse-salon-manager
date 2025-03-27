import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, User, UserPlus } from "lucide-react";

// Cliente
interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  ultimaVisita: string;
  cashbackDisponivel: number;
  cupons: { id: string; descricao: string; valor: number }[];
}

interface SelecionarClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClienteSelecionado: (cliente: Cliente) => void;
}

export function SelecionarClienteModal({ isOpen, onClose, onClienteSelecionado }: SelecionarClienteModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Dados mockados para simulação
  const clientes: Cliente[] = [
    {
      id: "c1",
      nome: "Maria Silva",
      telefone: "(11) 98765-4321",
      ultimaVisita: "15/03/2024",
      cashbackDisponivel: 35.75,
      cupons: [{ id: "cp1", descricao: "Aniversário", valor: 50 }]
    },
    {
      id: "c2",
      nome: "João Pereira",
      telefone: "(11) 98765-1234",
      ultimaVisita: "10/03/2024",
      cashbackDisponivel: 20.50,
      cupons: []
    },
    {
      id: "c3",
      nome: "Ana Souza",
      telefone: "(11) 97654-3210",
      ultimaVisita: "05/03/2024",
      cashbackDisponivel: 0,
      cupons: [{ id: "cp2", descricao: "Primeira visita", valor: 20 }]
    },
    {
      id: "c4",
      nome: "Carlos Oliveira",
      telefone: "(11) 91234-5678",
      ultimaVisita: "20/02/2024",
      cashbackDisponivel: 15.25,
      cupons: []
    },
    {
      id: "c5",
      nome: "Amanda Costa",
      telefone: "(11) 99876-5432",
      ultimaVisita: "25/02/2024",
      cashbackDisponivel: 42.30,
      cupons: [{ id: "cp3", descricao: "Cliente fiel", valor: 30 }]
    }
  ];

  // Filtra clientes pela busca
  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone.includes(searchTerm)
  );

  // Formata valor em moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Selecionar Cliente</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <ScrollArea className="h-[320px]">
            <div className="space-y-2">
              {clientesFiltrados.map((cliente) => (
                <div 
                  key={cliente.id}
                  className="flex flex-col p-4 rounded-lg border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50 transition-colors cursor-pointer"
                  onClick={() => onClienteSelecionado(cliente)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-medium">{cliente.nome}</h3>
                    <div className="flex flex-shrink-0 gap-2">
                      {cliente.cashbackDisponivel > 0 && (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 whitespace-nowrap">
                          Cashback: {formatCurrency(cliente.cashbackDisponivel)}
                        </Badge>
                      )}
                      {cliente.cupons.length > 0 && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 whitespace-nowrap">
                          {cliente.cupons.length} cupom(ns)
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2 text-sm text-gray-600">
                    <span>{cliente.telefone}</span>
                    <div className="flex items-center">
                      <span className="w-1 h-1 rounded-full bg-gray-400 mx-1"></span>
                      <span>Última visita: {cliente.ultimaVisita}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {clientesFiltrados.length === 0 && (
                <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Nenhum cliente encontrado</p>
                  <div className="mt-4">
                    <Button className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Cadastrar Novo Cliente
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 