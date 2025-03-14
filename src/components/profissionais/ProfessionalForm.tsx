import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Professional, ProfessionalSpecialty } from "@/types/professional";
import { SpecialtySelector } from "./SpecialtySelector";
import { SpecialtyManager } from "./SpecialtyManager";
import { useSpecialties } from "@/contexts/SpecialtiesContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfessionalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Professional>) => void;
  professional?: Professional;
}

export const ProfessionalForm = ({ open, onOpenChange, onSubmit, professional }: ProfessionalFormProps) => {
  const { specialties } = useSpecialties();
  const [activeTab, setActiveTab] = useState("info");
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
  const [showSpecialtyManager, setShowSpecialtyManager] = useState(false);

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

    if (!formData.specialties || formData.specialties.length === 0) {
      errors.specialties = "Pelo menos uma especialidade é obrigatória";
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

  const handleSpecialtiesChange = (selectedSpecialties: ProfessionalSpecialty[]) => {
    setFormData({ ...formData, specialties: selectedSpecialties });
    
    // Limpar erro de especialidades se agora há pelo menos uma selecionada
    if (selectedSpecialties.length > 0 && formErrors.specialties) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.specialties;
        return newErrors;
      });
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
            Preencha os dados do profissional. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informações Básicas</TabsTrigger>
            <TabsTrigger value="specialties">Especialidades</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
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

              <div className="space-y-2">
                <SpecialtySelector
                  availableSpecialties={specialties}
                  selectedSpecialties={formData.specialties || []}
                  onSpecialtiesChange={handleSpecialtiesChange}
                  onAddNewClick={() => setShowSpecialtyManager(true)}
                  isRequired={true}
                  error={formErrors.specialties}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="specialties">
            <div className="pt-4">
              <SpecialtyManager
                specialties={specialties}
                onSpecialtiesChange={() => {}} // Este será gerenciado pelo contexto global
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Diálogo para gerenciar especialidades */}
        <Dialog open={showSpecialtyManager} onOpenChange={setShowSpecialtyManager}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Gerenciar Especialidades</DialogTitle>
              <DialogDescription>
                Adicione, edite ou remova especialidades do sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <SpecialtyManager
                specialties={specialties}
                onSpecialtiesChange={() => {}} // Este será gerenciado pelo contexto global
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setShowSpecialtyManager(false)}>Fechar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};
