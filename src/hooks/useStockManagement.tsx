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

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  // Atualizar métricas quando produtos mudam
  useEffect(() => {
    setMetrics(calculateMetrics(products));
  }, [products]);

  // Função para carregar todos os dados iniciais
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Carregar produtos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');
        
      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Carregar fornecedores
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*');
        
      if (suppliersError) throw suppliersError;
      setSuppliers(suppliersData || []);

      // Carregar movimentações de estoque
      const { data: movementsData, error: movementsError } = await supabase
        .from('stock_movements')
        .select('*')
        .order('date', { ascending: false });
        
      if (movementsError) throw movementsError;
      setStockMovements(movementsData || []);
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

  // CRUD para produtos
  const addProduct = async (product: Omit<Product, "id">) => {
    setIsLoading(true);
    try {
      const newProduct = {
        ...product,
        lastUpdated: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('products')
        .insert(newProduct)
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        setProducts(current => [...current, data[0]]);
        return data[0];
      }
      
      throw new Error("Erro ao adicionar produto: retorno vazio do banco de dados.");
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      throw new Error("Erro ao adicionar produto. Verifique o console para mais detalhes.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    setIsLoading(true);
    try {
      const productToUpdate = {
        ...updatedProduct,
        lastUpdated: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('products')
        .update(productToUpdate)
        .eq('id', updatedProduct.id)
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        setProducts(current => 
          current.map(product => 
            product.id === updatedProduct.id ? data[0] : product
          )
        );
        return data[0];
      }
      
      throw new Error("Erro ao atualizar produto: retorno vazio do banco de dados.");
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      throw new Error("Erro ao atualizar produto. Verifique o console para mais detalhes.");
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
      const newMovement = {
        ...movement,
        date: new Date().toISOString()
      };
      
      // Registrar a movimentação no banco
      const { data: movementData, error: movementError } = await supabase
        .from('stock_movements')
        .insert(newMovement)
        .select();
      
      if (movementError) throw movementError;
      
      if (!movementData || !movementData[0]) {
        throw new Error("Erro ao registrar movimentação: retorno vazio do banco de dados.");
      }
      
      // Atualizar a quantidade do produto
      const updatedQuantity = movement.type === "in" 
        ? productData.quantity + movement.quantity 
        : productData.quantity - movement.quantity;
      
      // Atualizar o produto no banco
      await updateProduct({
        ...productData,
        quantity: updatedQuantity
      });
      
      // Atualizar o estado local
      setStockMovements(current => [movementData[0], ...current]);
      
      return movementData[0];
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
    addProduct,
    updateProduct,
    deleteProduct,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    registerStockMovement
  };
};
