"use client";

import React from "react";
import type {
  PaymentRevenueCustomerStatusItem,
  PaymentRevenueCustomerStatusResponse,
} from "./types";

interface OrderPaymentRevenueCustomerStatusProps {
  data: PaymentRevenueCustomerStatusResponse | null;
  loading: boolean;
  error: string | null;
}

type PaymentLineKey =
  | "foxie"
  | "cash"
  | "transfer"
  | "creditCard"
  | "wallet";

type CustomerGroupKey = "newCustomer" | "oldCustomer" | "unknownCustomer";

const PAYMENT_LINES: Array<{ key: PaymentLineKey; label: string; color: string }> = [
  { key: "foxie", label: "Foxie", color: "#8b5cf6" },
  { key: "cash", label: "Thực thu", color: "#0ea5e9" },
  { key: "wallet", label: "Ví", color: "#f59e0b" },
];

const CUSTOMER_GROUPS: Array<{
  key: CustomerGroupKey;
  title: string;
  accentColor: string;
}> = [
  {
    key: "newCustomer",
    title: "Khách mới",
    accentColor: "#8d6e63",
  },
  {
    key: "oldCustomer",
    title: "Khách cũ",
    accentColor: "#81d4fa",
  },
  {
    key: "unknownCustomer",
    title: "Khách chưa xác định",
    accentColor: "#f0bf4c",
  },
];

function normalizeMoney(value: number | null | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return value;
}

function formatMoney(value: number | null | undefined): string {
  return `${normalizeMoney(value).toLocaleString("vi-VN")}đ`;
}

function getCardTotal(source: PaymentRevenueCustomerStatusItem | null | undefined): number {
  return PAYMENT_LINES.reduce((sum, line) => {
    if (line.key === "cash") {
      // For "Thực thu", sum cash + transfer + creditCard
      return sum + normalizeMoney(source?.cash) + normalizeMoney(source?.transfer) + normalizeMoney(source?.creditCard);
    }
    return sum + normalizeMoney(source?.[line.key]);
  }, 0);
}

function getLinePercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return (value / total) * 100;
}

function PaymentCard({
  title,
  source,
  accentColor,
}: {
  title: string;
  source: PaymentRevenueCustomerStatusItem | null | undefined;
  accentColor: string;
}) {
  const total = getCardTotal(source);
  const nonFoxieTotal = normalizeMoney(source?.tmCkQt);
  const [showTooltip, setShowTooltip] = React.useState(false);

  const cash = normalizeMoney(source?.cash);
  const transfer = normalizeMoney(source?.transfer);
  const creditCard = normalizeMoney(source?.creditCard);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm sm:text-base font-semibold text-gray-800">{title}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              3 hình thức thanh toán
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wide text-gray-500">
              Tổng doanh thu
            </div>
            <div className="text-base sm:text-lg font-bold" style={{ color: accentColor }}>
              {formatMoney(total)}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {PAYMENT_LINES.map((line) => {
            let value = 0;
            if (line.key === "cash") {
              // For "Thực thu", sum cash + transfer + creditCard
              value = cash + transfer + creditCard;
            } else {
              value = normalizeMoney(source?.[line.key]);
            }
            const percent = getLinePercent(value, total);

            return (
              <div key={line.key}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: line.color }}
                    />
                    <span className="text-sm text-gray-600">{line.label}</span>
                    {line.key === "cash" && (
                      <div className="relative">
                        <button
                          onMouseEnter={() => setShowTooltip(true)}
                          onMouseLeave={() => setShowTooltip(false)}
                          className="ml-1 text-gray-400 hover:text-gray-600 text-xs w-4 h-4 flex items-center justify-center border border-gray-300 rounded-full hover:border-gray-500 transition-colors"
                        >
                          ?
                        </button>
                        {showTooltip && (
                          <div className="absolute bottom-full mb-2 left-0 z-10 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                            <div>Tiền mặt: {formatMoney(cash)}</div>
                            <div>Chuyển khoản: {formatMoney(transfer)}</div>
                            <div>Quẹt thẻ: {formatMoney(creditCard)}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatMoney(value)}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: line.color,
                      width: `${Math.min(100, percent)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function OrderPaymentRevenueCustomerStatus({
  data,
  loading,
  error,
}: OrderPaymentRevenueCustomerStatusProps) {
  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-2 sm:p-4">
        <div className="h-6 bg-gray-200 rounded w-[30rem] max-w-full mb-4 mx-auto animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 p-4 space-y-3 animate-pulse"
            >
              <div className="h-5 bg-gray-200 rounded w-32"></div>
              {[1, 2, 3, 4, 5].map((line) => (
                <div key={line}>
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-1.5 mt-1.5 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-2 sm:p-4">
      <div className="text-base sm:text-xl font-medium text-gray-700 text-center mb-4">
        {"Doanh thu theo hình thức thanh toán và nhóm khách hàng có phát sinh giao dịch"}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 text-center">
          {"Lỗi tải dữ liệu"}: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {CUSTOMER_GROUPS.map((group) => (
          <PaymentCard
            key={group.key}
            title={group.title}
            source={data?.[group.key]}
            accentColor={group.accentColor}
          />
        ))}
      </div>
    </div>
  );
}
