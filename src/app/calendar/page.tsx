"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus, Clock, Users, MapPin } from "lucide-react"

const events = [
  {
    id: 1,
    title: "Team Meeting",
    date: "2024-01-15",
    time: "10:00 AM",
    duration: "1 hour",
    type: "meeting",
    attendees: 5,
    location: "Conference Room A",
  },
  {
    id: 2,
    title: "Client Presentation",
    date: "2024-01-16",
    time: "2:00 PM",
    duration: "2 hours",
    type: "presentation",
    attendees: 8,
    location: "Main Hall",
  },
  {
    id: 3,
    title: "Product Launch",
    date: "2024-01-18",
    time: "9:00 AM",
    duration: "4 hours",
    type: "event",
    attendees: 25,
    location: "Auditorium",
  },
  {
    id: 4,
    title: "Sales Review",
    date: "2024-01-20",
    time: "11:00 AM",
    duration: "1.5 hours",
    type: "review",
    attendees: 6,
    location: "Conference Room B",
  },
]

const upcomingEvents = [
  {
    id: 1,
    title: "Weekly Standup",
    time: "9:00 AM",
    date: "Today",
    type: "meeting",
  },
  {
    id: 2,
    title: "Client Call",
    time: "2:30 PM",
    date: "Today",
    type: "call",
  },
  {
    id: 3,
    title: "Project Review",
    time: "10:00 AM",
    date: "Tomorrow",
    type: "review",
  },
]

export default function CalendarPage() {
  const [currentDate] = useState(new Date())

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800"
      case "presentation":
        return "bg-purple-100 text-purple-800"
      case "event":
        return "bg-green-100 text-green-800"
      case "review":
        return "bg-orange-100 text-orange-800"
      case "call":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Calendar</h1>
        <p className="text-gray-600">Manage your schedule and upcoming events</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Event
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - 6 + 1
                  const isCurrentMonth = day > 0 && day <= 31
                  const hasEvent = isCurrentMonth && [15, 16, 18, 20].includes(day)
                  return (
                    <div
                      key={i}
                      className={`p-2 h-12 border border-gray-100 text-center text-sm cursor-pointer hover:bg-gray-50 ${
                        isCurrentMonth ? "text-gray-900" : "text-gray-300"
                      } ${hasEvent ? "bg-blue-50 border-blue-200" : ""}`}
                    >
                      {isCurrentMonth ? day : ""}
                      {hasEvent && <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1" />}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card className="bg-white mt-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Scheduled Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {event.time} ({event.duration})
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {event.attendees} attendees
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </div>
                        </div>
                      </div>
                      <Badge className={getEventTypeColor(event.type)}>{event.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600">{event.time}</span>
                      <Badge className={getEventTypeColor(event.type)}>
  {event.type}
</Badge>
                    </div>
                    <span className="text-xs text-gray-500">{event.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Clock className="h-4 w-4 mr-2" />
                Set Reminder
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Users className="h-4 w-4 mr-2" />
                Invite Attendees
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
