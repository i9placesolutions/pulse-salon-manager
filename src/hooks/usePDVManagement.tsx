import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

// Tipos
export interface Item {
  id: string;
  nome: string;
  tipo: "produto" | "servico";
  preco: number;
  quantidade: number;
}

export interface Cliente {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  cashbackDisponivel: number;
  cashback?: any[];
  cupons?: any[];
  ultimaVisita?: string;
}

export interface Beneficio {
  tipo: "cashback" | "cupom" | "desconto";
  valor: number;
  motivo?: string;
  cupomId?: string;
}

export interface Pedido {
  id: string;
  data?: string; // usado na UI para exibição formatada
  created_at?: string; // campo do banco de dados
  cliente_id?: string;
  cliente?: {
    id: string;
    nome: string;
  } | null;
  itens?: {
    id: string;
    nome: string;
    quantidade: number;
    preco: number;
    tipo?: string;
    produto_id?: string | null;
    servico_id?: string | null;
  }[];
  forma_pagamento?: string;
  formaPagamento?: string; // versão em camelCase usada na UI
  status?: string;
  total?: number; // usado na UI
  valor_total?: number; // campo do banco de dados
  subtotal?: number;
  beneficio?: Beneficio;
}

export interface CaixaStatus {
  id: string; // UUID
  data_abertura: string | null;
  hora_abertura: string | null;
  responsavel_abertura: string | null;
  valor_inicial: number | null;
  data_fechamento: string | null;
  hora_fechamento: string | null;
  valor_final: number | null;
  total_vendas: number | null;
  diferenca: number | null;
  justificativa: string | null;
  usuario_id: string | null;
  created_at: string | null;
}

export function usePDVManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado do caixa
  const [caixaStatus, setCaixaStatus] = useState<CaixaStatus | null>(null);
  const [caixaPendente, setCaixaPendente] = useState(false);
  
  // Estados para pedidos
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  
  // Estados para produtos e serviços
  interface ProdutoServico {
    id: string;
    nome: string;
    preco: number;
    tipo: string; // aceita qualquer string, não apenas 'produto' | 'servico'
    categoria?: string;
    duracao?: number;
    status?: string;
  }
  
  const [produtosServicos, setProdutosServicos] = useState<ProdutoServico[]>([]);
  
  // Estados para clientes
  const [clientes, setClientes] = useState<Cliente[]>([]);
  
  // Estado para totais
  const [totais, setTotais] = useState({
    totalVendas: 0,
    totalSangrias: 0
  });
  
  // Referência para armazenar o último timestamp de carregamento dos dados
  const lastDataLoad = useRef(new Date());

  // Buscar pedidos por data
  const buscarPedidosPorData = useCallback(async (data?: string) => {
    try {
      setLoading(true);
      const dataFiltro = data || new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
      
      // Buscar pedidos do dia atual usando a data do created_at
      const dataInicio = `${dataFiltro}T00:00:00`;
      const dataFim = `${dataFiltro}T23:59:59`;
      
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('pedidos')
        .select('*')
        .gte('created_at', dataInicio)
        .lte('created_at', dataFim)
        .order('created_at', { ascending: false });
      
      if (pedidosError && pedidosError.code !== 'PGRST116') {
        console.warn('Erro ao consultar pedidos:', pedidosError);
      } else if (pedidosData && pedidosData.length > 0) {
        // Pedidos encontrados, buscar informações adicionais separadamente
        
        // Buscar informações dos clientes
        const clienteIds = pedidosData
          .filter(p => p.cliente_id)
          .map(p => p.cliente_id);
        
        const { data: clientesData } = await supabase
          .from('clientes_view')
          .select('id, nome')
          .in('id', clienteIds);
        
        // Buscar itens dos pedidos
        const pedidoIds = pedidosData.map(p => p.id);
        const { data: itensData } = await supabase
          .from('pedidos_itens')
          .select('*')
          .in('pedido_id', pedidoIds);
          
        const pedidosFormatados: Pedido[] = pedidosData.map(pedido => {
          const clienteRelacionado = clientesData?.find(c => c.id === pedido.cliente_id) || null;
          const itensDoPedido = itensData?.filter(i => i.pedido_id === pedido.id) || [];
          
          return {
            id: pedido.id,
            data: new Date(pedido.created_at).toISOString(),
            created_at: pedido.created_at,
            cliente_id: pedido.cliente_id,
            cliente: clienteRelacionado ? {
              id: clienteRelacionado.id,
              nome: clienteRelacionado.nome
            } : {
              id: '0',
              nome: 'Cliente não identificado'
            },
            itens: itensDoPedido.map(item => ({
              id: item.id,
              nome: item.nome,
              quantidade: item.quantidade,
              preco: item.preco
            })),
            status: pedido.status,
            forma_pagamento: pedido.forma_pagamento,
            formaPagamento: pedido.forma_pagamento || '',
            total: pedido.valor_total,
            valor_total: pedido.valor_total
          };
        });
        
        setPedidos(pedidosFormatados);
        console.log('Pedidos carregados:', pedidosFormatados.length);
        return pedidosFormatados;
      }
      
      // Se não encontrou pedidos, retorna lista vazia
      setPedidos([]);
      return [];
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      setError('Não foi possível carregar os pedidos');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar produtos e serviços
  const buscarProdutosServicos = useCallback(async () => {
    try {
      setLoading(true);

      // Usando as views de compatibilidade em vez das tabelas originais
      const { data: produtos, error: produtosError } = await supabase
        .from('produtos_view')  // View de compatibilidade que aponta para products
        .select('id, nome, valor, categoria, ativo')
        .eq('ativo', true);

      if (produtosError) {
        throw produtosError;
      }

      // Buscar serviços ativos da view de compatibilidade
      const { data: servicos, error: servicosError } = await supabase
        .from('servicos_view')  // View de compatibilidade que aponta para services
        .select('id, nome, valor, duracao, ativo')
        .eq('ativo', true);

      if (servicosError) {
        throw servicosError;
      }

      // Combinar produtos e serviços com os nomes de campo corretos
      const produtosFormatados = produtos?.map(p => ({
        id: p.id,
        nome: p.nome,
        preco: p.valor,
        categoria: p.categoria,
        status: 'active',
        tipo: 'produto'
      })) || [];

      const servicosFormatados = servicos?.map(s => ({
        id: s.id,
        nome: s.nome,
        preco: s.valor,
        duracao: s.duracao,
        status: 'active',
        tipo: 'servico'
      })) || [];

      setProdutosServicos([...produtosFormatados, ...servicosFormatados]);
      console.log('Produtos e serviços carregados:', produtosFormatados.length + servicosFormatados.length);
    } catch (error) {
      console.error('Erro ao buscar produtos e serviços:', error);
      setError('Não foi possível carregar os produtos e serviços.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar clientes
  const buscarClientes = useCallback(async () => {
    try {
      setLoading(true);

      // Consultando a view de compatibilidade de clientes
      const { data, error } = await supabase
        .from('clientes_view')  // View de compatibilidade que aponta para clients
        .select('id, nome, telefone, email, data_nascimento, cashback, ultima_visita, created_at')
        .order('nome', { ascending: true });

      if (error) {
        throw error;
      }

      // Formatar clientes para o formato esperado pela interface
      const clientesFormatados = data?.map(cliente => ({
        id: cliente.id,
        nome: cliente.nome,
        telefone: cliente.telefone || '',
        email: cliente.email || '',
        cashbackDisponivel: Number(cliente.cashback) || 0,
        cupons: [],
        ultimaVisita: cliente.ultima_visita || cliente.created_at
      })) || [];

      setClientes(clientesFormatados as Cliente[]);
      console.log('Clientes carregados:', clientesFormatados.length);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      setError('Não foi possível carregar os clientes.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar cupons disponíveis para um cliente
  const buscarCuponsDisponiveis = useCallback(async (clienteId: string) => {
    try {
      const { data, error } = await supabase
        .from('cupons_view')  // View de compatibilidade que aponta para vouchers
        .select('id, valor, motivo, validade')
        .eq('cliente_id', clienteId)
        .eq('utilizado', false)
        .gte('validade', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Formatação adequada dos cupons para o formato esperado pela interface
      const cuponsFormatados = data?.map(cupom => ({
        id: cupom.id,
        valor: Number(cupom.valor) || 0,
        motivo: cupom.motivo || 'Cupom de desconto',
        validade: cupom.validade
      })) || [];
      
      return cuponsFormatados;
    } catch (error) {
      console.error('Erro ao buscar cupons:', error);
      return [];
    }
  }, []);

  // Buscar cashback disponível para um cliente
  const buscarCashbackDisponivel = useCallback(async (clienteId: string) => {
    try {
      // Primeiro tentar buscar da tabela do cliente diretamente (mais eficiente)
      const { data: clienteData, error: clienteError } = await supabase
        .from('clients')
        .select('cashback')
        .eq('id', clienteId)
        .single();
      
      if (!clienteError && clienteData && clienteData.cashback) {
        return Number(clienteData.cashback) || 0;
      }
      
      // Se não encontrou ou deu erro, tenta buscar da tabela de cashbacks
      const { data, error } = await supabase
        .from('cashbacks_view')
        .select('valor')
        .eq('cliente_id', clienteId)
        .eq('utilizado', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Calcular o total disponível
      const totalDisponivel = data?.reduce((total, item) => total + (Number(item.valor) || 0), 0) || 0;
      
      return totalDisponivel;
    } catch (error) {
      console.error('Erro ao buscar cashback:', error);
      return 0;
    }
  }, []);

  // Função para obter os totais do dia (vendas e sangrias)
  const buscarTotaisDia = useCallback(async () => {
    try {
      setLoading(true);
      const dataAtual = new Date().toISOString().split('T')[0];
      let totalVendas = 0;
      let totalSangrias = 0;

      // Buscar total de vendas do dia da tabela pedidos
      try {
        const dataInicio = `${dataAtual}T00:00:00`;
        const dataFim = `${dataAtual}T23:59:59`;

        const { data: pedidosDia, error: erroPedidos } = await supabase
          .from('pedidos')
          .select('valor_total')
          .eq('status', 'pago')
          .gte('created_at', dataInicio)
          .lte('created_at', dataFim);
          
        if (!erroPedidos && pedidosDia && pedidosDia.length > 0) {
          totalVendas = pedidosDia.reduce((acc, item) => acc + (Number(item.valor_total) || 0), 0);
        }
      } catch (e) {
        console.warn('Erro ao buscar vendas do dia:', e);
      }

      // Buscar total de sangrias do dia da tabela sangrias
      try {
        const dataInicio = `${dataAtual}T00:00:00`;
        const dataFim = `${dataAtual}T23:59:59`;
        
        const { data: sangriasDia, error: erroSangrias } = await supabase
          .from('sangrias')
          .select('valor')
          .gte('created_at', dataInicio)
          .lte('created_at', dataFim);
          
        if (!erroSangrias && sangriasDia && sangriasDia.length > 0) {
          totalSangrias = sangriasDia.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
        }
      } catch (e) {
        console.warn('Erro ao buscar sangrias do dia:', e);
      }

      // Atualizar o estado com os totais
      setTotais({ totalVendas, totalSangrias });
      console.log('Totais atualizados:', { totalVendas, totalSangrias });
      return { totalVendas, totalSangrias };
    } catch (error) {
      console.error('Erro ao buscar totais do dia:', error);
      setError('Falha ao buscar totais do dia');
      return { totalVendas: 0, totalSangrias: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  // Processar pagamento de um pedido
  const processarPagamento = useCallback(async (pedidoId: string, formaPagamento: string) => {
    try {
      setLoading(true);
      
      if (!caixaStatus || caixaStatus.data_fechamento !== null) {
        toast({
          variant: "destructive",
          title: "Caixa fechado",
          description: "É necessário abrir o caixa para processar pagamentos.",
        });
        return null;
      }
      
      // Atualizar status nas tabelas inglês e português simultaneamente
      // Primeiramente na tabela orders
      const { data: pedidoAtualizado, error: pedidoError } = await supabase
        .from('orders')
        .update({
          status: 'pago',
          forma_pagamento: formaPagamento
        })
        .eq('id', pedidoId)
        .select()
        .single();
      
      if (pedidoError) throw pedidoError;
      
      // Também atualizar na tabela pedidos para manter a consistência
      await supabase
        .from('pedidos')
        .update({
          status: 'pago',
          forma_pagamento: formaPagamento
        })
        .eq('id', pedidoId);
      
      // Se o pedido tem um cliente, atualizar última visita e adicionar cashback (se aplicável)
      if (pedidoAtualizado.cliente_id) {
        const dataAtual = new Date().toISOString().split('T')[0];
        
        // Atualizar a data da última visita
        await supabase
          .from('clients')
          .update({ last_visit: dataAtual })
          .eq('id', pedidoAtualizado.cliente_id);
        
        // Calcular e adicionar cashback (exemplo: 5% do valor do pedido)
        if (Number(pedidoAtualizado.valor_total) > 0) {
          const valorCashback = Number(pedidoAtualizado.valor_total) * 0.05; // 5% de cashback
          
          // Buscar cashback atual
          const { data: clienteData } = await supabase
            .from('clients')
            .select('cashback')
            .eq('id', pedidoAtualizado.cliente_id)
            .single();
          
          if (clienteData) {
            const cashbackAtual = Number(clienteData.cashback) || 0;
            const novoCashback = cashbackAtual + valorCashback;
            
            // Atualizar cashback do cliente
            await supabase
              .from('clients')
              .update({ cashback: novoCashback })
              .eq('id', pedidoAtualizado.cliente_id);
            
            // Registrar na tabela de cashbacks
            await supabase
              .from('cashbacks')
              .insert({
                client_id: pedidoAtualizado.cliente_id,
                amount: valorCashback,
                order_id: pedidoId,
                is_used: false
              });
          }
        }
      }
      
      toast({
        title: "Pagamento processado com sucesso",
        description: `Pagamento do pedido #${pedidoId.slice(0, 8)} realizado com sucesso.`,
      });
      
      // Recarregar a lista de pedidos e totais
      await buscarPedidosPorData();
      await buscarTotaisDia();
      
      return pedidoAtualizado;
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      setError('Falha ao processar o pagamento');
      
      toast({
        variant: "destructive",
        title: "Erro ao processar pagamento",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao tentar processar o pagamento.",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [caixaStatus, toast, buscarPedidosPorData, buscarTotaisDia]);
  
  // Buscar status do caixa
  const buscarStatusCaixa = useCallback(async () => {
    try {
      setLoading(true);
      
      // Usando a tabela 'caixas' enquanto não migramos para 'cash_registers' (em inglês)
      const { data: todosCaixas, error: caixaError } = await supabase
        .from('caixas')
        .select('*')
        .order('created_at', { ascending: false });

      if (caixaError) {
        throw caixaError;
      }
      
      // Filtramos para encontrar o caixa do dia atual
      const dataAtual = new Date().toISOString().split('T')[0];
      const caixaAtual = todosCaixas?.find(caixa => 
        caixa.data_abertura === dataAtual
      );

      if (caixaError && caixaError.code !== 'PGRST116') {
        // PGRST116 é o código para "Nenhum resultado encontrado"
        throw caixaError;
      }

      // Verificar caixas pendentes de dias anteriores (filtrado no cliente)
      const caixasPendentes = todosCaixas?.filter(caixa => 
        caixa.data_abertura < dataAtual && caixa.data_fechamento === null
      ) || [];

      setCaixaPendente(caixasPendentes.length > 0);
      
      if (caixaAtual) {
        setCaixaStatus(caixaAtual);
      } else {
        setCaixaStatus(null);
      }
    } catch (error) {
      console.error('Erro ao buscar status do caixa:', error);
      setError('Falha ao verificar status do caixa');
    } finally {
      setLoading(false);
    }
  }, []);

  // Abrir caixa
  const abrirCaixa = useCallback(async (valorAbertura: number) => {
    try {
      setLoading(true);
      
      const agora = new Date();
      const dataAtual = agora.toISOString().split('T')[0];
      const horaAtual = agora.toTimeString().split(' ')[0];
      const responsavel = 'João Silva'; // Ideal: obter do contexto de autenticação
      
      const { data, error } = await supabase
        .from('caixas')
        .insert([{
          data_abertura: dataAtual,
          hora_abertura: horaAtual,
          responsavel_abertura: responsavel,
          valor_inicial: valorAbertura
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setCaixaStatus(data);
      
      toast({
        title: "Caixa aberto com sucesso",
        description: `Valor inicial: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorAbertura)}`,
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao abrir caixa:', error);
      setError('Falha ao abrir o caixa');
      
      toast({
        variant: "destructive",
        title: "Erro ao abrir caixa",
        description: "Ocorreu um erro ao tentar abrir o caixa.",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fechar caixa
  const fecharCaixa = useCallback(async (valorFinal: number, justificativa?: string) => {
    if (!caixaStatus || !caixaStatus.id) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não há caixa aberto para fechar.",
      });
      return null;
    }
    
    try {
      setLoading(true);
      
      const agora = new Date();
      const dataAtual = agora.toISOString().split('T')[0];
      const horaAtual = agora.toTimeString().split(' ')[0];
      
      // Calcular diferença entre valor_final e valor_inicial
      const valorInicial = caixaStatus.valor_inicial || 0;
      const diferenca = valorFinal - valorInicial;
      
      const { data, error } = await supabase
        .from('caixas')
        .update({
          data_fechamento: dataAtual,
          hora_fechamento: horaAtual,
          valor_final: valorFinal,
          diferenca: diferenca,
          justificativa: justificativa || null
        })
        .eq('id', caixaStatus.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setCaixaStatus(data);
      
      toast({
        title: "Caixa fechado com sucesso",
        description: "O relatório de fechamento está disponível para consulta.",
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao fechar caixa:', error);
      setError('Falha ao fechar o caixa');
      
      toast({
        variant: "destructive",
        title: "Erro ao fechar caixa",
        description: "Ocorreu um erro ao tentar fechar o caixa.",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [caixaStatus, toast]);
      
  // Salvar pedido - versão adaptada para usar as tabelas do Supabase
  const salvarPedido = useCallback(async (pedido: {
    cliente_id?: string,
    itens: { id: string, nome: string, quantidade: number, preco: number, tipo: string }[],
    beneficio?: Beneficio,
    subtotal: number,
    total: number
  }) => {
    try {
      setLoading(true);
      
      if (!caixaStatus || caixaStatus.data_fechamento !== null) {
        throw new Error('O caixa precisa estar aberto para salvar um pedido');
      }
      
      // Salvar na tabela 'orders' (inglês)
      const { data: novoPedido, error: pedidoError } = await supabase
        .from('orders')
        .insert({
          cliente_id: pedido.cliente_id,
          register_id: caixaStatus.id,
          subtotal: pedido.subtotal,
          desconto: pedido.beneficio ? pedido.beneficio.valor : 0,
          valor_total: pedido.total,
          status: 'pendente',
          beneficio_tipo: pedido.beneficio?.tipo,
          beneficio_valor: pedido.beneficio?.valor,
          beneficio_motivo: pedido.beneficio?.motivo,
          cupom_id: pedido.beneficio?.cupomId
        })
        .select()
        .single();
      
      if (pedidoError) throw pedidoError;
      
      // Inserir os itens do pedido na tabela order_items
      if (pedido.itens && pedido.itens.length > 0) {
        const itensParaInserir = pedido.itens.map(item => ({
          order_id: novoPedido.id,
          nome: item.nome,
          quantidade: item.quantidade,
          preco: item.preco,
          tipo: item.tipo,
          produto_id: item.tipo === 'produto' ? item.id : null,
          servico_id: item.tipo === 'servico' ? item.id : null
        }));
        
        const { error: itensError } = await supabase
          .from('order_items')
          .insert(itensParaInserir);
        
        if (itensError) throw itensError;
      }
      
      // Também inserir na tabela 'pedidos' em português para manter compatibilidade
      await supabase
        .from('pedidos')
        .insert({
          id: novoPedido.id, // Usar o mesmo ID para consistência
          cliente_id: pedido.cliente_id,
          caixa_id: caixaStatus.id,
          subtotal: pedido.subtotal,
          desconto: pedido.beneficio ? pedido.beneficio.valor : 0,
          valor_total: pedido.total,
          status: 'pendente',
          beneficio_tipo: pedido.beneficio?.tipo,
          beneficio_valor: pedido.beneficio?.valor,
          beneficio_motivo: pedido.beneficio?.motivo,
          cupom_id: pedido.beneficio?.cupomId
        });
      
      // Inserir os itens também na tabela em português para manter compatibilidade
      if (pedido.itens && pedido.itens.length > 0) {
        const itensPtParaInserir = pedido.itens.map(item => ({
          pedido_id: novoPedido.id,
          nome: item.nome,
          quantidade: item.quantidade,
          preco: item.preco,
          tipo: item.tipo,
          produto_id: item.tipo === 'produto' ? item.id : null,
          servico_id: item.tipo === 'servico' ? item.id : null
        }));
        
        await supabase
          .from('pedidos_itens')
          .insert(itensPtParaInserir);
      }
    
      // Se o benefício for do tipo cupom, atualizar o cupom como utilizado
      if (pedido.beneficio?.tipo === 'cupom' && pedido.beneficio?.cupomId) {
        await supabase
          .from('vouchers')
          .update({ is_used: true, used_date: new Date().toISOString(), order_id: novoPedido.id })
          .eq('id', pedido.beneficio.cupomId);
      }
      
      // Se o benefício for do tipo cashback, diminuir o valor do cashback do cliente
      if (pedido.beneficio?.tipo === 'cashback' && pedido.cliente_id) {
        const { data: clienteData } = await supabase
          .from('clients')
          .select('cashback')
          .eq('id', pedido.cliente_id)
          .single();
        
        if (clienteData && clienteData.cashback) {
          const novoCashback = Math.max(0, Number(clienteData.cashback) - pedido.beneficio.valor);
          await supabase
            .from('clients')
            .update({ cashback: novoCashback })
            .eq('id', pedido.cliente_id);
        }
      }
      
      toast({
        title: "Pedido salvo com sucesso",
        description: `Pedido #${novoPedido.id.slice(0, 8)} criado com sucesso.`,
      });
      
      // Recarregar a lista de pedidos
      await buscarPedidosPorData();
      await buscarTotaisDia();
      
      return novoPedido;
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
      setError('Não foi possível salvar o pedido');
      
      toast({
        variant: "destructive",
        title: "Erro ao salvar pedido",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao tentar salvar o pedido.",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [caixaStatus, toast, buscarPedidosPorData, buscarTotaisDia]);

  // Inicializar os dados ao montar o componente e configurar atualizações em tempo real
  useEffect(() => {
    // Carregar dados iniciais
    const carregarDados = async () => {
      try {
        setLoading(true);
        await buscarStatusCaixa();
        await buscarProdutosServicos();
        await buscarPedidosPorData();
        await buscarClientes();
        await buscarTotaisDia();
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Carregar dados inicialmente
    carregarDados();
    
    // Configurar subscriptions do Supabase Realtime para atualizações em tempo real
    const caixasSubscription = supabase
      .channel('caixas-changes')
      .on('postgres_changes', {
        event: '*', // Escutar todos os eventos (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'caixas',
      }, () => {
        console.log('Mudança detectada na tabela caixas');
        buscarStatusCaixa();
      })
      .subscribe();
    
    const pedidosSubscription = supabase
      .channel('pedidos-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pedidos',
      }, () => {
        console.log('Mudança detectada na tabela pedidos');
        buscarPedidosPorData();
        buscarTotaisDia();
      })
      .subscribe();
      
    const sangriasSubscription = supabase
      .channel('sangrias-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sangrias',
      }, () => {
        console.log('Mudança detectada na tabela sangrias');
        buscarTotaisDia();
      })
      .subscribe();
    
    // Limpeza ao desmontar o componente
    return () => {
      // Remover todas as subscriptions
      caixasSubscription.unsubscribe();
      pedidosSubscription.unsubscribe();
      sangriasSubscription.unsubscribe();
    };
  }, [buscarStatusCaixa, buscarProdutosServicos, buscarPedidosPorData, buscarClientes, buscarTotaisDia]);

  return {
    loading,
    error,
    caixaStatus: {
      aberto: caixaStatus?.data_fechamento === null,
      dataAbertura: caixaStatus?.data_abertura ? new Date(caixaStatus.data_abertura) : null,
      valorAbertura: caixaStatus?.valor_inicial || 0,
      responsavelAbertura: caixaStatus?.responsavel_abertura || '',
    },
    caixaPendente,
    pedidos,
    produtosServicos,
    clientes,
    totais,
    abrirCaixa,
    fecharCaixa,
    buscarPedidos: buscarPedidosPorData, // Alias para manter compatibilidade
    buscarStatusCaixa,
    buscarProdutosServicos,
    buscarClientes,
    buscarCashbackDisponivel,
    buscarCuponsDisponiveis,
    buscarTotaisDia,
    salvarPedido,
    processarPagamento
  };
}
