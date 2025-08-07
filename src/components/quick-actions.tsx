"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, FileText, Mail, Calendar, Settings, TrendingUp, ShoppingCart } from "lucide-react";

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  color: string;
  count?: number;
  trend?: number;
  href?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function QuickActions() {
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuickActions = async () => {
      try {
        setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(`${API_BASE_URL}/api/dashboard/quick-actions`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setQuickActions(data);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch quick actions";
        setError(errorMessage);
        console.warn("Quick actions fetch error:", err);
        
        // Fallback to default actions if API fails
        setQuickActions([
          { id: "1", icon: "Plus", label: "New Order", color: "bg-blue-500 hover:bg-blue-600" },
          { id: "2", icon: "Users", label: "Add Customer", color: "bg-green-500 hover:bg-green-600" },
          { id: "3", icon: "FileText", label: "Generate Report", color: "bg-purple-500 hover:bg-purple-600" },
          { id: "4", icon: "Mail", label: "Send Campaign", color: "bg-orange-500 hover:bg-orange-600" },
          { id: "5", icon: "Calendar", label: "Schedule Meeting", color: "bg-pink-500 hover:bg-pink-600" },
          { id: "6", icon: "Settings", label: "System Settings", color: "bg-gray-500 hover:bg-gray-600" },
        ]);
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
      case "FileText":
        return FileText;
      case "Mail":
        return Mail;
      case "Calendar":
        return Calendar;
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
    if (action.href) {
      window.location.href = action.href;
    } else {
      // Handle different action types
      switch (action.label) {
        case "New Order":
          window.location.href = "/orders";
          break;
        case "Add Customer":
          window.location.href = "/customers";
          break;
        case "Generate Report":
          window.location.href = "/reports";
          break;
        case "Send Campaign":
          window.location.href = "/campaigns";
          break;
        case "Schedule Meeting":
          window.location.href = "/calendar";
          break;
        case "System Settings":
          window.location.href = "/settings";
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
              <div key={i} className="h-14 sm:h-20 bg-gray-200 rounded animate-pulse"></div>
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
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Quick Actions</h3>
          {error && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Using default actions (API unavailable)
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
          {quickActions.map((action) => {
            const IconComponent = getIconComponent(action.icon);
            
            return (
              <Button
                key={action.id}
                variant="outline"
                className={`h-14 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border-2 hover:border-transparent transition-all ${action.color} hover:text-white`}
                onClick={() => handleActionClick(action)}
              >
                <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-[11px] sm:text-xs font-medium">{action.label}</span>
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
