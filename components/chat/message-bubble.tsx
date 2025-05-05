"use client"

import { useState } from "react"
import { format } from "date-fns"
import type { Message } from "@/lib/types"
import { Heart, ThumbsUp, Smile, Trash2, Edit, Check, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MessageBubbleProps {
  message: Message
  isOwnMessage: boolean
  onReact: (messageId: string, reaction: string) => void
  onDelete: (messageId: string) => void
  onEdit: (messageId: string, newContent: string) => void
}

export default function MessageBubble({ message, isOwnMessage, onReact, onDelete, onEdit }: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(message.content)

  const handleEdit = () => {
    setIsEditing(true)
    setEditedContent(message.content)
  }

  const saveEdit = () => {
    onEdit(message.id, editedContent)
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditedContent(message.content)
  }

  const formattedTime = format(new Date(message.timestamp), "h:mm a")

  return (
    <div className={cn("flex flex-col max-w-[80%]", isOwnMessage ? "ml-auto items-end" : "mr-auto items-start")}>
      <div className="flex items-center mb-1">
        <span className="text-xs font-medium text-slate-600">{message.sender}</span>
        <span className="text-xs text-slate-400 ml-2">{formattedTime}</span>
      </div>

      <div
        className={cn(
          "rounded-lg p-3 shadow-sm",
          isOwnMessage
            ? "bg-purple-600 text-white rounded-tr-none"
            : "bg-white border border-slate-200 rounded-tl-none",
        )}
      >
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-2 text-slate-800 bg-white rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
              rows={2}
            />
            <div className="flex justify-end space-x-2">
              <Button size="sm" variant="outline" onClick={cancelEdit} className="h-8 px-2">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={saveEdit} className="h-8 px-2 bg-purple-600 hover:bg-purple-700">
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className={cn("mb-1", isOwnMessage ? "text-white" : "text-slate-800")}>{message.content}</div>

            {message.imageUrl && (
              <div className="mt-2 rounded overflow-hidden">
                <img src={message.imageUrl || "/placeholder.svg"} alt="Shared image" className="max-w-full h-auto" />
              </div>
            )}
          </>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center mt-1 space-x-1">
          <div className="flex space-x-1">
            {message.reactions &&
              Object.entries(message.reactions).map(([reaction, count]) => (
                <button
                  key={reaction}
                  onClick={() => onReact(message.id, reaction)}
                  className="text-xs bg-white border border-slate-200 rounded-full px-2 py-0.5 flex items-center hover:bg-slate-50"
                >
                  {reaction} {count}
                </button>
              ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                <Smile className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isOwnMessage ? "end" : "start"}>
              <DropdownMenuItem onClick={() => onReact(message.id, "❤️")}>
                <Heart className="h-4 w-4 mr-2 text-red-500" />
                <span>Heart</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onReact(message.id, "👍")}>
                <ThumbsUp className="h-4 w-4 mr-2 text-blue-500" />
                <span>Like</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onReact(message.id, "😂")}>
                <Smile className="h-4 w-4 mr-2 text-yellow-500" />
                <span>Laugh</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isOwnMessage && (
            <>
              <Button variant="ghost" size="sm" onClick={handleEdit} className="h-6 w-6 p-0 rounded-full">
                <Edit className="h-4 w-4 text-slate-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(message.id)}
                className="h-6 w-6 p-0 rounded-full"
              >
                <Trash2 className="h-4 w-4 text-slate-500" />
              </Button>
            </>
          )}
        </div>
      )}

      {message.isRead && isOwnMessage && <span className="text-xs text-slate-400 mt-1">Read</span>}
    </div>
  )
}
