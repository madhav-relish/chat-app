import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { WebSocketServer } from 'ws';
import { appRouter } from '../api/root';
import { createContext } from '../api/trpc';

const wss = new WebSocketServer({
  port: 3001,
});

const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext, // Use the updated createContext function
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

console.log('✅ WebSocket Server listening on ws://localhost:3001');