"use client";

import React, { useState } from "react";
import { Search, Bell, User, Settings, LogOut, HelpCircle } from "lucide-react";
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

export function Header() {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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
              {/* Icon search là button để đóng input khi bấm lại */}
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
              className="pl-10 w-full sm:w-64 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 justify-end w-full sm:w-auto">
          <Button variant="ghost" size="icon" className="relative p-2 sm:p-0">
            <Bell className="h-5 w-5 sm:h-5 sm:w-5 text-[#d04d65]" />
            <span className="absolute -top-1 -right-1 bg-[#d04d65] text-white text-[10px] sm:text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 p-1 sm:p-2"
              >
                <div className="w-8 h-8 bg-[#61c9d7] rounded-full flex items-center justify-center">
                  <img src="/logo.png" className="w-full h-full" />
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  FB Network
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 sm:w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
              <DropdownMenuItem>
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
