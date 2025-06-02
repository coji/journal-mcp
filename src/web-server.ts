import compression from 'compression';
import express from 'express';
import { createRequestHandler } from '@react-router/express';

const BUILD_PATH = '../build/server/index.js';

const requestHandler = createRequestHandler({
  build: await import(BUILD_PATH),
});

export const startWebServer = async (port?: Number) => {
  // Short-circuit the type-checking of the built output.
  const BUILD_PATH = '../build/server/index.js';
  const PORT = port || 3000;

  const app = express();

  app.use(compression());
  app.disable('x-powered-by');
  app.use(
    '/assets',
    express.static('../build/client/assets', { immutable: true, maxAge: '1y' })
  );
  app.use(express.static('build/client', { maxAge: '1h' }));
  app.use(requestHandler);

  const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  // シャットダウン関数を返す
  return {
    close: async (): Promise<void> => {
      return new Promise((resolve, reject) => {
        console.log('Shutting down server...');
        server.close((err) => {
          if (err) {
            console.error('Error during server shutdown:', err);
            reject(err);
          } else {
            console.log('Server shut down successfully');
            resolve();
          }
        });
      });
    },
  };
};
