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
  { key: "foxie", label: "Foxie", color: "#8d6e63" },
  { key: "cash", label: "Ti\u1ec1n m\u1eb7t", color: "#b6d47a" },
  { key: "transfer", label: "Chuy\u1ec3n kho\u1ea3n", color: "#81d4fa" },
  { key: "creditCard", label: "Qu\u1eb9t th\u1ebb", color: "#ff7f7f" },
  { key: "wallet", label: "V\u00ed", color: "#f0bf4c" },
];

const CUSTOMER_GROUPS: Array<{
  key: CustomerGroupKey;
  title: string;
  accentColor: string;
}> = [
  {
    key: "newCustomer",
    title: "Kh\u00e1ch m\u1edbi",
    accentColor: "#8d6e63",
  },
  {
    key: "oldCustomer",
    title: "Kh\u00e1ch c\u0169",
    accentColor: "#81d4fa",
  },
  {
    key: "unknownCustomer",
    title: "Kh\u00e1ch ch\u01b0a x\u00e1c \u0111\u1ecbnh",
    accentColor: "#f0bf4c",
  },
];

function normalizeMoney(value: number | null | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return value;
}

function formatMoney(value: number | null | undefined): string {
  return `${normalizeMoney(value).toLocaleString("vi-VN")}\u0111`;
}

function getCardTotal(source: PaymentRevenueCustomerStatusItem | null | undefined): number {
  return PAYMENT_LINES.reduce((sum, line) => {
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

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm sm:text-base font-semibold text-gray-800">{title}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {"5 h\u00ecnh th\u1ee9c thanh to\u00e1n"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wide text-gray-500">
              {"T\u1ed5ng doanh thu"}
            </div>
            <div className="text-base sm:text-lg font-bold" style={{ color: accentColor }}>
              {formatMoney(total)}
            </div>
          </div>
        </div>

        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
          TM/CK/QT:
          <span className="font-semibold text-gray-800">{formatMoney(nonFoxieTotal)}</span>
        </div>

        <div className="mt-4 space-y-3">
          {PAYMENT_LINES.map((line) => {
            const value = normalizeMoney(source?.[line.key]);
            const percent = getLinePercent(value, total);

            return (
              <div key={line.key}>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: line.color }}
                    />
                    {line.label}
                  </span>
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
