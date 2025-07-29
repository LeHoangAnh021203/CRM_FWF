"use client";
import React from "react";

interface StatCardProps {
  title: string;
  value: number;
  delta: number | null;
  className?: string;
  valueColor?: string;
}

function StatCard({
  title,
  value,
  delta,
  className,
  valueColor,
}: StatCardProps) {
  const isUp = delta !== null && delta > 0;
  const isDown = delta !== null && delta < 0;
  return (
    <div
      className={`bg-white rounded-xl shadow p-3 flex flex-col items-center w-full border-2 ${
        className ?? "border-gray-200"
      }`}
    >
      <div className="text-xs font-semibold text-gray-700 mb-2 text-center leading-tight">
        {title}
      </div>
      <div
        className={`text-lg sm:text-xl lg:text-2xl font-bold mb-2 text-center break-words ${
          valueColor ?? "text-black"
        }`}
      >
        {value.toLocaleString()}
      </div>
      <div
        className={`text-xs font-semibold flex items-center gap-1 ${
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

interface OrderStatCardsProps {
  totalOrdersThisWeek: number;
  deltaOrders: number;
  cardOrdersThisWeek: number;
  deltaCardOrders: number;
  retailOrdersThisWeek: number;
  deltaRetailOrders: number;
  foxieOrdersThisWeek: number;
  deltaFoxieOrders: number;
  productOrdersThisWeek: number;
  deltaProductOrders: number;
}

export default function OrderStatCards({
  totalOrdersThisWeek,
  deltaOrders,
  cardOrdersThisWeek,
  deltaCardOrders,
  retailOrdersThisWeek,
  deltaRetailOrders,
  foxieOrdersThisWeek,
  deltaFoxieOrders,
  productOrdersThisWeek,
  deltaProductOrders,
}: OrderStatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full mb-5 mt-5 sm:grid-cols-3 md:grid-cols-5">
      <StatCard
        title="Tổng đơn hàng"
        value={totalOrdersThisWeek}
        delta={deltaOrders}
        className="border-[#f8a0ca] border text-sm"
        valueColor="text-[#f8a0ca]"
      />
      <StatCard
        title="Đơn mua thẻ"
        value={cardOrdersThisWeek}
        delta={deltaCardOrders}
        className="border-[#8ed1fc] border text-sm"
        valueColor="text-[#8ed1fc]"
      />
      <StatCard
        title="Đơn dịch vụ/sản phẩm"
        value={retailOrdersThisWeek}
        delta={deltaRetailOrders}
        className="border-[#fcb900] border text-sm"
        valueColor="text-[#fcb900]"
      />
      <StatCard
        title="Đơn trả bằng thẻ Foxie"
        value={foxieOrdersThisWeek}
        delta={deltaFoxieOrders}
        className="border-[#a9b8c3] border text-sm"
        valueColor="text-[#a9b8c3]"
      />
      <StatCard
        title="Đơn mua sản phẩm"
        value={productOrdersThisWeek}
        delta={deltaProductOrders}
        className="border-[#b6d47a] border text-sm"
        valueColor="text-[#b6d47a]"
      />
    </div>
  );
}