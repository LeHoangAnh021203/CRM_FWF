"use client";
import React, { useState, useRef, useEffect } from "react";
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
  LabelList,
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

interface TotalRegionalSales {
  date: string;
  HCM: number;
  HaNoi: number;
  DaNang: number;
  NhaTrang: number;
  DaDongCua: number;
  type: string;
  status: string;
}

interface TotalSaleOfStores {
  date: string;
  Mall: number;
  Shophouse: number;
  NhaPho: number;
  DaDongCua: number;
  Khac: number;
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
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [regionSearch, setRegionSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const regionDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
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

  const TotalRegionalSales: TotalRegionalSales[] = [
    {
      date: "9 thg 6, 2025",
      HCM: 100,
      HaNoi: 90,
      DaNang: 80,
      NhaTrang: 70,
      DaDongCua: 60,
      type: "Tổng",
      status: "All",
    },

    {
      date: "8 thg 6, 2025",
      HCM: 100,
      HaNoi: 90,
      DaNang: 80,
      NhaTrang: 70,
      DaDongCua: 60,
      type: "Tổng",
      status: "All",
    },
    {
      date: "7 thg 6, 2025",
      HCM: 100,
      HaNoi: 90,
      DaNang: 80,
      NhaTrang: 70,
      DaDongCua: 60,
      type: "Tổng",
      status: "All",
    },
    {
      date: "6 thg 6, 2025",
      HCM: 100,
      HaNoi: 90,
      DaNang: 80,
      NhaTrang: 70,
      DaDongCua: 60,
      type: "Tổng",
      status: "All",
    },
    {
      date: "5 thg 6, 2025",
      HCM: 100,
      HaNoi: 90,
      DaNang: 80,
      NhaTrang: 70,
      DaDongCua: 60,
      type: "Tổng",
      status: "All",
    },
    {
      date: "4 thg 6, 2025",
      HCM: 100,
      HaNoi: 90,
      DaNang: 80,
      NhaTrang: 70,
      DaDongCua: 60,
      type: "Tổng",
      status: "All",
    },
    {
      date: "3 thg 6, 2025",
      HCM: 100,
      HaNoi: 90,
      DaNang: 80,
      NhaTrang: 70,
      DaDongCua: 60,
      type: "Tổng",
      status: "All",
    },
    {
      date: "1 thg 6, 2025",
      HCM: 100,
      HaNoi: 90,
      DaNang: 80,
      NhaTrang: 70,
      DaDongCua: 60,
      type: "Tổng",
      status: "All",
    },
    {
      date: "2 thg 6, 2025",
      HCM: 100,
      HaNoi: 90,
      DaNang: 80,
      NhaTrang: 70,
      DaDongCua: 60,
      type: "Tổng",
      status: "All",
    },
  ];

  const TotalSaleOfStores: TotalSaleOfStores[] = [
    {
      date: "9 thg 6, 2025",
      Mall: 100,
      Shophouse: 90,
      NhaPho: 80,
      DaDongCua: 70,
      Khac: 60,
      type: "Tổng",
      status: "All",
    },

    {
      date: "8 thg 6, 2025",
      Mall: 100,
      Shophouse: 90,
      NhaPho: 80,
      DaDongCua: 70,
      Khac: 60,
      type: "Tổng",
      status: "All",
    },
    {
      date: "7 thg 6, 2025",
      Mall: 100,
      Shophouse: 90,
      NhaPho: 80,
      DaDongCua: 60,
      Khac: 70,
      type: "Tổng",
      status: "All",
    },
    {
      date: "6 thg 6, 2025",
      Mall: 100,
      Shophouse: 90,
      NhaPho: 80,
      DaDongCua: 60,
      Khac: 70,
      type: "Tổng",
      status: "All",
    },
    {
      date: "5 thg 6, 2025",
      Mall: 100,
      Shophouse: 90,
      NhaPho: 80,
      DaDongCua: 60,
      Khac: 70,
      type: "Tổng",
      status: "All",
    },
    {
      date: "4 thg 6, 2025",
      Mall: 100,
      Shophouse: 90,
      NhaPho: 80,
      DaDongCua: 60,
      Khac: 70,
      type: "Tổng",
      status: "All",
    },
    {
      date: "3 thg 6, 2025",
      Mall: 100,
      Shophouse: 90,
      NhaPho: 80,
      DaDongCua: 60,
      Khac: 70,
      type: "Tổng",
      status: "All",
    },
    {
      date: "1 thg 6, 2025",
      Mall: 100,
      Shophouse: 90,
      NhaPho: 80,
      DaDongCua: 60,
      Khac: 70,
      type: "Tổng",
      status: "All",
    },
    {
      date: "2 thg 6, 2025",
      Mall: 100,
      Shophouse: 90,
      NhaPho: 80,
      DaDongCua: 60,
      Khac: 70,
      type: "Tổng",
      status: "All",
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

  const REGIONS = [
    "HCM",
    "Hà Nội",
    "Đà Nẵng",
    "Nha Trang",
    "Đã Đóng Cửa",
    "Khác",
  ];

  function isInWeek(d: DataPoint, start: CalendarDate, end: CalendarDate) {
    const dDate = parseVNDate(d.date);
    return dDate.compare(start) >= 0 && dDate.compare(end) <= 0;
  }

  // Đặt các biến tuần lên trước
  const weekStart = startDate;
  const weekEnd = endDate;
  const prevWeekStart = startDate.subtract({ days: 7 });
  const prevWeekEnd = startDate.subtract({ days: 1 });

  const weekRevenueData = filterData(
    TotalRegionalSales,
    selectedType,
    selectedStatus,
    weekStart,
    weekEnd,
    selectedRegions,
    selectedBranches
  );
  const prevWeekRevenueData = filterData(
    TotalRegionalSales,
    selectedType,
    selectedStatus,
    prevWeekStart,
    prevWeekEnd,
    selectedRegions,
    selectedBranches
  );

  // Helper to map region display name to data key
  function getRegionKey(region: string): keyof TotalRegionalSales | string {
    switch (region) {
      case "HCM":
        return "HCM";
      case "Hà Nội":
        return "HaNoi";
      case "Đà Nẵng":
        return "DaNang";
      case "Nha Trang":
        return "NhaTrang";
      case "Đã Đóng Cửa":
        return "DaDongCua";
      case "Khác":
        return "Khac";
      default:
        return "HCM";
    }
  }

  const regionStats = REGIONS.map((region) => {
    const ordersThisWeek = data.filter(
      (d) => d.region === region && isInWeek(d, weekStart, weekEnd)
    ).length;

    const ordersLastWeek = data.filter(
      (d) => d.region === region && isInWeek(d, prevWeekStart, prevWeekEnd)
    ).length;

    const deltaOrders = ordersThisWeek - ordersLastWeek;

    const regionKey = getRegionKey(region);
    const revenueThisWeek = weekRevenueData.reduce(
      (sum, item) => sum + ((item as any)[regionKey] || 0),
      0
    );

    const revenueLastWeek = prevWeekRevenueData.reduce(
      (sum, item) => sum + ((item as any)[regionKey] || 0),
      0
    );

    const percentDelta =
      revenueLastWeek === 0
        ? null
        : ((revenueThisWeek - revenueLastWeek) / revenueLastWeek) * 100;

    return {
      region,
      ordersThisWeek,
      deltaOrders,
      revenueThisWeek,
      percentDelta,
      revenueLastWeek,
    };
  });

  const totalRevenueThisWeek = regionStats.reduce(
    (sum, r) => sum + r.revenueThisWeek,
    0
  );

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
  // Tuần hiện tại: startDate đến endDate
  // Tuần hiện tại: startDate đến endDate

  // Tính tổng doanh số trong tuần từ dữ liệu TotalSaleOfStores
  const weekSalesData = filterData(
    TotalSaleOfStores,
    selectedType,
    selectedStatus,
    weekStart,
    weekEnd,
    selectedRegions,
    selectedBranches
  );
  const prevWeekSalesData = filterData(
    TotalSaleOfStores,
    selectedType,
    selectedStatus,
    prevWeekStart,
    prevWeekEnd,
    selectedRegions,
    selectedBranches
  );

  const totalWeekSales = weekSalesData.reduce(
    (sum, item) =>
      sum +
      item.Mall +
      item.Shophouse +
      item.NhaPho +
      item.DaDongCua +
      item.Khac,
    0
  );
  const totalPrevWeekSales = prevWeekSalesData.reduce(
    (sum, item) =>
      sum +
      item.Mall +
      item.Shophouse +
      item.NhaPho +
      item.DaDongCua +
      item.Khac,
    0
  );
  const weekSalesChange =
    totalPrevWeekSales === 0
      ? null
      : +(
          ((totalWeekSales - totalPrevWeekSales) / totalPrevWeekSales) *
          100
        ).toFixed(1);
  const weekSalesIndicator = getChangeIndicator(weekSalesChange ?? 0);

  // Tính tổng thực thu trong tuần từ dữ liệu TotalRegionalSales

  const totalWeekRevenue = weekRevenueData.reduce(
    (sum, item) =>
      sum +
      item.HCM +
      item.HaNoi +
      item.DaNang +
      item.NhaTrang +
      item.DaDongCua,
    0
  );
  const totalPrevWeekRevenue = prevWeekRevenueData.reduce(
    (sum, item) =>
      sum +
      item.HCM +
      item.HaNoi +
      item.DaNang +
      item.NhaTrang +
      item.DaDongCua,
    0
  );
  const weekRevenueChange =
    totalPrevWeekRevenue === 0
      ? null
      : +(
          ((totalWeekRevenue - totalPrevWeekRevenue) / totalPrevWeekRevenue) *
          100
        ).toFixed(1);
  const weekRevenueIndicator = getChangeIndicator(weekRevenueChange ?? 0);

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

  const dailyRegionRevenueData = filterData(
    TotalRegionalSales,
    selectedType,
    selectedStatus,
    weekStart,
    weekEnd,
    selectedRegions,
    selectedBranches
  );

  const dailyRegionRevenueDataWithTotal = dailyRegionRevenueData.map(
    (item) => ({
      ...item,
      total:
        (item.HCM || 0) +
        (item.HaNoi || 0) +
        (item.DaNang || 0) +
        (item.NhaTrang || 0) +
        (item.DaDongCua || 0),
    })
  );

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

  const barData = regionStats.map((r) => ({
    region: r.region,
    revenue: r.revenueThisWeek,
  }));

  const pieRegionRevenueData = regionStats.map((r) => ({
    name: r.region,
    value: r.revenueThisWeek,
  }));

  const dailyCustomerRevenue = filterData(
    kindOfCustomer,
    selectedType,
    selectedStatus,
    weekStart,
    weekEnd,
    selectedRegions,
    selectedBranches
  );

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        regionDropdownRef.current &&
        !regionDropdownRef.current.contains(e.target as Node)
      ) {
        setShowRegionDropdown(false);
      }
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(e.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  
  const locationOptions = [
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
  ];
  const filteredLocationOptions = locationOptions.filter((l) =>
    l.toLowerCase().includes(locationSearch.toLowerCase())
  );

  
  const locationRegionMap: Record<string, string> = {
    "Crescent Mall Q7": "HCM",
    "Vincom Thảo Điền": "HCM",
    "Vista Verde": "HCM",
    "Aeon Mall Tân Phú Celadon": "HCM",
    "Westpoint Phạm Hùng": "HCM",
    "Aeon Mall Bình Tân": "HCM",
    "Vincom Phan Văn Trị": "HCM",
    "Vincom Landmark 81": "HCM",
    "TTTM Estella Place": "HCM",
    "Võ Thị Sáu Q.1": "HCM",
    "The Sun Avenue": "HCM",
    "Trương Định Q.3": "HCM",
    "Hoa Lan Q.PN": "HCM",
    "Nowzone Q.1": "HCM",
    "Everrich Infinity Q.5": "HCM",
    "SC VivoCity": "HCM",
    "Vincom Lê Văn Việt": "HCM",
    "The Bonatica Q.TB": "HCM",
    "Midtown Q.7": "HCM",
    "Riviera Point Q7": "HCM",
    "Saigon Ofice": "HCM",
    "Millenium Apartment Q.4": "HCM",
    "Parc Mall Q.8": "HCM",
    "Saigon Mia Trung Sơn": "HCM",
    "Đảo Ngọc Ngũ Xã HN": "Hà Nội",
    "Imperia Sky Garden HN": "Hà Nội",
    "Vincom Bà Triệu": "Hà Nội",
    "Gold Coast Nha Trang": "Nha Trang",
    "Trần Phú Đà Nẵng": "Đà Nẵng",
    "Vincom Quang Trung": "HCM",
  };

  
  const regionOptions = regionStats.map((r) => ({
    name: r.region,
    total: Object.values(locationRegionMap).filter((reg) => reg === r.region).length,
  }));
  const filteredRegionOptions = regionOptions.filter((r) =>
    r.name.toLowerCase().includes(regionSearch.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="p-2 ">
          <div className=" gap-2">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Order Report
            </h1>
            <div className="flex gap-2" >
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

              <div className="flex mb-4 gap-2">
                {/* Region Dropdown */}
                <div className="relative" ref={regionDropdownRef}>
                  <button
                    className="bg-yellow-300 px-4 py-2 rounded-t-lg font-bold flex items-center gap-2 min-w-[250px] border-b-2 border-yellow-400"
                    onClick={() => setShowRegionDropdown((v) => !v)}
                    type="button"
                  >
                    <span className="material-icons"></span> Region
                  </button>
                  {showRegionDropdown && (
                    <div className="absolute z-20 bg-white shadow-xl rounded-b-lg w-full min-w-[250px] border border-yellow-200">
                      <div className="bg-yellow-200 px-4 py-2 font-bold flex items-center gap-2 border-b border-yellow-300">
                        <input
                          type="checkbox"
                          checked={
                            selectedRegions.length === regionOptions.length
                          }
                          onChange={() =>
                            setSelectedRegions(
                              selectedRegions.length === regionOptions.length
                                ? []
                                : regionOptions.map((r) => r.name)
                            )
                          }
                          className="accent-yellow-400"
                        />
                        Region
                        <span className="ml-auto">Branches </span>
                      </div>
                      <div className="px-2 py-2 border-b">
                        <input
                          className="w-full border rounded px-2 py-1"
                          placeholder="Nhập để tìm kiếm"
                          value={regionSearch}
                          onChange={(e) => setRegionSearch(e.target.value)}
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredRegionOptions.map((r) => (
                          <label
                            key={r.name}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-yellow-50 cursor-pointer border-b last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={selectedRegions.includes(r.name)}
                              onChange={() => {
                                setSelectedRegions((prev) =>
                                  prev.includes(r.name)
                                    ? prev.filter((x) => x !== r.name)
                                    : [...prev, r.name]
                                );
                              }}
                              className="accent-yellow-400"
                            />
                            <span className="font-medium">{r.name}</span>
                            <span className="ml-auto text-right min-w-[70px] font-semibold">
                              {r.total}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Location Dropdown */}
                <div className="relative" ref={locationDropdownRef}>
                  <button
                    className="bg-yellow-300 px-4 py-2 rounded-t-lg font-bold flex items-center gap-2 min-w-[220px] border-b-2 border-yellow-400"
                    onClick={() => setShowLocationDropdown((v) => !v)}
                    type="button"
                  >
                    <span className="material-icons"></span> Locations
                  </button>
                  {showLocationDropdown && (
                    <div className="absolute z-20 bg-white shadow-xl rounded-b-lg w-full min-w-[220px] border border-yellow-200">
                      <div className="bg-yellow-100 px-4 py-2 font-bold flex items-center gap-2 border-b border-yellow-200">
                        <input
                          type="checkbox"
                          checked={
                            selectedBranches.length === locationOptions.length
                          }
                          onChange={() =>
                            setSelectedBranches(
                              selectedBranches.length === locationOptions.length
                                ? []
                                : [...locationOptions]
                            )
                          }
                          className="accent-yellow-400"
                        />
                        Locations
                      </div>
                      <div className="px-2 py-2 border-b">
                        <input
                          className="w-full border rounded px-2 py-1"
                          placeholder="Nhập để tìm kiếm"
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredLocationOptions.map((loc) => (
                          <label
                            key={loc}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-yellow-50 cursor-pointer border-b last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={selectedBranches.includes(loc)}
                              onChange={() => {
                                setSelectedBranches((prev) =>
                                  prev.includes(loc)
                                    ? prev.filter((x) => x !== loc)
                                    : [...prev, loc]
                                );
                              }}
                              className="accent-yellow-400"
                            />
                            <span className="font-medium">{loc}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tổng doanh số vùng */}

          <div className="w-full bg-white rounded-xl shadow-lg mt-5">
            <div className="text-xl font-medium text-gray-700 text-center mt-5">
              Tổng doanh số vùng
            </div>
            <div className="w-full bg-white rounded-xl shadow-lg">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  width={1000}
                  height={400}
                  data={filterData(
                    TotalRegionalSales,
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
                    dataKey="HCM"
                    fill="#ff7f7f"
                    name="HCM"
                    label={{ position: "top" }}
                  />
                  <Bar
                    dataKey="HaNoi"
                    fill="#b39ddb"
                    name="Hà Nội"
                    label={{ position: "top" }}
                  />
                  <Bar
                    dataKey="DaNang"
                    fill="#8d6e63"
                    name="Đà Nẵng"
                    label={{ position: "top" }}
                  />
                  <Bar
                    dataKey="NhaTrang"
                    fill="#c5e1a5"
                    name="Nha Trang"
                    label={{ position: "top" }}
                  />
                  <Bar
                    dataKey="DaDongCua"
                    stackId="a"
                    fill="#f0bf4c"
                    name="Đã đóng cửa"
                    label={{ position: "top" }}
                  >
                    <LabelList
                      dataKey="total"
                      position="top"
                      formatter={(value) =>
                        value ? value.toLocaleString() : ""
                      }
                      style={{
                        fontWeight: "bold",
                        fill: "#f0bf4c",
                        fontSize: 16,
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tổng doanh số loại cửa hàng*/}

          <div className="w-full bg-white rounded-xl shadow-lg mt-5">
            <div className="text-xl font-medium text-gray-700 text-center mt-5">
              Tổng doanh số loại cửa hàng
            </div>
            <div className="w-full bg-white rounded-xl shadow-lg">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  width={1000}
                  height={400}
                  data={filterData(
                    TotalSaleOfStores,
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
                    dataKey="Mall"
                    fill="#ff7f7f"
                    name="Mall"
                    label={{ position: "top" }}
                  />
                  <Bar
                    dataKey="Shophouse"
                    fill="#b39ddb"
                    name="Shophouse"
                    label={{ position: "top" }}
                  />
                  <Bar
                    dataKey="NhaPho"
                    fill="#8d6e63"
                    name="Nhà phố"
                    label={{ position: "top" }}
                  />
                  <Bar
                    dataKey="DaDongCua"
                    fill="#c5e1a5"
                    name="Đã đóng cửa"
                    label={{ position: "top" }}
                  />
                  <Bar
                    dataKey="Khac"
                    fill="#81d4fa"
                    name="Khác"
                    label={{ position: "top" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tổng doanh số và Tổng thực thu */}

          <div className="flex gap-4 mt-4">
            {/* Tổng doanh số trong tuần */}
            <div className="flex-1 bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
              <div className="text-xl font-medium text-gray-700 mb-2 text-center">
                Tổng doanh số trong tuần
              </div>
              <div className="text-5xl font-bold text-black mb-2">
                {totalWeekSales.toLocaleString()}
              </div>
              <div
                className={`flex items-center gap-1 text-2xl font-semibold ${weekSalesIndicator.color}`}
              >
                <span>{weekSalesIndicator.icon}</span>
                {weekSalesChange === null
                  ? "N/A"
                  : `${Math.abs(weekSalesChange)}%`}
              </div>
            </div>
            {/* Tổng thực thu trong tuần */}
            <div className="flex-1 bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center w-3/4">
              <div className="text-xl font-medium text-gray-700 mb-2 text-center">
                Tổng thực thu trong tuần
              </div>
              <div className="text-5xl font-bold text-black mb-2">
                {totalWeekRevenue.toLocaleString()}
              </div>
              <div
                className={`flex items-center gap-1 text-2xl font-semibold ${weekRevenueIndicator.color}`}
              >
                <span>{weekRevenueIndicator.icon}</span>
                {weekRevenueChange === null
                  ? "N/A"
                  : `${Math.abs(weekRevenueChange)}%`}
              </div>
            </div>
          </div>

          {/* Thực thu tại các khu vực trong tuần */}
          <div className="flex w-[100%] bg-white rounded-xl shadow-lg gap-5 mt-5 h-[500px] items-center">
            <div className="overflow-x-auto w-2/3 justify-center items-center rounded-xl ml-2">
              <div className="text-xl font-medium text-gray-700 text-center p-2">
                Tổng thực thu tại các khu vực trong tuần
              </div>
              <div className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-yellow-100 text-gray-900">
                      <th className="px-4 py-2 border-b font-semibold text-left">
                        Khu vực
                      </th>
                      <th className="px-4 py-2 border-b font-semibold text-right">
                        Số đơn
                      </th>
                      <th className="px-4 py-2 border-b font-semibold text-right">
                        Δ
                      </th>
                      <th className="px-4 py-2 border-b font-semibold text-right">
                        Thực thu
                      </th>
                      <th className="px-4 py-2 border-b font-semibold text-right">
                        % Δ
                      </th>
                      <th className="px-4 py-2 border-b font-semibold text-right">
                        %Thực thu
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {regionStats.map((r) => (
                      <tr key={r.region} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b text-left">
                          {r.region}
                        </td>
                        <td className="px-4 py-2 border-b text-right">
                          {r.ordersThisWeek}
                        </td>
                        <td
                          className={`px-4 py-2 border-b text-right ${
                            r.deltaOrders > 0
                              ? "text-green-600"
                              : r.deltaOrders < 0
                              ? "text-red-500"
                              : ""
                          }`}
                        >
                          {r.deltaOrders}{" "}
                          {r.deltaOrders > 0
                            ? "↑"
                            : r.deltaOrders < 0
                            ? "↓"
                            : ""}
                        </td>
                        <td className="px-4 py-2 border-b text-right">
                          {r.revenueThisWeek.toLocaleString()}
                        </td>
                        <td
                          className={`px-4 py-2 border-b text-right ${
                            r.percentDelta && r.percentDelta > 0
                              ? "text-green-600"
                              : r.percentDelta && r.percentDelta < 0
                              ? "text-red-500"
                              : ""
                          }`}
                        >
                          {r.percentDelta === null
                            ? "N/A"
                            : `${r.percentDelta.toFixed(1)}%`}
                          {r.percentDelta && r.percentDelta > 0
                            ? "↑"
                            : r.percentDelta && r.percentDelta < 0
                            ? "↓"
                            : ""}
                        </td>
                        <td className="px-4 py-2 border-b text-right">
                          {totalRevenueThisWeek === 0
                            ? "0.00"
                            : (
                                (r.revenueThisWeek / totalRevenueThisWeek) *
                                100
                              ).toFixed(2)}
                          %
                        </td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-gray-100">
                      <td className="px-4 py-2 border-t text-left">
                        Tổng cộng
                      </td>
                      <td className="px-4 py-2 border-t text-right">
                        {regionStats.reduce(
                          (sum, r) => sum + r.ordersThisWeek,
                          0
                        )}
                      </td>
                      <td className="px-4 py-2 border-t text-right">
                        {regionStats.reduce((sum, r) => sum + r.deltaOrders, 0)}
                      </td>
                      <td className="px-4 py-2 border-t text-right">
                        {totalRevenueThisWeek.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 border-t text-right"></td>
                      <td className="px-4 py-2 border-t text-right">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tổng thực thu tại các khu vực trong tuần */}

            <div className="w-1/3 bg-white rounded-xl shadow-lg h-full mr-2">
              <div className="text-xl font-medium text-gray-700 text-center m-2">
                Tổng thực thu tại các khu vực trong tuần
              </div>
              <div className="flex justify-center items-center ">
                <ResponsiveContainer width={650} height={400}>
                  <PieChart>
                    <Pie
                      data={pieRegionRevenueData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      label={({ name, percent }) =>
                        percent !== undefined
                          ? `${name}: ${(percent * 100).toFixed(1)}%`
                          : name
                      }
                    >
                      {pieRegionRevenueData.map((entry, idx) => (
                        <Cell
                          key={entry.name}
                          fill={
                            [
                              "#8d6e63",
                              "#b39ddb",
                              "#81d4fa",
                              "#f0bf4c",
                              "#ff7f7f",
                              "#9ee347",
                            ][idx % 6]
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
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tổng thực thu tại các khu vực theo ngày */}

          <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-4">
            <div className="text-xl font-medium text-gray-700 text-center mb-4">
              Tổng thực thu tại các khu vực theo ngày
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={dailyRegionRevenueDataWithTotal}
                margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
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
                <Bar dataKey="HCM" stackId="a" fill="#8d6e63" name="HCM" />
                <Bar dataKey="HaNoi" stackId="a" fill="#b6d47a" name="Hà Nội" />
                <Bar
                  dataKey="DaNang"
                  stackId="a"
                  fill="#81d4fa"
                  name="Đà Nẵng"
                />
                <Bar
                  dataKey="NhaTrang"
                  stackId="a"
                  fill="#ff7f7f"
                  name="Nha Trang"
                />
                <Bar
                  dataKey="DaDongCua"
                  stackId="a"
                  fill="#f0bf4c"
                  name="Đã đóng cửa"
                >
                  <LabelList
                    dataKey="total"
                    position="top"
                    formatter={(value) => (value ? value.toLocaleString() : "")}
                    style={{
                      fontWeight: "bold",
                      fill: "#f0bf4c",
                      fontSize: 16,
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tổng thực thu theo loại cửa hàng */}
          <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-4">
            <div className="text-xl font-medium text-gray-700 text-center mb-4">
              Tổng thực thu theo loại cửa hàng
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={filterData(
                  TotalSaleOfStores,
                  selectedType,
                  selectedStatus,
                  weekStart,
                  weekEnd,
                  selectedRegions,
                  selectedBranches
                )}
                margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
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
                <Line
                  type="monotone"
                  dataKey="Mall"
                  name="Trong Mall"
                  stroke="#8d6e63"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Shophouse"
                  name="Shophouse"
                  stroke="#b6d47a"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="NhaPho"
                  name="Nhà phố"
                  stroke="#ff7f7f"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Khac"
                  name="Khác"
                  stroke="#81d4fa"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="DaDongCua"
                  name="Đã đóng cửa"
                  stroke="#f0bf4c"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tổng thực thu theo loại khách hàng trong tuần */}

          <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-4">
            <div className="text-xl font-medium text-gray-700 text-center mb-4">
              Tổng thực thu theo loại khách hàng trong tuần
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={dailyCustomerRevenue}
                margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
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
                  dataKey="KHTraiNghiem"
                  name="KH trải nghiệm"
                  fill="#8d6e63"
                ></Bar>
                <Bar
                  dataKey="KHThanhVien"
                  name="KH Thành viên"
                  fill="#b6d47a"
                ></Bar>
                <Bar dataKey="KHBac" name="KH Bạc" fill="#ff7f7f"></Bar>
                <Bar dataKey="KHVang" name="KH Vàng" fill="#81d4fa"></Bar>
                <Bar dataKey="KHDong" name="KH Đồng" fill="#f0bf4c"></Bar>
                <Bar
                  dataKey="KHKimcuong"
                  name="KH Kim cương"
                  fill="#bccefb"
                ></Bar>
              </BarChart>
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
                <div className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                  <table className="min-w-full bg-white">
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
                                expandRegions
                                  ? "Thu gọn Locations"
                                  : "Xem Region"
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
                          <th
                            className="border px-2 py-1 bg-gray-100"
                            key={hour}
                          >
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
                              <tr
                                key={shopType + "-" + loc.location + "-region"}
                              >
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

          {/* Tổng thực thu theo loại cửa hàng */}
          <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-4">
            <div className="text-xl font-medium text-gray-700 text-center mb-4">
              Tổng thực thu theo loại cửa hàng
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={filterData(
                  TotalSaleOfStores,
                  selectedType,
                  selectedStatus,
                  weekStart,
                  weekEnd,
                  selectedRegions,
                  selectedBranches
                )}
                margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
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
                <Line
                  type="monotone"
                  dataKey="Mall"
                  name="Trong Mall"
                  stroke="#8d6e63"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Shophouse"
                  name="Shophouse"
                  stroke="#b6d47a"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="NhaPho"
                  name="Nhà phố"
                  stroke="#ff7f7f"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Khac"
                  name="Khác"
                  stroke="#81d4fa"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="DaDongCua"
                  name="Đã đóng cửa"
                  stroke="#f0bf4c"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tổng thực thu theo loại khách hàng trong tuần */}
          <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-4">
            <div className="text-xl font-medium text-gray-700 text-center mb-4">
              Tổng thực thu theo loại khách hàng trong tuần
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={[
                  {
                    name: "KH Trải nghiệm",
                    value: filterData(
                      kindOfCustomer,
                      selectedType,
                      selectedStatus,
                      weekStart,
                      weekEnd,
                      selectedRegions,
                      selectedBranches
                    ).reduce((sum, d) => sum + (d.KHTraiNghiem || 0), 0),
                    fill: "#8d6e63",
                  },
                  {
                    name: "KH Thành viên",
                    value: filterData(
                      kindOfCustomer,
                      selectedType,
                      selectedStatus,
                      weekStart,
                      weekEnd,
                      selectedRegions,
                      selectedBranches
                    ).reduce((sum, d) => sum + (d.KHThanhVien || 0), 0),
                    fill: "#b6d47a",
                  },
                  {
                    name: "KH Bạc",
                    value: filterData(
                      kindOfCustomer,
                      selectedType,
                      selectedStatus,
                      weekStart,
                      weekEnd,
                      selectedRegions,
                      selectedBranches
                    ).reduce((sum, d) => sum + (d.KHBac || 0), 0),
                    fill: "#ff7f7f",
                  },
                  {
                    name: "KH Vàng",
                    value: filterData(
                      kindOfCustomer,
                      selectedType,
                      selectedStatus,
                      weekStart,
                      weekEnd,
                      selectedRegions,
                      selectedBranches
                    ).reduce((sum, d) => sum + (d.KHVang || 0), 0),
                    fill: "#81d4fa",
                  },
                  {
                    name: "KH Đồng",
                    value: filterData(
                      kindOfCustomer,
                      selectedType,
                      selectedStatus,
                      weekStart,
                      weekEnd,
                      selectedRegions,
                      selectedBranches
                    ).reduce((sum, d) => sum + (d.KHDong || 0), 0),
                    fill: "#f0bf4c",
                  },
                  {
                    name: "KH Kim cương",
                    value: filterData(
                      kindOfCustomer,
                      selectedType,
                      selectedStatus,
                      weekStart,
                      weekEnd,
                      selectedRegions,
                      selectedBranches
                    ).reduce((sum, d) => sum + (d.KHKimcuong || 0), 0),
                    fill: "#bccefb",
                  },
                ]}
                margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
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
                <Bar dataKey="value">
                  {[
                    "#8d6e63",
                    "#b6d47a",
                    "#ff7f7f",
                    "#81d4fa",
                    "#f0bf4c",
                    "#bccefb",
                  ].map((color, idx) => (
                    <Cell key={color} fill={color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
