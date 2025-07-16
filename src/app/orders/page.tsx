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

export default function CustomerReportPage() {
  const [startDate, setStartDate] = useState<CalendarDate>(
    today(getLocalTimeZone()).subtract({ days: 7 })
  );
  const [endDate, setEndDate] = useState<CalendarDate>(
    today(getLocalTimeZone())
  );
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

  // Thêm state cho Region và Branch
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [regionSearch, setRegionSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const regionDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
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
  const data: DataPoint[] = [
    ...Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      const dateStr = `${day} thg 6`;
      const allLocations = [
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
      return [
        {
          date: dateStr,
          value: 1200000 + (i % 5) * 20000 + i * 1000,
          value2: 1000000 + (i % 3) * 15000 + i * 800,
          type: "KH trải nghiệm",
          status: "New",
          gender: "Nam" as const,
          region: locationRegionMap[allLocations[i % allLocations.length]],
          branch: allLocations[i % allLocations.length],
        },
        {
          date: dateStr,
          value: 1250000 + (i % 4) * 18000 + i * 1200,
          value2: 1050000 + (i % 2) * 17000 + i * 900,
          type: "KH trải nghiệm",
          status: "New",
          gender: "Nữ" as const,
          region:
            locationRegionMap[allLocations[(i + 1) % allLocations.length]],
          branch: allLocations[(i + 1) % allLocations.length],
        },
        {
          date: dateStr,
          value: 1300000 + (i % 6) * 22000 + i * 1100,
          value2: 1100000 + (i % 4) * 13000 + i * 700,
          type: "Khách hàng Thành viên",
          status: "New",
          gender: "Nam" as const,
          region:
            locationRegionMap[allLocations[(i + 2) % allLocations.length]],
          branch: allLocations[(i + 2) % allLocations.length],
        },
        {
          date: dateStr,
          value: 1350000 + (i % 3) * 25000 + i * 900,
          value2: 1150000 + (i % 5) * 12000 + i * 600,
          type: "Khách hàng Thành viên",
          status: "New",
          gender: "Nữ" as const,
          region:
            locationRegionMap[allLocations[(i + 3) % allLocations.length]],
          branch: allLocations[(i + 3) % allLocations.length],
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
  // Định nghĩa lại hàm formatMoneyShort trước khi dùng cho BarChart
  function formatMoneyShort(val: number) {
    if (val >= 1_000_000_000_000)
      return (val / 1_000_000_000_000).toFixed(1) + " T";
    if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1) + " T";
    if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + " Tr";
    return val.toLocaleString();
  }

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
    selectedRegions,
    selectedBranches
  );
  const prevWeekRevenueData = filterData(
    TotalRegionalSales,
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
    const regionKey = getRegionKey(region) as keyof TotalRegionalSales;
    const revenueThisWeek = weekRevenueData.reduce(
      (sum, item) => sum + Number(item[regionKey] ?? 0),
      0
    );
    const revenueLastWeek = prevWeekRevenueData.reduce(
      (sum, item) => sum + Number(item[regionKey] ?? 0),
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

  // --- TÍNH TOÁN SỐ LIỆU TỔNG HỢP ---
  // 1. Tổng thực thu tuần này và tuần trước
  const totalRevenueThisWeek = data
    .filter((d) => isInWeek(d, weekStart, weekEnd))
    .reduce((sum, d) => sum + d.value, 0);
  const totalRevenueLastWeek = data
    .filter((d) => isInWeek(d, prevWeekStart, prevWeekEnd))
    .reduce((sum, d) => sum + d.value, 0);
  const percentRevenue =
    totalRevenueLastWeek === 0
      ? null
      : ((totalRevenueThisWeek - totalRevenueLastWeek) / totalRevenueLastWeek) *
        100;

  // 2. Thực thu của dịch vụ lẻ (giả lập: tổng value2 của type 'KH trải nghiệm')
  const retailThisWeek = data
    .filter(
      (d) => d.type === "KH trải nghiệm" && isInWeek(d, weekStart, weekEnd)
    )
    .reduce((sum, d) => sum + d.value2, 0);
  const retailLastWeek = data
    .filter(
      (d) =>
        d.type === "KH trải nghiệm" && isInWeek(d, prevWeekStart, prevWeekEnd)
    )
    .reduce((sum, d) => sum + d.value2, 0);
  const percentRetail =
    retailLastWeek === 0
      ? null
      : ((retailThisWeek - retailLastWeek) / retailLastWeek) * 100;

  // 3. Thực thu mua sản phẩm (giả lập: tổng value2 của type 'Khách hàng Thành viên')
  const productThisWeek = data
    .filter(
      (d) =>
        d.type === "Khách hàng Thành viên" && isInWeek(d, weekStart, weekEnd)
    )
    .reduce((sum, d) => sum + d.value2, 0);
  const productLastWeek = data
    .filter(
      (d) =>
        d.type === "Khách hàng Thành viên" &&
        isInWeek(d, prevWeekStart, prevWeekEnd)
    )
    .reduce((sum, d) => sum + d.value2, 0);
  const percentProduct =
    productLastWeek === 0
      ? null
      : ((productThisWeek - productLastWeek) / productLastWeek) * 100;

  // 4. Thực thu của mua thẻ (giả lập: tổng value của type 'Khách hàng Thành viên')
  const cardOrdersThisWeek = data.filter(
    (d) => d.type === "Khách hàng Thành viên" && isInWeek(d, weekStart, weekEnd)
  ).length;
  const cardOrdersLastWeek = data.filter(
    (d) =>
      d.type === "Khách hàng Thành viên" &&
      isInWeek(d, prevWeekStart, prevWeekEnd)
  ).length;
  const deltaCardOrders = cardOrdersThisWeek - cardOrdersLastWeek;
  const cardThisWeek = data
    .filter(
      (d) =>
        d.type === "Khách hàng Thành viên" && isInWeek(d, weekStart, weekEnd)
    )
    .reduce((sum, d) => sum + d.value, 0);
  const cardLastWeek = data
    .filter(
      (d) =>
        d.type === "Khách hàng Thành viên" &&
        isInWeek(d, prevWeekStart, prevWeekEnd)
    )
    .reduce((sum, d) => sum + d.value, 0);
  const percentCard =
    cardLastWeek === 0
      ? null
      : ((cardThisWeek - cardLastWeek) / cardLastWeek) * 100;

  // Move these lines up
  const totalOrdersThisWeek = data.filter((d) =>
    isInWeek(d, weekStart, weekEnd)
  ).length;
  const totalOrdersLastWeek = data.filter((d) =>
    isInWeek(d, prevWeekStart, prevWeekEnd)
  ).length;
  const deltaOrders = totalOrdersThisWeek - totalOrdersLastWeek;

  // 5. Tổng trả bằng thẻ Foxie (45% tổng revenue)
  const foxieOrdersThisWeek = Math.round(totalOrdersThisWeek * 0.45);
  const foxieOrdersLastWeek = Math.round(totalOrdersLastWeek * 0.45);
  const deltaFoxieOrders = foxieOrdersThisWeek - foxieOrdersLastWeek;
  const foxieThisWeek = Math.round(totalRevenueThisWeek * 0.45);
  const foxieLastWeek = Math.round(totalRevenueLastWeek * 0.45);
  const percentFoxie =
    foxieLastWeek === 0
      ? null
      : ((foxieThisWeek - foxieLastWeek) / foxieLastWeek) * 100;

  // 6. Trung bình thực thu mỗi ngày
  function daysBetween(start: CalendarDate, end: CalendarDate) {
    // Trả về số ngày giữa 2 CalendarDate (bao gồm cả ngày đầu và cuối)
    let count = 1;
    let d = start;
    while (d.compare(end) < 0) {
      d = d.add({ days: 1 });
      count++;
    }
    return count;
  }
  const daysThisWeek = daysBetween(weekStart, weekEnd);
  const avgRevenueThisWeek = Math.round(totalRevenueThisWeek / daysThisWeek);
  const avgRevenueLastWeek = Math.round(totalRevenueLastWeek / daysThisWeek);
  const percentAvg =
    avgRevenueLastWeek === 0
      ? null
      : ((avgRevenueThisWeek - avgRevenueLastWeek) / avgRevenueLastWeek) * 100;

  function StatCard({
    title,
    value,
    delta,
    className,
    valueColor,
  }: {
    title: string;
    value: number;
    delta: number | null;
    className?: string;
    valueColor?: string;
  }) {
    const isUp = delta !== null && delta > 0;
    const isDown = delta !== null && delta < 0;
    return (
      <div
        className={`bg-white rounded-xl shadow p-6 flex flex-col items-center min-w-[220px] border-4 ${
          className ?? "border-gray-200"
        }`}
      >
        <div className="text-sm text-gray-700 mb-1 text-center">{title}</div>
        <div
          className={`text-4xl font-bold mb-1 text-center ${
            valueColor ?? "text-black"
          }`}
        >
          {value.toLocaleString()}
        </div>
        <div
          className={`text-lg font-semibold flex items-center gap-1 ${
            isUp ? "text-green-600" : isDown ? "text-red-500" : "text-gray-500"
          }`}
        >
          {isUp && <span>↑</span>}
          {isDown && <span>↓</span>}
          {delta === null ? "N/A" : Math.abs(delta).toLocaleString()}
        </div>
      </div>
    );
  }

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
  >(data: T[], selectedRegions?: string[], selectedBranches?: string[]): T[] {
    return data.filter((item) => {
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
      return matchRegion && matchBranch;
    });
  }

  // Định nghĩa lại weekSalesData và prevWeekSalesData
  const weekSalesData = filterData(
    TotalSaleOfStores,
    selectedRegions,
    selectedBranches
  );
  const prevWeekSalesData = filterData(
    TotalSaleOfStores,
    selectedRegions,
    selectedBranches
  );

  // Tổng số khách mới trong hệ thống (ví dụ: tổng value của ngày endDate)
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

  // Dữ liệu mẫu cho bảng thời gian đơn hàng được tạo
  // Tính tổng cộng cuối bảng

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

  const filteredLocationOptions = React.useMemo(
    () =>
      locationOptions.filter((l) =>
        l.toLowerCase().includes(locationSearch.toLowerCase())
      ),
    [locationOptions, locationSearch]
  );

  const regionOptions = regionStats.map((r) => ({
    name: r.region,
    total: Object.values(locationRegionMap).filter((reg) => reg === r.region)
      .length,
  }));
  const filteredRegionOptions = React.useMemo(
    () =>
      regionOptions.filter((r) =>
        r.name.toLowerCase().includes(regionSearch.toLowerCase())
      ),
    [regionOptions, regionSearch]
  );

  // Tính top 10 location (chi nhánh/cửa hàng) theo thực thu tuần này
  const locationRevenueMap: Record<string, number> = {};
  locationOptions.forEach((loc) => {
    locationRevenueMap[loc] = data
      .filter((d) => d.branch === loc && isInWeek(d, weekStart, weekEnd))
      .reduce((sum, d) => sum + d.value, 0);
  });
  // Sắp xếp và tách top 10 + Khác
  const sortedLocations = Object.entries(locationRevenueMap).sort(
    (a, b) => b[1] - a[1]
  );
  const top10 = sortedLocations.slice(0, 10);
  const other = sortedLocations.slice(10);
  const otherTotal = other.reduce((sum, [, revenue]) => sum + revenue, 0);
  const top10LocationChartData = [
    ...top10.map(([name, revenue], idx) => ({
      name,
      revenue: Number(revenue),
      foxie: Math.round(Number(revenue) * 0.45),
      rank: idx + 1,
    })),
    ...(otherTotal > 0
      ? [
          {
            name: "Khác",
            revenue: otherTotal,
            foxie: Math.round(otherTotal * 0.45),
            rank: null,
          },
        ]
      : []),
  ];

  // Hàm custom label cho BarChart
  function renderBarLabel({
    value,
    fill,
  }: {
    value?: string | number;
    fill?: string;
  }) {
    const val = typeof value === "number" ? value : Number(value);
    if (isNaN(val)) return null;
    return (
      <tspan fontWeight={700} fill={fill} dx={8}>
        {formatMoneyShort(val)}
      </tspan>
    );
  }

  const pieRegionRevenueData = regionStats.map((r) => ({
    name: r.region,
    value: r.revenueThisWeek,
  }));
  const dailyRegionRevenueDataWithTotal = filterData(
    TotalRegionalSales,
    selectedRegions,
    selectedBranches
  ).map((item) => ({
    ...item,
    total:
      (item.HCM || 0) +
      (item.HaNoi || 0) +
      (item.DaNang || 0) +
      (item.NhaTrang || 0) +
      (item.DaDongCua || 0),
  }));
  const dailyCustomerRevenue = filterData(
    kindOfCustomer,
    selectedRegions,
    selectedBranches
  );

  const storeTableData = locationOptions.map((loc) => {
    // Lọc data tuần này và tuần trước cho từng cửa hàng
    const thisWeek = data.filter(
      (d) => d.branch === loc && isInWeek(d, weekStart, weekEnd)
    );
    const lastWeek = data.filter(
      (d) => d.branch === loc && isInWeek(d, prevWeekStart, prevWeekEnd)
    );
    // Tổng thực thu
    const revenue = thisWeek.reduce((sum, d) => sum + d.value, 0);
    const revenueLast = lastWeek.reduce((sum, d) => sum + d.value, 0);
    // % thay đổi thực thu
    const revenueDelta =
      revenueLast === 0 ? null : ((revenue - revenueLast) / revenueLast) * 100;
    // Tổng trả Foxie
    const foxie = Math.round(revenue * 0.45);
    const foxieLast = Math.round(revenueLast * 0.45);
    const foxieDelta =
      foxieLast === 0 ? null : ((foxie - foxieLast) / foxieLast) * 100;
    // Số đơn hàng
    const orders = thisWeek.length;
    const ordersLast = lastWeek.length;
    const ordersDelta =
      ordersLast === 0 ? null : ((orders - ordersLast) / ordersLast) * 100;
    return {
      location: loc,
      revenue,
      revenueDelta,
      foxie,
      foxieDelta,
      orders,
      ordersDelta,
    };
  });

  // Tính số lượng đơn hàng theo ngày (loại bỏ đơn mua thẻ)
  const ordersByDay: Record<string, { count: number; avgPerShop: number }> = {};
  data.forEach((d) => {
    if (d.type !== "Khách hàng Thành viên") {
      if (!ordersByDay[d.date]) {
        ordersByDay[d.date] = { count: 0, avgPerShop: 0 };
      }
      ordersByDay[d.date].count++;
    }
  });
  // Tính trung bình số lượng đơn tại mỗi shop cho từng ngày
  Object.keys(ordersByDay).forEach((date) => {
    // Đếm số shop có đơn trong ngày đó
    const shops = new Set(
      data
        .filter((d) => d.date === date && d.type !== "Khách hàng Thành viên")
        .map((d) => d.branch)
    );
    ordersByDay[date].avgPerShop =
      shops.size > 0 ? Math.round(ordersByDay[date].count / shops.size) : 0;
  });
  const ordersByDayArr = Object.entries(ordersByDay).sort((a, b) => {
    // Sort theo ngày tăng dần
    const [d1, m1] = a[0].split(" thg ");
    const [d2, m2] = b[0].split(" thg ");
    return Number(m1) !== Number(m2)
      ? Number(m1) - Number(m2)
      : Number(d1) - Number(d2);
  });

  // Chuẩn bị data cho chart
  const ordersChartData = ordersByDayArr.map(([date, val]) => ({
    date,
    orders: val.count,
    avgPerShop: val.avgPerShop,
  }));

  // Giả lập số đơn hàng mỗi ngày (ví dụ 31 ngày)
  const fakeOrderCounts = [
    240, 173, 201, 281, 269, 167, 166, 131, 228, 247, 380, 403, 217, 193, 210,
    236, 244, 367, 411, 271, 256, 288, 291, 358, 398, 309, 191, 49, 17, 31, 67,
  ];

  // Gán lại vào ordersByDayArr
  ordersByDayArr.forEach(([, val], idx) => {
    val.count = fakeOrderCounts[idx % fakeOrderCounts.length];
    // Tạo trung bình shop ngẫu nhiên (5-15)
    val.avgPerShop = 5 + Math.floor(Math.random() * 11);
  });

  const storeOrderStats = locationOptions.map((loc) => {
    const orders = data.filter(
      (d) => d.branch === loc && isInWeek(d, weekStart, weekEnd)
    );
    return {
      name: loc,
      totalOrders: orders.length,
      retailOrders: orders.filter((d) => d.type === "KH trải nghiệm").length,
      cardOrders: orders.filter((d) => d.type === "Khách hàng Thành viên")
        .length,
      foxieOrders: Math.round(orders.length * 0.45), // hoặc tuỳ logic
    };
  });
  const top10OrderStores = storeOrderStats
    .sort((a, b) => b.totalOrders - a.totalOrders)
    .slice(0, 10);

  const otherOrderStores = storeOrderStats.slice(10);
  const otherOrderTotal = {
    name: "Khác",
    totalOrders: otherOrderStores.reduce((sum, s) => sum + s.totalOrders, 0),
    retailOrders: otherOrderStores.reduce((sum, s) => sum + s.retailOrders, 0),
    cardOrders: otherOrderStores.reduce((sum, s) => sum + s.cardOrders, 0),
    foxieOrders: otherOrderStores.reduce((sum, s) => sum + s.foxieOrders, 0),
  };
  const chartOrderData = [...top10OrderStores, otherOrderTotal];

  // Tính dữ liệu bảng số đơn tại các cửa hàng (top 10 + tổng cộng)
  const storeOrderTableData = locationOptions.map((loc) => {
    const thisWeek = data.filter(
      (d) => d.branch === loc && isInWeek(d, weekStart, weekEnd)
    );
    const lastWeek = data.filter(
      (d) => d.branch === loc && isInWeek(d, prevWeekStart, prevWeekEnd)
    );
    const totalOrders = thisWeek.length;
    const totalOrdersLast = lastWeek.length;
    const totalOrdersDelta =
      totalOrdersLast === 0 ? null : totalOrders - totalOrdersLast;
    const cardOrders = thisWeek.filter(
      (d) => d.type === "Khách hàng Thành viên"
    ).length;
    const cardOrdersLast = lastWeek.filter(
      (d) => d.type === "Khách hàng Thành viên"
    ).length;
    const cardOrdersDelta =
      cardOrdersLast === 0 ? null : cardOrders - cardOrdersLast;
    const retailOrders = thisWeek.filter(
      (d) => d.type === "KH trải nghiệm"
    ).length;
    const retailOrdersLast = lastWeek.filter(
      (d) => d.type === "KH trải nghiệm"
    ).length;
    const retailOrdersDelta =
      retailOrdersLast === 0 ? null : retailOrders - retailOrdersLast;
    const foxieOrders = Math.round(totalOrders * 0.45);
    const foxieOrdersLast = Math.round(totalOrdersLast * 0.45);
    const foxieOrdersDelta =
      foxieOrdersLast === 0 ? null : foxieOrders - foxieOrdersLast;
    return {
      location: loc,
      totalOrders,
      totalOrdersDelta,
      cardOrders,
      cardOrdersDelta,
      retailOrders,
      retailOrdersDelta,
      foxieOrders,
      foxieOrdersDelta,
    };
  });
  
  const totalOrderSumAll = storeOrderTableData.reduce(
    (acc, row) => {
      acc.totalOrders += row.totalOrders;
      acc.totalOrdersDelta += row.totalOrdersDelta ?? 0;
      acc.cardOrders += row.cardOrders;
      acc.cardOrdersDelta += row.cardOrdersDelta ?? 0;
      acc.retailOrders += row.retailOrders;
      acc.retailOrdersDelta += row.retailOrdersDelta ?? 0;
      acc.foxieOrders += row.foxieOrders;
      acc.foxieOrdersDelta += row.foxieOrdersDelta ?? 0;
      return acc;
    },
    {
      totalOrders: 0,
      totalOrdersDelta: 0,
      cardOrders: 0,
      cardOrdersDelta: 0,
      retailOrders: 0,
      retailOrdersDelta: 0,
      foxieOrders: 0,
      foxieOrdersDelta: 0,
    }
  );

  // Tính tổng cộng cho bảng thực thu cửa hàng (30 locations)
  const totalRevenueAll = storeTableData.reduce((sum, s) => sum + s.revenue, 0);
  const totalFoxieAll = storeTableData.reduce((sum, s) => sum + s.foxie, 0);
  const totalOrdersAll = storeTableData.reduce((sum, s) => sum + s.orders, 0);
  const totalRevenueDeltaAll = storeTableData.reduce(
    (sum, s) => sum + (s.revenueDelta ?? 0),
    0
  );
  const totalFoxieDeltaAll = storeTableData.reduce(
    (sum, s) => sum + (s.foxieDelta ?? 0),
    0
  );
  const totalOrdersDeltaAll = storeTableData.reduce(
    (sum, s) => sum + (s.ordersDelta ?? 0),
    0
  );

  const retailOrdersThisWeek = data.filter(
    (d) => d.type === "KH trải nghiệm" && isInWeek(d, weekStart, weekEnd)
  ).length;
  const retailOrdersLastWeek = data.filter(
    (d) =>
      d.type === "KH trải nghiệm" && isInWeek(d, prevWeekStart, prevWeekEnd)
  ).length;
  const deltaRetailOrders = retailOrdersThisWeek - retailOrdersLastWeek;

  const productOrdersThisWeek = data.filter(
    (d) => d.type === "Mua sản phẩm" && isInWeek(d, weekStart, weekEnd)
  ).length;
  const productOrdersLastWeek = data.filter(
    (d) => d.type === "Mua sản phẩm" && isInWeek(d, prevWeekStart, prevWeekEnd)
  ).length;
  const deltaProductOrders = productOrdersThisWeek - productOrdersLastWeek;

  // --- Chuẩn bị data cho PieChart tỉ lệ mua thẻ/dịch vụ lẻ/trả bằng thẻ ---
  const totalMembership = data.filter(
    (d) => d.type === "Khách hàng Thành viên"
  ).length;
  const totalNormal = data.filter((d) => d.type === "KH trải nghiệm").length;
  const totalFoxiePie = Math.round(
    (totalMembership + totalNormal + productOrdersThisWeek) * 0.218
  ); // Giả lập 21.8% như ảnh
  const totalProduct = data.filter((d) => d.type === "Mua sản phẩm").length;
  const totalAllPie =
    totalMembership + totalNormal + totalFoxiePie + totalProduct;
  const piePaymentData = [
    { name: "Membership Payment", value: totalMembership, color: "#c2b6c6" },
    { name: "Normal Payment", value: totalNormal, color: "#f8e48b" },
    { name: "Foxie Card Purchase", value: totalFoxiePie, color: "#c86b82" },
    { name: "Products Purchase", value: totalProduct, color: "#0a4a8f" },
  ];

  const paymentRegionData = REGIONS.map(region => {
    const regionData = data.filter(d => d.region === region);
    return {
      region,
      bank: regionData.filter(d => d.type === "Khách hàng Thành viên").length,
      cash: regionData.filter(d => d.type === "KH trải nghiệm").length,
      card: regionData.filter(d => d.type === "Mua sản phẩm").length,
    };
  });

  

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="p-2 ">
          <div className=" gap-2">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Order Report
            </h1>
            <div className="flex gap-2">
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
                className={`flex items-center gap-1 text-2xl font-semibold ${
                  weekSalesChange === null
                    ? "text-gray-500"
                    : weekSalesChange > 0
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
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
                className={`flex items-center gap-1 text-2xl font-semibold ${
                  weekRevenueChange === null
                    ? "text-gray-500"
                    : weekRevenueChange > 0
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {weekRevenueChange === null
                  ? "N/A"
                  : `${Math.abs(weekRevenueChange)}%`}
              </div>
            </div>
          </div>

          {/* Thực thu tại các khu vực trong tuần */}
          <div className="flex w-full bg-white rounded-xl shadow-lg gap-4 mt-5 h-[550px] items-center">
            <div className="overflow-x-auto  justify-center items-center rounded-xl ml-2">
              <div className="text-xl font-medium text-gray-700 text-center p-2">
                Thực thu tại các khu vực trong tuần
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

            <div className=" flex flex-col justify-center items-center">
              <div className="flex justify-center items-center ">
                <ResponsiveContainer width={600} height={400}>
                  <PieChart className="mt-10 mb-10">
                    <Pie
                      data={pieRegionRevenueData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      label={({ percent }) =>
                        percent !== undefined
                          ? `${(percent * 100).toFixed(0)}%`
                          : ""
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

          <div className="flex h-fit bg-white mt-5 rounded-xl shadow-lg gap-2 items-center justify-center pr-2 pl-2l-2">
            {/* Top 10 cửa hàng trong tuần theo thực thu */}

            <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-4">
              <div className="text-xl font-medium text-gray-700 text-center mb-4">
                Top 10 cửa hàng trong tuần theo thực thu
              </div>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart
                  layout="vertical"
                  data={top10LocationChartData}
                  margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
                  barCategoryGap={30}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={formatMoneyShort}
                    domain={[0, "dataMax"]}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={220}
                    tick={{ fontWeight: 400, fontSize: 14 }}
                  />
                  <Tooltip formatter={formatMoneyShort} />
                  <Legend
                    verticalAlign="top"
                    align="left"
                    iconType="rect"
                    formatter={(value) => <span>{value}</span>}
                  />
                  <Bar
                    dataKey="revenue"
                    name="Thực thu"
                    fill="#8d6e63"
                    radius={[0, 8, 8, 0]}
                    label={{
                      position: "right",
                      content: (props) =>
                        renderBarLabel({ ...props, fill: "#8d6e63" }),
                    }}
                  />
                  <Bar
                    dataKey="foxie"
                    name="Trả bằng thẻ Foxie"
                    fill="#b6d47a"
                    radius={[0, 8, 8, 0]}
                    label={{
                      position: "right",
                      content: (props) =>
                        renderBarLabel({ ...props, fill: "#b6d47a" }),
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 6 bảng tổng số liệu */}
            <div className="flex flex-col gap-2 w-full max-w-xs mx-auto mb-6">
              <StatCard
                title="Thực thu"
                value={totalRevenueThisWeek}
                delta={percentRevenue}
                valueColor="text-[#a9b8c3]"
              />
              <StatCard
                title="Thực thu của dịch vụ lẻ"
                value={retailThisWeek}
                delta={percentRetail}
                valueColor="text-[#fcb900]"
              />
              <StatCard
                title="Thực thu mua sản phẩm"
                value={productThisWeek}
                delta={percentProduct}
                valueColor="text-[#b6d47a]"
              />
              <StatCard
                title="Thực thu của mua thẻ"
                value={cardThisWeek}
                delta={percentCard}
                valueColor="text-[#8ed1fc]"
              />
              <StatCard
                title="Tổng trả bằng thẻ Foxie"
                value={foxieThisWeek}
                delta={percentFoxie}
                valueColor="text-[#a9b8c3]"
              />
              <StatCard
                title="Trung bình thực thu mỗi ngày"
                value={avgRevenueThisWeek}
                delta={percentAvg}
                valueColor="text-[#b39ddb]"
              />
            </div>
          </div>

          {/* Thực thu cửa hàng */}
          <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-4">
            <div className="text-xl font-medium text-gray-700 text-center mb-4">
              Thực thu cửa hàng
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200 max-h-[520px] overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-10 bg-yellow-200">
                  <tr className="bg-yellow-200 font-bold text-gray-900">
                    <th className="px-3 py-3 text-left rounded-tl-xl">STT</th>
                    <th className="px-3 py-3 text-left">Locations</th>
                    <th className="px-3 py-3 text-right ">Thực thu</th>
                    <th className="px-3 py-3 text-right">% Δ</th>
                    <th className="px-3 py-3 text-right ">
                      Tổng trả thẻ Foxie
                    </th>
                    <th className="px-3 py-3 text-right">% Δ</th>
                    <th className="px-3 py-3 text-right ">Số đơn hàng</th>
                    <th className="px-3 py-3 text-right rounded-tr-xl">% Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {storeTableData.map((row, idx) => (
                    <tr key={row.location}>
                      <td className="px-3 py-2 text-left">{idx + 1}</td>
                      <td className="px-3 py-2 text-left">{row.location}</td>
                      <td className="px-3 py-2 text-right bg-[#f8a0ca] font-bold">
                        {row.revenue.toLocaleString()}
                      </td>
                      <td
                        className={`px-3 py-2 text-right ${
                          row.revenueDelta !== null
                            ? row.revenueDelta > 0
                              ? "text-green-600"
                              : row.revenueDelta < 0
                              ? "text-red-500"
                              : ""
                            : ""
                        }`}
                      >
                        {row.revenueDelta === null
                          ? "N/A"
                          : `${row.revenueDelta.toFixed(1)}%`}
                      </td>
                      <td className="px-3 py-2 text-right bg-[#8ed1fc]">
                        {row.foxie.toLocaleString()}
                      </td>
                      <td
                        className={`px-3 py-2 text-right ${
                          row.foxieDelta !== null
                            ? row.foxieDelta > 0
                              ? "text-green-600"
                              : row.foxieDelta < 0
                              ? "text-red-500"
                              : ""
                            : ""
                        }`}
                      >
                        {row.foxieDelta === null
                          ? "N/A"
                          : `${row.foxieDelta.toFixed(1)}%`}
                      </td>
                      <td className="px-3 py-2 text-right bg-[#a9b8c3]">
                        {row.orders}
                      </td>
                      <td
                        className={`px-3 py-2 text-right ${
                          row.ordersDelta !== null
                            ? row.ordersDelta > 0
                              ? "text-green-600"
                              : row.ordersDelta < 0
                              ? "text-red-500"
                              : ""
                            : ""
                        }`}
                      >
                        {row.ordersDelta === null
                          ? "N/A"
                          : `${row.ordersDelta.toFixed(1)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="sticky bottom-0 bg-gray-100 z-20">
                  <tr className="font-bold">
                    <td
                      colSpan={2}
                      className="px-3 py-2 text-left rounded-bl-xl"
                    >
                      Tổng cộng
                    </td>
                    <td className="px-3 py-2 text-right bg-[#f8a0ca]">
                      {totalRevenueAll.toLocaleString()}
                    </td>
                    <td
                      className={`px-3 py-2 text-right ${
                        totalRevenueDeltaAll > 0
                          ? "text-green-600"
                          : totalRevenueDeltaAll < 0
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {totalRevenueDeltaAll > 0 ? "+" : ""}
                      {totalRevenueDeltaAll.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-right bg-[#8ed1fc]">
                      {totalFoxieAll.toLocaleString()}
                    </td>
                    <td
                      className={`px-3 py-2 text-right ${
                        totalFoxieDeltaAll > 0
                          ? "text-green-600"
                          : totalFoxieDeltaAll < 0
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {totalFoxieDeltaAll > 0 ? "+" : ""}
                      {totalFoxieDeltaAll.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-right bg-[#a9b8c3]">
                      {totalOrdersAll.toLocaleString()}
                    </td>
                    <td
                      className={`px-3 py-2 text-right ${
                        totalOrdersDeltaAll > 0
                          ? "text-green-600"
                          : totalOrdersDeltaAll < 0
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {totalOrdersDeltaAll > 0 ? "+" : ""}
                      {totalOrdersDeltaAll.toFixed(1)}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Số lượng đơn hàng theo ngày (- đơn mua thẻ) dạng chart */}
          <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-4">
            <div className="text-xl font-medium text-gray-700 text-center mb-4">
              Số lượng đơn hàng theo ngày (-đơn mua thẻ)
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={ordersChartData}
                margin={{ top: 30, right: 40, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis yAxisId="left" orientation="left" tickCount={6} />
                <YAxis yAxisId="right" orientation="right" tickCount={6} />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="orders"
                  name="Số đơn hàng"
                  fill="#f87171"
                  barSize={30}
                >
                  <LabelList dataKey="orders" position="top" />
                </Bar>
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgPerShop"
                  name="Trung bình số lượng đơn tại mỗi shop"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#2563eb" }}
                  activeDot={{ r: 7 }}
                  label={{ position: "top", fill: "#2563eb", fontWeight: 600 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top 10 cửa hàng theo đơn hàng */}
          <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-4">
            <div className="text-xl font-medium text-gray-700 text-center mb-4">
              Top 10 cửa hàng theo đơn hàng
            </div>
            <ResponsiveContainer width="100%" height={600}>
              <BarChart
                layout="vertical"
                data={chartOrderData}
                margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
                barCategoryGap={10}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontWeight: 400, fontSize: 14 }}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="totalOrders"
                  name="Số đơn hàng"
                  fill="#bc8b6f"
                  barSize={5}
                />
                <Bar
                  dataKey="retailOrders"
                  name="Đơn dịch vụ lẻ/sản phẩm"
                  fill="#f16a3f"
                  barSize={5}
                />
                <Bar
                  dataKey="cardOrders"
                  name="Đơn mua thẻ"
                  fill="#b6d47a"
                  barSize={5}
                />
                <Bar
                  dataKey="foxieOrders"
                  name="Đơn trả bằng thẻ Foxie"
                  fill="#81d4fa"
                  barSize={5}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Số đơn tại các cửa hàng */}
          <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-4">
            <div className="text-xl font-medium text-gray-700 text-center mb-4">
              Số đơn tại các cửa hàng
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200 max-h-[520px] overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-10 bg-yellow-200">
                  <tr className="bg-yellow-200 font-bold text-gray-900">
                    <th className="px-3 py-3 text-left rounded-tl-xl">STT</th>
                    <th className="px-3 py-3 text-left">Locations</th>
                    <th className="px-3 py-3 text-right ">Số đơn hàng</th>
                    <th className="px-3 py-3 text-right">Δ</th>
                    <th className="px-3 py-3 text-right ">Đơn mua thẻ</th>
                    <th className="px-3 py-3 text-right">Δ</th>
                    <th className="px-3 py-3 text-right ">Đơn dịch vụ lẻ</th>
                    <th className="px-3 py-3 text-right">Δ</th>
                    <th className="px-3 py-3 text-right ">
                      Đơn trả bằng thẻ Foxie
                    </th>
                    <th className="px-3 py-3 text-right rounded-tr-xl">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {storeOrderTableData.map((row, idx) => (
                    <tr key={row.location}>
                      <td className="px-3 py-2 text-left">{idx + 1}</td>
                      <td className="px-3 py-2 text-left">{row.location}</td>
                      <td className="px-3 py-2 text-right bg-[#f8a0ca] font-bold">
                        {row.totalOrders}
                      </td>
                      <td
                        className={`px-3 py-2 text-right ${
                          row.totalOrdersDelta !== null
                            ? row.totalOrdersDelta > 0
                              ? "text-green-600"
                              : row.totalOrdersDelta < 0
                              ? "text-red-500"
                              : ""
                            : ""
                        }`}
                      >
                        {row.totalOrdersDelta === null
                          ? "N/A"
                          : `${row.totalOrdersDelta > 0 ? "+" : ""}${
                              row.totalOrdersDelta
                            }`}
                      </td>
                      <td className="px-3 py-2 text-right bg-[#8ed1fc]">
                        {row.cardOrders}
                      </td>
                      <td
                        className={`px-3 py-2 text-right ${
                          row.cardOrdersDelta !== null
                            ? row.cardOrdersDelta > 0
                              ? "text-green-600"
                              : row.cardOrdersDelta < 0
                              ? "text-red-500"
                              : ""
                            : ""
                        }`}
                      >
                        {row.cardOrdersDelta === null
                          ? "N/A"
                          : `${row.cardOrdersDelta > 0 ? "+" : ""}${
                              row.cardOrdersDelta
                            }`}
                      </td>
                      <td className="px-3 py-2 text-right bg-[#fcb900]">
                        {row.retailOrders}
                      </td>
                      <td
                        className={`px-3 py-2 text-right ${
                          row.retailOrdersDelta !== null
                            ? row.retailOrdersDelta > 0
                              ? "text-green-600"
                              : row.retailOrdersDelta < 0
                              ? "text-red-500"
                              : ""
                            : ""
                        }`}
                      >
                        {row.retailOrdersDelta === null
                          ? "N/A"
                          : `${row.retailOrdersDelta > 0 ? "+" : ""}${
                              row.retailOrdersDelta
                            }`}
                      </td>
                      <td className="px-3 py-2 text-right bg-[#a9b8c3]">
                        {row.foxieOrders}
                      </td>
                      <td
                        className={`px-3 py-2 text-right ${
                          row.foxieOrdersDelta !== null
                            ? row.foxieOrdersDelta > 0
                              ? "text-green-600"
                              : row.foxieOrdersDelta < 0
                              ? "text-red-500"
                              : ""
                            : ""
                        }`}
                      >
                        {row.foxieOrdersDelta === null
                          ? "N/A"
                          : `${row.foxieOrdersDelta > 0 ? "+" : ""}${
                              row.foxieOrdersDelta
                            }`}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="sticky bottom-0 bg-gray-100 z-20">
                  <tr className="font-bold">
                    <td
                      colSpan={2}
                      className="px-3 py-2 text-left rounded-bl-xl"
                    >
                      Tổng cộng
                    </td>
                    <td className="px-3 py-2 text-right bg-[#f8a0ca]">
                      {totalOrderSumAll.totalOrders}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {totalOrderSumAll.totalOrdersDelta}
                    </td>
                    <td className="px-3 py-2 text-right bg-[#8ed1fc]">
                      {totalOrderSumAll.cardOrders}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {totalOrderSumAll.cardOrdersDelta}
                    </td>
                    <td className="px-3 py-2 text-right bg-[#fcb900]">
                      {totalOrderSumAll.retailOrders}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {totalOrderSumAll.retailOrdersDelta}
                    </td>
                    <td className="px-3 py-2 text-right bg-[#a9b8c3]">
                      {totalOrderSumAll.foxieOrders}
                    </td>
                    <td className="px-3 py-2 text-right rounded-br-xl">
                      {totalOrderSumAll.foxieOrdersDelta}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 5 bảng tổng số liệu */}

          <div className="flex justify-between gap-2  mt-5 w-full">
            <StatCard
              title="Tổng đơn hàng"
              value={totalOrdersThisWeek}
              delta={deltaOrders}
              className="border-[#f8a0ca] border w-1/5 text-sm"
              valueColor="text-[#f8a0ca]"
            />
            <StatCard
              title="Đơn mua thẻ"
              value={cardOrdersThisWeek}
              delta={deltaCardOrders}
              className="border-[#8ed1fc] border w-1/5 text-sm"
              valueColor="text-[#8ed1fc]"
            />
            <StatCard
              title="Đơn dịch vụ/sản phẩm"
              value={retailOrdersThisWeek}
              delta={deltaRetailOrders}
              className="border-[#fcb900] border w-1/5 text-sm"
              valueColor="text-[#fcb900]"
            />
            <StatCard
              title="Đơn trả bằng thẻ Foxie"
              value={foxieOrdersThisWeek}
              delta={deltaFoxieOrders}
              className="border-[#a9b8c3] border w-1/5 text-sm"
              valueColor="text-[#a9b8c3]"
            />
            <StatCard
              title="Đơn mua sản phẩm"
              value={productOrdersThisWeek}
              delta={deltaProductOrders}
              className="border-[#b6d47a] border w-1/5 text-sm"
              valueColor="text-[#b6d47a]"
            />
          </div>
          {/* PieChart tỉ lệ mua thẻ/dịch vụ lẻ/trả bằng thẻ */}
          <div className="w-full flex justify-center mt-8">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-8 max-w-3xl w-full">
              <div className="flex-1 flex justify-center">
                <ResponsiveContainer width={400} height={320}>
                  <PieChart>
                    <Pie
                      data={piePaymentData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ percent }) =>
                        percent !== undefined ? `${(percent * 100).toFixed(1)}%` : ""
                      }
                    >
                      {piePaymentData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        `${value} (${((Number(value) / totalAllPie) * 100).toFixed(1)}%)`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 flex flex-col items-center md:items-start">
                <div className="text-xl font-semibold text-gray-700 mb-4 text-center md:text-left">
                  Tỉ lệ mua thẻ/dịch vụ lẻ/trả bằng thẻ
                </div>
                <ul className="space-y-2">
                  {piePaymentData.map((item) => (
                    <li key={item.name} className="flex items-center gap-3">
                      <span
                        className="inline-block w-5 h-5 rounded-full"
                        style={{ background: item.color }}
                      ></span>
                      <span className="font-medium text-gray-800">{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="w-full bg-white rounded-xl shadow-lg mt-8 p-6">
            <div className="text-2xl font-semibold text-gray-800 mb-4">Hình thức thanh toán theo vùng</div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={paymentRegionData} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis tickFormatter={v => (v >= 1000 ? `${v / 1000} N` : v)} />
                <Tooltip />
                <Legend />
                <Bar dataKey="bank" name="Bank Transfer" fill="#795548" barSize={40} />
                <Bar dataKey="cash" name="Cash" fill="#c5e1a5" barSize={40} />
                <Bar dataKey="card" name="Credit/Debit card" fill="#ff7f7f" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        
        
        </div>
      </div>
    </div>
  );
}
