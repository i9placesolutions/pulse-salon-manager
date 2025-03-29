import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Professional, ProfessionalSpecialty } from "@/types/professional";
import { SpecialtySelector } from "./SpecialtySelector";
import { useSpecialties } from "@/contexts/SpecialtiesContext";

interface ProfessionalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Professional>) => void;
  professional?: Professional;
}

export const ProfessionalForm = ({ open, onOpenChange, onSubmit, professional }: ProfessionalFormProps) => {
  const { specialties } = useSpecialties();
  const [formData, setFormData] = useState<Partial<Professional>>(
    professional || {
      name: "",
      email: "",
      phone: "",
      specialty: "",
      specialties: [],
      hiringDate: new Date().toISOString().split('T')[0],
      experienceLevel: "beginner",
      status: "active",
    }
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      errors.name = "O nome é obrigatório";
    }

    if (!formData.email?.trim()) {
      errors.email = "O email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email inválido";
    }

    if (!formData.phone?.trim()) {
      errors.phone = "O telefone é obrigatório";
    }

    if (!formData.hiringDate) {
      errors.hiringDate = "A data de contratação é obrigatória";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Para compatibilidade, vamos usar a primeira especialidade como a principal
      if (formData.specialties && formData.specialties.length > 0) {
        formData.specialty = formData.specialties[0].name;
      }

      onSubmit(formData);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {professional ? "Editar Profissional" : "Novo Profissional"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados profissionais. As especialidades são gerenciadas na tela de Usuários.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={formErrors.name ? "border-destructive" : ""}
              />
              {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={formErrors.email ? "border-destructive" : ""}
              />
              {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                Telefone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={formErrors.phone ? "border-destructive" : ""}
              />
              {formErrors.phone && <p className="text-xs text-destructive">{formErrors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hiringDate">
                Data de Contratação <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hiringDate"
                type="date"
                value={formData.hiringDate || ""}
                onChange={(e) => setFormData({ ...formData, hiringDate: e.target.value })}
                className={formErrors.hiringDate ? "border-destructive" : ""}
              />
              {formErrors.hiringDate && <p className="text-xs text-destructive">{formErrors.hiringDate}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">
                Nível de Experiência <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.experienceLevel}
                onValueChange={(value: 'beginner' | 'intermediate' | 'expert') =>
                  setFormData({ ...formData, experienceLevel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Iniciante</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="expert">Especialista</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-2 text-sm text-muted-foreground border-t mt-4">
            <p className="mb-2 font-medium">Especialidades</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.specialties && formData.specialties.map((specialty) => (
                <div key={specialty.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border" style={{ backgroundColor: `${specialty.color}20`, borderColor: specialty.color, color: specialty.color }}>
                  {specialty.name}
                </div>
              ))}
              {(!formData.specialties || formData.specialties.length === 0) && (
                <p className="text-sm text-muted-foreground">Nenhuma especialidade definida. Edite o usuário em Configurações &gt; Usuários para gerenciar especialidades.</p>
              )}
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
              <p className="text-sm">
                <strong>Nota:</strong> Para gerenciar as especialidades do profissional, utilize a tela de Configurações &gt; Usuários.
                Edite o usuário correspondente e acesse a aba "Dados Profissionais".
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
