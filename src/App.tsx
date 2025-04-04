import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { lazy, Suspense, ReactNode, useEffect, useState } from "react";
import AppLayout from "./components/layout/AppLayout";
import Index from "./pages/Index";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import { SpecialtiesProvider } from "./contexts/SpecialtiesContext";
import { AppStateProvider, useAppState } from "./contexts/AppStateContext";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import SupabaseConnectionTest from "./components/SupabaseConnectionTest";

// Componente de carregamento
const Loading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-white">
    <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"></div>
  </div>
);

// Lazy loading das páginas principais
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Appointments = lazy(() => import("./pages/Appointments"));
const Financeiro = lazy(() => import("./pages/Financeiro"));
const Estoque = lazy(() => import("./pages/Estoque"));
const Clientes = lazy(() => import("./pages/Clientes"));
const Marketing = lazy(() => import("./pages/Marketing"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const Servicos = lazy(() => import("./pages/Servicos"));
const Profissionais = lazy(() => import("./pages/Profissionais"));
const Mensalidade = lazy(() => import("./pages/Mensalidade"));
const ProfissionalDashboard = lazy(() => import("./pages/ProfissionalDashboard"));
const ProfissionalProfile = lazy(() => import("./pages/ProfissionalProfile"));
const EstablishmentProfile = lazy(() => import("./pages/EstablishmentProfile"));
const PDV = lazy(() => import("./pages/PDV"));
const PublicBooking = lazy(() => import("./pages/PublicBooking"));
const MessagingPage = lazy(() => import("./pages/MessagingPage"));
const RatingPage = lazy(() => import("./pages/RatingPage"));

interface ProtectedRouteProps {
  children: ReactNode;
  requireCompleteProfile?: boolean;
  requireActiveSubscription?: boolean;
}

// Contexto para autenticação
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setProfileState, setEstablishmentName } = useAppState();
  // Vamos adicionar uma flag para controlar os toasts de boas-vindas
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Configurar listener de mudança de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      // Não atualizamos se for a carga inicial, isso será feito em getInitialSession
      if (!isInitialLoad) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      }
      
      // Se ocorrer logout, limpar os dados de perfil
      if (event === 'SIGNED_OUT') {
        setProfileState({
          isProfileComplete: false,
          isFirstLogin: true,
          trialEndsAt: null,
          subscriptionActive: false
        });
        localStorage.removeItem('profileComplete');
        localStorage.removeItem('firstLogin');
        localStorage.removeItem('trialEndsAt');
        localStorage.removeItem('subscriptionActive');
        localStorage.removeItem('establishmentName');
      }

      // Quando o usuário fizer login, buscar os dados do perfil
      if (event === 'SIGNED_IN' && currentSession && !isInitialLoad) {
        setTimeout(async () => {
          try {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .single();

            if (profileData && !error) {
              setEstablishmentName(profileData.establishment_name);
              setProfileState({
                isProfileComplete: profileData.is_profile_complete,
                isFirstLogin: false,
                trialEndsAt: profileData.trial_ends_at ? new Date(profileData.trial_ends_at) : null,
                subscriptionActive: profileData.subscription_active
              });

              // Salvar no localStorage
              localStorage.setItem('profileComplete', profileData.is_profile_complete.toString());
              localStorage.setItem('firstLogin', 'false');
              localStorage.setItem('establishmentName', profileData.establishment_name);
              if (profileData.trial_ends_at) {
                localStorage.setItem('trialEndsAt', profileData.trial_ends_at);
              }
              localStorage.setItem('subscriptionActive', profileData.subscription_active.toString());
            }
          } catch (err) {
            console.error("Erro ao carregar perfil:", err);
          }
        }, 0);
      }
    });

    // Verificar sessão atual
    async function getInitialSession() {
      setIsLoading(true);
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Buscar dados do perfil
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();

          if (profileData && !error) {
            setEstablishmentName(profileData.establishment_name);
            setProfileState({
              isProfileComplete: profileData.is_profile_complete,
              isFirstLogin: false,
              trialEndsAt: profileData.trial_ends_at ? new Date(profileData.trial_ends_at) : null,
              subscriptionActive: profileData.subscription_active
            });
            
            // Salvar no localStorage
            localStorage.setItem('profileComplete', profileData.is_profile_complete.toString());
            localStorage.setItem('firstLogin', 'false');
            localStorage.setItem('establishmentName', profileData.establishment_name);
            if (profileData.trial_ends_at) {
              localStorage.setItem('trialEndsAt', profileData.trial_ends_at);
            }
            localStorage.setItem('subscriptionActive', profileData.subscription_active.toString());
          }
        }
      } catch (err) {
        console.error("Erro ao verificar sessão:", err);
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    }
    
    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return <>{children}</>;
};

// Componente para proteção de rotas
const ProtectedRoute = ({ 
  children, 
  requireCompleteProfile = true, 
  requireActiveSubscription = true 
}: ProtectedRouteProps) => {
  const { profileState } = useAppState();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se o usuário está autenticado
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Verificar se o perfil está incompleto e redirecionar para configurações
  useEffect(() => {
    if (!isLoading && user) {
      // Bloquear acesso à página de perfil de estabelecimento se o perfil não estiver completo
      if (!profileState.isProfileComplete && location.pathname === "/establishment-profile") {
        navigate("/configuracoes", { 
          replace: true,
          state: { 
            blockedRoute: true, 
            message: "Complete o cadastro do estabelecimento antes de acessar o perfil."
          }
        });
        return;
      }
      
      // Redirecionar para configurações se tentar acessar outra página e o perfil não estiver completo
      if (requireCompleteProfile && !profileState.isProfileComplete && location.pathname !== "/configuracoes") {
        navigate("/configuracoes", { 
          replace: true,
          state: { 
            blockedRoute: true, 
            message: "Complete o cadastro do estabelecimento para acessar esta área."
          }
        });
        return;
      }
    }
  }, [isLoading, user, profileState.isProfileComplete, location.pathname, navigate, requireCompleteProfile]);

  if (isLoading) {
    return <Loading />;
  }

  // Verificar se o usuário está autenticado
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Se o perfil não estiver completo e a rota exigir perfil completo
  // E se o caminho não for /configuracoes
  if (requireCompleteProfile && !profileState.isProfileComplete && location.pathname !== "/configuracoes") {
    return <Navigate to="/configuracoes" state={{ 
      from: location, 
      blockedRoute: true,
      message: "Complete o cadastro do estabelecimento para acessar esta área."
    }} replace />;
  }

  // Bloqueio específico para a página de perfil
  if (location.pathname === "/establishment-profile" && !profileState.isProfileComplete) {
    return <Navigate to="/configuracoes" state={{ 
      from: location, 
      blockedRoute: true,
      message: "Complete o cadastro do estabelecimento antes de acessar o perfil." 
    }} replace />;
  }

  // Se a assinatura estiver expirada e a rota exigir assinatura ativa
  if (requireActiveSubscription && !profileState.subscriptionActive) {
    const today = new Date();
    // Verificar se o período de teste acabou
    if (profileState.trialEndsAt && today > profileState.trialEndsAt) {
      // Se estiver na página de mensalidade, permite o acesso
      if (location.pathname === '/mensalidade') {
        return <>{children}</>;
      }
      // Caso contrário, redireciona para a página de mensalidade
      return <Navigate to="/mensalidade" state={{ from: location }} replace />;
    }
  }

  // Se todas as verificações passarem, renderiza o conteúdo
  return <>{children}</>;
};

// Rota pública - redirecionar para o dashboard se o usuário já estiver logado
const PublicRoute = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { profileState } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Verificar se o usuário está autenticado
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Efeito para controlar redirecionamentos e evitar loops
  useEffect(() => {
    if (isLoading || isRedirecting) return;
    
    // Se o usuário estiver autenticado, redirecionar com base no estado do perfil
    if (user) {
      setIsRedirecting(true);
      
      // Se o perfil não estiver completo, redirecionar para a página de configurações
      if (!profileState.isProfileComplete) {
        navigate("/configuracoes", { 
          replace: true,
          state: { 
            fromPublicRoute: true,
            message: "Complete seu cadastro antes de acessar o sistema."
          }
        });
        return;
      }

      // Se a assinatura estiver expirada e não estiver mais no período de teste
      const today = new Date();
      if (!profileState.subscriptionActive && profileState.trialEndsAt && today > profileState.trialEndsAt) {
        navigate("/mensalidade", { replace: true });
        return;
      }

      // Caso contrário, redirecionar para o dashboard
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, profileState, navigate, location.pathname]);

  if (isLoading) {
    return <Loading />;
  }

  // Se não estiver autenticado ou redirecionando, mostrar a página pública
  if (!user || isRedirecting) {
    return <>{children}</>;
  }
  
  // Fallback enquanto estiver redirecionando
  return <Loading />;
};

// Componente que exibe a página inicial com o teste de conexão Supabase
const HomePage = () => {
  return (
    <div>
      <Index />
      <SupabaseConnectionTest />
    </div>
  );
};

// Rotas da aplicação
const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <HomePage />
          </PublicRoute>
        } 
      />
      {/* Auth routes */}
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      
      {/* Public booking route */}
      <Route path="/:slug" element={
        <Suspense fallback={<Loading />}>
          <PublicBooking />
        </Suspense>
      } />
      
      {/* Public rating route */}
      <Route path="/rating/:slug" element={
        <Suspense fallback={<Loading />}>
          <RatingPage />
        </Suspense>
      } />
      
      {/* Rota de perfil do estabelecimento - não requer perfil completo */}
      <Route path="/establishment-profile" element={
        <ProtectedRoute requireCompleteProfile={false} requireActiveSubscription={false}>
          <AppLayout>
            <Suspense fallback={<Loading />}>
              <EstablishmentProfile />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      {/* Rota de mensalidade - não requer assinatura ativa */}
      <Route path="/mensalidade" element={
        <ProtectedRoute requireActiveSubscription={false}>
          <AppLayout>
            <Suspense fallback={<Loading />}>
              <Mensalidade />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      {/* Professional routes without sidebar */}
      <Route path="/profissional-dashboard" element={
        <ProtectedRoute>
          <Suspense fallback={<Loading />}>
            <ProfissionalDashboard />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/profissional-profile" element={
        <ProtectedRoute>
          <Suspense fallback={<Loading />}>
            <ProfissionalProfile />
          </Suspense>
        </ProtectedRoute>
      } />
      
      {/* Protected routes with sidebar */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<Loading />}>
              <Dashboard />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/appointments" element={
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<Loading />}>
              <Appointments />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/clientes" element={
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<Loading />}>
              <Clientes />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/servicos" element={
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<Loading />}>
              <Servicos />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/profissionais" element={
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<Loading />}>
              <Profissionais />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/financeiro" element={
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<Loading />}>
              <Financeiro />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/estoque" element={
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<Loading />}>
              <Estoque />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/pdv" element={
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<Loading />}>
              <PDV />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/marketing" element={
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<Loading />}>
              <Marketing />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/configuracoes" element={
        <ProtectedRoute requireCompleteProfile={false} requireActiveSubscription={false}>
          <AppLayout>
            <Suspense fallback={<Loading />}>
              <Configuracoes />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/messaging" element={
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<Loading />}>
              <MessagingPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      } />
      
      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppStateProvider>
      <TooltipProvider>
        <SpecialtiesProvider>
          <AuthProvider>
            <Sonner />
            <AppRoutes />
          </AuthProvider>
        </SpecialtiesProvider>
      </TooltipProvider>
    </AppStateProvider>
  </QueryClientProvider>
);

export default App;
