"use client";

import React from "react";
import { useState } from "react";
import { Suspense, useEffect, useRef } from "react";
import { Notification, useNotification } from "@/app/components/notification";
import { SEARCH_TARGETS, normalize } from "@/app/lib/search-targets";
import { usePageStatus } from "@/app/hooks/usePageStatus";
import { useDashboardData } from "@/app/hooks/useDashboardData";
import { useDateRange } from "@/app/contexts/DateContext";
import { ApiService } from "@/app/lib/api-service";

import { QuickActions } from "@/app/components/quick-actions";
import { DollarSign } from "lucide-react";

interface PaymentMethod {
  method: string;
  amount: number;
  percentage: number;
  transactions: number;
}
import TotalSaleTable from "./TotalSaleTable";
import SaleDetail from "./SaleDetail";
// import RevenueChart from "./RevenueChart";
// import PercentChart from "./PercentChart";
import KPIChart from "./KPIChart";
import CustomerSection from "./CustomerSection";
import BookingSection from "./BookingSection";
import ServiceSection from "./ServiceSection";
import FoxieBalanceTable from "./FoxieBalanceTable";
import SalesByHourTable from "./SalesByHourTable";

// Real data only: no mock datasets for dashboard

/* const revenueRankingData = [
  {
    rank: 1,
    name: "Chi nhánh Quận 1",
    revenue: 45000000,
    growth: 15,
    type: "top",
  },
  {
    rank: 2,
    name: "Chi nhánh Quận 3",
    revenue: 38000000,
    growth: 12,
    type: "top",
  },
  {
    rank: 3,
    name: "Chi nhánh Quận 7",
    revenue: 32000000,
    growth: 8,
    type: "top",
  },
  {
    rank: 4,
    name: "Chi nhánh Thủ Đức",
    revenue: 28000000,
    growth: 6,
    type: "top",
  },
  {
    rank: 5,
    name: "Chi nhánh Quận 2",
    revenue: 25000000,
    growth: 4,
    type: "top",
  },
  {
    rank: 6,
    name: "Chi nhánh Quận 5",
    revenue: 22000000,
    growth: 2,
    type: "top",
  },
  {
    rank: 7,
    name: "Chi nhánh Quận 8",
    revenue: 18000000,
    growth: -1,
    type: "top",
  },
  {
    rank: 8,
    name: "Chi nhánh Quận 9",
    revenue: 15000000,
    growth: -3,
    type: "top",
  },
  {
    rank: 9,
    name: "Chi nhánh Quận 6",
    revenue: 12000000,
    growth: -5,
    type: "top",
  },
  {
    rank: 10,
    name: "Chi nhánh Quận 4",
    revenue: 8000000,
    growth: -8,
    type: "top",
  },
  {
    rank: 11,
    name: "Chi nhánh Bình Thạnh",
    revenue: 6000000,
    growth: -12,
    type: "bottom",
  },
  {
    rank: 12,
    name: "Chi nhánh Tân Bình",
    revenue: 4500000,
    growth: -15,
    type: "bottom",
  },
  {
    rank: 13,
    name: "Chi nhánh Gò Vấp",
    revenue: 3200000,
    growth: -18,
    type: "bottom",
  },
  {
    rank: 14,
    name: "Chi nhánh Phú Nhuận",
    revenue: 2800000,
    growth: -22,
    type: "bottom",
  },
  {
    rank: 15,
    name: "Chi nhánh Tân Phú",
    revenue: 2200000,
    growth: -25,
    type: "bottom",
  },
  {
    rank: 16,
    name: "Chi nhánh Bình Tân",
    revenue: 1800000,
    growth: -28,
    type: "bottom",
  },
  {
    rank: 17,
    name: "Chi nhánh Quận 11",
    revenue: 1500000,
    growth: -32,
    type: "bottom",
  },
  {
    rank: 18,
    name: "Chi nhánh Quận 12",
    revenue: 1200000,
    growth: -35,
    type: "bottom",
  },
  {
    rank: 19,
    name: "Chi nhánh Hóc Môn",
    revenue: 800000,
    growth: -40,
    type: "bottom",
  },
  {
    rank: 20,
    name: "Chi nhánh Củ Chi",
    revenue: 500000,
    growth: -45,
    type: "bottom",
  },
]; */

/* const foxieRankingData = [
  {
    rank: 1,
    name: "Chi nhánh Quận 1",
    revenue: 45000000,
    growth: 15,
    type: "top",
  },
  {
    rank: 2,
    name: "Chi nhánh Quận 3",
    revenue: 38000000,
    growth: 12,
    type: "top",
  },
  {
    rank: 3,
    name: "Chi nhánh Quận 7",
    revenue: 32000000,
    growth: 8,
    type: "top",
  },
  {
    rank: 4,
    name: "Chi nhánh Thủ Đức",
    revenue: 28000000,
    growth: 6,
    type: "top",
  },
  {
    rank: 5,
    name: "Chi nhánh Quận 2",
    revenue: 25000000,
    growth: 4,
    type: "top",
  },
  {
    rank: 6,
    name: "Chi nhánh Quận 5",
    revenue: 22000000,
    growth: 2,
    type: "top",
  },
  {
    rank: 7,
    name: "Chi nhánh Quận 8",
    revenue: 18000000,
    growth: -1,
    type: "top",
  },
  {
    rank: 8,
    name: "Chi nhánh Quận 9",
    revenue: 15000000,
    growth: -3,
    type: "top",
  },
  {
    rank: 9,
    name: "Chi nhánh Quận 6",
    revenue: 12000000,
    growth: -5,
    type: "top",
  },
  {
    rank: 10,
    name: "Chi nhánh Quận 4",
    revenue: 8000000,
    growth: -8,
    type: "top",
  },
  {
    rank: 11,
    name: "Chi nhánh Bình Thạnh",
    revenue: 6000000,
    growth: -12,
    type: "bottom",
  },
  {
    rank: 12,
    name: "Chi nhánh Tân Bình",
    revenue: 4500000,
    growth: -15,
    type: "bottom",
  },
  {
    rank: 13,
    name: "Chi nhánh Gò Vấp",
    revenue: 3200000,
    growth: -18,
    type: "bottom",
  },
  {
    rank: 14,
    name: "Chi nhánh Phú Nhuận",
    revenue: 2800000,
    growth: -22,
    type: "bottom",
  },
  {
    rank: 15,
    name: "Chi nhánh Tân Phú",
    revenue: 2200000,
    growth: -25,
    type: "bottom",
  },
  {
    rank: 16,
    name: "Chi nhánh Bình Tân",
    revenue: 1800000,
    growth: -28,
    type: "bottom",
  },
  {
    rank: 17,
    name: "Chi nhánh Quận 11",
    revenue: 1500000,
    growth: -32,
    type: "bottom",
  },
  {
    rank: 18,
    name: "Chi nhánh Quận 12",
    revenue: 1200000,
    growth: -35,
    type: "bottom",
  },
  {
    rank: 19,
    name: "Chi nhánh Hóc Môn",
    revenue: 800000,
    growth: -40,
    type: "bottom",
  },
  {
    rank: 20,
    name: "Chi nhánh Củ Chi",
    revenue: 500000,
    growth: -45,
    type: "bottom",
  },
]; */

// No mock fallback; render skeleton until real data is available

/* const productDataByDistrict = [
  { name: "Q1", value: 28, color: "#ff6b6b" },
  { name: "Q3", value: 22, color: "#4ecdc4" },
  { name: "Q7", value: 18, color: "#45b7d1" },
  { name: "Thủ Đức", value: 15, color: "#96ceb4" },
  { name: "Q2", value: 12, color: "#feca57" },
  { name: "Khác", value: 5, color: "#ff9ff3" },
]; */

/* const foxieCardDataByDistrict = [
  { name: "Q1", value: 32, color: "#6c5ce7" },
  { name: "Q3", value: 25, color: "#a29bfe" },
  { name: "Q7", value: 20, color: "#fd79a8" },
  { name: "Thủ Đức", value: 13, color: "#fdcb6e" },
  { name: "Q2", value: 8, color: "#e17055" },
  { name: "Khác", value: 2, color: "#74b9ff" },
]; */

/* const serviceDataByDistrict = [
  { name: "Q1", value: 30, color: "#00b894" },
  { name: "Q3", value: 24, color: "#00cec9" },
  { name: "Q7", value: 19, color: "#55a3ff" },
  { name: "Thủ Đức", value: 16, color: "#fd79a8" },
  { name: "Q2", value: 9, color: "#fdcb6e" },
  { name: "Khác", value: 2, color: "#e84393" },
]; */

// Daily KPI Growth Data (last 7 days) - will be created inside component

export default function Dashboard() {
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();
  const hasShownSuccess = useRef(false);
  const hasShownError = useRef(false);
  const {
    reportPageError,
    reportDataLoadSuccess,
    reportPagePerformance,
    reportDataLoadError,
  } = usePageStatus("dashboard");

  const { loading, error, apiErrors, apiSuccesses, stats } = useDashboardData();

  // Use the same date range format as orders page
  const { fromDate, toDate } = useDateRange();
  const searchParamQuery = (() => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    return url.searchParams.get('q') || '';
  })();

  // Fetch sales summary data using direct API call (like the original)
  const [salesSummaryData, setSalesSummaryData] = useState<{
    totalRevenue: string;
    cash: string;
    transfer: string;
    card: string;
    actualRevenue: string;
    foxieUsageRevenue: string;
    walletUsageRevenue: string;
    toPay: string;
    debt: string;
  } | null>(null);
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesError, setSalesError] = useState<string | null>(null);

  // Use ApiService with authentication like other pages
  React.useEffect(() => {
    const fetchSalesSummary = async () => {
      if (!fromDate || !toDate) return;

      try {
        setSalesLoading(true);
        setSalesError(null);

        // Format dates for API (DD/MM/YYYY format like the API expects)
        const formatDateForAPI = (dateString: string) => {
          const date = new Date(dateString);
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };

        const startDate = formatDateForAPI(fromDate);
        const endDate = formatDateForAPI(toDate);

        console.log("🔄 Fetching sales summary via ApiService with dates:", {
          startDate,
          endDate,
        });

        // Use ApiService with authentication and proxy
        const data = (await ApiService.get(
          `real-time/sales-summary?dateStart=${startDate}&dateEnd=${endDate}`
        )) as {
          totalRevenue: string;
          cash: string;
          transfer: string;
          card: string;
          actualRevenue: string;
          foxieUsageRevenue: string;
          walletUsageRevenue: string;
          toPay: string;
          debt: string;
        };

        console.log("✅ Sales summary data received:", data);
        console.log("🔍 Debug - Data structure check:", {
          hasTotalRevenue: !!data.totalRevenue,
          hasCash: !!data.cash,
          hasTransfer: !!data.transfer,
          hasCard: !!data.card,
          hasFoxieUsageRevenue: !!data.foxieUsageRevenue,
          hasWalletUsageRevenue: !!data.walletUsageRevenue,
        });

        setSalesSummaryData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch sales summary";
        setSalesError(errorMessage);
        console.error("❌ Sales summary fetch error:", err);
      } finally {
        setSalesLoading(false);
      }
    };

    fetchSalesSummary();
  }, [fromDate, toDate]);

  const [showTopRanking, setShowTopRanking] = useState(true);
  const [showTopFoxieRanking, setShowTopFoxieRanking] = useState(true);
  const [kpiViewMode, setKpiViewMode] = useState<"monthly" | "daily">(
    "monthly"
  );

  // KPI Monthly revenue API state (for Target KPI only - cumulative from start of month)
  const [kpiMonthlyRevenueData, setKpiMonthlyRevenueData] = useState<{
    totalRevenue: string;
    cash: string;
    transfer: string;
    card: string;
    actualRevenue: string;
    foxieUsageRevenue: string;
    walletUsageRevenue: string;
    toPay: string;
    debt: string;
  } | null>(null);
  const [kpiMonthlyRevenueLoading, setKpiMonthlyRevenueLoading] =
    useState(true);
  const [kpiMonthlyRevenueError, setKpiMonthlyRevenueError] = useState<
    string | null
  >(null);

  // Service summary API state
  const [serviceSummaryData, setServiceSummaryData] = useState<{
    totalServices: string;
    totalServicesServing: string;
    totalServiceDone: string;
    items: Array<{
      serviceName: string;
      serviceUsageAmount: string;
      serviceUsagePercentage: string;
    }>;
  } | null>(null);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [serviceError, setServiceError] = useState<string | null>(null);

  // Auth expiration modal state
  const [authExpired, setAuthExpired] = useState(false);

  // New customers API state (for current date range)
  const [newCustomerData, setNewCustomerData] = useState<Array<{
    count: number;
    type: string;
  }> | null>(null);
  const [newCustomerLoading, setNewCustomerLoading] = useState(true);
  const [newCustomerError, setNewCustomerError] = useState<string | null>(null);

  // Old customers API state (for current date range)
  const [oldCustomerData, setOldCustomerData] = useState<Array<{
    count: number;
    type: string;
  }> | null>(null);
  const [oldCustomerLoading, setOldCustomerLoading] = useState(true);
  const [oldCustomerError, setOldCustomerError] = useState<string | null>(null);

  // Foxie balance API state
  const [foxieBalanceData, setFoxieBalanceData] = useState<{
    the_tien_kha_dung: number;
  } | null>(null);
  const [foxieBalanceLoading, setFoxieBalanceLoading] = useState(true);
  const [foxieBalanceError, setFoxieBalanceError] = useState<string | null>(
    null
  );

  // Sales by hour API state
  const [salesByHourData, setSalesByHourData] = useState<Array<{
    date: string;
    totalSales: number;
    timeRange: string;
  }> | null>(null);
  const [salesByHourLoading, setSalesByHourLoading] = useState(true);
  const [salesByHourError, setSalesByHourError] = useState<string | null>(null);

  // Sales detail API state
  const [salesDetailData, setSalesDetailData] = useState<Array<{
    productName: string;
    productPrice: string;
    productQuantity: string;
    productDiscount: string;
    productCode: string;
    productUnit: string;
    formatTable: string;
    cash: string;
    transfer: string;
    card: string;
    wallet: string;
    foxie: string;
  }> | null>(null);
  const [salesDetailLoading, setSalesDetailLoading] = useState(true);
  const [salesDetailError, setSalesDetailError] = useState<string | null>(null);

  // Booking API state
  const [bookingData, setBookingData] = useState<{
    notConfirmed: string;
    confirmed: string;
    denied: string;
    customerCome: string;
    customerNotCome: string;
    cancel: string;
    autoConfirmed: string;
  } | null>(null);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Daily revenue API state (for current day only)
  const [dailyRevenueData, setDailyRevenueData] = useState<{
    totalRevenue: string;
    cash: string;
    transfer: string;
    card: string;
    actualRevenue: string;
    foxieUsageRevenue: string;
    walletUsageRevenue: string;
    toPay: string;
    debt: string;
  } | null>(null);
  const [dailyRevenueLoading, setDailyRevenueLoading] = useState(true);
  const [dailyRevenueError, setDailyRevenueError] = useState<string | null>(
    null
  );

  // KPI daily series (real per-day data from start of month to today)
  const [kpiDailySeries, setKpiDailySeries] = useState<Array<{
    dateLabel: string; // DD/MM
    isoDate: string; // yyyy-MM-dd
    total: number; // cash+transfer+card
  }> | null>(null);
  const [kpiDailySeriesLoading, setKpiDailySeriesLoading] = useState(true);
  const [kpiDailySeriesError, setKpiDailySeriesError] = useState<string | null>(
    null
  );

  // Fetch service summary (real-time) using ApiService via proxy
  React.useEffect(() => {
    const fetchServiceSummary = async () => {
      if (!fromDate || !toDate) return;

      try {
        setServiceLoading(true);
        setServiceError(null);

        const formatDateForAPI = (isoDateString: string) => {
          // isoDateString like yyyy-MM-ddTHH:mm:ss from DateContext
          const [datePart] = isoDateString.split("T");
          const [year, month, day] = datePart.split("-");
          return `${day}/${month}/${year}`;
        };

        const startDate = formatDateForAPI(fromDate);
        const endDate = formatDateForAPI(toDate);

        const data = (await ApiService.get(
          `real-time/service-summary?dateStart=${startDate}&dateEnd=${endDate}`
        )) as {
          totalServices: string;
          totalServicesServing: string;
          totalServiceDone: string;
          items: Array<{
            serviceName: string;
            serviceUsageAmount: string;
            serviceUsagePercentage: string;
          }>;
        };

        setServiceSummaryData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch service summary";
        setServiceError(errorMessage);
        console.error("❌ Service summary fetch error:", err);
      } finally {
        setServiceLoading(false);
      }
    };

    fetchServiceSummary();
  }, [fromDate, toDate]);

  // Fetch new customers by source (real-time) using ApiService via proxy
  React.useEffect(() => {
    const fetchNewCustomers = async () => {
      if (!fromDate || !toDate) return;

      try {
        setNewCustomerLoading(true);
        setNewCustomerError(null);

        const formatDateForAPI = (dateString: string) => {
          const date = new Date(dateString);
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };

        const startDate = formatDateForAPI(fromDate);
        const endDate = formatDateForAPI(toDate);

        const data = (await ApiService.get(
          `real-time/get-new-customer?dateStart=${startDate}&dateEnd=${endDate}`
        )) as Array<{
          count: number;
          type: string;
        }>;

        setNewCustomerData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch new customers";
        setNewCustomerError(errorMessage);
        console.error("❌ New customers fetch error:", err);
      } finally {
        setNewCustomerLoading(false);
      }
    };

    fetchNewCustomers();
  }, [fromDate, toDate]);

  // Fetch old customers by source (real-time) using ApiService via proxy
  React.useEffect(() => {
    const fetchOldCustomers = async () => {
      if (!fromDate || !toDate) return;

      try {
        setOldCustomerLoading(true);
        setOldCustomerError(null);

        const formatDateForAPI = (dateString: string) => {
          const date = new Date(dateString);
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };

        const startDate = formatDateForAPI(fromDate);
        const endDate = formatDateForAPI(toDate);

        const data = (await ApiService.get(
          `real-time/get-old-customer?dateStart=${startDate}&dateEnd=${endDate}`
        )) as Array<{
          count: number;
          type: string;
        }>;

        setOldCustomerData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch old customers";
        setOldCustomerError(errorMessage);
        console.error("❌ Old customers fetch error:", err);
      } finally {
        setOldCustomerLoading(false);
      }
    };

    fetchOldCustomers();
  }, [fromDate, toDate]);

  // Fetch Foxie balance using ApiService via proxy
  React.useEffect(() => {
    const fetchFoxieBalance = async () => {
      try {
        setFoxieBalanceLoading(true);
        setFoxieBalanceError(null);

        console.log("🔄 Fetching Foxie balance via direct API call");

        // Use direct API call instead of proxy for this specific endpoint
        const response = await fetch(
          "https://app.facewashfox.com/api/ws/fwf@the_tien_kha_dung",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${
                typeof window !== "undefined"
                  ? localStorage.getItem("token") || ""
                  : ""
              }`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = (await response.json()) as {
          the_tien_kha_dung: number;
        };

        console.log("✅ Foxie balance data received:", data);
        setFoxieBalanceData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch Foxie balance";
        setFoxieBalanceError(errorMessage);
        console.error("❌ Foxie balance fetch error:", err);
      } finally {
        setFoxieBalanceLoading(false);
      }
    };

    fetchFoxieBalance();
  }, []); // Empty dependency - fetch once on mount

  // Fetch sales by hour (real-time) using ApiService via proxy
  React.useEffect(() => {
    const fetchSalesByHour = async () => {
      if (!fromDate || !toDate) return;

      try {
        setSalesByHourLoading(true);
        setSalesByHourError(null);

        const formatDateForAPI = (dateString: string) => {
          const date = new Date(dateString);
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };

        const startDate = formatDateForAPI(fromDate);
        const endDate = formatDateForAPI(toDate);

        console.log("🔄 Fetching sales by hour via ApiService with dates:", {
          startDate,
          endDate,
        });

        const data = (await ApiService.get(
          `real-time/get-sales-by-hour?dateStart=${startDate}&dateEnd=${endDate}`
        )) as Array<{
          date: string;
          totalSales: number;
          timeRange: string;
        }>;

        console.log("✅ Sales by hour data received:", data);
        setSalesByHourData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch sales by hour";
        setSalesByHourError(errorMessage);
        console.error("❌ Sales by hour fetch error:", err);
      } finally {
        setSalesByHourLoading(false);
      }
    };

    fetchSalesByHour();
  }, [fromDate, toDate]);

  const newCustomerTotal = React.useMemo(() => {
    if (!newCustomerData || newCustomerData.length === 0) return 0;
    return newCustomerData.reduce(
      (sum, item) => sum + Number(item.count || 0),
      0
    );
  }, [newCustomerData]);

  const oldCustomerTotal = React.useMemo(() => {
    if (!oldCustomerData || oldCustomerData.length === 0) return 0;
    return oldCustomerData.reduce(
      (sum, item) => sum + Number(item.count || 0),
      0
    );
  }, [oldCustomerData]);

  const colorPalette = [
    "#f16a3f",
    "#0693e3",
    "#00d084",
    "#fcb900",
    "#9b51e0",
    "#41d1d9",
    "#ff6b6b",
    "#7bdcb5",
    "#ff6900",
    "#4ecdc4",
  ];

  const newCustomerPieData = React.useMemo(() => {
    if (!newCustomerData || newCustomerData.length === 0)
      return [] as Array<{ name: string; value: number; color: string }>;
    return newCustomerData.map((item, idx) => ({
      name: item.type,
      value: Number(item.count || 0),
      color: colorPalette[idx % colorPalette.length],
    }));
  }, [newCustomerData, colorPalette]);

  const oldCustomerPieData = React.useMemo(() => {
    if (!oldCustomerData || oldCustomerData.length === 0)
      return [] as Array<{ name: string; value: number; color: string }>;
    return oldCustomerData.map((item, idx) => ({
      name: item.type,
      value: Number(item.count || 0),
      color: colorPalette[idx % colorPalette.length],
    }));
  }, [oldCustomerData, colorPalette]);

  // Fetch sales detail (real-time) using ApiService via proxy
  React.useEffect(() => {
    const fetchSalesDetail = async () => {
      if (!fromDate || !toDate) return;

      try {
        setSalesDetailLoading(true);
        setSalesDetailError(null);

        const formatDateForAPI = (dateString: string) => {
          const date = new Date(dateString);
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };

        const startDate = formatDateForAPI(fromDate);
        const endDate = formatDateForAPI(toDate);

        const data = (await ApiService.get(
          `real-time/sales-detail?dateStart=${startDate}&dateEnd=${endDate}`
        )) as Array<{
          productName: string;
          productPrice: string;
          productQuantity: string;
          productDiscount: string;
          productCode: string;
          productUnit: string;
          formatTable: string;
          cash: string;
          transfer: string;
          card: string;
          wallet: string;
          foxie: string;
        }>;

        setSalesDetailData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch sales detail";
        setSalesDetailError(errorMessage);
        console.error("❌ Sales detail fetch error:", err);
      } finally {
        setSalesDetailLoading(false);
      }
    };

    fetchSalesDetail();
  }, [fromDate, toDate]);

  // Fetch booking data (real-time) using ApiService via proxy
  React.useEffect(() => {
    const fetchBookingData = async () => {
      if (!fromDate || !toDate) return;

      try {
        setBookingLoading(true);
        setBookingError(null);

        const formatDateForAPI = (dateString: string) => {
          const date = new Date(dateString);
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };

        const startDate = formatDateForAPI(fromDate);
        const endDate = formatDateForAPI(toDate);

        console.log("🔄 Fetching booking data via ApiService with dates:", {
          startDate,
          endDate,
        });

        const data = (await ApiService.get(
          `real-time/booking?dateStart=${startDate}&dateEnd=${endDate}`
        )) as {
          notConfirmed: string;
          confirmed: string;
          denied: string;
          customerCome: string;
          customerNotCome: string;
          cancel: string;
          autoConfirmed: string;
        };

        console.log("✅ Booking data received:", data);
        setBookingData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch booking data";
        setBookingError(errorMessage);
        console.error("❌ Booking data fetch error:", err);
      } finally {
        setBookingLoading(false);
      }
    };

    fetchBookingData();
  }, [fromDate, toDate]);

  // Fetch daily revenue (current day only) using ApiService via proxy
  React.useEffect(() => {
    const fetchDailyRevenue = async () => {
      try {
        setDailyRevenueLoading(true);
        setDailyRevenueError(null);

        // Get current date in DD/MM/YYYY format
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        const todayStr = `${day}/${month}/${year}`;

        console.log("🔄 Fetching daily revenue for today:", todayStr);

        const data = (await ApiService.get(
          `real-time/sales-summary?dateStart=${todayStr}&dateEnd=${todayStr}`
        )) as {
          totalRevenue: string;
          cash: string;
          transfer: string;
          card: string;
          actualRevenue: string;
          foxieUsageRevenue: string;
          walletUsageRevenue: string;
          toPay: string;
          debt: string;
        };

        console.log("✅ Daily revenue data received:", data);
        setDailyRevenueData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch daily revenue";
        setDailyRevenueError(errorMessage);
        console.error("❌ Daily revenue fetch error:", err);
      } finally {
        setDailyRevenueLoading(false);
      }
    };

    fetchDailyRevenue();
  }, []); // Empty dependency array - only fetch once on mount

  // Fetch KPI monthly revenue (for Target KPI only - cumulative from start of month)
  React.useEffect(() => {
    const fetchKpiMonthlyRevenue = async () => {
      try {
        setKpiMonthlyRevenueLoading(true);
        setKpiMonthlyRevenueError(null);

        // Get start of current month and current date
        const today = new Date();
        const firstDayOfMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );

        const formatDateForAPI = (date: Date) => {
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };

        const startDate = formatDateForAPI(firstDayOfMonth);
        const endDate = formatDateForAPI(today);

        console.log(
          "🔄 Fetching KPI monthly revenue (cumulative from start of month):",
          { startDate, endDate }
        );

        const data = (await ApiService.get(
          `real-time/sales-summary?dateStart=${startDate}&dateEnd=${endDate}`
        )) as {
          totalRevenue: string;
          cash: string;
          transfer: string;
          card: string;
          actualRevenue: string;
          foxieUsageRevenue: string;
          walletUsageRevenue: string;
          toPay: string;
          debt: string;
        };

        console.log("✅ KPI monthly revenue data received:", data);
        setKpiMonthlyRevenueData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch KPI monthly revenue";
        setKpiMonthlyRevenueError(errorMessage);
        console.error("❌ KPI monthly revenue fetch error:", err);
      } finally {
        setKpiMonthlyRevenueLoading(false);
      }
    };

    fetchKpiMonthlyRevenue();
  }, []); // Empty dependency - fetch once on mount

  // Fetch daily KPI series (TM+CK+QT per day) from start of month to today
  React.useEffect(() => {
    const fetchDailySeries = async () => {
      try {
        setKpiDailySeriesLoading(true);
        setKpiDailySeriesError(null);

        const today = new Date();
        const firstDayOfMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );

        const toDdMmYyyy = (date: Date) => {
          const dd = String(date.getDate()).padStart(2, "0");
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const yyyy = date.getFullYear();
          return `${dd}/${mm}/${yyyy}`;
        };
        const toIsoYyyyMmDd = (date: Date) => {
          const dd = String(date.getDate()).padStart(2, "0");
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const yyyy = date.getFullYear();
          return `${yyyy}-${mm}-${dd}`;
        };

        const results: Array<{
          dateLabel: string;
          isoDate: string;
          total: number;
        }> = [];
        // Loop day by day to fetch real totals
        for (
          let d = new Date(firstDayOfMonth);
          d <= today;
          d.setDate(d.getDate() + 1)
        ) {
          const ddmmyyyy = toDdMmYyyy(d);
          const data = (await ApiService.get(
            `real-time/sales-summary?dateStart=${ddmmyyyy}&dateEnd=${ddmmyyyy}`
          )) as {
            cash: string;
            transfer: string;
            card: string;
          };
          const total =
            (parseFloat(data.cash) || 0) +
            (parseFloat(data.transfer) || 0) +
            (parseFloat(data.card) || 0);
          results.push({
            dateLabel: `${String(d.getDate()).padStart(2, "0")}/${String(
              d.getMonth() + 1
            ).padStart(2, "0")}`,
            isoDate: toIsoYyyyMmDd(d),
            total,
          });
        }

        setKpiDailySeries(results);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to fetch daily KPI series";
        setKpiDailySeriesError(message);
        console.error("❌ Daily KPI series fetch error:", err);
      } finally {
        setKpiDailySeriesLoading(false);
      }
    };

    fetchDailySeries();
  }, []);

  // Process sales summary data similar to orders page
  const paymentMethods = React.useMemo(() => {
    console.log("🔍 Debug - salesSummaryData:", salesSummaryData);

    if (!salesSummaryData) {
      console.log("❌ No salesSummaryData available, returning empty array");
      return [];
    }

    const totalRevenue = parseFloat(salesSummaryData.totalRevenue);
    const cashAmount = parseFloat(salesSummaryData.cash);
    const transferAmount = parseFloat(salesSummaryData.transfer);
    const cardAmount = parseFloat(salesSummaryData.card);
    const foxieAmount = Math.abs(
      parseFloat(salesSummaryData.foxieUsageRevenue)
    ); // Make positive
    const walletAmount = Math.abs(
      parseFloat(salesSummaryData.walletUsageRevenue)
    ); // Make positive

    console.log("🔍 Debug - Parsed amounts:", {
      totalRevenue,
      cashAmount,
      transferAmount,
      cardAmount,
      foxieAmount,
      walletAmount,
    });

    const methods: PaymentMethod[] = [
      {
        method: "TM+CK+QT",
        amount: cashAmount + transferAmount + cardAmount,
        percentage:
          totalRevenue > 0
            ? Math.round(
                ((cashAmount + transferAmount + cardAmount) / totalRevenue) *
                  100
              )
            : 0,
        transactions: Math.floor(
          (cashAmount + transferAmount + cardAmount) / 100000
        ), // Estimate transactions
      },
      {
        method: "Thanh toán ví",
        amount: walletAmount,
        percentage:
          totalRevenue > 0
            ? Math.round((walletAmount / totalRevenue) * 100)
            : 0,
        transactions: Math.floor(walletAmount / 100000), // Estimate transactions
      },
      {
        method: "Thẻ Foxie",
        amount: foxieAmount,
        percentage:
          totalRevenue > 0 ? Math.round((foxieAmount / totalRevenue) * 100) : 0,
        transactions: Math.floor(foxieAmount / 100000), // Estimate transactions
      },
    ];

    return methods;
  }, [salesSummaryData]);

  console.log("🔍 Debug - paymentMethods:", paymentMethods);
  console.log("🔍 Debug - Using real data:", paymentMethods.length > 0);

  const totalRevenue = paymentMethods.reduce(
    (sum: number, method: PaymentMethod) => sum + method.amount,
    0
  );

  const monthlyTarget = 9750000000; // 9.75B VND target

  // Calculate days in current month
  const currentDay = new Date().getDate();
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();

  // Calculate monthly revenue for Target KPI (cumulative from start of month)
  const monthlyRevenue = React.useMemo(() => {
    if (!kpiMonthlyRevenueData) return 0;

    const cash = parseFloat(kpiMonthlyRevenueData.cash) || 0;
    const transfer = parseFloat(kpiMonthlyRevenueData.transfer) || 0;
    const card = parseFloat(kpiMonthlyRevenueData.card) || 0;

    const total = cash + transfer + card;

    console.log("🔍 KPI Debug - Monthly revenue calculation (cumulative):", {
      cash,
      transfer,
      card,
      total,
      monthlyTarget,
    });

    return total;
  }, [kpiMonthlyRevenueData]);

  // Calculate daily revenue from daily revenue API data (cash + transfer + card)
  const dailyRevenue = React.useMemo(() => {
    if (!dailyRevenueData) return 0;

    const cash = parseFloat(dailyRevenueData.cash) || 0;
    const transfer = parseFloat(dailyRevenueData.transfer) || 0;
    const card = parseFloat(dailyRevenueData.card) || 0;

    const total = cash + transfer + card;

    console.log("🔍 KPI Debug - Daily revenue calculation:", {
      cash,
      transfer,
      card,
      total,
      dailyTarget: monthlyTarget / daysInMonth,
    });

    return total;
  }, [dailyRevenueData, daysInMonth]);

  // Use appropriate revenue based on view mode
  const currentRevenue =
    kpiViewMode === "monthly" ? monthlyRevenue : dailyRevenue;

  // Monthly view calculations
  const dailyTargetForToday = (monthlyTarget / daysInMonth) * currentDay;
  const dailyTargetPercentage = (dailyTargetForToday / monthlyTarget) * 100;
  const currentPercentage = (currentRevenue / monthlyTarget) * 100;
  const remainingTarget = Math.max(0, monthlyTarget - currentRevenue);

  // Daily view calculations (for current day)
  const currentDate = new Date();
  const currentDayForDaily = currentDate.getDate();
  const dailyTargetForCurrentDay = monthlyTarget / daysInMonth; // Target for one day
  const dailyTargetPercentageForCurrentDay =
    (dailyTargetForCurrentDay / monthlyTarget) * 100;
  const dailyPercentageForCurrentDay =
    (currentRevenue / dailyTargetForCurrentDay) * 100;
  const remainingDailyTarget = Math.max(
    0,
    dailyTargetForCurrentDay - currentRevenue
  );

  // Daily KPI Growth Data (real) derived from kpiDailySeries
  const dailyKpiGrowthData = React.useMemo(() => {
    if (!kpiDailySeries || kpiDailySeries.length === 0) return [] as Array<any>;
    const today = new Date();
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return kpiDailySeries.map((d) => {
      const [yyyy, mm, dd] = d.isoDate.split("-");
      const jsDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      const dayName = dayNames[jsDate.getDay()];
      const isToday = jsDate.toDateString() === today.toDateString();
      const target = dailyTargetForCurrentDay;
      const percentage = target > 0 ? (d.total / target) * 100 : 0;
      return {
        day: dayName,
        date: d.dateLabel,
        revenue: d.total,
        target,
        percentage,
        isToday,
      };
    });
  }, [kpiDailySeries, dailyTargetForCurrentDay]);

  const getTargetStatus = () => {
    if (kpiViewMode === "monthly") {
      if (currentRevenue >= dailyTargetForToday) {
        return currentRevenue > dailyTargetForToday * 1.1 ? "ahead" : "ontrack";
      }
      return "behind";
    } else {
      // Daily view
      if (currentRevenue >= dailyTargetForCurrentDay) {
        return currentRevenue > dailyTargetForCurrentDay * 1.1
          ? "ahead"
          : "ontrack";
      }
      return "behind";
    }
  };

  const targetStatus = getTargetStatus();
  // Map search queries to sections and scroll/highlight
  const sectionRefs = React.useRef({
    dashboard_total_sale_table: React.createRef<HTMLDivElement>(),
    dashboard_foxie_balance: React.createRef<HTMLDivElement>(),
    dashboard_sales_by_hour: React.createRef<HTMLDivElement>(),
    dashboard_sale_detail: React.createRef<HTMLDivElement>(),
    dashboard_kpi: React.createRef<HTMLDivElement>(),
    dashboard_customer_section: React.createRef<HTMLDivElement>(),
    dashboard_booking_section: React.createRef<HTMLDivElement>(),
    dashboard_service_section: React.createRef<HTMLDivElement>(),
  });

  const normalizeKey = (s: string) => normalize(s).replace(/\s+/g, "");

  const [highlightKey, setHighlightKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    // If navigated here with ?q=, trigger search once
    if (searchParamQuery) {
      const event = new CustomEvent('global-search', { detail: { query: searchParamQuery } });
      window.dispatchEvent(event);
      // Clean URL param without reload
      const url = new URL(window.location.href);
      url.searchParams.delete('q');
      window.history.replaceState({}, '', url.toString());
    }

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { query?: string };
      const q = normalize(detail?.query || "");
      if (!q) return;
      const map = SEARCH_TARGETS.map((t) => ({ keys: [normalizeKey(t.label), ...t.keywords.map((k) => normalizeKey(k))], refKey: t.refKey }));
      const found = map.find((m) => m.keys.some((k) => normalizeKey(q).includes(k)));
      const allowed = [
        'dashboard_total_sale_table','dashboard_foxie_balance','dashboard_sales_by_hour','dashboard_sale_detail','dashboard_kpi','dashboard_customer_section','dashboard_booking_section','dashboard_service_section'
      ] as const;
      const ref = found && (allowed as readonly string[]).includes(found.refKey)
        ? (sectionRefs.current as Record<string, React.RefObject<HTMLDivElement>>)[found.refKey]
        : null;
      if (ref?.current) {
        ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
        setHighlightKey(found!.refKey);
        window.setTimeout(() => setHighlightKey(null), 1200);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("global-search", handler as EventListener);
      // Support anchor hash direct navigation: #refKey
      const hash = window.location.hash.replace('#','');
      if (hash) {
        const target = (sectionRefs.current as Record<string, React.RefObject<HTMLDivElement>>)[hash];
        if (target?.current) {
          setTimeout(() => target.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
        }
      }
      // Listener for direct jump events from header within same route
      const jumpHandler = (ev: Event) => {
        const refKey = (ev as CustomEvent).detail?.refKey as string | undefined;
        if (!refKey) return;
        const target = (sectionRefs.current as Record<string, React.RefObject<HTMLDivElement>>)[refKey];
        if (target?.current) target.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      window.addEventListener('jump-to-ref', jumpHandler as EventListener);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("global-search", handler as EventListener);
        window.removeEventListener('jump-to-ref', (()=>{}) as EventListener);
      }
    };
  }, []);

  const statusColors = {
    ahead: { bg: "#00d084", text: "Vượt tiến độ" },
    ontrack: { bg: "#fcb900", text: "Đúng tiến độ" },
    behind: { bg: "#ff6b6b", text: "Chậm tiến độ" },
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Removed ranking helpers reliant on mock datasets (revenueRankingData, foxieRankingData)

  // Use global date context instead of local state
  const { isLoaded: dateLoaded } = useDateRange();

  // Monitor API success notifications
  useEffect(() => {
    if (apiSuccesses.length > 0 && !hasShownSuccess.current) {
      const successMessage =
        apiSuccesses.length === 1
          ? apiSuccesses[0]
          : `${apiSuccesses.length} data sources loaded successfully`;

      showSuccess(successMessage);
      hasShownSuccess.current = true;
      reportDataLoadSuccess("dashboard", apiSuccesses.length);
    }
  }, [apiSuccesses, showSuccess, reportDataLoadSuccess]);

  // Monitor sales summary success
  useEffect(() => {
    if (
      !salesLoading &&
      !salesError &&
      salesSummaryData &&
      !hasShownSuccess.current
    ) {
      showSuccess("Dữ liệu tổng doanh số đã được tải thành công!");
      hasShownSuccess.current = true;
      reportDataLoadSuccess("sales-summary", 1);
    }
  }, [
    salesLoading,
    salesError,
    salesSummaryData,
    showSuccess,
    reportDataLoadSuccess,
  ]);

  // Monitor API error notifications
  useEffect(() => {
    if (apiErrors.length > 0 && !hasShownError.current) {
      const errorMessage =
        apiErrors.length === 1
          ? apiErrors[0]
          : `${apiErrors.length} data sources failed to load`;

      showError(errorMessage);
      hasShownError.current = true;
      reportDataLoadError("dashboard", errorMessage);
    }
  }, [apiErrors, showError, reportDataLoadError]);

  // Monitor general error
  useEffect(() => {
    if (error && !hasShownError.current) {
      showError(error);
      hasShownError.current = true;
      reportPageError(error);
    }
  }, [error, showError, reportPageError]);

  // Monitor sales summary error
  useEffect(() => {
    if (salesError && !hasShownError.current) {
      showError(`Sales data error: ${salesError}`);
      hasShownError.current = true;
      reportPageError(`Lỗi tải dữ liệu sales summary: ${salesError}`);
    }
  }, [salesError, showError, reportPageError]);

  // Watch for auth expiration across all API errors
  useEffect(() => {
    const authErrorTexts = [
      "Authentication failed - please login again",
      "No valid token",
    ];
    const anyAuthError = [
      salesError,
      serviceError,
      bookingError,
      dailyRevenueError,
      kpiMonthlyRevenueError,
      newCustomerError,
    ].some((e) => e && authErrorTexts.some((t) => String(e).includes(t)));
    if (anyAuthError) setAuthExpired(true);
  }, [
    salesError,
    serviceError,
    bookingError,
    dailyRevenueError,
    kpiMonthlyRevenueError,
    newCustomerError,
  ]);

  // Listen to global auth expired event from ApiService
  useEffect(() => {
    const handler = () => setAuthExpired(true);
    if (typeof window !== "undefined") {
      window.addEventListener("auth-expired", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("auth-expired", handler);
      }
    };
  }, []);

  // Monitor booking data success
  useEffect(() => {
    if (
      !bookingLoading &&
      !bookingError &&
      bookingData &&
      !hasShownSuccess.current
    ) {
      showSuccess("Dữ liệu đặt lịch đã được tải thành công!");
      hasShownSuccess.current = true;
      reportDataLoadSuccess("booking", 1);
    }
  }, [
    bookingLoading,
    bookingError,
    bookingData,
    showSuccess,
    reportDataLoadSuccess,
  ]);

  // Monitor booking data error
  useEffect(() => {
    if (bookingError && !hasShownError.current) {
      showError(`Booking data error: ${bookingError}`);
      hasShownError.current = true;
      reportPageError(`Lỗi tải dữ liệu booking: ${bookingError}`);
    }
  }, [bookingError, showError, reportPageError]);

  // Report page performance
  useEffect(() => {
    if (!loading) {
      reportPagePerformance({ loadTime: 2000 });
    }
  }, [loading, reportPagePerformance]);

  // Show loading only until the date context is ready. Sections handle their own loading states.
  if (!dateLoaded) {
    return (
      <div className="p-3 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">{"Đang tải dữ liệu..."}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Notification Component */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      {authExpired && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-md text-center">
            <div className="text-xl font-semibold text-[#334862] mb-2">
              Hết phiên đăng nhập
            </div>
            <div className="text-sm text-gray-600 mb-6">
              Cần đăng nhập lại để tiếp tục sử dụng hệ thống.
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                onClick={() => setAuthExpired(false)}
              >
                Để sau
              </button>
              <a
                href="/login"
                className="px-4 py-2 rounded-md bg-[#f16a3f] hover:bg-[#e55a2b] text-white"
              >
                Đăng nhập lại
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="mb-3 sm:mb-6" ref={sectionRefs.current.dashboard_total_sale_table}>
        <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-2">
          Dashboard
        </h1>

        <p className="text-gray-600 flex flex-wrap items-center gap-[3px] text-sm sm:text-base">
          Welcome back! Here&apos;s what&apos;s happening with{" "}
          <span className="text-orange-500 flex">Face Wash Fox</span> today.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-32"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        }
      >
        <QuickActions />
      </Suspense>

      {/* Top Sale Chart */}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance ">
              Dashboard Quản Lý Kinh Doanh
            </h1>
          </div>
        </div>

        {/* DOANH SỐ SECTION */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-[#f16a3f]" />
            <h2 className="text-2xl font-bold text-[#334862]">Doanh Số</h2>
          </div>

          {/* Bảng Tổng Doanh Số */}
          {salesLoading || paymentMethods.length === 0 ? (
            <div className="border-[#f16a3f]/20 shadow-lg bg-gradient-to-r from-white to-[#f16a3f]/5 rounded-lg p-4 sm:p-6">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="hidden sm:grid grid-cols-12 gap-4 p-3 bg-gradient-to-r from-[#7bdcb5]/20 to-[#00d084]/20 rounded-lg font-semibold text-sm mb-3">
                <div className="col-span-4 h-4 bg-gray-200 rounded" />
                <div className="col-span-3 h-4 bg-gray-200 rounded" />
                <div className="col-span-3 h-4 bg-gray-200 rounded" />
                <div className="col-span-2 h-4 bg-gray-200 rounded" />
              </div>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border border-[#f16a3f]/10 rounded-lg p-3">
                    <div className="hidden sm:grid grid-cols-12 gap-4">
                      <div className="col-span-4 h-4 bg-gray-200 rounded" />
                      <div className="col-span-3 h-4 bg-gray-200 rounded" />
                      <div className="col-span-3 h-4 bg-gray-200 rounded" />
                      <div className="col-span-2 h-4 bg-gray-200 rounded" />
                    </div>
                    <div className="sm:hidden space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-28 bg-gray-200 rounded" />
                        <div className="h-4 w-10 bg-gray-200 rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-12 bg-gray-200 rounded" />
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-[#f16a3f] rounded-lg mt-3">
                <div className="hidden sm:grid grid-cols-12 gap-4 p-3">
                  <div className="col-span-4 h-5 bg-white/40 rounded" />
                  <div className="col-span-3 h-5 bg-white/40 rounded" />
                  <div className="col-span-3 h-5 bg-white/40 rounded" />
                  <div className="col-span-2 h-5 bg-white/40 rounded" />
                </div>
                <div className="sm:hidden p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-28 bg-white/40 rounded" />
                    <div className="h-4 w-12 bg-white/40 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-10 bg-white/40 rounded" />
                    <div className="h-4 w-24 bg-white/40 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <TotalSaleTable
              allPaymentMethods={paymentMethods}
              totalRevenue={totalRevenue}
            />
          )}

          {/* FOXIE BALANCE SECTION */}
          <div ref={sectionRefs.current.dashboard_foxie_balance} className={highlightKey === 'dashboard_foxie_balance' ? 'ring-2 ring-[#41d1d9] rounded-lg' : ''}>
          <FoxieBalanceTable
            foxieBalanceLoading={foxieBalanceLoading}
            foxieBalanceError={foxieBalanceError}
            foxieBalanceData={foxieBalanceData}
          />
          </div>

          {/* SALES BY HOUR SECTION */}
          <div ref={sectionRefs.current.dashboard_sales_by_hour} className={highlightKey === 'dashboard_sales_by_hour' ? 'ring-2 ring-[#41d1d9] rounded-lg' : ''}>
          <SalesByHourTable
            salesByHourLoading={salesByHourLoading}
            salesByHourError={salesByHourError}
            salesByHourData={salesByHourData}
          />
          </div>

          {/* CHI TIẾT DOANH THU SECTION */}
          <div ref={sectionRefs.current.dashboard_sale_detail} className={highlightKey === 'dashboard_sale_detail' ? 'ring-2 ring-[#41d1d9] rounded-lg' : ''}>
          <SaleDetail
            salesDetailLoading={salesDetailLoading}
            salesDetailError={salesDetailError}
            salesDetailData={salesDetailData}
          />
          </div>

          {/* Revenue Charts */}
          {/* <RevenueChart
            showTopRanking={showTopRanking}
            setShowTopRanking={setShowTopRanking}
            rankingData={getRankingChartData()}
            showTopFoxieRanking={showTopFoxieRanking}
            setShowTopFoxieRanking={setShowTopFoxieRanking}
            foxieRankingData={getFoxieRankingChartData()}
          /> */}

          {/* Service & Foxie Cards */}
          {/* <PercentChart
            productDataByDistrict={productDataByDistrict}
            foxieCardDataByDistrict={foxieCardDataByDistrict}
            serviceDataByDistrict={serviceDataByDistrict}
          /> */}

          {/* KPI Chart */}
          <div ref={sectionRefs.current.dashboard_kpi} className={highlightKey === 'dashboard_kpi' ? 'ring-2 ring-[#41d1d9] rounded-lg' : ''}>
          <KPIChart
            kpiDailySeriesLoading={kpiDailySeriesLoading}
            kpiDailySeriesError={kpiDailySeriesError}
            dailyKpiGrowthData={dailyKpiGrowthData}
            kpiViewMode={kpiViewMode}
            setKpiViewMode={setKpiViewMode}
            currentDayForDaily={currentDayForDaily}
            currentPercentage={currentPercentage}
            dailyPercentageForCurrentDay={dailyPercentageForCurrentDay}
            kpiMonthlyRevenueLoading={kpiMonthlyRevenueLoading}
            dailyRevenueLoading={dailyRevenueLoading}
            targetStatus={targetStatus}
            monthlyTarget={monthlyTarget}
            dailyTargetForCurrentDay={dailyTargetForCurrentDay}
            dailyTargetForToday={dailyTargetForToday}
            remainingTarget={remainingTarget}
            remainingDailyTarget={remainingDailyTarget}
            dailyTargetPercentageForCurrentDay={
              dailyTargetPercentageForCurrentDay
            }
            currentRevenue={currentRevenue}
          />
          </div>
        </div>

        {/* KHÁCH HÀNG SECTION */}
        <div ref={sectionRefs.current.dashboard_customer_section} className={highlightKey === 'dashboard_customer_section' ? 'ring-2 ring-[#41d1d9] rounded-lg' : ''}>
        <CustomerSection
          newCustomerLoading={newCustomerLoading}
          newCustomerError={newCustomerError}
          newCustomerTotal={newCustomerTotal}
          newCustomerPieData={newCustomerPieData}
          oldCustomerLoading={oldCustomerLoading}
          oldCustomerError={oldCustomerError}
          oldCustomerTotal={oldCustomerTotal}
          oldCustomerPieData={oldCustomerPieData}
        />
        </div>

        {/* ĐẶT LỊCH SECTION */}
        <div ref={sectionRefs.current.dashboard_booking_section} className={highlightKey === 'dashboard_booking_section' ? 'ring-2 ring-[#41d1d9] rounded-lg' : ''}>
        <BookingSection
          bookingLoading={bookingLoading}
          bookingError={bookingError}
          bookingData={bookingData}
        />
        </div>

        {/* DỊCH VỤ SECTION */}
        <div ref={sectionRefs.current.dashboard_service_section} className={highlightKey === 'dashboard_service_section' ? 'ring-2 ring-[#41d1d9] rounded-lg' : ''}>
        <ServiceSection
          bookingLoading={bookingLoading}
          bookingError={bookingError}
          bookingData={bookingData}
          serviceSummaryData={serviceSummaryData}
        />
        </div>
      </div>
    </div>
  );
}
