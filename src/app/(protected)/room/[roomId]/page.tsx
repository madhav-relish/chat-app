import React from 'react'
import { auth } from '~/server/auth';
import ChatRoom from './ChatRoom';

type Props = {
    params: Promise<{ roomId: string }>;
  };
  

const page = async(props: Props) => {
    const { roomId } = await props.params
    const session = await auth();

    if (!session) {
      <div>...Not authorized</div>
    }
  return (
    <div>
        <ChatRoom roomId={roomId}/>
    </div>
  )
}

export default page