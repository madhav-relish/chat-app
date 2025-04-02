
import CreateOrJoinRoomComponent from "~/components/create-join-room";

import { auth } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  if(!session){
	return <div>...Loading</div>
  }

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  console.log(session)
  return (
    <HydrateClient>
      <main className="w-full h-screen flex flex-col justify-center items-center">
			<CreateOrJoinRoomComponent/>
      </main>
    </HydrateClient>
  );
}
