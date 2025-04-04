/**
 * Utilitário de Logging para integração Asaas
 * 
 * Este módulo fornece funções de logging centralizadas para todos os componentes
 * que interagem com a API do Asaas, garantindo consistência nos logs.
 */

// Configurações do logger
const LOG_PREFIX = '[Asaas]';
const DEV_MODE = process.env.NODE_ENV === 'development';
const LOG_LEVEL = process.env.ASAAS_LOG_LEVEL || (DEV_MODE ? 'debug' : 'info');

// Níveis de log em ordem crescente de importância
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Verificar se o nível de log atual permite exibir mensagens do nível especificado
function shouldLog(level: keyof typeof LOG_LEVELS): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[LOG_LEVEL as keyof typeof LOG_LEVELS];
}

// Formatar dados de saída
function formatData(data: any): string {
  if (!data) return '';
  
  try {
    // Se for um objeto de erro
    if (data instanceof Error) {
      return data.stack || data.message;
    }
    
    // Se for um objeto, formatar como JSON
    if (typeof data === 'object') {
      // Remover dados sensíveis
      const safeData = { ...data };
      
      // Ocultar tokens e chaves API
      if (safeData.access_token) safeData.access_token = '****';
      if (safeData.authorization) safeData.authorization = '****';
      if (safeData.apiKey) safeData.apiKey = '****';
      
      // Ocultar dados de cartão de crédito
      if (safeData.creditCard) {
        safeData.creditCard = {
          ...safeData.creditCard,
          number: safeData.creditCard.number ? 
            `****${safeData.creditCard.number.slice(-4)}` : '****',
          ccv: '***'
        };
      }
      
      return JSON.stringify(safeData, null, DEV_MODE ? 2 : 0);
    }
    
    return String(data);
  } catch (e) {
    return '[Dados não formatáveis]';
  }
}

// Gerar ID de transação para correlacionar logs
function generateTransactionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
}

// Interface do logger
export interface AsaasLogger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: any): void;
  startTransaction(context: string): AsaasLogger;
}

// Criar instância do logger
function createLogger(transactionId?: string): AsaasLogger {
  const txId = transactionId || '';
  const txPrefix = txId ? `${LOG_PREFIX}[${txId}]` : LOG_PREFIX;
  
  return {
    debug(message: string, data?: any): void {
      if (shouldLog('debug')) {
        console.debug(`${txPrefix} ${message}`, data ? formatData(data) : '');
      }
    },
    
    info(message: string, data?: any): void {
      if (shouldLog('info')) {
        console.log(`${txPrefix} ${message}`, data ? formatData(data) : '');
      }
    },
    
    warn(message: string, data?: any): void {
      if (shouldLog('warn')) {
        console.warn(`${txPrefix} ${message}`, data ? formatData(data) : '');
      }
    },
    
    error(message: string, error?: any): void {
      if (shouldLog('error')) {
        console.error(`${txPrefix} ${message}`, error ? formatData(error) : '');
      }
    },
    
    startTransaction(context: string): AsaasLogger {
      const newTxId = generateTransactionId();
      console.log(`${txPrefix} Iniciando transação ${newTxId} [${context}]`);
      return createLogger(newTxId);
    }
  };
}

// Exportar logger padrão
export const asaasLogger = createLogger();

// Exportar função para criar logger com transação
export const startAsaasTransaction = (context: string): AsaasLogger => {
  return asaasLogger.startTransaction(context);
};

export default asaasLogger; 