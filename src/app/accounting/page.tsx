"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  CalendarDate,
  today,
  getLocalTimeZone,
  parseDate,
} from "@internationalized/date";

import CustomerFilters from "../customers/CustomerFilters";
import CustomerPaymentPieChart from "./CustomerPaymentPieChart";
import OrderPaymentRegionData from "./OrderPaymentRegionData";
import { Notification, useNotification } from "@/components/notification";
import {
  useLocalStorageState,
  clearLocalStorageKeys,
} from "@/hooks/useLocalStorageState";
import { usePageStatus } from "@/hooks/usePageStatus";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

  const allRegions = ["Đã đóng cửa", "Đà Nẵng", "Nha Trang", "Hà Nội", "HCM"];
  const allBranches = ["Branch 1", "Branch 2", "Branch 3"];

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

  // API calls
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

  const { data: paymentPercentNewRaw } = useApiData<{
    totalCash: number;
    totalTransfer: number;
    totalCreditCard: number;
    totalPrepaidCard: number;
    totalDebt: number;
    percentCash?: number;
    percentTransfer?: number;
    percentPrepaidCard?: number;
    percentDebt?: number;
  }>(`${API_BASE_URL}/api/customer-sale/payment-percent-new`, fromDate, toDate);

  const { data: paymentPercentOldRaw } = useApiData<{
    totalCash: number;
    totalTransfer: number;
    totalCreditCard: number;
    totalPrepaidCard: number;
    totalDebt: number;
  }>(`${API_BASE_URL}/api/customer-sale/payment-percent-old`, fromDate, toDate);

  const { 
    data: paymentByRegionData, 
    loading: paymentByRegionLoading, 
    error: paymentByRegionError 
  } = useApiData<{
    region: string;
    transfer: number;
    cash: number;
    creditCard: number;
  }[]>(`${API_BASE_URL}/api/sales/payment-by-region`, fromDate, toDate);

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
  const paymentPercentNewPieData = React.useMemo(() => {
    if (!paymentPercentNewRaw) return [];

    return [
      {
        name: "TIỀN MẶT",
        value: paymentPercentNewRaw.totalCash || 0,
        color: "#00d084",
      },
      {
        name: "CHUYỂN KHOẢN",
        value: paymentPercentNewRaw.totalTransfer || 0,
        color: "#5bd1d7",
      },
      {
        name: "THẺ TÍN DỤNG",
        value: paymentPercentNewRaw.totalCreditCard || 0,
        color: "#ff7f7f",
      },
      {
        name: "THẺ TRẢ TRƯỚC",
        value: paymentPercentNewRaw.totalPrepaidCard || 0,
        color: "#f66035",
      },
      {
        name: "CÒN NỢ",
        value: paymentPercentNewRaw.totalDebt || 0,
        color: "#eb94cf",
      },
    ].filter(item => item.value > 0);
  }, [paymentPercentNewRaw]);

  // Tỉ lệ các hình thức thanh toán (khách cũ)
  const paymentPercentOldPieData = React.useMemo(() => {
    if (!paymentPercentOldRaw) return [];

    return [
      {
        name: "TIỀN MẶT",
        value: paymentPercentOldRaw.totalCash || 0,
        color: "#00d084",
      },
      {
        name: "CHUYỂN KHOẢN",
        value: paymentPercentOldRaw.totalTransfer || 0,
        color: "#5bd1d7",
      },
      {
        name: "THẺ TÍN DỤNG",
        value: paymentPercentOldRaw.totalCreditCard || 0,
        color: "#ff7f7f",
      },
      {
        name: "THẺ TRẢ TRƯỚC",
        value: paymentPercentOldRaw.totalPrepaidCard || 0,
        color: "#f66035",
      },
      {
        name: "CÒN NỢ",
        value: paymentPercentOldRaw.totalDebt || 0,
        color: "#eb94cf",
      },
    ].filter(item => item.value > 0);
  }, [paymentPercentOldRaw]);

  // Xử lý dữ liệu cho chart hình thức thanh toán theo vùng
  const paymentRegionData = React.useMemo(() => {
    if (!paymentByRegionData) return [];
    
    // Transform API data to match chart interface
    const transformedData = paymentByRegionData.map((item) => ({
      region: item.region,
      bank: item.transfer || 0,
      cash: item.cash || 0,
      card: item.creditCard || 0,
    }));
    
    // Filter out regions with zero total revenue
    const filteredData = transformedData.filter(item => 
      (item.bank + item.cash + item.card) > 0
    );
    
    return filteredData;
  }, [paymentByRegionData]);

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
              Accounting Report
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
            startDate={startDate}
            endDate={endDate}
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

          {/* Tỉ lệ đơn mua thẻ/ sản phẩm/ dịch vụ (khách mới) và (khách cũ) */}
          <CustomerPaymentPieChart
            isMobile={isMobile}
            paymentPercentNewPieData={paymentPercentNewPieData}
            paymentPercentOldPieData={paymentPercentOldPieData}
          />
        </div>

        {/* Hình thức thanh toán theo vùng */}
        <OrderPaymentRegionData
          paymentRegionData={paymentRegionData}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}
