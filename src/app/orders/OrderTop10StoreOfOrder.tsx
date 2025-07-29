"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartOrderData {
  name: string;
  totalOrders: number;
  retailOrders: number;
  cardOrders: number;
  foxieOrders: number;
}

interface OrderTop10StoreOfOrderProps {
  chartOrderData: ChartOrderData[];
  isMobile: boolean;
}

export default function OrderTop10StoreOfOrder({
  chartOrderData,
  isMobile,
}: OrderTop10StoreOfOrderProps) {
  return (
    <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-2 sm:p-4">
      <div className="text-base sm:text-xl font-medium text-gray-700 text-center mb-4">
        Top 10 cửa hàng theo đơn hàng
      </div>
      <div className="w-full overflow-x-auto">
        <ResponsiveContainer
          width="100%"
          height={isMobile ? 300 : 400}
          minWidth={320}
        >
          <BarChart
            layout="vertical"
            data={chartOrderData}
            margin={{
              top: 20,
              right: isMobile ? 30 : 50,
              left: isMobile ? 30 : 50,
              bottom: 20,
            }}
            barCategoryGap={isMobile ? 8 : 15}
            barGap={isMobile ? 3 : 6}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey="name"
              width={isMobile ? 80 : 140}
              tick={{ fontWeight: 400, fontSize: isMobile ? 10 : 14 }}
            />
            <Tooltip
              formatter={(value: number | string) => {
                if (typeof value === "number") {
                  if (value >= 1_000_000)
                    return `${(value / 1_000_000).toFixed(1)}M`;
                  return value.toLocaleString();
                }
                return value;
              }}
            />
            <Legend
              wrapperStyle={{
                display: isMobile ? "none" : "flex",
                paddingTop: isMobile ? 5 : 10,
                paddingBottom: isMobile ? 5 : 10,
                fontSize: isMobile ? 10 : 14,
                justifyContent: "center",
                flexWrap: "wrap",
                width: "100%",
              }}
            />
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
    </div>
  );
}