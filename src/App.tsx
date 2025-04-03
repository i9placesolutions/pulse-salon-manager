
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import { AuthRedirect } from './components/auth/AuthRedirect';
import { useAuth } from './contexts/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Servicos from './pages/Servicos';
import Profissionais from './pages/Profissionais';
import Financeiro from './pages/Financeiro';
import Configuracoes from './pages/Configuracoes';
import ProfissionalDashboard from './pages/ProfissionalDashboard';

// Componente de redirecionamento com base no tipo de usuário
function UserRedirect() {
  const { userType } = useAuth();
  
  if (userType === 'professional') {
    return <Navigate to="/profissional-dashboard" />;
  }
  
  return <Navigate to="/dashboard" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Rota raiz - redireciona com base na autenticação */}
          <Route path="/" element={<UserRedirect />} />
          
          {/* Rotas protegidas - Estabelecimento */}
          <Route path="/dashboard" element={
            <AuthRedirect>
              <Dashboard />
            </AuthRedirect>
          } />
          <Route path="/clientes" element={
            <AuthRedirect>
              <Clientes />
            </AuthRedirect>
          } />
          <Route path="/servicos" element={
            <AuthRedirect>
              <Servicos />
            </AuthRedirect>
          } />
          <Route path="/profissionais" element={
            <AuthRedirect>
              <Profissionais />
            </AuthRedirect>
          } />
          <Route path="/financeiro" element={
            <AuthRedirect>
              <Financeiro />
            </AuthRedirect>
          } />
          <Route path="/configuracoes" element={
            <AuthRedirect>
              <Configuracoes />
            </AuthRedirect>
          } />
          
          {/* Rotas protegidas - Profissional */}
          <Route path="/profissional-dashboard" element={
            <AuthRedirect>
              <ProfissionalDashboard />
            </AuthRedirect>
          } />
          
          {/* Página não encontrada */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
