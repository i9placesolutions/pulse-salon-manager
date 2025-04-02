import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock, Loader2, LogIn } from "lucide-react";

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
        variant: "info",
        className: "shadow-xl"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: "Por favor, verifique suas credenciais e tente novamente.",
        className: "shadow-xl animate-shake"
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
        variant: "success",
        className: "animate-bounce-gentle border-2 shadow-xl"
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
        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors duration-200" size={20} />
          <Input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 border-gray-200 focus:border-pink-500 focus:ring-pink-200 transition-all duration-300"
            required
          />
        </div>

        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors duration-200" size={20} />
          <Input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 border-gray-200 focus:border-pink-500 focus:ring-pink-200 transition-all duration-300"
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            className="rounded border-gray-300 text-pink-500 focus:ring-pink-300"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="remember" className="text-sm text-neutral-soft">
            Lembrar-me
          </label>
        </div>

        <Link to="/forgot-password" className="text-sm text-pink-600 hover:text-pink-700 transition-colors duration-200">
          Esqueceu sua senha?
        </Link>
      </div>

      <div className="space-y-3">
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium py-2.5 rounded-lg transition-all duration-300 transform hover:translate-y-[-1px] hover:shadow-lg flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <LogIn className="h-4 w-4 mr-2" /> Entrar
            </>
          )}
        </Button>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
            onClick={handleQuickFill}
          >
            Preencher Teste
          </Button>
          <Button
            type="button"
            className="w-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200"
            onClick={handleTestLogin}
          >
            Login Rápido
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-neutral-soft">Ou entre com</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 transition-all duration-200"
          onClick={() => {
            toast({
              title: "Google Login",
              description: "Será implementado com Supabase",
              variant: "primary",
              className: "shadow-lg"
            });
          }}
        >
          Google
        </Button>
        <Button
          type="button"
          className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 transition-all duration-200"
          onClick={() => {
            toast({
              title: "Facebook Login",
              description: "Será implementado com Supabase",
              variant: "info",
              className: "shadow-lg"
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
