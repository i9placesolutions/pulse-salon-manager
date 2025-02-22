
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Professional } from "@/types/professional";

interface ProfessionalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Professional>) => void;
  professional?: Professional;
}

export function ProfessionalForm({
  open,
  onOpenChange,
  onSubmit,
  professional,
}: ProfessionalFormProps) {
  const [formData, setFormData] = useState<Partial<Professional>>(
    professional || {
      name: "",
      email: "",
      phone: "",
      specialty: "",
      hiringDate: new Date().toISOString().split("T")[0],
      experienceLevel: "beginner",
      status: "active",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {professional ? "Editar Profissional" : "Novo Profissional"}
          </DialogTitle>
          <DialogDescription>
            {professional
              ? "Atualize os dados do profissional"
              : "Preencha os dados para cadastrar um novo profissional"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidade</Label>
              <Select
                value={formData.specialty}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, specialty: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cabeleireira">Cabeleireira</SelectItem>
                  <SelectItem value="Barbeiro">Barbeiro</SelectItem>
                  <SelectItem value="Manicure">Manicure</SelectItem>
                  <SelectItem value="Esteticista">Esteticista</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hiringDate">Data de Contratação</Label>
              <Input
                id="hiringDate"
                type="date"
                value={formData.hiringDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, hiringDate: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Nível de Experiência</Label>
              <Select
                value={formData.experienceLevel}
                onValueChange={(value: 'beginner' | 'intermediate' | 'expert') =>
                  setFormData((prev) => ({ ...prev, experienceLevel: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Iniciante</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="expert">Especialista</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              {professional ? "Salvar Alterações" : "Cadastrar Profissional"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
