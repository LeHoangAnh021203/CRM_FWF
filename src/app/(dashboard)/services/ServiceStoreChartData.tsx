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
  LabelList,
} from "recharts";



interface ServiceStoreChartDataProps {
  shopLoading: boolean;
  shopError: string | null;
  isMobile: boolean;
  storeServiceChartData: Array<{
    store: string;
    combo: number;
    service: number;
    other?: number;
    addedon?: number;
    gifts?: number;
    foxcard?: number;
    total: number;
  }>;
}

export default function ServiceStoreChartData({
  shopLoading,
  shopError,
  isMobile,
  storeServiceChartData,
}: ServiceStoreChartDataProps) {
  return (
    <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-4">
      <div className="text-xl font-medium text-gray-700 text-center mb-4">
        Tổng dịch vụ thực hiện theo cửa hàng
      </div>
      {shopLoading && (
        <div className="text-blue-600 text-sm text-center mb-4">
          🔄 Đang tải dữ liệu cửa hàng...
        </div>
      )}
      {shopError && (
        <div className="text-red-600 text-sm text-center mb-4">
          ❌ Lỗi API cửa hàng: {shopError}
        </div>
      )}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px] md:min-w-0 ">
          <ResponsiveContainer
            width={isMobile ? 500 : "100%"}
            height={isMobile ? 800 : 800}
          >
            <BarChart
              data={storeServiceChartData}
              layout="vertical"
              margin={{
                top: 20,
                right: 30,
                left: isMobile ? 60 : 120,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : v.toString())}
                tick={{ fontSize: isMobile ? 10 : 14 }}
              />
              <YAxis
                dataKey="store"
                type="category"
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 150 : 200}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <Tooltip />
              <Legend
                wrapperStyle={{
                  fontSize: isMobile ? 10 : 14,
                }}
              />
              <Bar
                dataKey="combo"
                name="Combo"
                stackId="a"
                fill="#795548"
              />
              <Bar
                dataKey="service"
                name="Dịch vụ"
                stackId="a"
                fill="#c5e1a5"
              />
              <Bar 
                dataKey="other" 
                name="Khác" 
                stackId="a" 
                fill="#f16a3f"
              >
                <LabelList
                  dataKey="total"
                  position="right"
                  formatter={(value: React.ReactNode) => {
                    if (typeof value === "number") {
                      return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString();
                    }
                    return "";
                  }}
                  fill="#333"
                  fontSize={isMobile ? 10 : 12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}