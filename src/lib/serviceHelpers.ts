/**
 * Funções auxiliares para manipulação de serviços
 */

// Tipo para serviço
interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

// Lista de serviços disponíveis (mock data)
// Em um cenário real, esses dados viriam do banco de dados
const availableServices: Service[] = [
  { id: "1", name: "Corte Feminino", price: 120, duration: 60 },
  { id: "2", name: "Corte Masculino", price: 70, duration: 30 },
  { id: "3", name: "Hidratação", price: 90, duration: 45 },
  { id: "4", name: "Coloração", price: 180, duration: 120 },
  { id: "5", name: "Escova", price: 80, duration: 45 },
  { id: "6", name: "Manicure", price: 60, duration: 40 },
  { id: "7", name: "Pedicure", price: 70, duration: 50 },
  { id: "8", name: "Design de Sobrancelhas", price: 50, duration: 30 },
  { id: "9", name: "Massagem Relaxante", price: 120, duration: 60 },
  { id: "10", name: "Limpeza de Pele", price: 150, duration: 75 },
];

/**
 * Retorna um serviço pelo seu ID
 * @param serviceId ID do serviço
 * @returns Informações do serviço ou undefined se não encontrado
 */
export function getSelectedService(serviceId?: string): Service | undefined {
  if (!serviceId) return undefined;
  return availableServices.find(service => service.id === serviceId);
}

/**
 * Obtém a lista de todos os serviços disponíveis
 * @returns Lista de serviços
 */
export function getAllServices(): Service[] {
  return [...availableServices];
}

/**
 * Busca serviços por termo de busca
 * @param searchTerm Termo para busca
 * @returns Lista de serviços filtrados
 */
export function searchServices(searchTerm: string): Service[] {
  if (!searchTerm) return getAllServices();
  
  const term = searchTerm.toLowerCase().trim();
  return availableServices.filter(service => 
    service.name.toLowerCase().includes(term)
  );
}
