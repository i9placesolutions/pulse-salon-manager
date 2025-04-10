
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para formatar data
export const formatDateString = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (e) {
    return 'Data inválida';
  }
};

// Função para formatar valor monetário
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};
