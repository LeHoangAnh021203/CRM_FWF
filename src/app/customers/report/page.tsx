"use client";
import { DatePicker } from "@heroui/react";
import { getLocalTimeZone, today } from "@internationalized/date";
import {
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
}

interface PieDataPoint {
  name: string;
  value: number;
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
  const data: DataPoint[] = [
    { date: "1 thg 7", value: 120, value2: 100 },
    { date: "2 thg 7", value: 87, value2: 90 },
    { date: "3 thg 7", value: 73, value2: 80 },
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
    },
    {
      date: "2 thg 7",
      KHTraiNghiem: 80,
      KHThanhVien: 70,
      KHDong: 40,
      KHBac: 35,
      KHKimcuong: 50,
      KHVang: 100,
    },
    {
      date: "3 thg 7",
      KHTraiNghiem: 80,
      KHThanhVien: 70,
      KHDong: 40,
      KHBac: 35,
      KHKimcuong: 50,
      KHVang: 100,
    },
  ];

  const pieData: PieDataPoint[] = [
    { name: "Nữ", value: 69 },
    { name: "Nam", value: 31 },
  ];

  const COLORS = ["#f59794", "#9ee347"];

  return (
    <div className="">
      <div className="p-6 flex gap-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Customer Report
        </h1>
        {/* ...DatePicker code... */}
        <div className="w-full h-fit max-w-xl flex flex-row gap-4 bg-white p-2 rounded">
          <div className="w-full bg-white flex flex-col gap-1">
            <h3>Start date</h3>
            <DatePicker
              defaultValue={today(getLocalTimeZone()).subtract({ days: 1 })}
              minValue={today(getLocalTimeZone())}
            />
          </div>
          <div className="w-full flex flex-col gap-1">
            <h3>End date</h3>
            <DatePicker
              defaultValue={today(getLocalTimeZone()).add({ days: 1 })}
              maxValue={today(getLocalTimeZone())}
            />
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
              data={data}
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
                data={pieData}
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
      <div className="w-100 bg-white p-2 rounded-xl shadow-lg">
        <h2 className="text-xl text-center font-semibold text-gray-800 mb-4">
          Số khách tới chia theo loại
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={kindOfCustomer}
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
              type="monotone"
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
              type="monotone"
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
              type="monotone"
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
              type="monotone"
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
              type="monotone"
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
    </div>
  );
}
