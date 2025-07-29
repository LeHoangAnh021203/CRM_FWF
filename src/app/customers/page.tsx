"use client";
import React, { useState, useEffect } from "react";
import {
  CalendarDate,
  today,
  getLocalTimeZone,
  parseDate,
} from "@internationalized/date";
import CustomerFacilityHourTable from "./CustomerFacilityHourTable";
import CustomerFilters from "./CustomerFilters";
import CustomerSummaryCard from "./CustomerSummaryCard";
import CustomerStatsCards from "./CustomerStatsCards";
import CustomerGenderPie from "./CustomerGenderPie";
import CustomerNewChart from "./CustomerNewChart";
import CustomerTypeTrendChart from "./CustomerTypeTrendChart";
import CustomerSourceBarChart from "./CustomerSourceBarChart";
import CustomerAppDownloadBarChart from "./CustomerAppDownloadBarChart";
import CustomerAppDownloadPieChart from "./CustomerAppDownloadPieChart";
import CustomerPaymentPieChart from "./CustomerPaymentPieChart";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
  const [customerSaleData] = useState([]);
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [startDate, setStartDate] = useState<CalendarDate>(
    today(getLocalTimeZone()).subtract({ days: 7 })
  );
  const [endDate, setEndDate] = useState<CalendarDate>(
    today(getLocalTimeZone())
  );
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
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
    data: customerOldNewOrderRaw,
    loading: loadingCustomerOldNewOrder,
    error: errorCustomerOldNewOrder,
  } = useApiData<{ totalNew: number; totalOld: number }>(
    `${API_BASE_URL}/api/customer-sale/customer-old-new-order-pieChart`,
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

  const { data: paymentPercentNewRaw } = useApiData<{
    totalCash: number;
    totalTransfer: number;
    totalPrepaidCard: number;
    totalDebt: number;
    percentCash: number;
    percentTransfer: number;
    percentPrepaidCard: number;
    percentDebt: number;
  }>(`${API_BASE_URL}/api/customer-sale/payment-percent-new`, fromDate, toDate);

  const { data: paymentPercentOldRaw } = useApiData<{
    totalCash: number;
    totalTransfer: number;
    totalPrepaidCard: number;
    totalDebt: number;
  }>(`${API_BASE_URL}/api/customer-sale/payment-percent-old`, fromDate, toDate);

  const { data: uniqueCustomersComparisonRaw } = useApiData<{
    current: number;
    previous: number;
    changePercent: number;
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
    // Chuyển object thành mảng
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

  // 7. Tỷ lệ mới/cũ
  const customerOldNewOrderPieData = React.useMemo(() => {
    if (!customerOldNewOrderRaw) return [];
    return [
      { name: "Khách mới", value: customerOldNewOrderRaw.totalNew || 0 },
      { name: "Khách cũ", value: customerOldNewOrderRaw.totalOld || 0 },
    ];
  }, [customerOldNewOrderRaw]);

  // Tỉ lệ các hình thức thanh toán (khách mới)
  const paymentPercentNewPieData = React.useMemo(() => {
    if (!paymentPercentNewRaw) return [];
    const tongThanhToan =
      (paymentPercentNewRaw.totalCash || 0) +
      (paymentPercentNewRaw.totalTransfer || 0) +
      (paymentPercentNewRaw.totalPrepaidCard || 0);

    return [
      {
        name: "TM+CK+QT",
        value: tongThanhToan,
        color: "#f66035",
      },
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
        name: "CÒN NỢ",
        value: paymentPercentNewRaw.totalDebt || 0,
        color: "#eb94cf",
      },
    ];
  }, [paymentPercentNewRaw]);

  const customerTypes = [
    "KH trải nghiệm",
    "Khách hàng Thành viên",
    "Khách hàng Bạc",
    "Khách hàng Vàng",
    "Khách hàng Bạch Kim",
    "Khách hàng Kim cương",
  ];

  const customerStatus = ["New", "Old"];

  // 1. Keep your raw data as-is (no type annotation)
  const allRawData = [
    ...(Array.isArray(customerSaleData) ? customerSaleData : []),
  ];

  const INVALID_DATES = [
    "NGÀY TẠO",
    "MÃ ĐƠN HÀNG",
    "TÊN KHÁCH HÀNG",
    "SỐ ĐIỆN THOẠI",
    "NHÓM KHÁCH HÀNG",
  ];

  const filteredRawDataByDate = allRawData.filter((d) => {
    const dateStr = d["Unnamed: 1"] || d["Unnamed: 3"] || "";
    if (INVALID_DATES.includes(String(dateStr).trim().toUpperCase()))
      return false;
    const dDate = parseVNDate(String(dateStr));
    return dDate.compare(startDate) >= 0 && dDate.compare(endDate) <= 0;
  });

  const filteredCustomerPhones = new Set<string>();
  filteredRawDataByDate.forEach((d) => {
    const phone = (d["Unnamed: 4"] as string | number | undefined)
      ?.toString()
      .trim();
    if (phone) filteredCustomerPhones.add(phone);
  });

  const filteredAppPhoneSet = new Set<string>();
  if (Array.isArray(customerSaleData)) {
    customerSaleData.forEach((d) => {
      const phone = (d["Unnamed: 3"] as string | number | undefined)
        ?.toString()
        .trim();
      if (phone && filteredCustomerPhones.has(phone)) {
        filteredAppPhoneSet.add(phone);
      }
    });
  }

  const APP_CUSTOMER_PIE_COLORS = ["#9ee347", "#f0bf4c"];

  const NEW_OLD_COLORS = ["#5bd1d7", "#eb94cf"];

  const startDateForNewOldRatio = startDate;

  const oldCustomerPhones = new Set<string>();
  allRawData.forEach((d) => {
    const dateStr = d["Unnamed: 1"] || d["Unnamed: 3"] || "";
    if (INVALID_DATES.includes(String(dateStr).trim().toUpperCase())) return;
    const dDate = parseVNDate(String(dateStr));
    const phone = (d["Unnamed: 4"] as string | number | undefined)
      ?.toString()
      .trim();
    if (phone && dDate.compare(startDateForNewOldRatio) < 0) {
      oldCustomerPhones.add(phone);
    }
  });

  const phoneFirstSeen = new Set<string>();
  const newCustomerPhones = new Set<string>();
  filteredRawDataByDate.forEach((d) => {
    const phone = (d["Unnamed: 4"] as string | number | undefined)
      ?.toString()
      .trim();
    if (!phone) return;
    if (!oldCustomerPhones.has(phone) && !phoneFirstSeen.has(phone)) {
      newCustomerPhones.add(phone);
      phoneFirstSeen.add(phone);
    }
  });

  function parseVNDate(str: string): CalendarDate {
    if (!str || typeof str !== "string") return today(getLocalTimeZone());
    // Format "hh:mm dd/mm/yyyy"
    let match = str.match(/^\d{1,2}:\d{2} (\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      return parseDate(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
      );
    }

    match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      return parseDate(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
      );
    }
    return today(getLocalTimeZone());
  }

  const phoneFirstSeenInRange = new Set<string>();

  filteredRawDataByDate.forEach((d) => {
    const phone = (d["Unnamed: 4"] as string | number | undefined)
      ?.toString()
      .trim();
    if (!phone) return;
    if (oldCustomerPhones.has(phone)) {
    } else if (!phoneFirstSeenInRange.has(phone)) {
      phoneFirstSeenInRange.add(phone);
    } else {
    }
  });

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 640;

  const paymentPercentOldPieData = React.useMemo(() => {
    if (!paymentPercentOldRaw) return [];
    const tongThanhToan =
      (paymentPercentOldRaw.totalCash || 0) +
      (paymentPercentOldRaw.totalTransfer || 0) +
      (paymentPercentOldRaw.totalPrepaidCard || 0);

    return [
      {
        name: "TM+CK+QT",
        value: tongThanhToan,
        color: "#f66035",
      },
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
        name: "CÒN NỢ",
        value: paymentPercentOldRaw.totalDebt || 0,
        color: "#eb94cf",
      },
    ];
  }, [paymentPercentOldRaw]);

  const allHourRanges = React.useMemo(() => {
    if (!facilityHourServiceRaw) return [];
    const set = new Set<string>();
    facilityHourServiceRaw.forEach((item) => {
      Object.keys(item.hourlyCounts).forEach((hour) => set.add(hour));
    });
    // Sắp xếp theo thứ tự giờ tăng dần (nếu muốn)
    return Array.from(set).sort((a, b) => {
      // Tách số đầu tiên để so sánh
      const getStart = (s: string) => parseInt(s.split("-")[0], 10);
      return getStart(a) - getStart(b);
    });
  }, [facilityHourServiceRaw]);

  const facilityHourTableData = React.useMemo(() => {
    if (!facilityHourServiceRaw) return [];
    return facilityHourServiceRaw.map(
      (item) =>
        ({
          facility: item.facility,
          ...item.hourlyCounts, // mỗi key là 1 khung giờ, value là số lượng
          total: item.total,
        } as {
          facility: string;
          total: number;
          [key: string]: number | string;
        })
    );
  }, [facilityHourServiceRaw]);

  const customerTypeKeys =
    customerTypeTrendData.length > 0
      ? Object.keys(customerTypeTrendData[0]).filter((k) => k !== "date")
      : [];

  // Before rendering the BarChart for 'Nguồn của đơn hàng', define the dynamic list of sources and assign colors by index
  const customerSourceKeys = React.useMemo(() => {
    if (customerSourceTrendData.length === 0) return [];
    return Object.keys(customerSourceTrendData[0]).filter(
      (key) => key !== "date"
    );
  }, [customerSourceTrendData]);

  // Calculate peak hours and facilities for coloring
  const hourTotals = React.useMemo(() => {
    const totals: Record<string, number> = {};
    facilityHourTableData.forEach((row) => {
      allHourRanges.forEach((hour) => {
        const val = Number(row[hour] ?? 0);
        totals[hour] = (totals[hour] || 0) + val;
      });
    });
    return totals;
  }, [facilityHourTableData, allHourRanges]);
  const maxHourTotal = Math.max(...Object.values(hourTotals));
  const peakHours = Object.keys(hourTotals).filter(
    (h) => hourTotals[h] === maxHourTotal
  );

  const maxFacilityTotal = React.useMemo(() => {
    return Math.max(
      ...facilityHourTableData.map((row) => Number(row.total ?? 0))
    );
  }, [facilityHourTableData]);
  const peakFacilities = facilityHourTableData
    .filter((row) => Number(row.total ?? 0) === maxFacilityTotal)
    .map((row) => row.facility);

  // Tính max cho từng hàng (chi nhánh)
  const rowMaxMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    facilityHourTableData.forEach((row) => {
      const max = Math.max(
        ...allHourRanges.map((hour) => Number(row[hour] ?? 0))
      );
      map[row.facility] = max;
    });
    return map;
  }, [facilityHourTableData, allHourRanges]);

  // Helper for cell color scale (dùng max của từng hàng)
  function getCellBg(val: number, max: number) {
    if (!max || max === 0) return "";
    const percent = val / max;
    if (percent > 0.85) return "bg-[#ffe5e5]"; // very high
    if (percent > 0.6) return "bg-[#fff3cd]"; // high
    if (percent > 0.3) return "bg-[#e3fcec]"; // medium
    return "";
  }

  const sortedAppDownloadStatusData = React.useMemo(() => {
    if (!appDownloadStatusData) return [];
    // Giả sử trường date là ISO string hoặc có thể parse được
    return [...appDownloadStatusData].sort((a, b) => {
      // Ưu tiên parse dạng YYYY-MM-DD hoặc YYYY-MM-DDTHH:mm:ss
      const getDate = (d: { date?: string }) => {
        if (!d.date) return 0;
        const match = String(d.date).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match)
          return new Date(`${match[1]}-${match[2]}-${match[3]}`).getTime();
        // Nếu là dạng DD/MM/YYYY
        const match2 = String(d.date).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (match2)
          return new Date(`${match2[3]}-${match2[2]}-${match2[1]}`).getTime();
        return new Date(d.date).getTime();
      };
      return getDate(a) - getDate(b);
    });
  }, [appDownloadStatusData]);

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-4 lg:mb-6">
        <div className="p-2">
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
            Customer Report
          </h1>

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

          {/* Card tổng số khách trong khoảng ngày đã chọn */}
          <CustomerSummaryCard
            value={uniqueCustomersComparisonRaw?.current?.toLocaleString() ?? 0}
            label="Tổng số khách trong khoảng ngày đã chọn"
            percentChange={uniqueCustomersComparisonRaw?.changePercent}
          />

          {/* 4 bảng thống kê */}
          <CustomerStatsCards
            loading={loadingGenderRevenue}
            error={errorGenderRevenue}
            avgRevenueMale={
              genderRevenueRaw?.avgRevenueMale?.toLocaleString() ?? 0
            }
            avgRevenueFemale={
              genderRevenueRaw?.avgRevenueFemale?.toLocaleString() ?? 0
            }
            avgServiceMale={
              genderRevenueRaw?.avgServiceMale?.toLocaleString() ?? 0
            }
            avgServiceFemale={
              genderRevenueRaw?.avgServiceFemale?.toLocaleString() ?? 0
            }
          />

          {/* Số khách tạo mới và tỷ lệ nam nữ/khách mới tạo */}
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

          {/* Khách hàng tải app */}
          <CustomerAppDownloadBarChart
            isMobile={isMobile}
            loading={loading}
            error={error}
            sortedAppDownloadStatusData={sortedAppDownloadStatusData}
          />

          {/* Tỉ lệ khách hàng tải app và tỉ lệ khách mới/cũ*/}
          <CustomerAppDownloadPieChart
            loadingAppDownload={loadingAppDownload}
            errorAppDownload={errorAppDownload}
            appDownloadPieData={appDownloadPieData}
            APP_CUSTOMER_PIE_COLORS={APP_CUSTOMER_PIE_COLORS}
            loadingCustomerOldNewOrder={loadingCustomerOldNewOrder}
            errorCustomerOldNewOrder={errorCustomerOldNewOrder}
            customerOldNewOrderPieData={customerOldNewOrderPieData}
            NEW_OLD_COLORS={NEW_OLD_COLORS}
          />

          {/* Tỉ lệ đơn mua thẻ/ sản phẩm/ dịch vụ (khách mới) và (khách cũ) */}
          <CustomerPaymentPieChart
            isMobile={isMobile}
            paymentPercentNewPieData={paymentPercentNewPieData}
            paymentPercentOldPieData={paymentPercentOldPieData}
          />

          {/* Thời gian đơn hàng được tạo */}
          <CustomerFacilityHourTable
            allHourRanges={allHourRanges}
            peakHours={peakHours}
            facilityHourTableData={facilityHourTableData}
            peakFacilities={peakFacilities}
            rowMaxMap={rowMaxMap}
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
