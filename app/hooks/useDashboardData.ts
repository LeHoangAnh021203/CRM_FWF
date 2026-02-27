export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  productsChange: number;
}

export interface RevenueData {
  id: string;
  date: string;
  revenue: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  amount?: number;
  timestamp: string;
  status: string;
}

export interface CustomerInsight {
  name: string;
  value: number;
  change: number;
  type: string;
}

const EMPTY_STATS: DashboardStats = {
  totalRevenue: 0,
  totalOrders: 0,
  totalCustomers: 0,
  totalProducts: 0,
  revenueChange: 0,
  ordersChange: 0,
  customersChange: 0,
  productsChange: 0,
};

/**
 * Legacy hook used by some demo components. All of the live data fetching now
 * happens through the aggregated dashboard summary endpoint, so this hook
 * simply returns stable defaults to avoid issuing duplicate or unsupported
 * network requests.
 */
export function useDashboardData() {
  return {
    stats: EMPTY_STATS,
    revenueData: [] as RevenueData[],
    recentActivity: [] as RecentActivity[],
    customerInsights: [] as CustomerInsight[],
    loading: false,
    error: null as string | null,
    apiErrors: [] as string[],
    apiSuccesses: [] as string[],
  };
}
