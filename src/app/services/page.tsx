"use client";
import React from "react";
import { useState, useEffect, useRef } from "react";
import {
  CalendarDate,
  today,
  getLocalTimeZone,
  parseDate,
} from "@internationalized/date";

import ServicesFilter from "./ServicesFilter";
import WeeklyServiceChartData from "./ServiceWeeklyChartData";
import PieChartData from "./ServicePieChartData";
import ServiceBottomPieData from "./ServiceBottomPieData";
import ServiceStatCards from "./ServiceStatCards";
import ServiceStoreChartData from "./ServiceStoreChartData";
import ServicesRegionData from "./ServicesRegionData";
import ServicesTable from "./ServicesTable";
import { Notification, useNotification } from "@/components/notification";
import {
  useLocalStorageState,
  clearLocalStorageKeys,
} from "@/hooks/useLocalStorageState";
import { usePageStatus } from "@/hooks/usePageStatus";

interface DataPoint {
  date: string;
  value: number;
  value2: number;
  type: string;
  status: string;
  gender: "Nam" | "Nữ" | "#N/A";
  region?: string;
  branch?: string;
  serviceName?: string;
}

interface TotalRegionalSales {
  date: string;
  HCM: number;
  HaNoi: number;
  DaNang: number;
  NhaTrang: number;
  DaDongCua: number;
  type: string;
  status: string;
}

// Interface cho dữ liệu API mới
interface ServiceTypeData {
  date: string;
  type: string;
  count: number;
}

interface ServiceSummaryData {
  totalCombo: number;
  totalLe: number;
  totalCT: number;
  totalGift: number;
  totalAll: number;
  totalPending: number;
  prevCombo: number;
  prevLe: number;
  prevCT: number;
  prevGift: number;
  prevAll: number;
  prevPending: number;
  comboGrowth: number;
  leGrowth: number;
  ctGrowth: number;
  giftGrowth: number;
  allGrowth: number;
  pendingGrowth: number;
}

interface RegionData {
  region: string;
  type: string;
  total: number;
}

interface ServiceDataItem {
  tenDichVu: string;
  loaiDichVu: string;
  soLuong: number;
  tongGia: number;
  percentSoLuong: string;
  percentTongGia: string;
}

// Interface cho dữ liệu API shop service
interface ShopServiceData {
  shopName: string;
  serviceType: string;
  total: number;
}

// Interface cho dữ liệu API top 10 services revenue
interface Top10ServicesRevenueData {
  serviceName: string;
  servicePrice: number;
}

// Interface cho dữ liệu API top 10 services usage
interface Top10ServicesUsageData {
  serviceName: string;
  count: number;
}

// Interface cho dữ liệu API bảng dịch vụ
interface ServiceTableData {
  serviceName: string;
  type: string;
  usageCount: number;
  usageDeltaCount: number;
  usagePercent: number;
  totalRevenue: number;
  revenueDeltaPercent: number;
  revenuePercent: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
function useApiData<T>(url: string, fromDate: string, toDate: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip API calls if URL is not available
    if (!url || !API_BASE_URL) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromDate, toDate }),
    })
      .then((res) => {
        if (!res.ok) {
          // Don't throw error for 404, just return null data
          if (res.status === 404) {
            return null;
          }
          throw new Error("API error: " + res.status);
        }
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        // Only set error for non-404 errors
        if (!err.message.includes("404")) {
          setError(err.message);
        }
        setLoading(false);
      });
  }, [url, fromDate, toDate]);

  return { data, loading, error };
}

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
    reportPagePerformance
  } = usePageStatus('services');

  // Function để reset tất cả filter về mặc định
  const resetFilters = () => {
    clearLocalStorageKeys([
      "services-startDate",
      "services-endDate",
      "services-selectedBranches",
      "services-selectedRegions",
      "services-selectedServiceTypes",
      "services-selectedGenders",
    ]);
    setStartDate(today(getLocalTimeZone()).subtract({ days: 7 }));
    setEndDate(today(getLocalTimeZone()));
    setSelectedBranches([]);
    setSelectedRegions([]);
    setSelectedServiceTypes([
      "Khách hàng Thành viên",
      "KH trải nghiệm",
      "Added on",
      "Quà tặng",
    ]);
    setSelectedGenders(["Nam", "Nữ", "#N/A"]);
    showSuccess("Đã reset tất cả filter về mặc định!");
    reportResetFilters();
  };

  const [startDate, setStartDate] = useLocalStorageState<CalendarDate>(
    "services-startDate",
    today(getLocalTimeZone()).subtract({ days: 7 })
  );
  const [endDate, setEndDate] = useLocalStorageState<CalendarDate>(
    "services-endDate",
    today(getLocalTimeZone())
  );
  const [selectedBranches, setSelectedBranches] = useLocalStorageState<
    string[]
  >("services-selectedBranches", []);
  const [selectedRegions, setSelectedRegions] = useLocalStorageState<string[]>(
    "services-selectedRegions",
    []
  );
  const [selectedServiceTypes, setSelectedServiceTypes] = useLocalStorageState<
    string[]
  >("services-selectedServiceTypes", [
    "Khách hàng Thành viên",
    "KH trải nghiệm",
    "Added on",
    "Quà tặng",
  ]);
  const [selectedGenders, setSelectedGenders] = useLocalStorageState<string[]>(
    "services-selectedGenders",
    ["Nam", "Nữ", "#N/A"]
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

  // API call cho dữ liệu dịch vụ theo loại
  const { data: serviceTypeData } = useApiData<ServiceTypeData[]>(
    `${API_BASE_URL}/api/service-record/service-type-breakdown`,
    fromDate,
    toDate
  );

  const {
    data: serviceSummary,
    loading: serviceSummaryLoading,
    error: serviceSummaryError,
  } = useApiData<ServiceSummaryData>(
    `${API_BASE_URL}/api/service-record/service-summary`,
    fromDate,
    toDate
  );

  const {
    data: regionData,
    loading: regionLoading,
    error: regionError,
  } = useApiData<RegionData[]>(
    `${API_BASE_URL}/api/service-record/region`,
    fromDate,
    toDate
  );

  // Report page load success when data loads
  useEffect(() => {
    if (serviceSummary && !serviceSummaryLoading && !serviceSummaryError) {
      const startTime = Date.now();
      
      // Calculate total services from the data
      const totalServices = serviceSummary.totalAll || 0;
      const loadTime = Date.now() - startTime;
      
      reportPagePerformance({
        loadTime,
        dataSize: totalServices
      });
      
      reportDataLoadSuccess("dịch vụ", totalServices);
    }
  }, [serviceSummary, serviceSummaryLoading, serviceSummaryError, reportPagePerformance, reportDataLoadSuccess]);

  // Report errors
  useEffect(() => {
    if (serviceSummaryError) {
      reportPageError(`Lỗi tải dữ liệu dịch vụ: ${serviceSummaryError}`);
    }
  }, [serviceSummaryError, reportPageError]);

  // Report filter changes
  useEffect(() => {
    if (selectedRegions.length > 0) {
      reportFilterChange(`khu vực: ${selectedRegions.join(', ')}`);
    }
  }, [selectedRegions, reportFilterChange]);

  useEffect(() => {
    if (selectedBranches.length > 0) {
      reportFilterChange(`chi nhánh: ${selectedBranches.join(', ')}`);
    }
  }, [selectedBranches, reportFilterChange]);

  useEffect(() => {
    if (selectedServiceTypes.length > 0) {
      reportFilterChange(`loại dịch vụ: ${selectedServiceTypes.join(', ')}`);
    }
  }, [selectedServiceTypes, reportFilterChange]);

  const {
    data: shopData,
    loading: shopLoading,
    error: shopError,
  } = useApiData<ShopServiceData[]>(
    `${API_BASE_URL}/api/service-record/shop`,
    fromDate,
    toDate
  );

  const {
    data: top10ServicesRevenueData,
    loading: top10ServicesLoading,
    error: top10ServicesError,
  } = useApiData<Top10ServicesRevenueData[]>(
    `${API_BASE_URL}/api/service-record/top10-services-revenue`,
    fromDate,
    toDate
  );

  const {
    data: top10ServicesUsageData,
    loading: top10ServicesUsageLoading,
    error: top10ServicesUsageError,
  } = useApiData<Top10ServicesUsageData[]>(
    `${API_BASE_URL}/api/service-record/top10-services-usage`,
    fromDate,
    toDate
  );

  const {
    data: bottom3ServicesUsageData,
    loading: bottom3ServicesUsageLoading,
    error: bottom3ServicesUsageError,
  } = useApiData<Top10ServicesUsageData[]>(
    `${API_BASE_URL}/api/service-record/bottom3-services-usage`,
    fromDate,
    toDate
  );

  const {
    data: bottom3ServicesRevenueData,
    loading: bottom3ServicesRevenueLoading,
    error: bottom3ServicesRevenueError,
  } = useApiData<Top10ServicesRevenueData[]>(
    `${API_BASE_URL}/api/service-record/bottom3-services-revenue`,
    fromDate,
    toDate
  );

  const {
    data: serviceTableData,
    loading: serviceTableLoading,
    error: serviceTableError,
  } = useApiData<ServiceTableData[]>(
    `${API_BASE_URL}/api/service-record/top-table`,
    fromDate,
    toDate
  );

  // Track overall loading and error states for notifications
  const allLoadingStates = [
    serviceSummaryLoading,
    regionLoading,
    shopLoading,
    top10ServicesLoading,
    top10ServicesUsageLoading,
    bottom3ServicesUsageLoading,
    bottom3ServicesRevenueLoading,
    serviceTableLoading,
  ];

  const allErrorStates = [
    serviceSummaryError,
    regionError,
    shopError,
    top10ServicesError,
    top10ServicesUsageError,
    bottom3ServicesUsageError,
    bottom3ServicesRevenueError,
    serviceTableError,
  ];

  const isLoading = allLoadingStates.some((loading) => loading);
  const hasError = allErrorStates.some((error) => error);

  // Show notifications based on loading and error states
  useEffect(() => {
    if (!isLoading && !hasError && serviceSummary && !hasShownSuccess.current) {
      showSuccess("Dữ liệu dịch vụ đã được tải thành công!");
      hasShownSuccess.current = true;
    }
  }, [isLoading, hasError, serviceSummary, showSuccess]);

  useEffect(() => {
    if (hasError && !hasShownError.current) {
      showError("Không thể kết nối đến API. Vui lòng thử lại sau.");
      hasShownError.current = true;
    }
  }, [hasError, showError]);

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

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 640;

  const ALL_SERVICE_TYPES = [
    { key: "Khách hàng Thành viên", label: "Combo" },
    { key: "KH trải nghiệm", label: "Dịch vụ" },
    { key: "Added on", label: "Added on" },
    { key: "Quà tặng", label: "Gifts" },
    { key: "Fox card", label: "Fox card" },
  ];
  const ALL_GENDERS = ["Nam", "Nữ", "#N/A"];
  const [regionSearch] = useState("");
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
  const locationRegionMap: Record<string, string> = React.useMemo(
    () => ({
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
    }),
    []
  );
  const data: DataPoint[] = React.useMemo(
    () => [
      ...Array.from({ length: 30 }, (_, i) => {
        const day = i + 1;
        const dateStr = `${day} thg 6`;
        const allLocations = [
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
        ];
        return [
          {
            date: dateStr,
            value: 1200000 + (i % 5) * 20000 + i * 1000,
            value2: 1000000 + (i % 3) * 15000 + i * 800,
            type: "KH trải nghiệm",
            status: "New",
            gender: "Nam" as const,
            region: locationRegionMap[allLocations[i % allLocations.length]],
            branch: allLocations[i % allLocations.length],
          },
          {
            date: dateStr,
            value: 1250000 + (i % 4) * 18000 + i * 1200,
            value2: 1050000 + (i % 2) * 17000 + i * 900,
            type: "KH trải nghiệm",
            status: "New",
            gender: "Nữ" as const,
            region:
              locationRegionMap[allLocations[(i + 1) % allLocations.length]],
            branch: allLocations[(i + 1) % allLocations.length],
          },
          {
            date: dateStr,
            value: 1300000 + (i % 6) * 22000 + i * 1100,
            value2: 1100000 + (i % 4) * 13000 + i * 700,
            type: "Khách hàng Thành viên",
            status: "New",
            gender: "Nam" as const,
            region:
              locationRegionMap[allLocations[(i + 2) % allLocations.length]],
            branch: allLocations[(i + 2) % allLocations.length],
          },
          {
            date: dateStr,
            value: 1350000 + (i % 3) * 25000 + i * 900,
            value2: 1150000 + (i % 5) * 12000 + i * 600,
            type: "Khách hàng Thành viên",
            status: "New",
            gender: "Nữ" as const,
            region:
              locationRegionMap[allLocations[(i + 3) % allLocations.length]],
            branch: allLocations[(i + 3) % allLocations.length],
          },
        ];
      }).flat(),
    ],
    [locationRegionMap]
  );

  const TotalRegionalSales: TotalRegionalSales[] = [
    {
      date: "9 thg 6, 2025",
      HCM: 100,
      HaNoi: 90,
      DaNang: 80,
      NhaTrang: 70,
      DaDongCua: 60,
      type: "Tổng",
      status: "All",
    },

    {
      date: "8 thg 6, 2025",
      HCM: 100,
      HaNoi: 90,
      DaNang: 80,
      NhaTrang: 70,
      DaDongCua: 60,
      type: "Tổng",
      status: "All",
    },
    {
      date: "7 thg 6, 2025",
      HCM: 100,
      HaNoi: 90,
      DaNang: 80,
      NhaTrang: 70,
      DaDongCua: 60,
      type: "Tổng",
      status: "All",
    },
    {
      date: "6 thg 6, 2025",
      HCM: 100,
      HaNoi: 90,
      DaNang: 80,
      NhaTrang: 70,
      DaDongCua: 60,
      type: "Tổng",
      status: "All",
    },
    {
      date: "5 thg 6, 2025",
      HCM: 100,
      HaNoi: 90,
      DaNang: 80,
      NhaTrang: 70,
      DaDongCua: 60,
      type: "Tổng",
      status: "All",
    },
    {
      date: "4 thg 6, 2025",
      HCM: 100,
      HaNoi: 90,
      DaNang: 80,
      NhaTrang: 70,
      DaDongCua: 60,
      type: "Tổng",
      status: "All",
    },
    {
      date: "3 thg 6, 2025",
      HCM: 100,
      HaNoi: 90,
      DaNang: 80,
      NhaTrang: 70,
      DaDongCua: 60,
      type: "Tổng",
      status: "All",
    },
    {
      date: "1 thg 6, 2025",
      HCM: 100,
      HaNoi: 90,
      DaNang: 80,
      NhaTrang: 70,
      DaDongCua: 60,
      type: "Tổng",
      status: "All",
    },
    {
      date: "2 thg 6, 2025",
      HCM: 100,
      HaNoi: 90,
      DaNang: 80,
      NhaTrang: 70,
      DaDongCua: 60,
      type: "Tổng",
      status: "All",
    },
  ];

  function formatMoneyShort(val: number) {
    if (val >= 1_000_000_000_000)
      return (val / 1_000_000_000_000).toFixed(1) + " T";
    if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1) + " T";
    if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + " Tr";
    return val.toLocaleString();
  }

  const REGIONS = [
    "HCM",
    "Hà Nội",
    "Đà Nẵng",
    "Nha Trang",
    "Đã Đóng Cửa",
    "Khác",
  ];

  const isInWeek = React.useCallback(
    (d: DataPoint, start: CalendarDate, end: CalendarDate) => {
      const dDate = parseVNDate(d.date);
      return dDate.compare(start) >= 0 && dDate.compare(end) <= 0;
    },
    []
  );

  // Đặt các biến tuần lên trước
  const weekStart = startDate;
  const weekEnd = endDate;
  const prevWeekStart = startDate.subtract({ days: 7 });
  const prevWeekEnd = startDate.subtract({ days: 1 });

  const weekRevenueData = filterData(
    TotalRegionalSales,
    selectedRegions,
    selectedBranches
  );
  const prevWeekRevenueData = filterData(
    TotalRegionalSales,
    selectedRegions,
    selectedBranches
  );

  // Helper to map region display name to data key
  function getRegionKey(region: string): keyof TotalRegionalSales | string {
    switch (region) {
      case "HCM":
        return "HCM";
      case "Hà Nội":
        return "HaNoi";
      case "Đà Nẵng":
        return "DaNang";
      case "Nha Trang":
        return "NhaTrang";
      case "Đã Đóng Cửa":
        return "DaDongCua";
      case "Khác":
        return "Khac";
      default:
        return "HCM";
    }
  }

  const regionStats = REGIONS.map((region) => {
    const ordersThisWeek = data.filter(
      (d) => d.region === region && isInWeek(d, weekStart, weekEnd)
    ).length;
    const ordersLastWeek = data.filter(
      (d) => d.region === region && isInWeek(d, prevWeekStart, prevWeekEnd)
    ).length;
    const deltaOrders = ordersThisWeek - ordersLastWeek;
    const regionKey = getRegionKey(region) as keyof TotalRegionalSales;
    const revenueThisWeek = weekRevenueData.reduce(
      (sum, item) => sum + Number(item[regionKey] ?? 0),
      0
    );
    const revenueLastWeek = prevWeekRevenueData.reduce(
      (sum, item) => sum + Number(item[regionKey] ?? 0),
      0
    );
    const percentDelta =
      revenueLastWeek === 0
        ? null
        : ((revenueThisWeek - revenueLastWeek) / revenueLastWeek) * 100;
    return {
      region,
      ordersThisWeek,
      deltaOrders,
      revenueThisWeek,
      percentDelta,
      revenueLastWeek,
    };
  });

  function parseVNDate(str: string): CalendarDate {
    let match = str.match(/^(\d{1,2}) thg (\d{1,2}), (\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      return parseDate(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
      );
    }

    match = str.match(/^(\d{1,2}) thg (\d{1,2})$/);
    if (match) {
      const [, day, month] = match;
      const year = String(new Date().getFullYear());
      return parseDate(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
      );
    }
    throw new Error("Invalid date format: " + str);
  }

  // Sửa filterData để lọc theo region/branch nếu có
  function filterData<
    T extends {
      type: string;
      status: string;
      date: string;
      region?: string;
      branch?: string;
    }
  >(data: T[], selectedRegions?: string[], selectedBranches?: string[]): T[] {
    return data.filter((item) => {
      const matchRegion =
        !selectedRegions ||
        selectedRegions.length === 0 ||
        !item.region ||
        selectedRegions.includes(item.region);
      const matchBranch =
        !selectedBranches ||
        selectedBranches.length === 0 ||
        !item.branch ||
        selectedBranches.includes(item.branch);
      return matchRegion && matchBranch;
    });
  }
  const [serviceSearch] = useState("");
  const [genderSearch] = useState("");
  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const genderDropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        serviceDropdownRef.current &&
        !serviceDropdownRef.current.contains(e.target as Node)
      ) {
      }
      if (
        genderDropdownRef.current &&
        !genderDropdownRef.current.contains(e.target as Node)
      ) {
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filter options theo search
  const filteredServiceTypes = ALL_SERVICE_TYPES.filter((s) =>
    s.label.toLowerCase().includes(serviceSearch.toLowerCase())
  );
  const filteredGenders = ALL_GENDERS.filter((g) =>
    g.toLowerCase().includes(genderSearch.toLowerCase())
  );

  const regionOptions = regionStats.map((r) => ({
    name: r.region,
    total: Object.values(locationRegionMap).filter((reg) => reg === r.region)
      .length,
  }));
  const filteredRegionOptions = React.useMemo(
    () =>
      regionOptions.filter((r) =>
        r.name.toLowerCase().includes(regionSearch.toLowerCase())
      ),
    [regionOptions, regionSearch]
  );

  // Tính top 10 location (chi nhánh/cửa hàng) theo thực thu tuần này
  const locationRevenueMap: Record<string, number> = {};
  locationOptions.forEach((loc) => {
    locationRevenueMap[loc] = data
      .filter((d) => d.branch === loc && isInWeek(d, weekStart, weekEnd))
      .reduce((sum, d) => sum + d.value, 0);
  });

  const ordersByDay: Record<string, { count: number; avgPerShop: number }> = {};
  data.forEach((d) => {
    if (d.type !== "Khách hàng Thành viên") {
      if (!ordersByDay[d.date]) {
        ordersByDay[d.date] = { count: 0, avgPerShop: 0 };
      }
      ordersByDay[d.date].count++;
    }
  });
  // Tính trung bình số lượng đơn tại mỗi shop cho từng ngày
  Object.keys(ordersByDay).forEach((date) => {
    // Đếm số shop có đơn trong ngày đó
    const shops = new Set(
      data
        .filter((d) => d.date === date && d.type !== "Khách hàng Thành viên")
        .map((d) => d.branch)
    );
    ordersByDay[date].avgPerShop =
      shops.size > 0 ? Math.round(ordersByDay[date].count / shops.size) : 0;
  });
  const ordersByDayArr = Object.entries(ordersByDay).sort((a, b) => {
    // Sort theo ngày tăng dần
    const [d1, m1] = a[0].split(" thg ");
    const [d2, m2] = b[0].split(" thg ");
    return Number(m1) !== Number(m2)
      ? Number(m1) - Number(m2)
      : Number(d1) - Number(d2);
  });

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

  const weekDates: CalendarDate[] = React.useMemo(() => {
    const dates: CalendarDate[] = [];
    let d = weekStart;
    while (d.compare(weekEnd) <= 0) {
      dates.push(d);
      d = d.add({ days: 1 });
    }
    return dates;
  }, [weekStart, weekEnd]);

  // Xử lý dữ liệu API cho chart tổng dịch vụ thực hiện trong tuần
  const weeklyServiceChartData = React.useMemo(() => {
    if (!serviceTypeData) {
      // Fallback data nếu API chưa load
      return weekDates.map((dateObj) => {
        const dateStr = `${dateObj.day} thg ${dateObj.month}`;
        return {
          date: dateStr,
          combo: 0,
          service: 0,
          addedon: 0,
          foxcard: 0,
        };
      });
    }

    // Tạo map để nhóm dữ liệu theo ngày
    const dataByDate = new Map<
      string,
      { combo: number; service: number; addedon: number; foxcard: number }
    >();

    // Khởi tạo dữ liệu cho tất cả các ngày trong tuần
    weekDates.forEach((dateObj) => {
      const dateKey = `${dateObj.year}-${String(dateObj.month).padStart(
        2,
        "0"
      )}-${String(dateObj.day).padStart(2, "0")}`;
      dataByDate.set(dateKey, { combo: 0, service: 0, addedon: 0, foxcard: 0 });
    });

    // Xử lý dữ liệu từ API
    serviceTypeData.forEach((item) => {
      const dateKey = item.date;
      const existing = dataByDate.get(dateKey);

      if (existing) {
        switch (item.type) {
          case "Combo":
            existing.combo = item.count;
            break;
          case "Dịch vụ":
            existing.service = item.count;
            break;
          case "Khác":
            existing.addedon = item.count;
            break;
          default:
            // Các loại khác có thể được xử lý ở đây
            break;
        }
      }
    });

    // Chuyển đổi thành format cho chart
    return weekDates.map((dateObj) => {
      const dateKey = `${dateObj.year}-${String(dateObj.month).padStart(
        2,
        "0"
      )}-${String(dateObj.day).padStart(2, "0")}`;
      const data = dataByDate.get(dateKey) || {
        combo: 0,
        service: 0,
        addedon: 0,
        foxcard: 0,
      };
      const total = data.combo + data.service + data.addedon;
      const foxcard = Math.round(total * 0.218);

      return {
        date: `${dateObj.day} thg ${dateObj.month}`,
        combo: data.combo,
        service: data.service,
        addedon: data.addedon,
        foxcard: foxcard,
      };
    });
  }, [serviceTypeData, weekDates]);

  // Xử lý dữ liệu cho chart tổng dịch vụ thực hiện theo khu vực
  const regionChartData = React.useMemo(() => {
    if (!regionData) return [];

    // Nhóm dữ liệu theo khu vực
    const regionMap = new Map<
      string,
      { combo: number; service: number; other: number }
    >();

    regionData.forEach((item) => {
      if (!regionMap.has(item.region)) {
        regionMap.set(item.region, { combo: 0, service: 0, other: 0 });
      }

      const region = regionMap.get(item.region)!;
      switch (item.type) {
        case "Combo":
          region.combo = item.total;
          break;
        case "Dịch vụ":
          region.service = item.total;
          break;
        case "Khác":
          region.other = item.total;
          break;
      }
    });

    // Chuyển đổi thành format cho chart
    return Array.from(regionMap.entries())
      .map(([regionName, data]) => ({
        region: regionName,
        combo: data.combo,
        service: data.service,
        other: data.other,
        total: data.combo + data.service + data.other,
      }))
      .sort((a, b) => b.total - a.total); // Sắp xếp theo tổng giảm dần
  }, [regionData]);

  // Dữ liệu cho bảng dịch vụ
  const serviceData: ServiceDataItem[] = React.useMemo(() => {
    if (!serviceTypeData) return [];

    const serviceMap = new Map<string, { count: number; type: string }>();

    serviceTypeData.forEach((item) => {
      const key = item.type;
      if (!serviceMap.has(key)) {
        serviceMap.set(key, { count: 0, type: item.type });
      }
      serviceMap.get(key)!.count += item.count;
    });

    const totalCount = Array.from(serviceMap.values()).reduce(
      (sum, item) => sum + item.count,
      0
    );

    return Array.from(serviceMap.entries()).map(([key, item]) => ({
      tenDichVu: key,
      loaiDichVu: key,
      soLuong: item.count,
      tongGia: item.count * 1000000, // Giả sử giá trung bình 1 triệu
      percentSoLuong:
        totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : "0.0",
      percentTongGia:
        totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : "0.0",
    }));
  }, [serviceTypeData]);

  // Lấy danh sách các cửa hàng
  const storeNames = locationOptions;

  // Bổ sung data mẫu cho các trường type và gender nếu chưa có
  // (Chỉ thêm vào cuối mảng data, không ảnh hưởng logic cũ)
  if (!data.some((d) => d.type === "Added on")) {
    data.push({
      date: `${weekStart.day} thg ${weekStart.month}`,
      value: 1000000,
      value2: 500000,
      type: "Added on",
      status: "New",
      gender: "Nam",
      region: "HCM",
      branch: "Crescent Mall Q7",
    });
  }
  if (!data.some((d) => d.type === "Quà tặng")) {
    data.push({
      date: `${weekStart.day} thg ${weekStart.month}`,
      value: 800000,
      value2: 300000,
      type: "Quà tặng",
      status: "New",
      gender: "#N/A",
      region: "HCM",
      branch: "Vincom Landmark 81",
    });
  }
  if (!data.some((d) => d.gender === "#N/A")) {
    data.push({
      date: `${weekStart.day} thg ${weekStart.month}`,
      value: 1200000,
      value2: 600000,
      type: "KH trải nghiệm",
      status: "New",
      gender: "#N/A",
      region: "HCM",
      branch: "Vista Verde",
    });
  }

  // Tính số lượng từng loại dịch vụ theo từng cửa hàng từ API data
  const storeServiceChartData = shopData
    ? (() => {
        // Group data by shop name
        const shopGroups = shopData.reduce((acc, item) => {
          if (!acc[item.shopName]) {
            acc[item.shopName] = {};
          }
          acc[item.shopName][item.serviceType] = item.total;
          return acc;
        }, {} as Record<string, Record<string, number>>);

        // Convert to chart format
        return Object.entries(shopGroups)
          .map(([shopName, services]) => {
            const combo = services["Combo"] || 0;
            const service = services["Dịch vụ"] || 0;
            const other = services["Khác"] || 0;
            const total = combo + service + other;

            return {
              store: shopName,
              combo,
              service,
              other,
              total, // để sort
            };
          })
          .sort((a, b) => b.total - a.total);
      })()
    : storeNames
        .map((store) => {
          const storeData = data.filter(
            (d) =>
              d.branch === store &&
              isInWeek(d, weekStart, weekEnd) &&
              selectedServiceTypes.includes(d.type) &&
              selectedGenders.includes(d.gender)
          );
          const combo = storeData.filter(
            (d) => d.type === "Khách hàng Thành viên"
          ).length;
          const service = storeData.filter(
            (d) => d.type === "KH trải nghiệm"
          ).length;
          const addedon = storeData.filter((d) => d.type === "Added on").length;
          const gifts = storeData.filter((d) => d.type === "Quà tặng").length;
          // Fox card: giả lập 21.8% tổng số đơn của cửa hàng
          const total = combo + service + addedon + gifts;
          const foxcard = Math.round(total * 0.218);
          return {
            store,
            combo,
            service,
            addedon,
            gifts,
            foxcard,
            total, // để sort
          };
        })
        .sort((a, b) => b.total - a.total);

  // Tính tổng actual price cho từng giới tính trong tuần (theo filter dịch vụ nếu muốn)
  const genderActualPrice = ALL_GENDERS.map((gender) => {
    // Lọc theo tuần, theo filter dịch vụ nếu muốn
    const filtered = data.filter(
      (d) =>
        d.gender === gender &&
        isInWeek(d, weekStart, weekEnd) &&
        selectedServiceTypes.includes(d.type)
    );
    const total = filtered.reduce((sum, d) => sum + d.value, 0);
    return { gender, total };
  });

  // Filtered data for pie charts and other components
  const filteredPieData = data.filter(
    (d) =>
      isInWeek(d, weekStart, weekEnd) &&
      (selectedRegions.length === 0 ||
        !d.region ||
        selectedRegions.includes(d.region)) &&
      (selectedBranches.length === 0 ||
        !d.branch ||
        selectedBranches.includes(d.branch)) &&
      selectedServiceTypes.includes(d.type) &&
      selectedGenders.includes(d.gender)
  );

  // Pie chart data for tỉ lệ dịch vụ/combo/cộng thêm (có filter)
  const pieChartData = React.useMemo(() => {
    if (serviceSummary) {
      // Sử dụng dữ liệu API serviceSummary
      const pieData = [
        {
          key: "combo",
          label: "Combo",
          value: serviceSummary.totalCombo,
          color: "#795548",
        },
        {
          key: "service",
          label: "Dịch vụ",
          value: serviceSummary.totalLe,
          color: "#c5e1a5",
        },
        {
          key: "addedon",
          label: "Added on",
          value: serviceSummary.totalCT,
          color: "#f16a3f",
        },
        {
          key: "gifts",
          label: "Gifts",
          value: serviceSummary.totalGift,
          color: "#8fd1fc",
        },
      ];
      const totalPie = pieData.reduce((sum, d) => sum + d.value, 0);
      const foxCardValue = Math.round(totalPie * 0.218);
      return [
        ...pieData,
        {
          key: "foxcard",
          label: "Fox card",
          value: foxCardValue,
          color: "#b26e7a",
        },
      ];
    }

    // Fallback data nếu API chưa load
    const pieData = [
      {
        key: "combo",
        label: "Combo",
        value: filteredPieData.filter((d) => d.type === "Khách hàng Thành viên")
          .length,
        color: "#795548",
      },
      {
        key: "service",
        label: "Dịch vụ",
        value: filteredPieData.filter((d) => d.type === "KH trải nghiệm")
          .length,
        color: "#c5e1a5",
      },
      {
        key: "addedon",
        label: "Added on",
        value: filteredPieData.filter((d) => d.type === "Added on").length,
        color: "#f16a3f",
      },
      {
        key: "gifts",
        label: "Gifts",
        value: filteredPieData.filter((d) => d.type === "Quà tặng").length,
        color: "#8fd1fc",
      },
    ];
    const totalPie = pieData.reduce((sum, d) => sum + d.value, 0);
    const foxCardValue = Math.round(totalPie * 0.218);
    return [
      ...pieData,
      {
        key: "foxcard",
        label: "Fox card",
        value: foxCardValue,
        color: "#b26e7a",
      },
    ];
  }, [serviceSummary, filteredPieData]);

  // PieChart top 10 dịch vụ theo số lượng (có filter)
  const pieTop10Data = React.useMemo(() => {
    if (top10ServicesUsageData) {
      // Sử dụng dữ liệu API - số lượng
      return top10ServicesUsageData.map((service, idx) => ({
        name: service.serviceName,
        value: service.count,
        color: `hsl(0,0%,${40 + idx * 5}%)`, // gradient xám
      }));
    }

    // Fallback data nếu API chưa load
    const filteredServiceData = data.filter(
      (d) =>
        isInWeek(d, weekStart, weekEnd) &&
        (selectedRegions.length === 0 ||
          !d.region ||
          selectedRegions.includes(d.region)) &&
        (selectedBranches.length === 0 ||
          !d.branch ||
          selectedBranches.includes(d.branch)) &&
        selectedServiceTypes.includes(d.type) &&
        selectedGenders.includes(d.gender)
    );
    // Lấy tên dịch vụ (ưu tiên d.serviceName, fallback d.type)
    const serviceCountMap = new Map();
    filteredServiceData.forEach((d) => {
      const name = d.serviceName || d.type;
      serviceCountMap.set(name, (serviceCountMap.get(name) || 0) + 1);
    });
    const sortedServices = Array.from(serviceCountMap.entries()).sort(
      (a, b) => b[1] - a[1]
    );
    const top10Services = sortedServices.slice(0, 10);
    const otherCount = sortedServices
      .slice(10)
      .reduce((sum, [, count]) => sum + count, 0);
    const result = top10Services.map(([name, value], idx) => ({
      name,
      value,
      color: `hsl(0,0%,${40 + idx * 5}%)`, // gradient xám
    }));
    if (otherCount > 0) {
      result.push({ name: "Khác", value: otherCount, color: "#ededed" });
    }
    return result;
  }, [
    top10ServicesUsageData,
    data,
    weekStart,
    weekEnd,
    isInWeek,
    selectedRegions,
    selectedBranches,
    selectedServiceTypes,
    selectedGenders,
  ]);

  // PieChart top 10 dịch vụ theo giá buổi (có filter)
  const pieTop10AvgData = React.useMemo(() => {
    if (top10ServicesRevenueData) {
      // Sử dụng dữ liệu API - doanh thu
      return top10ServicesRevenueData.map((service, idx) => ({
        name: service.serviceName,
        value: service.servicePrice,
        color: `hsl(30, 100%, ${45 + idx * 5}%)`, // gradient cam
      }));
    }

    // Fallback data nếu API chưa load
    const serviceValueMap = new Map();
    filteredPieData.forEach((d) => {
      const name = d.serviceName || d.type;
      if (!serviceValueMap.has(name)) {
        serviceValueMap.set(name, { totalValue: 0, count: 0 });
      }
      const obj = serviceValueMap.get(name);
      obj.totalValue += d.value;
      obj.count += 1;
    });
    const serviceAvgArr = Array.from(serviceValueMap.entries()).map(
      ([name, { totalValue, count }]) => ({
        name,
        avg: count > 0 ? totalValue / count : 0,
        count,
      })
    );
    const sortedAvg = serviceAvgArr.sort((a, b) => b.avg - a.avg);
    const top10Avg = sortedAvg.slice(0, 10);
    const otherAvgSum = sortedAvg.slice(10).reduce((sum, s) => sum + s.avg, 0);
    const result = top10Avg.map((s, idx) => ({
      name: s.name,
      value: s.avg,
      color: `hsl(30, 100%, ${45 + idx * 5}%)`, // gradient cam
    }));
    if (sortedAvg.length > 10) {
      result.push({
        name: "Khác",
        value: otherAvgSum,
        color: "#ffe0b2",
      });
    }
    return result;
  }, [top10ServicesRevenueData, filteredPieData]);

  const renderPieLabel = ({
    percent,
    x,
    y,
    index,
  }: {
    percent?: number;
    x?: number;
    y?: number;
    index?: number;
  }) => {
    if (isMobile && percent !== undefined && percent < 0.00) return null;
    if (percent !== undefined && percent < 0.05) return null;
    return (
      <text
        x={x}
        y={y}
        fill={pieTop10Data[index ?? 0]?.color || "#333"}
        fontSize={isMobile ? 10 : 14}
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {(percent! * 100).toFixed(1)}%
      </text>
    );
  };

  const bottom3Data = React.useMemo(() => {
    if (bottom3ServicesUsageData) {
      // Sử dụng dữ liệu API
      const grayShades = ["#bdbdbd", "#9e9e9e", "#e0e0e0"];
      return bottom3ServicesUsageData.map((service, idx) => ({
        name: service.serviceName,
        value: service.count,
        color: grayShades[idx % grayShades.length],
      }));
    }

    // Fallback data nếu API chưa load
    const serviceCountMap = new Map();
    filteredPieData.forEach((d) => {
      const name = d.serviceName || d.type;
      serviceCountMap.set(name, (serviceCountMap.get(name) || 0) + 1);
    });
    const sorted = Array.from(serviceCountMap.entries()).sort(
      (a, b) => a[1] - b[1]
    );
    const bottom3 = sorted.slice(0, 3);
    const grayShades = ["#bdbdbd", "#9e9e9e", "#e0e0e0"];
    return bottom3.map(([name, value], idx) => ({
      name,
      value,
      color: grayShades[idx % grayShades.length],
    }));
  }, [bottom3ServicesUsageData, filteredPieData]);

  // Data cho bottom 3 dịch vụ theo giá buổi
  const bottom3RevenueData = React.useMemo(() => {
    if (bottom3ServicesRevenueData) {
      // Sử dụng dữ liệu API
      const grayShades = ["#bdbdbd", "#9e9e9e", "#e0e0e0"];
      return bottom3ServicesRevenueData.map((service, idx) => ({
        name: service.serviceName,
        value: service.servicePrice,
        color: grayShades[idx % grayShades.length],
      }));
    }

    // Fallback data nếu API chưa load
    const serviceValueMap = new Map();
    filteredPieData.forEach((d) => {
      const name = d.serviceName || d.type;
      if (!serviceValueMap.has(name)) {
        serviceValueMap.set(name, {
          totalValue: 0,
          count: 0,
        });
      }
      const obj = serviceValueMap.get(name);
      obj.totalValue += d.value;
      obj.count += 1;
    });
    const serviceAvgArr = Array.from(serviceValueMap.entries()).map(
      ([name, { totalValue, count }]) => ({
        name,
        avg: count > 0 ? totalValue / count : 0,
        count,
      })
    );
    const sortedAvg = serviceAvgArr.sort((a, b) => a.avg - b.avg);
    const bottom3 = sortedAvg.slice(0, 3);
    const grayShades = ["#bdbdbd", "#9e9e9e", "#e0e0e0"];
    return bottom3.map((s, idx) => ({
      name: s.name,
      value: s.avg,
      color: grayShades[idx % grayShades.length],
    }));
  }, [bottom3ServicesRevenueData, filteredPieData]);

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
            <h1 className="text-2xl font-semibold text-gray-900">
              Services Report
            </h1>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Reset Filters
            </button>
          </div>
          <ServicesFilter
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            today={today}
            getLocalTimeZone={getLocalTimeZone}
            selectedRegions={selectedRegions}
            setSelectedRegions={setSelectedRegions}
            selectedBranches={selectedBranches}
            setSelectedBranches={setSelectedBranches}
            selectedServiceTypes={selectedServiceTypes}
            setSelectedServiceTypes={setSelectedServiceTypes}
            selectedGenders={selectedGenders}
            setSelectedGenders={setSelectedGenders}
            regionOptions={regionOptions}
            locationOptions={locationOptions}
            filteredRegionOptions={filteredRegionOptions}
            ALL_SERVICE_TYPES={ALL_SERVICE_TYPES}
            ALL_GENDERS={ALL_GENDERS}
            filteredServiceTypes={filteredServiceTypes}
            filteredGenders={filteredGenders}
            genderActualPrice={genderActualPrice}
            formatMoneyShort={formatMoneyShort}
          />
        </div>

        {/* Tổng dịch vụ thực hiện trong tuần */}
        <WeeklyServiceChartData
          weeklyServiceChartData={weeklyServiceChartData}
          isMobile={isMobile}
        />
        <PieChartData
          pieChartData={pieChartData}
          pieTop10Data={pieTop10Data}
          pieTop10AvgData={pieTop10AvgData}
          top10ServicesLoading={top10ServicesLoading}
          top10ServicesError={top10ServicesError}
          top10ServicesUsageLoading={top10ServicesUsageLoading}
          top10ServicesUsageError={top10ServicesUsageError}
          isMobile={isMobile}
          renderPieLabel={renderPieLabel}
        />

        <ServiceBottomPieData
          bottom3ServicesUsageData={bottom3ServicesUsageData}
          bottom3ServicesUsageLoading={bottom3ServicesUsageLoading}
          bottom3ServicesUsageError={bottom3ServicesUsageError}
          bottom3ServicesRevenueLoading={bottom3ServicesRevenueLoading}
          bottom3ServicesRevenueError={bottom3ServicesRevenueError}
          bottom3Data={bottom3Data}
          bottom3RevenueData={bottom3RevenueData}
          filteredPieData={filteredPieData}
          isMobile={isMobile}
        />

        {/* 5 bảng tổng dịch vụ */}

        <ServiceStatCards
          serviceSummary={serviceSummary}
          serviceSummaryLoading={serviceSummaryLoading}
          serviceSummaryError={serviceSummaryError}
        />

        {/* Tổng dịch vụ thực hiện theo cửa hàng*/}
        <ServiceStoreChartData
          shopLoading={shopLoading}
          shopError={shopError}
          isMobile={isMobile}
          storeServiceChartData={storeServiceChartData}
        />

        {/* Tổng dịch vụ thực hiện theo khu vực */}
        <ServicesRegionData
          regionLoading={regionLoading}
          regionError={regionError}
          isMobile={isMobile}
          regionChartData={regionChartData}
        />

        {/* Bảng thống kê tất cả các dịch vụ */}
        <ServicesTable
          serviceTableData={serviceTableData}
          serviceTableLoading={serviceTableLoading}
          serviceTableError={serviceTableError}
          serviceData={serviceData}
        />
      </div>
    </div>
  );
}
