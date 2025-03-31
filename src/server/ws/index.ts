import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { WebSocketServer } from 'ws';
import { type AppRouter, appRouter } from '../api/root';
import { createContext } from '../api/trpc';

const wss = new WebSocketServer({
  port: 3001
});

const handler = applyWSSHandler<AppRouter>({
  wss,
  router: appRouter,
  createContext,
});

wss.on('connection', (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  ws.once('close', () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  handler.broadcastReconnectNotification();
  wss.close();
});