import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";


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
        return await ctx.db.message.create({
            data: {
                roomId,
                text,
                gif,
                senderId: ctx.session.user.id
            }
        })
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
                createdAt: 'desc'
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
    })
})