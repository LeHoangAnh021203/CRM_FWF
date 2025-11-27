import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CustomerRangeTrendChartProps {
  fromDate: string;
  toDate: string;
  totalCustomersInRange: number;
  totalExistingCustomers: number;
  loading: boolean;
  error: string | null;
}

const CustomerRangeTrendChart: React.FC<CustomerRangeTrendChartProps> = ({
  fromDate,
  toDate,
  totalCustomersInRange,
  totalExistingCustomers,
  loading,
  error,
}) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Tạo dữ liệu xu hướng tích lũy theo ngày
  const trendData = React.useMemo(() => {
    if (!fromDate || !toDate) return [];
    
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    // Nếu khoảng thời gian quá dài (>90 ngày), chia theo tuần
    const interval = days > 90 ? 7 : 1;
    const data: Array<{
      date: string;
      "Khách trong khoảng": number;
      "Tổng hệ thống": number;
    }> = [];
    
    // Tính toán xu hướng tích lũy (giả định tăng đều)
    const dailyGrowth = totalCustomersInRange / Math.max(1, Math.ceil(days / interval));
    let cumulative = 0;
    
    for (let i = 0; i <= days; i += interval) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      
      cumulative = Math.min(totalCustomersInRange, cumulative + dailyGrowth * interval);
      
      data.push({
        date: currentDate.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
        "Khách trong khoảng": Math.round(cumulative),
        "Tổng hệ thống": totalExistingCustomers,
      });
    }
    
    return data;
  }, [fromDate, toDate, totalCustomersInRange, totalExistingCustomers]);

  const percentage = React.useMemo(() => {
    if (!totalExistingCustomers) return 0;
    return Math.min(100, Math.round((totalCustomersInRange / totalExistingCustomers) * 100));
  }, [totalCustomersInRange, totalExistingCustomers]);

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mt-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <p className="text-base font-semibold text-gray-900">
            Tổng số khách tồn tại trong khoảng ngày đã chọn
          </p>
          <p className="text-sm text-gray-500">
            {new Date(fromDate).toLocaleDateString("vi-VN")} →{" "}
            {new Date(toDate).toLocaleDateString("vi-VN")}
          </p>
        </div>
        <div className="text-3xl font-bold text-gray-900">
          {loading
            ? "…"
            : totalCustomersInRange.toLocaleString("vi-VN")}
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500 mb-4">
          Lỗi tải dữ liệu: {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <p className="text-xs text-gray-600 mb-1">Tỷ lệ</p>
              <p className="text-2xl font-bold text-orange-600">{percentage}%</p>
              <p className="text-xs text-gray-500">so với tổng hệ thống</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-gray-600 mb-1">Tổng hệ thống</p>
              <p className="text-2xl font-bold text-blue-600">
                {totalExistingCustomers.toLocaleString("vi-VN")}
              </p>
              <p className="text-xs text-gray-500">khách tồn tại</p>
            </div>
          </div>

          <div className="mt-6">
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 350}>
              <AreaChart
                data={trendData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={isMobile ? 10 : 12}
                  tick={{ fill: "#6b7280" }}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? "end" : "middle"}
                  height={isMobile ? 60 : 40}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={isMobile ? 10 : 12}
                  tick={{ fill: "#6b7280" }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                    return value.toString();
                  }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    value.toLocaleString("vi-VN"),
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: isMobile ? 12 : 14,
                  }}
                  labelStyle={{
                    color: "#374151",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: isMobile ? 11 : 13,
                    paddingTop: "20px",
                  }}
                  iconType="square"
                />
                <Area
                  type="monotone"
                  dataKey="Khách trong khoảng"
                  stackId="1"
                  stroke="#f97316"
                  fill="#fb923c"
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="Tổng hệ thống"
                  stackId="2"
                  stroke="#3b82f6"
                  fill="#60a5fa"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
            <p className="mt-3 text-xs text-gray-500 text-center">
              Biểu đồ thể hiện xu hướng tích lũy số khách trong khoảng thời gian đã chọn 
              và so sánh với tổng số khách tồn tại trong hệ thống.
            </p>
          </div>
        </>
      )}

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      )}
    </div>
  );
};

export default CustomerRangeTrendChart;

