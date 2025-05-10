import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { WebSocketServer } from 'ws';
import { appRouter } from '../api/root';
import { db } from '../db';

const wss = new WebSocketServer({
  port: 3001,
});

// Create a simplified context for WebSockets that doesn't try to use auth()
const createWSContext = async (opts: any) => {
  console.log('WebSocket context created with opts:', opts.type);
  return {
    db,
    session: null, // We're not authenticating WebSocket connections for now
  };
};

const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext: createWSContext, // Use our simplified context function
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