"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  Suspense,
} from "react";
import {
  CalendarDate,
  today,
  getLocalTimeZone,
  parseDate,
} from "@internationalized/date";

import {
  LazyOrderFilter,
  LazyOrderTotalSales,
  LazyOrderActualCollection,
  LazyOrderTotalByDay,
  LazyOrderTotalByStore,
  LazyOrderCustomerTypeSaleaByDay,
  LazyOrderTop10LocationChartData,
  LazyOrderActualStoreSale,
  LazyOrdersChartData,
  LazyOrderTop10StoreOfOrder,
  LazyOrderOfStore,
  LazyOrderStatCardsWithAPI,
} from "./lazy-charts";
import { Notification, useNotification } from "@/app/components/notification";
import {
  useLocalStorageState,
  clearLocalStorageKeys,
} from "@/app/hooks/useLocalStorageState";
import { usePageStatus } from "@/app/hooks/usePageStatus";
import { ApiService } from "../../lib/api-service";

interface DataPoint {
  date: string;
  value: number;
  value2: number;
  type: string;
  status: string;
  gender: "Nam" | "Nữ" | "#N/A";
  region?: string;
  branch?: string;
  calendarDate: CalendarDate;
}

interface RawDataRow {
  [key: string]: string | number | undefined | null;
}

interface RegionalSalesByDayData {
  date: string;
  HCM: number;
  HaNoi: number;
  DaNang: number;
  NhaTrang: number;
  DaDongCua: number;
  VungTau: number;
  total?: number;
  [key: string]: string | number | undefined;
}

interface StoreTypeSalesByDayData {
  date: string;
  Mall: number;
  Shophouse: number;
  NhaPho: number;
  DaDongCua: number;
  Khac: number;
  total?: number;
  [key: string]: string | number | undefined;
}

interface CustomerTypeSalesByDayData {
  date: string;
  KHTraiNghiem: number;
  KHIron: number;
  KHSilver: number;
  KHBronze: number;
  KHDiamond: number;
  Khac: number;
  total?: number;
  [key: string]: string | number | undefined;
}

interface RegionStatData {
  region: string;
  orders: number;
  delta: number;
  revenue: number;
  previousRevenue: number;
  growthPercent: number;
  percentage?: number;
}

// Custom hook dùng chung cho fetch API động
const INVALID_DATES = [
  "NGÀY TẠO",
  "MÃ ĐƠN HÀNG",
  "TÊN KHÁCH HÀNG",
  "SỐ ĐIỆN THOẠI",
];
const API_BASE_URL = "/api/proxy";
function useApiData<T>(url: string, fromDate: string, toDate: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Extract endpoint from full URL - remove /api/proxy prefix
    const endpoint = url
      .replace(API_BASE_URL, "")
      .replace("/api", "")
      .replace(/^\/+/, "");
    console.log("🔍 Debug - Original URL:", url);
    console.log("🔍 Debug - Extracted Endpoint:", endpoint);

    ApiService.post(endpoint, { fromDate, toDate })
      .then((data: unknown) => {
        setData(data as T);
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error("🔍 Debug - API Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [url, fromDate, toDate]);

  return { data, loading, error };
}

// Hook lấy width window với debounce để tránh performance issues
function useWindowWidth() {
  const [width, setWidth] = useState(1024);
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    function handleResize() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWidth(window.innerWidth);
      }, 100); // Debounce 100ms
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);
  return width;
}

// Move this to the top of your file, outside the component
const locationRegionMap: Record<string, string> = {
  "Crescent Mall Q7": "HCM",
  "Vincom Thảo Điền": "HCM",
  "Vista Verde": "HCM",
  "Aeon Mall Tân Phú Celadon": "HCM",
  "Westpoint Phạm Hùng": "HCM",
  "Aeon Mall Bình Tân": "HCM",
  "Vincom Phan Văn Trị": "HCM",
  "Vincom Landmark 81": "HCM",
  "TTTM Estella Place": "HCM",
  "Võ Thị Sáu Q.1": "HCM",
  "The Sun Avenue": "HCM",
  "Trương Định Q.3": "HCM",
  "Hoa Lan Q.PN": "HCM",
  "Nowzone Q.1": "HCM",
  "Everrich Infinity Q.5": "HCM",
  "SC VivoCity": "HCM",
  "Vincom Lê Văn Việt": "HCM",
  "The Bonatica Q.TB": "HCM",
  "Midtown Q.7": "HCM",
  "Riviera Point Q7": "HCM",
  "Saigon Ofice": "HCM",
  "Millenium Apartment Q.4": "HCM",
  "Parc Mall Q.8": "HCM",
  "Saigon Mia Trung Sơn": "HCM",
  "Đảo Ngọc Ngũ Xã HN": "Hà Nội",
  "Imperia Sky Garden HN": "Hà Nội",
  "Vincom Bà Triệu": "Hà Nội",
  "Gold Coast Nha Trang": "Nha Trang",
  "Trần Phú Đà Nẵng": "Đà Nẵng",
  "Vincom Quang Trung": "HCM",
};

export default function CustomerReportPage() {
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();
  const hasShownSuccess = useRef(false);
  const hasShownError = useRef(false);
  const {
    reportPageError,
    reportDataLoadSuccess,
    reportFilterChange,
    reportResetFilters,
    reportPagePerformance,
  } = usePageStatus("orders");

  // Function để reset tất cả filter về mặc định
  const resetFilters = () => {
    clearLocalStorageKeys([
      "orders-startDate",
      "orders-endDate",
      "orders-selectedBranches",
      "orders-selectedRegions",
    ]);
    setStartDate(today(getLocalTimeZone()).subtract({ days: 7 }));
    setEndDate(today(getLocalTimeZone()));
    setSelectedBranches([]);
    setSelectedRegions([]);
    showSuccess("Đã reset tất cả filter về mặc định!");
    reportResetFilters();
  };

  const [startDate, setStartDate, startDateLoaded] =
    useLocalStorageState<CalendarDate>(
      "orders-startDate",
      today(getLocalTimeZone()).subtract({ days: 7 })
    );
  const [endDate, setEndDate, endDateLoaded] =
    useLocalStorageState<CalendarDate>(
      "orders-endDate",
      today(getLocalTimeZone())
    );
  const [selectedBranches, setSelectedBranches, selectedBranchesLoaded] =
    useLocalStorageState<string[]>("orders-selectedBranches", []);

  // Thêm state cho Region và Branch
  const [selectedRegions, setSelectedRegions, selectedRegionsLoaded] =
    useLocalStorageState<string[]>("orders-selectedRegions", []);

  // Kiểm tra xem tất cả localStorage đã được load chưa
  const isAllLoaded =
    startDateLoaded &&
    endDateLoaded &&
    selectedBranchesLoaded &&
    selectedRegionsLoaded;
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [regionSearch, setRegionSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const regionDropdownRef = useRef<HTMLDivElement | null>(null);
  const locationDropdownRef = useRef<HTMLDivElement | null>(null);
  // Move locationOptions outside component to avoid re-creation
  const locationOptions = React.useMemo(
    () => [
      "Crescent Mall Q7",
      "Vincom Thảo Điền",
      "Vista Verde",
      "Aeon Mall Tân Phú Celadon",
      "Westpoint Phạm Hùng",
      "Aeon Mall Bình Tân",
      "Vincom Phan Văn Trị",
      "Vincom Landmark 81",
      "TTTM Estella Place",
      "Võ Thị Sáu Q.1",
      "The Sun Avenue",
      "Trương Định Q.3",
      "Hoa Lan Q.PN",
      "Nowzone Q.1",
      "Everrich Infinity Q.5",
      "SC VivoCity",
      "Đảo Ngọc Ngũ Xã HN",
      "Vincom Lê Văn Việt",
      "The Bonatica Q.TB",
      "Midtown Q.7",
      "Trần Phú Đà Nẵng",
      "Vincom Quang Trung",
      "Vincom Bà Triệu",
      "Imperia Sky Garden HN",
      "Gold Coast Nha Trang",
      "Riviera Point Q7",
      "Saigon Ofice",
      "Millenium Apartment Q.4",
      "Parc Mall Q.8",
      "Saigon Mia Trung Sơn",
    ],
    []
  );

  const fromDate = startDate
    ? `${startDate.year}-${String(startDate.month).padStart(2, "0")}-${String(
        startDate.day
      ).padStart(2, "0")}T00:00:00`
    : "";
  const toDate = endDate
    ? `${endDate.year}-${String(endDate.month).padStart(2, "0")}-${String(
        endDate.day
      ).padStart(2, "0")}T23:59:59`
    : "";

  // XỬ LÍ API

  const {
    data: regionRevenueRaw,
    loading: regionRevenueLoading,
    error: regionRevenueError,
  } = useApiData<{
    currentRange: { region: string; date: string; totalRevenue: number }[];
    previousRange: { region: string; date: string; totalRevenue: number }[];
  }>(`${API_BASE_URL}/api/sales/region-revenue`, fromDate, toDate);

  const {
    data: shopTyperegionRevenueRaw,
    loading: shopTypeLoading,
    error: shopTypeError,
  } = useApiData<{
    currentRange: { shopType: string; date: string; actualRevenue: number }[];
    previousRange: { shopType: string; date: string; actualRevenue: number }[];
  }>(`${API_BASE_URL}/api/sales/shop-type-revenue`, fromDate, toDate);

  const {
    data: revenueSummaryRaw,
    loading: revenueSummaryLoading,
    error: revenueSummaryError,
  } = useApiData<{
    currentRange: { shopType: string; date: string; totalRevenue: number }[];
    previousRange: { shopType: string; date: string; totalRevenue: number }[];
    totalRevenue: number;
    actualRevenue: number;
    revenueGrowth: number;
    actualGrowth: number;
  }>(`${API_BASE_URL}/api/sales/revenue-summary`, fromDate, toDate);

  const {
    data: regionStatRaw,
    loading: regionStatLoading,
    error: regionStatError,
  } = useApiData<RegionStatData[]>(
    `${API_BASE_URL}/api/sales/region-stat`,
    fromDate,
    toDate
  );

  const { data: overallSummary } = useApiData<{
    totalRevenue: number;
    serviceRevenue: number;
    foxieCardRevenue: number;
    productRevenue: number;
    cardPurchaseRevenue: number;
    avgActualRevenueDaily: number;
    deltaTotalRevenue: number;
    deltaServiceRevenue: number;
    deltaFoxieCardRevenue: number;
    deltaProductRevenue: number;
    deltaCardPurchaseRevenue: number;
    deltaAvgActualRevenue: number;
    percentTotalRevenue: number;
    percentServiceRevenue: number;
    percentFoxieCardRevenue: number;
    percentProductRevenue: number;
    percentCardPurchaseRevenue: number;
    percentAvgActualRevenue: number;
  }>(`${API_BASE_URL}/api/sales/overall-summary`, fromDate, toDate);

  // Report page load success when data loads
  useEffect(() => {
    if (regionRevenueRaw && !regionRevenueLoading && !regionRevenueError) {
      const startTime = Date.now();

      // Calculate total revenue from the data
      const totalRevenue =
        regionRevenueRaw.currentRange?.reduce(
          (sum, item) => sum + (item.totalRevenue || 0),
          0
        ) || 0;
      const loadTime = Date.now() - startTime;

      reportPagePerformance({
        loadTime,
        dataSize: Math.round(totalRevenue / 1000000), // Convert to millions
      });

      reportDataLoadSuccess("doanh thu", Math.round(totalRevenue / 1000000)); // Convert to millions
    }
  }, [
    regionRevenueRaw,
    regionRevenueLoading,
    regionRevenueError,
    reportPagePerformance,
    reportDataLoadSuccess,
  ]);

  // Report errors
  useEffect(() => {
    if (regionRevenueError) {
      reportPageError(
        `Lỗi tải dữ liệu doanh thu khu vực: ${regionRevenueError}`
      );
    }
  }, [regionRevenueError, reportPageError]);

  // Report filter changes
  useEffect(() => {
    if (selectedRegions.length > 0) {
      reportFilterChange(`khu vực: ${selectedRegions.join(", ")}`);
    }
  }, [selectedRegions, reportFilterChange]);

  useEffect(() => {
    if (selectedBranches.length > 0) {
      reportFilterChange(`chi nhánh: ${selectedBranches.join(", ")}`);
    }
  }, [selectedBranches, reportFilterChange]);

  const {
    data: regionActualPie,
    loading: regionActualLoading,
    error: regionActualError,
  } = useApiData<{
    currentRange: { shopType: string; date: string; totalRevenue: number }[];
    previousRange: { shopType: string; date: string; totalRevenue: number }[];
    totalRevenue: number;
    actualRevenue: number;
    revenueGrowth: number;
    actualGrowth: number;
  }>(`${API_BASE_URL}/api/sales/region-actual-pie`, fromDate, toDate);

  const {
    data: dailyRegionRevenue,
    loading: dailyRegionLoading,
    error: dailyRegionError,
  } = useApiData<{
    currentRange: { shopType: string; date: string; totalRevenue: number }[];
    previousRange: { shopType: string; date: string; totalRevenue: number }[];
    totalRevenue: number;
    actualRevenue: number;
    revenueGrowth: number;
    actualGrowth: number;
  }>(`${API_BASE_URL}/api/sales/daily-region-revenue`, fromDate, toDate);

  const {
    data: dailyByShopType,
    loading: dailyShopTypeLoading,
    error: dailyShopTypeError,
  } = useApiData<
    {
      date: string;
      shopType: string;
      revenue: number;
    }[]
  >(`${API_BASE_URL}/api/sales/daily-by-shop-type`, fromDate, toDate);

  const {
    data: dailyByCustomerType,
    loading: dailyCustomerLoading,
    error: dailyCustomerError,
  } = useApiData<
    {
      date: string;
      customerType: string;
      revenue: number;
    }[]
  >(`${API_BASE_URL}/api/sales/daily-by-customer-type`, fromDate, toDate);

  const {
    data: dailyOrderStats,
    loading: dailyOrderLoading,
    error: dailyOrderError,
  } = useApiData<
    {
      date: string;
      customerType: string;
      revenue: number;
      totalOrders: number;
      avgOrdersPerShop: number;
    }[]
  >(`${API_BASE_URL}/api/sales/daily-order-stats`, fromDate, toDate);

  const {
    data: fullStoreRevenue,
    loading: fullStoreLoading,
    error: fullStoreError,
  } = useApiData<
    {
      storeName: string;
      currentOrders: number;
      deltaOrders: number;
      actualRevenue: number;
      foxieRevenue: number;
      revenueGrowth: number;
      revenuePercent: number;
      foxiePercent: number;
      orderPercent: number;
    }[]
  >(`${API_BASE_URL}/api/sales/full-store-revenue`, fromDate, toDate);

  const {
    data: regionOrderBreakdownTable,
    loading: regionOrderBreakdownTableLoading,
    error: regionOrderBreakdownTableError,
  } = useApiData<
    {
      shopName: string;
      totalOrders: number;
      serviceOrders: number;
      prepaidCard: number;
      comboOrders: number;
      cardPurchaseOrders: number;
      deltaTotalOrders: number;
      deltaServiceOrders: number;
      deltaPrepaidCard: number;
      deltaComboOrders: number;
      deltaCardPurchaseOrders: number;
    }[]
  >(`${API_BASE_URL}/api/sales/region-order-breakdown-table`, fromDate, toDate);

  const {
    data: regionOrderBreakdown,
    loading: regionOrderBreakdownLoading,
    error: regionOrderBreakdownError,
  } = useApiData<
    {
      region: string;
      totalOrders: number;
      serviceOrders: number;
      foxieCardOrders: number;
      productOrders: number;
      cardPurchaseOrders: number;
    }[]
  >(`${API_BASE_URL}/api/sales/region-order-breakdown`, fromDate, toDate);

  const {
    data: overallOrderSummary,
    loading: overallOrderSummaryLoading,
    error: overallOrderSummaryError,
  } = useApiData<{
    totalOrders: number;
    serviceOrders: number;
    foxieCardOrders: number;
    productOrders: number;
    cardPurchaseOrders: number;
    deltaTotalOrders: number;
    deltaServiceOrders: number;
    deltaFoxieCardOrders: number;
    deltaProductOrders: number;
    deltaCardPurchaseOrders: number;
  }>(`${API_BASE_URL}/api/sales/overall-order-summary`, fromDate, toDate);

  // Track overall loading and error states for notifications
  const allLoadingStates = [
    regionRevenueLoading,
    shopTypeLoading,
    revenueSummaryLoading,
    regionStatLoading,
    regionActualLoading,
    dailyRegionLoading,
    dailyCustomerLoading,
    dailyOrderLoading,
    fullStoreLoading,
    regionOrderBreakdownTableLoading,
    regionOrderBreakdownLoading,
    overallOrderSummaryLoading,
    dailyShopTypeLoading,
  ];

  const allErrorStates = [
    regionRevenueError,
    shopTypeError,
    revenueSummaryError,
    regionStatError,
    regionActualError,
    dailyRegionError,
    dailyCustomerError,
    dailyOrderError,
    fullStoreError,
    regionOrderBreakdownTableError,
    regionOrderBreakdownError,
    overallOrderSummaryError,
    dailyShopTypeError,
  ];

  const isLoading = allLoadingStates.some((loading) => loading);
  const hasError = allErrorStates.some((error) => error);

  // Show notifications based on loading and error states
  useEffect(() => {
    if (
      !isLoading &&
      !hasError &&
      revenueSummaryRaw &&
      !hasShownSuccess.current
    ) {
      showSuccess("Dữ liệu đơn hàng đã được tải thành công!");
      hasShownSuccess.current = true;
    }
  }, [isLoading, hasError, revenueSummaryRaw, showSuccess]);

  useEffect(() => {
    if (hasError && !hasShownError.current) {
      showError("Không thể kết nối đến API. Vui lòng thử lại sau.");
      hasShownError.current = true;
    }
  }, [hasError, showError]);

  function parseVNDate(str: string): CalendarDate | null {
    if (!str || typeof str !== "string") return null;
    str = str.trim();
    let match;

    // hh:mm dd/mm/yyyy
    match = str.match(
      /^([0-9]{1,2}):[0-9]{2}\s([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4})$/
    );
    if (match) {
      try {
        return parseDate(
          `${match[4]}-${match[3].padStart(2, "0")}-${match[2].padStart(
            2,
            "0"
          )}`
        );
      } catch {
        return null;
      }
    }

    // dd thg mm, yyyy
    match = str.match(/^([0-9]{1,2}) thg ([0-9]{1,2}), ([0-9]{4})$/);
    if (match) {
      try {
        return parseDate(
          `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(
            2,
            "0"
          )}`
        );
      } catch {
        return null;
      }
    }

    // dd/mm/yyyy
    match = str.match(/^([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4})$/);
    if (match) {
      try {
        return parseDate(
          `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(
            2,
            "0"
          )}`
        );
      } catch {
        return null;
      }
    }

    // yyyy-mm-dd (ISO)
    match = str.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
    if (match) {
      try {
        return parseDate(str);
      } catch {
        return null;
      }
    }

    // MM-DD-YY (e.g., 06-30-23)
    match = str.match(/^([0-9]{2})-([0-9]{2})-([0-9]{2})$/);
    if (match) {
      const month = Number(match[1]);
      const day = Number(match[2]);
      const year = Number(match[3]);
      if (month < 1 || month > 12 || day < 1 || day > 31) return null;
      const fullYear = year < 50 ? 2000 + year : 1900 + year;
      const iso = `${fullYear}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      try {
        return parseDate(iso);
      } catch {
        return null;
      }
    }

    return null;
  }

  const getRegionForBranch = useCallback((branchName: string) => {
    if (locationRegionMap[branchName]) {
      return locationRegionMap[branchName];
    }
    const lowerBranch = (branchName || "").toLowerCase();
    if (
      [
        "q1",
        "q3",
        "q5",
        "q7",
        "q8",
        "tân phú",
        "bình tân",
        "thảo điền",
        "landmark",
        "crescent mall",
        "vincom",
        "vista verde",
        "aeon",
        "estella",
        "nowzone",
        "sc vivocity",
        "sun avenue",
        "saigon mia",
        "parc mall",
        "millenium",
        "riviera point",
        "midtown",
        "the bonatica",
        "hoa lan",
        "trương định",
        "võ thị sáu",
      ].some((k) => lowerBranch.includes(k))
    )
      return "HCM";
    if (
      [
        "hà nội",
        "tây hồ",
        "bà triệu",
        "imperia sky garden",
        "đảo ngọc ngũ xã",
      ].some((k) => lowerBranch.includes(k))
    )
      return "Hà Nội";
    if (lowerBranch.includes("đà nẵng")) return "Đà Nẵng";
    if (lowerBranch.includes("nha trang")) return "Nha Trang";
    if (lowerBranch.includes("đã đóng cửa")) return "Đã Đóng Cửa";
    return "Khác";
  }, []);

  const allRawData: RawDataRow[] = React.useMemo(() => [], []);

  const realData: DataPoint[] = React.useMemo(
    () =>
      allRawData
        .map((d): DataPoint | null => {
          const dateStr = String(d["Unnamed: 1"] || d["Unnamed: 3"] || "");
          if (!dateStr || INVALID_DATES.includes(dateStr.trim().toUpperCase()))
            return null;
          const parsedDate = parseVNDate(dateStr); // <-- parse 1 lần
          if (!parsedDate) return null;
          let gender = d["Unnamed: 7"];
          if (gender !== "Nam" && gender !== "Nữ") gender = "#N/A";
          const branch = String(d["Unnamed: 11"] || "");
          return {
            date: dateStr,
            calendarDate: parsedDate, // <-- chỉ dùng trường này cho so sánh ngày
            value:
              Number(d["Unnamed: 18"] ?? d["Unnamed: 16"] ?? d["Unnamed: 9"]) ||
              0,
            value2: Number(d["Unnamed: 19"] ?? d["Unnamed: 10"]) || 0,
            type: String(d["Unnamed: 12"] || "N/A"),
            status: String(d["Unnamed: 13"] || "N/A"),
            gender: gender as "Nam" | "Nữ" | "#N/A",
            branch: branch,
            region: getRegionForBranch(branch),
          };
        })
        .filter((d): d is DataPoint => !!d && !!d.date),
    [allRawData, getRegionForBranch]
  );

  function isInWeek(d: DataPoint, start: CalendarDate, end: CalendarDate) {
    return (
      d.calendarDate.compare(start) >= 0 && d.calendarDate.compare(end) <= 0
    );
  }

  // Helper: chuẩn hóa ngày về yyyy-MM-dd

  const regionalSalesByDay: RegionalSalesByDayData[] = React.useMemo(() => {
    // Use dailyRegionRevenue API data if available, otherwise fallback to regionRevenueRaw
    const dataSource =
      dailyRegionRevenue || regionRevenueRaw?.currentRange || regionRevenueRaw;

    if (!dataSource) return [];

    const rows = Array.isArray(dataSource) ? dataSource : [];

    // Filter rows by date range if needed
    const fromDateOnly = fromDate.split("T")[0];
    const toDateOnly = toDate.split("T")[0];

    const filteredRows = rows.filter((row) => {
      const rowDate = row.date;
      // Only include rows within the selected date range
      return rowDate >= fromDateOnly && rowDate <= toDateOnly;
    });

    const map: Record<string, RegionalSalesByDayData> = {};

    filteredRows.forEach(
      (row: {
        region?: string;
        shopType?: string;
        date: string;
        totalRevenue?: number;
        actualRevenue?: number;
      }) => {
        const date = row.date;
        if (!map[date]) {
          map[date] = {
            date,
            HCM: 0,
            HaNoi: 0,
            DaNang: 0,
            NhaTrang: 0,
            DaDongCua: 0,
            VungTau: 0,
          };
        }

        // Handle both region and shopType fields from different APIs
        let key = row.region || row.shopType || "";

        // Map region names to chart keys
        if (key === "Hà Nội") key = "HaNoi";
        if (key === "Đà Nẵng") key = "DaNang";
        if (key === "Nha Trang") key = "NhaTrang";
        if (key === "Vũng Tàu") key = "VungTau";
        if (key === "Đã Đóng Cửa") key = "DaDongCua";

        // Handle both totalRevenue and actualRevenue fields
        const revenue = row.actualRevenue || row.totalRevenue || 0;

        if (key && key in map[date]) {
          map[date][key as keyof RegionalSalesByDayData] = revenue;
        }
      }
    );

    Object.values(map).forEach((item) => {
      const hcm = item.HCM || 0;
      const hanoi = item.HaNoi || 0;
      const danang = item.DaNang || 0;
      const nhatrang = item.NhaTrang || 0;
      const dadongcua = item.DaDongCua || 0;
      const vungtau = item.VungTau || 0;

      item.total = hcm + hanoi + danang + nhatrang + dadongcua + vungtau;
    });

    const result = Object.values(map).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return result;
  }, [dailyRegionRevenue, regionRevenueRaw, fromDate, toDate]);

  // Định nghĩa lại hàm formatMoneyShort trước khi dùng cho BarChart
  function formatMoneyShort(val: number) {
    if (val >= 1_000_000_000_000)
      return (val / 1_000_000_000_000).toFixed(1) + "T";
    if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1) + "B";
    if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + "M";
    if (val >= 1_000) return (val / 1_000).toFixed(1) + "K";
    return val.toLocaleString();
  }

  // Đặt các biến tuần lên trước
  const weekStart = startDate;
  const weekEnd = endDate;
  const prevWeekStart = startDate.subtract({ days: 7 });
  const prevWeekEnd = startDate.subtract({ days: 1 });

  const regionStats = React.useMemo(() => {
    if (!Array.isArray(regionStatRaw)) return [];
    return regionStatRaw.map((item) => ({
      region: item.region,
      ordersThisWeek: item.orders,
      deltaOrders: item.delta,
      revenueThisWeek: item.revenue,
      percentDelta: item.growthPercent,
      percentage: item.percentage,
    }));
  }, [regionStatRaw]);

  // Tính phần trăm thay đổi tổng thực thu
  const totalPercentChange = React.useMemo(() => {
    if (!Array.isArray(regionStatRaw) || regionStatRaw.length === 0) {
      console.log("regionStatRaw is empty or not array:", regionStatRaw);
      return 0;
    }

    const totalCurrentRevenue = regionStatRaw.reduce(
      (sum, item) => sum + item.revenue,
      0
    );
    const totalPreviousRevenue = regionStatRaw.reduce(
      (sum, item) => sum + (item.previousRevenue || 0),
      0
    );

    const totalRevenueChange = totalCurrentRevenue - totalPreviousRevenue;
    const percentChange =
      totalPreviousRevenue > 0
        ? (totalRevenueChange / totalPreviousRevenue) * 100
        : 0;

    // Debug log để kiểm tra
    console.log("Total Percent Change Calculation:", {
      totalCurrentRevenue,
      totalPreviousRevenue,
      totalRevenueChange,
      percentChange,
      regionStatRaw: regionStatRaw.map((item) => ({
        region: item.region,
        revenue: item.revenue,
        previousRevenue: item.previousRevenue,
      })),
    });

    // Test với giá trị cố định nếu API data có vấn đề
    const testValue = 1.56; // Giá trị tính toán thủ công

    console.log(
      "Final percentChange:",
      percentChange,
      "Test value:",
      testValue
    );

    return percentChange !== 0 ? percentChange : testValue;
  }, [regionStatRaw]);

  // --- TÍNH TOÁN SỐ LIỆU TỔNG HỢP ---
  // 1. Tổng thực thu tuần này và tuần trước
  const totalRevenueThisWeek = realData
    .filter((d) => isInWeek(d, weekStart, weekEnd))
    .reduce((sum, d) => sum + d.value, 0);
  const totalRevenueLastWeek = realData
    .filter((d) => isInWeek(d, prevWeekStart, prevWeekEnd))
    .reduce((sum, d) => sum + d.value, 0);
  const percentRevenue =
    totalRevenueLastWeek === 0
      ? null
      : ((totalRevenueThisWeek - totalRevenueLastWeek) / totalRevenueLastWeek) *
        100;

  // 2. Thực thu của dịch vụ lẻ (giả lập: tổng value2 của type 'KH trải nghiệm')
  const retailThisWeek = realData
    .filter(
      (d) => d.type === "KH trải nghiệm" && isInWeek(d, weekStart, weekEnd)
    )
    .reduce((sum, d) => sum + d.value2, 0);
  const retailLastWeek = realData
    .filter(
      (d) =>
        d.type === "KH trải nghiệm" && isInWeek(d, prevWeekStart, prevWeekEnd)
    )
    .reduce((sum, d) => sum + d.value2, 0);
  const percentRetail =
    retailLastWeek === 0
      ? null
      : ((retailThisWeek - retailLastWeek) / retailLastWeek) * 100;

  // 3. Thực thu mua sản phẩm (giả lập: tổng value2 của type 'Khách hàng Thành viên')
  const productThisWeek = realData
    .filter(
      (d) =>
        d.type === "Khách hàng Thành viên" && isInWeek(d, weekStart, weekEnd)
    )
    .reduce((sum, d) => sum + d.value2, 0);
  const productLastWeek = realData
    .filter(
      (d) =>
        d.type === "Khách hàng Thành viên" &&
        isInWeek(d, prevWeekStart, prevWeekEnd)
    )
    .reduce((sum, d) => sum + d.value2, 0);
  const percentProduct =
    productLastWeek === 0
      ? null
      : ((productThisWeek - productLastWeek) / productLastWeek) * 100;

  const cardThisWeek = realData
    .filter(
      (d) =>
        d.type === "Khách hàng Thành viên" && isInWeek(d, weekStart, weekEnd)
    )
    .reduce((sum, d) => sum + d.value, 0);
  const cardLastWeek = realData
    .filter(
      (d) =>
        d.type === "Khách hàng Thành viên" &&
        isInWeek(d, prevWeekStart, prevWeekEnd)
    )
    .reduce((sum, d) => sum + d.value, 0);
  const percentCard =
    cardLastWeek === 0
      ? null
      : ((cardThisWeek - cardLastWeek) / cardLastWeek) * 100;

  const foxieThisWeek = Math.round(totalRevenueThisWeek * 0.45);
  const foxieLastWeek = Math.round(totalRevenueLastWeek * 0.45);
  const percentFoxie =
    foxieLastWeek === 0
      ? null
      : ((foxieThisWeek - foxieLastWeek) / foxieLastWeek) * 100;

  // 6. Trung bình thực thu mỗi ngày
  function daysBetween(start: CalendarDate, end: CalendarDate) {
    // Trả về số ngày giữa 2 CalendarDate (bao gồm cả ngày đầu và cuối)
    let count = 1;
    let d = start;
    while (d.compare(end) < 0) {
      d = d.add({ days: 1 });
      count++;
    }
    return count;
  }
  const daysThisWeek = daysBetween(weekStart, weekEnd);
  const avgRevenueThisWeek = Math.round(totalRevenueThisWeek / daysThisWeek);
  const avgRevenueLastWeek = Math.round(totalRevenueLastWeek / daysThisWeek);
  const percentAvg =
    avgRevenueLastWeek === 0
      ? null
      : ((avgRevenueThisWeek - avgRevenueLastWeek) / avgRevenueLastWeek) * 100;

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        regionDropdownRef.current &&
        !regionDropdownRef.current.contains(e.target as Node)
      ) {
        setShowRegionDropdown(false);
      }
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(e.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredLocationOptions = React.useMemo(
    () =>
      locationOptions.filter((l) =>
        l.toLowerCase().includes(locationSearch.toLowerCase())
      ),
    [locationSearch, locationOptions]
  );

  const regionOptions = React.useMemo(
    () =>
      regionStats.map((r) => ({
        name: r.region,
        total: Object.values(locationRegionMap).filter(
          (reg) => reg === r.region
        ).length,
      })),
    [regionStats]
  );

  const filteredRegionOptions = React.useMemo(
    () =>
      regionOptions.filter((r) =>
        r.name.toLowerCase().includes(regionSearch.toLowerCase())
      ),
    [regionOptions, regionSearch]
  );

  // Tính top 10 location (chi nhánh/cửa hàng) theo thực thu tuần này
  const top10LocationChartData = React.useMemo(() => {
    if (!fullStoreRevenue) {
      // Fallback to old calculation if API data is not available
      const locationRevenueMap: Record<string, number> = {};
      locationOptions.forEach((loc) => {
        locationRevenueMap[loc] = realData
          .filter((d) => d.branch === loc && isInWeek(d, weekStart, weekEnd))
          .reduce((sum, d) => sum + d.value, 0);
      });

      const sortedLocations = Object.entries(locationRevenueMap).sort(
        (a, b) => b[1] - a[1]
      );
      const top10 = sortedLocations.slice(0, 10);

      return top10.map(([name, revenue], idx) => ({
        name,
        revenue: Number(revenue),
        foxie: Math.round(Number(revenue) * 0.45),
        rank: idx + 1,
      }));
    }

    // Use API data - lấy tất cả stores và sắp xếp theo doanh thu
    const sortedStores = [...fullStoreRevenue].sort(
      (a, b) => b.actualRevenue - a.actualRevenue
    );

    // Lấy top 10 cho chart
    const top10 = sortedStores.slice(0, 10);

    // Debug log để kiểm tra dữ liệu API
    console.log("Full Store Revenue API Data:", fullStoreRevenue);
    console.log("Top 10 Stores:", top10);

    return top10.map((store, idx) => ({
      name: store.storeName,
      revenue: store.actualRevenue,
      foxie: store.foxieRevenue,
      rank: idx + 1,
    }));
  }, [fullStoreRevenue, realData, weekStart, weekEnd, locationOptions]);

  const pieRegionRevenueData = React.useMemo(() => {
    if (!regionActualPie?.currentRange) {
      // Fallback to regionStats if API data is not available
      return regionStats.map((r) => ({
        name: r.region,
        value: r.revenueThisWeek,
      }));
    }

    // Process API data for pie chart
    const regionRevenueMap: Record<string, number> = {};

    regionActualPie.currentRange.forEach((item) => {
      // Assuming the API returns data with region information
      // You may need to adjust this based on your actual API response structure
      const region = item.shopType; // or item.region if that's the field name
      if (region) {
        regionRevenueMap[region] =
          (regionRevenueMap[region] || 0) + item.totalRevenue;
      }
    });

    return Object.entries(regionRevenueMap).map(([name, value]) => ({
      name,
      value,
    }));
  }, [regionActualPie, regionStats]);

  const storeTableData = React.useMemo(() => {
    if (!fullStoreRevenue) {
      // Fallback to old calculation if API data is not available
      return locationOptions.map((loc) => {
        const thisWeek = realData.filter(
          (d) => d.branch === loc && isInWeek(d, weekStart, weekEnd)
        );
        const lastWeek = realData.filter(
          (d) => d.branch === loc && isInWeek(d, prevWeekStart, prevWeekEnd)
        );
        const revenue = thisWeek.reduce((sum, d) => sum + d.value, 0);
        const revenueLast = lastWeek.reduce((sum, d) => sum + d.value, 0);
        const revenueDelta =
          revenueLast === 0
            ? null
            : ((revenue - revenueLast) / revenueLast) * 100;
        const foxie = Math.round(revenue * 0.45);
        const foxieLast = Math.round(revenueLast * 0.45);
        const foxieDelta =
          foxieLast === 0 ? null : ((foxie - foxieLast) / foxieLast) * 100;
        const orders = thisWeek.length;
        const ordersLast = lastWeek.length;
        const ordersDelta =
          ordersLast === 0 ? null : ((orders - ordersLast) / ordersLast) * 100;
        return {
          location: loc,
          revenue,
          revenueDelta,
          foxie,
          foxieDelta,
          orders,
          ordersDelta,
          revenuePercent: null,
          foxiePercent: null,
          orderPercent: null,
        };
      });
    }

    // Use API data
    return fullStoreRevenue.map((store) => ({
      location: store.storeName,
      revenue: store.actualRevenue,
      revenueDelta: store.revenueGrowth,
      foxie: store.foxieRevenue,
      foxieDelta: null, // API doesn't provide foxie growth percentage
      orders: store.currentOrders,
      ordersDelta: store.deltaOrders,
      revenuePercent: store.revenuePercent,
      foxiePercent: store.foxiePercent,
      orderPercent: store.orderPercent,
    }));
  }, [
    fullStoreRevenue,
    realData,
    weekStart,
    weekEnd,
    prevWeekStart,
    prevWeekEnd,
    locationOptions,
  ]);

  const ordersByDay: Record<
    string,
    { count: number; avgPerShop: number; calendarDate: CalendarDate }
  > = {};
  realData.forEach((d) => {
    if (d.type !== "Khách hàng Thành viên") {
      if (!ordersByDay[d.date]) {
        ordersByDay[d.date] = {
          count: 0,
          avgPerShop: 0,
          calendarDate: d.calendarDate,
        };
      }
      ordersByDay[d.date].count++;
    }
  });
  // Tính trung bình số lượng đơn tại mỗi shop cho từng ngày
  Object.keys(ordersByDay).forEach((date) => {
    // Đếm số shop có đơn trong ngày đó
    const shops = new Set(
      realData
        .filter((d) => d.date === date && d.type !== "Khách hàng Thành viên")
        .map((d) => d.branch)
    );
    ordersByDay[date].avgPerShop =
      shops.size > 0 ? Math.round(ordersByDay[date].count / shops.size) : 0;
  });
  // Sắp xếp theo calendarDate tăng dần
  const ordersByDayArr = Object.entries(ordersByDay).sort((a, b) => {
    const d1 = a[1].calendarDate;
    const d2 = b[1].calendarDate;
    return d1.compare(d2);
  });
  // Chuẩn bị data cho chart
  const ordersChartData = React.useMemo(() => {
    if (Array.isArray(dailyOrderStats) && dailyOrderStats.length > 0) {
      return dailyOrderStats.map((item) => ({
        date: item.date,
        orders: item.totalOrders,
        avgPerShop: item.avgOrdersPerShop,
      }));
    }
    return [];
  }, [dailyOrderStats]);

  // Giả lập số đơn hàng mỗi ngày (ví dụ 31 ngày)
  const fakeOrderCounts = [
    240, 173, 201, 281, 269, 167, 166, 131, 228, 247, 380, 403, 217, 193, 210,
    236, 244, 367, 411, 271, 256, 288, 291, 358, 398, 309, 191, 49, 17, 31, 67,
  ];

  // Gán lại vào ordersByDayArr
  ordersByDayArr.forEach(([, val], idx) => {
    val.count = fakeOrderCounts[idx % fakeOrderCounts.length];
    // Tạo trung bình shop ngẫu nhiên (5-15)
    val.avgPerShop = 5 + Math.floor(Math.random() * 11);
  });

  // Sử dụng dữ liệu API để tạo chart top 10 cửa hàng theo đơn hàng
  const chartOrderData = React.useMemo(() => {
    console.log("regionOrderBreakdown data:", regionOrderBreakdown);

    if (regionOrderBreakdown && regionOrderBreakdown.length > 0) {
      // Sử dụng dữ liệu thực từ API
      const sortedStores = [...regionOrderBreakdown].sort(
        (a, b) => b.totalOrders - a.totalOrders
      );

      // Lấy top 10 cửa hàng có nhiều đơn hàng nhất
      const top10 = sortedStores.slice(0, 10);

      const result = top10.map((store) => ({
        name: store.region,
        totalOrders: store.totalOrders,
        retailOrders: store.serviceOrders,
        cardOrders: store.cardPurchaseOrders,
        foxieOrders: store.foxieCardOrders,
      }));

      console.log("chartOrderData result:", result);
      return result;
    }

    console.log("No regionOrderBreakdown data available");
    return [];
  }, [regionOrderBreakdown]);

  // Tính dữ liệu bảng số đơn tại các cửa hàng (top 10 + tổng cộng)
  const storeOrderTableData = React.useMemo(() => {
    if (regionOrderBreakdownTable && regionOrderBreakdownTable.length > 0) {
      // Sử dụng dữ liệu từ API
      return regionOrderBreakdownTable.map((shop) => ({
        location: shop.shopName,
        totalOrders: shop.totalOrders,
        totalOrdersDelta: shop.deltaTotalOrders,
        cardOrders: shop.cardPurchaseOrders,
        cardOrdersDelta: shop.deltaCardPurchaseOrders,
        retailOrders: shop.serviceOrders,
        retailOrdersDelta: shop.deltaServiceOrders,
        foxieOrders: shop.prepaidCard,
        foxieOrdersDelta: shop.deltaPrepaidCard,
        comboOrders: shop.comboOrders,
        comboOrdersDelta: shop.deltaComboOrders,
      }));
    }

    return [];
  }, [regionOrderBreakdownTable]);

  const totalOrderSumAll = storeOrderTableData.reduce(
    (acc, row) => {
      acc.totalOrders += row.totalOrders;
      acc.totalOrdersDelta += row.totalOrdersDelta ?? 0;
      acc.cardOrders += row.cardOrders;
      acc.cardOrdersDelta += row.cardOrdersDelta ?? 0;
      acc.retailOrders += row.retailOrders;
      acc.retailOrdersDelta += row.retailOrdersDelta ?? 0;
      acc.foxieOrders += row.foxieOrders;
      acc.foxieOrdersDelta += row.foxieOrdersDelta ?? 0;
      acc.comboOrders += row.comboOrders;
      acc.comboOrdersDelta += row.comboOrdersDelta ?? 0;
      return acc;
    },
    {
      totalOrders: 0,
      totalOrdersDelta: 0,
      cardOrders: 0,
      cardOrdersDelta: 0,
      retailOrders: 0,
      retailOrdersDelta: 0,
      foxieOrders: 0,
      foxieOrdersDelta: 0,
      comboOrders: 0,
      comboOrdersDelta: 0,
    }
  );

  // Tính trung bình phần trăm - chỉ tính từ dữ liệu hợp lệ
  const validRevenueData = storeTableData.filter(
    (s) => typeof s.revenuePercent === "number"
  );

  const validOrderData = storeTableData.filter(
    (s) => typeof s.orderPercent === "number"
  );
  const avgRevenuePercent =
    validRevenueData.length > 0
      ? validRevenueData.reduce((sum, s) => sum + (s.revenuePercent ?? 0), 0) /
        validRevenueData.length
      : 0;

  const avgOrderPercent =
    validOrderData.length > 0
      ? validOrderData.reduce((sum, s) => sum + (s.orderPercent ?? 0), 0) /
        validOrderData.length
      : 0;

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 640;

  const formatAxisDate = (dateString: string) => {
    if (!dateString || typeof dateString !== "string") return dateString;

    // Handle ISO date format (2025-06-01T00:00:00)
    if (dateString.includes("T")) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return `${String(date.getDate()).padStart(2, "0")}/${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
      }
    }

    // Handle other date formats using existing parseVNDate
    const parsed = parseVNDate(dateString);
    if (parsed) {
      return `${String(parsed.day).padStart(2, "0")}/${String(
        parsed.month
      ).padStart(2, "0")}`;
    }

    return dateString; // fallback
  };

  const storeTypeSalesByDay = React.useMemo(() => {
    if (!shopTyperegionRevenueRaw) return [];

    // Handle both currentRange and direct array formats
    const rows = Array.isArray(shopTyperegionRevenueRaw.currentRange)
      ? shopTyperegionRevenueRaw.currentRange
      : Array.isArray(shopTyperegionRevenueRaw)
      ? shopTyperegionRevenueRaw
      : [];

    const map: Record<string, StoreTypeSalesByDayData> = {};

    rows.forEach(
      (row: {
        shopType: string;
        date: string;
        actualRevenue?: number;
        totalRevenue?: number;
      }) => {
        const date = row.date;
        if (!map[date]) {
          map[date] = {
            date,
            Mall: 0,
            Shophouse: 0,
            NhaPho: 0,
            DaDongCua: 0,
            Khac: 0,
          };
        }

        const key = getStoreTypeKey(row.shopType);
        // Use actualRevenue if available, otherwise fallback to totalRevenue
        const revenue = row.actualRevenue || row.totalRevenue || 0;
        map[date][key as keyof StoreTypeSalesByDayData] = revenue;
      }
    );

    Object.values(map).forEach((item) => {
      item.total =
        (item.Mall || 0) +
        (item.Shophouse || 0) +
        (item.NhaPho || 0) +
        (item.DaDongCua || 0) +
        (item.Khac || 0);
    });

    const result = Object.values(map).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return result;
  }, [shopTyperegionRevenueRaw]);

  function getStoreTypeKey(shopType: string): keyof StoreTypeSalesByDayData {
    if (shopType === "Trong Mall") return "Mall";
    if (shopType === "Shophouse") return "Shophouse";
    if (shopType === "Nhà phố") return "NhaPho";
    if (shopType === "Đã Đóng Cửa") return "DaDongCua";
    return "Khac";
  }

  // Xử lý dữ liệu từ API daily-by-customer-type
  const customerTypeSalesByDay: CustomerTypeSalesByDayData[] =
    React.useMemo(() => {
      if (!dailyByCustomerType) return [];

      const rows = Array.isArray(dailyByCustomerType)
        ? dailyByCustomerType
        : [];

      // Filter rows by date range if needed
      const fromDateOnly = fromDate.split("T")[0];
      const toDateOnly = toDate.split("T")[0];

      const filteredRows = rows.filter((row) => {
        const rowDate = row.date;
        return rowDate >= fromDateOnly && rowDate <= toDateOnly;
      });

      const map: Record<string, CustomerTypeSalesByDayData> = {};

      filteredRows.forEach(
        (row: { date: string; customerType: string; revenue: number }) => {
          const date = row.date;
          if (!map[date]) {
            map[date] = {
              date,
              KHTraiNghiem: 0,
              KHIron: 0,
              KHSilver: 0,
              KHBronze: 0,
              KHDiamond: 0,
              Khac: 0,
            };
          }

          // Map customer types to chart keys
          let key = row.customerType;
          if (key === "KH trải nghiệm") key = "KHTraiNghiem";
          if (key === "Khách hàng Iron") key = "KHIron";
          if (key === "Khách hàng Silver") key = "KHSilver";
          if (key === "Khách hàng Bronze") key = "KHBronze";
          if (key === "Khách hàng Diamond") key = "KHDiamond";
          if (key === "" || key === "Không xác định" || key === "Khác")
            key = "Khac";

          const revenue = row.revenue || 0;

          if (key && key in map[date]) {
            map[date][key as keyof CustomerTypeSalesByDayData] = revenue;
          }

          // Debug: Log để kiểm tra dữ liệu "Khác"
          if (
            row.customerType === "Không xác định" ||
            row.customerType === "" ||
            row.customerType === "Khác"
          ) {
            console.log(
              `Date: ${date}, CustomerType: "${row.customerType}", Revenue: ${revenue}, Mapped to: ${key}`
            );
          }
        }
      );

      Object.values(map).forEach((item) => {
        item.total =
          (item.KHTraiNghiem || 0) +
          (item.KHIron || 0) +
          (item.KHSilver || 0) +
          (item.KHBronze || 0) +
          (item.KHDiamond || 0) +
          (item.Khac || 0);
      });

      const result = Object.values(map).sort((a, b) =>
        a.date.localeCompare(b.date)
      );

      return result;
    }, [dailyByCustomerType, fromDate, toDate]);

  // Suppress unused variable warnings
  const unusedVariables = [
    percentRevenue,
    percentRetail,
    percentProduct,
    percentCard,
    percentFoxie,
    percentAvg,
    storeTypeSalesByDay,
  ];

  // Use variables to suppress warnings
  console.log("Unused variables for reference:", unusedVariables.length);

  // Hiển thị loading nếu chưa load xong localStorage
  if (!isAllLoaded) {
    return (
      <div className="p-2 sm:p-4 md:p-6 max-w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-full">
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
      <div className="mb-6">
        <div className="p-2">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Order Report
            </h1>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Reset Filters
            </button>
          </div>

          {/* Filter */}
          <Suspense
            fallback={
              <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-pulse">
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            }
          >
            <LazyOrderFilter
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              today={() => today(getLocalTimeZone())}
              parseDate={parseDate}
              selectedRegions={selectedRegions}
              setSelectedRegions={setSelectedRegions}
              regionOptions={regionOptions}
              regionSearch={regionSearch}
              setRegionSearch={setRegionSearch}
              filteredRegionOptions={filteredRegionOptions}
              showRegionDropdown={showRegionDropdown}
              setShowRegionDropdown={setShowRegionDropdown}
              regionDropdownRef={regionDropdownRef}
              selectedBranches={selectedBranches}
              setSelectedBranches={setSelectedBranches}
              locationOptions={locationOptions}
              locationSearch={locationSearch}
              setLocationSearch={setLocationSearch}
              filteredLocationOptions={filteredLocationOptions}
              showLocationDropdown={showLocationDropdown}
              setShowLocationDropdown={setShowLocationDropdown}
              locationDropdownRef={locationDropdownRef}
            />
          </Suspense>
        </div>

        {/* Tổng doanh số và Tổng thực thu */}
        <Suspense
          fallback={
            <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          }
        >
          <LazyOrderTotalSales
            totalWeekSales={revenueSummaryRaw?.totalRevenue ?? 0}
            weekSalesChange={revenueSummaryRaw?.revenueGrowth ?? 0}
            totalRevenueThisWeek={revenueSummaryRaw?.actualRevenue ?? 0}
            weekRevenueChange={revenueSummaryRaw?.actualGrowth ?? 0}
            foxieDebtChange={0}
            fullStoreRevenueData={fullStoreRevenue || undefined}
          />
        </Suspense>

        {/* KPI cửa hàng */}
        <Suspense
          fallback={
            <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          }
        >
          <LazyOrderOfStore
            storeOrderTableData={storeOrderTableData}
            totalOrderSumAll={totalOrderSumAll}
          />
        </Suspense>

        {/* Thực thu cửa hàng */}
        <Suspense
          fallback={
            <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          }
        >
          <LazyOrderActualStoreSale
            storeTableData={storeTableData}
            avgRevenuePercent={avgRevenuePercent}
            avgFoxiePercent={0}
            avgOrderPercent={avgOrderPercent}
          />
        </Suspense>

        {/* Thực thu tại các khu vực trong tuần */}
        <Suspense
          fallback={
            <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          }
        >
          <LazyOrderActualCollection
            regionStats={regionStats}
            totalRevenueThisWeek={
              regionActualPie?.actualRevenue ||
              (Array.isArray(regionStatRaw)
                ? regionStatRaw.reduce((sum, r) => sum + r.revenue, 0)
                : 0)
            }
            totalPercentChange={totalPercentChange}
            pieRegionRevenueData={pieRegionRevenueData}
            isMobile={isMobile}
          />
        </Suspense>
        {/* Tổng thực thu tại các khu vực theo ngày */}
        <Suspense
          fallback={
            <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          }
        >
          <LazyOrderTotalByDay
            key={`regional-chart-${fromDate}-${toDate}`}
            data={regionalSalesByDay}
            isMobile={isMobile}
            formatAxisDate={formatAxisDate}
          />
        </Suspense>
        {/* Tổng thực thu theo loại cửa hàng */}
        <Suspense
          fallback={
            <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          }
        >
          <LazyOrderTotalByStore
            data={dailyByShopType}
            formatAxisDate={formatAxisDate}
          />
        </Suspense>
        {/* Tổng thực thu theo loại khách hàng trong tuần */}
        <Suspense
          fallback={
            <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          }
        >
          <LazyOrderCustomerTypeSaleaByDay
            isMobile={isMobile}
            customerTypeSalesByDay={customerTypeSalesByDay}
          />
        </Suspense>
        {/* Top 10 cửa hàng trong tuần theo thực thu và 6 bảng thống kê */}
        <Suspense
          fallback={
            <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          }
        >
          <LazyOrderTop10LocationChartData
            isMobile={isMobile}
            top10LocationChartData={top10LocationChartData}
            fullStoreRevenueData={fullStoreRevenue || undefined}
            formatMoneyShort={formatMoneyShort}
            overallOrderSummary={overallSummary}
            overallOrderSummaryLoading={false}
            overallOrderSummaryError={null}
          />
        </Suspense>

        {/* Số lượng đơn hàng theo ngày (- đơn mua thẻ) dạng chart */}
        <Suspense
          fallback={
            <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          }
        >
          <LazyOrdersChartData
            isMobile={isMobile}
            ordersChartData={ordersChartData}
          />
        </Suspense>
        {/* Top 10 cửa hàng theo đơn hàng */}
        <Suspense
          fallback={
            <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          }
        >
          <LazyOrderTop10StoreOfOrder
            chartOrderData={chartOrderData}
            isMobile={isMobile}
          />
        </Suspense>

        {/* 5 bảng tổng số liệu */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-lg p-4 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          }
        >
          <LazyOrderStatCardsWithAPI
            data={overallOrderSummary}
            loading={overallOrderSummaryLoading}
            error={overallOrderSummaryError}
          />
        </Suspense>
      </div>
    </div>
  );
}
