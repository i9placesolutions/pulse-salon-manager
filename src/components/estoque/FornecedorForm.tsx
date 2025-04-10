
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    toast({
      title: supplier ? "Fornecedor atualizado" : "Fornecedor cadastrado",
      description: supplier
        ? "O fornecedor foi atualizado com sucesso!"
        : "O novo fornecedor foi cadastrado com sucesso!",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {supplier ? "Editar Fornecedor" : "Novo Fornecedor"}
          </DialogTitle>
          <DialogDescription>
            {supplier
              ? "Atualize as informações do fornecedor."
              : "Preencha as informações para cadastrar um novo fornecedor."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name">Nome</label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="document">CNPJ/CPF</label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, document: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone">Telefone</label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email">E-mail</label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="address">Endereço</label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              {supplier ? "Salvar Alterações" : "Cadastrar Fornecedor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
