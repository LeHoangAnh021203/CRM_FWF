import { useState, useEffect, useRef } from "react";
import { today, getLocalTimeZone } from "@internationalized/date";

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? "http://localhost:3000" 
  : "https://fb-network-demo.vercel.app";

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

interface ApiResponse {
  totalOrders?: number;
  deltaTotalOrders?: number;
  totalRevenue?: number;
  revenueGrowth?: number;
  totalCustomers?: number;
  deltaTotalCustomers?: number;
  totalServices?: number;
  deltaTotalServices?: number;
  currentRange?: Array<{
    date?: string;
    totalRevenue?: number;
    actualRevenue?: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [recentActivity] = useState<RecentActivity[]>([]);
  const [customerInsights] = useState<CustomerInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const [apiSuccesses, setApiSuccesses] = useState<string[]>([]);
  const hasCreatedFallback = useRef(false);

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
            name: "Orders Summary",
            url: `${API_BASE_URL}/api/sales/overall-order-summary`,
            handler: (data: ApiResponse) => {
              // Process orders data
              const ordersStats = {
                totalOrders: data.totalOrders || 0,
                ordersChange: data.deltaTotalOrders || 0,
              };
              setStats(prev => ({ 
                totalRevenue: prev?.totalRevenue || 0,
                totalOrders: ordersStats.totalOrders,
                totalCustomers: prev?.totalCustomers || 0,
                totalProducts: prev?.totalProducts || 0,
                revenueChange: prev?.revenueChange || 0,
                ordersChange: ordersStats.ordersChange,
                customersChange: prev?.customersChange || 0,
                productsChange: prev?.productsChange || 0,
              }));
            }
          },
          {
            name: "Revenue Summary",
            url: `${API_BASE_URL}/api/sales/revenue-summary`,
            handler: (data: ApiResponse) => {
              // Process revenue data
              const revenueStats = {
                totalRevenue: data.totalRevenue || 0,
                revenueChange: data.revenueGrowth || 0,
              };
              setStats(prev => ({ 
                totalRevenue: revenueStats.totalRevenue,
                totalOrders: prev?.totalOrders || 0,
                totalCustomers: prev?.totalCustomers || 0,
                totalProducts: prev?.totalProducts || 0,
                revenueChange: revenueStats.revenueChange,
                ordersChange: prev?.ordersChange || 0,
                customersChange: prev?.customersChange || 0,
                productsChange: prev?.productsChange || 0,
              }));
            }
          },
          {
            name: "Customer Summary",
            url: `${API_BASE_URL}/api/customer-sale/customer-summary`,
            handler: (data: ApiResponse) => {
              // Process customer data
              const customerStats = {
                totalCustomers: data.totalCustomers || 0,
                customersChange: data.deltaTotalCustomers || 0,
              };
              setStats(prev => ({ 
                totalRevenue: prev?.totalRevenue || 0,
                totalOrders: prev?.totalOrders || 0,
                totalCustomers: customerStats.totalCustomers,
                totalProducts: prev?.totalProducts || 0,
                revenueChange: prev?.revenueChange || 0,
                ordersChange: prev?.ordersChange || 0,
                customersChange: customerStats.customersChange,
                productsChange: prev?.productsChange || 0,
              }));
            }
          },
          {
            name: "Service Summary",
            url: `${API_BASE_URL}/api/service-record/service-summary`,
            handler: (data: ApiResponse) => {
              // Process service data
              const serviceStats = {
                totalProducts: data.totalServices || 0,
                productsChange: data.deltaTotalServices || 0,
              };
              setStats(prev => ({ 
                totalRevenue: prev?.totalRevenue || 0,
                totalOrders: prev?.totalOrders || 0,
                totalCustomers: prev?.totalCustomers || 0,
                totalProducts: serviceStats.totalProducts,
                revenueChange: prev?.revenueChange || 0,
                ordersChange: prev?.ordersChange || 0,
                customersChange: prev?.customersChange || 0,
                productsChange: serviceStats.productsChange,
              }));
            }
          },
          {
            name: "Daily Region Revenue",
            url: `${API_BASE_URL}/api/sales/daily-region-revenue`,
            handler: (data: ApiResponse) => {
              console.log('Daily Region Revenue API response:', data);
              // Process daily region revenue data for chart
              if (data && data.currentRange && Array.isArray(data.currentRange)) {
                const chartData = data.currentRange.map((item) => ({
                  date: item.date || new Date().toISOString().split('T')[0],
                  revenue: item.totalRevenue || 0,
                }));
                console.log('Chart data from daily region revenue:', chartData);
                setRevenueData(chartData);
              } else {
                console.log('No valid data from daily region revenue API');
              }
            }
          },
          {
            name: "Region Revenue",
            url: `${API_BASE_URL}/api/sales/region-revenue`,
            handler: (data: ApiResponse) => {
              console.log('Region Revenue API response:', data);
              // Process region revenue data for chart (fallback)
              if (data && data.currentRange && Array.isArray(data.currentRange)) {
                const chartData = data.currentRange.map((item) => ({
                  date: item.date || new Date().toISOString().split('T')[0],
                  revenue: item.totalRevenue || 0,
                }));
                console.log('Chart data from region revenue:', chartData);
                setRevenueData(chartData);
              } else {
                console.log('No valid data from region revenue API');
              }
            }
          },
          {
            name: "Shop Type Revenue",
            url: `${API_BASE_URL}/api/sales/shop-type-revenue`,
            handler: (data: ApiResponse) => {
              console.log('Shop Type Revenue API response:', data);
              // Process shop type revenue data for chart (another fallback)
              if (data && data.currentRange && Array.isArray(data.currentRange)) {
                const chartData = data.currentRange.map((item) => ({
                  date: item.date || new Date().toISOString().split('T')[0],
                  revenue: item.actualRevenue || item.totalRevenue || 0,
                }));
                console.log('Chart data from shop type revenue:', chartData);
                setRevenueData(chartData);
              } else {
                console.log('No valid data from shop type revenue API');
              }
            }
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

        // Fallback: If no revenue data is loaded, create sample data
        if (revenueData.length === 0 && !hasCreatedFallback.current) {
          console.log('Creating fallback revenue data');
          const fallbackData: RevenueData[] = [];
          const today = new Date();
          for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            fallbackData.push({
              date: date.toISOString().split('T')[0],
              revenue: Math.floor(Math.random() * 50000000) + 10000000, // 10M - 60M VND
            });
          }
          console.log('Fallback revenue data:', fallbackData);
          setRevenueData(fallbackData);
          hasCreatedFallback.current = true;
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
