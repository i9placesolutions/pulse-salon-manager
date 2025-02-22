
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock, Loader2 } from "lucide-react";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // To be implemented with Supabase
      console.log("Login attempt", { email, password, rememberMe });
      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "O backend será implementado em breve.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: "Por favor, verifique suas credenciais e tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate("/dashboard");
      toast({
        title: "Login de teste realizado",
        description: "Você está usando uma conta de demonstração.",
      });
    }, 1000);
  };

  const handleQuickFill = () => {
    setEmail("teste@pulse.com");
    setPassword("123456");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6 animate-fade-in">
      <div className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-styles pl-10"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-styles pl-10"
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            className="rounded border-gray-300 text-primary focus:ring-primary"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="remember" className="text-sm text-neutral-soft">
            Lembrar-me
          </label>
        </div>

        <Link to="/forgot-password" className="text-sm link-text">
          Esqueceu sua senha?
        </Link>
      </div>

      <div className="space-y-3">
        <Button
          type="submit"
          className="btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Entrar"
          )}
        </Button>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleQuickFill}
          >
            Preencher Teste
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleTestLogin}
          >
            Login Rápido
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-neutral-soft">Ou entre com</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            toast({
              title: "Google Login",
              description: "Será implementado com Supabase",
            });
          }}
        >
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            toast({
              title: "Facebook Login",
              description: "Será implementado com Supabase",
            });
          }}
        >
          Facebook
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
