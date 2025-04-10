import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Tipos para os relatórios
export interface FiltrosRelatorio {
  tipoRelatorio: string;
  dataInicio?: Date;
  dataFim?: Date;
  cliente?: string;
  status?: string;
  formaPagamento?: string;
  incluirDescontos?: boolean;
  incluirBeneficios?: boolean;
  incluirCanais?: boolean;
  formatoExportacao: "pdf" | "excel";
}

export interface DadosPedido {
  id: string;
  data: Date;
  cliente: { id: string; nome: string };
  itens: Array<{ id: string; nome: string; quantidade: number; preco: number }>;
  formaPagamento: string;
  status: "pago" | "pendente" | "cancelado" | "salvo";
  total: number;
  desconto?: number;
  beneficioAplicado?: {
    tipo: string;
    valor: number;
    motivo?: string;
  };
}

export interface DadosCaixa {
  id: string;
  data: Date;
  responsavel: string;
  valorAbertura: number;
  valorFechamento: number;
  divergencia: number;
  observacoes?: string;
  entradas: Array<{
    tipo: string;
    valor: number;
    descricao: string;
  }>;
  saidas: Array<{
    tipo: string;
    valor: number;
    descricao: string;
  }>;
}

// Função para formatação de moeda
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Função para preparar os dados do relatório de pedidos
export const prepararDadosRelatorioPedidos = (
  pedidos: DadosPedido[],
  filtros: FiltrosRelatorio
) => {
  // Filtragem dos pedidos conforme os critérios
  const pedidosFiltrados = pedidos.filter(pedido => {
    // Filtro de data
    const dataInicio = filtros.dataInicio ? new Date(filtros.dataInicio) : null;
    const dataFim = filtros.dataFim ? new Date(filtros.dataFim) : null;
    
    const dataValida = 
      (!dataInicio || pedido.data >= dataInicio) && 
      (!dataFim || pedido.data <= dataFim);
    
    // Filtro de cliente
    const clienteValido = !filtros.cliente || 
      pedido.cliente.nome.toLowerCase().includes(filtros.cliente.toLowerCase());
    
    // Filtro de status
    const statusValido = !filtros.status || 
      filtros.status === "todos" || 
      pedido.status === filtros.status;
    
    // Filtro de forma de pagamento
    const pagamentoValido = !filtros.formaPagamento || 
      filtros.formaPagamento === "todas" || 
      pedido.formaPagamento === filtros.formaPagamento;
    
    return dataValida && clienteValido && statusValido && pagamentoValido;
  });

  // Cálculos para o sumário
  const totalVendas = pedidosFiltrados.reduce((sum, pedido) => 
    pedido.status === "pago" ? sum + pedido.total : sum, 0);
  
  const totalDescontos = filtros.incluirDescontos ? 
    pedidosFiltrados.reduce((sum, pedido) => 
      sum + (pedido.desconto || 0), 0) : 0;
  
  const beneficiosPorTipo = filtros.incluirBeneficios ? 
    pedidosFiltrados.reduce((acc, pedido) => {
      if (pedido.beneficioAplicado) {
        const tipo = pedido.beneficioAplicado.tipo;
        acc[tipo] = (acc[tipo] || 0) + pedido.beneficioAplicado.valor;
      }
      return acc;
    }, {} as Record<string, number>) : {};
  
  const recebimentosPorCanal = filtros.incluirCanais ? 
    pedidosFiltrados.reduce((acc, pedido) => {
      if (pedido.status === "pago") {
        const canal = pedido.formaPagamento;
        acc[canal] = (acc[canal] || 0) + pedido.total;
      }
      return acc;
    }, {} as Record<string, number>) : {};

  return {
    pedidos: pedidosFiltrados,
    resumo: {
      totalPedidos: pedidosFiltrados.length,
      pedidosPagos: pedidosFiltrados.filter(p => p.status === "pago").length,
      pedidosPendentes: pedidosFiltrados.filter(p => p.status === "pendente").length,
      pedidosCancelados: pedidosFiltrados.filter(p => p.status === "cancelado").length,
      pedidosSalvos: pedidosFiltrados.filter(p => p.status === "salvo").length,
      totalVendas,
      totalDescontos,
      beneficiosPorTipo,
      recebimentosPorCanal,
    },
    filtros,
    dataGeracao: new Date()
  };
};

// Função para preparar os dados do relatório de caixa
export const prepararDadosRelatorioCaixa = (
  caixas: DadosCaixa[],
  filtros: FiltrosRelatorio
) => {
  // Filtragem dos dados de caixa conforme os critérios
  const caixasFiltrados = caixas.filter(caixa => {
    // Filtro de data
    const dataInicio = filtros.dataInicio ? new Date(filtros.dataInicio) : null;
    const dataFim = filtros.dataFim ? new Date(filtros.dataFim) : null;
    
    const dataValida = 
      (!dataInicio || caixa.data >= dataInicio) && 
      (!dataFim || caixa.data <= dataFim);
    
    return dataValida;
  });

  // Cálculos para o sumário
  const totalAberturas = caixasFiltrados.reduce((sum, caixa) => 
    sum + caixa.valorAbertura, 0);
  
  const totalFechamentos = caixasFiltrados.reduce((sum, caixa) => 
    sum + caixa.valorFechamento, 0);
  
  const totalDivergencias = caixasFiltrados.reduce((sum, caixa) => 
    sum + caixa.divergencia, 0);
  
  const totalEntradas = caixasFiltrados.reduce((sum, caixa) => 
    sum + caixa.entradas.reduce((s, entrada) => s + entrada.valor, 0), 0);
  
  const totalSaidas = caixasFiltrados.reduce((sum, caixa) => 
    sum + caixa.saidas.reduce((s, saida) => s + saida.valor, 0), 0);

  return {
    caixas: caixasFiltrados,
    resumo: {
      totalCaixas: caixasFiltrados.length,
      totalAberturas,
      totalFechamentos,
      totalDivergencias,
      totalEntradas,
      totalSaidas,
      saldoLiquido: totalEntradas - totalSaidas,
    },
    filtros,
    dataGeracao: new Date()
  };
};

// Simulação de exportação para PDF
export const exportarPDF = async (dados: any, tipoRelatorio: string): Promise<boolean> => {
  console.log(`Exportando relatório de ${tipoRelatorio} para PDF:`, dados);
  
  // Aqui seria implementada a lógica de geração do PDF
  // Exemplo: utilizando bibliotecas como jsPDF, pdfmake, etc.
  
  // Simulando um atraso para parecer que está processando
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Retorna true se a exportação for bem-sucedida
  return true;
};

// Simulação de exportação para Excel
export const exportarExcel = async (dados: any, tipoRelatorio: string): Promise<boolean> => {
  console.log(`Exportando relatório de ${tipoRelatorio} para Excel:`, dados);
  
  // Aqui seria implementada a lógica de geração do Excel
  // Exemplo: utilizando bibliotecas como xlsx, exceljs, etc.
  
  // Simulando um atraso para parecer que está processando
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Retorna true se a exportação for bem-sucedida
  return true;
};

// Função central para exportar relatórios
export const exportarRelatorio = async (
  filtros: FiltrosRelatorio,
  dadosPedidos?: DadosPedido[],
  dadosCaixa?: DadosCaixa[]
): Promise<boolean> => {
  try {
    let dadosProcessados;

    if (filtros.tipoRelatorio === "pedidos" && dadosPedidos) {
      dadosProcessados = prepararDadosRelatorioPedidos(dadosPedidos, filtros);
    } else if (filtros.tipoRelatorio === "caixa" && dadosCaixa) {
      dadosProcessados = prepararDadosRelatorioCaixa(dadosCaixa, filtros);
    } else {
      throw new Error(`Dados insuficientes para o relatório de ${filtros.tipoRelatorio}`);
    }

    if (filtros.formatoExportacao === "pdf") {
      return await exportarPDF(dadosProcessados, filtros.tipoRelatorio);
    } else {
      return await exportarExcel(dadosProcessados, filtros.tipoRelatorio);
    }
  } catch (error) {
    console.error("Erro ao exportar relatório:", error);
    return false;
  }
}; 