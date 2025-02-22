
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
import { ServicePackage } from "@/types/service";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ServicePackageFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (pkg: Partial<ServicePackage>) => void;
  servicePackage?: ServicePackage;
}

export function ServicePackageForm({
  open,
  onOpenChange,
  onSubmit,
  servicePackage,
}: ServicePackageFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<ServicePackage>>(
    servicePackage || {
      name: "",
      description: "",
      services: [],
      discount: 0,
      status: "active",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    toast({
      title: servicePackage ? "Pacote atualizado" : "Pacote cadastrado",
      description: servicePackage
        ? "O pacote foi atualizado com sucesso!"
        : "O novo pacote foi cadastrado com sucesso!",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {servicePackage ? "Editar Pacote" : "Novo Pacote"}
          </DialogTitle>
          <DialogDescription>
            {servicePackage
              ? "Atualize as informações do pacote de serviços."
              : "Crie um novo pacote de serviços com desconto."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name">Nome do Pacote *</label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description">Descrição</label>
              <textarea
                id="description"
                className="min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="discount">Desconto (%) *</label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    discount: Number(e.target.value),
                  }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as 'active' | 'inactive',
                  }))
                }
                required
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              {servicePackage ? "Salvar Alterações" : "Criar Pacote"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
