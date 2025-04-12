import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Lock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se há um token de recuperação na URL
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const type = params.get('type');
      if (type !== 'recovery') {
        setError("Link de recuperação inválido.");
      }
    } else {
      setError("Link de recuperação inválido.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não coincidem",
        description: "As senhas digitadas não são iguais.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast({
        title: "Senha redefinida com sucesso",
        description: "Você pode agora fazer login com sua nova senha.",
      });

      navigate("/");
    } catch (error) {
      setError(error.message || "Ocorreu um erro ao redefinir a senha.");
      toast({
        variant: "destructive",
        title: "Erro ao redefinir senha",
        description: error.message || "Tente novamente ou solicite um novo link.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-50 to-pink-50 p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="glass-card rounded-2xl shadow-xl p-8 md:p-10 backdrop-blur-md border border-white/30 relative overflow-hidden">
          {/* Efeitos de decoração */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-pink-200/30 to-pink-400/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-blue-200/30 to-blue-400/20 rounded-full blur-2xl"></div>

          <div className="relative z-10 mb-8 text-center">
            <h1 className="text-2xl font-semibold text-neutral mb-2">Redefinir Senha</h1>
            <p className="text-neutral-soft">Digite sua nova senha abaixo.</p>
          </div>

          <div className="space-y-1 mb-5">
            <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-pink-500 to-transparent mx-auto"></div>
          </div>

          {error && (
            <div className="mb-4 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-neutral">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-soft" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                    className="pl-9 bg-white/80 border-white/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-neutral">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-soft" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    className="pl-9 bg-white/80 border-white/20"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium py-2.5 rounded-lg transition-all duration-300 transform hover:translate-y-[-1px] hover:shadow-lg flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Redefinir Senha"
              )}
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-neutral-soft">
            Lembrou sua senha?{" "}
            <Link to="/" className="text-pink-600 hover:text-pink-700 font-medium hover:underline transition-all duration-200">
              Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
