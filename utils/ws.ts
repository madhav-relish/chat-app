import { createTRPCProxyClient, createWSClient, httpBatchLink, splitLink, wsLink } from "@trpc/client";
import type { AppRouter } from "~/server/api/root";


const wsClient = createWSClient({
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
})

export const trpcLinks = [
    splitLink({
        condition: (op) => {
            return op.type === 'subscription';
        },
        true: wsLink({
            client: wsClient,
        }),
        false: httpBatchLink({
            url: '/api/trpc',
        }),
    }),
];

export const WsLink = wsLink<AppRouter>({
    client: wsClient,
    transformer: {
        serialize: (data) => JSON.stringify(data),
        deserialize: (data) => JSON.parse(data),
    },
})

export const trpcWsClient = createTRPCProxyClient<AppRouter>({
    links: [WsLink],
  });