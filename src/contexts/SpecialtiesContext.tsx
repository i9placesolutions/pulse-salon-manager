
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProfessionalSpecialty } from '@/types/professional';
import { useToast } from '@/hooks/use-toast';

// Especialidades padrão
const DEFAULT_SPECIALTIES: ProfessionalSpecialty[] = [
  { id: "1", name: 'Cabeleireiro', color: '#db2777', isActive: true },
  { id: "2", name: 'Barbeiro', color: '#8884d8', isActive: true },
  { id: "3", name: 'Manicure', color: '#82ca9d', isActive: true },
  { id: "4", name: 'Pedicure', color: '#ffc658', isActive: true },
  { id: "5", name: 'Esteticista', color: '#ff8042', isActive: true },
  { id: "6", name: 'Maquiador', color: '#4dabf5', isActive: true },
];

interface SpecialtiesContextType {
  specialties: ProfessionalSpecialty[];
  addSpecialty: (specialty: Omit<ProfessionalSpecialty, 'id'>) => void;
  updateSpecialty: (specialty: ProfessionalSpecialty) => void;
  deleteSpecialty: (id: string) => void; // Changed from number to string
  toggleSpecialtyActive: (id: string) => boolean; // Changed from number to string
}

const SpecialtiesContext = createContext<SpecialtiesContextType | undefined>(undefined);

export function useSpecialties() {
  const context = useContext(SpecialtiesContext);
  if (context === undefined) {
    throw new Error('useSpecialties must be used within a SpecialtiesProvider');
  }
  return context;
}

interface SpecialtiesProviderProps {
  children: ReactNode;
}

export function SpecialtiesProvider({ children }: SpecialtiesProviderProps) {
  const [specialties, setSpecialties] = useState<ProfessionalSpecialty[]>([]);
  const { toast } = useToast();

  // Carregar especialidades ao iniciar (em uma aplicação real, viria de uma API)
  useEffect(() => {
    // Simular carregamento de dados
    const storedSpecialties = localStorage.getItem('specialties');
    if (storedSpecialties) {
      try {
        setSpecialties(JSON.parse(storedSpecialties));
      } catch (error) {
        console.error('Erro ao carregar especialidades:', error);
        setSpecialties(DEFAULT_SPECIALTIES);
      }
    } else {
      setSpecialties(DEFAULT_SPECIALTIES);
    }
  }, []);

  // Salvar especialidades no localStorage quando atualizar
  useEffect(() => {
    if (specialties.length > 0) {
      localStorage.setItem('specialties', JSON.stringify(specialties));
    }
  }, [specialties]);

  const addSpecialty = (specialty: Omit<ProfessionalSpecialty, 'id'>) => {
    // Verificar se a especialidade já existe
    if (specialties.some(s => s.name.toLowerCase() === specialty.name.toLowerCase())) {
      toast({
        title: "Especialidade já existe",
        description: `A especialidade "${specialty.name}" já está cadastrada.`,
        variant: "destructive",
      });
      return;
    }

    const newSpecialty: ProfessionalSpecialty = {
      ...specialty,
      id: String(Math.max(0, ...specialties.map(s => Number(s.id))) + 1), // Convert to string
    };

    setSpecialties([...specialties, newSpecialty]);
    toast({
      title: "Especialidade adicionada",
      description: `A especialidade "${newSpecialty.name}" foi adicionada com sucesso.`,
    });
  };

  const updateSpecialty = (updatedSpecialty: ProfessionalSpecialty) => {
    // Verificar se o novo nome já existe em outra especialidade
    if (specialties.some(s => 
      s.id !== updatedSpecialty.id && 
      s.name.toLowerCase() === updatedSpecialty.name.toLowerCase()
    )) {
      toast({
        title: "Nome já existe",
        description: `Já existe uma especialidade com o nome "${updatedSpecialty.name}".`,
        variant: "destructive",
      });
      return;
    }

    setSpecialties(specialties.map(s => 
      s.id === updatedSpecialty.id ? updatedSpecialty : s
    ));
    toast({
      title: "Especialidade atualizada",
      description: `A especialidade foi atualizada com sucesso.`,
    });
  };

  const deleteSpecialty = (id: string) => { // Changed from number to string
    setSpecialties(specialties.filter(s => s.id !== id));
    toast({
      title: "Especialidade removida",
      description: `A especialidade foi removida com sucesso.`,
    });
  };

  const toggleSpecialtyActive = (id: string) => { // Changed from number to string
    let result = false;
    setSpecialties(specialties.map(s => {
      if (s.id === id) {
        result = !s.isActive;
        return { ...s, isActive: !s.isActive };
      }
      return s;
    }));
    
    // Retorna o novo estado da especialidade
    return result;
  };

  const value = {
    specialties,
    addSpecialty,
    updateSpecialty,
    deleteSpecialty,
    toggleSpecialtyActive,
  };

  return (
    <SpecialtiesContext.Provider value={value}>
      {children}
    </SpecialtiesContext.Provider>
  );
}
