
/**
 * Format a number to Brazilian currency (BRL)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Parse a currency string to a number
 */
export const parseCurrency = (value: string): number => {
  // Remove any non-numeric character except commas and dots
  const sanitized = value.replace(/[^\d,.]/g, '');
  
  // Replace comma with dot for JS parsing
  const withDot = sanitized.replace(',', '.');
  
  // Parse the string to a number
  return parseFloat(withDot) || 0;
};
