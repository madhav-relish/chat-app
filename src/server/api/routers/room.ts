import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";


export const roomRouter = createTRPCRouter({
    createRoom: protectedProcedure.input(z.object({
        name: z.string().optional(),
        isGroup: z.boolean(),
        participants: z.array(z.string())
    })).mutation(async ({ ctx, input }) => {
        const { name, isGroup } = input

        return ctx.db.room.create({
            data: {
                name,
                isGroup,
                participants: {
                    create: {
                        userId: ctx.session.user.id
                    }
                }
            }
        })
    }),

    joinRoom: protectedProcedure.input(z.object({
        roomId: z.string()
    })).mutation(async ({ ctx, input }) => {
        const existingUser = await ctx.db.roomParticipant.findUnique({
            where: {
                roomId_userId: {
                    roomId: input.roomId,
                    userId: ctx.session.user.id
                }
            }
        })

        if (existingUser) {
            throw new Error("Already joined the room")
        }

        return ctx.db.roomParticipant.create({
            data: {
                roomId: input.roomId,
                userId: ctx.session.user.id
            }
        })
    }),

    allJoinedRooms: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.room.findMany({
            where: {
                participants: {
                    some: {
                        userId: ctx.session.user.id
                    }
                }
            },
            include: {
                participants: {
                    include: {

                        user: { select: { id: true, name: true, image: true } }
                    }
                },
                messages:{
                    take: 1,
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })
    }),

    getRoomById: protectedProcedure.input(z.object({roomId: z.string()})).query( async ({ctx, input})=>{
        return ctx.db.room.findUnique({
            where:{
                id: input.roomId
            },
            include: {
                participants: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        image: true,
                      },
                    },
                  },
                },
              },
        })
    })
})

/*

## Usage

// Create a new room
const room = await trpc.room.create.mutate({
  name: "Gaming Squad",
  isGroup: true,
});

// Join a room using roomId
await trpc.room.join.mutate({
  roomId: "room_id_here",
});

// Get user's rooms
const myRooms = await trpc.room.list.query();

// Get specific room details
const roomDetails = await trpc.room.byId.query({
  roomId: "room_id_here",
});

*/