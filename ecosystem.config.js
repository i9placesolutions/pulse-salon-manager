module.exports = {
  apps: [
    {
      name: 'webhook-server',
      script: './src/server/webhook-server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        WEBHOOK_PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        WEBHOOK_PORT: 3001
      }
    }
  ]
};
