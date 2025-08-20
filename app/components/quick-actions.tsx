"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import {
  Plus,
  Users,
  Settings,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Radical,
  Sparkles,
} from "lucide-react";

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  color: string;
  count?: number;
  trend?: number;
  href?: string;
}

const API_BASE_URL =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://fb-network-demo.vercel.app";

export function QuickActions() {
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchQuickActions = async () => {
      try {
        setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(
          `${API_BASE_URL}/api/dashboard/quick-actions`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setQuickActions(data);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch quick actions";
        setError(errorMessage);
        console.warn("Quick actions fetch error:", err);

        // No fallback data - let error state handle it
      } finally {
        setLoading(false);
      }
    };

    fetchQuickActions();
  }, []);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Plus":
        return Plus;
      case "Users":
        return Users;
      case "BarChart3":
        return BarChart3;
      case "Radical":
        return Radical;
      case "Sparkles":
        return Sparkles;
      case "Settings":
        return Settings;
      case "TrendingUp":
        return TrendingUp;
      case "ShoppingCart":
        return ShoppingCart;
      default:
        return Plus;
    }
  };

  const handleActionClick = (action: QuickAction) => {
    if (isNavigating) return; // Prevent multiple clicks
    
    if (action.href) {
      console.log(`[QuickActions] Navigating to: ${action.href}`);
      setIsNavigating(true);
      router.push(action.href, { scroll: false });
      
      // Fallback to window.location if router doesn't work
      setTimeout(() => {
        if (action.href && window.location.pathname !== action.href) {
          console.log(`[QuickActions] Router failed, using window.location`);
          window.location.href = action.href;
        }
        setIsNavigating(false);
      }, 2000);
    } else {
      // Handle different action types
      switch (action.label) {
        case " Order Report":
          console.log(`[QuickActions] Navigating to: /dashboard/orders`);
          router.push("/dashboard/orders", { scroll: false });
          break;
        case " Customer Report":
          console.log(`[QuickActions] Navigating to: /dashboard/customers`);
          router.push("/dashboard/customers", { scroll: false });
          break;
        case "Services Report":
          console.log(`[QuickActions] Navigating to: /dashboard/services`);
          router.push("/dashboard/services", { scroll: false });
          break;
        case "Accounting Report":
          console.log(`[QuickActions] Navigating to: /dashboard/accounting`);
          router.push("/dashboard/accounting", { scroll: false });
          break;
        case "Generate AI":
          console.log(`[QuickActions] Navigating to: /dashboard/generateAI`);
          router.push("/dashboard/generateAI", { scroll: false });
          break;
        case "System Settings":
          console.log(`[QuickActions] Navigating to: /dashboard/settings`);
          router.push("/dashboard/settings", { scroll: false });
          break;
        default:
          console.log(`Action clicked: ${action.label}`);
      }
    }
  };

  if (loading) {
    return (
      <Card className="bg-white mb-6">
        <CardContent className="p-3 sm:p-6">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-32"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-14 sm:h-20 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white mb-6">
      <CardContent className="p-3 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Quick Actions
          </h3>
          {error && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"></span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
          {quickActions.map((action) => {
            const IconComponent = getIconComponent(action.icon);

            return (
              <Button
                key={action.id}
                variant="outline"
                disabled={isNavigating}
                className={`h-14 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border-2 hover:border-transparent transition-all ${action.color} hover:text-white ${isNavigating ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleActionClick(action)}
              >
                <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-[11px] sm:text-xs font-medium">
                  {action.label}
                </span>
                {action.count && (
                  <span className="text-[10px] sm:text-xs bg-white/20 rounded px-1">
                    {action.count}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
