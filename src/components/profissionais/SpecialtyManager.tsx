import { useState } from "react";
import { ProfessionalSpecialty } from "@/types/professional";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Check, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Cores predefinidas para especialidades
const SPECIALTY_COLORS = [
  "#db2777", // Rosa
  "#8884d8", // Roxo
  "#82ca9d", // Verde
  "#ffc658", // Amarelo
  "#ff8042", // Laranja
  "#4dabf5", // Azul
  "#f06292", // Rosa escuro
];

interface SpecialtyManagerProps {
  specialties: ProfessionalSpecialty[];
  onSpecialtiesChange: (specialties: ProfessionalSpecialty[]) => void;
}

export function SpecialtyManager({ specialties, onSpecialtiesChange }: SpecialtyManagerProps) {
  const [newSpecialtyName, setNewSpecialtyName] = useState("");
  const [editingSpecialty, setEditingSpecialty] = useState<ProfessionalSpecialty | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleAddSpecialty = () => {
    // Validar nome da especialidade
    if (!newSpecialtyName.trim()) {
      setError("O nome da especialidade é obrigatório");
      return;
    }

    // Verificar se já existe uma especialidade com o mesmo nome
    if (specialties.some(s => s.name.toLowerCase() === newSpecialtyName.trim().toLowerCase())) {
      setError("Já existe uma especialidade com este nome");
      return;
    }

    // Criar nova especialidade
    const newSpecialty: ProfessionalSpecialty = {
      id: String(Date.now()), // Convert to string
      name: newSpecialtyName.trim(),
      color: SPECIALTY_COLORS[specialties.length % SPECIALTY_COLORS.length],
      isActive: true,
    };

    // Adicionar à lista
    onSpecialtiesChange([...specialties, newSpecialty]);
    setNewSpecialtyName("");
    setError("");
    setIsDialogOpen(false);

    toast({
      title: "Especialidade adicionada",
      description: `A especialidade "${newSpecialty.name}" foi adicionada com sucesso.`,
    });
  };

  const handleUpdateSpecialty = () => {
    if (!editingSpecialty) return;

    // Validar nome da especialidade
    if (!editingSpecialty.name.trim()) {
      setError("O nome da especialidade é obrigatório");
      return;
    }

    // Verificar se já existe outra especialidade com o mesmo nome
    if (specialties.some(s => 
      s.id !== editingSpecialty.id && 
      s.name.toLowerCase() === editingSpecialty.name.trim().toLowerCase()
    )) {
      setError("Já existe uma especialidade com este nome");
      return;
    }

    // Atualizar a especialidade
    const updatedSpecialties = specialties.map(s => 
      s.id === editingSpecialty.id ? { ...editingSpecialty, name: editingSpecialty.name.trim() } : s
    );

    onSpecialtiesChange(updatedSpecialties);
    setEditingSpecialty(null);
    setError("");
    setIsDialogOpen(false);

    toast({
      title: "Especialidade atualizada",
      description: `A especialidade foi atualizada com sucesso.`,
    });
  };

  const handleDeleteSpecialty = (specialty: ProfessionalSpecialty) => {
    const updatedSpecialties = specialties.filter(s => s.id !== specialty.id);
    onSpecialtiesChange(updatedSpecialties);

    toast({
      title: "Especialidade removida",
      description: `A especialidade "${specialty.name}" foi removida com sucesso.`,
    });
  };

  const handleToggleActive = (specialty: ProfessionalSpecialty) => {
    const updatedSpecialties = specialties.map(s => 
      s.id === specialty.id ? { ...s, isActive: !s.isActive } : s
    );
    onSpecialtiesChange(updatedSpecialties);

    toast({
      title: specialty.isActive ? "Especialidade desativada" : "Especialidade ativada",
      description: `A especialidade "${specialty.name}" foi ${specialty.isActive ? "desativada" : "ativada"} com sucesso.`,
    });
  };

  const startEditSpecialty = (specialty: ProfessionalSpecialty) => {
    setEditingSpecialty({ ...specialty });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Especialidades</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              onClick={() => {
                setEditingSpecialty(null);
                setNewSpecialtyName("");
                setError("");
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> 
              Nova Especialidade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSpecialty ? "Editar Especialidade" : "Nova Especialidade"}
              </DialogTitle>
              <DialogDescription>
                {editingSpecialty 
                  ? "Edite o nome da especialidade."
                  : "Adicione uma nova especialidade ao sistema."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="specialtyName">Nome da Especialidade *</Label>
                <Input
                  id="specialtyName"
                  value={editingSpecialty ? editingSpecialty.name : newSpecialtyName}
                  onChange={(e) => 
                    editingSpecialty 
                      ? setEditingSpecialty({ ...editingSpecialty, name: e.target.value })
                      : setNewSpecialtyName(e.target.value)
                  }
                  placeholder="Ex: Cabeleireiro, Manicure, Barbeiro..."
                />
                {error && (
                  <div className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={editingSpecialty ? handleUpdateSpecialty : handleAddSpecialty}>
                {editingSpecialty ? "Atualizar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {specialties.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Especialidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {specialties.map((specialty) => (
              <TableRow key={specialty.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: specialty.color }}
                    />
                    <span>{specialty.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      specialty.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {specialty.isActive ? "Ativo" : "Inativo"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditSpecialty(specialty)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(specialty)}
                    >
                      {specialty.isActive ? (
                        <X className="h-4 w-4 text-destructive" />
                      ) : (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSpecialty(specialty)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          Nenhuma especialidade cadastrada. Clique em "Nova Especialidade" para adicionar.
        </div>
      )}
    </div>
  );
}
