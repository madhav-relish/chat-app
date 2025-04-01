import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { auth } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="w-full h-screen flex flex-col justify-center items-center">
		<Card className="w-full max-w-md p-4">
		  <CardHeader className="text-center">
			<CardTitle className="text-xl font-bold">Welcome!</CardTitle>
		  </CardHeader>
		  <CardContent className="space-y-4">
			<div>
			  <Label htmlFor="create-room" className="block mb-2">
			Create a Room
			  </Label>
			  <Input id="create-room" placeholder="Enter room name" className="mb-2" />
			  <Button className="w-full">Create Room</Button>
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
			  <Input id="join-room" placeholder="Enter room ID" className="mb-2" />
			  <Button className="w-full">Join Room</Button>
			</div>
		  </CardContent>
		</Card>
      </main>
    </HydrateClient>
  );
}
