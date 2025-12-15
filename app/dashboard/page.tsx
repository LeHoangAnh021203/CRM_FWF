"use client";

import React, { useState, useRef, Suspense, useEffect } from "react";
import { Notification, useNotification } from "@/app/components/notification";
import { SEARCH_TARGETS, normalize } from "@/app/lib/search-targets";
import { usePageStatus } from "@/app/hooks/usePageStatus";
import { useDashboardData } from "@/app/hooks/useDashboardData";
import { useDashboardSummary } from "@/app/hooks/useDashboardSummary";
import { useDateRange } from "@/app/contexts/DateContext";
import { useBranchFilter } from "@/app/contexts/BranchContext";
import { getActualStockIds, parseNumericValue } from "@/app/constants/branches";
import { ApiService } from "@/app/lib/api-service";
import { useLazySectionLoader } from "@/app/hooks/useLazySectionLoader";
import {
  DashboardSummarySections,
  SalesSummaryResponse,
} from "@/app/dashboard/dashboard-types";
import type {
  DashboardWorkerRequestMessage,
  DashboardWorkerResponseMessage,
  DashboardWorkerResult,
} from "@/app/workers/dashboard-metrics.types";

import { QuickActions } from "@/app/components/quick-actions";
import { DollarSign } from "lucide-react";
import {
  TotalSaleTable,
  SaleDetail,
  KPIChart,
  CustomerSection,
  BookingSection,
  BookingByHourChart,
  ServiceSection,
  FoxieBalanceTable,
  SalesByHourTable,
  GrowthByPaymentChart,
} from "./lazy-components";
import { LazyLoadingWrapper, ConditionalRender } from "./LazyLoadingWrapper";

interface PaymentMethod {
  method: string;
  amount: number;
  percentage: number;
  transactions: number;
}

interface ApiDateRange {
  start: string;
  end: string;
}

const isoToDdMmYyyy = (isoInput: string): string => {
  const date = new Date(isoInput);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const buildApiDateRange = (fromDate: string, toDate: string): ApiDateRange => ({
  start: isoToDdMmYyyy(`${fromDate}T00:00:00`),
  end: isoToDdMmYyyy(`${toDate}T23:59:59`),
});

const aggregateSalesSummaryResponse = (
  responses: SalesSummaryResponse[]
): SalesSummaryResponse => ({
  totalRevenue: responses
    .reduce((sum, r) => sum + parseNumericValue(r.totalRevenue), 0)
    .toString(),
  cash: responses
    .reduce((sum, r) => sum + parseNumericValue(r.cash), 0)
    .toString(),
  transfer: responses
    .reduce((sum, r) => sum + parseNumericValue(r.transfer), 0)
    .toString(),
  card: responses
    .reduce((sum, r) => sum + parseNumericValue(r.card), 0)
    .toString(),
  actualRevenue: responses
    .reduce((sum, r) => sum + parseNumericValue(r.actualRevenue), 0)
    .toString(),
  foxieUsageRevenue: responses
    .reduce((sum, r) => sum + parseNumericValue(r.foxieUsageRevenue), 0)
    .toString(),
  walletUsageRevenue: responses
    .reduce((sum, r) => sum + parseNumericValue(r.walletUsageRevenue), 0)
    .toString(),
  toPay: responses
    .reduce((sum, r) => sum + parseNumericValue(r.toPay), 0)
    .toString(),
  debt: responses
    .reduce((sum, r) => sum + parseNumericValue(r.debt), 0)
    .toString(),
});

const normalizeSalesSummary = (
  payload: SalesSummaryResponse
): {
  totalRevenue: string;
  cash: string;
  transfer: string;
  card: string;
  actualRevenue: string;
  foxieUsageRevenue: string;
  walletUsageRevenue: string;
  toPay: string;
  debt: string;
} => ({
  totalRevenue: String(payload.totalRevenue ?? "0"),
  cash: String(payload.cash ?? "0"),
  transfer: String(payload.transfer ?? "0"),
  card: String(payload.card ?? "0"),
  actualRevenue: String(payload.actualRevenue ?? "0"),
  foxieUsageRevenue: String(payload.foxieUsageRevenue ?? "0"),
  walletUsageRevenue: String(payload.walletUsageRevenue ?? "0"),
  toPay: String(payload.toPay ?? "0"),
  debt: String(payload.debt ?? "0"),
});

const DATETIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const LastUpdatedNote: React.FC<{
  timestamp?: number | Date | null;
  className?: string;
}> = ({ timestamp, className = "" }) => {
  if (!timestamp) return null;
  const date =
    typeof timestamp === "number" ? new Date(timestamp) : timestamp;
  if (!date || Number.isNaN(date.getTime())) return null;
  return (
    <p className={`text-xs text-gray-500 ${className}`}>
      Cập nhật lần cuối: {DATETIME_FORMATTER.format(date)}
    </p>
  );
};

type AwaitedValue<T> = T extends Promise<infer U> ? AwaitedValue<U> : T;
type ResolvedResponse<T> = Awaited<AwaitedValue<T>>;

function useStockAwareRequests(
  fromDateStr: string,
  toDateStr: string,
  actualStockIds: string[],
  stockQueryParam: string
) {
  const apiDateRange = React.useMemo<ApiDateRange | null>(() => {
    if (!fromDateStr || !toDateStr) return null;
    return buildApiDateRange(fromDateStr, toDateStr);
  }, [fromDateStr, toDateStr]);

  const stockCacheKey = React.useMemo(
    () => actualStockIds.join(",") || "all",
    [actualStockIds]
  );

  const requestCacheRef = React.useRef<Map<string, Promise<unknown>>>(
    new Map()
  );

  React.useEffect(() => {
    requestCacheRef.current.clear();
  }, [stockCacheKey, apiDateRange?.start, apiDateRange?.end]);

  const buildUrl = React.useCallback(
    (
      endpoint: string,
      range: ApiDateRange | null,
      stockOverride?: string,
      extraParams = "",
      includeStock = true
    ) => {
      if (!range) return null;
      const stockPart = includeStock
        ? stockOverride !== undefined
          ? `&stockId=${stockOverride}`
          : stockQueryParam
        : "";
      return `${endpoint}?dateStart=${range.start}&dateEnd=${range.end}${stockPart}${extraParams}`;
    },
    [stockQueryParam]
  );

  const fetchStockAware = React.useCallback(
    <TResponse, TResult = TResponse>(
      endpoint: string,
      options: {
        aggregate?: (responses: ResolvedResponse<TResponse>[]) => TResult;
        mapSingle?: (response: ResolvedResponse<TResponse>) => TResult;
        cacheKeySuffix?: string;
        extraParams?: string;
        includeStockParam?: boolean;
        rangeOverride?: ApiDateRange;
      } = {}
    ): Promise<TResult | null> => {
      type ResponseValue = ResolvedResponse<TResponse>;
      const {
        aggregate,
        mapSingle,
        cacheKeySuffix,
        extraParams = "",
        includeStockParam = true,
        rangeOverride,
      } = options;

      const range = rangeOverride ?? apiDateRange;
      if (!range) return Promise.resolve(null);

      const suffix =
        cacheKeySuffix ??
        `${aggregate ? "agg" : "single"}-${mapSingle ? "mapped" : "raw"}-${
          includeStockParam ? "withStock" : "noStock"
        }-${extraParams}-${range.start}-${range.end}`;

      const cacheKey = `${endpoint}|${stockCacheKey}|${suffix}`;
      const cache = requestCacheRef.current;
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey) as Promise<TResult>;
      }

      const requestPromise = (async (): Promise<TResult | null> => {
        if (aggregate && includeStockParam && actualStockIds.length > 1) {
          const responses = (await Promise.all(
            actualStockIds.map(async (sid): Promise<ResponseValue | null> => {
              const url = buildUrl(
                endpoint,
                range,
                sid,
                extraParams,
                true
              );
              if (!url) {
                return null;
              }
              const result = (await ApiService.getDirect(url)) as ResponseValue;
              return result;
            })
          )) as (ResponseValue | null)[];
          const validResponses = responses.filter(
            (resp): resp is ResponseValue => resp != null
          );
          if (!aggregate) return null;
          return aggregate(validResponses);
        }

        const url = buildUrl(
          endpoint,
          range,
          undefined,
          extraParams,
          includeStockParam
        );
        if (!url) return null;
        const response = (await ApiService.getDirect(url)) as ResponseValue;
        return mapSingle
          ? mapSingle(response)
          : ((response as unknown) as TResult);
      })();

      cache.set(cacheKey, requestPromise as Promise<unknown>);
      return requestPromise;
    },
    [apiDateRange, actualStockIds, buildUrl, stockCacheKey]
  );

  return { apiDateRange, fetchStockAware };
}

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
  const { fromDate, toDate } = useDateRange();
  const fromDateStr = React.useMemo(() => {
    if (!fromDate) return "";
    return fromDate.split("T")[0];
  }, [fromDate]);
  const toDateStr = React.useMemo(() => {
    if (!toDate) return "";
    return toDate.split("T")[0];
  }, [toDate]);
  const { stockId: selectedStockId } = useBranchFilter();
  const workerRef = useRef<Worker | null>(null);
  const zeroBranchCacheRef = useRef<Map<string, Set<string>>>(new Map());
  const [kpiMetrics, setKpiMetrics] = useState<DashboardWorkerResult | null>(
    null
  );
  const [kpiWorkerError, setKpiWorkerError] = useState<string | null>(null);
  
  // Get actual stockIds (can be multiple for region/city filters)
  const actualStockIds = React.useMemo(() => {
    return getActualStockIds(selectedStockId || "");
  }, [selectedStockId]);
  
  // Create query param - if multiple stockIds, we'll call multiple APIs and aggregate
  const stockQueryParam = React.useMemo(() => {
    if (actualStockIds.length === 0) {
      return "&stockId="; // All branches require blank stockId param
    } else if (actualStockIds.length === 1) {
      return `&stockId=${actualStockIds[0]}`;
    } else {
      // Multiple stockIds - for now, try comma-separated
      // If backend doesn't support, we'll need to aggregate manually
      return `&stockId=${actualStockIds.join(",")}`;
    }
  }, [actualStockIds]);

  const { apiDateRange, fetchStockAware } = useStockAwareRequests(
    fromDateStr,
    toDateStr,
    actualStockIds,
    stockQueryParam
  );
  
  // Track which data sections have been loaded and notified
  const notifiedDataRef = useRef<Set<string>>(new Set());
  const {
    reportPageError,
    reportDataLoadSuccess,
    reportPagePerformance,
    reportDataLoadError,
  } = usePageStatus("dashboard");

  const { loading, error, apiErrors, apiSuccesses } = useDashboardData();
  
  const searchParamQuery = (() => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    return url.searchParams.get("q") || "";
  })();

  // Special holiday days + lazy-load sections need to be defined before any effect uses them
  const currentMonthKeyForHoliday = React.useMemo(() => {
    const now = toDate ? new Date(toDate.split("T")[0]) : new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, [toDate]);

  const [specialHolidays, setSpecialHolidays] = React.useState<number[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(
          `kpi_special_holidays_${currentMonthKeyForHoliday}`
        );
        if (!raw) return [];
        const arr = JSON.parse(raw) as number[];
        return Array.isArray(arr) ? arr.filter((d) => Number.isFinite(d)) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `kpi_special_holidays_${currentMonthKeyForHoliday}`,
        JSON.stringify(specialHolidays)
      );
    }
  }, [specialHolidays, currentMonthKeyForHoliday]);

  const sectionRefs = React.useRef({
    dashboard_total_sale_table: React.createRef<HTMLDivElement>(),
    dashboard_foxie_balance: React.createRef<HTMLDivElement>(),
    dashboard_sales_by_hour: React.createRef<HTMLDivElement>(),
    dashboard_sale_detail: React.createRef<HTMLDivElement>(),
    dashboard_kpi: React.createRef<HTMLDivElement>(),
    dashboard_customer_section: React.createRef<HTMLDivElement>(),
    dashboard_booking_section: React.createRef<HTMLDivElement>(),
    dashboard_booking_by_hour: React.createRef<HTMLDivElement>(),
    dashboard_service_section: React.createRef<HTMLDivElement>(),
  });

  const shouldLoadFoxieBalance = useLazySectionLoader(
    sectionRefs.current.dashboard_foxie_balance,
    { delayMs: 2000 }
  );

  const normalizeKey = (s: string) => normalize(s).replace(/\s+/g, "");
  const [highlightKey, setHighlightKey] = React.useState<string | null>(null);

  const stockIdParam =
    actualStockIds.length === 0
      ? ""
      : actualStockIds.length === 1
      ? actualStockIds[0]
      : actualStockIds.join(",");

  const summaryQuery = useDashboardSummary({
    dateStart: apiDateRange?.start ?? null,
    dateEnd: apiDateRange?.end ?? null,
    stockId: stockIdParam,
    enabled: Boolean(apiDateRange),
  });

  const summaryPayload =
    (summaryQuery.data as
      | {
          data?: DashboardSummarySections | null;
          errors?: Record<string, string>;
        }
      | undefined) ?? null;
  const summaryData = (summaryPayload?.data ?? {}) as DashboardSummarySections;
  const summaryErrors = summaryPayload?.errors ?? {};
  const summaryGlobalError = summaryQuery.error?.message ?? null;
  const isSummaryLoading =
    (summaryQuery.isLoading || summaryQuery.isFetching) && Boolean(apiDateRange);
  const summaryLastUpdatedAt = summaryQuery.dataUpdatedAt ?? null;

  const rawSalesSummary = summaryData.salesSummary;
  const salesSummaryData = React.useMemo(
    () => (rawSalesSummary ? normalizeSalesSummary(rawSalesSummary) : null),
    [rawSalesSummary]
  );
  const salesLoading = isSummaryLoading;
  const salesError = summaryErrors.salesSummary ?? summaryGlobalError ?? null;

  const actualRevenueToday = summaryData.actualRevenueToday ?? null;
  const actualRevenueMTD = summaryData.actualRevenueMTD ?? null;

  const [kpiViewMode, setKpiViewMode] = useState<"monthly" | "daily">(
    "monthly"
  );

  // KPI Monthly revenue API state (for Target KPI only - cumulative from start of month)
  const [kpiMonthlyRevenueLoading, setKpiMonthlyRevenueLoading] =
    useState(true);
  const [kpiMonthlyRevenueError, setKpiMonthlyRevenueError] = useState<
    string | null
  >(null);

  const serviceSummaryData = summaryData.serviceSummary ?? null;
  const serviceError =
    summaryErrors.serviceSummary ?? summaryGlobalError ?? null;
  const topServicesData = summaryData.topServices ?? null;
  const topServicesLoading = isSummaryLoading;
  const topServicesError =
    summaryErrors.topServices ?? summaryGlobalError ?? null;

  // Auth expiration modal state
  const [authExpired, setAuthExpired] = useState(false);

  const newCustomerData = summaryData.newCustomers ?? null;
  const newCustomerLoading = isSummaryLoading;
  const newCustomerError =
    summaryErrors.newCustomers ?? summaryGlobalError ?? null;

  const oldCustomerData = summaryData.oldCustomers ?? null;
  const oldCustomerLoading = isSummaryLoading;
  const oldCustomerError =
    summaryErrors.oldCustomers ?? summaryGlobalError ?? null;

  // Foxie balance API state
  const [foxieBalanceData, setFoxieBalanceData] = useState<{
    the_tien_kha_dung: number;
  } | null>(null);
  const [foxieBalanceLoading, setFoxieBalanceLoading] = useState(true);
  const [foxieBalanceError, setFoxieBalanceError] = useState<string | null>(
    null
  );
  const [foxieBalanceUpdatedAt, setFoxieBalanceUpdatedAt] =
    useState<Date | null>(null);

  const salesByHourData = summaryData.salesByHour ?? null;
  const salesByHourLoading = isSummaryLoading;
  const salesByHourError =
    summaryErrors.salesByHour ?? summaryGlobalError ?? null;

  const salesDetailData = summaryData.salesDetail ?? null;
  const salesDetailLoading = isSummaryLoading;
  const salesDetailError =
    summaryErrors.salesDetail ?? summaryGlobalError ?? null;

  const bookingByHourData = summaryData.bookingByHour ?? null;
  const bookingByHourLoading = isSummaryLoading;
  const bookingByHourError =
    summaryErrors.bookingByHour ?? summaryGlobalError ?? null;

  const bookingData = summaryData.bookingSummary ?? null;
  const bookingLoading = isSummaryLoading;
  const bookingError =
    summaryErrors.bookingSummary ?? summaryGlobalError ?? null;

  // Daily revenue API state (for current day only)
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

  // Fetch Foxie balance using ApiService via proxy
  React.useEffect(() => {
    if (!shouldLoadFoxieBalance) return;
    let isMounted = true;

    const fetchFoxieBalance = async () => {
      try {
        setFoxieBalanceLoading(true);
        setFoxieBalanceError(null);

        console.log("🔄 Fetching Foxie balance via direct API call");

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
        if (isMounted) {
          setFoxieBalanceData(data);
          setFoxieBalanceUpdatedAt(new Date());
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch Foxie balance";
        if (isMounted) {
          setFoxieBalanceError(errorMessage);
        }
        console.error("❌ Foxie balance fetch error:", err);
      } finally {
        if (isMounted) {
          setFoxieBalanceLoading(false);
        }
      }
    };

    fetchFoxieBalance();
    return () => {
      isMounted = false;
    };
  }, [shouldLoadFoxieBalance]);

  // Sales by hour data is now provided by the aggregated summary query

  // Booking by hour data is available via the aggregated summary query

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

  // --- colorPalette useMemo để tránh deps bị warning ---
  const colorPalette = React.useMemo(
    () => [
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
    ],
    []
  );

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

  // Sales detail and booking data are provided via the aggregated summary query

  // Fetch daily revenue (current day only) using ApiService via proxy
  React.useEffect(() => {
    const fetchDailyRevenue = async () => {
      try {
        setDailyRevenueLoading(true);
        setDailyRevenueError(null);

        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        const todayStr = `${day}/${month}/${year}`;

        console.log("🔄 Fetching daily revenue for today:", todayStr);

        await fetchStockAware<SalesSummaryResponse>("real-time/sales-summary-copied", {
          cacheKeySuffix: `daily-revenue-${todayStr}`,
          rangeOverride: { start: todayStr, end: todayStr },
        });
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
  }, [fetchStockAware]); // Refetch when branch changes

  // Fetch KPI monthly revenue (for Target KPI only - cumulative from start of month)
  React.useEffect(() => {
    const fetchKpiMonthlyRevenue = async () => {
      try {
        setKpiMonthlyRevenueLoading(true);
        setKpiMonthlyRevenueError(null);

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
          { startDate, endDate, actualStockIds: actualStockIds.length }
        );

        await fetchStockAware<SalesSummaryResponse>(
          "real-time/sales-summary-copied",
          {
            aggregate: aggregateSalesSummaryResponse,
            cacheKeySuffix: `kpi-monthly-${startDate}-${endDate}`,
            rangeOverride: { start: startDate, end: endDate },
          }
        );
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
  }, [fetchStockAware, actualStockIds]);

  // Fetch daily KPI series (TM+CK+QT per day) from start of month to today
  const kpiSeriesStockRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    // Create a unique key from all relevant dependencies
    const currentKey = `${selectedStockId}-${stockQueryParam}-${actualStockIds.join(',')}`;
    if (kpiSeriesStockRef.current === currentKey) return;
    kpiSeriesStockRef.current = currentKey;
    let isCancelled = false;

    const fetchDailySeries = async () => {
      try {
        setKpiDailySeriesLoading(true);
        setKpiDailySeriesError(null);

        console.log(`📊 KPI Daily Series: Starting fetch for stockId="${selectedStockId}", actualStockIds=[${actualStockIds.join(', ')}] (count: ${actualStockIds.length})`);
        
        // Debug: Log if actualStockIds is empty when it shouldn't be
        if (selectedStockId && selectedStockId.startsWith('region:') && actualStockIds.length === 0) {
          console.error(`❌ KPI Daily Series: Region filter "${selectedStockId}" resulted in empty actualStockIds!`);
          setKpiDailySeriesError(`Không tìm thấy chi nhánh cho khu vực "${selectedStockId}". Vui lòng kiểm tra lại cấu hình.`);
          setKpiDailySeriesLoading(false);
          return;
        }

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
        const firstDayStr = toDdMmYyyy(firstDayOfMonth);
        const todayStr = toDdMmYyyy(today);
        const zeroCacheKey = `${selectedStockId || 'all'}-${stockQueryParam}-${firstDayStr}-${todayStr}`;
        const zeroBranchSet =
          zeroBranchCacheRef.current.get(zeroCacheKey) ?? new Set<string>();
        zeroBranchCacheRef.current.set(zeroCacheKey, zeroBranchSet);
        const ZERO_RESPONSE = { cash: 0, transfer: 0, card: 0 };
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

        const dates: Date[] = [];
        for (
          let d = new Date(firstDayOfMonth);
          d <= today;
          d.setDate(d.getDate() + 1)
        ) {
          dates.push(new Date(d));
        }

        const parseCurrency = (v: unknown) => {
          if (v === null || v === undefined) return 0;
          if (typeof v === "number") return isNaN(v) ? 0 : v;
          if (typeof v === "string") {
            const cleaned = v.replace(/[^0-9.-]/g, "");
            const parsed = Number(cleaned);
            return isNaN(parsed) ? 0 : parsed;
          }
          // Try to convert to number
          const num = Number(v);
          return isNaN(num) ? 0 : num;
        };

        // Batch requests to avoid overwhelming the API (max 5 concurrent requests per batch)
        const BATCH_SIZE = 5;
        const fetchPromises = dates.map(async (d, dateIndex) => {
          const ddmmyyyy = toDdMmYyyy(d);
          try {
            // Add small delay to batch requests
            if (dateIndex > 0 && dateIndex % BATCH_SIZE === 0) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }

            let total = 0;
            let hasError = false;
            let errorCount = 0;

            if (actualStockIds.length > 1) {
              // Multiple stockIds - fetch each and aggregate
              console.log(`📊 KPI Daily Series [${ddmmyyyy}]: Fetching ${actualStockIds.length} branches and aggregating...`);
              
              // Batch branch requests too (max 10 concurrent)
              const BRANCH_BATCH_SIZE = 10;
              const branchResults: Array<{
                cash?: string | number;
                transfer?: string | number;
                card?: string | number;
              }> = [];

        for (let i = 0; i < actualStockIds.length; i += BRANCH_BATCH_SIZE) {
          const batch = actualStockIds.slice(i, i + BRANCH_BATCH_SIZE);
          const batchResults = await Promise.allSettled(
            batch.map(async (sid) => {
              if (zeroBranchSet.has(sid)) {
                return { sid, data: ZERO_RESPONSE, success: true, skipped: true } as const;
              }
              try {
                      const data = await ApiService.getDirect(
                        `real-time/sales-summary-copied?dateStart=${ddmmyyyy}&dateEnd=${ddmmyyyy}&stockId=${sid}`
                ) as {
                  cash?: string | number;
                  transfer?: string | number;
                  card?: string | number;
                };
                // Log successful fetch for debugging
                const dayTotal = parseCurrency(data.cash) + parseCurrency(data.transfer) + parseCurrency(data.card);
                if (dayTotal > 0) {
                  console.log(`  ✓ Branch ${sid}: ${dayTotal.toLocaleString('vi-VN')} VND`);
                } else {
                  zeroBranchSet.add(sid);
                }
                return { sid, data, success: true, skipped: false } as const;
              } catch (err) {
                const errorMsg = err instanceof Error ? err.message : String(err);
                console.error(`❌ KPI Daily Series: Error fetching branch ${sid} for ${ddmmyyyy}:`, errorMsg);
                errorCount++;
                return { sid, data: ZERO_RESPONSE, success: false, skipped: false } as const;
              }
            })
          );

          batchResults.forEach((result, idx) => {
            if (result.status === 'fulfilled') {
              const value = result.value;
              if (value && value.data) {
                branchResults.push(value.data);
                if (!value.success) hasError = true;
              } else {
                console.warn(`⚠️ KPI Daily Series: Unexpected result structure for batch item ${idx}:`, result);
                branchResults.push({ cash: 0, transfer: 0, card: 0 });
                hasError = true;
              }
                  } else {
                    console.error(`❌ KPI Daily Series: Promise rejected for batch item ${idx}:`, result.reason);
                    branchResults.push({ cash: 0, transfer: 0, card: 0 });
                    hasError = true;
                    errorCount++;
                  }
                });

                // Small delay between batches
                if (i + BRANCH_BATCH_SIZE < actualStockIds.length) {
                  await new Promise(resolve => setTimeout(resolve, 50));
                }
              }

              // Aggregate all results
              total = branchResults.reduce((sum, r) => {
                const cash = parseCurrency(r.cash);
                const transfer = parseCurrency(r.transfer);
                const card = parseCurrency(r.card);
                const dayTotal = cash + transfer + card;
                return sum + dayTotal;
              }, 0);

              if (hasError) {
                console.warn(`⚠️ KPI Daily Series [${ddmmyyyy}]: ${errorCount}/${actualStockIds.length} branches failed, but continuing with available data. Total: ${total.toLocaleString('vi-VN')} VND`);
              } else {
                console.log(`✅ KPI Daily Series [${ddmmyyyy}]: Aggregated total: ${total.toLocaleString('vi-VN')} VND from ${actualStockIds.length} branches (${branchResults.length} results)`);
              }
              
              // Additional debug: if total is 0 and we have branches, log more details
              if (total === 0 && actualStockIds.length > 0 && branchResults.length > 0) {
                console.warn(`⚠️ KPI Daily Series [${ddmmyyyy}]: Total is 0 but we have ${branchResults.length} branch results. Sample:`, branchResults.slice(0, 3));
              }
            } else if (actualStockIds.length === 1) {
              // Single stockId
              console.log(`📊 KPI Daily Series [${ddmmyyyy}]: Fetching single branch ${actualStockIds[0]}...`);
          if (zeroBranchSet.has(actualStockIds[0])) {
            total = 0;
            console.log(`⏭️ KPI Daily Series [${ddmmyyyy}]: Branch ${actualStockIds[0]} skipped (no data for range)`);
          } else {
              const data = (await ApiService.getDirect(
                `real-time/sales-summary-copied?dateStart=${ddmmyyyy}&dateEnd=${ddmmyyyy}&stockId=${actualStockIds[0]}`
            )) as {
              cash?: string | number;
              transfer?: string | number;
              card?: string | number;
            };
            total =
              parseCurrency(data.cash) +
              parseCurrency(data.transfer) +
              parseCurrency(data.card);
            if (total === 0) {
              zeroBranchSet.add(actualStockIds[0]);
            }
            console.log(`✅ KPI Daily Series [${ddmmyyyy}]: Single branch total: ${total.toLocaleString('vi-VN')} VND`);
          }
        } else {
          // All branches - still need to send blank stockId param
          console.log(`📊 KPI Daily Series [${ddmmyyyy}]: Fetching all branches (stockId=blank)...`);
              const data = (await ApiService.getDirect(
                `real-time/sales-summary-copied?dateStart=${ddmmyyyy}&dateEnd=${ddmmyyyy}${stockQueryParam}`
              )) as {
                cash?: string | number;
                transfer?: string | number;
                card?: string | number;
              };
              total =
                parseCurrency(data.cash) +
                parseCurrency(data.transfer) +
                parseCurrency(data.card);
              console.log(`✅ KPI Daily Series [${ddmmyyyy}]: All branches total: ${total.toLocaleString('vi-VN')} VND`);
            }

            return {
              dateLabel: `${String(d.getDate()).padStart(2, "0")}/${String(
                d.getMonth() + 1
              ).padStart(2, "0")}`,
              isoDate: toIsoYyyyMmDd(d),
              total,
            };
          } catch (err) {
            console.error(`❌ Failed to fetch data for ${ddmmyyyy}:`, err);
            return {
              dateLabel: `${String(d.getDate()).padStart(2, "0")}/${String(
                d.getMonth() + 1
              ).padStart(2, "0")}`,
              isoDate: toIsoYyyyMmDd(d),
              total: 0,
            };
          }
        });

        const fetchedResults = await Promise.all(fetchPromises);
        if (!isCancelled) {
          results.push(...fetchedResults);
          const totalRevenue = results.reduce((sum, r) => sum + r.total, 0);
          console.log(`📊 KPI Daily Series: Fetched ${results.length} days of data`);
          console.log(`📊 KPI Daily Series: Total revenue sum: ${totalRevenue.toLocaleString('vi-VN')} VND`);
          
          if (results.length === 0) {
            console.warn('⚠️ KPI Daily Series: No data fetched! Check API responses.');
            setKpiDailySeriesError('Không có dữ liệu cho khoảng thời gian này');
            setKpiDailySeries([]);
          } else if (totalRevenue === 0 && actualStockIds.length > 0) {
            // If we have stockIds but got all zeros, there might be an issue
            console.warn(`⚠️ KPI Daily Series: All data is zero for ${actualStockIds.length} branches. This might indicate an API issue.`);
            console.warn(`  Selected stockId: "${selectedStockId}", actualStockIds: [${actualStockIds.join(', ')}]`);
            // Don't set error if it's a valid region - might just be no sales data
            // Only set error if it's a specific branch
            if (selectedStockId && !selectedStockId.startsWith('region:') && !selectedStockId.startsWith('city:')) {
              setKpiDailySeriesError('Không có dữ liệu doanh thu cho chi nhánh này. Vui lòng kiểm tra lại.');
            }
            setKpiDailySeries(results);
          } else {
            // Clear any previous errors if we have data
            setKpiDailySeriesError(null);
            setKpiDailySeries(results);
            console.log(`✅ KPI Daily Series: Successfully set ${results.length} days of data with total revenue: ${totalRevenue.toLocaleString('vi-VN')} VND`);
          }
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to fetch daily KPI series";
        if (!isCancelled) {
          setKpiDailySeriesError(message);
          setKpiDailySeries([]);
        }
        console.error("❌ Daily KPI series fetch error:", err);
      } finally {
        if (!isCancelled) {
          setKpiDailySeriesLoading(false);
        }
      }
    };

    fetchDailySeries();
    return () => {
      isCancelled = true;
    };
  }, [selectedStockId, stockQueryParam, actualStockIds]);

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

  // Default target, can be overridden by user input
  const DEFAULT_MONTH_TARGET = 9750000000;
  
  // User-editable monthly target (stored in localStorage)
  const [userMonthlyTarget, setUserMonthlyTarget] = React.useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kpi_monthly_target');
      return stored ? Number(stored) : null;
    }
    return null;
  });
  
  const COMPANY_MONTH_TARGET = userMonthlyTarget ?? DEFAULT_MONTH_TARGET;

  const today = new Date();
  const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(today.getDate()).padStart(2, "0")}`;
  const weekendTargetPerDay = 500000000;
  const holidayTargetPerDay = 600000000;
  const selectedDateStr = toDateStr || todayDateStr;
  const endDateIso = toDate ? toDate.split("T")[0] : todayDateStr;

  const derivedDailyGrowth = kpiMetrics?.dailyKpiGrowthData ?? [];
  const computedSelectedDay = kpiMetrics?.selectedDay ?? 0;
  const computedLastDay = kpiMetrics?.lastDay ?? computedSelectedDay;
  const fallbackSelectedDay = Number(selectedDateStr.split("-")[2] ?? today.getDate());
  const safeSelectedDay = Number.isNaN(fallbackSelectedDay)
    ? today.getDate()
    : fallbackSelectedDay;
  const selectedDay = computedSelectedDay || safeSelectedDay;
  const lastDay = computedLastDay || selectedDay;
  const dailyTargetForCurrentDay = kpiMetrics?.dailyTargetForCurrentDay ?? 0;
  const dailyTargetForSelectedDay =
    kpiMetrics?.dailyTargetForSelectedDay ?? dailyTargetForCurrentDay;
  const dailyKpiRevenue = kpiMetrics?.dailyKpiRevenue ?? 0;
  const dailyPercentage = kpiMetrics?.dailyPercentage ?? 0;
  const dailyKpiLeft = kpiMetrics?.dailyKpiLeft ?? 0;
  const currentRevenue = kpiMetrics?.currentRevenue ?? 0;
  const currentPercentage = kpiMetrics?.currentPercentage ?? 0;
  const remainingTarget = kpiMetrics?.remainingTarget ?? 0;
  const dailyStatus = kpiMetrics?.dailyStatus ?? "ontrack";
  const monthlyStatus = kpiMetrics?.monthlyStatus ?? "ontrack";
  const targetUntilNow = kpiMetrics?.targetUntilNow ?? 0;
  const dailyKpiGrowthData = derivedDailyGrowth;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const worker = new Worker(
      new URL("../workers/dashboard-metrics.worker.ts", import.meta.url)
    );
    workerRef.current = worker;
    const handleMessage = (
      event: MessageEvent<DashboardWorkerResponseMessage>
    ) => {
      if (event.data.type === "error") {
        setKpiWorkerError(event.data.error);
      } else {
        setKpiWorkerError(null);
        setKpiMetrics(event.data.payload);
      }
    };
    worker.addEventListener("message", handleMessage);
    return () => {
      worker.removeEventListener("message", handleMessage);
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!workerRef.current) return;
    const message: DashboardWorkerRequestMessage = {
      type: "compute",
      payload: {
        kpiDailySeries: kpiDailySeries ?? [],
        selectedDateIso: selectedDateStr,
        endDateIso,
        todayIso: todayDateStr,
        specialHolidays,
        companyMonthTarget: COMPANY_MONTH_TARGET,
        weekendTargetPerDay,
        holidayTargetPerDay,
        actualRevenueToday,
        actualRevenueMTD,
      },
    };
    workerRef.current.postMessage(message);
  }, [
    kpiDailySeries,
    selectedDateStr,
    endDateIso,
    todayDateStr,
    specialHolidays,
    COMPANY_MONTH_TARGET,
    weekendTargetPerDay,
    holidayTargetPerDay,
    actualRevenueToday,
    actualRevenueMTD,
  ]);

  useEffect(() => {
    if (!kpiWorkerError) return;
    console.error("❌ KPI worker error:", kpiWorkerError);
  }, [kpiWorkerError]);

  // -------- Render tách riêng cho Ngày và Tháng --------
  React.useEffect(() => {
    // If navigated here with ?q=, trigger search once
    if (searchParamQuery) {
      const event = new CustomEvent("global-search", {
        detail: { query: searchParamQuery },
      });
      window.dispatchEvent(event);
      // Clean URL param without reload
      const url = new URL(window.location.href);
      url.searchParams.delete("q");
      window.history.replaceState({}, "", url.toString());
    }

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { query?: string };
      const q = normalize(detail?.query || "");
      if (!q) return;
      const map = SEARCH_TARGETS.map((t) => ({
        keys: [
          normalizeKey(t.label),
          ...t.keywords.map((k) => normalizeKey(k)),
        ],
        refKey: t.refKey,
      }));
      const found = map.find((m) =>
        m.keys.some((k) => normalizeKey(q).includes(k))
      );
      const allowed = [
        "dashboard_total_sale_table",
        "dashboard_foxie_balance",
        "dashboard_sales_by_hour",
        "dashboard_sale_detail",
        "dashboard_kpi",
        "dashboard_customer_section",
        "dashboard_booking_section",
        "dashboard_service_section",
      ] as const;
      const ref =
        found && (allowed as readonly string[]).includes(found.refKey)
          ? (
              sectionRefs.current as Record<
                string,
                React.RefObject<HTMLDivElement>
              >
            )[found.refKey]
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
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        const target = (
          sectionRefs.current as Record<string, React.RefObject<HTMLDivElement>>
        )[hash];
        if (target?.current) {
          setTimeout(
            () =>
              target.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              }),
            0
          );
        }
      }
      // Listener for direct jump events from header within same route
      const jumpHandler = (ev: Event) => {
        const refKey = (ev as CustomEvent).detail?.refKey as string | undefined;
        if (!refKey) return;
        const target = (
          sectionRefs.current as Record<string, React.RefObject<HTMLDivElement>>
        )[refKey];
        if (target?.current)
          target.current.scrollIntoView({ behavior: "smooth", block: "start" });
      };
      window.addEventListener("jump-to-ref", jumpHandler as EventListener);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("global-search", handler as EventListener);
        window.removeEventListener("jump-to-ref", (() => {}) as EventListener);
      }
    };
  }, [searchParamQuery]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiSuccesses]); // Functions are stable, no need in deps

  // Monitor sales summary success
  useEffect(() => {
    if (
      !salesLoading &&
      !salesError &&
      salesSummaryData &&
      !notifiedDataRef.current.has("sales-summary")
    ) {
      showSuccess("✅ Dữ liệu tổng doanh số đã được tải thành công!");
      notifiedDataRef.current.add("sales-summary");
      reportDataLoadSuccess("sales-summary", 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesLoading, salesError, salesSummaryData]); // Functions are stable

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiErrors]); // Functions are stable

  // Monitor general error
  useEffect(() => {
    if (error && !hasShownError.current) {
      showError(error);
      hasShownError.current = true;
      reportPageError(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]); // Functions are stable

  // Monitor sales summary error
  useEffect(() => {
    if (salesError && !hasShownError.current) {
      showError(`Sales data error: ${salesError}`);
      hasShownError.current = true;
      reportPageError(`Lỗi tải dữ liệu sales summary: ${salesError}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesError]); // Functions are stable

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
      !notifiedDataRef.current.has("booking")
    ) {
      showSuccess("✅ Dữ liệu đặt lịch đã được tải thành công!");
      notifiedDataRef.current.add("booking");
      reportDataLoadSuccess("booking", 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingLoading, bookingError, bookingData]); // Functions are stable

  // Monitor KPI data success
  useEffect(() => {
    if (
      !kpiDailySeriesLoading &&
      !kpiMonthlyRevenueLoading &&
      !kpiDailySeriesError &&
      kpiDailySeries &&
      !notifiedDataRef.current.has("kpi")
    ) {
      showSuccess("✅ Dữ liệu KPI đã được tải thành công!");
      notifiedDataRef.current.add("kpi");
      reportDataLoadSuccess("kpi", 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    kpiDailySeriesLoading,
    kpiMonthlyRevenueLoading,
    kpiDailySeriesError,
    kpiDailySeries,
  ]); // Functions are stable

  // Monitor customer data success
  useEffect(() => {
    if (
      !newCustomerLoading &&
      !oldCustomerLoading &&
      !newCustomerError &&
      !oldCustomerError &&
      (newCustomerData || oldCustomerData) &&
      !notifiedDataRef.current.has("customer")
    ) {
      showSuccess("✅ Dữ liệu khách hàng đã được tải thành công!");
      notifiedDataRef.current.add("customer");
      reportDataLoadSuccess("customer", 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    newCustomerLoading,
    oldCustomerLoading,
    newCustomerError,
    oldCustomerError,
    newCustomerData,
    oldCustomerData,
  ]); // Functions are stable

  // Monitor service data success
  useEffect(() => {
    if (
      !bookingLoading &&
      !serviceError &&
      serviceSummaryData &&
      !notifiedDataRef.current.has("service")
    ) {
      showSuccess("✅ Dữ liệu dịch vụ đã được tải thành công!");
      notifiedDataRef.current.add("service");
      reportDataLoadSuccess("service", 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingLoading, serviceError, serviceSummaryData]); // Functions are stable

  // Monitor foxie balance success
  useEffect(() => {
    if (
      !foxieBalanceLoading &&
      !foxieBalanceError &&
      foxieBalanceData &&
      !notifiedDataRef.current.has("foxie-balance")
    ) {
      showSuccess("✅ Dữ liệu số dư Foxie đã được tải thành công!");
      notifiedDataRef.current.add("foxie-balance");
      reportDataLoadSuccess("foxie-balance", 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foxieBalanceLoading, foxieBalanceError, foxieBalanceData]); // Functions are stable

  // Monitor sales by hour success
  useEffect(() => {
    if (
      !salesByHourLoading &&
      !salesByHourError &&
      salesByHourData &&
      !notifiedDataRef.current.has("sales-by-hour")
    ) {
      showSuccess("✅ Dữ liệu doanh số theo giờ đã được tải thành công!");
      notifiedDataRef.current.add("sales-by-hour");
      reportDataLoadSuccess("sales-by-hour", 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesByHourLoading, salesByHourError, salesByHourData]); // Functions are stable

  // Monitor sales detail success
  useEffect(() => {
    if (
      !salesDetailLoading &&
      !salesDetailError &&
      salesDetailData &&
      !notifiedDataRef.current.has("sales-detail")
    ) {
      showSuccess("✅ Dữ liệu chi tiết doanh số đã được tải thành công!");
      notifiedDataRef.current.add("sales-detail");
      reportDataLoadSuccess("sales-detail", 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesDetailLoading, salesDetailError, salesDetailData]); // Functions are stable

  // Monitor booking by hour success
  useEffect(() => {
    if (
      !bookingByHourLoading &&
      !bookingByHourError &&
      bookingByHourData &&
      !notifiedDataRef.current.has("booking-by-hour")
    ) {
      showSuccess("✅ Dữ liệu đặt lịch theo giờ đã được tải thành công!");
      notifiedDataRef.current.add("booking-by-hour");
      reportDataLoadSuccess("booking-by-hour", 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingByHourLoading, bookingByHourError, bookingByHourData]); // Functions are stable

  // Monitor booking data error
  useEffect(() => {
    if (bookingError && !hasShownError.current) {
      showError(`Booking data error: ${bookingError}`);
      hasShownError.current = true;
      reportPageError(`Lỗi tải dữ liệu booking: ${bookingError}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingError]); // Functions are stable

  // Report page performance
  useEffect(() => {
    if (!loading) {
      reportPagePerformance({ loadTime: 2000 });
    }
  }, [loading, reportPagePerformance]);

  const isDaily = kpiViewMode === "daily";

  // Sample aggregation ( giả lập, bạn cần thay bằng logic thực tế hoặc gọi API tổng hợp từng tháng )
  const [paymentGrowthByMonth, setPaymentGrowthByMonth] = React.useState<
    Array<{ month: string; tmckqt: number; foxie: number; vi: number }>
  >([]);
  const [loadingGrowth, setLoadingGrowth] = React.useState(true);
  const [compareFromDay, setCompareFromDay] = React.useState(1);
  const [compareToDay, setCompareToDay] = React.useState(31);
  const [compareMonth, setCompareMonth] = React.useState("");
  
  // New mode: 2 separate months with individual day ranges
  const [month1, setMonth1] = React.useState<string>("");
  const [month2, setMonth2] = React.useState<string>("");
  const [month1FromDay, setMonth1FromDay] = React.useState(1);
  const [month1ToDay, setMonth1ToDay] = React.useState(31);
  const [month2FromDay, setMonth2FromDay] = React.useState(1);
  const [month2ToDay, setMonth2ToDay] = React.useState(31);

  // Cache for individual months to avoid re-fetching
  const monthCacheRef = React.useRef<Map<string, {
    data: { month: string; tmckqt: number; foxie: number; vi: number };
    timestamp: number;
  }>>(new Map());

  React.useEffect(() => {
    monthCacheRef.current.clear();
    setPaymentGrowthByMonth([]);
  }, [selectedStockId]);

  // Monitor growth by payment success (placed after state declarations)
  useEffect(() => {
    if (
      !loadingGrowth &&
      paymentGrowthByMonth.length > 0 &&
      !notifiedDataRef.current.has("growth-by-payment")
    ) {
      showSuccess("✅ Dữ liệu tăng trưởng thanh toán đã được tải thành công!");
      notifiedDataRef.current.add("growth-by-payment");
      reportDataLoadSuccess("growth-by-payment", 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingGrowth, paymentGrowthByMonth]); // Functions are stable

  // Helper function to fetch a single month's data and update state
  const fetchSingleMonth = React.useCallback(async (
    monthKey: string,
    month: string,
    year: number
  ): Promise<{ month: string; tmckqt: number; foxie: number; vi: number }> => {
    // Check cache first
    const cached = monthCacheRef.current.get(monthKey);
    const now = Date.now();
    const cacheDuration = 10 * 60 * 1000; // 10 minutes
    if (cached && now - cached.timestamp < cacheDuration) {
      // Still update state if not already present
      setPaymentGrowthByMonth(prev => {
        if (prev.some(d => d.month === monthKey)) {
          return prev;
        }
        const updated = [...prev, cached.data].sort((a, b) => {
          const [mA, yA] = a.month.split("/").map(Number);
          const [mB, yB] = b.month.split("/").map(Number);
          if (yA !== yB) return yA - yB;
          return mA - mB;
        });
        return updated;
      });
      return cached.data;
    }

    // Fetch from API
    const lastDayOfMonth = new Date(year, Number(month), 0).getDate();
    const startDate = `01/${month}/${year}`;
    const endDate = `${lastDayOfMonth}/${month}/${year}`;

    const parse = (v: string | number | undefined) => {
      if (typeof v === "string") {
        return Number((v || "").replace(/[^\d.-]/g, "")) || 0;
      }
      return Number(v) || 0;
    };

    try {
      console.log(`[Dashboard] Fetching sales data for ${monthKey}:`, { startDate, endDate })
      const res = await ApiService.getDirect(
        `real-time/sales-summary-copied?dateStart=${startDate}&dateEnd=${endDate}${stockQueryParam}`
      );
      console.log(`[Dashboard] Successfully fetched sales data for ${monthKey}`)
      const parsed = res as {
        cash?: string | number;
        transfer?: string | number;
        card?: string | number;
        foxieUsageRevenue?: string | number;
        walletUsageRevenue?: string | number;
      };
      const data = {
        month: monthKey,
        tmckqt: parse(parsed.cash) + parse(parsed.transfer) + parse(parsed.card),
        foxie: Math.abs(parse(parsed.foxieUsageRevenue)),
        vi: Math.abs(parse(parsed.walletUsageRevenue)),
      };

      // Cache the data
      monthCacheRef.current.set(monthKey, {
        data,
        timestamp: Date.now(),
      });

      // Update state if month not already in paymentGrowthByMonth
      setPaymentGrowthByMonth(prev => {
        if (prev.some(d => d.month === monthKey)) {
          return prev; // Already exists
        }
        const updated = [...prev, data].sort((a, b) => {
          const [mA, yA] = a.month.split("/").map(Number);
          const [mB, yB] = b.month.split("/").map(Number);
          if (yA !== yB) return yA - yB;
          return mA - mB;
        });
        return updated;
      });

      return data;
    } catch (err) {
      console.error(`Failed to fetch sales data for ${monthKey}:`, err);
      return {
        month: monthKey,
        tmckqt: 0,
        foxie: 0,
        vi: 0,
      };
    }
  }, [stockQueryParam]);

  // Fetch only current month and previous month (lazy loading)
  React.useEffect(() => {
    let isSubscribed = true;
    async function fetchInitialMonths() {
      setLoadingGrowth(true);
      const dateNow = new Date();
      
      // Get current month
      const currentMonth = String(dateNow.getMonth() + 1).padStart(2, "0");
      const currentYear = dateNow.getFullYear();
      const currentMonthKey = `${currentMonth}/${currentYear}`;

      // Get previous month
      const prevDate = new Date(dateNow.getFullYear(), dateNow.getMonth() - 1, 1);
      const prevMonth = String(prevDate.getMonth() + 1).padStart(2, "0");
      const prevYear = prevDate.getFullYear();
      const prevMonthKey = `${prevMonth}/${prevYear}`;

      try {
        // Fetch only 2 months in parallel
        const [currentData, prevData] = await Promise.all([
          fetchSingleMonth(currentMonthKey, currentMonth, currentYear),
          fetchSingleMonth(prevMonthKey, prevMonth, prevYear),
        ]);

        if (isSubscribed) {
          const initialData = [prevData, currentData].sort((a, b) => {
            const [mA, yA] = a.month.split("/").map(Number);
            const [mB, yB] = b.month.split("/").map(Number);
            if (yA !== yB) return yA - yB;
            return mA - mB;
          });
          
          setPaymentGrowthByMonth(initialData);
          setCompareMonth(prevMonthKey); // Set default compare month to previous month
          setLoadingGrowth(false);
        }
      } catch (err) {
        console.error("Failed to fetch initial months:", err);
        if (isSubscribed) setLoadingGrowth(false);
      }
    }
    fetchInitialMonths();
    return () => {
      isSubscribed = false;
    };
  }, [fetchSingleMonth]);

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

      <div
        className="mb-3 sm:mb-6"
        ref={sectionRefs.current.dashboard_total_sale_table}
      >
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

          {/* KPI Chart */}
          <div
            ref={sectionRefs.current.dashboard_kpi}
            className={
              highlightKey === "dashboard_kpi"
                ? "ring-2 ring-[#41d1d9] rounded-lg"
                : ""
            }
          >
            <LazyLoadingWrapper type="chart" minHeight="400px">
              {/* Always show KPIChart - let it handle its own loading states internally */}
              <KPIChart
                kpiDailySeriesLoading={kpiDailySeriesLoading}
                kpiDailySeriesError={kpiDailySeriesError}
                dailyKpiGrowthData={dailyKpiGrowthData}
                kpiViewMode={kpiViewMode}
                setKpiViewMode={setKpiViewMode}
                currentDayForDaily={isDaily ? selectedDay : lastDay}
                currentPercentage={isDaily ? dailyPercentage : currentPercentage}
                dailyPercentageForCurrentDay={
                  isDaily ? dailyPercentage : currentPercentage
                }
                kpiMonthlyRevenueLoading={kpiMonthlyRevenueLoading}
                dailyRevenueLoading={dailyRevenueLoading}
                targetStatus={isDaily ? dailyStatus : monthlyStatus}
                monthlyTarget={COMPANY_MONTH_TARGET} // đây là Mục tiêu tháng này - có thể chỉnh sửa
                onMonthlyTargetChange={(target) => {
                  setUserMonthlyTarget(target);
                  localStorage.setItem('kpi_monthly_target', target.toString());
                }}
                specialHolidays={specialHolidays}
                onSpecialHolidaysChange={(days) => setSpecialHolidays(days)}
                dailyTargetForCurrentDay={isDaily ? dailyTargetForSelectedDay : dailyTargetForCurrentDay}
                dailyTargetForToday={
                  isDaily ? dailyTargetForSelectedDay : targetUntilNow
                } // Đến nay cần đạt: ngày hoặc tháng
                remainingTarget={isDaily ? dailyKpiLeft : remainingTarget}
                remainingDailyTarget={isDaily ? dailyKpiLeft : remainingTarget}
                dailyTargetPercentageForCurrentDay={
                  isDaily ? dailyPercentage : currentPercentage
                }
                currentRevenue={isDaily ? dailyKpiRevenue : currentRevenue}
              />
            </LazyLoadingWrapper>
          </div>

          {/* Bảng Tổng Doanh Số */}
          <div className="space-y-1">
            <LazyLoadingWrapper type="table" minHeight="300px">
              <ConditionalRender
                loading={salesLoading}
                error={salesError}
                data={salesSummaryData}
                fallback={
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
                      <div
                        key={i}
                        className="border border-[#f16a3f]/10 rounded-lg p-3"
                      >
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
                }
              >
                <TotalSaleTable
                  allPaymentMethods={paymentMethods}
                  totalRevenue={totalRevenue}
                />
              </ConditionalRender>
            </LazyLoadingWrapper>
            <LastUpdatedNote
              timestamp={summaryLastUpdatedAt}
              className="text-right"
            />
          </div>

          {/* Growth By Payment Chart */}
          <LazyLoadingWrapper type="chart" minHeight="450px">
            {loadingGrowth ? (
              <div className="w-full flex justify-center items-center min-h-[450px] rounded-lg bg-gray-50 text-[#41d1d9] text-lg font-semibold">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#41d1d9]"></div>
                  <span>Đang tải dữ liệu tăng trưởng...</span>
                </div>
              </div>
            ) : paymentGrowthByMonth.length === 0 ? (
              <div className="w-full flex justify-center items-center min-h-[450px] rounded-lg bg-gray-50 text-gray-600">
                Không có dữ liệu để hiển thị
              </div>
            ) : (
              <GrowthByPaymentChart
                data={paymentGrowthByMonth}
                compareFromDay={compareFromDay}
                compareToDay={compareToDay}
                compareMonth={compareMonth}
                setCompareFromDay={setCompareFromDay}
                setCompareToDay={setCompareToDay}
                setCompareMonth={setCompareMonth}
                onMonthSelect={fetchSingleMonth}
                // New mode props
                month1={month1}
                month2={month2}
                month1FromDay={month1FromDay}
                month1ToDay={month1ToDay}
                month2FromDay={month2FromDay}
                month2ToDay={month2ToDay}
                setMonth1={setMonth1}
                setMonth2={setMonth2}
                setMonth1FromDay={setMonth1FromDay}
                setMonth1ToDay={setMonth1ToDay}
                setMonth2FromDay={setMonth2FromDay}
                setMonth2ToDay={setMonth2ToDay}
              />
            )}
          </LazyLoadingWrapper>
        </div>

          {/* FOXIE BALANCE SECTION */}
          <div
            ref={sectionRefs.current.dashboard_foxie_balance}
            className={
              highlightKey === "dashboard_foxie_balance"
                ? "ring-2 ring-[#41d1d9] rounded-lg"
                : ""
            }
          >
            <LazyLoadingWrapper type="table" minHeight="200px">
              <ConditionalRender
                loading={foxieBalanceLoading}
                error={foxieBalanceError}
                data={foxieBalanceData}
              >
                <FoxieBalanceTable
                  foxieBalanceLoading={foxieBalanceLoading}
                  foxieBalanceError={foxieBalanceError}
                  foxieBalanceData={foxieBalanceData}
                />
              </ConditionalRender>
            </LazyLoadingWrapper>
            <LastUpdatedNote
              timestamp={foxieBalanceUpdatedAt}
              className="mt-1 text-right px-1"
            />
          </div>

          {/* CHI TIẾT DOANH THU SECTION */}
          <div
            ref={sectionRefs.current.dashboard_sale_detail}
            className={
              highlightKey === "dashboard_sale_detail"
                ? "ring-2 ring-[#41d1d9] rounded-lg"
                : ""
            }
          >
            <LazyLoadingWrapper type="table" minHeight="300px">
              <ConditionalRender
                loading={salesDetailLoading}
                error={salesDetailError}
                data={salesDetailData}
              >
                <SaleDetail
                  salesDetailLoading={salesDetailLoading}
                  salesDetailError={salesDetailError}
                  salesDetailData={salesDetailData}
                />
              </ConditionalRender>
            </LazyLoadingWrapper>
            <LastUpdatedNote
              timestamp={summaryLastUpdatedAt}
              className="mt-1 text-right px-1"
            />
          </div>

          {/* SALES BY HOUR SECTION */}
          <div
            ref={sectionRefs.current.dashboard_sales_by_hour}
            className={
              highlightKey === "dashboard_sales_by_hour"
                ? "ring-2 ring-[#41d1d9] rounded-lg"
                : ""
            }
          >
            <LazyLoadingWrapper type="table" minHeight="300px">
              <ConditionalRender
                loading={salesByHourLoading}
                error={salesByHourError}
                data={salesByHourData}
              >
                <SalesByHourTable
                  salesByHourLoading={salesByHourLoading}
                  salesByHourError={salesByHourError}
                  salesByHourData={salesByHourData}
                />
              </ConditionalRender>
            </LazyLoadingWrapper>
            <LastUpdatedNote
              timestamp={summaryLastUpdatedAt}
              className="mt-1 text-right px-1"
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


        {/* KHÁCH HÀNG SECTION */}
        <div
          ref={sectionRefs.current.dashboard_customer_section}
          className={
            highlightKey === "dashboard_customer_section"
              ? "ring-2 ring-[#41d1d9] rounded-lg"
              : ""
          }
        >
          <LazyLoadingWrapper type="section" minHeight="400px">
            <ConditionalRender
              loading={newCustomerLoading || oldCustomerLoading}
              error={newCustomerError || oldCustomerError}
              data={(newCustomerData || oldCustomerData) ? { newCustomerData, oldCustomerData } : null}
            >
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
            </ConditionalRender>
          </LazyLoadingWrapper>
          <LastUpdatedNote
            timestamp={summaryLastUpdatedAt}
            className="mt-1 text-right px-1"
          />
        </div>

        {/* ĐẶT LỊCH SECTION */}
        <div
          ref={sectionRefs.current.dashboard_booking_section}
          className={
            highlightKey === "dashboard_booking_section"
              ? "ring-2 ring-[#41d1d9] rounded-lg"
              : ""
          }
        >
          <LazyLoadingWrapper type="section" minHeight="300px">
            <ConditionalRender
              loading={bookingLoading}
              error={bookingError}
              data={bookingData}
            >
              <BookingSection
                bookingLoading={bookingLoading}
                bookingError={bookingError}
                bookingData={bookingData}
              />
            </ConditionalRender>
          </LazyLoadingWrapper>
          <LastUpdatedNote
            timestamp={summaryLastUpdatedAt}
            className="mt-1 text-right px-1"
          />
        </div>

         {/* BOOKING BY HOUR CHART */}
         <div ref={sectionRefs.current.dashboard_booking_by_hour}>
           <LazyLoadingWrapper type="chart" minHeight="300px">
             <ConditionalRender
               loading={bookingByHourLoading}
               error={bookingByHourError}
               data={bookingByHourData}
             >
               <BookingByHourChart
                 loading={bookingByHourLoading}
                 error={bookingByHourError}
                 data={bookingByHourData}
               />
             </ConditionalRender>
           </LazyLoadingWrapper>
           <LastUpdatedNote
             timestamp={summaryLastUpdatedAt}
             className="mt-1 text-right px-1"
           />
         </div>

        {/* DỊCH VỤ SECTION */}
        <div
          ref={sectionRefs.current.dashboard_service_section}
          className={
            highlightKey === "dashboard_service_section"
              ? "ring-2 ring-[#41d1d9] rounded-lg"
              : ""
          }
        >
          <LazyLoadingWrapper type="section" minHeight="400px">
            <ConditionalRender
              loading={bookingLoading || !serviceSummaryData || topServicesLoading}
              error={bookingError || serviceError || topServicesError}
              data={serviceSummaryData || topServicesData}
            >
              <ServiceSection
                bookingLoading={bookingLoading}
                bookingError={bookingError}
                bookingData={bookingData}
                serviceSummaryData={serviceSummaryData}
                topServiceItems={topServicesData}
              />
            </ConditionalRender>
          </LazyLoadingWrapper>
          <LastUpdatedNote
            timestamp={summaryLastUpdatedAt}
            className="mt-1 text-right px-1"
          />
        </div>

       
      </div>
    </div>
  );
}
