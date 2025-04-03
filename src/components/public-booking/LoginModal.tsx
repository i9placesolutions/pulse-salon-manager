import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Phone, Calendar, User, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: UserData) => void;
}

export interface UserData {
  id?: string;
  name?: string;
  whatsapp: string;
  birthDate: string;
  isNewUser?: boolean;
}

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

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Estado para formulário de login
  const [loginData, setLoginData] = useState({
    whatsapp: "",
    birthDate: ""
  });
  
  // Estado para formulário de cadastro
  const [registerData, setRegisterData] = useState({
    name: "",
    whatsapp: "",
    birthDate: ""
  });
  
  // Estado para erros de formulário
  const [loginErrors, setLoginErrors] = useState<{[key: string]: string}>({});
  const [registerErrors, setRegisterErrors] = useState<{[key: string]: string}>({});
  
  // Validação de formulário
  const validateLogin = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    // Validar WhatsApp
    if (!loginData.whatsapp) {
      errors.whatsapp = "WhatsApp é obrigatório";
    } else if (loginData.whatsapp.replace(/\D/g, "").length < 10) {
      errors.whatsapp = "WhatsApp inválido";
    }
    
    // Validar Data de Nascimento
    if (!loginData.birthDate) {
      errors.birthDate = "Data de nascimento é obrigatória";
    } else {
      const birthDate = new Date(loginData.birthDate);
      const today = new Date();
      if (isNaN(birthDate.getTime())) {
        errors.birthDate = "Data inválida";
      } else if (birthDate > today) {
        errors.birthDate = "Data não pode ser no futuro";
      } else if (today.getFullYear() - birthDate.getFullYear() < 12) {
        errors.birthDate = "Você deve ter pelo menos 12 anos";
      }
    }
    
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateRegister = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    // Validar Nome
    if (!registerData.name) {
      errors.name = "Nome é obrigatório";
    } else if (registerData.name.trim().length < 3) {
      errors.name = "Nome deve ter pelo menos 3 caracteres";
    }
    
    // Validar WhatsApp
    if (!registerData.whatsapp) {
      errors.whatsapp = "WhatsApp é obrigatório";
    } else if (registerData.whatsapp.replace(/\D/g, "").length < 10) {
      errors.whatsapp = "WhatsApp inválido";
    }
    
    // Validar Data de Nascimento
    if (!registerData.birthDate) {
      errors.birthDate = "Data de nascimento é obrigatória";
    } else {
      const birthDate = new Date(registerData.birthDate);
      const today = new Date();
      if (isNaN(birthDate.getTime())) {
        errors.birthDate = "Data inválida";
      } else if (birthDate > today) {
        errors.birthDate = "Data não pode ser no futuro";
      } else if (today.getFullYear() - birthDate.getFullYear() < 12) {
        errors.birthDate = "Você deve ter pelo menos 12 anos";
      }
    }
    
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Função para realizar login
  const handleLogin = async () => {
    if (!validateLogin()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulação de requisição ao backend
      setTimeout(() => {
        // Verifica se existe usuário com este WhatsApp e data de nascimento
        const userExists = Math.random() > 0.5; // Simulação - 50% de chance do usuário existir
        
        if (userExists) {
          // Usuário encontrado
          const userData: UserData = {
            id: "123456",
            name: "Cliente Existente",
            whatsapp: loginData.whatsapp,
            birthDate: loginData.birthDate,
            isNewUser: false
          };
          
          toast({
            title: "Login realizado com sucesso",
            description: "Bem-vindo de volta!",
            variant: "default"
          });
          
          onSuccess(userData);
          onClose();
        } else {
          toast({
            title: "Usuário não encontrado",
            description: "Verifique seus dados ou crie uma conta",
            variant: "destructive"
          });
        }
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  // Função para realizar cadastro
  const handleRegister = async () => {
    if (!validateRegister()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulação de requisição ao backend
      setTimeout(() => {
        // Simula a criação de um novo usuário
        const userData: UserData = {
          id: "654321",
          name: registerData.name,
          whatsapp: registerData.whatsapp,
          birthDate: registerData.birthDate,
          isNewUser: true
        };
        
        toast({
          title: "Cadastro realizado com sucesso",
          description: "Seja bem-vindo!",
          variant: "default"
        });
        
        onSuccess(userData);
        onClose();
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Erro ao realizar cadastro",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  // Handlers para atualização dos campos
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "whatsapp") {
      setLoginData({
        ...loginData,
        whatsapp: formatWhatsAppNumber(value)
      });
    } else {
      setLoginData({
        ...loginData,
        [name]: value
      });
    }
    
    // Limpar erro do campo quando usuário digita
    if (loginErrors[name]) {
      setLoginErrors({
        ...loginErrors,
        [name]: ""
      });
    }
  };
  
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "whatsapp") {
      setRegisterData({
        ...registerData,
        whatsapp: formatWhatsAppNumber(value)
      });
    } else {
      setRegisterData({
        ...registerData,
        [name]: value
      });
    }
    
    // Limpar erro do campo quando usuário digita
    if (registerErrors[name]) {
      setRegisterErrors({
        ...registerErrors,
        [name]: ""
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Acesse ou Cadastre-se</DialogTitle>
          <DialogDescription className="text-center">
            Para continuar com seu agendamento, faça login ou cadastre-se
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Cadastro</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="relative group">
                <Label htmlFor="login-whatsapp">WhatsApp</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <Input
                    id="login-whatsapp"
                    name="whatsapp"
                    placeholder="(00) 00000-0000"
                    value={loginData.whatsapp}
                    onChange={handleLoginChange}
                    className={`pl-10 ${loginErrors.whatsapp ? 'border-red-500' : ''}`}
                    maxLength={15}
                  />
                </div>
                {loginErrors.whatsapp && (
                  <p className="text-sm text-red-500 mt-1">{loginErrors.whatsapp}</p>
                )}
              </div>
              
              <div className="relative group">
                <Label htmlFor="login-birthDate">Data de Nascimento</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <Input
                    id="login-birthDate"
                    name="birthDate"
                    type="date"
                    value={loginData.birthDate}
                    onChange={handleLoginChange}
                    className={`pl-10 ${loginErrors.birthDate ? 'border-red-500' : ''}`}
                  />
                </div>
                {loginErrors.birthDate && (
                  <p className="text-sm text-red-500 mt-1">{loginErrors.birthDate}</p>
                )}
              </div>
            </div>
            
            <Button 
              className="w-full mt-4" 
              onClick={handleLogin} 
              disabled={isLoading}
            >
              {isLoading ? "Processando..." : "Entrar"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="relative group">
                <Label htmlFor="register-name">Nome Completo</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="h-4 w-4" />
                  </span>
                  <Input
                    id="register-name"
                    name="name"
                    placeholder="Digite seu nome completo"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    className={`pl-10 ${registerErrors.name ? 'border-red-500' : ''}`}
                  />
                </div>
                {registerErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{registerErrors.name}</p>
                )}
              </div>
              
              <div className="relative group">
                <Label htmlFor="register-whatsapp">WhatsApp</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <Input
                    id="register-whatsapp"
                    name="whatsapp"
                    placeholder="(00) 00000-0000"
                    value={registerData.whatsapp}
                    onChange={handleRegisterChange}
                    className={`pl-10 ${registerErrors.whatsapp ? 'border-red-500' : ''}`}
                    maxLength={15}
                  />
                </div>
                {registerErrors.whatsapp && (
                  <p className="text-sm text-red-500 mt-1">{registerErrors.whatsapp}</p>
                )}
              </div>
              
              <div className="relative group">
                <Label htmlFor="register-birthDate">Data de Nascimento</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <Input
                    id="register-birthDate"
                    name="birthDate"
                    type="date"
                    value={registerData.birthDate}
                    onChange={handleRegisterChange}
                    className={`pl-10 ${registerErrors.birthDate ? 'border-red-500' : ''}`}
                  />
                </div>
                {registerErrors.birthDate && (
                  <p className="text-sm text-red-500 mt-1">{registerErrors.birthDate}</p>
                )}
              </div>
            </div>
            
            <Button 
              className="w-full mt-4" 
              onClick={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? "Processando..." : "Cadastrar"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 