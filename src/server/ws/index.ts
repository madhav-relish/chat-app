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

const pingInterval = setInterval(() => {
  wss.clients.forEach((ws: any) => {
    if (!ws.isAlive) {
      console.log('Terminating stale connection');
      return ws.terminate();
    }
    ws.isAlive = false;
    console.log('Sending ping to client'); // ADD THIS LINE
    ws.ping();
  });
}, 30000);

wss.on('connection', (ws: any) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  ws.isAlive = true;

  ws.on('pong', () => {
    ws.isAlive = true;
    console.log('Received pong from client'); // ADD THIS LINE
  });

  ws.once('close', () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  clearInterval(pingInterval);
  handler.broadcastReconnectNotification();
  wss.close();
});

process.on('SIGINT', () => {
  console.log('SIGINT received');
  clearInterval(pingInterval);
  wss.close();
  process.exit();
});

console.log('✅ WebSocket Server listening on ws://localhost:3001');