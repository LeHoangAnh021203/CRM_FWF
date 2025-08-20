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



interface ServicesRegionDataProps {
  regionLoading: boolean;
  regionError: string | null;
  isMobile: boolean;
  regionChartData: Array<{
    region: string;
    combo: number;
    service: number;
    other: number;
    total: number;
  }>;
}

export default function ServicesRegionData({
  regionLoading,
  regionError,
  isMobile,
  regionChartData,
}: ServicesRegionDataProps) {
  return (
    <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-4">
      <div className="text-xl font-medium text-gray-700 text-center mb-4">
        Tổng dịch vụ thực hiện theo khu vực
      </div>
      {regionLoading && (
        <div className="text-blue-600 text-sm text-center mb-4">
          🔄 Đang tải dữ liệu khu vực...
        </div>
      )}
      {regionError && (
        <div className="text-red-600 text-sm text-center mb-4">
          ❌ Lỗi API khu vực: {regionError}
        </div>
      )}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px] md:min-w-0 ">
          <ResponsiveContainer
            width={isMobile ? 500 : "100%"}
            height={isMobile ? 400 : 500}
          >
            <BarChart
              data={regionChartData}
              layout="vertical"
              margin={{
                top: 20,
                right: 30,
                left: isMobile ? 40 : 100,
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
                dataKey="region"
                type="category"
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 120 : 150}
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
              <Bar dataKey="other" name="Khác" stackId="a" fill="#f16a3f" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}