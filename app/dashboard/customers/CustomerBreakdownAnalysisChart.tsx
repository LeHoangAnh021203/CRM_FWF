import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface BreakdownData {
  label: string;
  key: string;
  rows: { label: string; value: number }[];
}

interface CustomerBreakdownAnalysisChartProps {
  breakdowns: BreakdownData[];
  totalCustomers: number;
  loading: boolean;
  error: string | null;
}

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
];

const CustomerBreakdownAnalysisChart: React.FC<CustomerBreakdownAnalysisChartProps> = ({
  breakdowns,
  totalCustomers,
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

  // Tạo dữ liệu cho biểu đồ - kết hợp tất cả breakdowns
  const chartData = React.useMemo(() => {
    if (breakdowns.length === 0) return [];

    // Lấy breakdown đầu tiên làm base (thường là trạng thái hoặc loại)
    const baseBreakdown = breakdowns[0];
    if (!baseBreakdown || baseBreakdown.rows.length === 0) return [];

    return baseBreakdown.rows.slice(0, 8).map((row) => {
      const dataPoint: Record<string, string | number> = {
        name: row.label.length > 15 ? row.label.substring(0, 15) + "..." : row.label,
        fullName: row.label,
        "Số lượng": row.value,
        "Tỷ lệ": totalCustomers > 0 ? Math.round((row.value / totalCustomers) * 100) : 0,
      };

      // Thêm các breakdown khác nếu có
      breakdowns.slice(1, 3).forEach((bd) => {
        const matchingRow = bd.rows.find((r) => 
          r.label.toLowerCase().includes(row.label.toLowerCase()) ||
          row.label.toLowerCase().includes(r.label.toLowerCase())
        );
        if (matchingRow) {
          dataPoint[bd.label] = matchingRow.value;
        }
      });

      return dataPoint;
    });
  }, [breakdowns, totalCustomers]);

  if (loading) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mt-5">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mt-5">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mt-5">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Chưa có dữ liệu để phân tích</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mt-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Phân tích đa chiều khách hàng
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          So sánh số lượng và tỷ lệ theo {breakdowns[0]?.label.toLowerCase() || "danh mục"}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
        <ComposedChart
          data={chartData}
          margin={{
            top: 20,
            right: 20,
            left: 0,
            bottom: isMobile ? 60 : 40,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            angle={isMobile ? -45 : -30}
            textAnchor="end"
            height={isMobile ? 80 : 60}
            fontSize={isMobile ? 10 : 12}
            stroke="#6b7280"
            tick={{ fill: "#6b7280" }}
          />
          <YAxis
            yAxisId="left"
            stroke="#6b7280"
            fontSize={isMobile ? 10 : 12}
            tick={{ fill: "#6b7280" }}
            tickFormatter={(value) => {
              if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
              return value.toString();
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#f97316"
            fontSize={isMobile ? 10 : 12}
            tick={{ fill: "#f97316" }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            formatter={(value: number | string, name: string) => {
              if (name === "Tỷ lệ") {
                return [`${value}%`, "Tỷ lệ (%)"];
              }
              const formatted =
                typeof value === "number"
                  ? value.toLocaleString("vi-VN")
                  : value;
              return [formatted, name];
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullName || label;
              }
              return label;
            }}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: isMobile ? 12 : 14,
            }}
          />
          <Legend
            wrapperStyle={{
              fontSize: isMobile ? 11 : 13,
              paddingTop: "10px",
            }}
          />
          <Bar
            yAxisId="left"
            dataKey="Số lượng"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="Tỷ lệ"
            stroke="#f97316"
            strokeWidth={3}
            dot={{ fill: "#f97316", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        {breakdowns.slice(0, 3).map((bd) => (
          <div key={bd.label} className="bg-gray-50 rounded-lg p-2">
            <p className="text-gray-600 font-medium">{bd.label}</p>
            <p className="text-gray-900 font-bold text-sm mt-1">
              {bd.rows.length} danh mục
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerBreakdownAnalysisChart;
