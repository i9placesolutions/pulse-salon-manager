import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock, User, Loader2, Eye, EyeOff, Check } from "lucide-react";
import { useAppState } from "@/contexts/AppStateContext";
import { supabase } from "@/integrations/supabase/client";

const RegisterForm = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setEstablishmentName, setProfileState } = useAppState();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isFormValid = () => {
    return (
      fullName.length >= 3 &&
      validateEmail(email) &&
      password.length >= 6 &&
      password === confirmPassword &&
      acceptTerms
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast({
        variant: "destructive",
        title: "Erro no formulário",
        description: "Por favor, verifique todos os campos.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Criar estabelecimento a partir do nome fornecido
      const establishmentNameFromFullName = fullName.split(' ')[0] + ' Salão';
      
      // Criar usuário no Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            establishment_name: establishmentNameFromFullName,
            full_name: fullName
          }
        }
      });

      if (error) throw error;
      
      // Atualizar estado do contexto
      setEstablishmentName(establishmentNameFromFullName);
      
      // Definir como primeiro login
      setProfileState({
        isFirstLogin: true,
        isProfileComplete: false,
        trialEndsAt: new Date(new Date().setDate(new Date().getDate() + 7)), // 7 dias de teste
        subscriptionActive: false
      });
      
      // Salvar no localStorage
      localStorage.setItem('firstLogin', 'true');
      localStorage.setItem('profileComplete', 'false');
      localStorage.setItem('establishmentName', establishmentNameFromFullName);
      localStorage.setItem('trialEndsAt', new Date(new Date().setDate(new Date().getDate() + 7)).toISOString());
      localStorage.setItem('subscriptionActive', 'false');
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu e-mail para confirmar sua conta e continue completando seu perfil.",
        variant: "success",
        className: "shadow-xl",
        duration: 8000 // Aumentado para 8 segundos (8000ms)
      });
      
      // Redirecionar para a página inicial
      navigate("/");
    } catch (error: any) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: error.message || "Por favor, tente novamente mais tarde.",
        className: "shadow-xl"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5 animate-fade-in">
      <div className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="fullName" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-indigo-500" />
            Nome completo
          </label>
          <div className="relative">
            <Input
              id="fullName"
              type="text"
              placeholder="Digite seu nome completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 transition-all duration-300 ${
                fullName && fullName.length < 3 ? "border-red-300 focus:border-red-500 focus:ring-red-100" : ""
              }`}
              required
            />
            {fullName && fullName.length < 3 && (
              <p className="mt-1 text-xs text-red-500">
                Nome deve ter pelo menos 3 caracteres
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-indigo-500" />
            Email
          </label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 transition-all duration-300 ${
                email && !validateEmail(email) ? "border-red-300 focus:border-red-500 focus:ring-red-100" : ""
              }`}
              required
            />
            {email && !validateEmail(email) && (
              <p className="mt-1 text-xs text-red-500">
                Digite um email válido
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-indigo-500" />
            Senha
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 transition-all duration-300 ${
                password && password.length < 6 ? "border-red-300 focus:border-red-500 focus:ring-red-100" : ""
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors duration-200"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {password && password.length < 6 && (
              <p className="mt-1 text-xs text-red-500">
                Senha deve ter pelo menos 6 caracteres
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-indigo-500" />
            Confirme sua senha
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 transition-all duration-300 ${
                confirmPassword && confirmPassword !== password ? "border-red-300 focus:border-red-500 focus:ring-red-100" : ""
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors duration-200"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {confirmPassword && confirmPassword !== password && (
              <p className="mt-1 text-xs text-red-500">
                As senhas não conferem
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 mt-2">
          <div 
            className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center cursor-pointer transition-all duration-200 border ${
              acceptTerms 
                ? 'bg-indigo-600 border-indigo-600' 
                : 'bg-white border-gray-300 hover:border-indigo-500'
            }`}
            onClick={() => setAcceptTerms(!acceptTerms)}
          >
            {acceptTerms && <Check className="h-3 w-3 text-white" />}
          </div>
          <label 
            htmlFor="terms" 
            className="text-sm text-gray-600 cursor-pointer select-none"
            onClick={() => setAcceptTerms(!acceptTerms)}
          >
            Li e aceito os{" "}
            <Link to="/terms" className="text-indigo-600 hover:text-indigo-700 transition-colors duration-200 hover:underline" target="_blank">
              termos de uso
            </Link>{" "}
            e a{" "}
            <Link to="/privacy" className="text-indigo-600 hover:text-indigo-700 transition-colors duration-200 hover:underline" target="_blank">
              política de privacidade
            </Link>
          </label>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            Criar minha conta
            <Check className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
};

export default RegisterForm;
