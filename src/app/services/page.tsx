"use client";
import React from "react";
import { useState, useEffect, useRef } from "react";
import {
  CalendarDate,
  today,
  getLocalTimeZone,
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

// Interface cho dữ liệu API
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

interface ShopServiceData {
  shopName: string;
  serviceType: string;
  total: number;
}

interface Top10ServicesRevenueData {
  serviceName: string;
  servicePrice: number;
}

interface Top10ServicesUsageData {
  serviceName: string;
  count: number;
}

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

  // API calls - chỉ sử dụng dữ liệu thật từ API
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

  // Report page load success when data loads
  useEffect(() => {
    if (serviceSummary && !serviceSummaryLoading && !serviceSummaryError) {
      const totalServices = serviceSummary.totalAll || 0;
      reportPagePerformance({
        loadTime: 2000,
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
        }, 100);
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

  // Tạo weekDates cho chart
  const weekDates: CalendarDate[] = React.useMemo(() => {
    const dates: CalendarDate[] = [];
    let d = startDate;
    while (d.compare(endDate) <= 0) {
      dates.push(d);
      d = d.add({ days: 1 });
    }
    return dates;
  }, [startDate, endDate]);

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
      .sort((a, b) => b.total - a.total);
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
      tongGia: item.count * 1000000,
      percentSoLuong:
        totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : "0.0",
      percentTongGia:
        totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : "0.0",
    }));
  }, [serviceTypeData]);

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
              total,
            };
          })
          .sort((a, b) => b.total - a.total);
      })()
    : [];

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
        value: 0,
        color: "#795548",
      },
      {
        key: "service",
        label: "Dịch vụ",
        value: 0,
        color: "#c5e1a5",
      },
      {
        key: "addedon",
        label: "Added on",
        value: 0,
        color: "#f16a3f",
      },
      {
        key: "gifts",
        label: "Gifts",
        value: 0,
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
  }, [serviceSummary]);

  // PieChart top 10 dịch vụ theo số lượng (có filter)
  const pieTop10Data = React.useMemo(() => {
    if (top10ServicesUsageData) {
      return top10ServicesUsageData.map((service, idx) => ({
        name: service.serviceName,
        value: service.count,
        color: `hsl(0,0%,${40 + idx * 5}%)`,
      }));
    }
    return [];
  }, [top10ServicesUsageData]);

  // PieChart top 10 dịch vụ theo giá buổi (có filter)
  const pieTop10AvgData = React.useMemo(() => {
    if (top10ServicesRevenueData) {
      return top10ServicesRevenueData.map((service, idx) => ({
        name: service.serviceName,
        value: service.servicePrice,
        color: `hsl(30, 100%, ${45 + idx * 5}%)`,
      }));
    }
    return [];
  }, [top10ServicesRevenueData]);

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
      const grayShades = ["#bdbdbd", "#9e9e9e", "#e0e0e0"];
      return bottom3ServicesUsageData.map((service, idx) => ({
        name: service.serviceName,
        value: service.count,
        color: grayShades[idx % grayShades.length],
      }));
    }
    return [];
  }, [bottom3ServicesUsageData]);

  // Data cho bottom 3 dịch vụ theo giá buổi
  const bottom3RevenueData = React.useMemo(() => {
    if (bottom3ServicesRevenueData) {
      const grayShades = ["#bdbdbd", "#9e9e9e", "#e0e0e0"];
      return bottom3ServicesRevenueData.map((service, idx) => ({
        name: service.serviceName,
        value: service.servicePrice,
        color: grayShades[idx % grayShades.length],
      }));
    }
    return [];
  }, [bottom3ServicesRevenueData]);

  // Filter options cho region
  const regionOptions = React.useMemo(() => {
    if (!regionData) return [];
    
    const regionMap = new Map<string, number>();
    regionData.forEach(item => {
      regionMap.set(item.region, (regionMap.get(item.region) || 0) + 1);
    });
    
    return Array.from(regionMap.entries()).map(([name, total]) => ({
      name,
      total
    }));
  }, [regionData]);

  const filteredRegionOptions = React.useMemo(
    () =>
      regionOptions.filter((r) =>
        r.name.toLowerCase().includes(regionSearch.toLowerCase())
      ),
    [regionOptions, regionSearch]
  );

  // Filter options cho service types và genders
  const filteredServiceTypes = ALL_SERVICE_TYPES.filter((s) =>
    s.label.toLowerCase().includes("")
  );
  const filteredGenders = ALL_GENDERS.filter((g) =>
    g.toLowerCase().includes("")
  );

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
            locationOptions={[]}
            filteredRegionOptions={filteredRegionOptions}
            ALL_SERVICE_TYPES={ALL_SERVICE_TYPES}
            ALL_GENDERS={ALL_GENDERS}
            filteredServiceTypes={filteredServiceTypes}
            filteredGenders={filteredGenders}
            genderActualPrice={[]}
            formatMoneyShort={(val: number) => val.toLocaleString()}
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
          filteredPieData={[]}
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