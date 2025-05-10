"use client";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";

const CreateOrJoinRoomComponent = () => {
  const [createRoomInput, setCreateRoomInput] = useState<string>("");
  const [joinRoomInput, setJoinRoomInput] = useState<string>("");
  const router = useRouter()

  const createRoom = api.room.createRoom.useMutation();
  const joinRoom = api.room.joinRoom.useMutation();
  const allRooms = api.room.allJoinedRooms.useQuery()

  console.log("Rooms::", allRooms.data)

  const session = useSession()

  if(session.status === "loading"){
    return <div>...Loading</div>
    }

  const handleJoinRoom = async () => {
    try {
      const response = await joinRoom.mutate({ roomId: joinRoomInput });
      toast.success("Joined Room");
      router.push(`/room/${joinRoomInput}`)
    } catch (error) {
      console.error("Error while joining room", error);
      toast.error("Something seems wrong");
    }
  };

  return (
    <Card className="w-full max-w-md p-4">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">Welcome!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="create-room" className="block mb-2">
            Create a Room
          </Label>
          <Input
            id="create-room"
            placeholder="Enter room name"
            className="mb-2"
            value={createRoomInput}
            onChange={(e) => setCreateRoomInput(e.target.value)}
          />
          <Button
            disabled={createRoomInput.length === 0}
            className="w-full"
            onClick={async () => {
              await createRoom.mutate({
                isGroup: true,
                name: createRoomInput,
              });
            }}
          >
            Create Room
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-sm text-gray-500">OR</span>
          <Separator className="flex-1" />
        </div>
        <div>
          <Label htmlFor="join-room" className="block mb-2">
            Join a Room
          </Label>
          <Input
            value={joinRoomInput}
            onChange={(e) => setJoinRoomInput(e.target.value)}
            id="join-room"
            placeholder="Enter room ID"
            className="mb-2"
          />
          <Button
            disabled={joinRoomInput.length === 0}
            onClick={handleJoinRoom}
            className="w-full"
          >
            Join Room
          </Button>
        </div>
        <div>
          Joined Rooms:
          {
            allRooms.status === "pending" ? <div>...Loading Rooms</div> : 
            allRooms.status === "error" ? <div>Error while fetching Rooms</div>:
            allRooms.data.map((room)=>(
            <div
            className="cursor-pointer hover:underline"
            onClick={()=>redirect(`/room/${room.id}`)}
            key={room.id}>{room.name}</div>
          ))
          }
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateOrJoinRoomComponent;
