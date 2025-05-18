import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Client, ClientPreference, ClientService, ClientCoupon } from '@/types/client';
import { useToast } from '@/components/ui/use-toast';

// Hook para gerenciamento de clientes
export const useClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Buscar todos os clientes
  const fetchClients = async () => {
    try {
      setIsLoading(true);
      
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar clientes do Supabase
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      
      // Para cada cliente, buscar suas preferências, serviços e cupons
      const clientsWithDetails = await Promise.all(data.map(async (client) => {
        // Converter para o formato esperado pela interface Client
        const formattedClient: Client = {
          id: client.id,
          name: client.name,
          email: client.email || '',
          phone: client.phone || '',
          birthDate: client.birth_date || '',
          firstVisit: client.first_visit || '',
          cpf: client.cpf || '',
          address: client.address || '',
          photo: client.photo || '',
          status: client.status as 'active' | 'vip' | 'inactive',
          points: client.points || 0,
          cashback: client.cashback || 0,
          totalSpent: client.total_spent || 0,
          visitsCount: client.visits_count || 0,
          lastVisit: client.last_visit || '',
          observations: client.observations || '',
          tags: client.tags || [],
          updatedAt: client.updated_at || '',
        };
        
        return formattedClient;
      }));
      
      setClients(clientsWithDetails);
      return clientsWithDetails;
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: 'Erro ao carregar clientes',
        description: (error as Error).message,
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar preferências de um cliente específico
  const fetchClientPreferences = async (clientId: string): Promise<ClientPreference[]> => {
    try {
      const { data, error } = await supabase
        .from('client_preferences')
        .select('*')
        .eq('client_id', clientId);
      
      if (error) throw error;
      
      return data.map(pref => ({
        id: pref.id,
        clientId: Number(clientId),
        category: pref.category,
        description: pref.description,
      }));
    } catch (error) {
      console.error('Erro ao buscar preferências do cliente:', error);
      return [];
    }
  };

  // Buscar serviços de um cliente específico
  const fetchClientServices = async (clientId: string): Promise<ClientService[]> => {
    try {
      const { data, error } = await supabase
        .from('client_services')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      return data.map(service => ({
        id: service.id,
        clientId: Number(clientId),
        date: service.date,
        professional: service.professional,
        service: service.service,
        value: service.value,
        paymentMethod: service.payment_method,
        observations: service.observations || '',
        status: service.status as 'scheduled' | 'completed' | 'canceled',
        cashbackGenerated: service.cashback_generated || 0,
        pointsGenerated: service.points_generated || 0,
      }));
    } catch (error) {
      console.error('Erro ao buscar serviços do cliente:', error);
      return [];
    }
  };

  // Buscar cupons de um cliente específico
  const fetchClientCoupons = async (clientId: string): Promise<ClientCoupon[]> => {
    try {
      const { data, error } = await supabase
        .from('client_coupons')
        .select('*')
        .eq('client_id', clientId)
        .order('expiration_date');
      
      if (error) throw error;
      
      return data.map(coupon => ({
        id: coupon.id,
        clientId: Number(clientId),
        code: coupon.code,
        discount: coupon.discount,
        discountType: coupon.discount_type as 'percentage' | 'fixed',
        service: coupon.service || undefined,
        description: coupon.description || undefined,
        date: coupon.date || undefined,
        expirationDate: coupon.expiration_date,
        isUsed: coupon.is_used,
      }));
    } catch (error) {
      console.error('Erro ao buscar cupons do cliente:', error);
      return [];
    }
  };

  // Adicionar um novo cliente
  const addClient = async (clientData: Omit<Client, 'id'>) => {
    try {
      setIsLoading(true);
      
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Preparar dados para inserção no formato do banco
      const clientForInsert = {
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        birth_date: clientData.birthDate,
        first_visit: clientData.firstVisit,
        cpf: clientData.cpf,
        address: clientData.address,
        photo: clientData.photo,
        status: clientData.status,
        points: clientData.points,
        cashback: clientData.cashback,
        total_spent: clientData.totalSpent,
        visits_count: clientData.visitsCount,
        last_visit: clientData.lastVisit,
        observations: clientData.observations,
        tags: clientData.tags,
        user_id: user.id,
      };
      
      // Inserir na tabela de clientes
      const { data, error } = await supabase
        .from('clients')
        .insert(clientForInsert)
        .select()
        .single();
        
      if (error) throw error;
      
      // Converter para o formato esperado pelo front-end
      const newClient: Client = {
        id: data.id,
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        birthDate: data.birth_date || '',
        firstVisit: data.first_visit || '',
        cpf: data.cpf || '',
        address: data.address || '',
        photo: data.photo || '',
        status: data.status as 'active' | 'vip' | 'inactive',
        points: data.points || 0,
        cashback: data.cashback || 0,
        totalSpent: data.total_spent || 0,
        visitsCount: data.visits_count || 0,
        lastVisit: data.last_visit || '',
        observations: data.observations || '',
        tags: data.tags || [],
      };
      
      // Atualizar estado com o novo cliente
      setClients(prevClients => [...prevClients, newClient]);
      
      toast({
        title: 'Cliente adicionado',
        description: `${newClient.name} foi adicionado com sucesso.`,
      });
      
      return newClient;
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      toast({
        title: 'Erro ao adicionar cliente',
        description: (error as Error).message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar um cliente existente
  const updateClient = async (clientId: string, clientData: Partial<Client>) => {
    try {
      setIsLoading(true);
      
      // Preparar dados para atualização
      const clientForUpdate = {
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        birth_date: clientData.birthDate ? clientData.birthDate : null,
        first_visit: clientData.firstVisit ? clientData.firstVisit : null,
        cpf: clientData.cpf,
        address: clientData.address,
        photo: clientData.photo,
        status: clientData.status,
        points: clientData.points,
        cashback: clientData.cashback,
        total_spent: clientData.totalSpent,
        visits_count: clientData.visitsCount,
        last_visit: clientData.lastVisit ? clientData.lastVisit : null,
        observations: clientData.observations,
        tags: clientData.tags,
      };
      
      // Remover campos undefined para não sobrescrever dados existentes
      Object.keys(clientForUpdate).forEach(key => {
        if (clientForUpdate[key as keyof typeof clientForUpdate] === undefined) {
          delete clientForUpdate[key as keyof typeof clientForUpdate];
        }
      });
      
      // Também converte string vazia para null em campos de data
      if (clientForUpdate.birth_date === '') clientForUpdate.birth_date = null;
      if (clientForUpdate.first_visit === '') clientForUpdate.first_visit = null;
      if (clientForUpdate.last_visit === '') clientForUpdate.last_visit = null;
      
      // Atualizar no Supabase
      const { error } = await supabase
        .from('clients')
        .update(clientForUpdate)
        .eq('id', clientId);
      
      if (error) throw error;
      
      // Atualizar estado local
      setClients(prevClients => 
        prevClients.map(client => 
          client.id === clientId 
            ? { ...client, ...clientData } 
            : client
        )
      );
      
      toast({
        title: 'Cliente atualizado',
        description: `As informações do cliente foram atualizadas com sucesso.`,
      });
      
      // Retornar o cliente atualizado
      const updatedClient = clients.find(c => c.id === clientId);
      if (updatedClient) {
        return { ...updatedClient, ...clientData };
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast({
        title: 'Erro ao atualizar cliente',
        description: (error as Error).message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Deletar um cliente
  const deleteClient = async (clientId: string) => {
    try {
      setIsLoading(true);
      
      // Deletar no Supabase
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);
      
      if (error) throw error;
      
      // Atualizar estado local
      setClients(prevClients => prevClients.filter(client => client.id !== clientId));
      
      toast({
        title: 'Cliente removido',
        description: 'O cliente foi removido com sucesso.',
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      toast({
        title: 'Erro ao remover cliente',
        description: (error as Error).message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Adicionar uma preferência a um cliente
  const addClientPreference = async (clientId: string, preference: Omit<ClientPreference, 'id' | 'clientId'>) => {
    try {
      const { data, error } = await supabase
        .from('client_preferences')
        .insert({
          client_id: clientId,
          category: preference.category,
          description: preference.description,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Preferência adicionada',
        description: 'A preferência foi adicionada com sucesso.',
      });
      
      return {
        id: data.id,
        clientId: Number(clientId),
        category: data.category,
        description: data.description,
      };
    } catch (error) {
      console.error('Erro ao adicionar preferência:', error);
      toast({
        title: 'Erro ao adicionar preferência',
        description: (error as Error).message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Adicionar um serviço a um cliente
  const addClientService = async (clientId: string, service: Omit<ClientService, 'id' | 'clientId'>) => {
    try {
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('client_services')
        .insert({
          client_id: clientId,
          date: service.date,
          professional: service.professional,
          service: service.service,
          value: service.value,
          payment_method: service.paymentMethod,
          observations: service.observations,
          status: service.status,
          cashback_generated: service.cashbackGenerated,
          points_generated: service.pointsGenerated,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Serviço adicionado',
        description: 'O serviço foi adicionado com sucesso.',
      });
      
      return {
        id: data.id,
        clientId: Number(clientId),
        date: data.date,
        professional: data.professional,
        service: data.service,
        value: data.value,
        paymentMethod: data.payment_method,
        observations: data.observations || '',
        status: data.status as 'scheduled' | 'completed' | 'canceled',
        cashbackGenerated: data.cashback_generated || 0,
        pointsGenerated: data.points_generated || 0,
      };
    } catch (error) {
      console.error('Erro ao adicionar serviço:', error);
      toast({
        title: 'Erro ao adicionar serviço',
        description: (error as Error).message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Adicionar um cupom a um cliente
  const addClientCoupon = async (clientId: string, coupon: Omit<ClientCoupon, 'id' | 'clientId'>) => {
    try {
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('client_coupons')
        .insert({
          client_id: clientId,
          code: coupon.code,
          discount: coupon.discount,
          discount_type: coupon.discountType,
          service: coupon.service,
          description: coupon.description,
          date: coupon.date,
          expiration_date: coupon.expirationDate,
          is_used: coupon.isUsed,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Cupom adicionado',
        description: 'O cupom foi adicionado com sucesso.',
      });
      
      return {
        id: data.id,
        clientId: Number(clientId),
        code: data.code,
        discount: data.discount,
        discountType: data.discount_type as 'percentage' | 'fixed',
        service: data.service || undefined,
        description: data.description || undefined,
        date: data.date || undefined,
        expirationDate: data.expiration_date,
        isUsed: data.is_used,
      };
    } catch (error) {
      console.error('Erro ao adicionar cupom:', error);
      toast({
        title: 'Erro ao adicionar cupom',
        description: (error as Error).message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Atualizar serviço de um cliente
  const updateClientService = async (serviceId: number, serviceData: Partial<ClientService>) => {
    try {
      const serviceForUpdate = {
        date: serviceData.date,
        professional: serviceData.professional,
        service: serviceData.service,
        value: serviceData.value,
        payment_method: serviceData.paymentMethod,
        observations: serviceData.observations,
        status: serviceData.status,
        cashback_generated: serviceData.cashbackGenerated,
        points_generated: serviceData.pointsGenerated,
      };
      
      // Remover campos undefined
      Object.keys(serviceForUpdate).forEach(key => {
        if (serviceForUpdate[key as keyof typeof serviceForUpdate] === undefined) {
          delete serviceForUpdate[key as keyof typeof serviceForUpdate];
        }
      });
      
      const { error } = await supabase
        .from('client_services')
        .update(serviceForUpdate)
        .eq('id', serviceId);
      
      if (error) throw error;
      
      toast({
        title: 'Serviço atualizado',
        description: 'O serviço foi atualizado com sucesso.',
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      toast({
        title: 'Erro ao atualizar serviço',
        description: (error as Error).message,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Deletar um serviço
  const deleteClientService = async (serviceId: number) => {
    try {
      const { error } = await supabase
        .from('client_services')
        .delete()
        .eq('id', serviceId);
      
      if (error) throw error;
      
      toast({
        title: 'Serviço removido',
        description: 'O serviço foi removido com sucesso.',
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar serviço:', error);
      toast({
        title: 'Erro ao remover serviço',
        description: (error as Error).message,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Carregar clientes ao inicializar o hook
  useEffect(() => {
    fetchClients();
    
    // Configurar inscrição realtime para atualizações na tabela clients
    const clientsSubscription = supabase
      .channel('clients-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'clients' }, 
        (payload) => {
          console.log('Mudança detectada em clients:', payload);
          fetchClients(); // Recarregar os clientes quando houver mudanças
        }
      )
      .subscribe();
      
    // Cleanup: remover inscrição quando o componente for desmontado
    return () => {
      supabase.removeChannel(clientsSubscription);
    };
  }, []);

  return {
    clients,
    isLoading,
    fetchClients,
    fetchClientPreferences,
    fetchClientServices,
    fetchClientCoupons,
    addClient,
    updateClient,
    deleteClient,
    addClientPreference,
    addClientService,
    addClientCoupon,
    updateClientService,
    deleteClientService,
  };
};
