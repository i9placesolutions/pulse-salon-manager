
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
import { Product } from "@/types/stock";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (product: Partial<Product>) => void;
  product?: Product;
}

export function ProductForm({ open, onOpenChange, onSubmit, product }: ProductFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      name: "",
      description: "",
      category: "",
      measurementUnit: "unit",
      purchasePrice: 0,
      salePrice: 0,
      quantity: 0,
      minQuantity: 0,
      commission: {
        type: "percentage",
        defaultValue: 0,
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    toast({
      title: product ? "Produto atualizado" : "Produto cadastrado",
      description: product
        ? "O produto foi atualizado com sucesso!"
        : "O novo produto foi cadastrado com sucesso!",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          <DialogDescription>
            {product
              ? "Atualize as informações do produto."
              : "Preencha as informações para cadastrar um novo produto."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name">Nome do Produto</label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description">Descrição</label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category">Categoria</label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="measurementUnit">Unidade de Medida</label>
                <select
                  id="measurementUnit"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.measurementUnit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      measurementUnit: e.target.value as Product["measurementUnit"],
                    }))
                  }
                >
                  <option value="unit">Unidade</option>
                  <option value="grams">Gramas</option>
                  <option value="milliliters">Mililitros</option>
                  <option value="package">Pacote</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="measurementValue">Valor da Medida</label>
                <Input
                  id="measurementValue"
                  type="number"
                  value={formData.measurementValue}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      measurementValue: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="purchasePrice">Preço de Compra</label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      purchasePrice: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="salePrice">Preço de Venda</label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      salePrice: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="quantity">Quantidade</label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="minQuantity">Quantidade Mínima</label>
                <Input
                  id="minQuantity"
                  type="number"
                  value={formData.minQuantity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      minQuantity: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="commission">Comissão Padrão (%)</label>
              <Input
                id="commission"
                type="number"
                step="0.1"
                value={formData.commission?.defaultValue}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    commission: {
                      type: "percentage",
                      defaultValue: Number(e.target.value),
                    },
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              {product ? "Salvar Alterações" : "Cadastrar Produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
