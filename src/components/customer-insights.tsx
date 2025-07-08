"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, Star, MapPin } from "lucide-react"

const insights = [
  {
    title: "Customer Satisfaction",
    value: 94,
    icon: Star,
    color: "text-yellow-500",
    description: "Based on recent reviews",
  },
  {
    title: "Customer Retention",
    value: 87,
    icon: Users,
    color: "text-green-500",
    description: "Returning customers",
  },
  {
    title: "Market Reach",
    value: 76,
    icon: MapPin,
    color: "text-blue-500",
    description: "Geographic coverage",
  },
  {
    title: "Growth Rate",
    value: 68,
    icon: TrendingUp,
    color: "text-purple-500",
    description: "Monthly growth",
  },
]

const topCustomers = [
  { name: "Acme Corp", revenue: "$12,450", orders: 24 },
  { name: "TechStart Inc", revenue: "$8,920", orders: 18 },
  { name: "Global Solutions", revenue: "$7,650", orders: 15 },
  { name: "Innovation Labs", revenue: "$6,340", orders: 12 },
]

export function CustomerInsights() {
  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Customer Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.title} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <insight.icon className={`h-4 w-4 ${insight.color}`} />
                  <span className="text-sm font-medium text-gray-700">{insight.title}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{insight.value}%</span>
              </div>
              <Progress value={insight.value} className="h-2" />
              <p className="text-xs text-gray-500">{insight.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCustomers.map((customer, index) => (
              <div key={customer.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-500">{customer.orders} orders</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">{customer.revenue}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
