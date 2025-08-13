"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  CalendarDate,
  today,
  getLocalTimeZone,
  parseDate,
} from "@internationalized/date";
import CustomerFacilityHourTable from "../customers/CustomerFacilityHourTable";
import CustomerFilters from "../customers/CustomerFilters";
import CustomerAccordionCard from "../customers/CustomerAccordionCard";
import CustomerGenderPie from "../customers/CustomerGenderPie";
import CustomerNewChart from "../customers/CustomerNewChart";
import CustomerTypeTrendChart from "../customers/CustomerTypeTrendChart";
import CustomerSourceBarChart from "../customers/CustomerSourceBarChart";
import CustomerAppDownloadBarChart from "../customers/CustomerAppDownloadBarChart";
import CustomerAppDownloadPieChart from "../customers/CustomerAppDownloadPieChart";
import { Notification, useNotification } from "@/components/notification";
import {
  useLocalStorageState,
  clearLocalStorageKeys,
} from "@/hooks/useLocalStorageState";
import { usePageStatus } from "@/hooks/usePageStatus";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Utility function để đảm bảo CalendarDate instances
function ensureCalendarDate(date: unknown): CalendarDate {
  if (date instanceof CalendarDate) {
    return date;
  }
  if (date && typeof date === 'object' && 'year' in date && 'month' in date && 'day' in date) {
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
    "customer-startDate",
    "customer-endDate",
    "customer-selectedRegions",
    "customer-selectedBranches",
  ]);
}

// Custom hook dùng chung cho fetch API động
function useApiData<T>(url: string, fromDate: string, toDate: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromDate, toDate }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("API error: " + res.status);
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [url, fromDate, toDate]);

  return { data, loading, error };
}

// Hook lấy width window
function useWindowWidth() {
  const [width, setWidth] = useState(1024);
  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  const resetFilters = () => {
    clearCustomerFilters();
    setSelectedType([]);
    setSelectedStatus(null);
    setStartDate(today(getLocalTimeZone()).subtract({ days: 7 }));
    setEndDate(today(getLocalTimeZone()));
    setSelectedRegions([]);
    setSelectedBranches([]);
    showSuccess("Đã reset tất cả filter về mặc định!");
    reportResetFilters();
  };

  // Sử dụng localStorage để lưu trữ state
  const [selectedType, setSelectedType] = useLocalStorageState<string[]>(
    "customer-selectedType",
    []
  );
  const [selectedStatus, setSelectedStatus] = useLocalStorageState<
    string | null
  >("customer-selectedStatus", null);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const [startDate, setStartDate] = useLocalStorageState<CalendarDate>(
    "customer-startDate",
    today(getLocalTimeZone()).subtract({ days: 7 })
  );
  const [endDate, setEndDate] = useLocalStorageState<CalendarDate>(
    "customer-endDate",
    today(getLocalTimeZone())
  );

  const [selectedRegions, setSelectedRegions] = useLocalStorageState<string[]>(
    "customer-selectedRegions",
    []
  );
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [selectedBranches, setSelectedBranches] = useLocalStorageState<
    string[]
  >("customer-selectedBranches", []);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);

  const COLORS = [
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
  ];

  const allRegions = ["Đã đóng cửa", "Đà Nẵng", "Nha Trang", "Hà Nội", "HCM"];
  const allBranches = ["Branch 1", "Branch 2", "Branch 3"];

  const safeStartDate = ensureCalendarDate(startDate);
  const safeEndDate = ensureCalendarDate(endDate);
  
  const fromDate = `${safeStartDate.year}-${String(safeStartDate.month).padStart(2, "0")}-${String(
    safeStartDate.day
  ).padStart(2, "0")}T00:00:00`;
  const toDate = `${safeEndDate.year}-${String(safeEndDate.month).padStart(2, "0")}-${String(
    safeEndDate.day
  ).padStart(2, "0")}T23:59:59`;

  // API calls
  const {
    data: newCustomerRaw,
    loading: loadingNewCustomer,
    error: errorNewCustomer,
  } = useApiData<{
    currentRange: { date: string; count: number }[];
    previousRange: { date: string; count: number }[];
  }>(
    `${API_BASE_URL}/api/customer-sale/new-customer-lineChart`,
    fromDate,
    toDate
  );

  const {
    data: genderRatioRaw,
    loading: loadingGenderRatio,
    error: errorGenderRatio,
  } = useApiData<{ male: number; female: number }>(
    `${API_BASE_URL}/api/customer-sale/gender-ratio`,
    fromDate,
    toDate
  );

  const { data: customerTypeRaw } = useApiData<
    Record<string, { date: string; count: number }[]>
  >(`${API_BASE_URL}/api/customer-sale/customer-type-trend`, fromDate, toDate);

  const { data: customerSourceRaw } = useApiData<
    Record<string, { date: string; count: number }[]>
  >(
    `${API_BASE_URL}/api/customer-sale/customer-source-trend`,
    fromDate,
    toDate
  );

  const {
    data: appDownloadStatusRaw,
    loading,
    error,
  } = useApiData<Record<string, { date: string; count: number }[]>>(
    `${API_BASE_URL}/api/customer-sale/app-download-status`,
    fromDate,
    toDate
  );

  const {
    data: appDownloadRaw,
    loading: loadingAppDownload,
    error: errorAppDownload,
  } = useApiData<{ totalNew: number; totalOld: number }>(
    `${API_BASE_URL}/api/customer-sale/app-download-pieChart`,
    fromDate,
    toDate
  );

  const {
    data: customerSummaryRaw,
    loading: loadingCustomerSummary,
    error: errorCustomerSummary,
  } = useApiData<{
    totalNewCustomers: number;
    actualCustomers: number;
    growthTotal?: number;
    growthActual?: number;
  }>(`${API_BASE_URL}/api/customer-sale/customer-summary`, fromDate, toDate);

  const {
    data: genderRevenueRaw,
    loading: loadingGenderRevenue,
    error: errorGenderRevenue,
  } = useApiData<{
    avgRevenueMale: number;
    avgRevenueFemale: number;
    avgServiceMale: number;
    avgServiceFemale: number;
  }>(`${API_BASE_URL}/api/customer-sale/gender-revenue`, fromDate, toDate);

  const { data: uniqueCustomersComparisonRaw } = useApiData<{
    currentTotal: number;
    previousTotal: number;
    changePercentTotal: number;
    currentMale: number;
    previousMale: number;
    changePercentMale: number;
    currentFemale: number;
    previousFemale: number;
    changePercentFemale: number;
  }>(
    `${API_BASE_URL}/api/customer-sale/unique-customers-comparison`,
    fromDate,
    toDate
  );

  const {
    data: facilityHourServiceRaw,
    loading: loadingFacilityHour,
    error: errorFacilityHour,
  } = useApiData<
    {
      facility: string;
      hourlyCounts: Record<string, number>;
      total: number;
    }[]
  >(
    `${API_BASE_URL}/api/customer-sale/facility-hour-service`,
    fromDate,
    toDate
  );

  // Report page load success when data loads
  useEffect(() => {
    if (newCustomerRaw && !loadingNewCustomer && !errorNewCustomer) {
      const startTime = Date.now();

      // Calculate total new customers from the data
      const totalNewCustomers =
        newCustomerRaw.currentRange?.reduce(
          (sum, item) => sum + (item.count || 0),
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
    loadingNewCustomer,
    errorNewCustomer,
    reportPagePerformance,
    reportDataLoadSuccess,
  ]);

  // Report errors
  useEffect(() => {
    if (errorNewCustomer) {
      reportPageError(`Lỗi tải dữ liệu khách hàng mới: ${errorNewCustomer}`);
    }
  }, [errorNewCustomer, reportPageError]);

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
  const allLoadingStates = [
    loadingNewCustomer,
    loadingGenderRatio,
    loading,
    loadingAppDownload,
    loadingCustomerSummary,
    loadingGenderRevenue,
    loadingFacilityHour,
  ];

  const allErrorStates = [
    errorNewCustomer,
    errorGenderRatio,
    error,
    errorAppDownload,
    errorCustomerSummary,
    errorGenderRevenue,
    errorFacilityHour,
  ];

  const isLoading = allLoadingStates.some((loading) => loading);
  const hasError = allErrorStates.some((error) => error);

  // Show notifications based on loading and error states
  useEffect(() => {
    if (
      !isLoading &&
      !hasError &&
      customerSummaryRaw &&
      !hasShownSuccess.current
    ) {
      showSuccess("Dữ liệu khách hàng đã được tải thành công!");
      hasShownSuccess.current = true;
    }
  }, [isLoading, hasError, customerSummaryRaw, showSuccess]);

  useEffect(() => {
    if (hasError && !hasShownError.current) {
      showError("Không thể kết nối đến API. Vui lòng thử lại sau.");
      hasShownError.current = true;
    }
  }, [hasError, showError]);

  // Data processing from API
  // 1. Số khách tạo mới
  const newCustomerChartData = React.useMemo(() => {
    if (!newCustomerRaw) return [];
    const current = Array.isArray(newCustomerRaw.currentRange)
      ? newCustomerRaw.currentRange
      : [];
    const previous = Array.isArray(newCustomerRaw.previousRange)
      ? newCustomerRaw.previousRange
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

  const customerTypes = [
    "KH trải nghiệm",
    "Khách hàng Thành viên",
    "Khách hàng Bạc",
    "Khách hàng Vàng",
    "Khách hàng Bạch Kim",
    "Khách hàng Kim cương",
  ];

  const customerStatus = ["New", "Old"];

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

  const customerTypeKeys =
    customerTypeTrendData.length > 0
      ? Object.keys(customerTypeTrendData[0]).filter((k) => k !== "date")
      : [];

  const customerSourceKeys = React.useMemo(() => {
    if (customerSourceTrendData.length === 0) return [];
    return Object.keys(customerSourceTrendData[0]).filter(
      (key) => key !== "date"
    );
  }, [customerSourceTrendData]);

  // Helper for cell color scale
  function getCellBg(val: number) {
    if (val === 0) return "";

    if (val >= 50) return "bg-[#68B2A0]";
    if (val >= 35) return "bg-[#CDE0C9]";
    if (val >= 25) return "bg-[#E0ECDE]";
    if (val <= 15) return "bg-[#F0F8F0]";

    return "";
  }

  const sortedAppDownloadStatusData = React.useMemo(() => {
    if (!appDownloadStatusData) return [];
    return [...appDownloadStatusData].sort((a, b) => {
      const getDate = (d: { date?: string }) => {
        if (!d.date) return 0;
        const match = String(d.date).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match)
          return new Date(`${match[1]}-${match[2]}-${match[3]}`).getTime();
        const match2 = String(d.date).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (match2)
          return new Date(`${match2[3]}-${match2[2]}-${match2[1]}`).getTime();
        return new Date(d.date).getTime();
      };
      return getDate(a) - getDate(b);
    });
  }, [appDownloadStatusData]);

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
          <CustomerAccordionCard
            mainValue={
              uniqueCustomersComparisonRaw?.currentTotal?.toLocaleString() ?? 0
            }
            mainLabel="Tổng số lượt khách sử dụng dịch vụ trong khoảng ngày đã chọn"
            mainPercentChange={uniqueCustomersComparisonRaw?.changePercentTotal}
            maleValue={uniqueCustomersComparisonRaw?.currentMale}
            malePercentChange={uniqueCustomersComparisonRaw?.changePercentMale}
            femaleValue={uniqueCustomersComparisonRaw?.currentFemale}
            femalePercentChange={
              uniqueCustomersComparisonRaw?.changePercentFemale
            }
            avgRevenueMale={genderRevenueRaw?.avgRevenueMale}
            avgServiceMale={genderRevenueRaw?.avgServiceMale}
            avgRevenueFemale={genderRevenueRaw?.avgRevenueFemale}
            avgServiceFemale={genderRevenueRaw?.avgServiceFemale}
          />

          {/* Số khách tạo mới và tỷ lệ nam nữ/khách mới tạo */}
          <div className="mt-5 ">
            <CustomerGenderPie
              isMobile={isMobile}
              loadingNewCustomer={loadingNewCustomer}
              errorNewCustomer={errorNewCustomer}
              newCustomerChartData={newCustomerChartData}
              loadingGenderRatio={loadingGenderRatio}
              errorGenderRatio={errorGenderRatio}
              genderRatioData={genderRatioData}
              COLORS={COLORS}
            />
          </div>

          {/* Tổng số khách mới */}
          <CustomerNewChart
            loadingCustomerSummary={loadingCustomerSummary}
            errorCustomerSummary={errorCustomerSummary}
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
            loadingAppDownload={loadingAppDownload}
            errorAppDownload={errorAppDownload}
            appDownloadPieData={appDownloadPieData}
          />

          {/* Khách hàng tải app */}
          <CustomerAppDownloadBarChart
            isMobile={isMobile}
            loading={loading}
            error={error}
            sortedAppDownloadStatusData={sortedAppDownloadStatusData}
          />

          {/* Thời gian đơn hàng được tạo */}
          <CustomerFacilityHourTable
            allHourRanges={allHourRanges}
            facilityHourTableData={facilityHourTableData}
            getCellBg={getCellBg}
            isMobile={isMobile}
            loadingFacilityHour={loadingFacilityHour}
            errorFacilityHour={errorFacilityHour}
          />
        </div>
      </div>
    </div>
  );
}
