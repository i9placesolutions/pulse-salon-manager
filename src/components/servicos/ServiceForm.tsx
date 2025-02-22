
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
import { Service } from "@/types/service";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ServiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (service: Partial<Service>) => void;
  service?: Service;
}

export function ServiceForm({ open, onOpenChange, onSubmit, service }: ServiceFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Service>>(
    service || {
      name: "",
      description: "",
      category: "",
      duration: 30,
      price: 0,
      status: "active",
      commission: {
        type: "percentage",
        value: 50,
      },
      professionals: [],
      products: [],
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    toast({
      title: service ? "Serviço atualizado" : "Serviço cadastrado",
      description: service
        ? "O serviço foi atualizado com sucesso!"
        : "O novo serviço foi cadastrado com sucesso!",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{service ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
          <DialogDescription>
            {service
              ? "Atualize as informações do serviço."
              : "Preencha as informações para cadastrar um novo serviço."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name">Nome do Serviço *</label>
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
                className="min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="category">Categoria *</label>
                <select
                  id="category"
                  className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, category: e.target.value }))
                  }
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="Corte">Corte</option>
                  <option value="Tintura">Tintura</option>
                  <option value="Tratamento">Tratamento</option>
                  <option value="Manicure">Manicure</option>
                  <option value="Estética">Estética</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="duration">Duração (minutos) *</label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  step="15"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration: Number(e.target.value),
                    }))
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="price">Preço *</label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: Number(e.target.value),
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
            <div className="grid gap-2">
              <label>Comissão</label>
              <div className="flex gap-4">
                <select
                  className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.commission?.type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      commission: {
                        ...prev.commission!,
                        type: e.target.value as 'fixed' | 'percentage',
                      },
                    }))
                  }
                >
                  <option value="percentage">Porcentagem</option>
                  <option value="fixed">Valor Fixo</option>
                </select>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.commission?.value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      commission: {
                        ...prev.commission!,
                        value: Number(e.target.value),
                      },
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              {service ? "Salvar Alterações" : "Cadastrar Serviço"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
