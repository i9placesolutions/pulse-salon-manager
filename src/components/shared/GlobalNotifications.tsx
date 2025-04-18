import { useState, useEffect } from 'react';
import { useAppState } from '@/contexts/AppStateContext';
import { toast } from '@/components/ui/use-toast';

/**
 * Componente que gerencia notificações globais do sistema
 * Este componente deve ser incluído em _app.tsx para permitir notificações em toda a aplicação
 */
export function GlobalNotifications() {
  const { subscribeToEvent } = useAppState();
  
  useEffect(() => {
    // Inscrever-se no evento de notificação
    const unsubscribe = subscribeToEvent('notification', (data) => {
      const { message, type } = data;
      
      // Exibir toast com a mensagem
      toast({
        title: type === 'error' ? 'Erro' : 
               type === 'warning' ? 'Atenção' : 
               type === 'success' ? 'Sucesso' : 'Informação',
        description: message,
        variant: type === 'error' ? 'destructive' : 
                 type === 'warning' ? 'default' : 
                 'default'
      });
    });
    
    // Limpar inscrição ao desmontar
    return () => {
      unsubscribe();
    };
  }, [subscribeToEvent]);
  
  // Este componente não renderiza nada visível
  return null;
}
