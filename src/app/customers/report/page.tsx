"use client";
import React, { useState } from "react";
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

interface DataPoint {
  date: string;
  value: number;
  value2: number;
  type: string;
  status: string;
  gender: "Nam" | "Nữ";
  region?: string;
  branch?: string;
}

interface PieDataPoint {
  name: string;
  value: number;
  type: string;
  status: string;
  date: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: unknown[];
  label?: string | number;
}

interface MultiTypeCustomerDataPoint {
  date: string;
  KHTraiNghiem: number;
  KHThanhVien: number;
  KHBac: number;
  KHVang: number;
  KHDong: number;
  KHKimcuong: number;
  type: string;
  status: string;
}

interface OriginOfOrderDataPoint {
  date: string;
  vangLai: number;
  fanpage: number;
  chuaXacDinh: number;
  facebook: number;
  app: number;
  web: number;
  tiktok: number;
  type: string;
  status: string;
}

interface AppCustomerDataPoint {
  date: string;
  type: string;
  status: string;
  chuaTai: number;
  daTai: number;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className=" text-sm font-semibold text-gray-700">{`Ngày: ${label}`}</p>
        {(payload as Array<{ color: string; name: string; value: number }>).map(
          (entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          )
        )}
      </div>
    );
  }
  return null;
};

export default function CustomerReportPage() {
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

  // Thêm state cho Region và Branch
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const allRegions = ["Đã đóng cửa", "Đà Nẵng", "Nha Trang", "Hà Nội", "HCM"];

  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const allBranches = ["Branch 1", "Branch 2", "Branch 3"];

  // State for managing shop types
  const [shopTypes, setShopTypes] = useState<string[]>([
    "Trong Mall",
    "Shophouse",
    "Nhà phố",
    "Đã đóng cửa",
    "Khác",
  ]);
  const [showAddShopType, setShowAddShopType] = useState(false);
  const [newShopType, setNewShopType] = useState("");

  const customerTypes = [
    "KH trải nghiệm",
    "Khách hàng Thành viên",
    "Khách hàng Bạc",
    "Khách hàng Vàng",
    "Khách hàng Bạch Kim",
    "Khách hàng Kim cương",
  ];

  const customerStatus = ["New", "Old"];

  const data: DataPoint[] = [
    ...Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      const dateStr = `${day} thg 6`;
      return [
        {
          date: dateStr,
          value: 1200000 + (i % 5) * 20000 + i * 1000,
          value2: 1000000 + (i % 3) * 15000 + i * 800,
          type: "KH trải nghiệm",
          status: "New",
          gender: "Nam" as const,
          region: allRegions[i % allRegions.length],
          branch: allBranches[i % allBranches.length],
        },
        {
          date: dateStr,
          value: 1250000 + (i % 4) * 18000 + i * 1200,
          value2: 1050000 + (i % 2) * 17000 + i * 900,
          type: "KH trải nghiệm",
          status: "New",
          gender: "Nữ" as const,
          region: allRegions[(i + 1) % allRegions.length],
          branch: allBranches[(i + 1) % allBranches.length],
        },
        {
          date: dateStr,
          value: 1300000 + (i % 6) * 22000 + i * 1100,
          value2: 1100000 + (i % 4) * 13000 + i * 700,
          type: "Khách hàng Thành viên",
          status: "New",
          gender: "Nam" as const,
          region: allRegions[(i + 2) % allRegions.length],
          branch: allBranches[(i + 2) % allBranches.length],
        },
        {
          date: dateStr,
          value: 1350000 + (i % 3) * 25000 + i * 900,
          value2: 1150000 + (i % 5) * 12000 + i * 600,
          type: "Khách hàng Thành viên",
          status: "New",
          gender: "Nữ" as const,
          region: allRegions[(i + 3) % allRegions.length],
          branch: allBranches[(i + 3) % allBranches.length],
        },
      ];
    }).flat(),
  ];

  // kindOfCustomer: đủ cho 365 ngày trong năm 2025
  const kindOfCustomer: MultiTypeCustomerDataPoint[] = Array.from(
    { length: 365 },
    (_, i) => {
      const dateObj = new Date(2025, 0, 1 + i); // 0 = tháng 1
      const day = dateObj.getDate();
      const month = dateObj.getMonth() + 1;
      const dateStr = `${day} thg ${month}`;
      return {
        date: dateStr,
        KHTraiNghiem: 80 + (i % 5) * 2 + i,
        KHThanhVien: 70 + (i % 4) * 3 + i,
        KHDong: 40 + (i % 3) * 2 + i,
        KHBac: 35 + (i % 2) * 2 + i,
        KHKimcuong: 50 + (i % 6) * 2 + i,
        KHVang: 100 + (i % 7) * 2 + i,
        type: i % 2 === 0 ? "KH trải nghiệm" : "Khách hàng Thành viên",
        status: "New",
      };
    }
  );

  const pieData: PieDataPoint[] = [
    {
      name: "Nữ",
      value: 69,
      type: "KH trải nghiệm",
      status: "New",
      date: "1 thg 7, 2025",
    },
    {
      name: "Nam",
      value: 31,
      type: "KH trải nghiệm",
      status: "New",
      date: "1 thg 7, 2025",
    },
  ];

  const COLORS = ["#f59794", "#9ee347"];

  const originOfOrder: OriginOfOrderDataPoint[] = [
    {
      date: "1 thg 1, 2025",
      type: "KH trải nghiệm",
      status: "New",
      vangLai: 100,
      fanpage: 56,
      chuaXacDinh: 44,
      facebook: 48,
      app: 11,
      web: 2,
      tiktok: 2,
    },
    {
      date: "2 thg 1, 2025",
      type: "Khách hàng Thành viên",
      status: "New",
      vangLai: 56,
      fanpage: 56,
      chuaXacDinh: 39,
      facebook: 35,
      app: 12,
      web: 2,
      tiktok: 2,
    },
    {
      date: "3 thg 1, 2025",
      type: "Khách hàng Bạc",
      status: "New",
      vangLai: 53,
      fanpage: 47,
      chuaXacDinh: 41,
      facebook: 31,
      app: 10,
      web: 2,
      tiktok: 2,
    },
    {
      date: "4 thg 1, 2025",
      type: "Khách hàng Vàng",
      status: "New",
      vangLai: 53,
      fanpage: 47,
      chuaXacDinh: 41,
      facebook: 31,
      app: 10,
      web: 2,
      tiktok: 2,
    },
    {
      date: "5 thg 1, 2025",
      type: "Khách hàng Bạch Kim",
      status: "New",
      vangLai: 53,
      fanpage: 47,
      chuaXacDinh: 41,
      facebook: 31,
      app: 10,
      web: 2,
      tiktok: 2,
    },
    {
      date: "6 thg 1, 2025",
      type: "Khách hàng Kim cương",
      status: "New",
      vangLai: 53,
      fanpage: 47,
      chuaXacDinh: 41,
      facebook: 31,
      app: 10,
      web: 2,
      tiktok: 2,
    },
  ];

  const AppCustomer: AppCustomerDataPoint[] = [
    {
      date: "1 thg 7, 2025",
      type: "KH trải nghiệm",
      status: "New",
      chuaTai: 10,
      daTai: 30,
    },
    {
      date: "2 thg 7, 2025",
      type: "Khách hàng Thành viên",
      status: "New",
      chuaTai: 15,
      daTai: 25,
    },
    {
      date: "3 thg 7, 2025",
      type: "Khách hàng Bạc",
      status: "Old",
      chuaTai: 8,
      daTai: 22,
    },
    {
      date: "4 thg 7, 2025",
      type: "Khách hàng Vàng",
      status: "New",
      chuaTai: 12,
      daTai: 28,
    },
    {
      date: "5 thg 7, 2025",
      type: "Khách hàng Bạch Kim",
      status: "Old",
      chuaTai: 7,
      daTai: 18,
    },
    {
      date: "6 thg 7, 2025",
      type: "Khách hàng Kim cương",
      status: "New",
      chuaTai: 20,
      daTai: 50,
    },
  ];

  const totalChuaTai = AppCustomer.reduce((sum, item) => sum + item.chuaTai, 0);
  const totalDaTai = AppCustomer.reduce((sum, item) => sum + item.daTai, 0);

  const appCustomerPieData = [
    { name: "Đã Tải", value: totalDaTai },
    { name: "Chưa Tải", value: totalChuaTai },
  ];

  const APP_CUSTOMER_PIE_COLORS = ["#9ee347", "#f0bf4c"];

  const newOldCustomerData = [
    { name: "Khách mới", value: 2847, color: "#5bd1d7" },
    { name: "Khách cũ", value: 1690, color: "#eb94cf" },
  ];

  const NEW_OLD_COLORS = ["#5bd1d7", "#eb94cf"];

  const pieNewGuestData = [
    { name: "Normal payment", value: 100, color: "#ff6900" },
    { name: "Foxie Card Purchase ", value: 200, color: "#cf2e2e" },
    { name: "Products Purchase payment", value: 100, color: "#00d084" },
  ];

  const pieOldGuestData = [
    { name: "Normal payment", value: 100, color: "#9ee347" },
    { name: "Foxie Card Purchase ", value: 200, color: "#5bd1d7" },
    { name: "Products Purchase payment", value: 100, color: "#f0bf4c" },
  ];

  const NEW_GUEST_COLOR = ["#FF6900", "#CF2E2E", "#00D084"];

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
  >(
    data: T[],
    selectedType: string[],
    selectedStatus: string | null,
    start: CalendarDate,
    end: CalendarDate,
    selectedRegions?: string[],
    selectedBranches?: string[]
  ): T[] {
    return data.filter((item) => {
      const matchType =
        selectedType.length === 0 || selectedType.includes(item.type);
      const matchStatus = !selectedStatus || item.status === selectedStatus;
      const itemDate = parseVNDate(item.date);
      const matchDate =
        itemDate.compare(start) >= 0 && itemDate.compare(end) <= 0;
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
      return (
        matchType && matchStatus && matchDate && matchRegion && matchBranch
      );
    });
  }

  const isInRange = (d: DataPoint) => {
    const dDate = parseVNDate(d.date);
    return dDate.compare(startDate) >= 0 && dDate.compare(endDate) <= 0;
  };
  const maleData = data.filter((d) => d.gender === "Nam" && isInRange(d));
  const femaleData = data.filter((d) => d.gender === "Nữ" && isInRange(d));

  const maleRevenue =
    maleData.length > 0
      ? Math.round(
          maleData.reduce((sum, d) => sum + d.value, 0) / maleData.length
        )
      : 0;
  const femaleRevenue =
    femaleData.length > 0
      ? Math.round(
          femaleData.reduce((sum, d) => sum + d.value, 0) / femaleData.length
        )
      : 0;

  const maleOrderAvg =
    maleData.length > 0
      ? Math.round(
          maleData.reduce((sum, d) => sum + d.value2, 0) / maleData.length
        )
      : 0;
  const femaleOrderAvg =
    femaleData.length > 0
      ? Math.round(
          femaleData.reduce((sum, d) => sum + d.value2, 0) / femaleData.length
        )
      : 0;

  // Lấy ngày hiện tại và ngày trước đó từ endDate
  const currentDateStr = `${endDate.day} thg ${endDate.month}`;
  const prevDateObj = endDate.subtract({ days: 1 });
  const prevDateStr = `${prevDateObj.day} thg ${prevDateObj.month}`;

  const maleCurrent = data.filter(
    (d) => d.gender === "Nam" && d.date === currentDateStr
  );
  const malePrev = data.filter(
    (d) => d.gender === "Nam" && d.date === prevDateStr
  );
  const femaleCurrent = data.filter(
    (d) => d.gender === "Nữ" && d.date === currentDateStr
  );
  const femalePrev = data.filter(
    (d) => d.gender === "Nữ" && d.date === prevDateStr
  );

  const avg = (arr: DataPoint[]) =>
    arr.length > 0
      ? Math.round(arr.reduce((sum, d) => sum + d.value, 0) / arr.length)
      : 0;

  const maleCurrentAvg = avg(maleCurrent);
  const malePrevAvg = avg(malePrev);
  const femaleCurrentAvg = avg(femaleCurrent);
  const femalePrevAvg = avg(femalePrev);

  const calcChange = (current: number, prev: number) =>
    prev === 0 ? 0 : +(((current - prev) / prev) * 100).toFixed(1);

  // Helper để lấy icon, màu và text cho phần trăm thay đổi
  function getChangeIndicator(change: number) {
    if (isNaN(change) || change === null)
      return { icon: "→", color: "text-gray-400" };
    if (change > 0) return { icon: "⇧", color: "text-green-600" };
    if (change < 0) return { icon: "⇩", color: "text-red-500" };
    return { icon: "→", color: "text-gray-400" };
  }

  // Tổng số khách mới trong hệ thống (ví dụ: tổng value của ngày endDate)
  const totalCurrent = data
    .filter((d) => d.date === currentDateStr)
    .reduce((sum, d) => sum + d.value, 0);
  const totalPrev = data
    .filter((d) => d.date === prevDateStr)
    .reduce((sum, d) => sum + d.value, 0);
  const totalChange =
    totalPrev === 0
      ? null
      : +(((totalCurrent - totalPrev) / totalPrev) * 100).toFixed(1);
  const totalIndicator = getChangeIndicator(totalChange ?? 0);

  // Tổng số khách mới thực đi (ví dụ: tổng value2 của ngày endDate)
  const totalCurrent2 = data
    .filter((d) => d.date === currentDateStr)
    .reduce((sum, d) => sum + d.value2, 0);
  const totalPrev2 = data
    .filter((d) => d.date === prevDateStr)
    .reduce((sum, d) => sum + d.value2, 0);
  const totalChange2 =
    totalPrev2 === 0
      ? null
      : +(((totalCurrent2 - totalPrev2) / totalPrev2) * 100).toFixed(1);
  const totalIndicator2 = getChangeIndicator(totalChange2 ?? 0);

  // --- giữ lại logic cho 4 card đầu (nam/nữ) ---
  const maleRevenueChange =
    malePrevAvg === 0 ? null : calcChange(maleCurrentAvg, malePrevAvg);
  const femaleRevenueChange =
    femalePrevAvg === 0 ? null : calcChange(femaleCurrentAvg, femalePrevAvg);
  const maleIndicator = getChangeIndicator(maleRevenueChange ?? 0);
  const femaleIndicator = getChangeIndicator(femaleRevenueChange ?? 0);

  // Tính tổng số khách trong tuần hiện tại
  const weekStart = endDate.subtract({ days: 6 });
  const weekEnd = endDate;
  const prevWeekStart = endDate.subtract({ days: 13 });
  const prevWeekEnd = endDate.subtract({ days: 7 });

  const isInWeek = (d: DataPoint, start: CalendarDate, end: CalendarDate) => {
    const dDate = parseVNDate(d.date);
    return dDate.compare(start) >= 0 && dDate.compare(end) <= 0;
  };

  const weekTotal = data
    .filter((d) => isInWeek(d, weekStart, weekEnd))
    .reduce((sum, d) => sum + d.value, 0);
  const prevWeekTotal = data
    .filter((d) => isInWeek(d, prevWeekStart, prevWeekEnd))
    .reduce((sum, d) => sum + d.value, 0);

  const weekChange =
    prevWeekTotal === 0
      ? null
      : +(((weekTotal - prevWeekTotal) / prevWeekTotal) * 100).toFixed(1);
  const weekIndicator = getChangeIndicator(weekChange ?? 0);

  // Dữ liệu mẫu cho bảng thời gian đơn hàng được tạo
  const orderTimeHourRanges = [
    "0-1",
    "10-11",
    "11-12",
    "12-13",
    "13-14",
    "14-15",
    "15-16",
    "16-17",
    "17-18",
    "18-19",
    "19-20",
    "20-21",
    "21-22",
    "22-23",
  ];
  // Tính tổng cộng cuối bảng

  // Dữ liệu location/region mẫu cho từng shop type
  const shopTypeDetails: Record<
    string,
    Array<{ location: string; region: string; data: Record<string, number> }>
  > = {
    "Trong Mall": [
      {
        location: "Vincom Center Mall",
        region: "HCM",
        data: {
          "0-1": 75,
          "10-11": 91,
          "11-12": 121,
          "12-13": 100,
          "13-14": 94,
          "14-15": 100,
          "15-16": 69,
          "16-17": 77,
          "17-18": 44,
          "18-19": 50,
          "19-20": 60,
          "20-21": 40,
          "21-22": 30,
          "22-23": 20,
        },
      },
      {
        location: "Vincom Thảo Điền",
        region: "HCM",
        data: {
          "0-1": 57,
          "10-11": 51,
          "11-12": 56,
          "12-13": 64,
          "13-14": 61,
          "14-15": 69,
          "15-16": 44,
          "16-17": 54,
          "17-18": 34,
          "18-19": 40,
          "19-20": 45,
          "20-21": 30,
          "21-22": 20,
          "22-23": 10,
        },
      },
    ],
    Shophouse: [
      {
        location: "Shophouse 1",
        region: "Hà Nội",
        data: {
          "0-1": 20,
          "10-11": 30,
          "11-12": 40,
          "12-13": 50,
          "13-14": 60,
          "14-15": 70,
          "15-16": 80,
          "16-17": 90,
          "17-18": 100,
          "18-19": 110,
          "19-20": 120,
          "20-21": 130,
          "21-22": 140,
          "22-23": 150,
        },
      },
    ],
    "Nhà phố": [
      {
        location: "Nhà phố 1",
        region: "Đà Nẵng",
        data: {
          "0-1": 10,
          "10-11": 20,
          "11-12": 30,
          "12-13": 40,
          "13-14": 50,
          "14-15": 60,
          "15-16": 70,
          "16-17": 80,
          "17-18": 90,
          "18-19": 100,
          "19-20": 110,
          "20-21": 120,
          "21-22": 130,
          "22-23": 140,
        },
      },
    ],
    "Đã đóng cửa": [
      {
        location: "Closed 1",
        region: "Nha Trang",
        data: {
          "0-1": 1,
          "10-11": 2,
          "11-12": 3,
          "12-13": 4,
          "13-14": 5,
          "14-15": 6,
          "15-16": 7,
          "16-17": 8,
          "17-18": 9,
          "18-19": 10,
          "19-20": 11,
          "20-21": 12,
          "21-22": 13,
          "22-23": 14,
        },
      },
    ],
    Khác: [
      {
        location: "Other 1",
        region: "HCM",
        data: {
          "0-1": 2,
          "10-11": 3,
          "11-12": 4,
          "12-13": 5,
          "13-14": 6,
          "14-15": 7,
          "15-16": 8,
          "16-17": 9,
          "17-18": 10,
          "18-19": 11,
          "19-20": 12,
          "20-21": 13,
          "21-22": 14,
          "22-23": 15,
        },
      },
    ],
  };

  const [expandLocations, setExpandLocations] = useState(false);
  const [expandRegions, setExpandRegions] = useState(false);

  const handleToggleLocations = () => {
    setExpandLocations((prev) => {
      if (prev) setExpandRegions(false);
      return !prev;
    });
  };
  const handleToggleRegions = () => {
    setExpandRegions((prev) => !prev);
  };

  // Functions to handle shop type management
  const handleAddShopType = () => {
    if (newShopType.trim() && !shopTypes.includes(newShopType.trim())) {
      setShopTypes((prev) => [...prev, newShopType.trim()]);
      setNewShopType("");
      setShowAddShopType(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="p-2">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Customer Report
          </h1>

          <div className="flex gap-6 mb-6">
            {/* ...DatePicker code... */}
            <div className="w-full h-fit max-w-xl flex flex-row gap-4 bg-white p-2 rounded">
              <div className="w-full bg-white flex flex-col gap-1">
                <h3>Start date</h3>
                <input
                  type="date"
                  className="border rounded p-2 bg-white"
                  value={startDate.toString()}
                  onChange={(e) => {
                    const date = parseDate(e.target.value);
                    setStartDate(date);
                  }}
                  max={today(getLocalTimeZone()).toString()}
                />
              </div>
              <div className="w-full bg-white flex flex-col gap-1">
                <h3>End date</h3>
                <input
                  type="date"
                  className="border rounded p-2 bg-white"
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

            <div className="flex gap-6 mb-6">
              {/* Filter loại khách */}
              <div className="relative">
                <button
                  className="block border rounded p-2 w-64 text-left bg-white shadow"
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
                  <div className="absolute z-20 bg-white border rounded shadow w-64 mt-1 max-h-60 overflow-auto">
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
                  className="block border rounded p-2 w-64 text-left bg-white shadow"
                  onClick={() => setShowStatusDropdown((v) => !v)}
                  type="button"
                >
                  <span className="font-semibold">Khách mới/cũ</span>
                  {selectedStatus && <span>: {selectedStatus}</span>}
                  <span className="float-right">&#9660;</span>
                </button>
                {showStatusDropdown && (
                  <div className="absolute z-20 bg-white border rounded shadow w-64 mt-1 max-h-60 overflow-auto">
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
                  className="block border rounded p-2 w-64 text-left bg-white shadow"
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
                  <div className="absolute z-20 bg-white border rounded shadow w-64 mt-1 max-h-60 overflow-auto">
                    <label className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={selectedRegions.length === 0}
                        onChange={() => setSelectedRegions([])}
                        className="mr-2"
                      />
                      Tất cả
                    </label>
                    {allRegions.map((region) => (
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
                  className="block border rounded p-2 w-64 text-left bg-white shadow"
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
                    {allBranches.map((branch) => (
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

          {/* 4 bảng thống kê */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <div className="text-xl text-gray-700 mb-2">
                Trung bình thực thu của nam
              </div>
              <div className="text-5xl font-bold text-black mb-2">
                {maleRevenue.toLocaleString()}{" "}
                <span className="text-2xl">đ</span>
              </div>
              <div
                className={`flex items-center gap-2 text-xl font-semibold ${maleIndicator.color}`}
              >
                <span>{maleIndicator.icon}</span>
                {maleRevenueChange === null
                  ? "N/A"
                  : `${Math.abs(maleRevenueChange)}%`}
              </div>
            </div>
            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <div className="text-xl text-gray-700 mb-2">
                Trung bình thực thu của nữ
              </div>
              <div className="text-5xl font-bold text-black mb-2">
                {femaleRevenue.toLocaleString()}{" "}
                <span className="text-2xl">đ</span>
              </div>
              <div
                className={`flex items-center gap-2 text-xl font-semibold ${femaleIndicator.color}`}
              >
                <span>{femaleIndicator.icon}</span>
                {femaleRevenueChange === null
                  ? "N/A"
                  : `${Math.abs(femaleRevenueChange)}%`}
              </div>
            </div>
            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <div className="text-xl text-gray-700 mb-2">
                Trung bình đơn dịch vụ (Nam)
              </div>
              <div className="text-5xl font-bold text-black mb-2">
                {maleOrderAvg.toLocaleString()}{" "}
                <span className="text-2xl">đ</span>
              </div>
            </div>
            {/* Card 4 */}
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <div className="text-xl text-gray-700 mb-2">
                Trung bình đơn dịch vụ (Nữ)
              </div>
              <div className="text-5xl font-bold text-black mb-2">
                {femaleOrderAvg.toLocaleString()}{" "}
                <span className="text-2xl">đ</span>
              </div>
            </div>
          </div>

          <div className="flex w-full gap-4">
            {/* Số khách tạo mới*/}

            <div className="w-1/2 bg-white p-2 rounded-xl shadow-lg">
              <h2 className="text-xl text-center font-semibold text-gray-800 mb-4">
                Số khách tạo mới
              </h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={filterData(
                    data,
                    selectedType,
                    selectedStatus,
                    startDate,
                    endDate,
                    selectedRegions,
                    selectedBranches
                  )}
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#d1d5db" }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#d1d5db" }}
                    tickFormatter={(value) =>
                      value > 0 ? `${value} khách` : value
                    }
                    padding={{ bottom: 10, top: 10 }}
                  />
                  <Tooltip content={CustomTooltip} />
                  <Legend
                    wrapperStyle={{
                      paddingTop: "20px",
                      fontSize: "14px",
                      color: "#4b5563",
                    }}
                    iconType="circle"
                    iconSize={10}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Số khách mới"
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
                    type="monotone"
                    dataKey="value2"
                    name="Số khách mới (30 ngày trước)"
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
            </div>

            {/* Tỉ lệ nam/nữ */}

            <div className="w-1/2 bg-white p-2 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Tỷ lệ nam/nữ khách mới tạo
              </h2>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={filterData(
                      pieData,
                      selectedType,
                      selectedStatus,
                      startDate,
                      endDate,
                      selectedRegions,
                      selectedBranches
                    )}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={120}
                    fill="#f933347"
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    wrapperStyle={{
                      paddingTop: "20px",
                      fontSize: "14px",
                      color: "#9ee347",
                    }}
                    iconType="circle"
                    iconSize={10}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Tổng số khách mới */}
          <div className="flex gap-4 mt-4">
            {/* Tổng số khách mới trong hệ thống */}
            <div className="flex-1 bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
              <div className="text-xl font-medium text-gray-700 mb-2 text-center">
                Tổng số khách mới trong hệ thống
              </div>
              <div className="text-5xl font-bold text-black mb-2">
                {totalCurrent.toLocaleString()}
              </div>
              <div
                className={`flex items-center gap-1 text-2xl font-semibold ${totalIndicator.color}`}
              >
                <span>{totalIndicator.icon}</span>
                {totalChange === null ? "N/A" : `${Math.abs(totalChange)}%`}
              </div>
            </div>
            {/* Tổng số khách mới thực đi */}
            <div className="flex-1 bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
              <div className="text-xl font-medium text-gray-700 mb-2 text-center">
                Tổng số khách mới thực đi
              </div>
              <div className="text-5xl font-bold text-black mb-2">
                {totalCurrent2.toLocaleString()}
              </div>
              <div
                className={`flex items-center gap-1 text-2xl font-semibold ${totalIndicator2.color}`}
              >
                <span>{totalIndicator2.icon}</span>
                {totalChange2 === null ? "N/A" : `${Math.abs(totalChange2)}%`}
              </div>
            </div>
          </div>
          {/* Số khách tới chia theo phân loại */}
          <div className="w-100 bg-white pt-2 mt-5 rounded-xl shadow-lg">
            <h2 className="text-xl text-center font-semibold text-gray-800 mt-4">
              Số khách tới chia theo loại
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={filterData(
                  kindOfCustomer,
                  selectedType,
                  selectedStatus,
                  startDate,
                  endDate,
                  selectedRegions,
                  selectedBranches
                )}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
              >
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "#d1d5db" }}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickFormatter={(value) =>
                    value > 0 ? `${value} khách` : value
                  }
                  padding={{ bottom: 10, top: 10 }}
                />
                <Tooltip content={CustomTooltip} />
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                    fontSize: "14px",
                    color: "#4b5563",
                    gap: "5px",
                  }}
                  iconType="circle"
                  iconSize={10}
                />
                <Line
                  type="natural"
                  dataKey="KHTraiNghiem"
                  name="KH Trải Nghiệm"
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
                  dataKey="KHThanhVien"
                  name="KH Thành Viên"
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
                <Line
                  type="natural"
                  dataKey="KHDong"
                  name="KH Đồng"
                  stroke="#9ee347"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "#9ee347",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  animationDuration={1500}
                />
                <Line
                  type="natural"
                  dataKey="KHBac"
                  name="KH Bạc"
                  stroke="#f59794"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "#f59794",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  animationDuration={1500}
                />
                <Line
                  type="natural"
                  dataKey="KHVang"
                  name="KH Vàng"
                  stroke="#f0bf4c"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "#f0bf4c",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  animationDuration={1500}
                />
                <Line
                  type="natural"
                  dataKey="KHKimcuong"
                  name="KH Kim Cuơng"
                  stroke="#bccefb"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "#bccefb",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
            <div className="text-xl font-medium text-gray-700 mb-2 text-center">
              Tổng số khách trong tuần
            </div>
            <div className="text-5xl font-bold text-black mb-2">
              {weekTotal.toLocaleString()}
            </div>
            <div
              className={`flex items-center gap-1 text-2xl font-semibold ${weekIndicator.color}`}
            >
              <span>{weekIndicator.icon}</span>
              {weekChange === null ? "N/A" : `${Math.abs(weekChange)}%`}
            </div>
          </div>

          {/* Nguồn của đơn hàng */}

          <div className="w-full bg-white rounded-xl shadow-lg">
            <div className="text-xl font-medium text-gray-700 text-center">
              Nguồn của đơn hàng
            </div>
            <div className="w-full bg-white rounded-xl shadow-lg">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  width={1000}
                  height={400}
                  data={filterData(
                    originOfOrder,
                    selectedType,
                    selectedStatus,
                    startDate,
                    endDate,
                    selectedRegions,
                    selectedBranches
                  )}
                  margin={{ top: 50, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
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
                    }}
                  />
                  <Bar
                    dataKey="vangLai"
                    fill="#ff7f7f"
                    name="Vãng lai"
                    label={{ position: "top" }}
                  />
                  <Bar
                    dataKey="fanpage"
                    fill="#b39ddb"
                    name="Fanpage"
                    label={{ position: "top" }}
                  />
                  <Bar
                    dataKey="chuaXacDinh"
                    fill="#8d6e63"
                    name="Chưa xác định"
                    label={{ position: "top" }}
                  />
                  <Bar
                    dataKey="facebook"
                    fill="#c5e1a5"
                    name="Facebook"
                    label={{ position: "top" }}
                  />
                  <Bar
                    dataKey="app"
                    fill="#81d4fa"
                    name="App"
                    label={{ position: "top" }}
                  />
                  <Bar
                    dataKey="web"
                    fill="#fff176"
                    name="Web"
                    label={{ position: "top" }}
                  />
                  <Bar
                    dataKey="tiktok"
                    fill="#d81b60"
                    name="Tiktok shop"
                    label={{ position: "top" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex gap-2">
            {/* Khách hàng tải app */}
            <div className="w-3/4 bg-white rounded-xl shadow-lg mt-5 ">
              <div className="text-xl font-medium text-gray-700 text-center pt-10">
                Khách tải app/không tải
              </div>
              <div className="flex justify-center items-center py-8">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    width={1000}
                    height={400}
                    data={filterData(
                      AppCustomer,
                      selectedType,
                      selectedStatus,
                      startDate,
                      endDate,
                      selectedRegions,
                      selectedBranches
                    )}
                    margin={{ top: 50, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend
                      wrapperStyle={{
                        paddingTop: 10,
                        paddingBottom: 10,
                        display: "flex",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        width: "100%",
                      }}
                    />
                    <Bar
                      dataKey="chuaTai"
                      fill="#ff7f7f"
                      name="Chưa Tải"
                      label={{ position: "top" }}
                    />
                    <Bar
                      dataKey="daTai"
                      fill="#b39ddb"
                      name="Đã Tải"
                      label={{ position: "top" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="w-1/4 bg-white rounded-xl shadow-lg mt-5">
              <div className="text-xl font-medium text-gray-700 text-center pt-10">
                Tỷ lệ tải app
              </div>
              <div className="flex justify-center items-center py-8">
                <ResponsiveContainer width={400} height={400}>
                  <PieChart>
                    <Pie
                      data={appCustomerPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      label={({ name, percent }) =>
                        `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                      }
                    >
                      {appCustomerPieData.map((entry, idx) => (
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
                      }}
                    />
                    <text
                      x={200}
                      y={200}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={24}
                      fontWeight="bold"
                      fill="#333"
                    >
                      {`${Math.round(
                        (totalDaTai / (totalDaTai + totalChuaTai)) * 100
                      )}%`}
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart tỉ lệ khách mới/cũ */}
            <div className="w-1/4 bg-white rounded-xl shadow-lg mt-5">
              <div className="text-xl font-medium text-gray-700 text-center pt-10">
                Tỉ lệ khách mới/cũ
              </div>
              <div className="flex justify-center items-center py-8">
                <ResponsiveContainer width={400} height={400}>
                  <PieChart>
                    <Pie
                      data={newOldCustomerData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      label={({ name, percent }) =>
                        `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                      }
                    >
                      {newOldCustomerData.map((entry, idx) => (
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
                      }}
                    />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={18}
                      fontWeight="bold"
                      fill="#333"
                    >
                      {`${Math.round(
                        (newOldCustomerData[0].value /
                          (newOldCustomerData[0].value +
                            newOldCustomerData[1].value)) *
                          100
                      )}%`}
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Thời gian đơn hàng được tạo*/}
          <div className="w-full bg-white rounded-xl shadow-lg p-4 mt-5">
            <div className="flex justify-between items-center mt-5">
              <h2 className="text-xl font-semibold">
                Thời gian đơn hàng được tạo
              </h2>
              <div className="flex gap-2">
                {showAddShopType ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newShopType}
                      onChange={(e) => setNewShopType(e.target.value)}
                      placeholder="Nhập tên shop type"
                      className="border rounded px-2 py-1"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddShopType()
                      }
                    />
                    <button
                      onClick={handleAddShopType}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Thêm
                    </button>
                    <button
                      onClick={() => setShowAddShopType(false)}
                      className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddShopType(true)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    + Thêm Shop Type
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="w-full bg-white rounded-xl shadow-lg p-4 mt-6">
                <table className="min-w-full border text-center">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1 bg-gray-100 text-left">
                        <button
                          onClick={handleToggleLocations}
                          className="mr-2 text-lg font-bold text-blue-600 focus:outline-none"
                          title={
                            expandLocations
                              ? "Thu gọn Shop types"
                              : "Xem Locations"
                          }
                        >
                          {expandLocations ? "−" : "+"}
                        </button>
                        Shop types
                      </th>
                      {expandLocations && (
                        <th className="border px-2 py-1 bg-gray-100 text-left">
                          <button
                            onClick={handleToggleRegions}
                            className="mr-2 text-lg font-bold text-green-600 focus:outline-none"
                            title={
                              expandRegions ? "Thu gọn Locations" : "Xem Region"
                            }
                          >
                            {expandRegions ? "−" : "+"}
                          </button>
                          Locations
                        </th>
                      )}
                      {expandRegions && (
                        <th className="border px-2 py-1 bg-gray-100 text-left">
                          Region
                        </th>
                      )}
                      {orderTimeHourRanges.map((hour) => (
                        <th className="border px-2 py-1 bg-gray-100" key={hour}>
                          {hour}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(shopTypeDetails).map(
                      ([shopType, locations]) => {
                        const shopRowspan = expandLocations
                          ? expandRegions
                            ? locations.length
                            : locations.length
                          : 1;
                        let shopTypeRendered = false;
                        if (!expandLocations) {
                          // chỉ shop type
                          return (
                            <tr key={shopType}>
                              <td
                                rowSpan={shopRowspan}
                                className="border px-2 py-1 text-left"
                              >
                                {shopType}
                              </td>
                              {orderTimeHourRanges.map((hour) => (
                                <td className="border px-2 py-1" key={hour}>
                                  {locations.reduce(
                                    (sum, loc) => sum + (loc.data[hour] ?? 0),
                                    0
                                  )}
                                </td>
                              ))}
                            </tr>
                          );
                        }

                        return locations.map((loc) => {
                          const locRowspan = expandRegions ? 1 : 1; // mỗi location chỉ có 1 region
                          let locationRendered = false;
                          if (!expandRegions) {
                            // chỉ location
                            return (
                              <tr key={shopType + "-" + loc.location}>
                                {!shopTypeRendered &&
                                  (shopTypeRendered = true) && (
                                    <td
                                      rowSpan={shopRowspan}
                                      className="border px-2 py-1 text-left"
                                    >
                                      {shopType}
                                    </td>
                                  )}
                                <td
                                  rowSpan={locRowspan}
                                  className="border px-2 py-1 text-left"
                                >
                                  {loc.location}
                                </td>
                                {orderTimeHourRanges.map((hour) => (
                                  <td className="border px-2 py-1" key={hour}>
                                    {loc.data[hour] ?? 0}
                                  </td>
                                ))}
                              </tr>
                            );
                          }

                          return (
                            <tr key={shopType + "-" + loc.location + "-region"}>
                              {!shopTypeRendered &&
                                (shopTypeRendered = true) && (
                                  <td
                                    rowSpan={shopRowspan}
                                    className="border px-2 py-1 text-left"
                                  >
                                    {shopType}
                                  </td>
                                )}
                              {!locationRendered &&
                                (locationRendered = true) && (
                                  <td
                                    rowSpan={locRowspan}
                                    className="border px-2 py-1 text-left"
                                  >
                                    {loc.location}
                                  </td>
                                )}
                              <td className="border px-2 py-1 text-left">
                                {loc.region}
                              </td>
                              {orderTimeHourRanges.map((hour) => (
                                <td className="border px-2 py-1" key={hour}>
                                  {loc.data[hour] ?? 0}
                                </td>
                              ))}
                            </tr>
                          );
                        });
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Tỉ lệ đơn mua thẻ/ sản phẩm/ dịch vụ (khách mới) */}

          <div className="w-full bg-white rounded-xl shadow-lg mt-5">
            <div className="text-xl font-medium text-gray-700 text-center pt-10">
              Tỉ lệ đơn mua thẻ/ sản phẩm/ dịch vụ (khách mới)
            </div>
            <div className="flex justify-center items-center py-8">
              <ResponsiveContainer width={800} height={400}>
                <PieChart>
                  <Pie
                    data={pieNewGuestData}
                    dataKey="value"
                    nameKey="name"
                    cx="49%"
                    cy="55%"
                    innerRadius={100}
                    outerRadius={120}
                    cornerRadius={10}
                    paddingAngle={5}
                    label={({ name, percent }) =>
                      `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }
                  >
                    {newOldCustomerData.map((entry, idx) => (
                      <Cell
                        key={entry.name}
                        fill={NEW_GUEST_COLOR[idx % NEW_GUEST_COLOR.length]}
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
                    }}
                  />
                  <text
                    x="49%"
                    y="55%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={18}
                    fontWeight="bold"
                    fill="#333"
                  >
                    {`${Math.round(
                      (newOldCustomerData[0].value /
                        (newOldCustomerData[0].value +
                          newOldCustomerData[1].value)) *
                        100
                    )}%`}
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tỉ lệ đơn mua thẻ/ sản phẩm/ dịch vụ (khách cũ) */}

          <div className="w-full bg-white rounded-xl shadow-lg mt-2">
            <div className="text-xl font-medium text-gray-700 text-center pt-10">
              Tỉ lệ đơn mua thẻ/ sản phẩm/ dịch vụ (khách cũ)
            </div>
            <div className="flex justify-center items-center ">
              <ResponsiveContainer width={800} height={400}>
                <PieChart>
                  <Pie
                    data={pieOldGuestData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={120}
                    cornerRadius={10}
                    paddingAngle={5}
                    label={({ name, percent }) =>
                      `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }
                  >
                    {newOldCustomerData.map((entry, idx) => (
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
                    }}
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={18}
                    fontWeight="bold"
                    fill="#333"
                  >
                    {`${Math.round(
                      (newOldCustomerData[0].value /
                        (newOldCustomerData[0].value +
                          newOldCustomerData[1].value)) *
                        100
                    )}%`}
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
