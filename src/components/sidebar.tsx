"use client";

import { Users, ShoppingCart, BarChart3, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-40 bg-[#f66035] text-white flex flex-col transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-16"
        )}
      >
        {/* Logo section with toggle button */}
        <div className="p-2 border-b border-[#fdec40]">
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-10 h-10 flex items-center justify-center "
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <div
              className={cn(
                "transition-opacity duration-300",
                isOpen ? "block" : "hidden"
              )}
            >
              <h2 className="text-xl font-bold">Master Report</h2>
              <p className="text-white text-sm mt-1">FB Network</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 lg:p-4">
          <ul className="flex space-y-2 justify-center ">
            <div>
              {menuItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={cn(
                      "w-full flex items-center j lg:justify-start px-2 lg:px-3 py-2 rounded-lg text-left transition-colors",
                      "text-white hover:bg-slate-700 hover:text-white"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5" />
                      <span
                        className={cn(
                          "transition-opacity duration-300",
                          isOpen ? "block" : "hidden"
                        )}
                      >
                        {item.label}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </div>
          </ul>
        </nav>

        {/* User section */}
        <div className="p-2 border-t border-[#fdec40]">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-8 h-8 bg-[#61c9d7] rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                <img src="/logo.png" className="w-full h-full"/>
              </span>
            </div>
            <div
              className={cn(
                "transition-opacity duration-300",
                isOpen ? "block" : "hidden"
              )}
            >
              <p className="text-sm font-medium">FB Network</p>
              <p className="text-xs text-white">Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay chỉ cho mobile nếu muốn */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
