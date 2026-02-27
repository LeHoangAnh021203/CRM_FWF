"use client";
import React, { useEffect, useRef } from "react";
import { Notification, useNotification } from "@/app/components/notification";
import {
  useLocalStorageState,
  clearLocalStorageKeys,
} from "@/app/hooks/useLocalStorageState";
import { usePageStatus } from "@/app/hooks/usePageStatus";
import { useWindowWidth } from "@/app/hooks/useWindowWidth";
import { useDateRange } from "@/app/contexts/DateContext";
import { AccountingHeaderSection } from "./sections/header/AccountingHeaderSection";
import { AccountingChartsSection } from "./sections/charts/AccountingChartsSection";
import { useAccountingApiData } from "./hooks/useAccountingApiData";
import { ACCOUNTING_ENDPOINTS, accountingUrl } from "./queries";
import type {
  CustomerSummaryData,
  PaymentByRegionRow,
  PaymentPercentData,
} from "./types";
import {
  buildPaymentPercentPieData,
  buildPaymentRegionData,
} from "./transformers";

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

export default function AccountingReportPage() {
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();
  const hasShownSuccess = useRef(false);
  const hasShownError = useRef(false);
  const { reportFilterChange, reportResetFilters } =
    usePageStatus("accounting");

  const resetFilters = () => {
    clearCustomerFilters();
    setSelectedType([]);
    setSelectedStatus(null);
    setSelectedRegions([]);
    setSelectedBranches([]);
    showSuccess("Đã reset tất cả filter về mặc định!");
    reportResetFilters();
  };

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

  // Kiểm tra xem tất cả localStorage đã được load chưa
  const isAllLoaded =
    selectedTypeLoaded &&
    selectedStatusLoaded &&
    dateLoaded &&
    selectedRegionsLoaded &&
    selectedBranchesLoaded;

  // fromDate and toDate are now provided by the global date context

  // API calls
  const {
    data: customerSummaryRaw,
    loading: loadingCustomerSummary,
    error: errorCustomerSummary,
  } = useAccountingApiData<CustomerSummaryData>(
    accountingUrl(ACCOUNTING_ENDPOINTS.customerSummary),
    fromDate,
    toDate,
    0
  );

  const { data: paymentPercentNewRaw } = useAccountingApiData<
    PaymentPercentData
  >(accountingUrl(ACCOUNTING_ENDPOINTS.paymentPercentNew), fromDate, toDate, 1);

  const { data: paymentPercentOldRaw } = useAccountingApiData<
    PaymentPercentData
  >(accountingUrl(ACCOUNTING_ENDPOINTS.paymentPercentOld), fromDate, toDate, 2);

  const {
    data: paymentByRegionData,
    loading: paymentByRegionLoading,
    error: paymentByRegionError,
  } = useAccountingApiData<PaymentByRegionRow[]>(
    accountingUrl(ACCOUNTING_ENDPOINTS.paymentByRegion),
    fromDate,
    toDate,
    3
  );

  // Track overall loading and error states for notifications
  const allLoadingStates = [loadingCustomerSummary, paymentByRegionLoading];
  const allErrorStates = [errorCustomerSummary, paymentByRegionError];
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
      showSuccess("Dữ liệu kế toán đã được tải thành công!");
      hasShownSuccess.current = true;
    }
  }, [isLoading, hasError, customerSummaryRaw, showSuccess]);

  useEffect(() => {
    if (hasError && !hasShownError.current) {
      showError("Không thể kết nối đến API. Vui lòng thử lại sau.");
      hasShownError.current = true;
    }
  }, [hasError, showError]);

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

  // Tỉ lệ các hình thức thanh toán (khách mới)
  const paymentPercentNewPieData = React.useMemo(
    () => buildPaymentPercentPieData(paymentPercentNewRaw),
    [paymentPercentNewRaw]
  );

  // Tỉ lệ các hình thức thanh toán (khách cũ)
  const paymentPercentOldPieData = React.useMemo(
    () => buildPaymentPercentPieData(paymentPercentOldRaw),
    [paymentPercentOldRaw]
  );

  // Xử lý dữ liệu cho chart hình thức thanh toán theo vùng
  const paymentRegionData = React.useMemo(
    () => buildPaymentRegionData(paymentByRegionData),
    [paymentByRegionData]
  );

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 640;

  // Hiển thị loading nếu chưa load xong localStorage
  if (!isAllLoaded) {
    return (
      <div className='p-2 sm:p-4 md:p-6 max-w-full'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-lg text-gray-600'>Đang tải dữ liệu...</div>
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
        <AccountingHeaderSection onReset={resetFilters} />
        <AccountingChartsSection
          isMobile={isMobile}
          paymentPercentNewPieData={paymentPercentNewPieData}
          paymentPercentOldPieData={paymentPercentOldPieData}
          paymentRegionData={paymentRegionData}
        />
      </div>
    </div>
  );
}
