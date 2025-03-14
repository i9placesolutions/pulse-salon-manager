export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function parseCurrency(value: string): number {
  // Remove qualquer caractere não numérico exceto virgula e ponto
  const numericString = value.replace(/[^\d,.-]/g, "");
  
  // Converte vírgula para ponto (padrão brasileiro para decimal)
  const normalizedString = numericString.replace(",", ".");
  
  // Converte para número
  const numericValue = parseFloat(normalizedString);
  
  // Verifica se é um número válido
  if (isNaN(numericValue)) {
    return 0;
  }
  
  return numericValue;
}
