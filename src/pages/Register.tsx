import { Link } from "react-router-dom";
import RegisterForm from "@/components/auth/RegisterForm";

const Register = () => {
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
                Crie sua conta
              </h1>
              <p className="text-gray-500 text-sm">
                Comece a gerenciar seu negócio
              </p>
            </div>

            <div className="space-y-1 mb-6">
              <div className="h-1 w-20 bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 mx-auto rounded-full"></div>
            </div>

            <RegisterForm />

            <p className="mt-8 text-center text-sm text-gray-500">
              Já tem uma conta?{" "}
              <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-all duration-200">
                Fazer login
              </Link>
            </p>
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

export default Register;
