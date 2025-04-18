import { useEffect } from 'react';
import { useAppState } from '@/contexts/AppStateContext';

/**
 * Hook personalizado para comunicação entre telas do sistema
 * Facilita o compartilhamento de dados e eventos entre componentes
 */
export function useCrossScreenCommunication() {
  const { 
    publishEvent, 
    subscribeToEvent, 
    shareData, 
    getSharedData, 
    showNotification,
    refreshData
  } = useAppState();

  /**
   * Envia dados para outras telas/componentes
   * @param eventName Nome do evento
   * @param data Dados a serem compartilhados
   */
  const sendData = (eventName: string, data: any) => {
    publishEvent(eventName, data);
  };

  /**
   * Ouve por dados de outras telas/componentes
   * @param eventName Nome do evento para escutar
   * @param callback Função a ser executada quando o evento ocorrer
   */
  const listenForData = (eventName: string, callback: (data: any) => void) => {
    return subscribeToEvent(eventName, callback);
  };

  /**
   * Armazena dados para serem acessados por qualquer tela
   * @param key Chave para identificar os dados
   * @param value Valor a ser armazenado
   */
  const storeSharedData = (key: string, value: any) => {
    shareData(key, value);
  };

  /**
   * Recupera dados armazenados
   * @param key Chave dos dados
   * @returns Dados armazenados ou undefined
   */
  const getStoredData = (key: string) => {
    return getSharedData(key);
  };

  /**
   * Exibe uma notificação em qualquer tela do sistema
   * @param message Mensagem a ser exibida
   * @param type Tipo da notificação (success, error, warning, info)
   */
  const notifyAllScreens = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    showNotification(message, type);
  };

  /**
   * Atualiza dados em uma área específica
   * @param area Área a ser atualizada ('clients', 'appointments', etc.)
   */
  const updateDataAcrossScreens = async (area: string) => {
    await refreshData(area);
  };

  return {
    sendData,
    listenForData,
    storeSharedData,
    getStoredData,
    notifyAllScreens,
    updateDataAcrossScreens
  };
}
