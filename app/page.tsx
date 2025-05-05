"use client"

import { useState } from "react"
import { useChat } from "@/hooks/use-chat"
import ChatHeader from "@/components/chat/chat-header"
import MessageList from "@/components/chat/message-list"
import MessageInput from "@/components/chat/message-input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

export default function ChatPage() {
  const [username, setUsername] = useState<string>("")
  const [isJoining, setIsJoining] = useState<boolean>(false)
  const isMobile = useMobile()

  const { messages, sendMessage, isConnected, typingUsers, reactToMessage, deleteMessage, editMessage, connect } =
    useChat()

  const joinChat = () => {
    if (!username) return
    setIsJoining(true)
    connect(username).finally(() => setIsJoining(false))
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6 text-slate-800">Join the Chat</h1>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-slate-700">
                Your Name
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your name"
                onKeyDown={(e) => e.key === "Enter" && joinChat()}
              />
            </div>
            <Button
              onClick={joinChat}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={!username || isJoining}
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Chat"
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <ChatHeader username={username} typingUsers={typingUsers} />
      <MessageList
        messages={messages}
        currentUser={username}
        onReact={reactToMessage}
        onDelete={deleteMessage}
        onEdit={editMessage}
      />
      <MessageInput onSendMessage={sendMessage} username={username} />
    </div>
  )
}
