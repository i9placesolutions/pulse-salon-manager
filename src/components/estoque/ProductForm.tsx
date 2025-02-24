
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/stock";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{product ? "Editar Produto" : "Novo Produto"}</SheetTitle>
          <SheetDescription>
            {product
              ? "Atualize as informações do produto."
              : "Preencha as informações para cadastrar um novo produto."}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-4">
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
            <div className="space-y-4">
              <label className="font-medium">Comissão</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="commissionType">Tipo</label>
                  <select
                    id="commissionType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.commission?.type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        commission: {
                          ...prev.commission!,
                          type: e.target.value as 'percentage' | 'fixed',
                        },
                      }))
                    }
                  >
                    <option value="percentage">Porcentagem</option>
                    <option value="fixed">Valor Fixo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="commissionValue">Valor Padrão</label>
                  <Input
                    id="commissionValue"
                    type="number"
                    step="0.01"
                    value={formData.commission?.defaultValue}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        commission: {
                          ...prev.commission!,
                          defaultValue: Number(e.target.value),
                        },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Você poderá definir comissões específicas por profissional após salvar o produto.
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {product ? "Salvar Alterações" : "Cadastrar Produto"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
