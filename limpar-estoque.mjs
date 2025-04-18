// Usando módulos ES nativos com a extensão .mjs
import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase
const supabaseUrl = 'https://wtpmedifsfbxctlssefd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0cG1lZGlmc2ZieGN0bHNzZWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMTMwNzUsImV4cCI6MjA1OTg4OTA3NX0.Mmro8vKbusSP_HNCqX9f5XlrotRbeA8-HIGvQE07mwU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function limparTabelasEstoque() {
  console.log('Iniciando limpeza das tabelas de estoque...');
  
  try {
    // Remover dados da tabela stock_movements primeiro (devido a restrições de chave estrangeira)
    console.log('Limpando tabela stock_movements...');
    const { error: erroMovimentos } = await supabase
      .from('stock_movements')
      .delete()
      .not('id', 'is', null); // deleta todos os registros
    
    if (erroMovimentos) {
      console.error('Erro ao limpar stock_movements:', erroMovimentos.message);
    } else {
      console.log('✅ Tabela stock_movements limpa com sucesso');
    }
    
    // Remover dados da tabela products
    console.log('Limpando tabela products...');
    const { error: erroProdutos } = await supabase
      .from('products')
      .delete()
      .not('id', 'is', null); // deleta todos os registros
    
    if (erroProdutos) {
      console.error('Erro ao limpar products:', erroProdutos.message);
    } else {
      console.log('✅ Tabela products limpa com sucesso');
    }
    
    // Remover dados da tabela suppliers
    console.log('Limpando tabela suppliers...');
    const { error: erroFornecedores } = await supabase
      .from('suppliers')
      .delete()
      .not('id', 'is', null); // deleta todos os registros
    
    if (erroFornecedores) {
      console.error('Erro ao limpar suppliers:', erroFornecedores.message);
    } else {
      console.log('✅ Tabela suppliers limpa com sucesso');
    }
    
    console.log('🎉 Processo de limpeza concluído!');
  } catch (erro) {
    console.error('Erro ao limpar tabelas:', erro.message);
  }
}

// Executar a função
limparTabelasEstoque();
