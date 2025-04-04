
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { FormCard } from "@/components/shared/FormCard";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

export function PersonalInfo() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isProfessional, setIsProfessional] = useState(false);
  const [role, setRole] = useState('user');
  
  // Efeito para garantir que o checkbox seja marcado quando "professional" é selecionado
  useEffect(() => {
    if (role === 'professional') {
      setIsProfessional(true);
    }
  }, [role]);
  
  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    // Quando o cargo "professional" é selecionado, marca automaticamente o checkbox
    if (newRole === 'professional') {
      setIsProfessional(true);
    }
  };
  
  const handleSave = () => {
    setIsSaving(true);
    
    // Simulação de salvamento
    setTimeout(() => {
      setIsSaving(false);
      
      // Mostrar mensagem de sucesso
      toast({
        variant: "success",
        title: "Perfil editado com sucesso!",
        description: "As alterações foram salvas.",
        className: "shadow-xl",
      });
    }, 1000);
  };

  return (
    <FormCard 
      title="Informações Pessoais"
      footer={
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              Salvando...
            </>
          ) : (
            "Salvar Alterações"
          )}
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-8">
        <div className="flex flex-col items-center gap-2 mb-4 sm:mb-0">
          <Avatar className="h-24 w-24">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>JP</AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm">
            <Camera className="h-4 w-4 mr-2" />
            Alterar Foto
          </Button>
        </div>
        
        <div className="grid gap-4 w-full">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" placeholder="Seu nome" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input id="birthDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Cargo</Label>
              <select 
                id="role"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={role}
                onChange={(e) => handleRoleChange(e.target.value)}
              >
                <option value="admin">Administrador</option>
                <option value="manager">Gerente</option>
                <option value="professional">Profissional</option>
                <option value="receptionist">Recepcionista</option>
                <option value="user">Usuário</option>
              </select>
            </div>
            <div className="space-y-2 flex items-center pt-6">
              <Checkbox 
                id="isProfessional" 
                checked={isProfessional} 
                onCheckedChange={(checked) => setIsProfessional(checked as boolean)}
                className="mr-2" 
              />
              <Label htmlFor="isProfessional" className="cursor-pointer">
                Este usuário é um profissional do salão
              </Label>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" placeholder="Seu endereço completo" />
            </div>
          </div>
        </div>
      </div>
    </FormCard>
  );
}
