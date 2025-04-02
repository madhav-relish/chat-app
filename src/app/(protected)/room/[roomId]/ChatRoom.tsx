import React from 'react'

type Props = {
    roomId: string
}

const ChatRoom = (props: Props) => {
    const {roomId} = props
  return (
    <div>ChatRoom: {roomId}</div>
  )
}

export default ChatRoom