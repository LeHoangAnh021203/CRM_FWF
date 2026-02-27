"use client";

import React from "react";
import { createPortal } from "react-dom";
import type {
  PaymentRevenueCustomerStatusItem,
  PaymentRevenueCustomerStatusResponse,
} from "./types";

interface OrderPaymentRevenueCustomerStatusProps {
  data: PaymentRevenueCustomerStatusResponse | null;
  loading: boolean;
  error: string | null;
}

type PaymentLineKey = "foxie" | "tmCkQtGrouped" | "wallet";
type TraditionalPaymentKey = "cash" | "transfer" | "creditCard";
type CustomerGroupKey = "newCustomer" | "oldCustomer" | "unknownCustomer";

const TRADITIONAL_PAYMENT_LINES: Array<{
  key: TraditionalPaymentKey;
  label: string;
  color: string;
}> = [
  { key: "cash", label: "Tiền mặt", color: "#b6d47a" },
  { key: "transfer", label: "Chuyển khoản", color: "#81d4fa" },
  { key: "creditCard", label: "Quẹt thẻ", color: "#ff7f7f" },
];

const PAYMENT_LINES: Array<{ key: PaymentLineKey; label: string; color: string }> = [
  { key: "foxie", label: "Foxie", color: "#ef4444" },
  { key: "tmCkQtGrouped", label: "TM/CK/QT", color: "#22c55e" },
  { key: "wallet", label: "Ví", color: "#eab308" },
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

function formatPercent(value: number): string {
  return `${value.toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })}%`;
}

function getTraditionalPaymentTotal(source: PaymentRevenueCustomerStatusItem | null | undefined): number {
  const detailTotal = TRADITIONAL_PAYMENT_LINES.reduce((sum, line) => {
    return sum + normalizeMoney(source?.[line.key]);
  }, 0);

  if (detailTotal > 0) return detailTotal;
  return normalizeMoney(source?.tmCkQt);
}

function getCardTotal(source: PaymentRevenueCustomerStatusItem | null | undefined): number {
  return (
    normalizeMoney(source?.foxie) +
    getTraditionalPaymentTotal(source) +
    normalizeMoney(source?.wallet)
  );
}

function getLinePercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return (value / total) * 100;
}

function PaymentBreakdownTooltip({
  details,
}: {
  details: Array<{
    key: TraditionalPaymentKey;
    label: string;
    color: string;
    value: number;
    percent: number;
  }>;
}) {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = React.useRef<number | null>(null);

  const clearCloseTimeout = React.useCallback(() => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const updateTooltipPosition = React.useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const spacing = 10;
    const margin = 12;

    let left = triggerRect.left;
    if (left + tooltipRect.width + margin > viewportWidth) {
      left = viewportWidth - tooltipRect.width - margin;
    }
    if (left < margin) {
      left = margin;
    }

    let top = triggerRect.bottom + spacing;
    if (top + tooltipRect.height + margin > viewportHeight) {
      top = triggerRect.top - tooltipRect.height - spacing;
    }
    if (top < margin) {
      top = margin;
    }

    setPosition({ top, left });
  }, []);

  const openTooltip = React.useCallback(() => {
    clearCloseTimeout();
    setOpen(true);
  }, [clearCloseTimeout]);

  const scheduleClose = React.useCallback(() => {
    clearCloseTimeout();
    closeTimeoutRef.current = window.setTimeout(() => {
      setOpen(false);
    }, 120);
  }, [clearCloseTimeout]);

  React.useEffect(() => {
    return () => {
      clearCloseTimeout();
    };
  }, [clearCloseTimeout]);

  React.useEffect(() => {
    if (!open) return;

    updateTooltipPosition();

    const onViewportChange = () => updateTooltipPosition();
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const onClickOutside = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target)) return;
      if (tooltipRef.current?.contains(target)) return;
      setOpen(false);
    };

    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);
    document.addEventListener("keydown", onEscape);
    document.addEventListener("pointerdown", onClickOutside);

    return () => {
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
      document.removeEventListener("keydown", onEscape);
      document.removeEventListener("pointerdown", onClickOutside);
    };
  }, [open, updateTooltipPosition]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-400 bg-slate-100 text-xs font-bold leading-none text-slate-700 shadow-sm hover:border-slate-600 hover:bg-slate-700 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        onMouseEnter={openTooltip}
        onMouseLeave={scheduleClose}
        onFocus={openTooltip}
        onBlur={scheduleClose}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Chi tiết TM/CK/QT"
      >
        ?
      </button>

      {open &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-[90] w-72 max-w-[calc(100vw-1.5rem)] rounded-lg border border-gray-200 bg-white p-3 shadow-xl"
            style={{ top: position.top, left: position.left }}
            onMouseEnter={openTooltip}
            onMouseLeave={scheduleClose}
            role="tooltip"
          >
            <div className="text-xs font-semibold text-gray-700">Chi tiết TM/CK/QT</div>
            <div className="mt-2 space-y-2.5">
              {details.map((detail) => (
                <div key={detail.key}>
                  <div className="flex items-start justify-between gap-3 text-xs text-gray-700">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: detail.color }}
                      />
                      {detail.label}
                    </span>
                    <span className="text-right font-medium text-gray-800">
                      {formatMoney(detail.value)} ({formatPercent(detail.percent)})
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(100, detail.percent)}%`, backgroundColor: detail.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  );
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
  const traditionalTotal = getTraditionalPaymentTotal(source);

  const lines = PAYMENT_LINES.map((line) => {
    if (line.key === "tmCkQtGrouped") {
      return { ...line, value: traditionalTotal };
    }
    return { ...line, value: normalizeMoney(source?.[line.key]) };
  });

  const traditionalBreakdown = TRADITIONAL_PAYMENT_LINES.map((line) => {
    const value = normalizeMoney(source?.[line.key]);
    return {
      ...line,
      value,
      percent: getLinePercent(value, traditionalTotal),
    };
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="h-1 w-full rounded-t-xl" style={{ backgroundColor: accentColor }} />
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm sm:text-base font-semibold text-gray-800">{title}</div>
            <div className="text-xs text-gray-500 mt-0.5">3 nhóm thanh toán</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wide text-gray-500">Tổng doanh thu</div>
            <div className="text-base sm:text-lg font-bold" style={{ color: accentColor }}>
              {formatMoney(total)}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {lines.map((line) => {
            const value = line.value;
            const percent = getLinePercent(value, total);

            return (
              <div key={line.key}>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: line.color }}
                    />
                    {line.key === "tmCkQtGrouped" ? (
                      <span className="inline-flex items-center gap-1.5">
                        {line.label}
                        <PaymentBreakdownTooltip details={traditionalBreakdown} />
                      </span>
                    ) : (
                      line.label
                    )}
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
              {[1, 2, 3].map((line) => (
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
        Doanh thu theo hình thức thanh toán và nhóm khách hàng có phát sinh giao dịch
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 text-center">
          Lỗi tải dữ liệu: {error}
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
