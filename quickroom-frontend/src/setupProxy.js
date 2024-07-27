// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://9kjircr6ld.execute-api.us-east-1.amazonaws.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
    })
  );
};
