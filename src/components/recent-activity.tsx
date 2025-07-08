import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    id: 1,
    customer: "John Smith",
    action: "Placed an order",
    amount: "$299.00",
    status: "completed",
    time: "2 hours ago",
  },
  {
    id: 2,
    customer: "Sarah Johnson",
    action: "Updated profile",
    amount: null,
    status: "pending",
    time: "4 hours ago",
  },
  {
    id: 3,
    customer: "Mike Wilson",
    action: "Cancelled order",
    amount: "$150.00",
    status: "cancelled",
    time: "6 hours ago",
  },
  {
    id: 4,
    customer: "Emily Davis",
    action: "Placed an order",
    amount: "$450.00",
    status: "completed",
    time: "8 hours ago",
  },
  {
    id: 5,
    customer: "David Brown",
    action: "Requested refund",
    amount: "$75.00",
    status: "pending",
    time: "1 day ago",
  },
]

export function RecentActivity() {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <p className="text-sm text-gray-600">Latest customer activities and transactions</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Time</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {activity.customer
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{activity.customer}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{activity.action}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{activity.amount || "-"}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        activity.status === "completed"
                          ? "default"
                          : activity.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {activity.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{activity.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
