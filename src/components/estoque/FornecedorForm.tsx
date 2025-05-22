
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Supplier } from "@/types/stock";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ReactInputMask from "react-input-mask";
import { X, Loader2 } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase
const supabaseUrl = "https://wtpmedifsfbxctlssefd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0cG1lZGlmc2ZieGN0bHNzZWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMTMwNzUsImV4cCI6MjA1OTg4OTA3NX0.Mmro8vKbusSP_HNCqX9f5XlrotRbeA8-HIGvQE07mwU";
const supabase = createClient(supabaseUrl, supabaseKey);

interface FornecedorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (supplier: Partial<Supplier>) => void;
  supplier?: Supplier;
}

export function FornecedorForm({
  open,
  onOpenChange,
  onSubmit,
  supplier,
}: FornecedorFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Supplier>>(
    supplier || {
      name: "",
      document: "",
      phone: "",
      email: "",
      address: "",
      status: "active",
    }
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Verifica campos obrigatórios
      if (!formData.name) {
        throw new Error("O nome do fornecedor é obrigatório");
      }
      
      let result;
      
      if (supplier?.id) {
        // Atualizar fornecedor existente
        const { data, error } = await supabase
          .from('suppliers')
          .update({
            name: formData.name,
            document: formData.document,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            status: formData.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', supplier.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      } else {
        // Criar novo fornecedor
        const { data, error } = await supabase
          .from('suppliers')
          .insert([
            {
              name: formData.name,
              document: formData.document,
              phone: formData.phone,
              email: formData.email,
              address: formData.address,
              status: formData.status || 'active'
            }
          ])
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      }
      
      // Chama o callback com os dados retornados do Supabase
      if (result) {
        onSubmit({
          ...result,
          id: result.id
        });
      }
      
      toast({
        title: supplier ? "Fornecedor atualizado" : "Fornecedor cadastrado",
        description: supplier
          ? "O fornecedor foi atualizado com sucesso!"
          : "O novo fornecedor foi cadastrado com sucesso!",
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao salvar fornecedor:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o fornecedor",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white rounded-lg shadow-lg">
        <DialogHeader className="p-6 border-b bg-gradient-to-r from-blue-500 to-blue-600">
          <DialogTitle className="text-xl font-bold text-white">
            {supplier ? "Editar Fornecedor" : "Novo Fornecedor"}
          </DialogTitle>
          <DialogDescription className="text-blue-100 mt-1">
            {supplier
              ? "Atualize as informações do fornecedor."
              : "Preencha as informações para cadastrar um novo fornecedor."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="font-medium text-gray-700">Nome</label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Nome do fornecedor"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="document" className="font-medium text-gray-700">CNPJ/CPF</label>
              <ReactInputMask
                mask={formData.document?.length > 11 ? "99.999.999/9999-99" : "999.999.999-99"}
                id="document"
                value={formData.document}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, document: e.target.value.replace(/[^0-9]/g, '') }))
                }
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
              >
                {(inputProps) => 
                  <Input 
                    {...inputProps} 
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                }
              </ReactInputMask>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="font-medium text-gray-700">Telefone</label>
              <ReactInputMask
                mask="(99) 99999-9999"
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value.replace(/[^0-9]/g, '') }))
                }
                placeholder="(00) 00000-0000"
              >
                {(inputProps) => 
                  <Input 
                    {...inputProps} 
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                }
              </ReactInputMask>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="font-medium text-gray-700">E-mail</label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="email@exemplo.com"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="address" className="font-medium text-gray-700">Endereço</label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                placeholder="Rua, número, bairro, cidade - UF"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {supplier ? "Salvando..." : "Cadastrando..."}
                </>
              ) : (
                supplier ? "Salvar Alterações" : "Cadastrar Fornecedor"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
