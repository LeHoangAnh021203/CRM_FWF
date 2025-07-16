"use client";

import {
  Users,
  ShoppingCart,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const menuItems = [
  {
    icon: Users,
    label: "Customer",
    href: "/customers",
  },
  {
    icon: ShoppingCart,
    label: "Orders",
    href: "/orders",
  },
  {
    icon: BarChart3,
    label: "Services",
    href: "/services",
  },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-[#f66035] text-white flex flex-col">
      <div className="p-6 border-b border-[#fdec40]">
        <h2 className="text-xl font-bold">Master Report</h2>
        <p className="text-white text-sm mt-1">FB Network</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors",
                  "text-white hover:bg-slate-700 hover:text-white"
                )}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-[#fdec40]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#61c9d7] rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">FB</span>
          </div>
          <div className="h-full">
            <p className="text-sm font-medium">FB Network</p>
            <p className="text-xs text-white">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
