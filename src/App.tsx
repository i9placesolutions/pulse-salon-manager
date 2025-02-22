
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
import PDV from "./pages/PDV";
import Clientes from "./pages/Clientes";
import Relatorios from "./pages/Relatorios";
import Marketing from "./pages/Marketing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
          
          {/* Protected routes */}
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
          <Route path="/pdv" element={
            <AppLayout>
              <PDV />
            </AppLayout>
          } />
          <Route path="/relatorios" element={
            <AppLayout>
              <Relatorios />
            </AppLayout>
          } />
          <Route path="/marketing" element={
            <AppLayout>
              <Marketing />
            </AppLayout>
          } />
          
          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
