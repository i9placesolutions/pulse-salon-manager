/**
 * Utilitário para converter entre formatos de nome de campos
 * Fornece funções para converter entre camelCase e snake_case
 */

/**
 * Converte uma string de camelCase para snake_case
 * Ex: "nomeCliente" -> "nome_cliente"
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Converte uma string de snake_case para camelCase
 * Ex: "nome_cliente" -> "nomeCliente"
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converte um objeto com chaves em camelCase para um objeto com chaves em snake_case
 * Processa recursivamente objects aninhados e arrays
 */
export function objectToDatabaseFormat<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => objectToDatabaseFormat(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const newObj: Record<string, any> = {};
    
    Object.keys(obj).forEach(key => {
      // Ignora métodos e funções
      if (typeof obj[key] === 'function') return;
      
      const snakeKey = camelToSnake(key);
      
      // Processa recursivamente se for object ou array
      if (obj[key] !== null && typeof obj[key] === 'object') {
        newObj[snakeKey] = objectToDatabaseFormat(obj[key]);
      } else {
        newObj[snakeKey] = obj[key];
      }
    });
    
    return newObj as T;
  }
  
  return obj as T;
}

/**
 * Converte um objeto com chaves em snake_case para um objeto com chaves em camelCase
 * Processa recursivamente objects aninhados e arrays
 */
export function objectToUIFormat<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => objectToUIFormat(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const newObj: Record<string, any> = {};
    
    Object.keys(obj).forEach(key => {
      // Ignora métodos e funções
      if (typeof obj[key] === 'function') return;
      
      const camelKey = snakeToCamel(key);
      
      // Processa recursivamente se for object ou array
      if (obj[key] !== null && typeof obj[key] === 'object') {
        newObj[camelKey] = objectToUIFormat(obj[key]);
      } else {
        newObj[camelKey] = obj[key];
      }
    });
    
    return newObj as T;
  }
  
  return obj as T;
}
