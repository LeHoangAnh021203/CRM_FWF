"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, User, Settings, LogOut, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SmartNotifications } from "@/components/smart-notifications";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export function Header() {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-3 py-2 sm:px-6 sm:py-4">
      <div className="flex sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
          <div className="relative block sm:hidden w-full">
            <button
              className="p-2"
              onClick={() => setShowMobileSearch((v) => !v)}
              aria-label="Open search"
            >
              <Search className="h-5 w-5 text-gray-400" />
            </button>
            <div
              className={`absolute right-0 top-0 w-full z-20 transition-all duration-300 transform bg-white ${
                showMobileSearch
                  ? "translate-x-0 opacity-100"
                  : "translate-x-full opacity-0 pointer-events-none"
              }`}
            >
              <Input
                autoFocus={showMobileSearch}
                placeholder="Search..."
                className="pl-10 w-[130%] text-sm border border-orange-300 shadow"
                onBlur={() => setShowMobileSearch(false)}
              />
              
              <button
                type="button"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
                tabIndex={-1}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setShowMobileSearch(false);
                }}
                aria-label="Close search"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* Desktop: luôn hiện input */}
          <div className="relative w-full sm:w-auto hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search..."
              className="pl-10 w-full sm:w-64 text-sm border-orange-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 justify-end w-full sm:w-auto">
          <SmartNotifications />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 p-1 sm:p-2"
              >
                <div className="w-8 h-8 bg-[#61c9d7] rounded-full flex items-center justify-center">
                  <Image src="/logo.png" alt="FB Network Logo" width={32} height={32} className="w-full h-full" />
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  {user?.firstname ? `${user.firstname} ${user.lastname}` : "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 sm:w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.firstname ? `${user.firstname} ${user.lastname}` : "User"}</p>
                  <p className="text-xs text-gray-500">{user?.email || "user@example.com"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
