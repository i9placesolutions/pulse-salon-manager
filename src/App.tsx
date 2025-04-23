import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import AppLayout from "./components/layout/AppLayout";
import Index from "./pages/Index";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import { SpecialtiesProvider } from "./contexts/SpecialtiesContext";
import { AppStateProvider } from "./contexts/AppStateContext";
import { startBirthdayService } from "./lib/birthdayService";
import { GlobalNotifications } from "./components/shared/GlobalNotifications";

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
const Servicos = lazy(() => import("./pages/Servicos"));
const Profissionais = lazy(() => import("./pages/Profissionais"));
const Usuarios = lazy(() => import("./pages/Usuarios"));
const Mensalidade = lazy(() => import("./pages/Mensalidade"));
const ProfissionalDashboard = lazy(() => import("./pages/ProfissionalDashboard"));
const ProfissionalProfile = lazy(() => import("./pages/ProfissionalProfile"));
const EstablishmentProfile = lazy(() => import("./pages/EstablishmentProfile"));
const PDV = lazy(() => import("./pages/PDV"));
const PublicBooking = lazy(() => import("./pages/PublicBooking"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const IA = lazy(() => import("./pages/IA"));

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    startBirthdayService();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppStateProvider>
        <TooltipProvider>
          <SpecialtiesProvider>
            {/* Mantendo apenas um Toaster por aplicação */}
            <Toaster />
            <BrowserRouter>
              <GlobalNotifications />
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
                
                {/* Professional routes without sidebar */}
                <Route path="/profissional-dashboard" element={
                  <Suspense fallback={<Loading />}>
                    <ProfissionalDashboard />
                  </Suspense>
                } />
                <Route path="/profissional-profile" element={
                  <Suspense fallback={<Loading />}>
                    <ProfissionalProfile />
                  </Suspense>
                } />
                
                {/* Protected routes with sidebar */}
                <Route path="/dashboard" element={
                  <AppLayout>
                    <Suspense fallback={<Loading />}>
                      <Dashboard />
                    </Suspense>
                  </AppLayout>
                } />
                <Route path="/appointments" element={
                  <AppLayout>
                    <Suspense fallback={<Loading />}>
                      <Appointments />
                    </Suspense>
                  </AppLayout>
                } />
                <Route path="/clientes" element={
                  <AppLayout>
                    <Suspense fallback={<Loading />}>
                      <Clientes />
                    </Suspense>
                  </AppLayout>
                } />
                <Route path="/servicos" element={
                  <AppLayout>
                    <Suspense fallback={<Loading />}>
                      <Servicos />
                    </Suspense>
                  </AppLayout>
                } />
                <Route path="/profissionais" element={
                  <AppLayout>
                    <Suspense fallback={<Loading />}>
                      <Profissionais />
                    </Suspense>
                  </AppLayout>
                } />
                <Route path="/financeiro" element={
                  <AppLayout>
                    <Suspense fallback={<Loading />}>
                      <Financeiro />
                    </Suspense>
                  </AppLayout>
                } />
                <Route path="/estoque" element={
                  <AppLayout>
                    <Suspense fallback={<Loading />}>
                      <Estoque />
                    </Suspense>
                  </AppLayout>
                } />
                <Route path="/pdv" element={
                  <AppLayout>
                    <Suspense fallback={<Loading />}>
                      <PDV />
                    </Suspense>
                  </AppLayout>
                } />
                <Route path="/marketing" element={
                  <AppLayout>
                    <Suspense fallback={<Loading />}>
                      <Marketing />
                    </Suspense>
                  </AppLayout>
                } />
                <Route path="/relatorios" element={
                  <AppLayout>
                    <Suspense fallback={<Loading />}>
                      <Relatorios />
                    </Suspense>
                  </AppLayout>
                } />
                <Route path="/ia" element={
                  <AppLayout>
                    <Suspense fallback={<Loading />}>
                      <IA />
                    </Suspense>
                  </AppLayout>
                } />
                <Route path="/mensalidade" element={
                  <AppLayout>
                    <Suspense fallback={<Loading />}>
                      <Mensalidade />
                    </Suspense>
                  </AppLayout>
                } />
                <Route path="/usuarios" element={
                  <AppLayout>
                    <Suspense fallback={<Loading />}>
                      <Usuarios />
                    </Suspense>
                  </AppLayout>
                } />
                <Route path="/establishment-profile" element={
                  <AppLayout>
                    <Suspense fallback={<Loading />}>
                      <EstablishmentProfile />
                    </Suspense>
                  </AppLayout>
                } />
                {/* Página Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SpecialtiesProvider>
        </TooltipProvider>
      </AppStateProvider>
    </QueryClientProvider>
  );
};

export default App;
