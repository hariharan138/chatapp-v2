"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Send, ImageIcon, X } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface MessageInputProps {
  onSendMessage: (content: string, imageFile?: File) => void
  username: string
}

export default function MessageInput({ onSendMessage, username }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useMobile()

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      // Notify server that user is typing
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      // Notify server that user stopped typing
    }, 2000)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearSelectedImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSendMessage = () => {
    if (message.trim() || selectedImage) {
      onSendMessage(message, selectedImage || undefined)
      setMessage("")
      clearSelectedImage()

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        setIsTyping(false)
        // Notify server that user stopped typing
      }
    }
  }

  return (
    <div className="bg-white border-t border-slate-200 p-4">
      {imagePreview && (
        <div className="mb-2 relative">
          <div className="relative inline-block">
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Selected"
              className="h-20 rounded border border-slate-300"
            />
            <button
              onClick={clearSelectedImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0"
        >
          <ImageIcon className="h-5 w-5 text-slate-500" />
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

        <div className="relative flex-1">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              handleTyping()
            }}
            placeholder="Type a message..."
            className="w-full px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
        </div>

        <Button
          type="button"
          onClick={handleSendMessage}
          disabled={!message.trim() && !selectedImage}
          className="shrink-0 bg-purple-600 hover:bg-purple-700 rounded-full"
          size="icon"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
