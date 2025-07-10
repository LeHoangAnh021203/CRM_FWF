"use client";
import { DatePicker } from "@heroui/react";
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
    {
      date: "1 thg 7",
      value: 120,
      value2: 100,
      type: "KH trải nghiệm",
      status: "New",
    },
    {
      date: "2 thg 7",
      value: 87,
      value2: 90,
      type: "Khách hàng Thành viên",
      status: "New",
    },
    {
      date: "3 thg 7",
      value: 73,
      value2: 80,
      type: "Khách hàng Bạc",
      status: "New",
    },
  ];

  const kindOfCustomer: MultiTypeCustomerDataPoint[] = [
    {
      date: "1 thg 7",
      KHTraiNghiem: 80,
      KHThanhVien: 70,
      KHDong: 40,
      KHBac: 35,
      KHKimcuong: 50,
      KHVang: 100,
      type: "KH trải nghiệm",
      status: "New",
    },
    {
      date: "2 thg 7",
      KHTraiNghiem: 80,
      KHThanhVien: 70,
      KHDong: 40,
      KHBac: 35,
      KHKimcuong: 50,
      KHVang: 100,
      type: "Khách hàng Thành viên",
      status: "New",
    },
    {
      date: "3 thg 7",
      KHTraiNghiem: 80,
      KHThanhVien: 70,
      KHDong: 40,
      KHBac: 35,
      KHKimcuong: 50,
      KHVang: 100,
      type: "Khách hàng Bạc",
      status: "New",
    },
  ];

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

  function filterData<T extends { type: string; status: string; date: string }>(
    data: T[],
    selectedType: string[],
    selectedStatus: string | null,
    start: CalendarDate,
    end: CalendarDate
  ): T[] {
    return data.filter((item) => {
      const matchType =
        selectedType.length === 0 || selectedType.includes(item.type);
      const matchStatus = !selectedStatus || item.status === selectedStatus;
      const itemDate = parseVNDate(item.date);
      const matchDate =
        itemDate.compare(start) >= 0 && itemDate.compare(end) <= 0;
      return matchType && matchStatus && matchDate;
    });
  }

  return (
    <div className="">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        Customer Report
      </h1>

      <div className="flex gap-6 mb-6">
        {/* ...DatePicker code... */}
        <div className="w-full h-fit max-w-xl flex flex-row gap-4 bg-white p-2 rounded z-9999">
          <div className="w-full bg-white flex flex-col gap-1 relative z-9999">
            <h3>Start date</h3>
            <DatePicker
              className="bg-white z-50"
              value={startDate}
              onChange={(val) => val && setStartDate(val)}
              maxValue={today(getLocalTimeZone())}
              minValue={undefined}
            />
          </div>
          <div className="w-full bg-white flex flex-col gap-1 relative z-9999">
            <h3>End date</h3>
            <DatePicker
              className="z-50"
              value={endDate}
              onChange={(val) => val && setEndDate(val)}
              minValue={startDate.add({ days: 1 })}
              maxValue={today(getLocalTimeZone())}
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
              {selectedType.length > 0 && <span> ({selectedType.length})</span>}
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
                endDate
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
                  endDate
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
          <div className="text-5xl font-bold text-black mb-2">3.537</div>
          <div className="flex items-center gap-1 text-green-600 text-2xl font-semibold">
            <span className="inline-block">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 4v16m0 0l-6-6m6 6l6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            24.1%
          </div>
        </div>
        {/* Tổng số khách mới thực đi */}
        <div className="flex-1 bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
          <div className="text-xl font-medium text-gray-700 mb-2 text-center">
            Tổng số khách mới thực đi
          </div>
          <div className="text-5xl font-bold text-black mb-2">3.140</div>
          <div className="flex items-center gap-1 text-green-600 text-2xl font-semibold">
            <span className="inline-block">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 4v16m0 0l-6-6m6 6l6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            30.8%
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
              endDate
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
              tickFormatter={(value) => (value > 0 ? `${value} khách` : value)}
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
        <div className="text-5xl font-bold text-black mb-2">4.928</div>
        <div className="flex items-center gap-1 text-green-600 text-2xl font-semibold">
          <span className="inline-block">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 s24">
              <path
                d="M12 20V4M12 4l-6 6M12 4l6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          930%
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
                endDate
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
      <div className="flex gap-6">
        {/* Khách hàng tải app */}

        <div className="w-full bg-white rounded-xl shadow-lg mt-5">
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
                  endDate
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

        <div className="w-30%] bg-white rounded-xl shadow-lg mt-5">
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
                <Legend />
                {/* Center label */}
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
      </div>
    </div>
  );
}
