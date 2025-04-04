import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hash, setHash] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Obter o hash da URL
    const hashFromUrl = window.location.hash.substring(1);
    setHash(hashFromUrl);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não conferem",
        description: "As senhas digitadas não são idênticas.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;
      
      toast({
        title: "Senha redefinida",
        description: "Sua senha foi atualizada com sucesso. Agora você pode fazer login.",
        variant: "success",
        className: "shadow-xl"
      });

      // Redirecionar para a página de login após 2 segundos
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao redefinir senha",
        description: error.message || "Por favor, tente novamente mais tarde.",
        className: "shadow-xl"
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#f5f4fc] via-[#f0f1ff] to-[#fef8ff] p-4 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/3 w-40 h-40 bg-blue-200/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md animate-slide-up relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          {/* Faixa decorativa superior */}
          <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500"></div>
          
          <div className="p-8 md:p-10">
            <div className="text-center mb-7">
              <div className="flex justify-center mb-5">
                <img 
                  src="/logorosa.png" 
                  alt="Pulse Logo" 
                  className="h-14 drop-shadow-md" 
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                Redefinir senha
              </h1>
              <p className="text-gray-500 text-sm">
                Digite sua nova senha
              </p>
            </div>

            <div className="space-y-1 mb-6">
              <div className="h-1 w-20 bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 mx-auto rounded-full"></div>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-6 animate-fade-in">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-indigo-500" />
                    Nova senha
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
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Redefinir senha"
                )}
              </Button>
              
              <p className="mt-4 text-center text-sm text-gray-500">
                Lembrou sua senha?{" "}
                <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-all duration-200">
                  Voltar ao login
                </Link>
              </p>
            </form>
          </div>
        </div>
        
        <div className="mt-5 text-center">
          <Link to="/terms" className="text-xs text-gray-500 hover:text-gray-700 mx-2 transition-colors">
            Termos de Uso
          </Link>
          <span className="text-gray-400">•</span>
          <Link to="/privacy" className="text-xs text-gray-500 hover:text-gray-700 mx-2 transition-colors">
            Política de Privacidade
          </Link>
          <span className="text-gray-400">•</span>
          <Link to="/help" className="text-xs text-gray-500 hover:text-gray-700 mx-2 transition-colors">
            Ajuda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 