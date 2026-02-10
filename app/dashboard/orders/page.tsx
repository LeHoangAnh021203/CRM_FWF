"use client";
import React, { useRef, useEffect } from "react";

import { OrderHeaderSection } from "./sections/header/OrderHeaderSection";
import { OrderRevenueSummarySection } from "./sections/summary/OrderRevenueSummarySection";
import { OrderChartsSection } from "./sections/charts/OrderChartsSection";
import { Notification, useNotification } from "@/app/components/notification";
import {
  useLocalStorageState,
  clearLocalStorageKeys,
} from "@/app/hooks/useLocalStorageState";
import { usePageStatus } from "@/app/hooks/usePageStatus";
import { useWindowWidth } from "@/app/hooks/useWindowWidth";
import { useDateRange } from "@/app/contexts/DateContext";
import { useOrderSearchNavigation } from "./hooks/useOrderSearchNavigation";
import { useOrderApiData } from "./hooks/useOrderApiData";
import type {
  CustomerTypeSalesByDayData,
  DataPoint,
  PaymentRevenueCustomerStatusResponse,
  RawDataRow,
  RegionalSalesByDayData,
  RegionStatData,
} from "./types";
import { ORDER_ENDPOINTS, orderUrl } from "./queries";
import {
  buildAvgPercent,
  buildChartOrderData,
  buildCustomerTypeSalesByDay,
  buildOrdersChartData,
  buildPieRegionRevenueData,
  buildRealData,
  buildRegionStats,
  buildRegionalSalesByDay,
  buildStoreOrderTableData,
  buildStoreTableData,
  buildTop10LocationChartData,
  buildTotalOrderSumAll,
  buildTotalPercentChange,
  getRegionForBranch,
} from "./transformers";

export default function CustomerReportPage() {
  useOrderSearchNavigation();
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
      "orders-selectedBranches",
      "orders-selectedRegions",
    ]);
    setSelectedBranches([]);
    setSelectedRegions([]);
    showSuccess("Đã reset tất cả filter về mặc định!");
    reportResetFilters();
  };

  // Use global date context instead of local state
  const { startDate, endDate, fromDate, toDate, isLoaded: dateLoaded } = useDateRange();
  const [selectedBranches, setSelectedBranches, selectedBranchesLoaded] =
    useLocalStorageState<string[]>("orders-selectedBranches", []);

  // Thêm state cho Region và Branch
  const [selectedRegions, setSelectedRegions, selectedRegionsLoaded] =
    useLocalStorageState<string[]>("orders-selectedRegions", []);

  // Kiểm tra xem tất cả localStorage đã được load chưa
  const isAllLoaded =
    dateLoaded &&
    selectedBranchesLoaded &&
    selectedRegionsLoaded;
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

  // fromDate and toDate are now provided by the global date context

  // XỬ LÍ API

  const {
    data: regionRevenueRaw,
    loading: regionRevenueLoading,
    error: regionRevenueError,
  } = useOrderApiData<{
    currentRange: { region: string; date: string; totalRevenue: number }[];
    previousRange: { region: string; date: string; totalRevenue: number }[];
  }>(orderUrl(ORDER_ENDPOINTS.regionRevenue), fromDate, toDate, 0);

  const {
    data: revenueSummaryRaw,
    loading: revenueSummaryLoading,
    error: revenueSummaryError,
  } = useOrderApiData<{
    currentRange: { shopType: string; date: string; totalRevenue: number }[];
    previousRange: { shopType: string; date: string; totalRevenue: number }[];
    totalRevenue: number;
    actualRevenue: number;
    revenueGrowth: number;
    actualGrowth: number;
  }>(orderUrl(ORDER_ENDPOINTS.revenueSummary), fromDate, toDate, 1);

  const {
    data: regionStatRaw,
    loading: regionStatLoading,
    error: regionStatError,
  } = useOrderApiData<RegionStatData[]>(
    orderUrl(ORDER_ENDPOINTS.regionStat),
    fromDate,
    toDate,
    4
  );

  const {
    data: overallSummary,
    loading: overallSummaryLoading,
    error: overallSummaryError,
  } = useOrderApiData<{
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
  }>(orderUrl(ORDER_ENDPOINTS.overallSummary), fromDate, toDate, 2);

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
  } = useOrderApiData<{
    currentRange: { shopType: string; date: string; totalRevenue: number }[];
    previousRange: { shopType: string; date: string; totalRevenue: number }[];
    totalRevenue: number;
    actualRevenue: number;
    revenueGrowth: number;
    actualGrowth: number;
  }>(orderUrl(ORDER_ENDPOINTS.regionActualPie), fromDate, toDate, 5);

  const {
    data: dailyRegionRevenue,
    loading: dailyRegionLoading,
    error: dailyRegionError,
  } = useOrderApiData<{
    currentRange: { shopType: string; date: string; totalRevenue: number }[];
    previousRange: { shopType: string; date: string; totalRevenue: number }[];
    totalRevenue: number;
    actualRevenue: number;
    revenueGrowth: number;
    actualGrowth: number;
  }>(orderUrl(ORDER_ENDPOINTS.dailyRegionRevenue), fromDate, toDate, 6);

  const {
    data: dailyByShopType,
    loading: dailyShopTypeLoading,
    error: dailyShopTypeError,
  } = useOrderApiData<
    {
      date: string;
      shopType: string;
      revenue: number;
    }[]
  >(orderUrl(ORDER_ENDPOINTS.dailyByShopType), fromDate, toDate, 7);

  const {
    data: dailyByCustomerType,
    loading: dailyCustomerLoading,
    error: dailyCustomerError,
  } = useOrderApiData<
    {
      date: string;
      customerType: string;
      revenue: number;
    }[]
  >(orderUrl(ORDER_ENDPOINTS.dailyByCustomerType), fromDate, toDate, 8);

  const {
    data: dailyOrderStats,
    loading: dailyOrderLoading,
    error: dailyOrderError,
  } = useOrderApiData<
    {
      date: string;
      customerType: string;
      revenue: number;
      totalOrders: number;
      avgOrdersPerShop: number;
    }[]
  >(orderUrl(ORDER_ENDPOINTS.dailyOrderStats), fromDate, toDate, 9);

  const {
    data: fullStoreRevenue,
    loading: fullStoreLoading,
    error: fullStoreError,
  } = useOrderApiData<
    {
      storeName: string;
      currentOrders: number;
      deltaOrders: number;
      cashTransfer: number;
      prepaidCard: number;
      revenueGrowth: number;
      cashPercent: number;
      prepaidPercent: number;
      orderPercent: number;
    }[]
  >(orderUrl(ORDER_ENDPOINTS.fullStoreRevenue), fromDate, toDate, 10);

  const {
    data: regionOrderBreakdownTable,
    loading: regionOrderBreakdownTableLoading,
    error: regionOrderBreakdownTableError,
  } = useOrderApiData<
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
  >(orderUrl(ORDER_ENDPOINTS.regionOrderBreakdownTable), fromDate, toDate, 11);

  const {
    data: regionOrderBreakdown,
    loading: regionOrderBreakdownLoading,
    error: regionOrderBreakdownError,
  } = useOrderApiData<
    {
      region: string;
      totalOrders: number;
      serviceOrders: number;
      foxieCardOrders: number;
      productOrders: number;
      cardPurchaseOrders: number;
    }[]
  >(orderUrl(ORDER_ENDPOINTS.regionOrderBreakdown), fromDate, toDate, 12);

  const {
    data: overallOrderSummary,
    loading: overallOrderSummaryLoading,
    error: overallOrderSummaryError,
  } = useOrderApiData<{
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
  }>(orderUrl(ORDER_ENDPOINTS.overallOrderSummary), fromDate, toDate, 13);

  const {
    data: paymentRevenueCustomerStatus,
    loading: paymentRevenueCustomerStatusLoading,
    error: paymentRevenueCustomerStatusError,
  } = useOrderApiData<PaymentRevenueCustomerStatusResponse>(
    orderUrl(ORDER_ENDPOINTS.paymentRevenueCustomerStatus),
    fromDate,
    toDate,
    14
  );

  // Track overall loading and error states for notifications
  const allLoadingStates = [
    regionRevenueLoading,
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
    overallSummaryLoading,
    dailyShopTypeLoading,
    paymentRevenueCustomerStatusLoading,
  ];

  const allErrorStates = [
    regionRevenueError,
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
    overallSummaryError,
    dailyShopTypeError,
    paymentRevenueCustomerStatusError,
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

  const allRawData: RawDataRow[] = React.useMemo(() => [], []);

  const realData: DataPoint[] = React.useMemo(
    () => buildRealData(allRawData, getRegionForBranch),
    [allRawData]
  );

  // Helper: chuẩn hóa ngày về yyyy-MM-dd

  const regionalSalesByDay: RegionalSalesByDayData[] = React.useMemo(() => {
    const dataSource = Array.isArray(dailyRegionRevenue)
      ? dailyRegionRevenue
      : dailyRegionRevenue?.currentRange ||
        regionRevenueRaw?.currentRange ||
        (Array.isArray(regionRevenueRaw) ? regionRevenueRaw : null);
    return buildRegionalSalesByDay(dataSource, fromDate, toDate);
  }, [dailyRegionRevenue, regionRevenueRaw, fromDate, toDate]);

  // Đặt các biến tuần lên trước
  const weekStart = startDate;
  const weekEnd = endDate;
  const prevWeekStart = startDate.subtract({ days: 7 });
  const prevWeekEnd = startDate.subtract({ days: 1 });

  const regionStats = React.useMemo(
    () => buildRegionStats(regionStatRaw),
    [regionStatRaw]
  );

  // Tính phần trăm thay đổi tổng thực thu
  const totalPercentChange = React.useMemo(
    () => buildTotalPercentChange(regionStatRaw),
    [regionStatRaw]
  );

  // Tính top 10 location (chi nhánh/cửa hàng) theo thực thu tuần này
  const top10LocationChartData = React.useMemo(
    () =>
      buildTop10LocationChartData(
        fullStoreRevenue,
        realData,
        weekStart,
        weekEnd,
        locationOptions
      ),
    [fullStoreRevenue, realData, weekStart, weekEnd, locationOptions]
  );

  const pieRegionRevenueData = React.useMemo(
    () => buildPieRegionRevenueData(regionActualPie, regionStats),
    [regionActualPie, regionStats]
  );

  const storeTableData = React.useMemo(
    () =>
      buildStoreTableData(
        fullStoreRevenue,
        realData,
        weekStart,
        weekEnd,
        prevWeekStart,
        prevWeekEnd,
        locationOptions
      ),
    [
      fullStoreRevenue,
      realData,
      weekStart,
      weekEnd,
      prevWeekStart,
      prevWeekEnd,
      locationOptions,
    ]
  );

  // Chuẩn bị data cho chart
  const ordersChartData = React.useMemo(
    () => buildOrdersChartData(dailyOrderStats),
    [dailyOrderStats]
  );

  // Sử dụng dữ liệu API để tạo chart top 10 cửa hàng theo đơn hàng
  const chartOrderData = React.useMemo(
    () => buildChartOrderData(regionOrderBreakdown),
    [regionOrderBreakdown]
  );

  // Tính dữ liệu bảng số đơn tại các cửa hàng (top 10 + tổng cộng)
  const storeOrderTableData = React.useMemo(
    () => buildStoreOrderTableData(regionOrderBreakdownTable),
    [regionOrderBreakdownTable]
  );

  const totalOrderSumAll = React.useMemo(
    () => buildTotalOrderSumAll(storeOrderTableData),
    [storeOrderTableData]
  );
  const { avgRevenuePercent, avgOrderPercent } = React.useMemo(
    () => buildAvgPercent(storeTableData),
    [storeTableData]
  );

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 640;

  const customerTypeSalesByDay: CustomerTypeSalesByDayData[] = React.useMemo(
    () => buildCustomerTypeSalesByDay(dailyByCustomerType, fromDate, toDate),
    [dailyByCustomerType, fromDate, toDate]
  );

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
        <OrderHeaderSection onReset={resetFilters} />

        <OrderRevenueSummarySection
          revenueSummaryLoading={revenueSummaryLoading}
          revenueSummaryError={revenueSummaryError}
          revenueSummaryRaw={revenueSummaryRaw}
        />

        <OrderChartsSection
          fromDate={fromDate}
          toDate={toDate}
          isMobile={isMobile}
          storeOrderTableData={storeOrderTableData}
          totalOrderSumAll={totalOrderSumAll}
          storeTableData={storeTableData}
          avgRevenuePercent={avgRevenuePercent}
          avgOrderPercent={avgOrderPercent}
          regionStats={regionStats}
          totalPercentChange={totalPercentChange}
          pieRegionRevenueData={pieRegionRevenueData}
          regionActualPie={regionActualPie}
          regionStatRaw={regionStatRaw}
          regionalSalesByDay={regionalSalesByDay}
          dailyByShopType={dailyByShopType}
          customerTypeSalesByDay={customerTypeSalesByDay}
          top10LocationChartData={top10LocationChartData}
          fullStoreRevenue={fullStoreRevenue}
          overallSummary={overallSummary}
          overallSummaryLoading={overallSummaryLoading}
          overallSummaryError={overallSummaryError}
          overallOrderSummary={overallOrderSummary}
          overallOrderSummaryLoading={overallOrderSummaryLoading}
          overallOrderSummaryError={overallOrderSummaryError}
          ordersChartData={ordersChartData}
          chartOrderData={chartOrderData}
          paymentRevenueCustomerStatus={paymentRevenueCustomerStatus}
          paymentRevenueCustomerStatusLoading={
            paymentRevenueCustomerStatusLoading
          }
          paymentRevenueCustomerStatusError={paymentRevenueCustomerStatusError}
        />
      </div>
    </div>
  );
}
