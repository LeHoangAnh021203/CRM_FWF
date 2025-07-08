"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Calendar, TrendingUp, Users, ShoppingCart } from "lucide-react"

const reports = [
  {
    id: 1,
    name: "Monthly Sales Report",
    description: "Comprehensive sales analysis for the current month",
    type: "Sales",
    lastGenerated: "2024-01-15",
    status: "ready",
    size: "2.4 MB",
  },
  {
    id: 2,
    name: "Customer Analytics Report",
    description: "Customer behavior and demographics analysis",
    type: "Analytics",
    lastGenerated: "2024-01-14",
    status: "generating",
    size: "1.8 MB",
  },
  {
    id: 3,
    name: "Inventory Status Report",
    description: "Current stock levels and inventory management",
    type: "Inventory",
    lastGenerated: "2024-01-13",
    status: "ready",
    size: "956 KB",
  },
  {
    id: 4,
    name: "Financial Summary",
    description: "Revenue, expenses, and profit analysis",
    type: "Financial",
    lastGenerated: "2024-01-12",
    status: "ready",
    size: "3.2 MB",
  },
  {
    id: 5,
    name: "Marketing Campaign Report",
    description: "Campaign performance and ROI analysis",
    type: "Marketing",
    lastGenerated: "2024-01-11",
    status: "failed",
    size: "1.2 MB",
  },
]

const quickStats = [
  {
    title: "Reports Generated",
    value: "156",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "This Month",
    value: "23",
    icon: Calendar,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Automated Reports",
    value: "12",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
]

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState("all")

  const filteredReports = reports.filter(
    (report) => selectedType === "all" || report.type.toLowerCase() === selectedType.toLowerCase(),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "default"
      case "generating":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">Generate and manage business reports and analytics</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {quickStats.map((stat) => (
          <Card key={stat.title} className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Generation */}
      <Card className="bg-white mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Generate New Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2">
              <ShoppingCart className="h-6 w-6" />
              <span className="text-sm">Sales Report</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Customer Report</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
            >
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Analytics Report</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">Custom Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Reports</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={selectedType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("all")}
              >
                All
              </Button>
              <Button
                variant={selectedType === "sales" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("sales")}
              >
                Sales
              </Button>
              <Button
                variant={selectedType === "analytics" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("analytics")}
              >
                Analytics
              </Button>
              <Button
                variant={selectedType === "inventory" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("inventory")}
              >
                Inventory
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-600">{report.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">Last generated: {report.lastGenerated}</span>
                      <span className="text-xs text-gray-500">Size: {report.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={getStatusColor(report.status)}>{report.status}</Badge>
                  {report.status === "ready" && (
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
