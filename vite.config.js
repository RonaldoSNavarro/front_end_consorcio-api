import { defineConfig, createLogger } from 'vite'
import react from '@vitejs/plugin-react'

const logger = createLogger()
const originalError = logger.error
logger.error = (msg, options) => {
  if (msg.includes('http proxy error') || msg.includes('ECONNREFUSED')) {
    return;
  }
  originalError(msg, options);
}

// https://vite.dev/config/
export default defineConfig({
  customLogger: logger,
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            if (err.code === 'ECONNREFUSED') {
              res.writeHead(502, {
                'Content-Type': 'application/json',
              });
              res.end(JSON.stringify({ 
                mensagem: "Servidor Spring Boot offline", 
                detalhes: "ECONNREFUSED" 
              }));
              return;
            }
            console.error('Proxy Error:', err);
          });
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.js',
    exclude: ['node_modules/**', 'e2e/**'],
  },
})
