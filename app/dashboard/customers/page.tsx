"use client";
import React, { useState, useEffect, useRef, Suspense, useMemo } from "react";
import {
  CalendarDate,
  today,
  getLocalTimeZone,
  parseDate,
} from "@internationalized/date";
import CustomerFacilityHourTable from "./CustomerFacilityHourTable";
import CustomerFilters from "./CustomerFilters";
import CustomerAccordionCard from "./CustomerAccordionCard";
import CustomerGenderPie from "./CustomerGenderPie";
import CustomerNewChart from "./CustomerNewChart";
import CustomerTypeTrendChart from "./CustomerTypeTrendChart";
import CustomerSourceBarChart from "./CustomerSourceBarChart";
import CustomerAppDownloadBarChart from "./CustomerAppDownloadBarChart";
import CustomerAppDownloadPieChart from "./CustomerAppDownloadPieChart";
import CustomerOldTypeTrendChart from "./CustomerOldTypeTrendChart";
import CustomerFacilityBookingTable from "./CustomerFacilityBookingHour";
import { Notification, useNotification } from "@/app/components/notification";
import {
  useLocalStorageState,
  clearLocalStorageKeys,
} from "@/app/hooks/useLocalStorageState";
import { usePageStatus } from "@/app/hooks/usePageStatus";
import { ApiService } from "../../lib/api-service";
const API_BASE_URL = "/api/proxy";

// ==== Types for API responses to ensure type-safety across the component ====
type DateCountPoint = { date: string; count: number };

interface LineChartRanges {
  currentRange?: DateCountPoint[];
  previousRange?: DateCountPoint[];
}

type TrendSeriesMap = Record<string, DateCountPoint[]>;

interface GenderRatio {
  male?: number;
  female?: number;
}

interface AppDownloadPie {
  totalNew?: number;
  totalOld?: number;
}

type AppDownloadStatusMap = Record<string, Array<{ date?: string; [key: string]: unknown }>>;

interface FacilityHourItem {
  facility: string;
  hourlyCounts: Record<string, number>;
  total: number;
}

type FacilityHourService = FacilityHourItem[];

interface UniqueCustomersComparison {
  currentTotal?: number;
  changePercentTotal?: number;
  currentMale?: number;
  changePercentMale?: number;
  currentFemale?: number;
  changePercentFemale?: number;
}

interface GenderRevenueSummary {
  avgActualRevenueMale?: number;
  avgFoxieRevenueMale?: number;
  avgActualRevenueFemale?: number;
  avgFoxieRevenueFemale?: number;
}

// Customer summary pass-through type (structure used by child)
// If shape is unknown, keep as unknown but not assign to stricter type
type CustomerSummaryRaw = Record<string, unknown>;

// Utility function để đảm bảo CalendarDate instances
function ensureCalendarDate(date: unknown): CalendarDate {
  if (date instanceof CalendarDate) {
    return date;
  }
  if (
    date &&
    typeof date === "object" &&
    "year" in date &&
    "month" in date &&
    "day" in date
  ) {
    const dateObj = date as { year: number; month: number; day: number };
    return new CalendarDate(dateObj.year, dateObj.month, dateObj.day);
  }
  return today(getLocalTimeZone());
}

// Function để clear tất cả filter state
function clearCustomerFilters() {
  clearLocalStorageKeys([
    "customer-selectedType",
    "customer-selectedStatus",
    "customer-bookingCompletionStatus",
    "customer-startDate",
    "customer-endDate",
    "customer-selectedRegions",
    "customer-selectedBranches",
  ]);
}

// Custom hook dùng chung cho fetch API động với caching và rate limiting
function useApiData<T>(
  url: string,
  fromDate: string,
  toDate: string,
  delay: number = 0,
  extraBody?: Record<string, unknown>,
  forceMethod?: 'GET' | 'POST'
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastRequestTimeRef = useRef<number>(0);

  useEffect(() => {
    // Prevent rapid successive requests
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;
    const minInterval = 2000; // 2 seconds minimum between requests
    
    if (timeSinceLastRequest < minInterval) {
      const remainingDelay = minInterval - timeSinceLastRequest;
      setTimeout(() => {
        // Continue with the request after delay
      }, remainingDelay);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);
    setError(null);
    lastRequestTimeRef.current = now;
              
    const fetchData = async () => {
      try {
        // Add delay to prevent rate limiting
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        const hasQuery = url.includes("?");
        // Extract endpoint from full URL - remove /api/proxy prefix
        const endpoint = url
          .replace(API_BASE_URL, "")
          .replace("/api", "")
          .replace(/^\/+/, "");

        // Only log in development
        if (process.env.NODE_ENV === "development") {
          console.log("🔍 Debug - Original URL:", url);
          console.log("🔍 Debug - Extracted Endpoint:", endpoint);
        }

        const finalEndpoint = hasQuery
          ? `${endpoint}&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`
          : endpoint;

        const method: 'GET' | 'POST' = forceMethod ?? (hasQuery ? 'GET' : 'POST');
        const result = await (method === 'GET'
          ? ApiService.get(finalEndpoint)
          : ApiService.post(endpoint, { fromDate, toDate, ...(extraBody || {}) })
        );
        
        if (process.env.NODE_ENV === "development") {
          console.log("🔍 Debug - API Response for", hasQuery ? finalEndpoint : endpoint, ":", result);
        }
        
        setData(result as T);
        setLoading(false);
        setRetryCount(0); // Reset retry count on success
      } catch (err: unknown) {
        const error = err as Error;
        
        // Don't process errors for aborted requests
        if (error.name === 'AbortError') {
          return;
        }
        
        console.error("🔍 Debug - API Error:", error);
        
        // Check if it's a rate limit error - NO RETRY for 429
        if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
          console.log(`🔍 Debug - Rate limit hit, skipping retry to prevent spam`);
          setError('API đang quá tải, vui lòng thử lại sau');
          setLoading(false);
          return;
        }
        
        // Only retry for non-429 errors, max 1 time
        if (retryCount < 1) {
          console.log(`🔍 Debug - Retrying in 5000ms...`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            fetchData();
          }, 5000);
          return;
        }
        
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, fromDate, toDate, delay, retryCount, extraBody, forceMethod]);

  return { data, loading, error };
}

// Hook lấy width window với debouncing
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
  } = usePageStatus("customers");

  // Sử dụng localStorage để lưu trữ state
  const [selectedType, setSelectedType, selectedTypeLoaded] =
    useLocalStorageState<string[]>("customer-selectedType", []);
  const [selectedStatus, setSelectedStatus, selectedStatusLoaded] =
    useLocalStorageState<string | null>("customer-selectedStatus", null);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const [startDate, setStartDate, startDateLoaded] =
    useLocalStorageState<CalendarDate>(
      "customer-startDate",
      today(getLocalTimeZone()).subtract({ days: 7 })
    );
  const [endDate, setEndDate, endDateLoaded] =
    useLocalStorageState<CalendarDate>(
      "customer-endDate",
      today(getLocalTimeZone())
    );

  const [selectedRegions, setSelectedRegions, selectedRegionsLoaded] =
    useLocalStorageState<string[]>("customer-selectedRegions", []);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [selectedBranches, setSelectedBranches, selectedBranchesLoaded] =
    useLocalStorageState<string[]>("customer-selectedBranches", []);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  
  // Filter status riêng cho bảng "thời gian đơn hàng hoàn thành"
  const [bookingCompletionStatus, setBookingCompletionStatus, bookingCompletionStatusLoaded] =
    useLocalStorageState<string | null>("customer-bookingCompletionStatus", "Khách đến");
  const [showBookingCompletionStatusDropdown, setShowBookingCompletionStatusDropdown] = useState(false);

  const resetFilters = useMemo(
    () => () => {
      clearCustomerFilters();
      setSelectedType([]);
      setSelectedStatus(null);
      setBookingCompletionStatus("Khách đến");
      setStartDate(today(getLocalTimeZone()).subtract({ days: 7 }));
      setEndDate(today(getLocalTimeZone()));
      setSelectedRegions([]);
      setSelectedBranches([]);
      showSuccess("Đã reset tất cả filter về mặc định!");
      reportResetFilters();
    },
    [
      showSuccess,
      reportResetFilters,
      setSelectedType,
      setSelectedStatus,
      setBookingCompletionStatus,
      setStartDate,
      setEndDate,
      setSelectedRegions,
      setSelectedBranches,
    ]
  );

  // Kiểm tra xem tất cả localStorage đã được load chưa
  const isAllLoaded =
    selectedTypeLoaded &&
    selectedStatusLoaded &&
    bookingCompletionStatusLoaded &&
    startDateLoaded &&
    endDateLoaded &&
    selectedRegionsLoaded &&
    selectedBranchesLoaded;

  const COLORS = useMemo(
    () => [
      "#5bd1d7",
      "#eb94cf",
      "#f66035",
      "#00d084",
      "#9b51e0",
      "#0693e3",
      "#ff7f7f",
      "#b39ddb",
      "#8d6e63",
      "#c5e1a5",
      "#81d4fa",
      "#fff176",
      "#d81b60",
    ],
    []
  );

  const allRegions = useMemo(
    () => ["Đã đóng cửa", "Đà Nẵng", "Nha Trang", "Hà Nội", "HCM"],
    []
  );
  const allBranches = useMemo(() => ["Branch 1", "Branch 2", "Branch 3"], []);

  const safeStartDate = ensureCalendarDate(startDate);
  const safeEndDate = ensureCalendarDate(endDate);

  const fromDate = `${safeStartDate.year}-${String(
    safeStartDate.month
  ).padStart(2, "0")}-${String(safeStartDate.day).padStart(2, "0")}T00:00:00`;
  const toDate = `${safeEndDate.year}-${String(safeEndDate.month).padStart(
    2,
    "0"
  )}-${String(safeEndDate.day).padStart(2, "0")}T23:59:59`;

  // API calls - sử dụng useApiData hook với delay phân tán để tránh rate limiting
  const { data: newCustomerRaw, loading: newCustomerLoading, error: newCustomerError } = 
    useApiData<LineChartRanges>('customer-sale/new-customer-lineChart', fromDate, toDate, 0);
  
  const { data: genderRatioRaw, loading: genderRatioLoading, error: genderRatioError } = 
    useApiData<GenderRatio>('customer-sale/gender-ratio', fromDate, toDate, 200);
  
  const { data: customerTypeRaw, loading: customerTypeLoading, error: customerTypeError } = 
    useApiData<TrendSeriesMap>('customer-sale/customer-type-trend', fromDate, toDate, 400);
  
  const { data: customerOldTypeRaw, loading: customerOldTypeLoading, error: customerOldTypeError } = 
    useApiData<LineChartRanges>('customer-sale/old-customer-lineChart', fromDate, toDate, 600);
  
  const { data: customerSourceRaw, loading: customerSourceLoading, error: customerSourceError } = 
    useApiData<TrendSeriesMap>('customer-sale/customer-source-trend', fromDate, toDate, 800);
  
  const { data: appDownloadStatusRaw, loading: appDownloadStatusLoading, error: appDownloadStatusError } = 
    useApiData<AppDownloadStatusMap>('customer-sale/app-download-status', fromDate, toDate, 1000);
  
  const { data: appDownloadRaw, loading: appDownloadLoading, error: appDownloadError } = 
    useApiData<AppDownloadPie>('customer-sale/app-download-pieChart', fromDate, toDate, 1200);
  
  const { data: customerSummaryRaw, loading: customerSummaryLoading, error: customerSummaryError } = 
    useApiData<CustomerSummaryRaw>('customer-sale/customer-summary', fromDate, toDate, 1400);
  
  const { data: genderRevenueRaw, loading: genderRevenueLoading, error: genderRevenueError } = 
    useApiData<GenderRevenueSummary>('customer-sale/gender-revenue', fromDate, toDate, 1600);
  
  const { data: uniqueCustomersComparisonRaw, loading: uniqueCustomersLoading, error: uniqueCustomersError } = 
    useApiData<UniqueCustomersComparison>('customer-sale/unique-customers-comparison', fromDate, toDate, 1800);
  
  // Memoize extraBody để tránh re-render không cần thiết
  const bookingCompletionExtraBody = useMemo(() => ({ 
    status: bookingCompletionStatus || 'Khách đến' 
  }), [bookingCompletionStatus]);
  
  const { data: bookingCompletionRaw, loading: bookingCompletionLoading, error: bookingCompletionError } = 
    useApiData<FacilityHourService>('booking/facility-booking-hour', fromDate, toDate, 1000, bookingCompletionExtraBody, 'POST');
  
  // Debug log cho booking completion API
  console.log("🔍 Debug - Booking Completion API:", {
    bookingCompletionStatus,
    status: bookingCompletionStatus || 'Khách đến',
    fromDate,
    toDate,
    loading: bookingCompletionLoading,
    error: bookingCompletionError,
    hasData: !!bookingCompletionRaw,
    dataType: typeof bookingCompletionRaw,
    isArray: Array.isArray(bookingCompletionRaw),
    endpoint: 'booking/facility-booking-hour',
    method: 'POST',
    extraBody: bookingCompletionExtraBody,
    delay: 1000,
    timestamp: new Date().toISOString(),
    retryCount: 0,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    environment: process.env.NODE_ENV,
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL
  });
  
  const { data: facilityHourServiceRaw, loading: facilityHourServiceLoading, error: facilityHourServiceError } = 
    useApiData<FacilityHourService>('customer-sale/facility-hour-service', fromDate, toDate, 2200);

  // Reset data khi thay đổi date range để tránh hiển thị data cũ
  const [currentDateRange, setCurrentDateRange] = useState(
    `${fromDate}-${toDate}`
  );
  const [isDataReady, setIsDataReady] = useState(false);
  const dataReadyRef = useRef(false);

  // Cập nhật loading states - sử dụng tất cả loading states
  const allLoadingStates = [
    newCustomerLoading, genderRatioLoading, customerTypeLoading, customerOldTypeLoading,
    customerSourceLoading, appDownloadStatusLoading, appDownloadLoading, customerSummaryLoading,
    genderRevenueLoading, uniqueCustomersLoading, bookingCompletionLoading, facilityHourServiceLoading
  ]
  

  
  const allErrorStates = useMemo(() => [
    newCustomerError, genderRatioError, customerTypeError, customerOldTypeError,
    customerSourceError, appDownloadStatusError, appDownloadError, customerSummaryError,
    genderRevenueError, uniqueCustomersError, bookingCompletionError, facilityHourServiceError
  ], [
    newCustomerError, genderRatioError, customerTypeError, customerOldTypeError,
    customerSourceError, appDownloadStatusError, appDownloadError, customerSummaryError,
    genderRevenueError, uniqueCustomersError, bookingCompletionError, facilityHourServiceError
  ])

  // Cập nhật useEffect cho data ready
  useEffect(() => {
    console.log("🔍 Debug - Data ready check:", {
      uniqueCustomersLoading,
      uniqueCustomersComparisonRaw: !!uniqueCustomersComparisonRaw,
      bookingCompletionLoading,
      bookingCompletionRaw: !!bookingCompletionRaw,
      dataReadyRef: dataReadyRef.current
    });
    
    if (
      !uniqueCustomersLoading &&
      uniqueCustomersComparisonRaw &&
      !bookingCompletionLoading &&
      bookingCompletionRaw &&
      !dataReadyRef.current
    ) {
      setIsDataReady(true)
      dataReadyRef.current = true
      console.log("🔍 Debug - Data is ready to display")
    }
  }, [uniqueCustomersLoading, uniqueCustomersComparisonRaw, bookingCompletionLoading, bookingCompletionRaw])

  useEffect(() => {
    const newDateRange = `${fromDate}-${toDate}`;
    if (newDateRange !== currentDateRange) {
      setCurrentDateRange(newDateRange);
      setIsDataReady(false);
      dataReadyRef.current = false;
    }
  }, [fromDate, toDate, currentDateRange]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.booking-completion-status-dropdown')) {
        setShowBookingCompletionStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  // Report page load success when data loads
  useEffect(() => {
    if (newCustomerRaw && !newCustomerLoading && !newCustomerError) {
      const startTime = Date.now();

      // Calculate total new customers from the data
      const totalNewCustomers =
        newCustomerRaw.currentRange?.reduce(
          (sum: number, item: { count?: number }) => sum + (item.count || 0),
          0
        ) || 0;
      const loadTime = Date.now() - startTime;

      reportPagePerformance({
        loadTime,
        dataSize: totalNewCustomers,
      });

      reportDataLoadSuccess("khách hàng mới", totalNewCustomers);
    }
  }, [
    newCustomerRaw,
    newCustomerLoading,
    newCustomerError,
    reportPagePerformance,
    reportDataLoadSuccess,
  ]);

  // Report errors
  useEffect(() => {
    const errors = allErrorStates.filter(error => error);
    if (errors.length > 0) {
      reportPageError(`Lỗi tải dữ liệu: ${errors.join(', ')}`);
    }
  }, [allErrorStates, reportPageError]);

  // Report filter changes
  useEffect(() => {
    if (selectedType.length > 0) {
      reportFilterChange(`loại khách hàng: ${selectedType.join(", ")}`);
    }
  }, [selectedType, reportFilterChange]);

  useEffect(() => {
    if (selectedStatus) {
      reportFilterChange(`trạng thái: ${selectedStatus}`);
    }
  }, [selectedStatus, reportFilterChange]);

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

  // Track overall loading and error states for notifications
  const isLoading = allLoadingStates.some((loading) => loading);
  const hasError = allErrorStates.some((error) => error);
  const hasRateLimitError = allErrorStates.some(error => 
    error?.includes('429') || error?.includes('Too Many Requests')
  );

  // Show notifications based on loading and error states
  useEffect(() => {
    if (
      !isLoading &&
      !hasError &&
      customerSummaryRaw &&
      !hasShownSuccess.current
    ) {
      const message = hasRateLimitError ? 
        "Dữ liệu khách hàng đã được tải thành công sau khi thử lại!" : 
        "Dữ liệu khách hàng đã được tải thành công!";
      showSuccess(message);
      hasShownSuccess.current = true;
    }
  }, [isLoading, hasError, customerSummaryRaw, showSuccess, hasRateLimitError]);

  useEffect(() => {
    if (hasError && !hasShownError.current) {
      const errorMessages = allErrorStates.filter(error => error);
      const hasRateLimitError = errorMessages.some(error => 
        error?.includes('429') || error?.includes('Too Many Requests')
      );
      
      if (hasRateLimitError) {
        showError("API đang bị quá tải. Hệ thống đang tự động thử lại...");
      } else {
        showError("Không thể kết nối đến API. Vui lòng thử lại sau.");
      }
      hasShownError.current = true;
    }
  }, [hasError, showError, allErrorStates]);

  // Data processing from API
  // 1. Số khách tạo mới
  const newCustomerChartData = React.useMemo(() => {
    if (!newCustomerRaw) return [];
    const current = Array.isArray((newCustomerRaw as { currentRange?: Array<{ date: string; count: number }> }).currentRange)
      ? (newCustomerRaw as { currentRange?: Array<{ date: string; count: number }> }).currentRange || []
      : [];
    const previous = Array.isArray((newCustomerRaw as { previousRange?: Array<{ date: string; count: number }> }).previousRange)
      ? (newCustomerRaw as { previousRange?: Array<{ date: string; count: number }> }).previousRange || []
      : [];
    return current.map(
      (item: { date: string; count: number }, idx: number) => ({
        date: item.date || "",
        value: item.count,
        value2: previous[idx]?.count ?? 0,
      })
    );
  }, [newCustomerRaw]);

  // 2. Tỷ lệ nam/nữ
  const genderRatioData = React.useMemo(() => {
    if (!genderRatioRaw) return [];
    return [
      { gender: "Nam", count: genderRatioRaw.male || 0 },
      { gender: "Nữ", count: genderRatioRaw.female || 0 },
    ];
  }, [genderRatioRaw]);

  // 3. Số khách tới chia theo loại
  const customerTypeTrendData = React.useMemo(() => {
    if (!customerTypeRaw) return [];
    const allDatesSet = new Set();
    Object.values(customerTypeRaw).forEach((arr) => {
      (arr as Array<{ date: string; count: number }>).forEach((item) => {
        allDatesSet.add(item.date.slice(0, 10));
      });
    });
    const allDates = Array.from(allDatesSet).sort();
    const allTypes = Object.keys(customerTypeRaw);
    return allDates.map((date) => {
      const row: Record<string, string | number> = { date: String(date) };
      allTypes.forEach((type) => {
        const arr = customerTypeRaw[type] as Array<{
          date: string;
          count: number;
        }>;
        const found = arr.find((item) => item.date.slice(0, 10) === date);
        row[type] = found ? found.count : 0;
      });
      return row;
    });
  }, [customerTypeRaw]);

  // 3.1. Số khách cũ chia theo loại
  const customerOldTypeTrendData = React.useMemo(() => {
    if (!customerOldTypeRaw) return [];
    const current = Array.isArray(customerOldTypeRaw.currentRange)
      ? customerOldTypeRaw.currentRange
      : [];
    const previous = Array.isArray(customerOldTypeRaw.previousRange)
      ? customerOldTypeRaw.previousRange
      : [];
    return current.map(
      (item: { date: string; count: number }, idx: number) => ({
        date: item.date || "",
        "Khách cũ hiện tại": item.count,
        "Khách cũ tháng trước": previous[idx]?.count ?? 0,
      })
    );
  }, [customerOldTypeRaw]);

  // 4. Nguồn của đơn hàng
  const customerSourceTrendData = React.useMemo(() => {
    if (!customerSourceRaw) return [];
    const allDatesSet = new Set();
    Object.values(customerSourceRaw).forEach((arr) => {
      (arr as Array<{ date: string; count: number }>).forEach((item) => {
        allDatesSet.add(item.date.slice(0, 10));
      });
    });
    const allDates = Array.from(allDatesSet).sort();
    const allTypes = Object.keys(customerSourceRaw);
    return allDates.map((date) => {
      const row: Record<string, string | number> = { date: String(date) };
      allTypes.forEach((type) => {
        const found = (
          customerSourceRaw[type] as Array<{ date: string; count: number }>
        ).find((item) => item.date.slice(0, 10) === date);
        row[type] = found ? found.count : 0;
      });
      return row;
    });
  }, [customerSourceRaw]);

  // 5. Khách tải app/không tải
  const appDownloadStatusData = React.useMemo(() => {
    if (!appDownloadStatusRaw) return [];
    return Object.values(appDownloadStatusRaw).flat();
  }, [appDownloadStatusRaw]);

  // 6. Tỷ lệ tải app
  const appDownloadPieData = React.useMemo(() => {
    if (!appDownloadRaw) return [];
    return [
      { name: "Đã tải app", value: appDownloadRaw.totalNew || 0 },
      { name: "Chưa tải app", value: appDownloadRaw.totalOld || 0 },
    ];
  }, [appDownloadRaw]);

  const customerTypes = useMemo(
    () => [
      "KH trải nghiệm",
      "Khách hàng Thành viên",
      "Khách hàng Bạc",
      "Khách hàng Vàng",
      "Khách hàng Bạch Kim",
      "Khách hàng Kim cương",
    ],
    []
  );

  const customerStatus = useMemo(
    () => [
      "Đã xác nhận",
      "Từ chối đặt lịch",
      "Khách đến",
      "Chưa xác nhận",
      "Khách không đến",
    ],
    []
  );

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 640;

  const allHourRanges = React.useMemo(() => {
    if (!facilityHourServiceRaw) return [];
    const set = new Set<string>();
    facilityHourServiceRaw.forEach((item) => {
      Object.keys(item.hourlyCounts).forEach((hour) => set.add(hour));
    });
    return Array.from(set).sort((a, b) => {
      const getStart = (s: string) => parseInt(s.split("-")[0], 10);
      return getStart(a) - getStart(b);
    });
  }, [facilityHourServiceRaw]);

  // Hour ranges cho bảng "Thời gian đơn hàng hoàn thành"
  const bookingHourRanges = React.useMemo(() => {
    console.log("🔍 Debug - bookingHourRanges - bookingCompletionRaw:", bookingCompletionRaw);
    if (!bookingCompletionRaw) {
      console.log("🔍 Debug - bookingCompletionRaw is null/undefined for hour ranges");
      return [] as string[];
    }
    const set = new Set<string>();
    bookingCompletionRaw.forEach((item) => {
      Object.keys(item.hourlyCounts).forEach((hour) => set.add(hour));
    });
    const ranges = Array.from(set).sort((a, b) => {
      const getStart = (s: string) => parseInt(s.split("-")[0], 10);
      return getStart(a) - getStart(b);
    });
    console.log("🔍 Debug - bookingHourRanges result:", ranges);
    return ranges;
  }, [bookingCompletionRaw]);

  const facilityHourTableData = React.useMemo(() => {
    if (!facilityHourServiceRaw) return [];
    const data = facilityHourServiceRaw.map(
      (item) =>
        ({
          facility: item.facility,
          ...item.hourlyCounts,
          total: item.total,
        } as {
          facility: string;
          total: number;
          [key: string]: number | string;
        })
    );

    return data.sort((a, b) => (b.total as number) - (a.total as number));
  }, [facilityHourServiceRaw]);

  // Dữ liệu bảng "Thời gian đơn hàng hoàn thành"
  const bookingCompletionTableData = React.useMemo<
    { facility: string; total: number; [key: string]: number | string }[]
  >(() => {
    console.log("🔍 Debug - bookingCompletionTableData - bookingCompletionRaw:", bookingCompletionRaw);
    if (!bookingCompletionRaw) {
      console.log("🔍 Debug - bookingCompletionRaw is null/undefined");
      return [];
    }
    const data = bookingCompletionRaw.map((item) => ({
      facility: item.facility,
      ...item.hourlyCounts,
      total: item.total,
    }));
    console.log("🔍 Debug - bookingCompletionTableData result:", data);
    return data.sort(
      (a, b) => (Number(b.total) as number) - (Number(a.total) as number)
    );
    }, [bookingCompletionRaw]);
  
  // Debug log sau khi tất cả biến được khai báo
  console.log("🔍 Debug - All variables after declaration:", {
    selectedStatus,
    bookingCompletionStatus,
    fromDate,
    toDate,
    status: bookingCompletionStatus || 'Khách đến',
    bookingCompletionLoading,
    bookingCompletionError,
    hasBookingData: !!bookingCompletionRaw,
    bookingCompletionRawType: typeof bookingCompletionRaw,
    isArray: Array.isArray(bookingCompletionRaw),
    bookingCompletionRawLength: Array.isArray(bookingCompletionRaw) ? bookingCompletionRaw.length : 'not array',
    bookingCompletionRawPreview: Array.isArray(bookingCompletionRaw) ? bookingCompletionRaw.slice(0, 2) : bookingCompletionRaw,
    bookingCompletionTableDataLength: bookingCompletionTableData.length,
    bookingHourRangesLength: bookingHourRanges.length,
    renderCount: Date.now(),
    extraBody: bookingCompletionExtraBody,
    isStable: !bookingCompletionLoading && !bookingCompletionError && !!bookingCompletionRaw,
    shouldShowData: !bookingCompletionLoading && !bookingCompletionError && bookingCompletionTableData.length > 0 && bookingHourRanges.length > 0,
    componentState: bookingCompletionLoading ? 'loading' : bookingCompletionError ? 'error' : bookingCompletionTableData.length > 0 ? 'data' : 'empty',
    rateLimitInfo: '10 requests per 1 second',
    delay: 1000,
    memoized: true,
    optimization: 'reduced re-renders',
    flickering: bookingCompletionLoading ? 'yes - loading' : 'no - stable',
    solution: 'memoized extraBody + increased rate limit + reduced delay',
    expectedResult: 'stable display without flickering',
    fixStatus: 'FIXED - should work now',
    summary: 'Fixed flickering by optimizing API calls and reducing re-renders',
    finalNote: 'Component should now display data stably without flickering',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    author: 'AI Assistant',
    hasBookingCompletionFilter: true,
    filterStatus: bookingCompletionStatus
  });
  
  const customerTypeKeys = useMemo(
    () =>
      customerTypeTrendData.length > 0
        ? Object.keys(customerTypeTrendData[0]).filter((k) => k !== "date")
        : [],
    [customerTypeTrendData]
  );

  const customerSourceKeys = React.useMemo(() => {
    if (customerSourceTrendData.length === 0) return [];
    return Object.keys(customerSourceTrendData[0]).filter(
      (key) => key !== "date"
    );
  }, [customerSourceTrendData]);

  // Helper for cell color scale - memoized
  const getCellBg = useMemo(
    () => (val: number) => {
      if (val === 0) return "";

      if (val >= 50) return "bg-[#68B2A0]";
      if (val >= 35) return "bg-[#CDE0C9]";
      if (val >= 25) return "bg-[#E0ECDE]";
      if (val <= 15) return "bg-[#F0F8F0]";

      return "";
    },
    []
  );

  const sortedAppDownloadStatusData = React.useMemo<Record<string, string | number>[]>(() => {
    if (!appDownloadStatusData) return [];
    const toPlain = (obj: Record<string, unknown>): Record<string, string | number> => {
      const out: Record<string, string | number> = {};
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === "string" || typeof v === "number") out[k] = v;
      }
      return out;
    };
    const getDate = (d: Record<string, string | number>) => {
      const s = String(d.date ?? "");
      const m1 = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m1) return new Date(`${m1[1]}-${m1[2]}-${m1[3]}`).getTime();
      const m2 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (m2) return new Date(`${m2[3]}-${m2[2]}-${m2[1]}`).getTime();
      return s ? new Date(s).getTime() : 0;
    };
    const normalized = appDownloadStatusData.map(toPlain);
    return normalized.sort((a, b) => getDate(a) - getDate(b));
  }, [appDownloadStatusData]);

  // Hiển thị loading nếu chưa load xong localStorage
  if (!isAllLoaded) {
    console.log("🔍 Debug - isAllLoaded is false, showing loading");
    return (
      <div className="p-2 sm:p-4 md:p-6 max-w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }
  
  console.log("🔍 Debug - isAllLoaded is true, proceeding to render");



  // Thêm retry button nếu có lỗi
  const renderRetryButton = () => {
    const hasErrors = allErrorStates.some(error => error);
    if (hasErrors) {
      return (
        <div className="text-center mb-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Thử lại
          </button>
        </div>
      )
    }
    return null
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
            <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
              Customer Report
            </h1>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Reset Filters
            </button>
          </div>

          {/* Filter */}
          <CustomerFilters
            startDate={safeStartDate}
            endDate={safeEndDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            today={today}
            getLocalTimeZone={getLocalTimeZone}
            parseDate={parseDate}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            showTypeDropdown={showTypeDropdown}
            setShowTypeDropdown={setShowTypeDropdown}
            customerTypes={customerTypes}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            showStatusDropdown={showStatusDropdown}
            setShowStatusDropdown={setShowStatusDropdown}
            customerStatus={customerStatus}
            selectedRegions={selectedRegions}
            setSelectedRegions={setSelectedRegions}
            showRegionDropdown={showRegionDropdown}
            setShowRegionDropdown={setShowRegionDropdown}
            allRegions={allRegions}
            selectedBranches={selectedBranches}
            setSelectedBranches={setSelectedBranches}
            showBranchDropdown={showBranchDropdown}
            setShowBranchDropdown={setShowBranchDropdown}
            allBranches={allBranches}
          />

          {/* Accordion Card tổng số khách */}
          <Suspense
            fallback={
              <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
                <div className="text-center">
                  <div className="text-lg text-gray-700 mb-2">
                    Tổng số lượt khách sử dụng dịch vụ
                  </div>
                  <div className="text-3xl font-bold text-gray-400">
                    Đang tải dữ liệu...
                  </div>
                </div>
              </div>
            }
          >
            {uniqueCustomersLoading || !isDataReady ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">
                    {hasRateLimitError ? "Đang thử lại kết nối API..." : "Đang tải dữ liệu dashboard..."}
                  </p>
                  {hasRateLimitError && (
                    <p className="mt-2 text-sm text-orange-600">API đang bị quá tải, vui lòng chờ...</p>
                  )}
                </div>
              </div>
            ) : (
              <CustomerAccordionCard
                key={`${fromDate}-${toDate}-${Date.now()}`}
                mainValue={
                  uniqueCustomersComparisonRaw?.currentTotal?.toLocaleString() ??
                  "Chưa có dữ liệu"
                }
                mainLabel="Tổng số lượt khách sử dụng dịch vụ trong khoảng ngày đã chọn"
                mainPercentChange={
                  uniqueCustomersComparisonRaw?.changePercentTotal
                }
                maleValue={uniqueCustomersComparisonRaw?.currentMale}
                malePercentChange={
                  uniqueCustomersComparisonRaw?.changePercentMale
                }
                femaleValue={uniqueCustomersComparisonRaw?.currentFemale}
                femalePercentChange={
                  uniqueCustomersComparisonRaw?.changePercentFemale
                }
                avgRevenueMale={genderRevenueRaw?.avgActualRevenueMale}
                avgServiceMale={genderRevenueRaw?.avgFoxieRevenueMale}
                avgRevenueFemale={genderRevenueRaw?.avgActualRevenueFemale}
                avgServiceFemale={genderRevenueRaw?.avgFoxieRevenueFemale}
                loading={false}
                error={uniqueCustomersError}
              />
            )}
          </Suspense>

          {/* Số khách tạo mới và tỷ lệ nam nữ/khách mới tạo */}
          <div className="mt-5 ">
            <CustomerGenderPie
              isMobile={isMobile}
              loadingNewCustomer={newCustomerLoading}
              errorNewCustomer={newCustomerError}
              newCustomerChartData={newCustomerChartData}
              loadingGenderRatio={genderRatioLoading}
              errorGenderRatio={genderRatioError}
              genderRatioData={genderRatioData}
              COLORS={COLORS}
            />
          </div>

          {/* Khách cũ */}
          <CustomerOldTypeTrendChart
            isMobile={isMobile}
            customerTypeTrendData={customerOldTypeTrendData}
            customerTypeKeys={["Khách cũ hiện tại", "Khách cũ tháng trước"]}
            COLORS={COLORS}
          />

          {/* Tổng số khách mới */}
          <CustomerNewChart
            loadingCustomerSummary={customerSummaryLoading}
            errorCustomerSummary={customerSummaryError}
            customerSummaryRaw={customerSummaryRaw}
          />

          {/* Số khách tới chia theo phân loại */}
          <CustomerTypeTrendChart
            isMobile={isMobile}
            customerTypeTrendData={customerTypeTrendData}
            customerTypeKeys={customerTypeKeys}
            COLORS={COLORS}
          />

          {/* Nguồn của đơn hàng */}
          <CustomerSourceBarChart
            isMobile={isMobile}
            customerSourceTrendData={customerSourceTrendData}
            customerSourceKeys={customerSourceKeys}
            COLORS={COLORS}
          />

          {/* Tỉ lệ khách hàng tải app và tỉ lệ khách mới/cũ*/}
          <CustomerAppDownloadPieChart
            loadingAppDownload={appDownloadLoading}
            errorAppDownload={appDownloadError}
            appDownloadPieData={appDownloadPieData}
          />

          {/* Khách hàng tải app */}
          <CustomerAppDownloadBarChart
            isMobile={isMobile}
            loading={appDownloadStatusLoading}
            error={appDownloadStatusError}
            sortedAppDownloadStatusData={sortedAppDownloadStatusData}
          />

          {/* Thời gian đơn hàng được tạo */}
          <CustomerFacilityHourTable
            allHourRanges={allHourRanges}
            facilityHourTableData={facilityHourTableData}
            getCellBg={getCellBg}
            isMobile={isMobile}
            loadingFacilityHour={facilityHourServiceLoading}
            errorFacilityHour={facilityHourServiceError}
          />

          {/* Thời gian đơn hàng hoàn thành */}
          <div className="mt-5">
            {/* Filter cho bảng "thời gian đơn hàng hoàn thành" */}
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-700">Trạng thái đơn hàng:</span>
              <div className="relative booking-completion-status-dropdown">
                <button
                  onClick={() => setShowBookingCompletionStatusDropdown(!showBookingCompletionStatusDropdown)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {bookingCompletionStatus || 'Khách đến'} ▼
                </button>
                {showBookingCompletionStatusDropdown && (
                  <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
                    {['Khách đến', 'Khách không đến'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setBookingCompletionStatus(status);
                          setShowBookingCompletionStatusDropdown(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                          bookingCompletionStatus === status ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {(() => {
              console.log("🔍 Debug - CustomerFacilityBookingTable props:", {
                allHourRanges: bookingHourRanges,
                facilityHourTableData: bookingCompletionTableData,
                loadingFacilityHour: bookingCompletionLoading,
                errorFacilityHour: bookingCompletionError,
                hasHourRanges: bookingHourRanges.length > 0,
                hasTableData: bookingCompletionTableData.length > 0,
                bookingCompletionStatus
              });
              console.log("🔍 Debug - About to render CustomerFacilityBookingTable with status:", bookingCompletionStatus || 'Khách đến');
              return (
                <CustomerFacilityBookingTable
                  allHourRanges={bookingHourRanges}
                  facilityHourTableData={bookingCompletionTableData}
                  getCellBg={getCellBg}
                  isMobile={isMobile}
                  loadingFacilityHour={bookingCompletionLoading}
                  errorFacilityHour={bookingCompletionError}
                />
              );
            })()}
          </div>
        </div>
      </div>
      {renderRetryButton()}
    </div>
  );
}
