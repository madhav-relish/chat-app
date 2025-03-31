import { createWSClient, httpBatchLink, splitLink, wsLink } from "@trpc/client";


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