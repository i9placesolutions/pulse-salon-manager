
/**
 * Format a number to Brazilian currency (BRL)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Parse a currency string to a number
 */
export const parseCurrency = (value: string): number => {
  // Remove any non-numeric character except commas and dots
  const sanitized = value.replace(/[^\d,.]/g, '');
  
  // Handle different number formats
  let withDot: string;
  
  // Identificar o formato brasileiro (usando vírgula como decimal)
  if (sanitized.includes(',')) {
    // Replace the last comma with a dot for JS parsing
    const parts = sanitized.split(',');
    const lastPart = parts.pop() || '';
    const firstPart = parts.join('');
    // Remove any dots (thousand separators) before joining
    withDot = firstPart.replace(/\./g, '') + '.' + lastPart;
  } else {
    // Caso o valor não tenha vírgula, remover pontos de milhar e tratar como número inteiro
    withDot = sanitized.replace(/\./g, '');
  }
  
  // Parse the string to a number
  return parseFloat(withDot) || 0;
};

/**
 * Format a value in real-time as the user types (for input fields)
 * Returns a formatted string in the Brazilian currency format (R$ X.XXX,XX)
 */
export const formatCurrencyInput = (value: string): string => {
  // Remove tudo que não for número
  let nums = value.replace(/\D/g, '');
  
  // Converter para número dividido por 100 (para ter os centavos)
  let num = parseInt(nums) / 100;
  
  // Se não for um número válido, retorna o valor padrão
  if (isNaN(num)) {
    return 'R$ 0,00';
  }
  
  // Formatar com a máscara brasileira
  return formatCurrency(num);
};
