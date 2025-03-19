
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Index from "./pages/Index";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Financeiro from "./pages/Financeiro";
import Estoque from "./pages/Estoque";
import Clientes from "./pages/Clientes";
import Marketing from "./pages/Marketing";
import Configuracoes from "./pages/Configuracoes";
import Servicos from "./pages/Servicos";
import Profissionais from "./pages/Profissionais";
import Mensalidade from "./pages/Mensalidade";
import ProfissionalDashboard from "./pages/ProfissionalDashboard";
import EstablishmentProfile from "./pages/EstablishmentProfile";
import PDV from "./pages/PDV";
import NotFound from "./pages/NotFound";
import { SpecialtiesProvider } from "./contexts/SpecialtiesContext";
import { AppStateProvider } from "./contexts/AppStateContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SpecialtiesProvider>
        <AppStateProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth routes */}
              <Route path="/" element={<Index />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              
              {/* Professional routes without sidebar */}
              <Route path="/profissional-dashboard" element={<ProfissionalDashboard />} />
              
              {/* Protected routes with sidebar */}
              <Route path="/dashboard" element={
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              } />
              <Route path="/appointments" element={
                <AppLayout>
                  <Appointments />
                </AppLayout>
              } />
              <Route path="/clientes" element={
                <AppLayout>
                  <Clientes />
                </AppLayout>
              } />
              <Route path="/servicos" element={
                <AppLayout>
                  <Servicos />
                </AppLayout>
              } />
              <Route path="/profissionais" element={
                <AppLayout>
                  <Profissionais />
                </AppLayout>
              } />
              <Route path="/financeiro" element={
                <AppLayout>
                  <Financeiro />
                </AppLayout>
              } />
              <Route path="/estoque" element={
                <AppLayout>
                  <Estoque />
                </AppLayout>
              } />
              <Route path="/marketing" element={
                <AppLayout>
                  <Marketing />
                </AppLayout>
              } />
              <Route path="/configuracoes" element={
                <AppLayout>
                  <Configuracoes />
                </AppLayout>
              } />
              <Route path="/mensalidade" element={
                <AppLayout>
                  <Mensalidade />
                </AppLayout>
              } />
              <Route path="/establishment-profile" element={
                <AppLayout>
                  <EstablishmentProfile />
                </AppLayout>
              } />
              <Route path="/pdv" element={
                <AppLayout>
                  <PDV />
                </AppLayout>
              } />
              
              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppStateProvider>
      </SpecialtiesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
