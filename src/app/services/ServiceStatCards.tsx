"use client";
import React from "react";

interface ServiceSummaryData {
  totalCombo: number;
  totalLe: number;
  totalCT: number;
  totalGift: number;
  totalAll: number;
  prevCombo: number;
  prevLe: number;
  prevCT: number;
  prevGift: number;
  prevAll: number;
  comboGrowth: number;
  leGrowth: number;
  ctGrowth: number;
  giftGrowth: number;
  allGrowth: number;
}

interface ServiceStatCardsProps {
  serviceSummary: ServiceSummaryData | null;
  serviceSummaryLoading: boolean;
  serviceSummaryError: string | null;
}

function StatCard({
  title,
  value,
  delta,
  className,
  valueColor,
}: {
  title: string;
  value: number;
  delta: number | null;
  className?: string;
  valueColor?: string;
}) {
  const isUp = delta !== null && delta > 0;
  const isDown = delta !== null && delta < 0;
  return (
    <div
      className={`bg-white rounded-xl shadow p-6 flex flex-col items-center min-w-[220px] border-4 ${
        className ?? "border-gray-200"
      }`}
    >
      <div className="text-sm text-gray-700 mb-1 text-center">{title}</div>
      <div
        className={`text-4xl font-bold mb-1 text-center ${
          valueColor ?? "text-black"
        }`}
      >
        {value.toLocaleString()}
      </div>
      <div
        className={`text-lg font-semibold flex items-center gap-1 ${
          isUp ? "text-green-600" : isDown ? "text-red-500" : "text-gray-500"
        }`}
      >
        {isUp && <span>↑</span>}
        {isDown && <span>↓</span>}
        {delta === null ? "N/A" : Math.abs(delta).toLocaleString()}
      </div>
    </div>
  );
}

export default function ServiceStatCards({
  serviceSummary,
  serviceSummaryLoading,
  serviceSummaryError,
}: ServiceStatCardsProps) {
  // Fallback data nếu API chưa load
  const fallbackData = React.useMemo(() => {
    // Sử dụng dữ liệu API nếu có, ngay cả khi một số giá trị là 0
    if (serviceSummary) {
      return {
        comboThisWeek: serviceSummary.totalCombo,
        retailThisWeek: serviceSummary.totalLe,
        ctThisWeek: serviceSummary.totalCT,
        giftThisWeek: serviceSummary.totalGift,
        totalServiceThisWeek: serviceSummary.totalAll,
        deltaCombo: serviceSummary.totalCombo - serviceSummary.prevCombo,
        deltaRetail: serviceSummary.totalLe - serviceSummary.prevLe,
        deltaCT: serviceSummary.totalCT - serviceSummary.prevCT,
        deltaGift: serviceSummary.totalGift - serviceSummary.prevGift,
        deltaTotalService: serviceSummary.totalAll - serviceSummary.prevAll,
      };
    }

    // Fallback data chỉ khi không có serviceSummary
    return {
      comboThisWeek: 1629,
      retailThisWeek: 726,
      ctThisWeek: 0,
      giftThisWeek: 0,
      totalServiceThisWeek: 2355,
      deltaCombo: 100,
      deltaRetail: 50,
      deltaCT: 0,
      deltaGift: 0,
      deltaTotalService: 150,
    };
  }, [serviceSummary]);

  return (
    <>
      <div className="w-full mb-2">
        {serviceSummaryLoading && (
          <div className="text-blue-600 text-sm">🔄 Đang tải dữ liệu...</div>
        )}
        {serviceSummaryError && (
          <div className="text-red-600 text-sm">
            ❌ Lỗi API: {serviceSummaryError}
          </div>
        )}
        {serviceSummary && !serviceSummaryLoading && (
          <div className="text-green-600 text-sm">✅ Dữ liệu đã tải xong</div>
        )}
      </div>

      <div className="flex flex-col md:flex-row w-full gap-4 mb-5 mt-5">
        <StatCard
          title="Tổng Combo"
          value={fallbackData.comboThisWeek}
          delta={fallbackData.deltaCombo}
          valueColor="text-black"
          className="bg-[#33a7b5] w-full md:flex-1"
        />
        <StatCard
          title="Tổng dịch vụ lẻ"
          value={fallbackData.retailThisWeek}
          delta={fallbackData.deltaRetail}
          valueColor="text-black"
          className="bg-[#9b51e0] w-full md:flex-1"
        />
        <StatCard
          title="Tổng dịch vụ CT"
          value={fallbackData.ctThisWeek}
          delta={fallbackData.deltaCT}
          valueColor="text-black"
          className="bg-[#ee2c82] w-full md:flex-1"
        />
        <StatCard
          title="Tổng quà tặng"
          value={fallbackData.giftThisWeek}
          delta={fallbackData.deltaGift}
          valueColor="text-black"
          className="bg-[#f16a3f] w-full md:flex-1"
        />
        <StatCard
          title="Tổng dịch vụ thực hiện"
          value={fallbackData.totalServiceThisWeek}
          delta={fallbackData.deltaTotalService}
          valueColor="text-black"
          className="bg-[#7adcb4] w-full md:flex-1"
        />
      </div>
    </>
  );
}