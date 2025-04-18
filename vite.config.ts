import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Adicionando headers de segurança para o servidor de desenvolvimento
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://wtpmedifsfbxctlssefd.supabase.co https://*.supabase.co; img-src 'self' data: blob: https://wtpmedifsfbxctlssefd.supabase.co https://*.supabase.co; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-src 'none'",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configurações de build para melhorar a segurança
  build: {
    // Impede a exposição de código-fonte interna no build final
    sourcemap: mode === 'development',
    // Minifica o JS e CSS para reduzir o tamanho e dificultar a análise do código
    minify: mode === 'production' ? 'esbuild' : false,
    rollupOptions: {
      output: {
        // Adiciona hashes para recursos estáticos para evitar cache indesejado
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
  // Definição avançada para variáveis de ambiente
  define: {
    // Garante que as variáveis de ambiente não sejam expostas acidentalmente
    'process.env': {},
    // Define explicitamente quais variáveis devem ser expostas
    __SUPABASE_URL__: JSON.stringify(process.env.VITE_SUPABASE_URL || ''),
    // Não incluímos a chave anon diretamente - ela será usada via import.meta.env no código
  },
}));
