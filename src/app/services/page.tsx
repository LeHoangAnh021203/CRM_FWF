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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DataPoint {
  date: string;
  value: number;
  value2: number;
  type: string;
  status: string;
  gender: "Nam" | "Nữ" | "#N/A";
  region?: string;
  branch?: string;
  serviceName?: string;
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

const ALL_SERVICE_TYPES = [
  { key: "Khách hàng Thành viên", label: "Combo" },
  { key: "KH trải nghiệm", label: "Dịch vụ" },
  { key: "Added on", label: "Added on" },
  { key: "Quà tặng", label: "Gifts" },
  { key: "Fox card", label: "Fox card" },
];
const ALL_GENDERS = ["Nam", "Nữ", "#N/A"];

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

  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [genderSearch, setGenderSearch] = useState("");
  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const genderDropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        serviceDropdownRef.current &&
        !serviceDropdownRef.current.contains(e.target as Node)
      ) {
        setShowServiceDropdown(false);
      }
      if (
        genderDropdownRef.current &&
        !genderDropdownRef.current.contains(e.target as Node)
      ) {
        setShowGenderDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filter options theo search
  const filteredServiceTypes = ALL_SERVICE_TYPES.filter((s) =>
    s.label.toLowerCase().includes(serviceSearch.toLowerCase())
  );
  const filteredGenders = ALL_GENDERS.filter((g) =>
    g.toLowerCase().includes(genderSearch.toLowerCase())
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
  
  const weekDates = [];
  let d = weekStart;
  while (d.compare(weekEnd) <= 0) {
    weekDates.push(d);
    d = d.add({ days: 1 });
  }

  const weeklyServiceChartData = weekDates.map((dateObj) => {
    const dateStr = `${dateObj.day} thg ${dateObj.month}`; // Sửa lại cho khớp data
    const combo = data.filter(
      (d) => d.type === "Khách hàng Thành viên" && d.date === dateStr
    ).length;
    const service = data.filter(
      (d) => d.type === "KH trải nghiệm" && d.date === dateStr
    ).length;
    const addedon = data.filter(
      (d) => d.type === "Added on" && d.date === dateStr
    ).length;
    const total = combo + service + addedon;
    const foxcard = Math.round(total * 0.218);
    return {
      date: dateStr,
      combo,
      service,
      addedon,
      foxcard,
    };
  });

  // Tổng Combo
  const comboThisWeek = data.filter(
    (d) => d.type === "Khách hàng Thành viên" && isInWeek(d, weekStart, weekEnd)
  ).length;
  const comboLastWeek = data.filter(
    (d) =>
      d.type === "Khách hàng Thành viên" &&
      isInWeek(d, prevWeekStart, prevWeekEnd)
  ).length;
  const deltaCombo = comboThisWeek - comboLastWeek;

  // Tổng dịch vụ lẻ
  const retailThisWeek = data.filter(
    (d) => d.type === "KH trải nghiệm" && isInWeek(d, weekStart, weekEnd)
  ).length;
  const retailLastWeek = data.filter(
    (d) =>
      d.type === "KH trải nghiệm" && isInWeek(d, prevWeekStart, prevWeekEnd)
  ).length;
  const deltaRetail = retailThisWeek - retailLastWeek;

  // Tổng dịch vụ CT và Quà tặng (không có trong data, để 0)
  const ctThisWeek = 0,
    deltaCT = 0;
  const giftThisWeek = 0,
    deltaGift = 0;

  // Tổng dịch vụ thực hiện
  const totalServiceThisWeek = comboThisWeek + retailThisWeek;
  const totalServiceLastWeek = comboLastWeek + retailLastWeek;
  const deltaTotalService = totalServiceThisWeek - totalServiceLastWeek;

  // Lấy danh sách các cửa hàng
  const storeNames = locationOptions;

  // Thêm state cho filter dịch vụ và giới tính
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([
    "Khách hàng Thành viên",
    "KH trải nghiệm",
    "Added on",
    "Quà tặng",
  ]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([
    "Nam",
    "Nữ",
    "#N/A",
  ]);

  // Bổ sung data mẫu cho các trường type và gender nếu chưa có
  // (Chỉ thêm vào cuối mảng data, không ảnh hưởng logic cũ)
  if (!data.some((d) => d.type === "Added on")) {
    data.push({
      date: `${weekStart.day} thg ${weekStart.month}`,
      value: 1000000,
      value2: 500000,
      type: "Added on",
      status: "New",
      gender: "Nam",
      region: "HCM",
      branch: "Crescent Mall Q7",
    });
  }
  if (!data.some((d) => d.type === "Quà tặng")) {
    data.push({
      date: `${weekStart.day} thg ${weekStart.month}`,
      value: 800000,
      value2: 300000,
      type: "Quà tặng",
      status: "New",
      gender: "#N/A",
      region: "HCM",
      branch: "Vincom Landmark 81",
    });
  }
  if (!data.some((d) => d.gender === "#N/A")) {
    data.push({
      date: `${weekStart.day} thg ${weekStart.month}`,
      value: 1200000,
      value2: 600000,
      type: "KH trải nghiệm",
      status: "New",
      gender: "#N/A",
      region: "HCM",
      branch: "Vista Verde",
    });
  }

  // Tính số lượng từng loại dịch vụ theo từng cửa hàng trong tuần, có filter
  const storeServiceChartData = storeNames
    .map((store) => {
      const storeData = data.filter(
        (d) =>
          d.branch === store &&
          isInWeek(d, weekStart, weekEnd) &&
          selectedServiceTypes.includes(d.type) &&
          selectedGenders.includes(d.gender)
      );
      const combo = storeData.filter(
        (d) => d.type === "Khách hàng Thành viên"
      ).length;
      const service = storeData.filter(
        (d) => d.type === "KH trải nghiệm"
      ).length;
      const addedon = storeData.filter((d) => d.type === "Added on").length;
      const gifts = storeData.filter((d) => d.type === "Quà tặng").length;
      // Fox card: giả lập 21.8% tổng số đơn của cửa hàng
      const total = combo + service + addedon + gifts;
      const foxcard = Math.round(total * 0.218);
      return {
        store,
        combo,
        service,
        addedon,
        gifts,
        foxcard,
        total, // để sort
      };
    })
    .sort((a, b) => b.total - a.total);

  // Tính tổng actual price cho từng giới tính trong tuần (theo filter dịch vụ nếu muốn)
  const genderActualPrice = ALL_GENDERS.map((gender) => {
    // Lọc theo tuần, theo filter dịch vụ nếu muốn
    const filtered = data.filter(
      (d) =>
        d.gender === gender &&
        isInWeek(d, weekStart, weekEnd) &&
        selectedServiceTypes.includes(d.type)
    );
    const total = filtered.reduce((sum, d) => sum + d.value, 0);
    return { gender, total };
  });

  // Pie chart data for tỉ lệ dịch vụ/combo/cộng thêm (có filter)
  const filteredPieData = data.filter(
    (d) =>
      isInWeek(d, weekStart, weekEnd) &&
      (selectedRegions.length === 0 ||
        !d.region ||
        selectedRegions.includes(d.region)) &&
      (selectedBranches.length === 0 ||
        !d.branch ||
        selectedBranches.includes(d.branch)) &&
      selectedServiceTypes.includes(d.type) &&
      selectedGenders.includes(d.gender)
  );
  const pieData = [
    {
      key: "combo",
      label: "Combo",
      value: filteredPieData.filter((d) => d.type === "Khách hàng Thành viên")
        .length,
      color: "#795548",
    },
    {
      key: "service",
      label: "Dịch vụ",
      value: filteredPieData.filter((d) => d.type === "KH trải nghiệm").length,
      color: "#c5e1a5",
    },
    {
      key: "addedon",
      label: "Added on",
      value: filteredPieData.filter((d) => d.type === "Added on").length,
      color: "#f16a3f",
    },
    {
      key: "gifts",
      label: "Gifts",
      value: filteredPieData.filter((d) => d.type === "Quà tặng").length,
      color: "#8fd1fc",
    },
  ];
  const totalPie = pieData.reduce((sum, d) => sum + d.value, 0);
  const foxCardValue = Math.round(totalPie * 0.218);
  const pieChartData = [
    ...pieData,
    {
      key: "foxcard",
      label: "Fox card",
      value: foxCardValue,
      color: "#b26e7a",
    },
  ];

  // PieChart top 10 dịch vụ theo số lượng (có filter)
  // Giả sử mỗi DataPoint có trường serviceName, nếu không có thì dùng type
  const filteredServiceData = data.filter(
    (d) =>
      isInWeek(d, weekStart, weekEnd) &&
      (selectedRegions.length === 0 ||
        !d.region ||
        selectedRegions.includes(d.region)) &&
      (selectedBranches.length === 0 ||
        !d.branch ||
        selectedBranches.includes(d.branch)) &&
      selectedServiceTypes.includes(d.type) &&
      selectedGenders.includes(d.gender)
  );
  // Lấy tên dịch vụ (ưu tiên d.serviceName, fallback d.type)
  const serviceCountMap = new Map();
  filteredServiceData.forEach((d) => {
    const name = d.serviceName || d.type;
    serviceCountMap.set(name, (serviceCountMap.get(name) || 0) + 1);
  });
  const sortedServices = Array.from(serviceCountMap.entries()).sort(
    (a, b) => b[1] - a[1]
  );
  const top10Services = sortedServices.slice(0, 10);
  const otherCount = sortedServices
    .slice(10)
    .reduce((sum, [, count]) => sum + count, 0);
  const pieTop10Data = top10Services.map(([name, value], idx) => ({
    name,
    value,
    color: `hsl(0,0%,${40 + idx * 5}%)`, // gradient xám
  }));
  if (otherCount > 0) {
    pieTop10Data.push({ name: "Khác", value: otherCount, color: "#ededed" });
  }

  // PieChart top 10 dịch vụ theo giá buổi (có filter)
  // Giả sử mỗi DataPoint có trường serviceName, nếu không có thì dùng type
  const serviceValueMap = new Map();
  filteredServiceData.forEach((d) => {
    const name = d.serviceName || d.type;
    if (!serviceValueMap.has(name)) {
      serviceValueMap.set(name, { totalValue: 0, count: 0 });
    }
    const obj = serviceValueMap.get(name);
    obj.totalValue += d.value;
    obj.count += 1;
  });
  const serviceAvgArr = Array.from(serviceValueMap.entries()).map(
    ([name, { totalValue, count }]) => ({
      name,
      avg: count > 0 ? totalValue / count : 0,
      count,
    })
  );
  const sortedAvg = serviceAvgArr.sort((a, b) => b.avg - a.avg);
  const top10Avg = sortedAvg.slice(0, 10);
  const otherAvgSum = sortedAvg.slice(10).reduce((sum, s) => sum + s.avg, 0);
  const pieTop10AvgData = top10Avg.map((s, idx) => ({
    name: s.name,
    value: s.avg,
    color: `hsl(30, 100%, ${45 + idx * 5}%)`, // gradient cam
  }));
  if (sortedAvg.length > 10) {
    pieTop10AvgData.push({
      name: "Khác",
      value: otherAvgSum,
      color: "#ffe0b2",
    });
  }

  const serviceData = [
    {
      tenDichVu: "QUÀ TẶNG DV KÈM THẺ TIỀN",
      loaiDichVu: "Quà tặng",
      soLuong: 1,
      tongGia: 1000000,
      giaBuoiTB: 1000000,
      percentSoLuong: 2.63,
      percentTongGia: 2.63,
    },
    {
      tenDichVu:
        "COMBO 7: DEEP CLEAN ACNE-CARE LÀM SẠCH SÂU VÀ CHĂM SÓC DA MỤN",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1200000,
      giaBuoiTB: 1200000,
      percentSoLuong: 2.63,
      percentTongGia: 3.16,
    },
    {
      tenDichVu:
        "DV 4: LUMIGLOW CLEANSE - LÀM SÁNG VÀ ĐỀU MÀU DA, NGĂN NGỪA LÃO HÓA",
      loaiDichVu: "Dịch vụ",
      soLuong: 1,
      tongGia: 900000,
      giaBuoiTB: 900000,
      percentSoLuong: 2.63,
      percentTongGia: 2.37,
    },
    {
      tenDichVu:
        "DV 6: EYE-REVIVE CLEANSE - CHĂM SÓC DA MẮT, NÂNG CƠ VÀ GIẢM QUẦNG THÂM",
      loaiDichVu: "Dịch vụ",
      soLuong: 1,
      tongGia: 950000,
      giaBuoiTB: 950000,
      percentSoLuong: 2.63,
      percentTongGia: 2.5,
    },
    {
      tenDichVu: "QUÀ TẶNG DV KÈM THẺ TIỀN",
      loaiDichVu: "Quà tặng",
      soLuong: 1,
      tongGia: 1000000,
      giaBuoiTB: 1000000,
      percentSoLuong: 2.63,
      percentTongGia: 2.63,
    },
    {
      tenDichVu: "DV 5: GYMMING CLEANSE - LÀM SĂN CHẮC, TĂNG ĐỘ ĐÀN HỒI DA",
      loaiDichVu: "Dịch vụ",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu:
        "DV 2: DEEP CLEANSE - LÀM SẠCH SÂU THU NHỎ CHÂN LÔNG VÀ TĂNG ĐỘ ẨM",
      loaiDichVu: "Dịch vụ",
      soLuong: 1,
      tongGia: 1050000,
      giaBuoiTB: 1050000,
      percentSoLuong: 2.63,
      percentTongGia: 2.76,
    },
    {
      tenDichVu: "DV 1: AQUA PEEL CLEANSE - RỬA MẶT CÔNG NGHỆ 5 BƯỚC HYDRATION",
      loaiDichVu: "Dịch vụ",
      soLuong: 1,
      tongGia: 850000,
      giaBuoiTB: 850000,
      percentSoLuong: 2.63,
      percentTongGia: 2.25,
    },
    {
      tenDichVu: "DV 3: CRYO CLEANSE - CẤP ẨM, CĂNG BÓNG DA TRÀN ĐẦY SỨC SỐNG",
      loaiDichVu: "Dịch vụ",
      soLuong: 1,
      tongGia: 980000,
      giaBuoiTB: 980000,
      percentSoLuong: 2.63,
      percentTongGia: 2.58,
    },
    {
      tenDichVu: "COMBO CS 2: MESO BRIGTENING - SÁNG DA MỊN MÀNG KHÔNG TÌ VẾT",
      loaiDichVu: "Combo",
      soLuong: 1,
      tongGia: 1300000,
      giaBuoiTB: 1300000,
      percentSoLuong: 2.63,
      percentTongGia: 3.42,
    },
    {
      tenDichVu:
        "COMBO 6: LUMIGLOW CLEANSE CRYO GYMMING - SÁNG DA, CẤP ẨM, SĂN CHẮC",
      loaiDichVu: "Combo",
      soLuong: 1,
      tongGia: 1400000,
      giaBuoiTB: 1400000,
      percentSoLuong: 2.63,
      percentTongGia: 3.68,
    },
    {
      tenDichVu:
        "COMBO 13: ANTI-AGING & HYDRATE SKINCARE - CHỐNG LÃO HÓA, CẤP ẨM",
      loaiDichVu: "Combo",
      soLuong: 1,
      tongGia: 1350000,
      giaBuoiTB: 1350000,
      percentSoLuong: 2.63,
      percentTongGia: 3.55,
    },
    {
      tenDichVu:
        "COMBO 4: LUMIGLOW CLEANSE GYMMING EYE-REVIVE - SÁNG DA, SĂN CHẮC, CHĂM SÓC MẮT",
      loaiDichVu: "Combo",
      soLuong: 1,
      tongGia: 1250000,
      giaBuoiTB: 1250000,
      percentSoLuong: 2.63,
      percentTongGia: 3.29,
    },
    {
      tenDichVu: "COMBO CS 5: HỒI SINH VẺ ĐẸP TỰ NHIÊN",
      loaiDichVu: "Combo",
      soLuong: 1,
      tongGia: 1200000,
      giaBuoiTB: 1200000,
      percentSoLuong: 2.63,
      percentTongGia: 3.16,
    },
    {
      tenDichVu:
        "COMBO 8: SOOTHING FOR SENSITIVE SKIN - LÀM DỊU & CHĂM SÓC DA NHẠY CẢM",
      loaiDichVu: "Combo",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu:
        "COMBO 5: GYMMING CLEANSE CRYO EYE-REVIVE - CHĂM SÓC DA, SĂN CHẮC, CẤP ẨM, CHĂM SÓC MẮT",
      loaiDichVu: "Combo",
      soLuong: 1,
      tongGia: 1150000,
      giaBuoiTB: 1150000,
      percentSoLuong: 2.63,
      percentTongGia: 3.03,
    },
    {
      tenDichVu:
        "COMBO 3: GYMMING CLEANSE CRYO - CẤP ẨM CĂNG BÓNG, SĂN CHẮC DA",
      loaiDichVu: "Combo",
      soLuong: 1,
      tongGia: 1120000,
      giaBuoiTB: 1120000,
      percentSoLuong: 2.63,
      percentTongGia: 2.95,
    },
    {
      tenDichVu: "COMBO 7: MESO TẾ BÀO GỐC DNA CÁ HỒI",
      loaiDichVu: "Combo",
      soLuong: 1,
      tongGia: 1450000,
      giaBuoiTB: 1450000,
      percentSoLuong: 2.63,
      percentTongGia: 3.82,
    },
    {
      tenDichVu: "COMBO CS 5: REVIVE NATURAL BEAUTY - HỒI SINH VẺ ĐẸP TỰ NHIÊN",
      loaiDichVu: "Combo",
      soLuong: 1,
      tongGia: 1200000,
      giaBuoiTB: 1200000,
      percentSoLuong: 2.63,
      percentTongGia: 3.16,
    },
    {
      tenDichVu:
        "COMBO 10: BURNT SKIN FULL FACE - PHỤC HỒI DA CHÁY NẮNG CẢ KHUÔN MẶT",
      loaiDichVu: "Combo",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "COMBO 1: DEEP CLEANSE CRYO - LÀM SẠCH SÂU VÀ CẤP ẨM CHO DA",
      loaiDichVu: "Combo",
      soLuong: 1,
      tongGia: 1300000,
      giaBuoiTB: 1300000,
      percentSoLuong: 2.63,
      percentTongGia: 3.42,
    },
    {
      tenDichVu: "COMBO CS 4: SHINE WITH YOUR OWN LIGHT - RẠNG NGỜI CHẤT RIÊNG",
      loaiDichVu: "Combo",
      soLuong: 1,
      tongGia: 1250000,
      giaBuoiTB: 1250000,
      percentSoLuong: 2.63,
      percentTongGia: 3.29,
    },
    {
      tenDichVu: "CT 1: ADDED CRYO - CỘNG THÊM CẤP ẨM",
      loaiDichVu: "Cộng thêm",
      soLuong: 1,
      tongGia: 800000,
      giaBuoiTB: 800000,
      percentSoLuong: 2.63,
      percentTongGia: 2.11,
    },
    {
      tenDichVu: "CT 4: ADDED EYE-REVIVE - CỘNG THÊM CHĂM SÓC MẮT",
      loaiDichVu: "Cộng thêm",
      soLuong: 1,
      tongGia: 850000,
      giaBuoiTB: 850000,
      percentSoLuong: 2.63,
      percentTongGia: 2.25,
    },
    {
      tenDichVu: "CT 2: ADDED LUMIGLOW - CỘNG THÊM SÁNG DA",
      loaiDichVu: "Cộng thêm",
      soLuong: 1,
      tongGia: 900000,
      giaBuoiTB: 900000,
      percentSoLuong: 2.63,
      percentTongGia: 2.37,
    },
    {
      tenDichVu: "CT 6: ADDED GOODBYE ACNE - CỘNG THÊM CHĂM SÓC MỤN",
      loaiDichVu: "Cộng thêm",
      soLuong: 1,
      tongGia: 950000,
      giaBuoiTB: 950000,
      percentSoLuong: 2.63,
      percentTongGia: 2.5,
    },
    {
      tenDichVu: "CT 3: ADDED GYMMING - CỘNG THÊM SĂN CHẮC DA",
      loaiDichVu: "Cộng thêm",
      soLuong: 1,
      tongGia: 870000,
      giaBuoiTB: 870000,
      percentSoLuong: 2.63,
      percentTongGia: 2.29,
    },
    {
      tenDichVu: "CT 5: ADDED NECK CARE - CỘNG THÊM CHĂM SÓC VÙNG CỔ",
      loaiDichVu: "Cộng thêm",
      soLuong: 1,
      tongGia: 880000,
      giaBuoiTB: 880000,
      percentSoLuong: 2.63,
      percentTongGia: 2.32,
    },
    {
      tenDichVu: "QUÀ TẶNG",
      loaiDichVu: "Quà tặng",
      soLuong: 1,
      tongGia: 1000000,
      giaBuoiTB: 1000000,
      percentSoLuong: 2.63,
      percentTongGia: 2.63,
    },
    {
      tenDichVu: "QUÀ TẶNG DV KÈM THẺ TIỀN",
      loaiDichVu: "Quà tặng",
      soLuong: 1,
      tongGia: 1000000,
      giaBuoiTB: 1000000,
      percentSoLuong: 2.63,
      percentTongGia: 2.63,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
    {
      tenDichVu: "Fox card",
      loaiDichVu: "Fox card",
      soLuong: 1,
      tongGia: 1100000,
      giaBuoiTB: 1100000,
      percentSoLuong: 2.63,
      percentTongGia: 2.89,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="p-2 ">
          <div className=" gap-2">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Services Report
            </h1>
            <div className="flex gap-10">
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

              <div className="flex flex-wrap mb-4 gap-2">
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
                        {locationOptions
                          .filter((loc) =>
                            loc
                              .toLowerCase()
                              .includes(locationSearch.toLowerCase())
                          )
                          .map((loc) => (
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

                <div className="flex gap-2 mb-4">
                  {/* Filter dịch vụ dạng dropdown */}
                  <div className="relative" ref={serviceDropdownRef}>
                    <button
                      className="bg-yellow-300 px-4 py-2 rounded-t-lg font-bold flex items-center gap-2 min-w-[250px] border-b-2 border-yellow-400"
                      onClick={() => setShowServiceDropdown((v) => !v)}
                      type="button"
                    >
                      <span className="material-icons"></span> Services
                    </button>
                    {showServiceDropdown && (
                      <div className="absolute z-20 bg-white shadow-xl rounded-b-lg w-full min-w-[180px] border border-yellow-200">
                        <div className="bg-yellow-200 px-4 py-2 font-bold flex items-center gap-2 border-b border-yellow-300">
                          <input
                            type="checkbox"
                            checked={
                              selectedServiceTypes.length ===
                              ALL_SERVICE_TYPES.length
                            }
                            onChange={() =>
                              setSelectedServiceTypes(
                                selectedServiceTypes.length ===
                                  ALL_SERVICE_TYPES.length
                                  ? []
                                  : ALL_SERVICE_TYPES.map((s) => s.key)
                              )
                            }
                            className="accent-yellow-400"
                          />
                          Services
                        </div>
                        <div className="px-2 py-2 border-b">
                          <input
                            className="w-full border rounded px-2 py-1"
                            placeholder="Nhập để tìm kiếm"
                            value={serviceSearch}
                            onChange={(e) => setServiceSearch(e.target.value)}
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredServiceTypes.map((s) => (
                            <label
                              key={s.key}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-yellow-50 cursor-pointer border-b last:border-b-0"
                            >
                              <input
                                type="checkbox"
                                checked={selectedServiceTypes.includes(s.key)}
                                onChange={() => {
                                  setSelectedServiceTypes((prev) =>
                                    prev.includes(s.key)
                                      ? prev.filter((x) => x !== s.key)
                                      : [...prev, s.key]
                                  );
                                }}
                                className="accent-yellow-400"
                              />
                              <span className="font-medium">{s.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Filter giới tính dạng dropdown */}
                  <div className="relative" ref={genderDropdownRef}>
                    <button
                      className="bg-yellow-300 px-4 py-2 rounded-t-lg font-bold flex items-center gap-2 min-w-[220px] border-b-2 border-yellow-400"
                      onClick={() => setShowGenderDropdown((v) => !v)}
                      type="button"
                    >
                      <span className="material-icons"></span> Gender
                    </button>
                    {showGenderDropdown && (
                      <div className="absolute z-20 bg-white shadow-xl rounded-b-lg w-full min-w-[120px] border border-yellow-200">
                        <div className="bg-yellow-200 px-4 py-2 font-bold flex items-center gap-2 border-b border-yellow-300">
                          <input
                            type="checkbox"
                            checked={
                              selectedGenders.length === ALL_GENDERS.length
                            }
                            onChange={() =>
                              setSelectedGenders(
                                selectedGenders.length === ALL_GENDERS.length
                                  ? []
                                  : [...ALL_GENDERS]
                              )
                            }
                            className="accent-yellow-400"
                          />
                          Gender
                          <span className="ml-auto">Actual price </span>
                        </div>
                        <div className="px-2 py-2 border-b">
                          <input
                            className="w-full border rounded px-2 py-1"
                            placeholder="Nhập để tìm kiếm"
                            value={genderSearch}
                            onChange={(e) => setGenderSearch(e.target.value)}
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredGenders.map((g) => {
                            const price =
                              genderActualPrice.find((row) => row.gender === g)
                                ?.total || 0;
                            return (
                              <label
                                key={g}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-yellow-50 cursor-pointer border-b last:border-b-0 justify-between"
                              >
                                <span className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedGenders.includes(g)}
                                    onChange={() => {
                                      setSelectedGenders((prev) =>
                                        prev.includes(g)
                                          ? prev.filter((x) => x !== g)
                                          : [...prev, g]
                                      );
                                    }}
                                    className="accent-yellow-400"
                                  />
                                  <span className="font-medium">{g}</span>
                                </span>
                                <span className="text-xs text-gray-500 min-w-[60px] text-right">
                                  {formatMoneyShort(price)}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tổng dịch vụ thực hiện trong tuần */}

          <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-4">
            <div className="text-xl font-medium text-gray-700 text-center mb-4">
              Tổng dịch vụ thực hiện trong tuần
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={weeklyServiceChartData}
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
                <Legend />
                <Bar dataKey="combo" name="Combo" fill="#795548" />
                <Bar dataKey="service" name="Dịch vụ" fill="#c5e1a5" />
                <Bar dataKey="addedon" name="Added on" fill="#f16a3f" />
                <Bar dataKey="foxcard" name="Fox card" fill="#c86b82" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-2">
            {/* PieChart tỉ lệ dịch vụ/combo/cộng thêm (có filter) */}
            <div className="w-1/2 bg-white rounded-xl shadow-lg mt-5 p-4">
              <div className="text-xl font-medium text-gray-700 text-center mb-4">
                Tỉ lệ dịch vụ/combo/cộng thêm
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ percent }) =>
                      percent ? `${(percent * 100).toFixed(1)}%` : ""
                    }
                    isAnimationActive={false}
                  >
                    {pieChartData.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    wrapperStyle={{ width: 180, paddingLeft: 8 }}
                    content={({ payload }) => (
                      <ul style={{ margin: 0, padding: 0 }}>
                        {(payload || []).map((entry, idx) => (
                          <li
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: 8,
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                background: entry.color,
                                marginRight: 8,
                              }}
                            />
                            <span
                              style={{
                                color: "#222",
                                fontWeight: 500,
                                fontSize: 16,
                              }}
                            >
                              {entry.value}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* PieChart top 10 dịch vụ theo số lượng */}
            <div className="w-1/2 bg-white rounded-xl shadow-lg mt-5 p-4">
              <div className="text-xl font-medium text-gray-700 text-center mb-4">
                Top 10 dịch vụ theo số lượng
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieTop10Data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ percent }) =>
                      percent ? `${(percent * 100).toFixed(1)}%` : ""
                    }
                    isAnimationActive={false}
                  >
                    {pieTop10AvgData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    formatter={(value) => (
                      <span
                        style={{
                          color: "#222",
                          fontWeight: 500,
                          fontSize: 16,
                          maxWidth: 180,
                          display: "inline-block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PieChart top 10 dịch vụ theo giá buổi */}
          <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-4">
            <div className="text-xl font-medium text-gray-700 text-center mb-4">
              Top 10 dịch vụ theo giá buổi
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={pieTop10AvgData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  className="justify-center"
                  label={({ percent }) =>
                    percent ? `${(percent * 100).toFixed(1)}%` : ""
                  }
                  isAnimationActive={false}
                >
                  {pieTop10AvgData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  wrapperStyle={{ width: 180, paddingLeft: 8 }}
                  content={({ payload }) => (
                    <ul style={{ margin: 0, padding: 0 }}>
                      {(payload || []).map((entry, idx) => (
                        <li
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              background: entry.color,
                              marginRight: 8,
                            }}
                          />
                          <span
                            style={{
                              color:
                                entry.color === "#e65100" ? "#e65100" : "#222",
                              fontWeight: 500,
                              fontSize: 16,
                            }}
                          >
                            {entry.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-2">
            {/* PieChart bottom 3 dịch vụ theo số lượng */}
            <div className="w-1/2 bg-white rounded-xl shadow-lg mt-5 p-4">
              <div className="text-xl font-medium text-gray-700 text-center mb-4">
                Bottom 3 dịch vụ theo số lượng
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={(() => {
                      // Lấy bottom 3 dịch vụ theo số lượng
                      const serviceCountMap = new Map();
                      filteredServiceData.forEach((d) => {
                        const name = d.serviceName || d.type;
                        serviceCountMap.set(
                          name,
                          (serviceCountMap.get(name) || 0) + 1
                        );
                      });
                      const sorted = Array.from(serviceCountMap.entries()).sort(
                        (a, b) => a[1] - b[1]
                      );
                      const bottom3 = sorted.slice(0, 3);
                      // Màu xám cho từng phần
                      const grayShades = ["#bdbdbd", "#9e9e9e", "#e0e0e0"];
                      return bottom3.map(([name, value], idx) => ({
                        name,
                        value,
                        color: grayShades[idx % grayShades.length],
                      }));
                    })()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ percent }) =>
                      percent ? `${(percent * 100).toFixed(1)}%` : ""
                    }
                    isAnimationActive={false}
                  >
                    {(() => {
                      // Lặp lại logic màu xám cho Cell
                      const serviceCountMap = new Map();
                      filteredServiceData.forEach((d) => {
                        const name = d.serviceName || d.type;
                        serviceCountMap.set(
                          name,
                          (serviceCountMap.get(name) || 0) + 1
                        );
                      });
                      const sorted = Array.from(serviceCountMap.entries()).sort(
                        (a, b) => a[1] - b[1]
                      );
                      const bottom3 = sorted.slice(0, 3);
                      const grayShades = ["#bdbdbd", "#9e9e9e", "#e0e0e0"];
                      return bottom3.map(([name], idx) => (
                        <Cell
                          key={name}
                          fill={grayShades[idx % grayShades.length]}
                        />
                      ));
                    })()}
                  </Pie>
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    wrapperStyle={{ width: 180, paddingLeft: 8 }}
                    content={({ payload }) => (
                      <ul style={{ margin: 0, padding: 0 }}>
                        {(payload || []).map((entry, idx) => (
                          <li
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: 8,
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                background: entry.color,
                                marginRight: 8,
                              }}
                            />
                            <span
                              style={{
                                color: "#222",
                                fontWeight: 500,
                                fontSize: 16,
                              }}
                            >
                              {entry.value}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* PieChart bottom 3 dịch vụ theo giá buổi */}
            <div className="w-1/2 bg-white rounded-xl shadow-lg mt-5 p-4">
              <div className="text-xl font-medium text-gray-700 text-center mb-4">
                Bottom 3 dịch vụ theo giá buổi
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={(() => {
                      // Lấy bottom 3 dịch vụ theo giá buổi trung bình
                      const serviceValueMap = new Map();
                      filteredServiceData.forEach((d) => {
                        const name = d.serviceName || d.type;
                        if (!serviceValueMap.has(name)) {
                          serviceValueMap.set(name, {
                            totalValue: 0,
                            count: 0,
                          });
                        }
                        const obj = serviceValueMap.get(name);
                        obj.totalValue += d.value;
                        obj.count += 1;
                      });
                      const serviceAvgArr = Array.from(
                        serviceValueMap.entries()
                      ).map(([name, { totalValue, count }]) => ({
                        name,
                        avg: count > 0 ? totalValue / count : 0,
                        count,
                      }));
                      const sortedAvg = serviceAvgArr.sort(
                        (a, b) => a.avg - b.avg
                      );
                      const bottom3 = sortedAvg.slice(0, 3);
                      const grayShades = ["#bdbdbd", "#9e9e9e", "#e0e0e0"];
                      return bottom3.map((s, idx) => ({
                        name: s.name,
                        value: s.avg,
                        color: grayShades[idx % grayShades.length],
                      }));
                    })()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ percent }) =>
                      percent ? `${(percent * 100).toFixed(1)}%` : ""
                    }
                    isAnimationActive={false}
                  >
                    {(() => {
                      // Lặp lại logic màu xám cho Cell
                      const serviceValueMap = new Map();
                      filteredServiceData.forEach((d) => {
                        const name = d.serviceName || d.type;
                        if (!serviceValueMap.has(name)) {
                          serviceValueMap.set(name, {
                            totalValue: 0,
                            count: 0,
                          });
                        }
                        const obj = serviceValueMap.get(name);
                        obj.totalValue += d.value;
                        obj.count += 1;
                      });
                      const serviceAvgArr = Array.from(
                        serviceValueMap.entries()
                      ).map(([name, { totalValue, count }]) => ({
                        name,
                        avg: count > 0 ? totalValue / count : 0,
                        count,
                      }));
                      const sortedAvg = serviceAvgArr.sort(
                        (a, b) => a.avg - b.avg
                      );
                      const bottom3 = sortedAvg.slice(0, 3);
                      const grayShades = ["#bdbdbd", "#9e9e9e", "#e0e0e0"];
                      return bottom3.map((s, idx) => (
                        <Cell
                          key={s.name}
                          fill={grayShades[idx % grayShades.length]}
                        />
                      ));
                    })()}
                  </Pie>
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    wrapperStyle={{ width: 180, paddingLeft: 8 }}
                    content={({ payload }) => (
                      <ul style={{ margin: 0, padding: 0 }}>
                        {(payload || []).map((entry, idx) => (
                          <li
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: 8,
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                background: entry.color,
                                marginRight: 8,
                              }}
                            />
                            <span
                              style={{
                                color: "#222",
                                fontWeight: 500,
                                fontSize: 16,
                              }}
                            >
                              {entry.value}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 5 bảng tổng dịch vụ */}

          <div className="flex w-full justify-between mb-5 mt-5">
            <StatCard
              title="Tổng Combo"
              value={comboThisWeek}
              delta={deltaCombo}
              valueColor="text-black"
              className="bg-[#b6d47b]"
            />
            <StatCard
              title="Tổng dịch vụ lẻ"
              value={retailThisWeek}
              delta={deltaRetail}
              valueColor="text-black"
              className="bg-[#8fd1fc]"
            />
            <StatCard
              title="Tổng dịch vụ CT"
              value={ctThisWeek}
              delta={deltaCT}
              valueColor="text-black"
              className="bg-[#b39ddb]"
            />
            <StatCard
              title="Tổng quà tặng"
              value={giftThisWeek}
              delta={deltaGift}
              valueColor="text-black"
              className="bg-[#f7a0ca]"
            />
            <StatCard
              title="Tổng dịch vụ thực hiện"
              value={totalServiceThisWeek}
              delta={deltaTotalService}
              valueColor="text-black"
              className="bg-[#bd8b6f]"
            />
          </div>

          {/* Tổng dịch vụ thực hiện theo cửa hàng*/}

          <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-4">
            <div className="text-xl font-medium text-gray-700 text-center mb-4">
              Tổng dịch vụ thực hiện theo cửa hàng
            </div>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                data={storeServiceChartData}
                margin={{ top: 30, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="store"
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000} N` : v)}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="combo" name="Combo" stackId="a" fill="#795548" />
                <Bar
                  dataKey="service"
                  name="Dịch vụ"
                  stackId="a"
                  fill="#c5e1a5"
                />
                <Bar
                  dataKey="addedon"
                  name="Added on"
                  stackId="a"
                  fill="#f16a3f"
                />
                <Bar dataKey="gifts" name="Gifts" stackId="a" fill="#8fd1fc" />
                <Bar
                  dataKey="foxcard"
                  name="Fox card"
                  stackId="a"
                  fill="#c86b82"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Bảng thống kê tất cả các dịch vụ */}
          <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-4">
            <div className="text-xl font-medium text-gray-700 text-center mb-4">
              Bảng dịch vụ
            </div>
            <div className="overflow-x-auto">
              {/* Table header */}
              <table
                className="min-w-full border text-sm table-fixed"
                style={{ tableLayout: "fixed", width: "100%" }}
              >
                <thead>
                  <tr className="bg-yellow-200 text-gray-900">
                    <th className="w-12 px-2 py-2 border text-center font-bold">
                      STT
                    </th>
                    <th className="w-64 px-2 py-2 border text-left font-bold">
                      Dịch vụ
                    </th>
                    <th className="w-24 px-2 py-2 border text-center font-bold">
                      Loại
                    </th>
                    <th className="w-20 px-2 py-2 border text-right font-bold bg-orange-100">
                      Số lượng
                    </th>
                    <th className="w-20 px-2 py-2 border text-right font-bold">
                      Δ
                    </th>
                    <th className="w-24 px-2 py-2 border text-right font-bold">
                      % Số lượng
                    </th>
                    <th className="w-32 px-2 py-2 border text-right font-bold bg-blue-100">
                      Tổng giá
                    </th>
                    <th className="w-20 px-2 py-2 border text-right font-bold">
                      % Δ
                    </th>
                    <th className="w-24 px-2 py-2 border text-right font-bold">
                      % Tổng giá
                    </th>
                  </tr>
                </thead>
              </table>
              {/* Table body with scroll */}
              <div
                style={{
                  maxHeight: 420,
                  overflowY: "auto",
                  scrollbarWidth: "none",
                }}
                className="hide-scrollbar"
              >
                <table
                  className="min-w-full border text-sm table-fixed"
                  style={{ tableLayout: "fixed", width: "100%" }}
                >
                  <tbody>
                    {serviceData.map((s, idx) => {
                      // Chỉ random mẫu cho delta và percentDelta, không truy cập s.delta/s.percentDelta
                      const delta =
                        Math.floor(Math.random() * 1000) *
                        (Math.random() > 0.2 ? 1 : -1);
                      const percentDelta =
                        delta > 0
                          ? (Math.random() * 10 + 100).toFixed(1)
                          : (Math.random() * 10 + 90).toFixed(1);
                      return (
                        <tr
                          key={`${s.tenDichVu}-${idx}`}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="w-12 px-2 py-1 border text-center">
                            {idx + 1}
                          </td>
                          <td
                            className="w-64 px-2 py-1 border text-left font-medium truncate"
                            title={s.tenDichVu}
                          >
                            {s.tenDichVu}
                          </td>
                          <td className="w-24 px-2 py-1 border text-center">
                            {s.loaiDichVu}
                          </td>
                          <td className="w-20 px-2 py-1 border text-right font-bold bg-orange-100 text-orange-700">
                            {s.soLuong?.toLocaleString?.() ?? s.soLuong}
                          </td>
                          <td
                            className={`w-20 px-2 py-1 border text-right font-semibold ${
                              delta > 0
                                ? "text-green-600"
                                : delta < 0
                                ? "text-red-500"
                                : ""
                            }`}
                          >
                            {delta?.toLocaleString?.() ?? delta}{" "}
                            {delta > 0 ? "↑" : delta < 0 ? "↓" : ""}
                          </td>
                          <td className="w-24 px-2 py-1 border text-right">
                            {s.percentSoLuong}%
                          </td>
                          <td className="w-32 px-2 py-1 border text-right font-bold bg-blue-100 text-blue-700">
                            {s.tongGia?.toLocaleString?.() ?? s.tongGia}
                          </td>
                          <td
                            className={`w-20 px-2 py-1 border text-right font-semibold ${
                              delta > 0
                                ? "text-green-600"
                                : delta < 0
                                ? "text-red-500"
                                : ""
                            }`}
                          >
                            {percentDelta}%{" "}
                            {delta > 0 ? "↑" : delta < 0 ? "↓" : ""}
                          </td>
                          <td className="w-24 px-2 py-1 border text-right">
                            {s.percentTongGia}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Table footer */}
              <table
                className="min-w-full border text-sm table-fixed"
                style={{ tableLayout: "fixed", width: "100%" }}
              >
                <tfoot>
                  <tr className="bg-gray-100 font-bold border-t-2 border-gray-400">
                    <td className="w-12 px-2 py-1 border text-center"></td>
                    <td className="w-64 px-2 py-1 border text-left">
                      Tổng cộng
                    </td>
                    <td className="w-24 px-2 py-1 border text-center"></td>
                    <td className="w-20 px-2 py-1 border text-right bg-orange-100 text-orange-700">
                      {serviceData
                        .reduce((sum, s) => sum + (s.soLuong || 0), 0)
                        .toLocaleString()}
                    </td>
                    <td className="w-20 px-2 py-1 border text-right">—</td>
                    <td className="w-24 px-2 py-1 border text-right">100%</td>
                    <td className="w-32 px-2 py-1 border text-right bg-blue-100 text-blue-700">
                      {serviceData
                        .reduce((sum, s) => sum + (s.tongGia || 0), 0)
                        .toLocaleString()}
                    </td>
                    <td className="w-20 px-2 py-1 border text-right">—</td>
                    <td className="w-24 px-2 py-1 border text-right">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
