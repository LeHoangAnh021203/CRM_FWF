"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Notification, useNotification } from "@/app/components/notification";
import {
  useLocalStorageState,
  clearLocalStorageKeys,
} from "@/app/hooks/useLocalStorageState";
import { usePageStatus } from "@/app/hooks/usePageStatus";
import { useApiData, useApiGetData } from "@/app/hooks/useApiData";
import { useWindowWidth } from "@/app/hooks/useWindowWidth";
import { useDateRange } from "@/app/contexts/DateContext";
import { useCustomerSearchNavigation } from "./hooks/useCustomerSearchNavigation";
import { CustomerSummarySection } from "./sections/summary/CustomerSummarySection";
import { CustomerTrendsSection } from "./sections/trends/CustomerTrendsSection";
import { CustomerFacilitySection } from "./sections/facility/CustomerFacilitySection";
import { CustomerBookingCompletionSection } from "./sections/facility/CustomerBookingCompletionSection";
import {
  buildCustomerBreakdowns,
  getCustomerList,
  getTotalCustomers,
} from "@/app/lib/customers";
import type {
  AppDownloadPie,
  AppDownloadStatusMap,
  CustomerAllResponse,
  CustomerSummaryRaw,
  FacilityHourService,
  LineChartRanges,
  TrendSeriesMap,
  UniqueCustomersComparison,
} from "./types";
import { CUSTOMER_ENDPOINTS, customerUrl } from "./queries";
import {
  buildAllHourRanges,
  buildAppDownloadPieData,
  buildAppDownloadStatusData,
  buildBookingCompletionTableData,
  buildCustomerOldTypeTrendData,
  buildCustomerSourceTrendData,
  buildCustomerTypeTrendData,
  buildFacilityHourTableData,
  buildSortedAppDownloadStatusData,
} from "./transformers";

// ==== Types are centralized in ./types ====

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

export default function CustomerReportPage() {
  useCustomerSearchNavigation();
  // CSS để đảm bảo dropdown hiển thị đúng
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .booking-completion-status-dropdown {
        position: relative !important;
        z-index: 99999 !important;
      }
      .booking-completion-status-dropdown .dropdown-menu {
        position: fixed !important;
        z-index: 999999 !important;
        pointer-events: auto !important;
        background: white !important;
        border: 1px solid #d1d5db !important;
        border-radius: 0.375rem !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
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

  // Use global date context instead of local state
  const { fromDate, toDate, isLoaded: dateLoaded } = useDateRange();

  const [selectedRegions, setSelectedRegions, selectedRegionsLoaded] =
    useLocalStorageState<string[]>("customer-selectedRegions", []);
  const [selectedBranches, setSelectedBranches, selectedBranchesLoaded] =
    useLocalStorageState<string[]>("customer-selectedBranches", []);

  // Filter status riêng cho bảng "thời gian đơn hàng hoàn thành"
  const [
    bookingCompletionStatus,
    setBookingCompletionStatus,
    bookingCompletionStatusLoaded,
  ] = useLocalStorageState<string | null>(
    "customer-bookingCompletionStatus",
    "Khách đến"
  );
  const [
    showBookingCompletionStatusDropdown,
    setShowBookingCompletionStatusDropdown,
  ] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".booking-completion-status-dropdown")) {
        setShowBookingCompletionStatusDropdown(false);
      }
    };

    if (showBookingCompletionStatusDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showBookingCompletionStatusDropdown]);

  // Tính toán vị trí dropdown
  const getDropdownStyle = () => {
    if (!dropdownRef.current || !showBookingCompletionStatusDropdown) {
      return {};
    }

    const rect = dropdownRef.current.getBoundingClientRect();
    return {
      position: "fixed" as const,
      top: rect.bottom + 4,
      left: rect.left,
      zIndex: 999999,
    };
  };

  const resetFilters = useMemo(
    () => () => {
      clearCustomerFilters();
      setSelectedType([]);
      setSelectedStatus(null);
      setBookingCompletionStatus("Khách đến");
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
      setSelectedRegions,
      setSelectedBranches,
    ]
  );

  // Kiểm tra xem tất cả localStorage đã được load chưa - đơn giản như trang service
  const isAllLoaded =
    dateLoaded &&
    selectedTypeLoaded &&
    selectedStatusLoaded &&
    bookingCompletionStatusLoaded &&
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
  // Format date cho API calls - đơn giản như trang service
  // fromDate and toDate are now provided by the global date context

  const {
    data: newCustomerRaw,
    loading: newCustomerLoading,
    error: newCustomerError,
  } = useApiData<LineChartRanges>(
    customerUrl(CUSTOMER_ENDPOINTS.newCustomer),
    fromDate,
    toDate
  );

  const {
    data: customerTypeRaw,
    loading: customerTypeLoading,
    error: customerTypeError,
  } = useApiData<TrendSeriesMap>(
    customerUrl(CUSTOMER_ENDPOINTS.customerType),
    fromDate,
    toDate
  );

  const {
    data: customerOldTypeRaw,
    loading: customerOldTypeLoading,
    error: customerOldTypeError,
  } = useApiData<LineChartRanges>(
    customerUrl(CUSTOMER_ENDPOINTS.customerOldType),
    fromDate,
    toDate
  );

  const {
    data: customerSourceRaw,
    loading: customerSourceLoading,
    error: customerSourceError,
  } = useApiData<TrendSeriesMap>(
    customerUrl(CUSTOMER_ENDPOINTS.customerSource),
    fromDate,
    toDate
  );

  const {
    data: appDownloadStatusRaw,
    loading: appDownloadStatusLoading,
    error: appDownloadStatusError,
  } = useApiData<AppDownloadStatusMap>(
    customerUrl(CUSTOMER_ENDPOINTS.appDownloadStatus),
    fromDate,
    toDate
  );

  const {
    data: appDownloadRaw,
    loading: appDownloadLoading,
    error: appDownloadError,
  } = useApiData<AppDownloadPie>(
    customerUrl(CUSTOMER_ENDPOINTS.appDownloadPie),
    fromDate,
    toDate
  );

  const {
    data: customerSummaryRaw,
    loading: customerSummaryLoading,
    error: customerSummaryError,
  } = useApiData<CustomerSummaryRaw>(
    customerUrl(CUSTOMER_ENDPOINTS.customerSummary),
    fromDate,
    toDate
  );

  const {
    data: uniqueCustomersComparisonRaw,
    loading: uniqueCustomersLoading,
    error: uniqueCustomersError,
  } = useApiData<UniqueCustomersComparison>(
    customerUrl(CUSTOMER_ENDPOINTS.uniqueCustomers),
    fromDate,
    toDate
  );

  const {
    data: rangedCustomersRaw,
    loading: rangedCustomersLoading,
    error: rangedCustomersError,
  } = useApiData<CustomerAllResponse>(
    customerUrl(CUSTOMER_ENDPOINTS.rangedCustomers),
    fromDate,
    toDate
  );

  const {
    data: allCustomersRaw,
    loading: allCustomersLoading,
    error: allCustomersError,
  } = useApiGetData<CustomerAllResponse | number>(
    customerUrl(CUSTOMER_ENDPOINTS.allCustomers)
  );

  // Memoize extraBody để tránh re-render không cần thiết
  const bookingCompletionExtraBody = useMemo(() => {
    const status = bookingCompletionStatus || "Khách đến";
    return {
      status,
    };
  }, [bookingCompletionStatus]);

  const {
    data: bookingCompletionRaw,
    loading: bookingCompletionLoading,
    error: bookingCompletionError,
  } = useApiData<FacilityHourService>(
    customerUrl(CUSTOMER_ENDPOINTS.bookingCompletion),
    fromDate,
    toDate,
    bookingCompletionExtraBody
  );

  const {
    data: facilityHourServiceRaw,
    loading: facilityHourServiceLoading,
    error: facilityHourServiceError,
  } = useApiData<FacilityHourService>(
    customerUrl(CUSTOMER_ENDPOINTS.facilityHourService),
    fromDate,
    toDate
  );

  const totalExistingCustomers = React.useMemo(
    () => getTotalCustomers(allCustomersRaw),
    [allCustomersRaw]
  );

  const totalCustomersInRange = React.useMemo(
    () => getTotalCustomers(rangedCustomersRaw),
    [rangedCustomersRaw]
  );

  // Tính breakdown từ ranged customers nếu có dữ liệu chi tiết
  const rangedCustomersList = React.useMemo(
    () => getCustomerList(rangedCustomersRaw),
    [rangedCustomersRaw]
  );

  // Breakdown từ ranged customers
  const rangedCustomersBreakdowns = React.useMemo(
    () => buildCustomerBreakdowns(rangedCustomersList),
    [rangedCustomersList]
  );

  // Reset data khi thay đổi date range để tránh hiển thị data cũ
  const [currentDateRange, setCurrentDateRange] = useState(
    `${fromDate}-${toDate}`
  );
  const dataReadyRef = useRef(false);

  // Cập nhật loading states - sử dụng tất cả loading states
  const allLoadingStates = [
    newCustomerLoading,
    customerTypeLoading,
    customerOldTypeLoading,
    customerSourceLoading,
    appDownloadStatusLoading,
    appDownloadLoading,
    customerSummaryLoading,
    uniqueCustomersLoading,
    rangedCustomersLoading,
    allCustomersLoading,
    bookingCompletionLoading,
    facilityHourServiceLoading,
  ];

  const allErrorStates = useMemo(
    () => [
      newCustomerError,
      customerTypeError,
      customerOldTypeError,
      customerSourceError,
      appDownloadStatusError,
      appDownloadError,
      customerSummaryError,
      uniqueCustomersError,
      rangedCustomersError,
      allCustomersError,
      bookingCompletionError,
      facilityHourServiceError,
    ],
    [
      newCustomerError,
      customerTypeError,
      customerOldTypeError,
      customerSourceError,
      appDownloadStatusError,
      appDownloadError,
      customerSummaryError,
      uniqueCustomersError,
      rangedCustomersError,
      allCustomersError,
      bookingCompletionError,
      facilityHourServiceError,
    ]
  );

  // Đơn giản hóa logic như trang service - không cần data ready check

  useEffect(() => {
    const newDateRange = `${fromDate}-${toDate}`;
    if (newDateRange !== currentDateRange) {
      setCurrentDateRange(newDateRange);
      dataReadyRef.current = false;
    }
  }, [fromDate, toDate, currentDateRange]);

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
    const errors = allErrorStates.filter((error) => error);
    if (errors.length > 0) {
      reportPageError(`Lỗi tải dữ liệu: ${errors.join(", ")}`);
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
  const hasRateLimitError = allErrorStates.some(
    (error) => error?.includes("429") || error?.includes("Too Many Requests")
  );

  // Show notifications based on loading and error states
  useEffect(() => {
    if (
      !isLoading &&
      !hasError &&
      customerSummaryRaw &&
      !hasShownSuccess.current
    ) {
      const message = hasRateLimitError
        ? "Dữ liệu khách hàng đã được tải thành công sau khi thử lại!"
        : "Dữ liệu khách hàng đã được tải thành công!";
      showSuccess(message);
      hasShownSuccess.current = true;
    }
  }, [isLoading, hasError, customerSummaryRaw, showSuccess, hasRateLimitError]);

  useEffect(() => {
    if (hasError && !hasShownError.current) {
      const errorMessages = allErrorStates.filter((error) => error);
      const hasRateLimitError = errorMessages.some(
        (error) =>
          error?.includes("429") || error?.includes("Too Many Requests")
      );

      if (hasRateLimitError) {
        showError("API đang bị quá tải. Hệ thống đang tự động thử lại...");
      } else {
        showError("Không thể kết nối đến API. Vui lòng thử lại sau.");
      }
      hasShownError.current = true;
    }
  }, [hasError, showError, allErrorStates]);

  // 3. Số khách tới chia theo loại
  const customerTypeTrendData = React.useMemo(
    () => buildCustomerTypeTrendData(customerTypeRaw),
    [customerTypeRaw]
  );

  // 3.1. Số khách cũ chia theo loại
  const customerOldTypeTrendData = React.useMemo(
    () => buildCustomerOldTypeTrendData(customerOldTypeRaw),
    [customerOldTypeRaw]
  );

  // 4. Nguồn của đơn hàng - gộp theo yêu cầu
  const customerSourceTrendData = React.useMemo(
    () => buildCustomerSourceTrendData(customerSourceRaw),
    [customerSourceRaw]
  );

  // 5. Khách tải app/không tải
  const appDownloadStatusData = React.useMemo(
    () => buildAppDownloadStatusData(appDownloadStatusRaw),
    [appDownloadStatusRaw]
  );

  // 6. Tỷ lệ tải app
  const appDownloadPieData = React.useMemo(
    () => buildAppDownloadPieData(appDownloadRaw),
    [appDownloadRaw]
  );

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 640;

  const allHourRanges = React.useMemo(
    () => buildAllHourRanges(facilityHourServiceRaw),
    [facilityHourServiceRaw]
  );

  // Hour ranges cho bảng "Thời gian đơn hàng hoàn thành"
  const bookingHourRanges = React.useMemo(
    () => buildAllHourRanges(bookingCompletionRaw),
    [bookingCompletionRaw]
  );

  const facilityHourTableData = React.useMemo(
    () => buildFacilityHourTableData(facilityHourServiceRaw),
    [facilityHourServiceRaw]
  );

  // Dữ liệu bảng "Thời gian đơn hàng hoàn thành"
  const bookingCompletionTableData = React.useMemo(
    () => buildBookingCompletionTableData(bookingCompletionRaw),
    [bookingCompletionRaw]
  );

  const customerTypeKeys = useMemo(
    () =>
      customerTypeTrendData.length > 0
        ? Object.keys(customerTypeTrendData[0]).filter((k) => k !== "date")
        : [],
    [customerTypeTrendData]
  );

  const customerSourceKeys = React.useMemo(() => {
    // Sử dụng các nhóm cố định theo yêu cầu
    return ["Fanpage", "App", "Ecommerce", "Vãng lai"];
  }, []);

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

  const sortedAppDownloadStatusData = React.useMemo(
    () => buildSortedAppDownloadStatusData(appDownloadStatusData),
    [appDownloadStatusData]
  );

  // Hiển thị loading nếu chưa load xong localStorage - đơn giản như trang service
  if (!isAllLoaded) {
    return (
      <div className="p-2 sm:p-4 md:p-6 max-w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  // Thêm retry button nếu có lỗi
  const renderRetryButton = () => {
    const hasErrors = allErrorStates.some((error) => error);
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
      );
    }
    return null;
  };

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

          <CustomerSummarySection
            fromDate={fromDate}
            toDate={toDate}
            uniqueCustomersComparisonRaw={uniqueCustomersComparisonRaw}
            uniqueCustomersLoading={uniqueCustomersLoading}
            uniqueCustomersError={uniqueCustomersError}
            customerSummaryRaw={customerSummaryRaw}
            customerSummaryLoading={customerSummaryLoading}
            customerSummaryError={customerSummaryError}
            totalCustomersInRange={totalCustomersInRange}
            totalExistingCustomers={totalExistingCustomers}
            rangedCustomersLoading={rangedCustomersLoading}
            rangedCustomersError={rangedCustomersError}
            rangedCustomersBreakdowns={rangedCustomersBreakdowns}
          />

          <CustomerTrendsSection
            isMobile={isMobile}
            COLORS={COLORS}
            customerSummaryRaw={customerSummaryRaw}
            customerSummaryLoading={customerSummaryLoading}
            customerSummaryError={customerSummaryError}
            customerOldTypeRaw={customerOldTypeRaw}
            customerOldTypeLoading={customerOldTypeLoading}
            customerOldTypeError={customerOldTypeError}
            customerOldTypeTrendData={customerOldTypeTrendData}
            customerTypeTrendData={customerTypeTrendData}
            customerTypeKeys={customerTypeKeys}
            customerSourceTrendData={customerSourceTrendData}
            customerSourceKeys={customerSourceKeys}
            appDownloadLoading={appDownloadLoading}
            appDownloadError={appDownloadError}
            appDownloadPieData={appDownloadPieData}
            appDownloadStatusLoading={appDownloadStatusLoading}
            appDownloadStatusError={appDownloadStatusError}
            sortedAppDownloadStatusData={sortedAppDownloadStatusData}
          />

          <CustomerFacilitySection
            allHourRanges={allHourRanges}
            facilityHourTableData={facilityHourTableData}
            getCellBg={getCellBg}
            isMobile={isMobile}
            loadingFacilityHour={facilityHourServiceLoading}
            errorFacilityHour={facilityHourServiceError}
          />

          <CustomerBookingCompletionSection
            bookingCompletionStatus={bookingCompletionStatus}
            setBookingCompletionStatus={setBookingCompletionStatus}
            showDropdown={showBookingCompletionStatusDropdown}
            setShowDropdown={setShowBookingCompletionStatusDropdown}
            dropdownRef={dropdownRef}
            getDropdownStyle={getDropdownStyle}
            bookingHourRanges={bookingHourRanges}
            bookingCompletionTableData={bookingCompletionTableData}
            getCellBg={getCellBg}
            isMobile={isMobile}
            loadingFacilityHour={bookingCompletionLoading}
            errorFacilityHour={bookingCompletionError}
          />
        </div>
      </div>
      {renderRetryButton()}
    </div>
  );
}
