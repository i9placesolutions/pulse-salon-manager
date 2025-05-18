import { useState, useEffect } from "react";
import { Product, StockMovement, Supplier, StockMetrics } from "@/types/stock";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

const calculateMetrics = (products: Product[]): StockMetrics => {
  return {
    totalProducts: products.length,
    inStockProducts: products.filter(p => p.quantity > 0).length,
    lowStockProducts: products.filter(p => p.quantity < p.minQuantity).length,
    topSellingProducts: [...products].sort((a, b) => b.salePrice - a.salePrice).slice(0, 5),
  };
};

export const useStockManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [metrics, setMetrics] = useState<StockMetrics>({ totalProducts: 0, inStockProducts: 0, lowStockProducts: 0, topSellingProducts: [] });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Carregar dados iniciais e configurar assinaturas em tempo real
  useEffect(() => {
    loadInitialData();
    
    // Configurar assinaturas em tempo real
    const productsSubscription = supabase
      .channel('stock-products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        console.log('Mudança detectada em produtos:', payload);
        // Recarregar produtos
        loadProducts();
      })
      .subscribe();
      
    const suppliersSubscription = supabase
      .channel('stock-suppliers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers' }, (payload) => {
        console.log('Mudança detectada em fornecedores:', payload);
        // Recarregar fornecedores
        loadSuppliers();
      })
      .subscribe();
      
    const movementsSubscription = supabase
      .channel('stock-movements-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_movements' }, (payload) => {
        console.log('Mudança detectada em movimentações de estoque:', payload);
        // Recarregar movimentações
        loadStockMovements();
      })
      .subscribe();
    
    // Limpeza das assinaturas quando o componente for desmontado
    return () => {
      productsSubscription.unsubscribe();
      suppliersSubscription.unsubscribe();
      movementsSubscription.unsubscribe();
    };
  }, []);

  // Atualizar métricas quando produtos mudam
  useEffect(() => {
    setMetrics(calculateMetrics(products));
  }, [products]);

  // Função para carregar todos os dados iniciais
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadProducts(),
        loadSuppliers(),
        loadStockMovements()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do estoque.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para carregar produtos
  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
        
      if (error) throw error;
      
      // Converter do formato do banco (snake_case) para o formato frontend (camelCase)
      const convertedProducts: Product[] = data ? data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        barcode: item.barcode,
        category: item.category,
        measurementUnit: item.measurement_unit,
        measurementValue: item.measurement_value,
        supplierId: item.supplier_id,
        purchasePrice: item.purchase_price,
        salePrice: item.sale_price,
        quantity: item.quantity,
        minQuantity: item.min_quantity,
        expirationDate: item.expiration_date,
        lastUpdated: item.last_updated,
        linkedServices: item.linked_services,
        commission: item.commission
      })) : [];
      
      setProducts(convertedProducts);
      return convertedProducts;
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      throw error;
    }
  };
  
  // Função para carregar fornecedores
  const loadSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*');
        
      if (error) throw error;
      setSuppliers(data || []);
      return data;
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      throw error;
    }
  };
  
  // Função para carregar movimentações de estoque
  const loadStockMovements = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      // Converter do formato do banco (snake_case) para o formato frontend (camelCase)
      const convertedMovements: StockMovement[] = data ? data.map(item => ({
        id: item.id,
        productId: item.product_id,
        type: item.type,
        quantity: item.quantity,
        reason: item.reason,
        notes: item.notes,
        date: item.date
      })) : [];
      
      setStockMovements(convertedMovements);
      return convertedMovements;
    } catch (error) {
      console.error('Erro ao carregar movimentações de estoque:', error);
      throw error;
    }
  };

  // CRUD para produtos
  const addProduct = async (product: Omit<Product, "id">) => {
    setIsLoading(true);
    try {
      // Converte de camelCase para snake_case para corresponder ao esquema do banco
      const newProduct = {
        name: product.name,
        description: product.description || "",
        barcode: product.barcode,
        category: product.category,
        measurement_unit: product.measurementUnit,
        measurement_value: product.measurementValue,
        supplier_id: product.supplierId,
        purchase_price: product.purchasePrice,
        sale_price: product.salePrice,
        quantity: product.quantity,
        min_quantity: product.minQuantity,
        expiration_date: product.expirationDate,
        last_updated: new Date().toISOString(),
        linked_services: product.linkedServices,
        commission: product.commission,
        created_at: new Date().toISOString()
      };
      
      // Log para depurar o objeto que está sendo enviado
      console.log('Enviando produto para o Supabase:', newProduct);
      
      const { data, error } = await supabase
        .from('products')
        .insert(newProduct)
        .select();
      
      if (error) {
        console.error('Erro detalhado do Supabase:', error);
        throw error;
      }
      
      if (data && data[0]) {
        // Converte o resultado de volta para camelCase
        const convertedProduct: Product = {
          id: data[0].id,
          name: data[0].name,
          description: data[0].description,
          barcode: data[0].barcode,
          category: data[0].category,
          measurementUnit: data[0].measurement_unit,
          measurementValue: data[0].measurement_value,
          supplierId: data[0].supplier_id,
          purchasePrice: data[0].purchase_price,
          salePrice: data[0].sale_price,
          quantity: data[0].quantity,
          minQuantity: data[0].min_quantity,
          expirationDate: data[0].expiration_date,
          lastUpdated: data[0].last_updated,
          linkedServices: data[0].linked_services,
          commission: data[0].commission
        };
        
        setProducts(current => [...current, convertedProduct]);
        return convertedProduct;
      }
      
      throw new Error("Erro ao adicionar produto: retorno vazio do banco de dados.");
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    setIsLoading(true);
    try {
      // Converte de camelCase para snake_case para corresponder ao esquema do banco
      const productToUpdate = {
        name: updatedProduct.name,
        description: updatedProduct.description || "",
        barcode: updatedProduct.barcode,
        category: updatedProduct.category,
        measurement_unit: updatedProduct.measurementUnit,
        measurement_value: updatedProduct.measurementValue,
        supplier_id: updatedProduct.supplierId,
        purchase_price: updatedProduct.purchasePrice,
        sale_price: updatedProduct.salePrice,
        quantity: updatedProduct.quantity,
        min_quantity: updatedProduct.minQuantity,
        expiration_date: updatedProduct.expirationDate,
        last_updated: new Date().toISOString(),
        linked_services: updatedProduct.linkedServices,
        commission: updatedProduct.commission
      };

      console.log('Atualizando produto no Supabase:', productToUpdate);
      
      const { error } = await supabase
        .from('products')
        .update(productToUpdate)
        .eq('id', updatedProduct.id);
      
      if (error) {
        console.error('Erro detalhado do Supabase:', error);
        throw error;
      }
      
      // Atualizar o estado local com o produto atualizado
      const updatedWithTimestamp = {
        ...updatedProduct,
        lastUpdated: new Date().toISOString()
      };
      
      setProducts(current =>
        current.map(product =>
          product.id === updatedProduct.id ? updatedWithTimestamp : product
        )
      );
      
      return updatedWithTimestamp;
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (productId: number) => {
    setIsLoading(true);
    try {
      // Verificar se existem movimentos de estoque relacionados
      const { data: relatedMovements, error: checkError } = await supabase
        .from('stock_movements')
        .select('id')
        .eq('productId', productId)
        .limit(1);
        
      if (checkError) throw checkError;
      
      if (relatedMovements && relatedMovements.length > 0) {
        throw new Error("Não é possível excluir um produto que possui movimentações de estoque.");
      }
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      
      setProducts(current => current.filter(product => product.id !== productId));
      return true;
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro ao excluir produto. Verifique o console para mais detalhes.");
    } finally {
      setIsLoading(false);
    }
  };

  // CRUD para fornecedores
  const addSupplier = async (supplier: Omit<Supplier, "id">) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplier)
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        setSuppliers(current => [...current, data[0]]);
        return data[0];
      }
      
      throw new Error("Erro ao adicionar fornecedor: retorno vazio do banco de dados.");
    } catch (error) {
      console.error("Erro ao adicionar fornecedor:", error);
      throw new Error("Erro ao adicionar fornecedor. Verifique o console para mais detalhes.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSupplier = async (updatedSupplier: Supplier) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .update(updatedSupplier)
        .eq('id', updatedSupplier.id)
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        setSuppliers(current => 
          current.map(supplier => 
            supplier.id === updatedSupplier.id ? data[0] : supplier
          )
        );
        return data[0];
      }
      
      throw new Error("Erro ao atualizar fornecedor: retorno vazio do banco de dados.");
    } catch (error) {
      console.error("Erro ao atualizar fornecedor:", error);
      throw new Error("Erro ao atualizar fornecedor. Verifique o console para mais detalhes.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSupplier = async (supplierId: number) => {
    setIsLoading(true);
    try {
      // Verificar se existem produtos relacionados
      const { data: relatedProducts, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('supplierId', supplierId)
        .limit(1);
        
      if (checkError) throw checkError;
      
      if (relatedProducts && relatedProducts.length > 0) {
        throw new Error("Não é possível excluir um fornecedor que está vinculado a produtos.");
      }
      
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierId);
      
      if (error) throw error;
      
      setSuppliers(current => current.filter(supplier => supplier.id !== supplierId));
      return true;
    } catch (error) {
      console.error("Erro ao excluir fornecedor:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro ao excluir fornecedor. Verifique o console para mais detalhes.");
    } finally {
      setIsLoading(false);
    }
  };

  // Gerenciamento de movimentações de estoque
  const registerStockMovement = async (movement: Omit<StockMovement, "id" | "date">) => {
    setIsLoading(true);
    try {
      // Buscar o produto no banco
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', movement.productId)
        .single();
      
      if (productError) throw productError;
      
      if (!productData) {
        throw new Error("Produto não encontrado.");
      }
      
      // Validação para movimentação de saída
      if (movement.type === "out" && movement.quantity > productData.quantity) {
        throw new Error(`Quantidade insuficiente em estoque. Disponível: ${productData.quantity}`);
      }
      
      // Criar a movimentação de estoque com a data atual
      // Converte de camelCase para snake_case para corresponder ao esquema do banco
      const newMovement = {
        product_id: movement.productId,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason,
        notes: movement.notes,
        date: new Date().toISOString()
      };
      
      console.log('Registrando movimento de estoque:', newMovement);
      
      // Registrar a movimentação no banco
      const { data: movementData, error: movementError } = await supabase
        .from('stock_movements')
        .insert(newMovement)
        .select();
      
      if (movementError) {
        console.error('Erro detalhado do Supabase:', movementError);
        throw movementError;
      }
      
      if (!movementData || !movementData[0]) {
        throw new Error("Erro ao registrar movimentação: retorno vazio do banco de dados.");
      }
      
      // Atualizar a quantidade do produto
      const updatedQuantity = movement.type === "in" 
        ? productData.quantity + movement.quantity 
        : productData.quantity - movement.quantity;
      
      // Construir o produto com os campos no formato correto para atualização
      const productToUpdate: Product = {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        barcode: productData.barcode,
        category: productData.category,
        measurementUnit: productData.measurement_unit,
        measurementValue: productData.measurement_value,
        supplierId: productData.supplier_id,
        purchasePrice: productData.purchase_price,
        salePrice: productData.sale_price,
        quantity: updatedQuantity, // Atualiza a quantidade
        minQuantity: productData.min_quantity,
        expirationDate: productData.expiration_date,
        lastUpdated: productData.last_updated,
        linkedServices: productData.linked_services,
        commission: productData.commission
      };
      
      // Atualizar o produto no banco
      await updateProduct(productToUpdate);
      
      // Converter o movimento para o formato frontend (camelCase)
      const convertedMovement: StockMovement = {
        id: movementData[0].id,
        productId: movementData[0].product_id,
        type: movementData[0].type,
        quantity: movementData[0].quantity,
        reason: movementData[0].reason,
        notes: movementData[0].notes,
        date: movementData[0].date
      };
      
      // Atualizar o estado local
      setStockMovements(current => [convertedMovement, ...current]);
      
      return convertedMovement;
    } catch (error) {
      console.error("Erro ao registrar movimentação de estoque:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro ao registrar movimentação de estoque. Verifique o console para mais detalhes.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    products,
    suppliers,
    stockMovements,
    metrics,
    isLoading,
    loadInitialData,
    loadProducts,
    loadSuppliers,
    loadStockMovements,
    addProduct,
    updateProduct,
    deleteProduct,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    registerStockMovement
  };
};
