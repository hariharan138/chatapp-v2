export interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  isRead: boolean
  reactions: Record<string, number>
  imageUrl?: string | null
}

export interface User {
  id: string
  username: string
  isOnline: boolean
  lastSeen?: string
}
