"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Eye } from "lucide-react"

const analyticsData = {
  overview: [
    {
      title: "Total Revenue",
      value: "$54,239",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: "1,245",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
    },
    {
      title: "New Customers",
      value: "89",
      change: "+15.3%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Page Views",
      value: "12,456",
      change: "-2.1%",
      trend: "down",
      icon: Eye,
    },
  ],
  salesByCategory: [
    { category: "Electronics", sales: 45230, percentage: 35 },
    { category: "Clothing", sales: 32100, percentage: 25 },
    { category: "Home & Garden", sales: 25680, percentage: 20 },
    { category: "Sports", sales: 19340, percentage: 15 },
    { category: "Books", sales: 6450, percentage: 5 },
  ],
  topProducts: [
    { name: "Wireless Headphones", sales: 234, revenue: "$23,400" },
    { name: "Smart Watch", sales: 189, revenue: "$18,900" },
    { name: "Laptop Stand", sales: 156, revenue: "$7,800" },
    { name: "USB-C Cable", sales: 145, revenue: "$2,900" },
    { name: "Phone Case", sales: 134, revenue: "$2,680" },
  ],
}

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Track your business performance and insights</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {analyticsData.overview.map((item) => (
          <Card key={item.title} className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{item.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
                  <div className="flex items-center mt-2">
                    {item.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${item.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {item.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-gray-100">
                  <item.icon className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales by Category */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.salesByCategory.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">{category.category}</span>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">${category.sales.toLocaleString()}</span>
                      <span className="text-sm text-gray-500 ml-2">({category.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} sales</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">{product.revenue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance Chart */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Monthly Performance</CardTitle>
          <p className="text-sm text-gray-600">Revenue and orders over the last 12 months</p>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[
              { month: "Jan", revenue: 4000, orders: 120 },
              { month: "Feb", revenue: 3000, orders: 98 },
              { month: "Mar", revenue: 5000, orders: 145 },
              { month: "Apr", revenue: 4500, orders: 132 },
              { month: "May", revenue: 6000, orders: 167 },
              { month: "Jun", revenue: 5500, orders: 154 },
              { month: "Jul", revenue: 7000, orders: 189 },
              { month: "Aug", revenue: 6500, orders: 176 },
              { month: "Sep", revenue: 5800, orders: 162 },
              { month: "Oct", revenue: 6200, orders: 171 },
              { month: "Nov", revenue: 7500, orders: 198 },
              { month: "Dec", revenue: 8000, orders: 210 },
            ].map((item) => (
              <div key={item.month} className="flex flex-col items-center flex-1">
                <div className="flex flex-col items-center space-y-1 w-full">
                  <div
                    className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                    style={{
                      height: `${(item.revenue / 8000) * 180}px`,
                      minHeight: "20px",
                    }}
                  />
                  <div
                    className="w-full bg-green-500 rounded-t-sm transition-all duration-300 hover:bg-green-600"
                    style={{
                      height: `${(item.orders / 210) * 60}px`,
                      minHeight: "10px",
                    }}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-2">{item.month}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center space-x-6">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2" />
              <span className="text-sm text-gray-600">Revenue</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2" />
              <span className="text-sm text-gray-600">Orders</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
