import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  User, 
  Plus, 
  Minus, 
  Trash2, 
  Save, 
  CreditCard, 
  Gift, 
  Percent,
  ShoppingCart,
  X,
  Loader2
} from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { SelecionarClienteModal } from "./SelecionarClienteModal";
import { BeneficiosClienteModal } from "./BeneficiosClienteModal";
import { usePDVManagement } from "@/hooks/usePDVManagement";
import { useToast } from "@/components/ui/use-toast";

// Usamos os tipos exportados pelo hook
import { Item, Cliente, Beneficio } from "@/hooks/usePDVManagement";

// Componente de item do pedido memoizado
const ItemPedido = React.memo(({ 
  item, 
  onIncrementar, 
  onDecrementar, 
  onRemover 
}: { 
  item: Item; 
  onIncrementar: (id: string) => void; 
  onDecrementar: (id: string) => void; 
  onRemover: (id: string) => void; 
}) => {
  return (
    <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-200">
      <div className="flex-1">
        <div className="flex items-center">
          <Badge 
            variant="outline" 
            className={`
              mr-2 font-normal text-xs px-1 py-0 h-5 
              ${item.tipo === "produto" 
                ? "bg-blue-50 text-blue-600 border-blue-200" 
                : "bg-green-50 text-green-600 border-green-200"
              }
            `}
          >
            {item.tipo === "produto" ? "Produto" : "Serviço"}
          </Badge>
          <span className="font-medium">{item.nome}</span>
        </div>
        <div className="text-sm text-gray-500">
          {formatCurrency(item.preco)} x {item.quantidade}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <div className="flex items-center bg-gray-100 rounded-md">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-md hover:bg-gray-200" 
            onClick={() => onDecrementar(item.id)}
            disabled={item.quantidade <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-5 text-center">{item.quantidade}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-md hover:bg-gray-200" 
            onClick={() => onIncrementar(item.id)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 rounded-md hover:bg-rose-100 hover:text-rose-500" 
          onClick={() => onRemover(item.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
});

// Componente para resultados de busca memoizado
const ResultadoBusca = React.memo(({ 
  item, 
  onAdicionar 
}: { 
  item: { id: string; nome: string; tipo: "produto" | "servico"; preco: number }; 
  onAdicionar: (item: any) => void;
}) => {
  return (
    <div 
      className="p-2 border rounded-md mb-2 hover:bg-blue-50 cursor-pointer transition-colors flex justify-between items-center"
      onClick={() => onAdicionar(item)}
    >
      <div>
        <div className="font-medium">{item.nome}</div>
        <div className="text-sm flex items-center gap-2">
          <Badge variant="outline" className={item.tipo === "produto" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-green-50 text-green-600 border-green-200"}>
            {item.tipo === "produto" ? "Produto" : "Serviço"}
          </Badge>
          <span className="text-gray-600">{formatCurrency(item.preco)}</span>
        </div>
      </div>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
});

export function Terminal() {
  const { toast } = useToast();
  const [searchValue, setSearchValue] = useState('');
  const [itens, setItens] = useState<Item[]>([]);
  const [resultadosBusca, setResultadosBusca] = useState<any[]>([]);
  const [showSelecionarCliente, setShowSelecionarCliente] = useState(false);
  const [showBeneficiosModal, setShowBeneficiosModal] = useState(false);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [beneficioAplicado, setBeneficioAplicado] = useState<Beneficio | null>(null);
  const [codigoPedido, setCodigoPedido] = useState("");
  
  // Hook para gerenciamento do PDV
  const {
    loading,
    produtosServicos,
    clientes,
    buscarProdutosServicos,
    buscarClientes,
    salvarPedido,
    processarPagamento
  } = usePDVManagement();
  
  // Gerar código único para o pedido quando é iniciado
  useEffect(() => {
    const data = new Date();
    const dataFormatada = `${data.getFullYear()}${String(data.getMonth() + 1).padStart(2, '0')}${String(data.getDate()).padStart(2, '0')}`;
    const random = Math.floor(1000 + Math.random() * 9000);
    setCodigoPedido(`PDV-${dataFormatada}-${random}`);
  }, []);
  
  // Carrega produtos e serviços ao inicializar
  useEffect(() => {
    buscarProdutosServicos();
    buscarClientes();
  }, [buscarProdutosServicos, buscarClientes]);
  
  // Busca produtos e serviços conforme digitação
  useEffect(() => {
    if (searchValue.trim().length >= 2) {
      // Filtra os produtos e serviços já carregados
      const resultados = produtosServicos.filter(
        (item) => item.nome.toLowerCase().includes(searchValue.toLowerCase())
      );
      
      setResultadosBusca(resultados);
    } else {
      setResultadosBusca([]);
    }
  }, [searchValue, produtosServicos]);

  // Calcular subtotal - Memoizado para evitar recálculos
  const subtotal = useMemo(() => {
    return itens.reduce((total, item) => {
      return total + (item.preco * item.quantidade);
    }, 0);
  }, [itens]);
  
  // Calcular desconto - Memoizado para evitar recálculos
  const valorDesconto = useMemo(() => {
    if (!beneficioAplicado) return 0;
    return beneficioAplicado.valor;
  }, [beneficioAplicado]);
  
  // Calcular total - Memoizado para evitar recálculos
  const total = useMemo(() => {
    return Math.max(0, subtotal - valorDesconto);
  }, [subtotal, valorDesconto]);

  // Handler para adicionar item - useCallback para evitar recriação da função
  const handleAdicionarItem = useCallback((item) => {
    setItens(prevItens => {
      // Verifica se o item já existe no carrinho
      const itemExistente = prevItens.find(i => i.id === item.id);
      
      if (itemExistente) {
        // Apenas incrementa a quantidade
        return prevItens.map(i => 
          i.id === item.id 
            ? { ...i, quantidade: i.quantidade + 1 } 
            : i
        );
      } else {
        // Adiciona novo item
        return [...prevItens, { ...item, quantidade: 1 }];
      }
    });
    
    // Limpa o termo de busca após adicionar
    setSearchValue("");
  }, []);

  // Handler para incrementar quantidade - useCallback para evitar recriação da função
  const handleIncrementarItem = useCallback((id: string) => {
    setItens(prevItens => 
      prevItens.map(item => 
        item.id === id 
          ? { ...item, quantidade: item.quantidade + 1 } 
          : item
      )
    );
  }, []);

  // Handler para decrementar quantidade - useCallback para evitar recriação da função
  const handleDecrementarItem = useCallback((id: string) => {
    setItens(prevItens => 
      prevItens.map(item => 
        item.id === id && item.quantidade > 1
          ? { ...item, quantidade: item.quantidade - 1 } 
          : item
      )
    );
  }, []);

  // Handler para remover item - useCallback para evitar recriação da função
  const handleRemoverItem = useCallback((id: string) => {
    setItens(prevItens => prevItens.filter(item => item.id !== id));
  }, []);

  // Handler para selecionar cliente - useCallback para evitar recriação da função
  const handleSelecionarCliente = useCallback((clienteSelecionado: Cliente) => {
    setCliente(clienteSelecionado);
    setShowSelecionarCliente(false);
  }, []);

  // Handler para aplicar benefício - useCallback para evitar recriação da função
  const handleAplicarBeneficio = useCallback((beneficio: Beneficio) => {
    setBeneficioAplicado(beneficio);
    setShowBeneficiosModal(false);
  }, []);

  // Handler para remover benefício - useCallback para evitar recriação da função
  const handleRemoverBeneficio = useCallback(() => {
    setBeneficioAplicado(null);
  }, []);

  // Handler para pesquisar - useCallback para evitar recriação da função
  const handlePesquisar = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Se tiver apenas um resultado, adicionar automaticamente
    if (resultadosBusca.length === 1) {
      handleAdicionarItem(resultadosBusca[0]);
    }
  }, [resultadosBusca, handleAdicionarItem]);

  // Exibe campo de busca e resultados
  const renderBusca = () => {
    return (
      <div className="mb-4">
        <form onSubmit={handlePesquisar}>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar produtos e serviços..."
              className="pl-9"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </form>
        
        {resultadosBusca.length > 0 && (
          <div className="mt-2">
            <ScrollArea className="h-[200px]">
              {resultadosBusca.map((item) => (
                <ResultadoBusca
                  key={item.id}
                  item={item}
                  onAdicionar={handleAdicionarItem}
                />
              ))}
            </ScrollArea>
          </div>
        )}
        
        {searchValue.length >= 2 && resultadosBusca.length === 0 && (
          <div className="p-2 text-sm text-gray-500 text-center mt-2">
            Nenhum resultado encontrado para "{searchValue}"
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Coluna da esquerda - Busca e Produtos */}
      <div className="md:col-span-3 space-y-4">
        <Card className="border border-blue-100">
          <CardHeader className="bg-white py-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  type="text" 
                  placeholder="Buscar produto ou serviço..." 
                  className="pl-8 border-blue-200 focus-visible:ring-blue-500"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
              
              <Button variant="outline" className="border-blue-200 text-blue-700">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Catálogo
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <ScrollArea className="h-[320px] pr-4">
              <div className="space-y-1">
                {searchValue.length > 0 && resultadosBusca.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum resultado encontrado para "{searchValue}"
                  </div>
                ) : (
                  renderBusca()
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      {/* Coluna da direita - Carrinho e Finalização */}
      <div className="md:col-span-2">
        <Card className="border border-blue-100">
          <CardHeader className="bg-white py-3 border-b border-blue-50">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-medium">Pedido: {codigoPedido}</CardTitle>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 border-blue-200 text-blue-700"
                onClick={() => setShowSelecionarCliente(true)}
              >
                <User className="h-3.5 w-3.5 mr-1" />
                {cliente ? cliente.nome : "Selecionar Cliente"}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="px-2 py-3">
            <ScrollArea className="h-[320px] px-2">
              <div className="space-y-3">
                {itens.length > 0 ? (
                  itens.map(item => (
                    <ItemPedido
                      key={item.id}
                      item={item}
                      onIncrementar={handleIncrementarItem}
                      onDecrementar={handleDecrementarItem}
                      onRemover={handleRemoverItem}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Nenhum item adicionado ao pedido
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="flex-col border-t border-blue-50 bg-blue-50/30 p-4">
            {/* Benefícios */}
            {cliente && (
              <div className="w-full mb-3">
                {beneficioAplicado ? (
                  <div className="flex items-center justify-between bg-green-50 p-2 rounded border border-green-100">
                    <div className="text-sm">
                      <span className="text-green-700 font-medium">
                        {beneficioAplicado.tipo === 'cashback' && `Cashback de ${formatCurrency(beneficioAplicado.valor)} aplicado`}
                        {beneficioAplicado.tipo === 'cupom' && `Cupom de ${formatCurrency(beneficioAplicado.valor)} aplicado`}
                        {beneficioAplicado.tipo === 'desconto' && `Desconto de ${formatCurrency(beneficioAplicado.valor)} aplicado`}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-6 w-6 hover:bg-green-100 hover:text-green-700"
                      onClick={handleRemoverBeneficio}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full border-green-200 text-green-700 bg-green-50/50 hover:bg-green-100"
                    onClick={() => cliente && setShowBeneficiosModal(true)}
                  >
                    {cliente.cashbackDisponivel > 0 ? (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        {formatCurrency(cliente.cashbackDisponivel)} de cashback disponível
                      </>
                    ) : cliente.cupons.length > 0 ? (
                      <>
                        <Gift className="h-4 w-4 mr-2" />
                        {cliente.cupons.length} {cliente.cupons.length === 1 ? 'cupom disponível' : 'cupons disponíveis'}
                      </>
                    ) : (
                      <>
                        <Percent className="h-4 w-4 mr-2" />
                        Aplicar desconto
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
            
            {/* Valores */}
            <div className="w-full space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              
              {valorDesconto > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Desconto:</span>
                  <span className="text-green-600">- {formatCurrency(valorDesconto)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-medium text-base pt-1.5 border-t border-dashed border-gray-200">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="flex gap-2 mt-4 w-full">
              <Button 
                variant="outline" 
                className="w-1/2" 
                onClick={() => {
                  if (itens.length === 0) {
                    toast({
                      variant: "destructive",
                      title: "Nenhum item adicionado",
                      description: "Adicione pelo menos um item para salvar o pedido."
                    });
                    return;
                  }
                  
                  salvarPedido({
                    cliente_id: cliente?.id,
                    itens: itens.map(item => ({
                      id: item.id,
                      nome: item.nome,
                      quantidade: item.quantidade,
                      preco: item.preco,
                      tipo: item.tipo
                    })),
                    beneficio: beneficioAplicado || undefined,
                    subtotal: subtotal,
                    total: total
                  }).then(resultado => {
                    if (resultado) {
                      // Limpa o carrinho após salvar com sucesso
                      setItens([]);
                      setCliente(null);
                      setBeneficioAplicado(null);
                    }
                  });
                }}
                disabled={loading || itens.length === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
              <Button 
                className="w-1/2 bg-blue-600 hover:bg-blue-700" 
                disabled={loading || itens.length === 0}
                onClick={() => {
                  if (itens.length === 0) {
                    toast({
                      variant: "destructive",
                      title: "Nenhum item adicionado",
                      description: "Adicione pelo menos um item para realizar o pagamento."
                    });
                    return;
                  }
                  
                  // Aqui redirecionaria para tela de pagamento ou abriria modal
                  toast({
                    title: "Processando pagamento",
                    description: "Esta funcionalidade está em desenvolvimento."
                  });
                }}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pagamento
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Modais */}
      <SelecionarClienteModal 
        isOpen={showSelecionarCliente}
        onClose={() => setShowSelecionarCliente(false)}
        onClienteSelecionado={handleSelecionarCliente}
      />
      
      {cliente && (
        <BeneficiosClienteModal
          isOpen={showBeneficiosModal}
          onClose={() => setShowBeneficiosModal(false)}
          cliente={cliente}
          onAplicarBeneficio={handleAplicarBeneficio}
          subtotal={subtotal}
        />
      )}
    </div>
  );
} 