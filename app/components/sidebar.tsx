"use client";

import {
  Users,
  ShoppingCart,
  BarChart3,
  Menu,
  X,
  Sparkles,
  Radical,
  CalendarCheck2,
} from "lucide-react";
import { cn } from "../lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

const menuItems = [
  {
    icon: Users,
    label: "Customer",
    href: "/dashboard/customers",
  },
  {
    icon: ShoppingCart,
    label: "Orders",
    href: "/dashboard/orders",
  },
  {
    icon: BarChart3,
    label: "Services",
    href: "/dashboard/services",
  },
  {
    icon: Radical,
    label: "Accounts",
    href: "/dashboard/accounting",
  },
  {
    icon: CalendarCheck2,
    label: "Calendar",
    href: "/dashboard/calendar",
  },
  {
    icon: Sparkles,
    label: "Generate",
    href: "/dashboard/generateAI",
  },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

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
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.label}>
                    <button
                      onClick={() => {
                        if (isNavigating) return; // Prevent multiple clicks
                        console.log(`[Sidebar] Navigating to: ${item.href}`);
                        setIsNavigating(true);
                        
                        // Try router.push first
                        router.push(item.href, { scroll: false });
                        
                        // Fallback to window.location if router doesn't work
                        setTimeout(() => {
                          if (window.location.pathname !== item.href) {
                            console.log(`[Sidebar] Router failed, using window.location`);
                            window.location.href = item.href;
                          }
                          setIsNavigating(false);
                        }, 2000);
                      }}
                      disabled={isNavigating}
                      className={cn(
                        "w-full flex items-center j lg:justify-start px-2 lg:px-3 py-2 rounded-lg text-left transition-colors",
                        isActive
                          ? "bg-white text-[#f66035] shadow-md"
                          : "text-white hover:bg-slate-700 hover:text-white"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        {isNavigating && pathname === item.href ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <item.icon className="h-5 w-5" />
                        )}
                        <span
                          className={cn(
                            "transition-opacity duration-300",
                            isOpen ? "block" : "hidden"
                          )}
                        >
                          {isNavigating && pathname === item.href ? "Loading..." : item.label}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </div>
          </ul>
        </nav>

        {/* User section */}
        <div className="p-2 border-t border-[#fdec40]">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-8 h-8 bg-[#61c9d7] rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                <Link href="/dashboard">
                  <Image
                    src="/logo.png"
                    alt="FB Network Logo"
                    width={32}
                    height={32}
                    className="w-full h-full"
                  />
                </Link>
              </span>
            </div>
            <div
              className={cn(
                "transition-opacity duration-300",
                isOpen ? "block" : "hidden"
              )}
            >
              <p className="text-sm font-medium">{user?.firstname ? `${user.firstname} ${user.lastname}` : "User"}</p>
              <p className="text-xs text-white">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center justify-center lg:justify-start px-2 lg:px-3 py-2 rounded-lg text-left transition-colors mt-2 text-white hover:bg-red-600",
              isOpen ? "hidden" : "hidden"
            )}
          ></button>
        </div>
      </div>
    </>
  );
}
