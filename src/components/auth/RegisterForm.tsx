
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";

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
      // To be implemented with Supabase
      console.log("Register attempt", { fullName, email, password });
      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "O cadastro será implementado em breve.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: "Por favor, tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6 animate-fade-in">
      <div className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Nome completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={`input-styles pl-10 ${
              fullName && fullName.length < 3 ? "border-red-300" : ""
            }`}
            required
          />
          {fullName && fullName.length < 3 && (
            <p className="mt-1 text-xs text-red-500">
              Nome deve ter pelo menos 3 caracteres
            </p>
          )}
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`input-styles pl-10 ${
              email && !validateEmail(email) ? "border-red-300" : ""
            }`}
            required
          />
          {email && !validateEmail(email) && (
            <p className="mt-1 text-xs text-red-500">
              Digite um email válido
            </p>
          )}
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`input-styles pl-10 ${
              password && password.length < 6 ? "border-red-300" : ""
            }`}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {password && password.length < 6 && (
            <p className="mt-1 text-xs text-red-500">
              Senha deve ter pelo menos 6 caracteres
            </p>
          )}
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirme sua senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`input-styles pl-10 ${
              confirmPassword && confirmPassword !== password ? "border-red-300" : ""
            }`}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {confirmPassword && confirmPassword !== password && (
            <p className="mt-1 text-xs text-red-500">
              As senhas não conferem
            </p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            required
          />
          <label htmlFor="terms" className="text-sm text-neutral-soft">
            Li e aceito os{" "}
            <Link to="/terms" className="link-text" target="_blank">
              termos de uso
            </Link>{" "}
            e a{" "}
            <Link to="/privacy" className="link-text" target="_blank">
              política de privacidade
            </Link>
          </label>
        </div>
      </div>

      <Button
        type="submit"
        className="btn-primary w-full"
        disabled={isLoading || !isFormValid()}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Criar conta"
        )}
      </Button>
    </form>
  );
};

export default RegisterForm;
