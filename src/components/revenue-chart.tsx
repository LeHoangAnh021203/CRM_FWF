"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function RevenueChart() {
  const data = [
    { month: "Jan", revenue: 4000 },
    { month: "Feb", revenue: 3000 },
    { month: "Mar", revenue: 5000 },
    { month: "Apr", revenue: 4500 },
    { month: "May", revenue: 6000 },
    { month: "Jun", revenue: 5500 },
  ]

  const maxRevenue = Math.max(...data.map((d) => d.revenue))

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
        <p className="text-sm text-gray-600">Monthly revenue for the last 6 months</p>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between space-x-2">
          {data.map((item) => (
            <div key={item.month} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                style={{
                  height: `${(item.revenue / maxRevenue) * 200}px`,
                  minHeight: "20px",
                }}
              />
              <span className="text-xs text-gray-600 mt-2">{item.month}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between text-sm text-gray-600">
          <span>$0</span>
          <span>${maxRevenue.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}
