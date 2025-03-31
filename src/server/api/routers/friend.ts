import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";


export const friendRouter = createTRPCRouter({
    sendRequest: protectedProcedure.input(z.object({
        receiverId: z.string()
    })).mutation(async ({ ctx, input }) => {
        const { receiverId } = input

        const existingRequest = await ctx.db.friend.findUnique({
            where: {
                senderId_receiverId: {
                    senderId: ctx.session.user.id,
                    receiverId
                }
            }
        })

        if (existingRequest) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Friend request already exists"
            })
        }

        return ctx.db.friend.create({
            data: {
                senderId: ctx.session.user.id,
                receiverId
            }
        })
    }),

    acceptRequest: protectedProcedure.input(z.object({
        senderId: z.string()
    })).mutation(async ({ ctx, input }) => {
        const request = await ctx.db.friend.findUnique({
            where: {
                senderId_receiverId: {
                    senderId: input.senderId,
                    receiverId: ctx.session.user.id
                }
            }
        })
        if (!request) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Friend request not found",
            });
        }

        return ctx.db.friend.update({
            where: {
                id: request.id
            },
            data: {
                status: "ACCEPTED"
            }
        })
    }),

    getAllRequests: protectedProcedure.query(async ({ ctx }) => {
        const friends = await ctx.db.friend.findMany({
            where: {
                OR: [
                    { senderId: ctx.session.user.id },
                    { receiverId: ctx.session.user.id }
                ],
                status: "ACCEPTED",
            },
            include: {
                sender: {
                    select: {
                        id: true, name: true, image: true
                    }
                },
                receiver: {
                    select: { id: true, name: true, image: true }
                }
            }
        })

        return friends.map((friend) => ({
            id: friend.id,
            friend: friend.senderId === ctx.session.user.id ? friend.receiver : friend.sender
        }))
    }),

    getPendingRequests: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.friend.findMany({
            where: {
                receiverId: ctx.session.user.id,
                status: "PENDING"
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
    })
})



/* 

// Send a friend request
await trpc.friend.sendRequest.mutate({
  receiverId: "user_id",
});

// Accept a request
await trpc.friend.acceptRequest.mutate({
  senderId: "requester_id",
});

// Get friend list
const friends = await trpc.friend.list.query();

// Get pending requests
const pendingRequests = await trpc.friend.getPendingRequests.query();

*/