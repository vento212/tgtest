const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Отключаем source map warnings для Ton Connect
  process.env.GENERATE_SOURCEMAP = 'false';
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
    })
  );
}; 