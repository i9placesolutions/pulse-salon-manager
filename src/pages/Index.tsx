import { Link } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";

const Index = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-50 to-pink-50 p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="glass-card rounded-2xl shadow-xl p-8 md:p-10 backdrop-blur-md border border-white/30 relative overflow-hidden">
          {/* Efeitos de decoração */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-pink-200/30 to-pink-400/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-32 -left-20 w-64 h-64 bg-gradient-to-tr from-blue-200/20 to-blue-300/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-5">
                <img 
                  src="/logorosa.png" 
                  alt="Pulse Logo" 
                  className="h-12" 
                />
              </div>
              <h1 className="text-2xl font-semibold text-neutral mb-1">
                Bem-vindo
              </h1>
              <p className="text-neutral-soft text-sm">
                Acesse sua conta para continuar
              </p>
            </div>

            <div className="space-y-1 mb-5">
              <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-pink-500 to-transparent mx-auto"></div>
            </div>

            <LoginForm />

            <p className="mt-7 text-center text-sm text-neutral-soft">
              Não tem uma conta?{" "}
              <Link to="/register" className="text-pink-600 hover:text-pink-700 font-medium hover:underline transition-all duration-200">
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
