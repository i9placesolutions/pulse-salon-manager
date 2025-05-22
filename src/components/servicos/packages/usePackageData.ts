import { useState, useEffect } from 'react';
import { Service } from '@/types/service';
import { Product } from '@/types/product';
import { supabase } from '@/lib/supabaseClient';

export function usePackageData() {
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setIsLoadingServices(true);
      setError(null);
      
      const { data, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (serviceError) {
        console.error('Erro ao buscar serviços:', serviceError);
        setError('Não foi possível carregar os serviços');
        return;
      }
      
      // Transformar dados para o formato esperado pela interface Service
      const formattedServices: Service[] = data.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        duration: service.duration,
        price: Number(service.price),
        status: service.status,
        commission: {
          type: service.commission_type,
          value: Number(service.commission_value)
        },
        professionals: [],
        products: []
      }));
      
      setAvailableServices(formattedServices);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      setError('Ocorreu um erro ao carregar os serviços');
    } finally {
      setIsLoadingServices(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      setError(null);
      
      const { data, error: productError } = await supabase
        .from('products')
        .select('*')
        .gt('quantity', 0) // Apenas produtos em estoque
        .order('name');
      
      if (productError) {
        console.error('Erro ao buscar produtos:', productError);
        setError('Não foi possível carregar os produtos');
        return;
      }
      
      // Transformar dados para o formato esperado pela interface Product
      const formattedProducts: Product[] = data.map(product => ({
        id: product.id.toString(),
        name: product.name,
        description: product.description || '',
        category: product.category,
        price: Number(product.sale_price),
        stock: product.quantity
      }));
      
      setAvailableProducts(formattedProducts);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setError('Ocorreu um erro ao carregar os produtos');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    fetchServices();
    fetchProducts();
  }, []);

  return {
    availableServices,
    availableProducts,
    isLoadingServices,
    isLoadingProducts,
    error,
    refetchServices: fetchServices,
    refetchProducts: fetchProducts
  };
}
