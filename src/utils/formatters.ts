/**
 * Formata uma data para o formato YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formata o tipo de campanha para o nome amigável
 */
export function formatCampaignType(type: string): string {
  switch (type) {
    case 'discount': return 'Desconto';
    case 'coupon': return 'Cupom';
    case 'cashback': return 'Cashback';
    case 'vip': return 'Programa VIP';
    default: return type;
  }
}

/**
 * Formata o status da campanha para o nome amigável
 */
export function formatCampaignStatus(status: string): string {
  switch (status) {
    case 'active': return 'Ativa';
    case 'scheduled': return 'Agendada';
    case 'completed': return 'Concluída';
    case 'draft': return 'Rascunho';
    default: return status;
  }
}
