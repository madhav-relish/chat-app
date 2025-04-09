'use client'
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Send, ImageIcon, X } from "lucide-react"
import { api } from '~/trpc/react'
import type { WSMessage } from '~/types/message'
import { GifPicker } from '~/components/ui/gif-picker'
import type { GiphyGif } from '~/lib/giphy'

const ChatRoom = ({ roomId }: { roomId: string }) => {
  const { data: session } = useSession()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<WSMessage[]>([])
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [selectedGif, setSelectedGif] = useState<GiphyGif | null>(null)

  // Query for initial messages
  const { data: initialMessages } = api.message.messageList.useQuery({
    roomId,
    limit: 50,
  })

  // Subscribe to new messages
  api.message.OnMessage.useSubscription(
    { roomId },
    {
      onData(data) {
        console.log('Received message from subscription:', data);
        setMessages((prev) => [...prev, data]);
      },
      onError(err) {
        console.error('Subscription error:', err);
      },
      onStarted() {
        console.log('Subscription started for roomId:', roomId);
      },
    },
  )

  // Update messages when initial messages are fetched
  useEffect(() => {
    if (initialMessages) {
      //@ts-ignore
      setMessages(initialMessages.messages)
    }

    console.log("MEssages::", initialMessages)
  }, [initialMessages])

  // Send new message
  const sendMessage = api.message.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("")
    },
  })

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    // Don't send if no text message and no GIF selected
    if (!message.trim() && !selectedGif) return

    try {
      console.log('Sending message to roomId:', roomId);
      const result = await sendMessage.mutateAsync({
        roomId,
        text: message.trim() || undefined,
        gif: selectedGif ? selectedGif.images.downsized.url : undefined,
      });
      console.log('Message sent successfully:', result);

      // Manually add the message to the UI for immediate feedback
      // This ensures the message appears even if the subscription fails
      if (result) {
        setMessages(prev => [...prev, result as unknown as WSMessage]);
      }

      // Reset state after sending
      setMessage("");
      setSelectedGif(null);
    } catch (error) {
      console.error("Error while sending message", error)
    }
  }

  const handleGifSelect = (gif: GiphyGif) => {
    setSelectedGif(gif);
    setShowGifPicker(false);
  }



  return (
    <div className="flex h-screen flex-col ">
      {/* Header */}
      <div className="border-b bg-black p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-white">Chat Room: {roomId}</h2>
        <p className="text-sm text-gray-400">
          {session?.user?.name ? `Logged in as ${session.user.name}` : 'Loading...'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length !== 0 && messages?.map((msg) => (
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

      {/* Selected GIF preview */}
      {selectedGif && (
        <div className="border-t  p-2">
          <div className="relative inline-block">
            <img
              src={selectedGif.images.fixed_height.url}
              alt="Selected GIF"
              className="h-20 rounded-md"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
              onClick={() => setSelectedGif(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowGifPicker(true)}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 text-black"
          />
          <Button
            type="submit"
            disabled={((!message.trim() && !selectedGif) || sendMessage.isPending)}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>

      {/* GIF Picker Modal */}
      {showGifPicker && (
        <GifPicker
          onSelect={handleGifSelect}
          onClose={() => setShowGifPicker(false)}
        />
      )}
    </div>
  )
}

export default ChatRoom