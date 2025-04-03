
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthRedirectProps {
  children: React.ReactNode;
}

export const AuthRedirect = ({ children }: AuthRedirectProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Configurar escuta para alterações de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Enquanto carrega, mostra um indicador de carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-600">Carregando...</span>
        </div>
      </div>
    );
  }

  // Se não tiver sessão, redireciona para a página de login
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // Se tiver sessão, renderiza os filhos
  return <>{children}</>;
};
