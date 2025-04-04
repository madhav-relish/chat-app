'use client'
import { useEffect } from 'react';

export default function TestWebSocket() {
  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      console.log('Received:', event.data);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  return <div>Testing WebSocket...</div>;
}