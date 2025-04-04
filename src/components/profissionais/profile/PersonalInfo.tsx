
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { FormCard } from "@/components/shared/FormCard";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { SystemUser } from "@/types/supabase";

export function PersonalInfo() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isProfessional, setIsProfessional] = useState(false);
  const [role, setRole] = useState('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  
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
  
  const handleSave = async () => {
    if (!name || !email) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Por favor, preencha pelo menos nome e e-mail.",
        className: "shadow-xl",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Verificar se o email já existe
      const { data: existingUsers, error: checkError } = await supabase
        .from('system_users')
        .select('id')
        .eq('email', email);
      
      if (checkError) {
        throw checkError;
      }

      if (existingUsers && existingUsers.length > 0) {
        toast({
          variant: "destructive",
          title: "Erro ao criar usuário",
          description: "Este e-mail já está sendo utilizado por outro usuário.",
          className: "shadow-xl",
        });
        setIsSaving(false);
        return;
      }

      // Determinar a role final baseada no checkbox
      const finalRole = isProfessional ? 'professional' : role;
      
      // Preparar dados do usuário
      const userData: Partial<SystemUser> = {
        id: uuidv4(),
        name,
        email,
        phone: phone || null,
        role: finalRole as SystemUser['role'],
        is_professional: isProfessional,
        birth_date: birthDate || null,
        address: address || null,
        status: 'active'
      };
      
      // Salvar no Supabase
      const { data, error } = await supabase
        .from('system_users')
        .insert([userData]);
        
      if (error) {
        throw error;
      }

      // Limpar o formulário
      setName('');
      setEmail('');
      setPhone('');
      setBirthDate('');
      setAddress('');
      setRole('user');
      setIsProfessional(false);
      
      // Mostrar mensagem de sucesso
      toast({
        variant: "success",
        title: "Usuário cadastrado com sucesso!",
        description: "As informações foram salvas no sistema.",
        className: "shadow-xl",
      });
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar usuário",
        description: error.message || "Ocorreu um erro ao tentar salvar os dados.",
        className: "shadow-xl",
      });
    } finally {
      setIsSaving(false);
    }
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
              <Input 
                id="name" 
                placeholder="Nome completo" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                placeholder="(00) 00000-0000" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input 
                id="birthDate" 
                type="date" 
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
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
              <Input 
                id="address" 
                placeholder="Endereço completo" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </FormCard>
  );
}
