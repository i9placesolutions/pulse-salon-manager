// Utilitários de validação para diferentes tipos de dados

/**
 * Valida um número de telefone brasileiro
 * @param phone - Número de telefone a ser validado
 * @returns Verdadeiro se for válido
 */
export const isValidPhone = (phone: string): boolean => {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verifica se tem a quantidade correta de dígitos (10 ou 11)
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

/**
 * Formata um número de telefone como (XX) XXXXX-XXXX
 * @param phone - Número de telefone a ser formatado
 * @returns Telefone formatado
 */
export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 11) {
    return `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 7)}-${cleanPhone.substring(7, 11)}`;
  } else if (cleanPhone.length === 10) {
    return `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 6)}-${cleanPhone.substring(6, 10)}`;
  }
  
  return phone;
};

/**
 * Valida um endereço de e-mail
 * @param email - Email a ser validado
 * @returns Verdadeiro se for válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida um CEP brasileiro
 * @param cep - CEP a ser validado
 * @returns Verdadeiro se for válido
 */
export const isValidCEP = (cep: string): boolean => {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.length === 8;
};

/**
 * Formata um CEP como XXXXX-XXX
 * @param cep - CEP a ser formatado
 * @returns CEP formatado
 */
export const formatCEP = (cep: string): string => {
  const cleanCEP = cep.replace(/\D/g, '');
  
  if (cleanCEP.length === 8) {
    return `${cleanCEP.substring(0, 5)}-${cleanCEP.substring(5, 8)}`;
  }
  
  return cep;
};

/**
 * Valida se uma URL é válida
 * @param url - URL a ser validada
 * @returns Verdadeiro se for válida
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Valida um objeto de perfil de estabelecimento
 * @param profile - Perfil de estabelecimento
 * @returns Um objeto com os erros encontrados, ou null se não houver erros
 */
export const validateEstablishmentProfile = (profile: any): Record<string, string> | null => {
  const errors: Record<string, string> = {};
  
  // Validações básicas
  if (!profile.name || profile.name.trim().length < 3) {
    errors.name = "O nome deve ter pelo menos 3 caracteres";
  }
  
  if (!isValidEmail(profile.email)) {
    errors.email = "Email inválido";
  }
  
  if (profile.whatsapp && !isValidPhone(profile.whatsapp)) {
    errors.whatsapp = "Número de WhatsApp inválido";
  }
  
  if (profile.address?.zipCode && !isValidCEP(profile.address.zipCode)) {
    errors.zipCode = "CEP inválido";
  }
  
  // Validação de campos obrigatórios do endereço
  if (!profile.address?.street || profile.address.street.trim().length === 0) {
    errors.street = "A rua é obrigatória";
  }
  
  if (!profile.address?.number || profile.address.number.trim().length === 0) {
    errors.number = "O número é obrigatório";
  }
  
  if (!profile.address?.neighborhood || profile.address.neighborhood.trim().length === 0) {
    errors.neighborhood = "O bairro é obrigatório";
  }
  
  if (!profile.address?.city || profile.address.city.trim().length === 0) {
    errors.city = "A cidade é obrigatória";
  }
  
  if (!profile.address?.state || profile.address.state.trim().length === 0) {
    errors.state = "O estado é obrigatório";
  }
  
  // Verificar se existem erros
  return Object.keys(errors).length > 0 ? errors : null;
};
