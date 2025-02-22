
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-secondary to-secondary-soft p-4">
      <div className="w-full max-w-4xl animate-slide-up">
        <div className="glass-card rounded-2xl p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-neutral mb-2">
              Política de Privacidade
            </h1>
            <p className="text-neutral-soft">
              Última atualização: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="prose prose-neutral max-w-none">
            <h2 className="text-xl font-semibold mb-4">1. Dados Coletados</h2>
            <p className="mb-4">
              Coletamos informações necessárias para o funcionamento da plataforma, incluindo dados
              de cadastro, informações de uso e dados de pagamento.
            </p>

            <h2 className="text-xl font-semibold mb-4">2. Uso de Cookies</h2>
            <p className="mb-4">
              Utilizamos cookies para melhorar a experiência do usuário, mantendo informações de
              sessão e preferências.
            </p>

            <h2 className="text-xl font-semibold mb-4">3. Compartilhamento de Dados</h2>
            <p className="mb-4">
              Seus dados são confidenciais e não são compartilhados com terceiros, exceto quando
              necessário para a prestação dos serviços ou por exigência legal.
            </p>

            <h2 className="text-xl font-semibold mb-4">4. Segurança</h2>
            <p className="mb-4">
              Utilizamos medidas técnicas e organizacionais para proteger seus dados contra acesso
              não autorizado ou processamento ilegal.
            </p>

            <h2 className="text-xl font-semibold mb-4">5. Seus Direitos</h2>
            <p className="mb-4">
              Você tem direito a acessar, corrigir e excluir seus dados pessoais, além de solicitar
              a portabilidade dos mesmos.
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

export default Privacy;
