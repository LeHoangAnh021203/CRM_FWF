"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Send, Paperclip, MoreHorizontal, Star, Archive } from "lucide-react"

const conversations = [
  {
    id: 1,
    name: "John Smith",
    email: "john@example.com",
    lastMessage: "Thanks for the quick response! I'll review the proposal and get back to you.",
    time: "2 min ago",
    unread: 2,
    starred: true,
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@techstart.com",
    lastMessage: "Can we schedule a call to discuss the project requirements?",
    time: "1 hour ago",
    unread: 0,
    starred: false,
  },
  {
    id: 3,
    name: "Mike Wilson",
    email: "mike@global.com",
    lastMessage: "The order has been processed successfully. Tracking number: #TR123456",
    time: "3 hours ago",
    unread: 1,
    starred: false,
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily@innovation.com",
    lastMessage: "Looking forward to our meeting tomorrow at 2 PM.",
    time: "1 day ago",
    unread: 0,
    starred: true,
  },
]

const messages = [
  {
    id: 1,
    sender: "John Smith",
    content: "Hi there! I wanted to follow up on the proposal we discussed last week.",
    time: "10:30 AM",
    isOwn: false,
  },
  {
    id: 2,
    sender: "You",
    content: "Hello John! Thanks for reaching out. I've prepared the updated proposal with the changes we discussed.",
    time: "10:45 AM",
    isOwn: true,
  },
  {
    id: 3,
    sender: "John Smith",
    content: "Perfect! Could you send it over? I'd like to review it with my team.",
    time: "11:00 AM",
    isOwn: false,
  },
  {
    id: 4,
    sender: "You",
    content: "I'll send it over within the next hour. Is there anything specific you'd like me to highlight?",
    time: "11:15 AM",
    isOwn: true,
  },
  {
    id: 5,
    sender: "John Smith",
    content: "Thanks for the quick response! I'll review the proposal and get back to you.",
    time: "11:30 AM",
    isOwn: false,
  },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sendMessage = () => {
    if (newMessage.trim()) {
      // Add message logic here
      setNewMessage("")
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600">Communicate with your customers and team members</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 transition-colors ${
                    selectedConversation.id === conversation.id ? "bg-blue-50 border-blue-500" : "border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{conversation.name}</h3>
                        {conversation.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{conversation.email}</p>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{conversation.lastMessage}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className="text-xs text-gray-500">{conversation.time}</span>
                      {conversation.unread > 0 && (
                        <Badge className="bg-blue-500 text-white text-xs">{conversation.unread}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="bg-white h-full flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">{selectedConversation.name}</CardTitle>
                  <p className="text-sm text-gray-600">{selectedConversation.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isOwn ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.isOwn ? "text-blue-100" : "text-gray-500"}`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
