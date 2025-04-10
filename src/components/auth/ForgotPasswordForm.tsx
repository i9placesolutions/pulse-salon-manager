import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Loader2, ArrowRight } from "lucide-react";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // To be implemented with Supabase
      console.log("Password recovery attempt", { email });
      toast({
        title: "E-mail enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar e-mail",
        description: "Por favor, verifique o endereço e tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
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
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium py-2.5 rounded-lg transition-all duration-300 transform hover:translate-y-[-1px] hover:shadow-lg flex items-center justify-center gap-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            Enviar instruções
            <ArrowRight className="h-4 w-4 ml-1" />
          </>
        )}
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
