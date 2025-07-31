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

interface PaymentRegionDataItem {
  region: string;
  bank: number;
  cash: number;
  card: number;
}

interface OrderPaymentRegionDataProps {
  paymentRegionData: PaymentRegionDataItem[];
  isMobile: boolean;
}

export default function OrderPaymentRegionData({
  paymentRegionData,
  isMobile,
}: OrderPaymentRegionDataProps) {


  return (
    <div className="w-full bg-white rounded-xl shadow-lg mt-8 p-4 sm:p-6">
      <div className="text-base sm:text-2xl font-semibold text-gray-800 mb-4">
        Hình thức thanh toán theo vùng
      </div>
      <div className="w-full overflow-x-auto">
        <ResponsiveContainer
          width="100%"
          height={isMobile ? 250 : 350}
          minWidth={320}
        >
          <BarChart
            data={paymentRegionData}
            margin={{
              top: 20,
              right: isMobile ? 20 : 40,
              left: isMobile ? 20 : 40,
              bottom: 20,
            }}
            barCategoryGap={isMobile ? 10 : 20}
            barGap={isMobile ? 4 : 8}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="region"
              tick={{ fontSize: isMobile ? 10 : 14 }}
            />
            <YAxis
              tickFormatter={(v: number | string) => {
                if (typeof v === "number" && v >= 1_000_000)
                  return (v / 1_000_000).toFixed(1) + "M";
                if (typeof v === "number") return v.toLocaleString();
                return v;
              }}
              tick={{ fontSize: isMobile ? 10 : 14 }}
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
            <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 14 }} />
            <Bar
              dataKey="bank"
              name="Chuyển khoản"
              fill="#795548"
              barSize={40}
            >
              <LabelList
                dataKey="bank"
                position="top"
                formatter={(value: React.ReactNode) => {
                  if (typeof value === "number") {
                    // Tìm khu vực hiện tại từ dữ liệu
                    const currentDataPoint = paymentRegionData.find(item => item.bank === value);
                    if (currentDataPoint) {
                      const maxValue = Math.max(currentDataPoint.bank, currentDataPoint.cash, currentDataPoint.card);
                      return value === maxValue && value > 0 ? (value / 1_000_000).toFixed(1) + "M" : "";
                    }
                  }
                  return "";
                }}
                fill="#795548"
                fontSize={isMobile ? 10 : 12}
              />
            </Bar>
            <Bar dataKey="cash" name="Tiền mặt" fill="#c5e1a5" barSize={40}>
              <LabelList
                dataKey="cash"
                position="top"
                formatter={(value: React.ReactNode) => {
                  if (typeof value === "number") {
                    // Tìm khu vực hiện tại từ dữ liệu
                    const currentDataPoint = paymentRegionData.find(item => item.cash === value);
                    if (currentDataPoint) {
                      const maxValue = Math.max(currentDataPoint.bank, currentDataPoint.cash, currentDataPoint.card);
                      return value === maxValue && value > 0 ? (value / 1_000_000).toFixed(1) + "M" : "";
                    }
                  }
                  return "";
                }}
                fill="#c5e1a5"
                fontSize={isMobile ? 10 : 12}
              />
            </Bar>
            <Bar
              dataKey="card"
              name="Thẻ tín dụng/Ghi nợ"
              fill="#ff7f7f"
              barSize={40}
            >
              <LabelList
                dataKey="card"
                position="top"
                formatter={(value: React.ReactNode) => {
                  if (typeof value === "number") {
                    // Tìm khu vực hiện tại từ dữ liệu
                    const currentDataPoint = paymentRegionData.find(item => item.card === value);
                    if (currentDataPoint) {
                      const maxValue = Math.max(currentDataPoint.bank, currentDataPoint.cash, currentDataPoint.card);
                      return value === maxValue && value > 0 ? (value / 1_000_000).toFixed(1) + "M" : "";
                    }
                  }
                  return "";
                }}
                fill="#ff7f7f"
                fontSize={isMobile ? 10 : 12}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}