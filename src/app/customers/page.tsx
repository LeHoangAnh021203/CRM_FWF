"use client";
import React, { useState, useEffect } from "react";
import {
  CalendarDate,
  today,
  getLocalTimeZone,
  parseDate,
} from "@internationalized/date";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";


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
    "#5bd1d7", "#eb94cf", "#f66035", "#00d084", "#9b51e0", "#0693e3",
    "#ff7f7f", "#b39ddb", "#8d6e63", "#c5e1a5", "#81d4fa", "#fff176", "#d81b60"
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

  const { data: facilityHourServiceRaw, loading: loadingFacilityHour, error: errorFacilityHour } = useApiData<{
    facility: string;
    hourlyCounts: Record<string, number>;
    total: number;
  }[]>(`${API_BASE_URL}/api/customer-sale/facility-hour-service`, fromDate, toDate);

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
      const row: Record<string, unknown> = { date };
      allTypes.forEach((type) => {
        const found = (
          customerTypeRaw[type] as Array<{ date: string; count: number }>
        ).find((item) => item.date.slice(0, 10) === date);
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
      const row: Record<string, unknown> = { date };
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
    facilityHourServiceRaw.forEach(item => {
      Object.keys(item.hourlyCounts).forEach(hour => set.add(hour));
    });
    // Sắp xếp theo thứ tự giờ tăng dần (nếu muốn)
    return Array.from(set).sort((a, b) => {
      // Tách số đầu tiên để so sánh
      const getStart = (s: string) => parseInt(s.split('-')[0], 10);
      return getStart(a) - getStart(b);
    });
  }, [facilityHourServiceRaw]);

  const facilityHourTableData = React.useMemo(() => {
    if (!facilityHourServiceRaw) return [];
    return facilityHourServiceRaw.map(item => ({
      facility: item.facility,
      ...item.hourlyCounts, // mỗi key là 1 khung giờ, value là số lượng
      total: item.total,
    }) as { facility: string; total: number; [key: string]: number | string });
  }, [facilityHourServiceRaw]);

  const customerTypeKeys = customerTypeTrendData.length > 0
    ? Object.keys(customerTypeTrendData[0]).filter((k) => k !== "date")
    : [];

  // Before rendering the BarChart for 'Nguồn của đơn hàng', define the dynamic list of sources and assign colors by index
  const customerSourceKeys = React.useMemo(() => {
    if (customerSourceTrendData.length === 0) return [];
    return Object.keys(customerSourceTrendData[0]).filter((key) => key !== "date");
  }, [customerSourceTrendData]);

  // Calculate peak hours and facilities for coloring
  const hourTotals = React.useMemo(() => {
    const totals: Record<string, number> = {};
    facilityHourTableData.forEach(row => {
      allHourRanges.forEach(hour => {
        const val = Number(row[hour] ?? 0);
        totals[hour] = (totals[hour] || 0) + val;
      });
    });
    return totals;
  }, [facilityHourTableData, allHourRanges]);
  const maxHourTotal = Math.max(...Object.values(hourTotals));
  const peakHours = Object.keys(hourTotals).filter(h => hourTotals[h] === maxHourTotal);

  const maxFacilityTotal = React.useMemo(() => {
    return Math.max(...facilityHourTableData.map(row => Number(row.total ?? 0)));
  }, [facilityHourTableData]);
  const peakFacilities = facilityHourTableData.filter(row => Number(row.total ?? 0) === maxFacilityTotal).map(row => row.facility);

  // Helper for cell color scale
  function getCellBg(val: number, max: number) {
    if (!max || max === 0) return '';
    const percent = val / max;
    if (percent > 0.85) return 'bg-[#ffe5e5]'; // very high
    if (percent > 0.6) return 'bg-[#fff3cd]'; // high
    if (percent > 0.3) return 'bg-[#e3fcec]'; // medium
    return '';
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-4 lg:mb-6">
        <div className="p-2">
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
            Customer Report
          </h1>

          <div className="flex flex-col gap-4 lg:gap-6 mb-4 lg:mb-6">
            {/* Date filters */}
            <div className="w-full flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow">
              <div className="flex-1 flex flex-col gap-1">
                <h3 className="text-sm font-medium text-gray-700">
                  Start date
                </h3>
                <input
                  type="date"
                  className="border border-gray-300 rounded p-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#f66035]"
                  value={startDate.toString()}
                  onChange={(e) => {
                    const date = parseDate(e.target.value);
                    setStartDate(date);
                  }}
                  max={today(getLocalTimeZone()).toString()}
                />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <h3 className="text-sm font-medium text-gray-700">End date</h3>
                <input
                  type="date"
                  className="border border-gray-300 rounded p-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#f66035]"
                  value={endDate.toString()}
                  onChange={(e) => {
                    const date = parseDate(e.target.value);
                    setEndDate(date);
                  }}
                  min={startDate.add({ days: 1 }).toString()}
                  max={today(getLocalTimeZone()).toString()}
                />
              </div>
            </div>

            {/* Dropdown filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filter loại khách */}
              <div className="relative">
                <button
                  className="block border rounded p-2 w-full text-left bg-white shadow border-[orange] hover:bg-gray-50 transition-colors"
                  onClick={() => setShowTypeDropdown((v) => !v)}
                  type="button"
                >
                  <span className="font-semibold">Loại khách</span>
                  {selectedType.length > 0 && (
                    <span> ({selectedType.length})</span>
                  )}
                  <span className="float-right">&#9660;</span>
                </button>
                {showTypeDropdown && (
                  <div className="absolute z-20 bg-white border rounded shadow w-full mt-1 max-h-60 overflow-auto">
                    <label className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={selectedType.length === 0}
                        onChange={() => setSelectedType([])}
                        className="mr-2"
                      />
                      Tất cả
                    </label>
                    {customerTypes.map((type) => (
                      <label
                        key={type}
                        className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        <input
                          type="checkbox"
                          checked={selectedType.includes(type)}
                          onChange={() => {
                            setSelectedType((prev) => {
                              if (prev.includes(type)) {
                                return prev.filter((t) => t !== type);
                              } else {
                                return [...prev, type];
                              }
                            });
                          }}
                          className="mr-2"
                        />
                        {type}
                      </label>
                    ))}
                    <button
                      className="w-full text-center py-2 text-orange-600 hover:underline"
                      onClick={() => setShowTypeDropdown(false)}
                      type="button"
                    >
                      Đóng
                    </button>
                  </div>
                )}
              </div>
              {/* Filter khách mới/cũ */}
              <div className="relative">
                <button
                  className="block border rounded p-2 w-full text-left bg-white shadow border-[orange] hover:bg-gray-50 transition-colors"
                  onClick={() => setShowStatusDropdown((v) => !v)}
                  type="button"
                >
                  <span className="font-semibold">Khách mới/cũ</span>
                  {selectedStatus && <span>: {selectedStatus}</span>}
                  <span className="float-right">&#9660;</span>
                </button>
                {showStatusDropdown && (
                  <div className="absolute z-20 bg-white border rounded shadow w-full mt-1 max-h-60 overflow-auto">
                    <label className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100">
                      <input
                        type="radio"
                        name="customerStatus"
                        checked={!selectedStatus}
                        onChange={() => setSelectedStatus(null)}
                        className="mr-2"
                      />
                      Tất cả
                    </label>
                    {customerStatus.map((status) => (
                      <label
                        key={status}
                        className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        <input
                          type="radio"
                          name="customerStatus"
                          checked={selectedStatus === status}
                          onChange={() => setSelectedStatus(status)}
                          className="mr-2"
                        />
                        {status}
                      </label>
                    ))}
                    <button
                      className="w-full text-center py-2 text-orange-600 hover:underline"
                      onClick={() => setShowStatusDropdown(false)}
                      type="button"
                    >
                      Đóng
                    </button>
                  </div>
                )}
              </div>
              {/* Filter Region */}
              <div className="relative">
                <button
                  className="block border rounded p-2 w-full text-left bg-white shadow border-[orange] hover:bg-gray-50 transition-colors"
                  onClick={() => setShowRegionDropdown((v) => !v)}
                  type="button"
                >
                  <span className="font-semibold">Region</span>
                  {selectedRegions.length > 0 && (
                    <span> ({selectedRegions.length})</span>
                  )}
                  <span className="float-right">&#9660;</span>
                </button>
                {showRegionDropdown && (
                  <div className="absolute z-20 bg-white border rounded shadow w-full mt-1 max-h-60 overflow-auto">
                    <label className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={selectedRegions.length === 0}
                        onChange={() => setSelectedRegions([])}
                        className="mr-2"
                      />
                      Tất cả
                    </label>
                    {allRegions.map((region: string) => (
                      <label
                        key={region}
                        className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRegions.includes(region)}
                          onChange={() => {
                            setSelectedRegions((prev) => {
                              if (prev.includes(region)) {
                                return prev.filter((r) => r !== region);
                              } else {
                                return [...prev, region];
                              }
                            });
                          }}
                          className="mr-2"
                        />
                        {region}
                      </label>
                    ))}
                    <button
                      className="w-full text-center py-2 text-orange-600 hover:underline"
                      onClick={() => setShowRegionDropdown(false)}
                      type="button"
                    >
                      Đóng
                    </button>
                  </div>
                )}
              </div>
              {/* Filter Branch */}
              <div className="relative">
                <button
                  className="block border rounded p-2 w-full text-left bg-white shadow border-[orange]"
                  onClick={() => setShowBranchDropdown((v) => !v)}
                  type="button"
                >
                  <span className="font-semibold">Branch</span>
                  {selectedBranches.length > 0 && (
                    <span> ({selectedBranches.length})</span>
                  )}
                  <span className="float-right">&#9660;</span>
                </button>
                {showBranchDropdown && (
                  <div className="absolute z-20 bg-white border rounded shadow w-64 mt-1 max-h-60 overflow-auto">
                    <label className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={selectedBranches.length === 0}
                        onChange={() => setSelectedBranches([])}
                        className="mr-2"
                      />
                      Tất cả
                    </label>
                    {allBranches.map((branch: string) => (
                      <label
                        key={branch}
                        className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBranches.includes(branch)}
                          onChange={() => {
                            setSelectedBranches((prev) => {
                              if (prev.includes(branch)) {
                                return prev.filter((b) => b !== branch);
                              } else {
                                return [...prev, branch];
                              }
                            });
                          }}
                          className="mr-2"
                        />
                        {branch}
                      </label>
                    ))}
                    <button
                      className="w-full text-center py-2 text-orange-600 hover:underline"
                      onClick={() => setShowBranchDropdown(false)}
                      type="button"
                    >
                      Đóng
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card tổng số khách trong khoảng ngày đã chọn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-4 lg:mb-6">
            <div className="bg-white rounded-xl shadow p-4 lg:p-6 flex flex-col items-center col-span-1 lg:col-span-4">
              <div className="text-sm lg:text-xl text-gray-700 mb-2 text-center font-semibold">
                Tổng số khách trong khoảng ngày đã chọn
              </div>
              <div className="text-3xl lg:text-5xl font-bold text-[#f66035] mb-2">
                {uniqueCustomersComparisonRaw?.current?.toLocaleString() ?? 0}{" "}
                <span className="text-lg lg:text-2xl">khách</span>
              </div>
              <div
                className={`text-base lg:text-xl font-semibold ${
                  uniqueCustomersComparisonRaw?.changePercent !== undefined
                    ? uniqueCustomersComparisonRaw.changePercent > 0
                      ? "text-green-600"
                      : uniqueCustomersComparisonRaw.changePercent < 0
                      ? "text-red-500"
                      : "text-gray-500"
                    : "text-gray-500"
                }`}
              >
                {uniqueCustomersComparisonRaw?.changePercent !== undefined
                  ? uniqueCustomersComparisonRaw.changePercent > 0
                    ? "↑"
                    : "↓"
                  : ""}{" "}
                {Math.abs(uniqueCustomersComparisonRaw?.changePercent ?? 0).toFixed(2)}%
              </div>
            </div>
          </div>

          {/* 4 bảng thống kê */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-4 lg:mb-6">
            {/* Trung bình đơn thực thu (Nam) */}
            <div className="bg-white rounded-xl shadow p-4 lg:p-6 flex flex-col items-center">
              <div className="text-sm lg:text-xl text-gray-700 mb-2 text-center">
                Trung bình đơn thực thu (Nam)
              </div>
              <div className="text-2xl font-bold text-[#f66035] mb-2">
                {loadingGenderRevenue ? (
                  <span>Đang tải...</span>
                ) : errorGenderRevenue ? (
                  <span className="text-red-500">{errorGenderRevenue}</span>
                ) : (
                  genderRevenueRaw?.avgRevenueMale?.toLocaleString() ?? 0
                )}
                <span className="text-lg lg:text-2xl">đ</span>
              </div>
            </div>
            {/* Trung bình đơn thực thu (Nữ) */}
            <div className="bg-white rounded-xl shadow p-4 lg:p-6 flex flex-col items-center">
              <div className="text-sm lg:text-xl text-gray-700 mb-2 text-center">
                Trung bình đơn thực thu (Nữ)
              </div>
              <div className="text-2xl font-bold text-[#0693e3] mb-2">
                {loadingGenderRevenue ? (
                  <span>Đang tải...</span>
                ) : errorGenderRevenue ? (
                  <span className="text-red-500">{errorGenderRevenue}</span>
                ) : (
                  genderRevenueRaw?.avgRevenueFemale?.toLocaleString() ?? 0
                )}
                <span className="text-lg lg:text-2xl">đ</span>
              </div>
            </div>
            {/* Trung bình đơn dịch vụ (Nam) */}
            <div className="bg-white rounded-xl shadow p-4 lg:p-6 flex flex-col items-center">
              <div className="text-sm lg:text-xl text-gray-700 mb-2 text-center">
                Trung bình đơn dịch vụ (Nam)
              </div>
              <div className="text-2xl font-bold text-[#00d082] mb-2">
                {loadingGenderRevenue ? (
                  <span>Đang tải...</span>
                ) : errorGenderRevenue ? (
                  <span className="text-red-500">{errorGenderRevenue}</span>
                ) : (
                  genderRevenueRaw?.avgServiceMale?.toLocaleString() ?? 0
                )}
                <span className="text-lg lg:text-2xl">đ</span>
              </div>
            </div>
            {/* Trung bình đơn dịch vụ (Nữ) */}
            <div className="bg-white rounded-xl shadow p-4 lg:p-6 flex flex-col items-center">
              <div className="text-sm lg:text-xl text-gray-700 mb-2 text-center">
                Trung bình đơn dịch vụ (Nữ)
              </div>
              <div className="text-2xl font-bold text-[#9b51e0] mb-2">
                {loadingGenderRevenue ? (
                  <span>Đang tải...</span>
                ) : errorGenderRevenue ? (
                  <span className="text-red-500">{errorGenderRevenue}</span>
                ) : (
                  genderRevenueRaw?.avgServiceFemale?.toLocaleString() ?? 0
                )}
                <span className="text-lg lg:text-2xl">đ</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row w-full gap-4 lg:gap-4">
            {/* Số khách tạo mới*/}

            <div
              className={`bg-white rounded-xl shadow p-2 ${
                isMobile
                  ? "w-full flex justify-center items-center mx-auto"
                  : "lg:w-1/2"
              } ${isMobile ? "max-w-xs" : ""}`}
              style={{ minWidth: isMobile ? 220 : undefined }}
            >
              <div className="w-full">
                <h2 className="text-base lg:text-xl text-center font-semibold text-gray-800 mb-2">
                  Số khách tạo mới
                </h2>
                {loadingNewCustomer ? (
                  <div>Đang tải dữ liệu...</div>
                ) : errorNewCustomer ? (
                  <div className="text-red-500">{errorNewCustomer}</div>
                ) : (
                  <ResponsiveContainer
                    width="100%"
                    height={isMobile ? 220 : 350}
                    minWidth={220}
                  >
                    <LineChart
                      data={newCustomerChartData}
                      margin={{
                        top: isMobile ? 10 : 30,
                        right: 10,
                        left: 10,
                        bottom: isMobile ? 20 : 40,
                      }}
                    >
                      <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
                      <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        fontSize={isMobile ? 10 : 12}
                        tickLine={false}
                        axisLine={{ stroke: "#d1d5db" }}
                        angle={isMobile ? -20 : 0}
                        textAnchor={isMobile ? "end" : "middle"}
                        height={isMobile ? 40 : 60}
                        tickFormatter={(date) => {
                          if (!date) return "";
                          const match = String(date).match(
                            /^\d{4}-(\d{2})-(\d{2})$/
                          );
                          if (match) {
                            const [, month, day] = match;
                            return `${day}/${month}`;
                          }
                          return String(date);
                        }}
                      />
                      <YAxis
                        stroke="#6b7280"
                        fontSize={isMobile ? 10 : 12}
                        tickLine={false}
                        axisLine={{ stroke: "#d1d5db" }}
                        tickFormatter={(value) =>
                          value > 0 ? `${value} ` : value
                        }
                        padding={{ bottom: 10, top: 10 }}
                      />
                      <Tooltip />
                      <Legend
                        wrapperStyle={{
                          paddingTop: isMobile ? 0 : "20px",
                          fontSize: isMobile ? "10px" : "14px",
                          color: "#4b5563",
                          display: isMobile ? "none" : undefined,
                        }}
                        iconType="circle"
                        iconSize={isMobile ? 8 : 10}
                      />
                      <Line
                        type="natural"
                        dataKey="value"
                        name="Số khách mới trong hệ thống"
                        stroke="#5bd1d7"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{
                          r: 6,
                          fill: "#5bd1d7",
                          stroke: "#fff",
                          strokeWidth: 2,
                        }}
                        animationDuration={1500}
                      />
                      <Line
                        type="natural"
                        dataKey="value2"
                        name="Số khách mới trong hệ thống (31 ngày trước)"
                        stroke="#eb94cf"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{
                          r: 6,
                          fill: "#eb94cf",
                          stroke: "#fff",
                          strokeWidth: 2,
                        }}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Tỉ lệ nam/nữ */}

            <div
              className={`bg-white rounded-xl shadow p-2 ${
                isMobile
                  ? "w-full max-w-xs mx-auto flex flex-col items-center"
                  : "lg:w-1/2"
              }`}
              style={{ minWidth: isMobile ? 220 : undefined }}
            >
              <h2 className="text-base lg:text-xl font-semibold text-gray-800 mb-2 text-center">
                Tỷ lệ nam/nữ khách mới tạo
              </h2>
              <div className="w-full flex justify-center">
                {loadingGenderRatio ? (
                  <div>Loading...</div>
                ) : errorGenderRatio ? (
                  <div className="text-red-500">{errorGenderRatio}</div>
                ) : (
                  <ResponsiveContainer
                    width="100%"
                    height={isMobile ? 180 : 350}
                    minWidth={220}
                  >
                    <PieChart>
                      <Pie
                        data={genderRatioData}
                        cx="50%"
                        cy="50%"
                        innerRadius={isMobile ? "0%" : "0%"}
                        outerRadius={isMobile ? "40%" : "80%"}
                        fill="#f933347"
                        dataKey="count"
                        nameKey="gender"
                        labelLine={false}
                        label={({
                          cx = 0,
                          cy = 0,
                          midAngle = 0,
                          innerRadius = 0,
                          outerRadius = 0,
                          percent = 0,
                          gender = "",
                          index = 0,
                        }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = (innerRadius + outerRadius) / 0.8;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return (
                            <text
                              x={x}
                              y={y}
                              fill={COLORS[index % COLORS.length]}
                              fontSize={isMobile ? 12 : 16}
                              textAnchor={x > cx ? "start" : "end"}
                              dominantBaseline="central"
                              fontWeight={600}
                            >
                              {`${gender}: ${(percent * 100).toFixed(1)}%`}
                            </text>
                          );
                        }}
                      >
                        {genderRatioData.map((entry, idx) => (
                          <Cell
                            key={entry.gender}
                            fill={COLORS[idx % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        wrapperStyle={{
                          paddingTop: isMobile ? 0 : "20px",
                          fontSize: isMobile ? "10px" : "14px",
                          color: "#4b5563",
                          display: isMobile ? "none" : undefined,
                        }}
                        iconType="circle"
                        iconSize={isMobile ? 8 : 10}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
          {/* Tổng số khách mới */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-4">
            {/* Tổng số khách mới trong hệ thống */}
            <div className="flex-1 bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
              <div className="text-xl font-medium text-gray-700 mb-2 text-center">
                Tổng số khách mới trong hệ thống
              </div>
              <div className="text-5xl font-bold text-black mb-2">
                {loadingCustomerSummary ? (
                  <span>Đang tải dữ liệu...</span>
                ) : errorCustomerSummary ? (
                  <span className="text-red-500">{errorCustomerSummary}</span>
                ) : (
                  customerSummaryRaw?.totalNewCustomers?.toLocaleString() ?? 0
                )}
              </div>
            </div>
            {/* Tổng số khách mới thực đi */}
            <div className="flex-1 bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
              <div className="text-xl font-medium text-gray-700 mb-2 text-center">
                Tổng số khách mới thực đi
              </div>
              <div className="text-5xl font-bold text-black mb-2">
                {loadingCustomerSummary ? (
                  <span>Đang tải dữ liệu...</span>
                ) : errorCustomerSummary ? (
                  <span className="text-red-500">{errorCustomerSummary}</span>
                ) : (
                  customerSummaryRaw?.actualCustomers?.toLocaleString() ?? 0
                )}
              </div>
            </div>
          </div>
          {/* Số khách tới chia theo phân loại */}
          <div
            className={`bg-white pt-2 mt-5 rounded-xl shadow-lg ${
              isMobile
                ? "w-full max-w-xs mx-auto flex flex-col items-center"
                : ""
            }`}
            style={{ minWidth: isMobile ? 220 : undefined }}
          >
            <h2 className="text-base lg:text-xl text-center font-semibold text-gray-800 p-3">
              Số khách tới chia theo loại
            </h2>
            <div className="w-full flex justify-center">
              <ResponsiveContainer
                width="100%"
                height={isMobile ? 180 : 350}
                minWidth={220}
              >
                <LineChart
                  data={customerTypeTrendData}
                  margin={{
                    top: isMobile ? 10 : 30,
                    right: 10,
                    left: 10,
                    bottom: isMobile ? 20 : 40,
                  }}
                >
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    fontSize={isMobile ? 10 : 12}
                    tickLine={false}
                    axisLine={{ stroke: "#d1d5db" }}
                    angle={isMobile ? -20 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 40 : 60}
                    tickFormatter={(date) => {
                      if (!date) return "";
                      const match = String(date).match(
                        /^\d{4}-(\d{2})-(\d{2})$/
                      );
                      if (match) {
                        const [, month, day] = match;
                        return `${day}/${month}`;
                      }
                      return String(date);
                    }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={isMobile ? 10 : 12}
                    tickLine={false}
                    axisLine={{ stroke: "#d1d5db" }}
                    tickFormatter={(value) =>
                      value > 0 ? `${value} khách` : value
                    }
                    padding={{ bottom: 10, top: 10 }}
                  />
                  <Tooltip />
                  <Legend
                    wrapperStyle={{
                      paddingTop: isMobile ? "" : "20px",
                      fontSize: isMobile ? "10px" : "14px",
                      color: "#4b5563",
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      alignItems: "center",
                      justifyContent: "center",
                      flexWrap: isMobile ? "nowrap" : "wrap",
                      width: "100%",
                      maxHeight: isMobile ? 80 : undefined,
                      overflowY: isMobile ? "auto" : undefined,
                    }}
                    iconType="circle"
                    iconSize={isMobile ? 8 : 10}
                    verticalAlign={isMobile ? "bottom" : undefined}
                  />
                  {customerTypeKeys.map((type, idx) => (
                    <Line
                      key={type}
                      type="natural"
                      dataKey={type}
                      name={type}
                      stroke={COLORS[idx % COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{
                        r: 6,
                        fill: COLORS[idx % COLORS.length],
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                      animationDuration={1500}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Nguồn của đơn hàng */}

          <div className="w-full bg-white rounded-xl shadow-lg mt-5">
            <div className="text-xl font-medium text-gray-700 text-center pt-5">
              Nguồn của đơn hàng
            </div>
            <div className="w-full bg-white rounded-xl shadow-lg">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  width={1000}
                  height={400}
                  data={customerSourceTrendData}
                  margin={{ top: 50, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    fontSize={isMobile ? 10 : 12}
                    tickFormatter={(date) => {
                      // date dạng 'YYYY-MM-DD' => 'DD/MM'
                      const match = date.match(/^\d{4}-(\d{2})-(\d{2})$/);
                      if (match) {
                        const [, month, day] = match;
                        return `${day}/${month}`;
                      }
                      return date;
                    }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend
                    wrapperStyle={{
                      paddingTop: 5,
                      paddingBottom: 10,
                      display: "flex",
                      justifyContent: "center",
                      flexWrap: "wrap",
                      width: "100%",
                      fontSize: "14px",
                    }}
                  />
                  {customerSourceKeys.map((source, idx) => (
                    <Bar
                      key={source}
                      dataKey={source}
                      fill={COLORS[idx % COLORS.length]}
                      name={source}
                      label={(props) => {
                        const { x, y, width, value, index } = props;
                        const d = customerSourceTrendData[index] as Record<string, number>;
                        if (!d) return <></>;
                        // Tìm giá trị lớn nhất trong các nguồn tại ngày đó
                        const max = Math.max(
                          ...customerSourceKeys.map((k) => Number(d[k] || 0))
                        );
                        return value === max && value > 0 ? (
                          <text
                            x={x + width / 2}
                            y={y - 5}
                            textAnchor="middle"
                            fill={COLORS[idx % COLORS.length]}
                            fontSize={14}
                            fontWeight={600}
                          >
                            {value}
                          </text>
                        ) : (
                          <></>
                        );
                      }}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Khách hàng tải app */}
          <div className="w-full bg-white rounded-xl shadow-lg mt-4 lg:mt-5">
            <div className="text-lg lg:text-xl font-medium text-gray-700 text-center pt-6 lg:pt-10">
              Khách tải app/không tải
            </div>
            <div className="flex justify-center items-center py-4 lg:py-8">
              {loading ? (
                <div>Đang tải dữ liệu...</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={300} minWidth={220}>
                    <BarChart data={appDownloadStatusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => {
                          if (!date) return "";
                          // Lấy ngày/tháng từ chuỗi ISO (YYYY-MM-DDTHH:mm:ss)
                          const match = String(date).match(
                            /^(\d{4})-(\d{2})-(\d{2})/
                          );
                          if (match) {
                            const [, , month, day] = match;
                            return `${day}/${month}`;
                          }
                          return String(date);
                        }}
                        fontSize={isMobile ? 10 : 12}
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend fontSize={isMobile ? 10 : 12} />
                      <Bar
                        dataKey="downloaded"
                        fill="#9ee347"
                        name="Đã tải app"
                      />
                      <Bar
                        dataKey="notDownloaded"
                        fill="#f0bf4c"
                        name="Chưa tải app"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
          </div>

          {/* Tỉ lệ khách hàng tải app/không tải app */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-2">
            <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-lg mt-4 lg:mt-5">
              <div className="text-lg lg:text-xl font-medium text-gray-700 text-center pt-6 lg:pt-10">
                Tỷ lệ tải app
              </div>
              <div className="flex justify-center items-center py-4 lg:py-8">
                {loadingAppDownload ? (
                  <div>Đang tải dữ liệu...</div>
                ) : errorAppDownload ? (
                  <div className="text-red-500">{errorAppDownload}</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={appDownloadPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="30%"
                        outerRadius="60%"
                        label={({ percent }) =>
                          percent && percent > 0.05
                            ? `${(percent * 100).toFixed(0)}%`
                            : ""
                        }
                        labelLine={false}
                      >
                        {appDownloadPieData.map((entry, idx) => (
                          <Cell
                            key={entry.name}
                            fill={
                              APP_CUSTOMER_PIE_COLORS[
                                idx % APP_CUSTOMER_PIE_COLORS.length
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        wrapperStyle={{
                          paddingTop: 10,
                          paddingBottom: 10,
                          display: "flex",
                          justifyContent: "center",
                          flexWrap: "wrap",
                          width: "100%",
                          fontSize: "11px",
                        }}
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart tỉ lệ khách mới/cũ */}
            <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-lg mt-4 lg:mt-5">
              <div className="text-lg lg:text-xl font-medium text-gray-700 text-center pt-6 lg:pt-10">
                Tỉ lệ khách mới/cũ
              </div>
              <div className="flex justify-center items-center py-4 lg:py-8">
                {loadingCustomerOldNewOrder ? (
                  <div>Đang tải dữ liệu...</div>
                ) : errorCustomerOldNewOrder ? (
                  <div className="text-red-500">{errorCustomerOldNewOrder}</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={customerOldNewOrderPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="30%"
                        outerRadius="60%"
                        label={({ percent }) =>
                          percent && percent > 0.05
                            ? `${(percent * 100).toFixed(0)}%`
                            : ""
                        }
                        labelLine={false}
                      >
                        {customerOldNewOrderPieData.map((entry, idx) => (
                          <Cell
                            key={entry.name}
                            fill={NEW_OLD_COLORS[idx % NEW_OLD_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        wrapperStyle={{
                          paddingTop: 10,
                          paddingBottom: 10,
                          display: "flex",
                          justifyContent: "center",
                          flexWrap: "wrap",
                          width: "100%",
                          fontSize: "11px",
                        }}
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Tỉ lệ đơn mua thẻ/ sản phẩm/ dịch vụ (khách mới) */}
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="w-full bg-white rounded-xl shadow-lg mt-4 lg:mt-5">
              <div className="text-lg lg:text-xl font-medium text-gray-700 text-center pt-6 lg:pt-10">
                Tỉ lệ các hình thức thanh toán ( khách mới )
              </div>
              <div className="flex justify-center items-center 18 lg:py-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentPercentNewPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="30%"
                      outerRadius="60%"
                      label={({ percent, name }) =>
                        percent && percent > 0.05
                          ? `${name}: ${(percent * 100).toFixed(1)}%`
                          : ""
                      }
                      labelLine={false}
                    >
                      {paymentPercentNewPieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) =>
                        `${Number(
                          value
                        ).toLocaleString()} (${props.payload.percent?.toFixed(
                          2
                        )}%)`
                      }
                    />
                    <Legend
                      wrapperStyle={{
                        paddingTop: 10,
                        paddingBottom: 10,
                        display: "flex",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        width: "100%",
                        fontSize: "12px",
                      }}
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tỉ lệ đơn mua thẻ/ sản phẩm/ dịch vụ (khách cũ) */}

            <div className="w-full bg-white rounded-xl shadow-lg mt-4 lg:mt-5">
              <div className="text-lg lg:text-xl font-medium text-gray-700 text-center pt-6 lg:pt-10">
                Tỉ lệ các hình thức thanh toán ( khách cũ )
              </div>
              <div className="flex justify-center items-center py-4 lg:py-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentPercentOldPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="30%"
                      outerRadius="60%"
                      label={({ percent, name }) =>
                        percent && percent > 0.05
                          ? `${name}: ${(percent * 100).toFixed(1)}%`
                          : ""
                      }
                      labelLine={false}
                    >
                      {paymentPercentOldPieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      wrapperStyle={{ fontSize: "12px" }}
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Thời gian đơn hàng được tạo */}
          <div className="w-full bg-white rounded-xl shadow-lg p-4 mt-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-5 gap-4">
              <h2 className="text-lg sm:text-xl font-semibold">
                Thời gian đơn hàng được tạo
              </h2>
              <div className="flex flex-wrap gap-2 text-xs mt-2 sm:mt-0">
                <span className="inline-flex items-center px-2 py-1 rounded bg-[#ffe5e5]">Khung giờ cao điểm</span>
                <span className="inline-flex items-center px-2 py-1 rounded bg-[#fff3cd]">Giá trị cao</span>
                <span className="inline-flex items-center px-2 py-1 rounded bg-[#e3fcec]">Giá trị trung bình</span>
                <span className="inline-flex items-center px-2 py-1 rounded bg-[#d1e7dd] border border-[#0f5132]">Chi nhánh cao điểm</span>
              </div>
            </div>
            {loadingFacilityHour ? (
              <div>Đang tải dữ liệu...</div>
            ) : errorFacilityHour ? (
              <div className="text-red-500">{errorFacilityHour}</div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <div className="max-h-[320px] overflow-y-auto">
                  <table className="min-w-[600px] w-full border text-center">
                    <thead>
                      <tr>
                        <th className="border px-2 py-1 bg-gray-100 text-left">Cơ sở</th>
                        {allHourRanges.map((hour) => (
                          <th
                            key={hour}
                            className={`border px-2 py-1 font-bold ${peakHours.includes(hour) ? 'bg-[#ffe5e5]' : ''}`}
                          >
                            {hour}
                          </th>
                        ))}
                        <th className="border px-2 py-1 bg-gray-100 font-bold">Tổng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facilityHourTableData.map((row) => (
                        <tr key={row.facility} className={peakFacilities.includes(row.facility) ? 'bg-[#d1e7dd] border border-[#0f5132]' : ''}>
                          <td className="border px-2 py-1 text-left font-semibold">{row.facility}</td>
                          {allHourRanges.map((hour) => {
                            const val = Number(row[hour] ?? 0);
                            const maxVal = hourTotals[hour] || 1;
                            return (
                              <td
                                key={hour}
                                className={`border px-2 py-1 ${peakHours.includes(hour) ? 'bg-[#ffe5e5]' : ''} ${getCellBg(val, maxVal)}`}
                              >
                                {val}
                              </td>
                            );
                          })}
                          <td className="border px-2 py-1 font-bold">{row.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
