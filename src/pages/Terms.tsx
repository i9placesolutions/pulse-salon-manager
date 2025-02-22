
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Terms = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-secondary to-secondary-soft p-4">
      <div className="w-full max-w-4xl animate-slide-up">
        <div className="glass-card rounded-2xl p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-neutral mb-2">
              Termos de Uso
            </h1>
            <p className="text-neutral-soft">
              Última atualização: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose prose-neutral max-w-none">
            <h2 className="text-xl font-semibold mb-4">1. Uso da Plataforma</h2>
            <p className="mb-4">
              O Pulse Salon Soluções é uma plataforma de gestão para salões de beleza que oferece
              ferramentas para otimização de agendamentos, controle financeiro e gestão de estoque.
            </p>

            <h2 className="text-xl font-semibold mb-4">2. Obrigações do Usuário</h2>
            <p className="mb-4">
              Os usuários devem manter suas credenciais de acesso seguras e não compartilhar sua conta.
              Todas as atividades realizadas através da conta são de responsabilidade do usuário.
            </p>

            <h2 className="text-xl font-semibold mb-4">3. Propriedade Intelectual</h2>
            <p className="mb-4">
              Todo o conteúdo disponível na plataforma é protegido por direitos autorais e outras
              leis de propriedade intelectual.
            </p>

            <h2 className="text-xl font-semibold mb-4">4. Limitações de Responsabilidade</h2>
            <p className="mb-4">
              O Pulse Salon Soluções não se responsabiliza por perdas ou danos decorrentes do uso
              ou impossibilidade de uso da plataforma.
            </p>

            <h2 className="text-xl font-semibold mb-4">5. Política de Cancelamento</h2>
            <p className="mb-4">
              Os usuários podem cancelar sua assinatura a qualquer momento, mantendo o acesso até
              o final do período já pago.
            </p>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <Link to="/register">
              <Button variant="outline">Voltar ao Cadastro</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
