// Script para limpar as tabelas relacionadas ao estoque no Supabase
import { supabase } from './src/lib/supabaseClient';

async function limparTabelasEstoque() {
  console.log('Iniciando limpeza das tabelas de estoque...');
  
  try {
    // Remover dados da tabela stock_movements primeiro (devido a restrições de chave estrangeira)
    console.log('Limpando tabela stock_movements...');
    const { error: erroMovimentos } = await supabase
      .from('stock_movements')
      .delete()
      .not('id', 'is', null); // deleta todos os registros
    
    if (erroMovimentos) throw erroMovimentos;
    console.log('✅ Tabela stock_movements limpa com sucesso');
    
    // Remover dados da tabela products
    console.log('Limpando tabela products...');
    const { error: erroProdutos } = await supabase
      .from('products')
      .delete()
      .not('id', 'is', null); // deleta todos os registros
    
    if (erroProdutos) throw erroProdutos;
    console.log('✅ Tabela products limpa com sucesso');
    
    // Remover dados da tabela suppliers
    console.log('Limpando tabela suppliers...');
    const { error: erroFornecedores } = await supabase
      .from('suppliers')
      .delete()
      .not('id', 'is', null); // deleta todos os registros
    
    if (erroFornecedores) throw erroFornecedores;
    console.log('✅ Tabela suppliers limpa com sucesso');
    
    console.log('🎉 Todas as tabelas de estoque foram limpas com sucesso!');
  } catch (erro) {
    console.error('Erro ao limpar tabelas:', erro.message);
  }
}

// Executar a função
limparTabelasEstoque();
