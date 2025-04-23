// Script para iniciar o servidor de webhook do WhatsApp IA
const { spawn } = require('child_process');
const path = require('path');

// Caminho para o arquivo do servidor
const serverPath = path.join(__dirname, 'ia-whatsapp', 'server.ts');

console.log('Iniciando servidor de webhook do WhatsApp IA...');
console.log(`Caminho do servidor: ${serverPath}`);

// Iniciar o processo do servidor com ts-node
const server = spawn('npx', ['ts-node', serverPath], {
  env: { ...process.env },
  stdio: 'inherit'
});

// Lidar com eventos do processo
server.on('error', (error) => {
  console.error('Erro ao iniciar servidor:', error);
});

server.on('close', (code) => {
  console.log(`Servidor encerrado com código: ${code}`);
});

// Manipular sinais para encerramento limpo
process.on('SIGINT', () => {
  console.log('Encerrando servidor de webhook...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Encerrando servidor de webhook...');
  server.kill('SIGTERM');
  process.exit(0);
});
