"use client"

import { useState, useEffect, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Message } from "@/lib/types"

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [currentUser, setCurrentUser] = useState<string>("")

  // Connect to WebSocket server
  const connect = useCallback(async (username: string) => {
    try {
      const ws = new WebSocket("wss://chatapp-backend-9fsl.onrender.com")
      setCurrentUser(username)

      ws.onopen = () => {
        setIsConnected(true)
        // Send initial connection message with username
        ws.send(`${username}: has joined the chat`)
      }

      ws.onmessage = (event) => {
        try {
          // Try to parse as JSON first
          const data = JSON.parse(event.data)
          const newMessage: Message = {
            id: data.id || uuidv4(),
            sender: data.sender || "Unknown",
            content: data.content || data.message || "",
            timestamp: data.timestamp || new Date().toISOString(),
            isRead: false,
            reactions: data.reactions || {},
            imageUrl: data.imageUrl || null,
          }
          setMessages((prev) => [...prev, newMessage])
        } catch (e) {
          // If not JSON, handle as plain text
          const text = event.data.toString()
          // Check if it's a system message or a user message
          if (text.startsWith("[") && text.includes("]")) {
            const closeBracket = text.indexOf("]")
            const sender = text.substring(1, closeBracket)
            const content = text.substring(closeBracket + 1).trim()

            const newMessage: Message = {
              id: uuidv4(),
              sender: sender,
              content: content,
              timestamp: new Date().toISOString(),
              isRead: false,
              reactions: {},
            }
            setMessages((prev) => [...prev, newMessage])
          } else {
            // System message
            const newMessage: Message = {
              id: uuidv4(),
              sender: "System",
              content: text,
              timestamp: new Date().toISOString(),
              isRead: true,
              reactions: {},
            }
            setMessages((prev) => [...prev, newMessage])
          }
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        const disconnectMessage: Message = {
          id: uuidv4(),
          sender: "System",
          content: "Disconnected from chat server",
          timestamp: new Date().toISOString(),
          isRead: true,
          reactions: {},
        }
        setMessages((prev) => [...prev, disconnectMessage])
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        setIsConnected(false)
        const errorMessage: Message = {
          id: uuidv4(),
          sender: "System",
          content: "Error connecting to chat server",
          timestamp: new Date().toISOString(),
          isRead: true,
          reactions: {},
        }
        setMessages((prev) => [...prev, errorMessage])
      }

      setSocket(ws)
      return true
    } catch (error) {
      console.error("Failed to connect:", error)
      return false
    }
  }, [])

  // Send a message
  const sendMessage = useCallback(
    (content: string, imageFile?: File) => {
      if (!isConnected || (!content.trim() && !imageFile) || !socket) return

      // Create a new message object
      const newMessage: Message = {
        id: uuidv4(),
        sender: currentUser,
        content: content.trim(),
        timestamp: new Date().toISOString(),
        isRead: false,
        reactions: {},
      }

      if (imageFile) {
        newMessage.imageUrl = URL.createObjectURL(imageFile)
      }

      // Only send to WebSocket server, don't add to local state
      // The message will be added when received back from the server
      socket.send(`${currentUser}: ${content.trim()}`)
    },
    [isConnected, currentUser, socket],
  )

  // React to a message
  const reactToMessage = useCallback((messageId: string, reaction: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const updatedReactions = { ...msg.reactions }

          // Toggle reaction
          if (updatedReactions[reaction]) {
            updatedReactions[reaction]++
          } else {
            updatedReactions[reaction] = 1
          }

          return { ...msg, reactions: updatedReactions }
        }
        return msg
      }),
    )

    // In a real app, you would send this reaction to the server
    // if (socket) {
    //   socket.send(JSON.stringify({
    //     type: 'reaction',
    //     messageId,
    //     reaction,
    //     user: currentUser
    //   }));
    // }
  }, [])

  // Delete a message
  const deleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId))

    // In a real app, you would send this deletion to the server
    // if (socket) {
    //   socket.send(JSON.stringify({
    //     type: 'delete',
    //     messageId,
    //     user: currentUser
    //   }));
    // }
  }, [])

  // Edit a message
  const editMessage = useCallback((messageId: string, newContent: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, content: newContent } : msg)))

    // In a real app, you would send this edit to the server
    // if (socket) {
    //   socket.send(JSON.stringify({
    //     type: 'edit',
    //     messageId,
    //     content: newContent,
    //     user: currentUser
    //   }));
    // }
  }, [])

  // Clean up WebSocket connection on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [socket])

  return {
    messages,
    sendMessage,
    isConnected,
    typingUsers,
    reactToMessage,
    deleteMessage,
    editMessage,
    connect,
  }
}
