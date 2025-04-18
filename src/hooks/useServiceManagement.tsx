import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Service, ServicePackage } from '@/types/service';
import { useToast } from '@/components/ui/use-toast';

export interface ExtendedService extends Service {
  performanceData?: {
    appointmentsLastMonth: number;
    rating: number;
    popularityRank: number;
    avgDuration: number;
    priceHistory: { date: string; price: number }[];
    trend: 'up' | 'down' | 'stable';
  };
}

export function useServiceManagement() {
  const [services, setServices] = useState<ExtendedService[]>([]);
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Buscar todos os serviços
  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;

      // Para cada serviço, buscar dados adicionais
      const servicesWithDetails = await Promise.all(
        data.map(async (service) => {
          // Buscar profissionais relacionados
          const { data: serviceProfs, error: profsError } = await supabase
            .from('service_professionals')
            .select('professional_id')
            .eq('service_id', service.id);

          // Buscar produtos relacionados
          const { data: serviceProducts, error: productsError } = await supabase
            .from('service_products')
            .select('*')
            .eq('service_id', service.id);

          // Buscar histórico de preços
          const { data: priceHistory, error: priceHistoryError } = await supabase
            .from('service_price_history')
            .select('*')
            .eq('service_id', service.id)
            .order('date', { ascending: false })
            .limit(5);

          // Buscar dados de performance
          const { data: performanceData, error: performanceError } = await supabase
            .from('service_performance')
            .select('*')
            .eq('service_id', service.id)
            .single();

          // Mapear profissionais
          const professionals = profsError ? [] : serviceProfs.map(sp => sp.professional_id);

          // Mapear produtos
          const products = productsError ? [] : serviceProducts.map(sp => ({
            productId: sp.product_id,
            quantity: sp.quantity
          }));

          // Determinar tendência baseada no histórico de preços
          let trend: 'up' | 'down' | 'stable' = 'stable';
          if (priceHistory && priceHistory.length >= 2) {
            const latestPrice = priceHistory[0].price;
            const previousPrice = priceHistory[1].price;
            if (latestPrice > previousPrice) trend = 'up';
            else if (latestPrice < previousPrice) trend = 'down';
          }

          // Formatar histórico de preços
          const formattedPriceHistory = priceHistoryError ? [] : priceHistory.map(ph => ({
            date: ph.date,
            price: ph.price
          }));

          return {
            id: service.id,
            name: service.name,
            description: service.description,
            category: service.category,
            duration: service.duration,
            price: service.price,
            status: service.status,
            commission: {
              type: service.commission_type || 'percentage',
              value: service.commission_value || 0
            },
            professionals,
            products,
            performanceData: performanceData ? {
              appointmentsLastMonth: performanceData.appointments_last_month || 0,
              rating: performanceData.rating || 4.5,
              popularityRank: performanceData.popularity_rank || 0,
              avgDuration: performanceData.avg_duration || service.duration,
              priceHistory: formattedPriceHistory,
              trend
            } : {
              appointmentsLastMonth: 0,
              rating: 4.5,
              popularityRank: 0,
              avgDuration: service.duration,
              priceHistory: formattedPriceHistory,
              trend: 'stable'
            }
          } as ExtendedService;
        })
      );

      setServices(servicesWithDetails);
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar serviços');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os serviços.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar pacotes de serviços
  const fetchServicePackages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_packages')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;

      // Para cada pacote, buscar serviços e produtos relacionados
      const packagesWithDetails = await Promise.all(
        data.map(async (pkg) => {
          // Buscar serviços relacionados
          const { data: packageServices, error: servicesError } = await supabase
            .from('package_services')
            .select('service_id')
            .eq('package_id', pkg.id);

          // Buscar produtos relacionados
          const { data: packageProducts, error: productsError } = await supabase
            .from('package_products')
            .select('*')
            .eq('package_id', pkg.id);

          // Mapear serviços
          const services = servicesError ? [] : packageServices.map(ps => ps.service_id);

          // Mapear produtos
          const products = productsError ? [] : packageProducts.map(pp => ({
            productId: pp.product_id,
            quantity: pp.quantity
          }));

          return {
            id: pkg.id,
            name: pkg.name,
            description: pkg.description,
            services,
            products,
            discount: pkg.discount,
            status: pkg.status
          } as ServicePackage;
        })
      );

      setServicePackages(packagesWithDetails);
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar pacotes de serviços');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pacotes de serviços.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Adicionar serviço
  const addService = async (service: Omit<Service, 'id'>) => {
    try {
      setLoading(true);
      
      // 1. Inserir o serviço básico
      const { data, error } = await supabase
        .from('services')
        .insert([{
          name: service.name,
          description: service.description,
          category: service.category,
          duration: service.duration,
          price: service.price,
          status: service.status,
          commission_type: service.commission.type,
          commission_value: service.commission.value
        }])
        .select();

      if (error) throw error;
      
      const newServiceId = data[0].id;

      // 2. Inserir relacionamentos com profissionais
      if (service.professionals && service.professionals.length > 0) {
        const profRelations = service.professionals.map(profId => ({
          service_id: newServiceId,
          professional_id: profId
        }));
        
        const { error: profError } = await supabase
          .from('service_professionals')
          .insert(profRelations);
          
        if (profError) throw profError;
      }

      // 3. Inserir relacionamentos com produtos
      if (service.products && service.products.length > 0) {
        const productRelations = service.products.map(prod => ({
          service_id: newServiceId,
          product_id: prod.productId,
          quantity: prod.quantity
        }));
        
        const { error: prodError } = await supabase
          .from('service_products')
          .insert(productRelations);
          
        if (prodError) throw prodError;
      }

      // 4. Inserir primeiro registro no histórico de preços
      const { error: priceHistoryError } = await supabase
        .from('service_price_history')
        .insert([{
          service_id: newServiceId,
          price: service.price,
          date: new Date().toISOString().split('T')[0]
        }]);
        
      if (priceHistoryError) throw priceHistoryError;

      toast({
        title: 'Sucesso',
        description: 'Serviço adicionado com sucesso!',
      });

      await fetchServices();
    } catch (error: any) {
      setError(error.message || 'Erro ao adicionar serviço');
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o serviço.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Adicionar pacote de serviços
  const addServicePackage = async (pkg: Omit<ServicePackage, 'id'>) => {
    try {
      setLoading(true);
      
      // 1. Inserir o pacote básico
      const { data, error } = await supabase
        .from('service_packages')
        .insert([{
          name: pkg.name,
          description: pkg.description,
          discount: pkg.discount,
          status: pkg.status
        }])
        .select();

      if (error) throw error;
      
      const newPackageId = data[0].id;

      // 2. Inserir relacionamentos com serviços
      if (pkg.services && pkg.services.length > 0) {
        const serviceRelations = pkg.services.map(serviceId => ({
          package_id: newPackageId,
          service_id: serviceId
        }));
        
        const { error: serviceError } = await supabase
          .from('package_services')
          .insert(serviceRelations);
          
        if (serviceError) throw serviceError;
      }

      // 3. Inserir relacionamentos com produtos
      if (pkg.products && pkg.products.length > 0) {
        const productRelations = pkg.products.map(prod => ({
          package_id: newPackageId,
          product_id: prod.productId,
          quantity: prod.quantity
        }));
        
        const { error: prodError } = await supabase
          .from('package_products')
          .insert(productRelations);
          
        if (prodError) throw prodError;
      }

      toast({
        title: 'Sucesso',
        description: 'Pacote adicionado com sucesso!',
      });

      await fetchServicePackages();
    } catch (error: any) {
      setError(error.message || 'Erro ao adicionar pacote');
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o pacote.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Atualizar serviço
  const updateService = async (id: number, updates: Partial<Service>) => {
    try {
      setLoading(true);
      
      // 1. Atualizar o serviço básico
      const serviceUpdates: any = {};
      
      if (updates.name) serviceUpdates.name = updates.name;
      if (updates.description) serviceUpdates.description = updates.description;
      if (updates.category) serviceUpdates.category = updates.category;
      if (updates.duration) serviceUpdates.duration = updates.duration;
      if (updates.status) serviceUpdates.status = updates.status;
      
      // Atualizar preço e adicionar ao histórico se mudou
      if (updates.price) {
        serviceUpdates.price = updates.price;
        
        // Verificar se o preço mudou e registrar no histórico
        const { data: currentServiceData } = await supabase
          .from('services')
          .select('price')
          .eq('id', id)
          .single();
          
        if (currentServiceData && currentServiceData.price !== updates.price) {
          // Adicionar novo registro no histórico de preços
          const { error: priceHistoryError } = await supabase
            .from('service_price_history')
            .insert([{
              service_id: id,
              price: updates.price,
              date: new Date().toISOString().split('T')[0]
            }]);
            
          if (priceHistoryError) throw priceHistoryError;
        }
      }
      
      if (updates.commission) {
        serviceUpdates.commission_type = updates.commission.type;
        serviceUpdates.commission_value = updates.commission.value;
      }
      
      // Atualizar o serviço
      if (Object.keys(serviceUpdates).length > 0) {
        const { error } = await supabase
          .from('services')
          .update(serviceUpdates)
          .eq('id', id);
          
        if (error) throw error;
      }

      // 2. Atualizar relacionamentos com profissionais
      if (updates.professionals) {
        // Primeiro remover todas as relações existentes
        const { error: deleteError } = await supabase
          .from('service_professionals')
          .delete()
          .eq('service_id', id);
          
        if (deleteError) throw deleteError;
        
        // Depois adicionar as novas relações
        if (updates.professionals.length > 0) {
          const profRelations = updates.professionals.map(profId => ({
            service_id: id,
            professional_id: profId
          }));
          
          const { error: insertError } = await supabase
            .from('service_professionals')
            .insert(profRelations);
            
          if (insertError) throw insertError;
        }
      }

      // 3. Atualizar relacionamentos com produtos
      if (updates.products) {
        // Primeiro remover todas as relações existentes
        const { error: deleteError } = await supabase
          .from('service_products')
          .delete()
          .eq('service_id', id);
          
        if (deleteError) throw deleteError;
        
        // Depois adicionar as novas relações
        if (updates.products.length > 0) {
          const productRelations = updates.products.map(prod => ({
            service_id: id,
            product_id: prod.productId,
            quantity: prod.quantity
          }));
          
          const { error: insertError } = await supabase
            .from('service_products')
            .insert(productRelations);
            
          if (insertError) throw insertError;
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Serviço atualizado com sucesso!',
      });

      await fetchServices();
    } catch (error: any) {
      setError(error.message || 'Erro ao atualizar serviço');
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o serviço.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Atualizar pacote de serviços
  const updateServicePackage = async (id: number, updates: Partial<ServicePackage>) => {
    try {
      setLoading(true);
      
      // 1. Atualizar o pacote básico
      const packageUpdates: any = {};
      
      if (updates.name) packageUpdates.name = updates.name;
      if (updates.description) packageUpdates.description = updates.description;
      if (updates.discount !== undefined) packageUpdates.discount = updates.discount;
      if (updates.status) packageUpdates.status = updates.status;
      
      // Atualizar o pacote
      if (Object.keys(packageUpdates).length > 0) {
        const { error } = await supabase
          .from('service_packages')
          .update(packageUpdates)
          .eq('id', id);
          
        if (error) throw error;
      }

      // 2. Atualizar relacionamentos com serviços
      if (updates.services) {
        // Primeiro remover todas as relações existentes
        const { error: deleteError } = await supabase
          .from('package_services')
          .delete()
          .eq('package_id', id);
          
        if (deleteError) throw deleteError;
        
        // Depois adicionar as novas relações
        if (updates.services.length > 0) {
          const serviceRelations = updates.services.map(serviceId => ({
            package_id: id,
            service_id: serviceId
          }));
          
          const { error: insertError } = await supabase
            .from('package_services')
            .insert(serviceRelations);
            
          if (insertError) throw insertError;
        }
      }

      // 3. Atualizar relacionamentos com produtos
      if (updates.products) {
        // Primeiro remover todas as relações existentes
        const { error: deleteError } = await supabase
          .from('package_products')
          .delete()
          .eq('package_id', id);
          
        if (deleteError) throw deleteError;
        
        // Depois adicionar as novas relações
        if (updates.products.length > 0) {
          const productRelations = updates.products.map(prod => ({
            package_id: id,
            product_id: prod.productId,
            quantity: prod.quantity
          }));
          
          const { error: insertError } = await supabase
            .from('package_products')
            .insert(productRelations);
            
          if (insertError) throw insertError;
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Pacote atualizado com sucesso!',
      });

      await fetchServicePackages();
    } catch (error: any) {
      setError(error.message || 'Erro ao atualizar pacote');
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o pacote.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Deletar serviço
  const deleteService = async (id: number) => {
    try {
      setLoading(true);
      
      // Ao invés de deletar fisicamente, apenas alteramos o status para inactive
      const { error } = await supabase
        .from('services')
        .update({ status: 'inactive' })
        .eq('id', id);
        
      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Serviço removido com sucesso!',
      });

      await fetchServices();
    } catch (error: any) {
      setError(error.message || 'Erro ao remover serviço');
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o serviço.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Deletar pacote de serviços
  const deleteServicePackage = async (id: number) => {
    try {
      setLoading(true);
      
      // Ao invés de deletar fisicamente, apenas alteramos o status para inactive
      const { error } = await supabase
        .from('service_packages')
        .update({ status: 'inactive' })
        .eq('id', id);
        
      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Pacote removido com sucesso!',
      });

      await fetchServicePackages();
    } catch (error: any) {
      setError(error.message || 'Erro ao remover pacote');
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o pacote.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar serviços e pacotes ao montar o componente
  useEffect(() => {
    const loadData = async () => {
      await fetchServices();
      await fetchServicePackages();
    };
    loadData();
  }, []);

  return {
    services,
    servicePackages,
    loading,
    error,
    fetchServices,
    fetchServicePackages,
    addService,
    addServicePackage,
    updateService,
    updateServicePackage,
    deleteService,
    deleteServicePackage
  };
}
