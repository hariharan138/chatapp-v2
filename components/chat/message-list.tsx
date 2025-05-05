"use client"

import { useRef, useEffect } from "react"
import MessageBubble from "./message-bubble"
import type { Message } from "@/lib/types"

interface MessageListProps {
  messages: Message[]
  currentUser: string
  onReact: (messageId: string, reaction: string) => void
  onDelete: (messageId: string) => void
  onEdit: (messageId: string, newContent: string) => void
}

export default function MessageList({ messages, currentUser, onReact, onDelete, onEdit }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwnMessage={message.sender === currentUser}
          onReact={onReact}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
