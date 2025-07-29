import React from "react";

interface OrderTotalSalesProps {
  totalWeekSales: number;
  weekSalesChange: number | null;
  totalRevenueThisWeek: number;
  weekRevenueChange: number | null;
}

function formatBillion(val: number) {
  if (!val) return "0T";
  return (val / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + "T";
}

const OrderTotalSales: React.FC<OrderTotalSalesProps> = ({
  totalWeekSales,
  weekSalesChange,
  totalRevenueThisWeek,
  weekRevenueChange,
}) => (
<div className="flex flex-col md:flex-row gap-4 mt-4">
          {/* Tổng doanh số trong tuần */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col items-center justify-center min-w-[180px]">
            <div className="text-base sm:text-xl font-medium text-gray-700 mb-2 text-center">
              Tổng doanh số
            </div>
            <div className="text-3xl sm:text-5xl font-bold text-black mb-2">
        {formatBillion(totalWeekSales)}
            </div>
            <div
              className={`flex items-center gap-1 text-lg sm:text-2xl font-semibold ${
                weekSalesChange === null
                  ? "text-gray-500"
                  : weekSalesChange > 0
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {weekSalesChange === null
                ? "N/A"
                : `${Math.abs(weekSalesChange)}%`}
            </div>
          </div>
          {/* Tổng thực thu trong tuần */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col items-center justify-center min-w-[180px]">
            <div className="text-base sm:text-xl font-medium text-gray-700 mb-2 text-center">
              Tổng thực thu
            </div>
            <div className="text-3xl sm:text-5xl font-bold text-black mb-2">
        {formatBillion(totalRevenueThisWeek)}
            </div>
            <div
              className={`flex items-center gap-1 text-lg sm:text-2xl font-semibold ${
                weekRevenueChange === null
                  ? "text-gray-500"
                  : weekRevenueChange > 0
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {weekRevenueChange === null
                ? "N/A"
                : `${Math.abs(weekRevenueChange)}%`}
            </div>
          </div>
        </div>
);

export default OrderTotalSales;