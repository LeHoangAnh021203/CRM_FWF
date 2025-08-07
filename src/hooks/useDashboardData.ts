import { useState, useEffect } from "react";
import { today, getLocalTimeZone } from "@internationalized/date";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  productsChange: number;
}

interface RevenueData {
  date: string;
  revenue: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  amount?: number;
  timestamp: string;
  status: string;
}

interface CustomerInsight {
  name: string;
  value: number;
  change: number;
  type: string;
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [customerInsights, setCustomerInsights] = useState<CustomerInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const [apiSuccesses, setApiSuccesses] = useState<string[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        setApiErrors([]);
        setApiSuccesses([]);
        
        // Get current date range (last 30 days)
        const endDate = today(getLocalTimeZone());
        const startDate = endDate.subtract({ days: 30 });
        
        const fromDate = startDate.toString();
        const toDate = endDate.toString();

        const apiCalls = [
          {
            name: "Stats",
            url: `${API_BASE_URL}/api/dashboard/stats`,
            handler: (data: DashboardStats) => setStats(data)
          },
          {
            name: "Revenue",
            url: `${API_BASE_URL}/api/dashboard/revenue`,
            handler: (data: RevenueData[]) => setRevenueData(data)
          },
          {
            name: "Activity",
            url: `${API_BASE_URL}/api/dashboard/activity`,
            handler: (data: RecentActivity[]) => setRecentActivity(data)
          },
          {
            name: "Insights",
            url: `${API_BASE_URL}/api/dashboard/insights`,
            handler: (data: CustomerInsight[]) => setCustomerInsights(data)
          }
        ];

        // Execute all API calls in parallel
        const results = await Promise.allSettled(
          apiCalls.map(async (apiCall) => {
            try {
              const response = await fetch(apiCall.url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fromDate, toDate }),
              });

              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }

              const data = await response.json();
              apiCall.handler(data);
              
              // Report success
              setApiSuccesses(prev => [...prev, `${apiCall.name} data loaded successfully`]);
              
              return { name: apiCall.name, success: true, data };
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : `Failed to fetch ${apiCall.name} data`;
              setApiErrors(prev => [...prev, errorMessage]);
              throw err;
            }
          })
        );

        // Check if any API calls failed
        const failedCalls = results.filter(result => result.status === 'rejected');
        if (failedCalls.length > 0) {
          const errorMessages = failedCalls.map(result => 
            result.status === 'rejected' ? result.reason.message : 'Unknown error'
          );
          setError(`Some data failed to load: ${errorMessages.join(', ')}`);
        }

        // If all calls succeeded, clear any previous errors
        if (failedCalls.length === 0) {
          setError(null);
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch dashboard data";
        setError(errorMessage);
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    stats,
    revenueData,
    recentActivity,
    customerInsights,
    loading,
    error,
    apiErrors,
    apiSuccesses,
  };
}
