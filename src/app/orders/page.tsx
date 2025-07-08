"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, Eye, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const orders = [
  {
    id: "#ORD-001",
    customer: "John Smith",
    date: "2024-01-15",
    status: "completed",
    total: "$299.00",
    items: 3,
    paymentMethod: "Credit Card",
  },
  {
    id: "#ORD-002",
    customer: "Sarah Johnson",
    date: "2024-01-14",
    status: "pending",
    total: "$450.00",
    items: 2,
    paymentMethod: "PayPal",
  },
  {
    id: "#ORD-003",
    customer: "Mike Wilson",
    date: "2024-01-13",
    status: "shipped",
    total: "$150.00",
    items: 1,
    paymentMethod: "Credit Card",
  },
  {
    id: "#ORD-004",
    customer: "Emily Davis",
    date: "2024-01-12",
    status: "cancelled",
    total: "$75.00",
    items: 1,
    paymentMethod: "Bank Transfer",
  },
  {
    id: "#ORD-005",
    customer: "David Brown",
    date: "2024-01-11",
    status: "processing",
    total: "$320.00",
    items: 4,
    paymentMethod: "Credit Card",
  },
]

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || order.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "pending":
        return "secondary"
      case "shipped":
        return "outline"
      case "processing":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Orders</h1>
        <p className="text-gray-600">Track and manage all customer orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">1,245</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Plus className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">23</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Filter className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">1,180</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Plus className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-purple-600">$45,230</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Plus className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Order Management</CardTitle>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>All Orders</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("pending")}>Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("processing")}>Processing</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("shipped")}>Shipped</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("completed")}>Completed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("cancelled")}>Cancelled</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Items</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Payment</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="font-medium text-blue-600">{order.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">{order.customer}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-600">{order.date}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-600">{order.items} items</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">{order.total}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-600">{order.paymentMethod}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
