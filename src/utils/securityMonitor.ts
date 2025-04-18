/**
 * Monitoramento de segurança para o Pulse Salon Manager
 * Implementa logging de eventos de segurança e detecção de atividades suspeitas
 */

import { supabase } from '@/lib/supabaseClient';

// Tipos de eventos de segurança
export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  PASSWORD_CHANGE = 'password_change',
  PERMISSION_CHANGE = 'permission_change',
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access',
  ACCOUNT_LOCKOUT = 'account_lockout',
  XSS_ATTEMPT = 'xss_attempt',
  CSRF_FAILURE = 'csrf_failure',
  API_ABUSE = 'api_abuse'
}

// Interface para evento de segurança
export interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Cache para limitar tentativas (anti-brute force)
const loginAttempts: Record<string, { count: number, firstAttempt: number }> = {};

/**
 * Registra um evento de segurança
 */
export async function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp' | 'ipAddress' | 'userAgent'>): Promise<void> {
  try {
    // Adiciona timestamp e informações do navegador
    const completeEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      // Não é possível obter IP do cliente no frontend de forma confiável
    };
    
    // Registra no console durante desenvolvimento
    console.log('[Segurança]', completeEvent);
    
    // Em produção, salvaria no Supabase
    if (import.meta.env.PROD) {
      // Descomente para salvar eventos em produção
      /*
      await supabase
        .from('security_events')
        .insert(completeEvent);
      */
    }
    
    // Para eventos críticos, pode-se enviar alertas imediatos
    if (
      event.type === SecurityEventType.XSS_ATTEMPT ||
      event.type === SecurityEventType.CSRF_FAILURE ||
      event.type === SecurityEventType.API_ABUSE
    ) {
      // Enviar alerta via email/SMS/notificação
      // Em implementação real, integrar com serviço de alertas
    }
  } catch (error) {
    console.error('Erro ao registrar evento de segurança:', error);
  }
}

/**
 * Monitora tentativas de login para prevenir ataques de força bruta
 * Retorna true se o login deve ser bloqueado
 */
export function monitorLoginAttempt(identifier: string): boolean {
  const now = Date.now();
  const LOCK_THRESHOLD = 5; // Número de tentativas permitidas
  const LOCK_WINDOW = 15 * 60 * 1000; // 15 minutos
  
  // Inicializa ou atualiza contador
  if (!loginAttempts[identifier]) {
    loginAttempts[identifier] = { count: 1, firstAttempt: now };
    return false;
  }
  
  const attempt = loginAttempts[identifier];
  
  // Reinicia contador se fora da janela de tempo
  if (now - attempt.firstAttempt > LOCK_WINDOW) {
    loginAttempts[identifier] = { count: 1, firstAttempt: now };
    return false;
  }
  
  // Incrementa contador
  attempt.count += 1;
  
  // Verifica se excedeu o limite
  if (attempt.count > LOCK_THRESHOLD) {
    // Registra evento de bloqueio
    logSecurityEvent({
      type: SecurityEventType.ACCOUNT_LOCKOUT,
      details: { 
        identifier,
        attempts: attempt.count,
        lockDuration: '15 minutos'
      }
    });
    
    return true; // Bloquear login
  }
  
  return false;
}

/**
 * Detecta e registra possíveis tentativas de XSS
 */
export function detectXSSAttempt(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /onerror=/gi,
    /onload=/gi,
    /onclick=/gi,
    /onmouseover=/gi,
    /eval\(/gi,
    /document\.cookie/gi
  ];
  
  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      logSecurityEvent({
        type: SecurityEventType.XSS_ATTEMPT,
        details: { 
          input: input.substring(0, 100), // Limita para não registrar todo o payload
          matchedPattern: pattern.toString() 
        }
      });
      return true;
    }
  }
  
  return false;
}

/**
 * Limpa o histórico de tentativas de login (chamado após login bem-sucedido)
 */
export function clearLoginAttempts(identifier: string): void {
  delete loginAttempts[identifier];
}

/**
 * Verifica permissões e registra acesso a dados sensíveis
 */
export function auditSensitiveAccess(userId: string, resourceType: string, resourceId: string): void {
  logSecurityEvent({
    type: SecurityEventType.SENSITIVE_DATA_ACCESS,
    userId,
    details: {
      resourceType,
      resourceId,
      action: 'read'
    }
  });
}
