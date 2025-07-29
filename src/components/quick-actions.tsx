"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, FileText, Mail, Calendar, Settings } from "lucide-react"

const quickActions = [
  { icon: Plus, label: "New Order", color: "bg-blue-500 hover:bg-blue-600" },
  { icon: Users, label: "Add Customer", color: "bg-green-500 hover:bg-green-600" },
  { icon: FileText, label: "Generate Report", color: "bg-purple-500 hover:bg-purple-600" },
  { icon: Mail, label: "Send Campaign", color: "bg-orange-500 hover:bg-orange-600" },
  { icon: Calendar, label: "Schedule Meeting", color: "bg-pink-500 hover:bg-pink-600" },
  { icon: Settings, label: "System Settings", color: "bg-gray-500 hover:bg-gray-600" },
]

export function QuickActions() {
  return (
    <Card className="bg-white mb-6">
      <CardContent className="p-3 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className={`h-14 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border-2 hover:border-transparent transition-all ${action.color} hover:text-white`}
            >
              <action.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-[11px] sm:text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
