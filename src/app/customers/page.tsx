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
import salesData1 from "../../data/danh_sach_ban_hang.json";
import salesData2 from "../../data/ban_hang_doanh_so.json";
import salesData3 from "../../data/dich_vu_ban_hang.json";
import khAppData from "../../data/khach_hang_su_dung_app.json";

interface DataPoint {
  date: string;
  value: number;
  value2: number;
  type: string;
  status: string;
  gender: "Nam" | "Nữ" | "#N/A";
  region?: string;
  branch?: string;
  source?: string;
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

  const customerTypes = [
    "KH trải nghiệm",
    "Khách hàng Thành viên",
    "Khách hàng Bạc",
    "Khách hàng Vàng",
    "Khách hàng Bạch Kim",
    "Khách hàng Kim cương",
  ];

  const customerStatus = ["New", "Old"];

  const allRawData = [
    ...(Array.isArray(salesData1) ? salesData1 : []),
    ...(Array.isArray(salesData2) ? salesData2 : []),
    ...(Array.isArray(salesData3) ? salesData3 : []),
    ...(Array.isArray(khAppData) ? khAppData : []),
  ];

  // Chuẩn hóa lại mảng data từ allRawData về DataPoint[]
  const data: DataPoint[] = allRawData
    .map((d) => {
      const row = d as Record<string, unknown>;
      let gender = row["Unnamed: 7"] as string;
      if (gender !== "Nam" && gender !== "Nữ") gender = "#N/A";
      return {
        date: String(row["Unnamed: 1"] || row["Unnamed: 3"] || ""),
        value: Number(row["Unnamed: 18"] ?? row["Unnamed: 9"]) || 0,
        value2: Number(row["Unnamed: 19"] ?? row["Unnamed: 10"]) || 0,
        type: String(row["Unnamed: 12"] || ""),
        status: String(row["Unnamed: 13"] || ""),
        gender: gender as "Nam" | "Nữ" | "#N/A",
        region: String(row["Unnamed: 10"] || ""),
        branch: String(row["Unnamed: 11"] || ""),
        source: String(row["Unnamed: 13"] || ""),
      };
    })
    .filter((d) => d.date && (d.gender === "Nam" || d.gender === "Nữ"));

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

  // Lọc data theo ngày đã chọn
  const filteredData = data.filter(isInRange);

  // Hàm chuẩn hóa ngày về dạng YYYY-MM-DD
  function normalizeDateOnly(str: string): string {
    // Format "hh:mm dd/mm/yyyy"
    let match = str.match(/^\d{1,2}:\d{2} (\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    // Format "dd/mm/yyyy"
    match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    // Nếu đã là YYYY-MM-DD
    match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) return str;
    // Nếu không khớp, trả về chuỗi gốc
    return str;
  }

  // Tổng hợp dữ liệu thực tế cho chart 'Số khách tới chia theo loại' theo ngày
  const kindOfCustomerReal: MultiTypeCustomerDataPoint[] = Object.values(
    filteredData.reduce((acc, cur) => {
      const dayKey = normalizeDateOnly(cur.date);
      if (!dayKey) return acc;
      if (!acc[dayKey]) {
        acc[dayKey] = {
          date: dayKey,
          KHTraiNghiem: 0,
          KHThanhVien: 0,
          KHBac: 0,
          KHVang: 0,
          KHDong: 0,
          KHKimcuong: 0,
          type: "",
          status: "",
        };
      }
      switch (cur.type) {
        case "KH trải nghiệm":
          acc[dayKey].KHTraiNghiem += 1;
          break;
        case "Khách hàng Thành viên":
          acc[dayKey].KHThanhVien += 1;
          break;
        case "Khách hàng Bạc":
          acc[dayKey].KHBac += 1;
          break;
        case "Khách hàng Vàng":
          acc[dayKey].KHVang += 1;
          break;
        case "Khách hàng Đồng":
          acc[dayKey].KHDong += 1;
          break;
        case "Khách hàng Kim cương":
          acc[dayKey].KHKimcuong += 1;
          break;
        default:
          break;
      }
      return acc;
    }, {} as Record<string, MultiTypeCustomerDataPoint>)
  );

  // Tổng hợp dữ liệu thực tế cho chart 'Nguồn của đơn hàng'
  const orderSources = [
    {
      key: "vangLai",
      label: "Vãng lai",
      match: ["Vãng lai", "vanglai", "Vang lai"],
    },
    { key: "fanpage", label: "Fanpage", match: ["Fanpage", "fanpage"] },
    { key: "facebook", label: "Facebook", match: ["Facebook", "facebook"] },
    { key: "app", label: "App", match: ["App", "app"] },
    { key: "web", label: "Web", match: ["Web", "web"] },
    {
      key: "tiktok",
      label: "Tiktok shop",
      match: ["Tiktok", "Tiktok shop", "tiktok"],
    },
  ];

  const originOfOrderReal = Object.values(
    filteredData.reduce((acc, cur) => {
      const dayKey = normalizeDateOnly(cur.date);
      if (!dayKey) return acc;
      if (!acc[dayKey]) {
        acc[dayKey] = {
          date: dayKey,
          vangLai: 0,
          fanpage: 0,
          facebook: 0,
          app: 0,
          web: 0,
          tiktok: 0,
          chuaXacDinh: 0,
          type: "",
          status: "",
        };
      }
      let found = false;
      for (const src of orderSources) {
        if (
          src.match.some(
            (m) =>
              cur.source && cur.source.toLowerCase().includes(m.toLowerCase())
          )
        ) {
          if (src.key === "vangLai") acc[dayKey].vangLai += 1;
          else if (src.key === "fanpage") acc[dayKey].fanpage += 1;
          else if (src.key === "facebook") acc[dayKey].facebook += 1;
          else if (src.key === "app") acc[dayKey].app += 1;
          else if (src.key === "web") acc[dayKey].web += 1;
          else if (src.key === "tiktok") acc[dayKey].tiktok += 1;
          found = true;
          break;
        }
      }
      if (!found) {
        acc[dayKey].chuaXacDinh += 1;
      }
      return acc;
    }, {} as Record<string, OriginOfOrderDataPoint>)
  );

  // Lọc allRawData theo ngày đã chọn
  const INVALID_DATES = [
    "NGÀY TẠO",
    "MÃ ĐƠN HÀNG",
    "TÊN KHÁCH HÀNG",
    "SỐ ĐIỆN THOẠI",
    "NHÓM KHÁCH HÀNG"
  ];

  const filteredRawDataByDate = allRawData.filter((d) => {
    const dateStr = d["Unnamed: 1"] || d["Unnamed: 3"] || "";
    if (INVALID_DATES.includes(String(dateStr).trim().toUpperCase())) return false;
    const dDate = parseVNDate(dateStr);
    return dDate.compare(startDate) >= 0 && dDate.compare(endDate) <= 0;
  });

  // Lấy danh sách số điện thoại khách hàng từ 3 file bán hàng đã lọc ngày
  const filteredCustomerPhones = new Set<string>();
  filteredRawDataByDate.forEach((d) => {
    if (d["Unnamed: 4"])
      filteredCustomerPhones.add(d["Unnamed: 4"].toString().trim());
  });

  // Lấy danh sách số điện thoại khách đã sử dụng app (lọc theo khách trong khoảng ngày)
  const filteredAppPhoneSet = new Set<string>();
  if (Array.isArray(khAppData)) {
    khAppData.forEach((d) => {
      const phone = d["Unnamed: 3"]?.toString().trim();
      if (phone && filteredCustomerPhones.has(phone)) {
        filteredAppPhoneSet.add(phone);
      }
    });
  }

  const tongKhach = filteredCustomerPhones.size;
  const soKhachTaiApp = filteredAppPhoneSet.size;
  const soKhachChuaTaiApp = tongKhach - soKhachTaiApp;

  const appCustomerBarData = [
    {
      name: "Khách hàng",
      daTaiApp: soKhachTaiApp,
      chuaTaiApp: soKhachChuaTaiApp,
    },
  ];

  const APP_CUSTOMER_PIE_COLORS = ["#9ee347", "#f0bf4c"];

  const newOldCustomerData = [
    { name: "Khách mới", value: 2847, color: "#5bd1d7" },
    { name: "Khách cũ", value: 1690, color: "#eb94cf" },
  ];

  const NEW_OLD_COLORS = ["#5bd1d7", "#eb94cf"];

  const startDateForNewOldRatio = startDate;
  // 2. Tập hợp số điện thoại đã từng mua trước ngày lọc
const oldCustomerPhones = new Set<string>();
allRawData.forEach((d) => {
  const dateStr = d["Unnamed: 1"] || d["Unnamed: 3"] || "";
  if (INVALID_DATES.includes(String(dateStr).trim().toUpperCase())) return;
  const dDate = parseVNDate(dateStr);
  const phone = d["Unnamed: 4"]?.toString().trim();
  if (phone && dDate.compare(startDateForNewOldRatio) < 0) {
    oldCustomerPhones.add(phone);
  }
});
  // 1. Lấy danh sách số điện thoại khách mới trong khoảng ngày đã chọn
  // Xác định khách mới
  const phoneFirstSeen = new Set<string>();
  const newCustomerPhones = new Set<string>();
  filteredRawDataByDate.forEach((d) => {
    const phone = d["Unnamed: 4"]?.toString().trim();
    if (!phone) return;
    if (!oldCustomerPhones.has(phone) && !phoneFirstSeen.has(phone)) {
      newCustomerPhones.add(phone);
      phoneFirstSeen.add(phone);
    }
  });

  // 2. Lọc các đơn của khách mới trong khoảng ngày đã chọn
  const newCustomerOrders = filteredRawDataByDate.filter(
    (d) => {
      const phone = d["Unnamed: 4"]?.toString().trim();
      return phone && newCustomerPhones.has(phone);
    }
  );

  // 3. Đếm số đơn theo loại (khách mới)
  const newNormalPayment = newCustomerOrders.filter(
    (d) => d.type === "KH trải nghiệm"
  ).length;
  const newFoxieCard = newCustomerOrders.filter(
    (d) => d.type === "Khách hàng Thành viên"
  ).length;
  const newProductPayment = newCustomerOrders.filter(
    (d) => d.type === "Mua sản phẩm"
  ).length;

  // 4. Tạo lại pieNewGuestData
  const pieNewGuestData = [
    { name: "Normal payment", value: newNormalPayment, color: "#ff6900" },
    { name: "Foxie Card Purchase", value: newFoxieCard, color: "#cf2e2e" },
    { name: "Products Purchase payment", value: newProductPayment, color: "#00d084" },
  ];

  // --- Dùng dữ liệu thật cho khách cũ ---
  // 5. Lọc các đơn của khách cũ trong khoảng ngày đã chọn
  const oldCustomerOrders = filteredRawDataByDate.filter(
    (d) => {
      const phone = d["Unnamed: 4"]?.toString().trim();
      return phone && oldCustomerPhones.has(phone);
    }
  );

  // 6. Đếm số đơn theo loại (khách cũ)
  const oldNormalPayment = oldCustomerOrders.filter(
    (d) => d.type === "KH trải nghiệm"
  ).length;
  const oldFoxieCard = oldCustomerOrders.filter(
    (d) => d.type === "Khách hàng Thành viên"
  ).length;
  const oldProductPayment = oldCustomerOrders.filter(
    (d) => d.type === "Mua sản phẩm"
  ).length;

  // 7. Tạo lại pieOldGuestData
  const pieOldGuestData = [
    { name: "Normal payment", value: oldNormalPayment, color: "#9ee347" },
    { name: "Foxie Card Purchase", value: oldFoxieCard, color: "#5bd1d7" },
    { name: "Products Purchase payment", value: oldProductPayment, color: "#f0bf4c" },
  ];

  const NEW_GUEST_COLOR = ["#FF6900", "#CF2E2E", "#00D084"];

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
    // Format "dd/mm/yyyy"
    match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      return parseDate(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
      );
    }
    // Các format khác giữ nguyên
    // ...
    return today(getLocalTimeZone());
  }

  function getDateRangeArray(start: CalendarDate, end: CalendarDate) {
    const arr = [];
    let d = start;
    while (d.compare(end) <= 0) {
      arr.push(d);
      d = d.add({ days: 1 });
    }
    return arr;
  }

  // --- HIỂN THỊ 4 CARD ---

  // Trung bình đơn thực thu (Nam)
  const maleActualOrders = filteredData.filter(
    (d) => d.gender === "Nam" && d.value > 0
  );
  const maleActualOrderAvg =
    maleActualOrders.length > 0
      ? Math.round(
          maleActualOrders.reduce((sum, d) => sum + d.value, 0) /
            maleActualOrders.length
        )
      : 0;

  // Trung bình đơn thực thu (Nữ)
  const femaleActualOrders = filteredData.filter(
    (d) => d.gender === "Nữ" && d.value > 0
  );
  const femaleActualOrderAvg =
    femaleActualOrders.length > 0
      ? Math.round(
          femaleActualOrders.reduce((sum, d) => sum + d.value, 0) /
            femaleActualOrders.length
        )
      : 0;

  // Trung bình đơn dịch vụ (Nam)
  const maleServiceOrders = filteredData.filter(
    (d) => d.gender === "Nam" && d.value > 0
  );
  const maleServiceOrderAvg =
    maleServiceOrders.length > 0
      ? Math.round(
          maleServiceOrders.reduce((sum, d) => sum + d.value, 0) /
            maleServiceOrders.length
        )
      : 0;

  // Trung bình đơn dịch vụ (Nữ)
  const femaleServiceOrders = filteredData.filter(
    (d) => d.gender === "Nữ" && d.value > 0
  );
  const femaleServiceOrderAvg =
    femaleServiceOrders.length > 0
      ? Math.round(
          femaleServiceOrders.reduce((sum, d) => sum + d.value, 0) /
            femaleServiceOrders.length
        )
      : 0;

  // Dữ liệu cho PieChart tỷ lệ tải app
  const appCustomerPieData = [
    { name: "Đã tải app", value: soKhachTaiApp },
    { name: "Chưa tải app", value: soKhachChuaTaiApp },
  ];

  // 1. Lấy ngày bắt đầu lọc
  

  // 2. Tập hợp số điện thoại đã từng mua trước ngày lọc
  

  // 3. Duyệt các giao dịch trong khoảng ngày đã chọn
  const phoneFirstSeenForNewOldRatio = new Set<string>();
  let newCount = 0, oldCount = 0;

  filteredRawDataByDate.forEach((d) => {
    const phone = d["Unnamed: 4"]?.toString().trim();
    if (!phone) return;
    if (oldCustomerPhones.has(phone)) {
      oldCount++;
    } else if (!phoneFirstSeenForNewOldRatio.has(phone)) {
      // Lần đầu tiên xuất hiện trong khoảng ngày lọc, là khách mới
      newCount++;
      phoneFirstSeenForNewOldRatio.add(phone);
    } else {
      // Xuất hiện lần thứ 2 trở lên trong khoảng ngày lọc, là khách cũ
      oldCount++;
    }
  });

  const newOldCustomerDataForChart = [
    { name: "Khách mới", value: newCount },
    { name: "Khách cũ", value: oldCount },
  ];

  const dateRange = getDateRangeArray(startDate, endDate);

  // Định nghĩa kiểu cho chartData phù hợp với LineChart này
  const chartData: { date: string; value: number; value2: number }[] = dateRange.map((dateObj) => {
    const dateStr = dateObj.toString(); // luôn là string

    // Số khách mới của ngày này
    const value = filterData(
      data,
      selectedType,
      selectedStatus,
      dateObj,
      dateObj,
      selectedRegions,
      selectedBranches
    ).length;

    // Số khách mới của ngày này nhưng lùi lại 30 ngày
    const date30DaysAgo = dateObj.subtract({ days: 30 });
    const value2 = filterData(
      data,
      selectedType,
      selectedStatus,
      date30DaysAgo,
      date30DaysAgo,
      selectedRegions,
      selectedBranches
    ).length;

    return {
      date: dateStr, // đảm bảo là string
      value,
      value2,
    };
  });

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

          {/* Card tổng số khách trong khoảng ngày đã chọn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-4 lg:mb-6">
            <div className="bg-white rounded-xl shadow p-4 lg:p-6 flex flex-col items-center col-span-1 lg:col-span-4">
              <div className="text-sm lg:text-xl text-gray-700 mb-2 text-center font-semibold">
                Tổng số khách trong khoảng ngày đã chọn
              </div>
              <div className="text-3xl lg:text-5xl font-bold text-[#f66035] mb-2">
                {filteredData.length.toLocaleString()}{" "}
                <span className="text-lg lg:text-2xl">khách</span>
              </div>
            </div>
          </div>

          {/* 4 bảng thống kê */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-4 lg:mb-6">
            {/* Card 1: Trung bình đơn thực thu Nam */}
            <div className="bg-white rounded-xl shadow p-4 lg:p-6 flex flex-col items-center">
              <div className="text-sm lg:text-xl text-gray-700 mb-2 text-center">
                Trung bình đơn thực thu (Nam)
              </div>
              <div className="text-3xl lg:text-5xl font-bold text-[#f66035] mb-2">
                {maleActualOrderAvg.toLocaleString()}{" "}
                <span className="text-lg lg:text-2xl">đ</span>
              </div>
            </div>
            {/* Card 2: Trung bình đơn thực thu Nữ */}
            <div className="bg-white rounded-xl shadow p-4 lg:p-6 flex flex-col items-center">
              <div className="text-sm lg:text-xl text-gray-700 mb-2 text-center">
                Trung bình đơn thực thu (Nữ)
              </div>
              <div className="text-3xl lg:text-5xl font-bold text-[#0693e3] mb-2">
                {femaleActualOrderAvg.toLocaleString()}{" "}
                <span className="text-lg lg:text-2xl">đ</span>
              </div>
            </div>
            {/* Card 3: Trung bình đơn dịch vụ Nam */}
            <div className="bg-white rounded-xl shadow p-4 lg:p-6 flex flex-col items-center">
              <div className="text-sm lg:text-xl text-gray-700 mb-2 text-center">
                Trung bình đơn dịch vụ (Nam)
              </div>
              <div className="text-3xl lg:text-5xl font-bold text-[#00d082] mb-2">
                {maleServiceOrderAvg.toLocaleString()}{" "}
                <span className="text-lg lg:text-2xl">đ</span>
              </div>
            </div>
            {/* Card 4: Trung bình đơn dịch vụ Nữ */}
            <div className="bg-white rounded-xl shadow p-4 lg:p-6 flex flex-col items-center">
              <div className="text-sm lg:text-xl text-gray-700 mb-2 text-center">
                Trung bình đơn dịch vụ (Nữ)
              </div>
              <div className="text-3xl lg:text-5xl font-bold text-[#9b51e0] mb-2">
                {femaleServiceOrderAvg.toLocaleString()}{" "}
                <span className="text-lg lg:text-2xl">đ</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row w-full gap-4 lg:gap-4">
            {/* Số khách tạo mới*/}

            <div className="w-full lg:w-1/2 bg-white p-4 rounded-xl shadow-lg">
              <h2 className="text-lg lg:text-xl text-center font-semibold text-gray-800 mb-4">
                Số khách tạo mới
              </h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#d1d5db" }}
                    tickFormatter={(date) => {
                      // date dạng 'YYYY-MM-DD' => 'DD/MM'
                      const match = date.match(/^\d{4}-(\d{2})-(\d{2})$/);
                      if (match) {
                        const [, month, day] = match;
                        return `${day}/${month}`;
                      }
                      // date dạng 'dd/mm/yyyy' => 'dd/mm'
                      const match2 = date.match(
                        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
                      );
                      if (match2) {
                        const [, day, month] = match2;
                        return `${day}/${month}`;
                      }
                      // date dạng 'hh:mm dd/mm/yyyy' => 'dd/mm'
                      const match3 = date.match(
                        /^\d{1,2}:\d{2} (\d{1,2})\/(\d{1,2})\/(\d{4})$/
                      );
                      if (match3) {
                        const [, day, month] = match3;
                        return `${day}/${month}`;
                      }
                      return date;
                    }}
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
                    type="natural"
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
                    type="natural"
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

            <div className="w-full lg:w-1/2 bg-white p-4 rounded-xl shadow-lg">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4 text-center">
                Tỷ lệ nam/nữ khách mới tạo
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Nam",
                        value: filteredData.filter((d) => d.gender === "Nam")
                          .length,
                      },
                      {
                        name: "Nữ",
                        value: filteredData.filter((d) => d.gender === "Nữ")
                          .length,
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius="0%"
                    outerRadius="80%"
                    fill="#f933347"
                    dataKey="value"
                    labelLine={false}
                    label={({ percent }) =>
                      ` ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }
                  >
                    {[
                      "#f59794", // Nam
                      "#9ee347", // Nữ
                    ].map((color, idx) => (
                      <Cell key={idx} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    wrapperStyle={{
                      paddingTop: "10px",
                      fontSize: "12px",
                      color: "#4b5563",
                    }}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
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
                {filteredData.length.toLocaleString()}
              </div>
            </div>
            {/* Tổng số khách mới thực đi */}
            <div className="flex-1 bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
              <div className="text-xl font-medium text-gray-700 mb-2 text-center">
                Tổng số khách mới thực đi
              </div>
              <div className="text-5xl font-bold text-black mb-2">
                {filteredData
                  .filter((d) => d.value > 0)
                  .length.toLocaleString()}
              </div>
            </div>
          </div>
          {/* Số khách tới chia theo phân loại */}
          <div className="w-full bg-white pt-2 mt-5 rounded-xl shadow-lg">
            <h2 className="text-xl text-center font-semibold text-gray-800 mt-4">
              Số khách tới chia theo loại
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={kindOfCustomerReal}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
              >
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="5 5" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickFormatter={(date) => {
                    // date dạng 'YYYY-MM-DD' => 'DD/MM'
                    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                    if (match) {
                      const [, , month, day] = match;
                      return `${day}/${month}`;
                    }
                    return date;
                  }}
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
                  data={originOfOrderReal}
                  margin={{ top: 50, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
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
                    }}
                  />
                  <Bar
                    dataKey="vangLai"
                    fill="#ff7f7f"
                    name="Vãng lai"
                    label={(props) => {
                      const { x, y, width, value, index } = props;
                      const d = originOfOrderReal[index];
                      if (!d) return <></>;
                      const max = Math.max(
                        d.vangLai,
                        d.fanpage,
                        d.chuaXacDinh,
                        d.facebook,
                        d.app,
                        d.web,
                        d.tiktok
                      );
                      return value === max && value > 0 ? (
                        <text
                          x={x + width / 2}
                          y={y - 5}
                          textAnchor="middle"
                          fill="#ff7f7f"
                          fontSize={12}
                          fontWeight={600}
                        >
                          {value}
                        </text>
                      ) : (
                        <></>
                      );
                    }}
                  />
                  <Bar
                    dataKey="fanpage"
                    fill="#b39ddb"
                    name="Fanpage"
                    label={(props) => {
                      const { x, y, width, value, index } = props;
                      const d = originOfOrderReal[index];
                      if (!d) return <></>;
                      const max = Math.max(
                        d.vangLai,
                        d.fanpage,
                        d.chuaXacDinh,
                        d.facebook,
                        d.app,
                        d.web,
                        d.tiktok
                      );
                      return value === max && value > 0 ? (
                        <text
                          x={x + width / 2}
                          y={y - 5}
                          textAnchor="middle"
                          fill="#b39ddb"
                          fontSize={12}
                          fontWeight={600}
                        >
                          {value}
                        </text>
                      ) : (
                        <></>
                      );
                    }}
                  />
                  <Bar
                    dataKey="chuaXacDinh"
                    fill="#8d6e63"
                    name="Chưa xác định"
                    label={(props) => {
                      const { x, y, width, value, index } = props;
                      const d = originOfOrderReal[index];
                      if (!d) return <></>;
                      const max = Math.max(
                        d.vangLai,
                        d.fanpage,
                        d.chuaXacDinh,
                        d.facebook,
                        d.app,
                        d.web,
                        d.tiktok
                      );
                      return value === max && value > 0 ? (
                        <text
                          x={x + width / 2}
                          y={y - 5}
                          textAnchor="middle"
                          fill="#8d6e63"
                          fontSize={12}
                          fontWeight={600}
                        >
                          {value}
                        </text>
                      ) : (
                        <></>
                      );
                    }}
                  />
                  <Bar
                    dataKey="facebook"
                    fill="#c5e1a5"
                    name="Facebook"
                    label={(props) => {
                      const { x, y, width, value, index } = props;
                      const d = originOfOrderReal[index];
                      if (!d) return <></>;
                      const max = Math.max(
                        d.vangLai,
                        d.fanpage,
                        d.chuaXacDinh,
                        d.facebook,
                        d.app,
                        d.web,
                        d.tiktok
                      );
                      return value === max && value > 0 ? (
                        <text
                          x={x + width / 2}
                          y={y - 5}
                          textAnchor="middle"
                          fill="#c5e1a5"
                          fontSize={12}
                          fontWeight={600}
                        >
                          {value}
                        </text>
                      ) : (
                        <></>
                      );
                    }}
                  />
                  <Bar
                    dataKey="app"
                    fill="#81d4fa"
                    name="App"
                    label={(props) => {
                      const { x, y, width, value, index } = props;
                      const d = originOfOrderReal[index];
                      if (!d) return <></>;
                      const max = Math.max(
                        d.vangLai,
                        d.fanpage,
                        d.chuaXacDinh,
                        d.facebook,
                        d.app,
                        d.web,
                        d.tiktok
                      );
                      return value === max && value > 0 ? (
                        <text
                          x={x + width / 2}
                          y={y - 5}
                          textAnchor="middle"
                          fill="#81d4fa"
                          fontSize={12}
                          fontWeight={600}
                        >
                          {value}
                        </text>
                      ) : (
                        <></>
                      );
                    }}
                  />
                  <Bar
                    dataKey="web"
                    fill="#fff176"
                    name="Web"
                    label={(props) => {
                      const { x, y, width, value, index } = props;
                      const d = originOfOrderReal[index];
                      if (!d) return <></>;
                      const max = Math.max(
                        d.vangLai,
                        d.fanpage,
                        d.chuaXacDinh,
                        d.facebook,
                        d.app,
                        d.web,
                        d.tiktok
                      );
                      return value === max && value > 0 ? (
                        <text
                          x={x + width / 2}
                          y={y - 5}
                          textAnchor="middle"
                          fill="#fff176"
                          fontSize={12}
                          fontWeight={600}
                        >
                          {value}
                        </text>
                      ) : (
                        <></>
                      );
                    }}
                  />
                  <Bar
                    dataKey="tiktok"
                    fill="#d81b60"
                    name="Tiktok shop"
                    label={(props) => {
                      const { x, y, width, value, index } = props;
                      const d = originOfOrderReal[index];
                      if (!d) return <></>;
                      const max = Math.max(
                        d.vangLai,
                        d.fanpage,
                        d.chuaXacDinh,
                        d.facebook,
                        d.app,
                        d.web,
                        d.tiktok
                      );
                      return value === max && value > 0 ? (
                        <text
                          x={x + width / 2}
                          y={y - 5}
                          textAnchor="middle"
                          fill="#d81b60"
                          fontSize={12}
                          fontWeight={600}
                        >
                          {value}
                        </text>
                      ) : (
                        <></>
                      );
                    }}
                  />
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={appCustomerBarData}
                  margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
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
                    dataKey="daTaiApp"
                    fill="#b39ddb"
                    name="Đã tải app"
                    label={{ position: "top" }}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="chuaTaiApp"
                    fill="#ff7f7f"
                    name="Chưa tải app"
                    label={{ position: "top" }}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tỉ lệ khách hàng tải app/không tải app */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-2">
            <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-lg mt-4 lg:mt-5">
              <div className="text-lg lg:text-xl font-medium text-gray-700 text-center pt-6 lg:pt-10">
                Tỷ lệ tải app
              </div>
              <div className="flex justify-center items-center py-4 lg:py-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={appCustomerPieData}
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
                        fontSize: "11px",
                      }}
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart tỉ lệ khách mới/cũ */}
            <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-lg mt-4 lg:mt-5">
              <div className="text-lg lg:text-xl font-medium text-gray-700 text-center pt-6 lg:pt-10">
                Tỉ lệ khách mới/cũ
              </div>
              <div className="flex justify-center items-center py-4 lg:py-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={newOldCustomerDataForChart}
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
                      {newOldCustomerDataForChart.map((entry, idx) => (
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
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tỉ lệ đơn mua thẻ/ sản phẩm/ dịch vụ (khách mới) */}

          <div className="w-full bg-white rounded-xl shadow-lg mt-4 lg:mt-5">
            <div className="text-lg lg:text-xl font-medium text-gray-700 text-center pt-6 lg:pt-10">
              Tỉ lệ đơn mua thẻ/ sản phẩm/ dịch vụ (khách mới)
            </div>
            <div className="flex justify-center items-center 18 lg:py-8">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieNewGuestData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="30%"
                    outerRadius="40%"
                    cornerRadius={10}
                    paddingAngle={5}
                    label={({ percent }) =>
                      `${percent ? (percent * 100).toFixed(0) : 0}%`
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
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tỉ lệ đơn mua thẻ/ sản phẩm/ dịch vụ (khách cũ) */}

          <div className="w-full bg-white rounded-xl shadow-lg mt-2">
            <div className="text-lg lg:text-xl font-medium text-gray-700 text-center pt-6 lg:pt-10">
              Tỉ lệ đơn mua thẻ/ sản phẩm/ dịch vụ (khách cũ)
            </div>
            <div className="flex justify-center items-center py-4 lg:py-8">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieOldGuestData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="30%"
                    outerRadius="40%"
                    cornerRadius={10}
                    paddingAngle={5}
                    label={({ percent }) =>
                      `${percent ? (percent * 100).toFixed(0) : 0}%`
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
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
