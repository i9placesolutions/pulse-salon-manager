# Diretrizes de Segurança - Pulse Salon Manager

## Melhorias Implementadas

### 1. Proteção de Chaves de API

- Chaves da API do Supabase movidas para variáveis de ambiente
- Arquivo `.env.example` adicionado ao projeto como referência
- Configuração ajustada para carregar chaves do ambiente em tempo de execução

### 2. Armazenamento Seguro de Tokens

- Substituição do armazenamento em localStorage por cookies seguros
- Implementação de cookies com flags de segurança: Secure, SameSite=Strict
- Configuração para expiração adequada dos tokens de autenticação

### 3. Proteção CSRF

- Adicionado módulo de proteção CSRF em `src/lib/csrfProtection.ts`
- Implementação de tokens CSRF para todas as solicitações que modificam dados
- Integração com API do Supabase nas funções críticas

### 4. Validação de Dados

- Criado módulo de validação em `src/lib/dataValidation.ts`
- Implementadas validações para os tipos de dados mais comuns
- Adicionadas funções de sanitização para prevenir XSS

### 5. Cabeçalhos de Segurança

- Configurados cabeçalhos HTTP de segurança no servidor Vite
- Implementada política de segurança de conteúdo (CSP)
- Adicionadas proteções contra clickjacking, MIME sniffing e outras vulnerabilidades

## Configuração do Ambiente

Para configurar o ambiente de desenvolvimento com segurança:

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Preencha as variáveis no `.env` com suas chaves reais:
   ```
   VITE_SUPABASE_URL=sua_url_real
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_real
   ```

3. Garanta que o arquivo `.env` esteja no `.gitignore` para não ser versionado.

## Boas Práticas para Desenvolvimento Contínuo

### Para APIs e Autenticação

- Nunca armazene chaves ou tokens diretamente no código
- Use sempre o padrão de autenticação do Supabase
- Implemente limite de tentativas de login para prevenir ataques de força bruta

### Para Manipulação de Dados

- Sempre valide os dados no cliente antes de enviar ao servidor
- Sanitize todos os inputs para prevenir ataques XSS
- Use as funções disponíveis em `dataValidation.ts` para validação

### Para Solicitações HTTP

- Sempre adicione proteção CSRF para operações que modificam dados
- Use o padrão de `verifyCSRFToken` implementado em `csrfProtection.ts`
- Evite expor detalhes específicos de erros aos usuários

## Recursos Adicionais

- [Supabase Security Best Practices](https://supabase.io/docs/guides/auth/security)
- [OWASP Top 10 Web Application Security Risks](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

## Monitoramento e Manutenção

- Monitore regularmente o log de autenticações e solicitações
- Atualize as dependências do projeto frequentemente
- Realize auditorias de segurança periódicas
- Mantenha-se atualizado sobre novas vulnerabilidades
