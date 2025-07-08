"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, MoreHorizontal, Mail, Phone, MapPin } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const customers = [
  {
    id: 1,
    name: "John Smith",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    company: "Acme Corp",
    location: "New York, NY",
    status: "active",
    totalOrders: 24,
    totalSpent: "$12,450",
    lastOrder: "2 days ago",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@techstart.com",
    phone: "+1 (555) 987-6543",
    company: "TechStart Inc",
    location: "San Francisco, CA",
    status: "active",
    totalOrders: 18,
    totalSpent: "$8,920",
    lastOrder: "1 week ago",
  },
  {
    id: 3,
    name: "Mike Wilson",
    email: "mike@global.com",
    phone: "+1 (555) 456-7890",
    company: "Global Solutions",
    location: "Chicago, IL",
    status: "inactive",
    totalOrders: 15,
    totalSpent: "$7,650",
    lastOrder: "2 months ago",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily@innovation.com",
    phone: "+1 (555) 321-0987",
    company: "Innovation Labs",
    location: "Austin, TX",
    status: "active",
    totalOrders: 12,
    totalSpent: "$6,340",
    lastOrder: "3 days ago",
  },
]

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || customer.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Customers</h1>
        <p className="text-gray-600">Manage your customer relationships and track their activities</p>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Customer List</CardTitle>
            <Button className="bg-blue">
              dung ngu
            </Button>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search customers..."
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
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>All Customers</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("active")}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("inactive")}>Inactive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Orders</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Total Spent</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.company}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {customer.location}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-3 w-3 mr-2" />
                          {customer.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-3 w-3 mr-2" />
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{customer.totalOrders}</p>
                        <p className="text-sm text-gray-500">Last: {customer.lastOrder}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-green-600">{customer.totalSpent}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={customer.status === "active" ? "default" : "secondary"}>{customer.status}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Customer</DropdownMenuItem>
                          <DropdownMenuItem>Send Email</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
