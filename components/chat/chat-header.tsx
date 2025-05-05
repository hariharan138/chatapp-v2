import { User, Users } from "lucide-react"

interface ChatHeaderProps {
  username: string
  typingUsers: string[]
}

export default function ChatHeader({ username, typingUsers }: ChatHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-purple-100 p-2 rounded-full">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-800">Chat Room</h1>
            <div className="text-xs text-slate-500 flex items-center">
              <User className="h-3 w-3 mr-1" />
              <span>You: {username}</span>
            </div>
          </div>
        </div>

        {typingUsers.length > 0 && (
          <div className="text-sm text-slate-500 animate-pulse">
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
          </div>
        )}
      </div>
    </div>
  )
}
