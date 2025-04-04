'use client'
import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Send, ImageIcon } from "lucide-react"
import type { WSMessage } from '~/types/message'
import { api } from '~/trpc/react'

type Message = {
  id: string
  content: string
  sender: string
  timestamp: Date
  isSender: boolean
}

const dummyMessages: Message[] = [
  {
    id: '1',
    content: 'Hey there! How are you?',
    sender: 'John',
    timestamp: new Date('2024-04-04T10:00:00'),
    isSender: false,
  },
  {
    id: '2',
    content: 'I\'m good! Just working on this chat app.',
    sender: 'You',
    timestamp: new Date('2024-04-04T10:01:00'),
    isSender: true,
  },
  {
    id: '3',
    content: 'That sounds interesting! How\'s it going?',
    sender: 'John',
    timestamp: new Date('2024-04-04T10:02:00'),
    isSender: false,
  },
]

const ChatRoom = ({ roomId }: { roomId: string }) => {
  const { data: session } = useSession()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<WSMessage[]>([])

  // Query for initial messages
  const { data: initialMessages } = api.message.messageList.useQuery({
    roomId,
    limit: 50
  })

  // Subscribe to new messages
  api.message.OnMessage.useSubscription(
    { roomId },
    {
      onData(data) {
        const message = data as unknown as WSMessage
        setMessages((prev) => [...prev, message])
      },
      onError(err) {
        console.error('Subscription error:', err)
      },
    },
  )

  //Send new message
  const sendMessage = api.message.sendMessage.useMutation({
    onSuccess: ()=>{
      setMessage("")
    }
  })

  const handleSendMessage = async(e: React.FormEvent)=>{
    e.preventDefault()

    if(!message.trim()) return

    try{
      await sendMessage.mutateAsync({
        roomId,
        text: message
      })
    }catch(error){
      console.error("Error while sending message",error)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
    {/* Header */}
    <div className="border-b bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Chat Room: {roomId}</h2>
      <p className="text-sm text-gray-500">
        {session?.user?.name ? `Logged in as ${session.user.name}` : 'Loading...'}
      </p>
    </div>

    {/* Messages */}
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[70%] rounded-lg px-4 py-2 ${
              msg.senderId === session?.user?.id
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-900 shadow-sm'
            }`}
          >
            <div className="mb-1 text-xs opacity-75">
              {msg.senderId === session?.user?.id ? 'You' : 'Other'} • 
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
            <p>{msg.text}</p>
            {msg.gif && (
              <img src={msg.gif} alt="GIF" className="mt-2 max-h-40 rounded" />
            )}
          </div>
        </div>
      ))}
    </div>

    {/* Input area */}
    <form onSubmit={handleSendMessage} className="border-t bg-white p-4">
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="icon">
          <ImageIcon className="h-5 w-5" />
        </Button>
        <Input 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..." 
          className="flex-1"
        />
        <Button type="submit" disabled={!message.trim() || sendMessage.isPending}>
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  </div>
  )
}

export default ChatRoom