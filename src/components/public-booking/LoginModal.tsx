import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { User, Calendar, Phone } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// Validador de telefone brasileiro
const formatWhatsAppNumber = (value: string) => {
  // Remove tudo que não for dígito
  const digits = value.replace(/\D/g, "");
  
  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

export interface UserData {
  id: string;
  name: string;
  whatsapp: string;
  birthDate: string;
  isNewUser: boolean;
}

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (userData: UserData) => void;
}

export const LoginModal = ({ open, onClose, onSuccess }: LoginModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [registerData, setRegisterData] = useState({
    name: "",
    whatsapp: "",
    birthDate: ""
  });

  // Função para validar dados de cadastro
  const validateRegister = () => {
    if (!registerData.name) {
      toast({
        title: "Nome não preenchido",
        description: "Por favor, insira seu nome.",
        variant: "destructive"
      });
      return false;
    }
    if (!registerData.whatsapp) {
      toast({
        title: "WhatsApp não preenchido",
        description: "Por favor, insira seu número de WhatsApp.",
        variant: "destructive"
      });
      return false;
    }
    if (!registerData.birthDate) {
      toast({
        title: "Data de nascimento não preenchida",
        description: "Por favor, insira sua data de nascimento.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  // Função para realizar cadastro
  const handleRegister = async () => {
    if (!validateRegister()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const whatsapp = registerData.whatsapp.replace(/[^0-9]/g, '');
      const emailToUse = `${whatsapp}@pulseapp.com.br`;
      
      // Verificar se já existe um usuário com este WhatsApp
      const { data: existingUser, error: existingUserError } = await supabase
        .from('profiles')
        .select('id, whatsapp')
        .eq('whatsapp', whatsapp)
        .single();
      
      if (existingUserError && existingUserError.code !== 'PGRST116') {
        throw new Error("Erro ao verificar usuário existente");
      }
      
      if (existingUser) {
        throw new Error("Já existe uma conta com este número de WhatsApp");
      }
      
      // Registrar o usuário no Supabase Auth sem tentar manipular a tabela profiles
      const { data, error } = await supabase.auth.signUp({
        email: emailToUse,
        password: registerData.birthDate,
        options: {
          data: {
            name: registerData.name,
            whatsapp: registerData.whatsapp,
            birth_date: registerData.birthDate,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Fazer login logo após o registro para obter a sessão e evitar problemas com o perfil
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: registerData.birthDate
        });

        if (loginError) throw loginError;

        const userData: UserData = {
          id: data.user.id,
          name: registerData.name,
          whatsapp: registerData.whatsapp,
          birthDate: registerData.birthDate,
          isNewUser: true
        };

        toast({
          title: "Cadastro realizado com sucesso",
          description: "Sua conta foi criada!",
          variant: "default"
        });
        
        onSuccess(userData);
        onClose();
      } else {
        throw new Error("Erro ao criar conta");
      }
    } catch (error) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Tente novamente ou entre em contato com o suporte",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Conta</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name-register">Nome</Label>
            <div className="relative">
              <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                id="name-register" 
                placeholder="Seu nome completo" 
                value={registerData.name}
                onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                className="pl-8"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp-register">WhatsApp</Label>
            <div className="relative">
              <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                id="whatsapp-register" 
                placeholder="(XX) XXXXX-XXXX" 
                value={registerData.whatsapp}
                onChange={(e) => {
                  const formatted = formatWhatsAppNumber(e.target.value);
                  setRegisterData(prev => ({ ...prev, whatsapp: formatted }));
                }}
                className="pl-8"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthdate-register">Data de Nascimento</Label>
            <div className="relative">
              <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                id="birthdate-register" 
                placeholder="DD/MM/AAAA" 
                type="date"
                value={registerData.birthDate}
                onChange={(e) => setRegisterData(prev => ({ ...prev, birthDate: e.target.value }))}
                className="pl-8"
              />
            </div>
          </div>
          <Button 
            className="w-full" 
            onClick={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? "Criando conta..." : "Criar Conta"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};