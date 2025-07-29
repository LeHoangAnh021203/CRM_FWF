import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  LabelList,
} from "recharts";

interface OrdersChartDataPoint {
  date: string;
  orders: number;
  avgPerShop: number;
}

interface Props {
  isMobile: boolean;
  ordersChartData: OrdersChartDataPoint[];
}

const OrdersChartData: React.FC<Props> = ({ isMobile, ordersChartData }) => (
  <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-2 sm:p-4">
    <div className="text-base sm:text-xl font-medium text-gray-700 text-center mb-4">
      Số lượng đơn hàng theo ngày (-đơn mua thẻ)
    </div>
    <div className="w-full overflow-x-auto">
      <ResponsiveContainer
        width="100%"
        height={isMobile ? 320 : 400}
        minWidth={isMobile ? 600 : 700} // tăng minWidth trên mobile
      >
        <BarChart
          data={ordersChartData}
          margin={{
            top: isMobile ? 20 : 30,
            right: isMobile ? 10 : 40,
            left: isMobile ? 10 : 40,
            bottom: isMobile ? 30 : 40,
          }}
          barCategoryGap={isMobile ? 20 : 15} // tăng khoảng cách trên mobile
          barGap={isMobile ? 6 : 4}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            angle={isMobile ? -30 : -30}
            textAnchor="end"
            height={isMobile ? 50 : 60}
            tick={{ fontSize: isMobile ? 10 : 14 }}
            tickFormatter={(dateString: string) => {
              if (!dateString || typeof dateString !== "string")
                return dateString;
              if (dateString.includes("-")) {
                const d = new Date(dateString);
                if (!isNaN(d.getTime())) {
                  return `${String(d.getDate()).padStart(
                    2,
                    "0"
                  )}/${String(d.getMonth() + 1).padStart(2, "0")}`;
                }
              }
              return dateString;
            }}
          />
          <YAxis
            domain={[0, "dataMax + 200"]}
            yAxisId="left"
            orientation="left"
            tickCount={6}
            tick={{ fontSize: isMobile ? 10 : 14 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickCount={6}
            tick={{ fontSize: isMobile ? 10 : 14 }}
            domain={[0, (dataMax: number) => Math.ceil(dataMax)]}
            className="pt-10"
          />
          <Tooltip
            formatter={(value: string | number) => {
              if (typeof value === "number") {
                if (value >= 1_000_000)
                  return `${(value / 1_000_000).toFixed(1)}M`;
                return value.toLocaleString();
              }
              return value;
            }}
          />
          <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 14 }} />
          <Bar
            yAxisId="left"
            dataKey="orders"
            name="Số đơn hàng"
            fill="#f87171"
            barSize={isMobile ? 18 : 30}
          >
            <LabelList
              dataKey="orders"
              position="top"
              formatter={(value: React.ReactNode): React.ReactNode =>
                typeof value === "number" ? Math.round(value) : ""
              }
              style={{ fontSize: isMobile ? 10 : 14 }}
            />
          </Bar>
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avgPerShop"
            name="Trung bình số lượng đơn tại mỗi shop"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: isMobile ? 3 : 5, fill: "#2563eb" }}
            activeDot={{ r: isMobile ? 5 : 7 }}
            label={({ x, y, value }: { x: number; y: number; value: string | number }) => (
              <text
                x={x}
                y={y - (isMobile ? 10 : 16)}
                fill="#2563eb"
                fontWeight={600}
                fontSize={isMobile ? 10 : 14}
                textAnchor="middle"
              >
                {typeof value === "number" ? Math.round(value) : ""}
              </text>
            )}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default OrdersChartData;