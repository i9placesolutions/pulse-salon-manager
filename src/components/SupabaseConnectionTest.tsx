import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export default function SupabaseConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Verificando...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // Tenta fazer uma consulta simples para verificar a conexão
        // Usando a tabela 'profiles' que existe no esquema
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        
        if (error) {
          setConnectionStatus('Erro na conexão');
          setErrorMessage(`Erro: ${error.message}`);
        } else {
          setConnectionStatus('Conectado ao Supabase com sucesso!');
          setErrorMessage(null);
        }
      } catch (error: any) {
        setConnectionStatus('Erro na conexão');
        setErrorMessage(`Erro: ${error.message}`);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-4 bg-white shadow rounded-lg max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-2">Status da Conexão Supabase</h2>
      <p className={`font-medium ${connectionStatus.includes('sucesso') ? 'text-green-600' : connectionStatus === 'Verificando...' ? 'text-blue-600' : 'text-red-600'}`}>
        {connectionStatus}
      </p>
      {errorMessage && (
        <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
} 