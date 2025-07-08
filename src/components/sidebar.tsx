"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  FileText,
  Calendar,
  Mail,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/", active: true },
  {
    icon: Users,
    label: "Customers",
    href: "/customers",
    count: 1.2,
    subItems: [
      { label: "All Customers", href: "/customers" },
      { label: "Add Customer", href: "/customers/add" },
      { label: "Customer Groups", href: "/customers/groups" },
      { label: "Customer Report", href: "/customers/report" },
    ],
  },
  {
    icon: ShoppingCart,
    label: "Orders",
    href: "/orders",
    count: 75,
    subItems: [
      { label: "All Orders", href: "/orders" },
      { label: "Pending Orders", href: "/orders?status=pending" },
      { label: "Completed Orders", href: "/orders?status=completed" },
      { label: "Refunds", href: "/orders/refunds" },
    ],
  },
  {
    icon: BarChart3,
    label: "Analytics",
    href: "/analytics",
    subItems: [
      { label: "Sales Analytics", href: "/analytics/sales" },
      { label: "Customer Analytics", href: "/analytics/customers" },
      { label: "Product Analytics", href: "/analytics/products" },
    ],
  },
  {
    icon: FileText,
    label: "Reports",
    href: "/reports",
    subItems: [
      { label: "Sales Reports", href: "/reports/sales" },
      { label: "Customer Reports", href: "/reports/customers" },
      { label: "Inventory Reports", href: "/reports/inventory" },
    ],
  },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: Mail, label: "Messages", href: "/messages", count: 12 },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
    subItems: [
      { label: "General", href: "/settings?tab=profile" },
      { label: "Users", href: "/settings?tab=team" },
      { label: "Integrations", href: "/settings?tab=integrations" },
      { label: "Security", href: "/settings?tab=security" },
    ],
  },
]

export function Sidebar() {
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  return (
    <div className="w-64 bg-slate-800 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-bold">CRM Dashboard</h2>
        <p className="text-slate-400 text-sm mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              {item.subItems ? (
                <button
                  onClick={() => toggleExpanded(item.label)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors",
                    "text-slate-300 hover:bg-slate-700 hover:text-white",
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.count && <span className="bg-slate-600 text-xs px-2 py-1 rounded-full">{item.count}</span>}
                    {expandedItems.includes(item.label) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors",
                    item.active ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white",
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.count && <span className="bg-slate-600 text-xs px-2 py-1 rounded-full">{item.count}</span>}
                </Link>
              )}
              {expandedItems.includes(item.label) && item.subItems && (
                <ul className="ml-8 mt-2 space-y-1">
                  {item.subItems.map((subItem) => (
                    <li key={subItem.label}>
                      <Link
                        href={subItem.href}
                        className="w-full text-left px-3 py-1 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded block"
                      >
                        {subItem.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">JD</span>
          </div>
          <div>
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-slate-400">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  )
}
