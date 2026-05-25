import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const devApiPlugin = () => {
  const thunderState = {
    resource: {
      id: 'thunder-resource',
      status: 'ok',
      updatedAt: new Date().toISOString(),
      data: {},
    },
    events: [],
  };

  const printRequest = (method, path, payload = null) => {
    if (payload) {
      console.log(`[DEV API] ${method} ${path}`, payload);
      return;
    }

    console.log(`[DEV API] ${method} ${path}`);
  };

  const readJsonBody = (req) =>
    new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        if (!body) {
          resolve({});
          return;
        }

        try {
          resolve(JSON.parse(body));
        } catch {
          resolve({ raw: body });
        }
      });
    });

  return {
    name: 'novapay-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/events', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');

        if (req.method === 'GET') {
          printRequest('GET', '/api/events', thunderState.events);
          res.end(JSON.stringify(thunderState.events));
          return;
        }

        if (req.method === 'POST') {
          const body = await readJsonBody(req);
          thunderState.events.unshift(body);
          thunderState.events = thunderState.events.slice(0, 200);
          printRequest('POST', '/api/events', body);
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true, saved: body }));
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
      });

      server.middlewares.use('/api/thunder', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');

        if (req.method === 'GET') {
          printRequest('GET', '/api/thunder', thunderState.resource);
          res.end(JSON.stringify(thunderState.resource));
          return;
        }

        if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
          const body = await readJsonBody(req);
          printRequest(req.method || 'POST', '/api/thunder', body);
          thunderState.resource = {
            ...thunderState.resource,
            ...body,
            data: body.data ?? body,
            updatedAt: new Date().toISOString(),
          };
          res.statusCode = 200;
          res.end(JSON.stringify(thunderState.resource));
          return;
        }

        if (req.method === 'DELETE') {
          printRequest('DELETE', '/api/thunder');
          thunderState.resource = {
            id: 'thunder-resource',
            status: 'reset',
            updatedAt: new Date().toISOString(),
            data: {},
          };
          res.statusCode = 200;
          res.end(JSON.stringify(thunderState.resource));
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
      });
    },
  };
};

export default defineConfig({
  plugins: [react(), devApiPlugin()],
  server: {
    proxy: {
      '/neoappapi': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
