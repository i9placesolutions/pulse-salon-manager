# Configuração do Supabase para o Pulse Salon Manager

Este diretório contém a configuração do banco de dados e autenticação para o sistema SaaS Pulse Salon Manager.

## Tabelas Principais

- **profiles**: Armazena informações básicas do estabelecimento (salão) e é vinculada diretamente aos usuários do Supabase.
- **establishment_details**: Contém detalhes mais completos do estabelecimento.
- **blocked_times**: Gerencia os horários bloqueados para agendamentos.

## Segurança e Políticas de Acesso

Todas as tabelas estão protegidas com Row Level Security (RLS), garantindo que os usuários só possam acessar seus próprios dados.

## Fluxo de Autenticação

1. **Cadastro (Register)**:
   - O usuário preenche seus dados (nome, email, senha)
   - É criado um usuário no Supabase com os metadados do estabelecimento
   - Um trigger cria automaticamente um perfil básico para o estabelecimento
   - O usuário é direcionado a completar seu perfil

2. **Login**:
   - O usuário faz login com email e senha
   - O sistema verifica se o perfil está completo e se o período de teste está ativo
   - Com base nessa verificação, o usuário é redirecionado para a página apropriada

3. **Recuperação de Senha**:
   - O usuário informa seu email
   - Um link de redefinição é enviado para o email
   - O usuário acessa o link e define uma nova senha

## Funções SQL Importantes

- `handle_new_user()`: Cria automaticamente um perfil ao registrar um usuário
- `handle_updated_at()`: Atualiza o timestamp de atualização dos registros
- `get_establishment_by_custom_url()`: Utilizada para o agendamento público
- `start_or_extend_trial()`: Gerencia o período de trial dos usuários

## Período de Teste (Trial)

Cada novo usuário recebe automaticamente 7 dias de período de teste. Após este período, é necessário ativar uma assinatura para continuar utilizando o sistema.

## Como executar o schema

O arquivo `schema.sql` deve ser executado no Supabase para configurar as tabelas e políticas de segurança. Você pode fazer isso através do editor SQL no dashboard do Supabase. 