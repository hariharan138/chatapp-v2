import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import type { Message } from "@/lib/types"

// In a real application, this would be stored in a database
let messages: Message[] = []

export async function GET() {
  return NextResponse.json({ messages })
}

export async function POST(request: Request) {
  const { sender, content, imageUrl } = await request.json()

  if (!sender || (!content && !imageUrl)) {
    return NextResponse.json({ error: "Sender and either content or image are required" }, { status: 400 })
  }

  const newMessage: Message = {
    id: uuidv4(),
    sender,
    content: content || "",
    timestamp: new Date().toISOString(),
    isRead: false,
    reactions: {},
    imageUrl: imageUrl || null,
  }

  messages.push(newMessage)

  return NextResponse.json({ message: newMessage })
}

export async function PUT(request: Request) {
  const { id, content } = await request.json()

  if (!id || !content) {
    return NextResponse.json({ error: "Message ID and content are required" }, { status: 400 })
  }

  const messageIndex = messages.findIndex((msg) => msg.id === id)

  if (messageIndex === -1) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 })
  }

  messages[messageIndex].content = content

  return NextResponse.json({ message: messages[messageIndex] })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Message ID is required" }, { status: 400 })
  }

  const messageIndex = messages.findIndex((msg) => msg.id === id)

  if (messageIndex === -1) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 })
  }

  const deletedMessage = messages[messageIndex]
  messages = messages.filter((msg) => msg.id !== id)

  return NextResponse.json({ message: deletedMessage })
}
