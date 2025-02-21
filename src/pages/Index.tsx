
import LoginForm from "@/components/auth/LoginForm";

const Index = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-secondary to-secondary-soft p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="glass-card rounded-2xl p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary animate-pulse-soft" />
            </div>
            <h1 className="text-2xl font-semibold text-neutral mb-2">
              Bem-vindo ao Pulse
            </h1>
            <p className="text-neutral-soft text-sm">
              Faça login para acessar sua conta
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-sm text-neutral-soft">
            Não tem uma conta?{" "}
            <a href="/register" className="link-text font-medium">
              Criar conta
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
