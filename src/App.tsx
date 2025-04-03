import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, ReactNode } from "react";
import AppLayout from "./components/layout/AppLayout";
import Index from "./pages/Index";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import { SpecialtiesProvider } from "./contexts/SpecialtiesContext";
import { AppStateProvider, useAppState } from "./contexts/AppStateContext";

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

// Componente para proteção de rotas
const ProtectedRoute = ({ 
  children, 
  requireCompleteProfile = true, 
  requireActiveSubscription = true 
}: ProtectedRouteProps) => {
  const { profileState } = useAppState();
  const location = useLocation();

  // Se o perfil não estiver completo e a rota exigir perfil completo
  if (requireCompleteProfile && !profileState.isProfileComplete) {
    // Redirecionar para a página de perfil
    return <Navigate to="/establishment-profile" state={{ from: location }} replace />;
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

// Aplicação principal
const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* Auth routes */}
      <Route path="/" element={<Index />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
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
        <ProtectedRoute>
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
          <Toaster />
          <Sonner />
          <AppRoutes />
        </SpecialtiesProvider>
      </TooltipProvider>
    </AppStateProvider>
  </QueryClientProvider>
);

export default App;
