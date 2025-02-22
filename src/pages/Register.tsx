
import { Link } from "react-router-dom";
import RegisterForm from "@/components/auth/RegisterForm";

const Register = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-secondary to-secondary-soft p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="glass-card rounded-2xl p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary animate-pulse-soft" />
            </div>
            <h1 className="text-2xl font-semibold text-neutral mb-2">
              Crie sua conta
            </h1>
            <p className="text-neutral-soft text-sm">
              Comece a gerenciar seu salão agora mesmo
            </p>
          </div>

          <RegisterForm />

          <p className="mt-8 text-center text-sm text-neutral-soft">
            Já tem uma conta?{" "}
            <Link to="/" className="link-text font-medium">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
