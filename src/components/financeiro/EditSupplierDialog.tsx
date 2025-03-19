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
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface Supplier {
  id: number;
  name: string;
  document: string;
  contact: string;
  phone: string;
  email: string;
  products: string[];
  lastPurchase: string;
  status: string;
  balance: number;
}

interface EditSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  onSave: (supplier: Supplier) => void;
}

export function EditSupplierDialog({ 
  open, 
  onOpenChange, 
  supplier,
  onSave
}: EditSupplierDialogProps) {
  const [formData, setFormData] = useState<Supplier | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (supplier) {
      setFormData({...supplier});
    }
  }, [supplier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    onSave(formData);
    toast({
      title: "Fornecedor atualizado",
      description: "As alterações foram salvas com sucesso.",
    });
    onOpenChange(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (value: string, field: string) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleProductsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!formData) return;
    
    const products = e.target.value.split(',').map(item => item.trim());
    setFormData({
      ...formData,
      products
    });
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Fornecedor</DialogTitle>
          <DialogDescription>
            Atualize as informações do fornecedor.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Nome da Empresa</label>
              <Input 
                id="name" 
                name="name"
                value={formData.name} 
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="document" className="text-sm font-medium">CNPJ/CPF</label>
              <Input 
                id="document" 
                name="document"
                value={formData.document} 
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact" className="text-sm font-medium">Contato</label>
              <Input 
                id="contact" 
                name="contact"
                value={formData.contact} 
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Telefone</label>
              <Input 
                id="phone" 
                name="phone"
                value={formData.phone} 
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">E-mail</label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                value={formData.email} 
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleSelectChange(value, "status")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="products" className="text-sm font-medium">Produtos (separados por vírgula)</label>
              <Textarea 
                id="products" 
                name="products"
                value={formData.products.join(', ')} 
                onChange={handleProductsChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
