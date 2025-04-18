/**
 * Utilitário para validação de dados no cliente
 */

type ValidationRule = {
  test: (value: any) => boolean;
  message: string;
};

type ValidationSchema = Record<string, ValidationRule[]>;

/**
 * Valida um objeto de dados de acordo com um esquema de validação
 * @param data Objeto de dados a ser validado
 * @param schema Esquema de validação
 * @returns Objeto com os erros de validação (vazio se não houver erros)
 */
export function validateData(
  data: Record<string, any>,
  schema: ValidationSchema
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  // Itera sobre cada campo no esquema
  Object.entries(schema).forEach(([field, rules]) => {
    const value = data[field];
    const fieldErrors: string[] = [];

    // Aplica cada regra de validação
    rules.forEach(rule => {
      if (!rule.test(value)) {
        fieldErrors.push(rule.message);
      }
    });

    // Adiciona erros ao resultado se houver
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  });

  return errors;
}

/**
 * Verifica se há erros de validação
 * @param errors Objeto de erros de validação
 * @returns true se não houver erros, false caso contrário
 */
export function isValid(errors: Record<string, string[]>): boolean {
  return Object.keys(errors).length === 0;
}

/**
 * Validações comuns
 */
export const Validators = {
  required: (message = 'Campo obrigatório') => ({
    test: (value: any) => value !== undefined && value !== null && value !== '',
    message
  }),
  
  email: (message = 'E-mail inválido') => ({
    test: (value: any) => {
      if (!value) return true; // não valida se estiver vazio
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message
  }),
  
  phone: (message = 'Telefone inválido') => ({
    test: (value: any) => {
      if (!value) return true; // não valida se estiver vazio
      const normalizedPhone = value.replace(/\D/g, '');
      return normalizedPhone.length >= 10 && normalizedPhone.length <= 11;
    },
    message
  }),
  
  cpf: (message = 'CPF inválido') => ({
    test: (value: any) => {
      if (!value) return true; // não valida se estiver vazio
      const cpf = value.replace(/\D/g, '');
      if (cpf.length !== 11) return false;
      
      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1+$/.test(cpf)) return false;
      
      // Validação do algoritmo do CPF
      let sum = 0;
      let remainder;
      
      for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
      }
      
      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.substring(9, 10))) return false;
      
      sum = 0;
      for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
      }
      
      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.substring(10, 11))) return false;
      
      return true;
    },
    message
  }),
  
  minLength: (min: number, message = `Mínimo de ${min} caracteres`) => ({
    test: (value: any) => {
      if (!value) return true; // não valida se estiver vazio
      return String(value).length >= min;
    },
    message
  }),
  
  maxLength: (max: number, message = `Máximo de ${max} caracteres`) => ({
    test: (value: any) => {
      if (!value) return true; // não valida se estiver vazio
      return String(value).length <= max;
    },
    message
  }),
  
  numeric: (message = 'Deve conter apenas números') => ({
    test: (value: any) => {
      if (!value) return true; // não valida se estiver vazio
      return /^\d+$/.test(String(value));
    },
    message
  }),
  
  sanitize: {
    // Remove caracteres perigosos que poderiam ser usados em XSS
    text: (value: string) => {
      if (!value) return '';
      return value.replace(/<[^>]*>/g, '');
    },
    // Normaliza telefone
    phone: (value: string) => {
      if (!value) return '';
      return value.replace(/\D/g, '');
    }
  }
};
