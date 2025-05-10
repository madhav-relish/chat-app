import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure, t } from "../trpc";
import { observable } from "@trpc/server/observable";
import { eventEmitter, Events } from "~/server/ws/events";
import type { WSMessage } from "~/types/message";

interface Message {
    roomId: string
}

export const messageRouter = createTRPCRouter({
    sendMessage: protectedProcedure.input(z.object({
        roomId: z.string(),
        text: z.string().optional(),
        gif: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
        const { roomId, text, gif } = input

        //verify the user exists in the room or not
        const participant = await ctx.db.roomParticipant.findUnique({
            where: {
                roomId_userId: {
                    roomId,
                    userId: ctx.session.user.id
                }
            }
        })

        if (!participant) {
            throw new Error("User is not a member of this group!")
        }
        //if user exists, create a message
        const message = await ctx.db.message.create({
            data: {
              roomId: input.roomId,
              text: input.text,
              gif: input.gif,
              senderId: ctx.session.user.id,
            },
          });

          // Emit the new message event
          console.log('Emitting message event:', message);
          eventEmitter.emit(Events.SEND_MESSAGE, message);

          return message;
    }),

    messageList: protectedProcedure.input(z.object({
        roomId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional() //For pagiantion
    })).query(async ({ ctx, input }) => {
        const { roomId, limit, cursor } = input

        const messages = await ctx.db.message.findMany({
            where: {
                roomId
            },
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: {
                createdAt: 'asc'
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        })

        let nextCursor: typeof cursor | undefined = undefined
        if (messages.length > limit) {
            const nextItem = messages.pop();
            nextCursor = nextItem?.id
        }

        return {
            messages, nextCursor
        }
    }),

    OnMessage: t.procedure // Use the base procedure without any middleware
    .input(z.object({ roomId: z.string() }))
    .subscription(({ input }) => {
      // For subscriptions, we don't need to check auth here
      // This bypasses all middleware including the timing middleware
      console.log('Setting up subscription for roomId:', input.roomId);
      return observable<WSMessage>((emit) => {
        const onMessage = (data: any) => {
          console.log('Received message in subscription handler:', data);
          if (data.roomId === input.roomId) {
            console.log('Emitting message to client for roomId:', input.roomId);
            emit.next(data);
          }
        };

        eventEmitter.on(Events.SEND_MESSAGE, onMessage);
        return () => {
          eventEmitter.off(Events.SEND_MESSAGE, onMessage);
        };
      });
    }),
})


/*

// Send a message
await trpc.message.send.mutate({
  roomId: "room_id",
  text: "Hello everyone!",
});

// Get messages with pagination
const { messages, nextCursor } = await trpc.message.list.query({
  roomId: "room_id",
  limit: 50,
});

*/