import React, { Suspense } from "react";

interface RevenueSummaryRaw {
  totalRevenue: number;
  actualRevenue: number;
  revenueGrowth: number;
  actualGrowth: number;
}

interface OrderRevenueSummarySectionProps {
  revenueSummaryLoading: boolean;
  revenueSummaryError: string | null;
  revenueSummaryRaw: RevenueSummaryRaw | null;
}

export function OrderRevenueSummarySection({
  revenueSummaryLoading,
  revenueSummaryError,
  revenueSummaryRaw,
}: OrderRevenueSummarySectionProps) {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-pulse">
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      }
    >
      {revenueSummaryLoading ? (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-100 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="bg-gray-100 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      ) : revenueSummaryError ? (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="text-red-600 text-center">
            <p className="font-semibold">Lỗi tải dữ liệu Revenue Summary</p>
            <p className="text-sm mt-1">{revenueSummaryError}</p>
          </div>
        </div>
      ) : revenueSummaryRaw ? (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-800">
                  Tổng trả thẻ Foxie
                </h3>
                <p className="text-sm text-orange-600">
                  Tổng giá trị thẻ Foxie đã thanh toán
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-3xl font-bold text-orange-900">
                {revenueSummaryRaw.totalRevenue !== null &&
                revenueSummaryRaw.totalRevenue !== undefined
                  ? `${(revenueSummaryRaw.totalRevenue / 1000000000).toFixed(
                      1
                    )} tỷ VND`
                  : "0.0 tỷ VND"}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    revenueSummaryRaw.revenueGrowth !== null &&
                    revenueSummaryRaw.revenueGrowth !== undefined &&
                    revenueSummaryRaw.revenueGrowth >= 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {revenueSummaryRaw.revenueGrowth !== null &&
                  revenueSummaryRaw.revenueGrowth !== undefined &&
                  revenueSummaryRaw.revenueGrowth >= 0
                    ? "↗"
                    : "↘"}{" "}
                  {revenueSummaryRaw.revenueGrowth !== null &&
                  revenueSummaryRaw.revenueGrowth !== undefined
                    ? Math.abs(revenueSummaryRaw.revenueGrowth).toFixed(1)
                    : "0.0"}
                  %
                </span>
                <span className="text-sm text-orange-600">so với kỳ trước</span>
              </div>
              <div className="text-sm text-orange-700">
                💳{" "}
                {revenueSummaryRaw.totalRevenue !== null &&
                revenueSummaryRaw.totalRevenue !== undefined
                  ? revenueSummaryRaw.totalRevenue.toLocaleString("vi-VN")
                  : "0"}{" "}
                VND
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  Tổng thực thu
                </h3>
                <p className="text-sm text-green-600">
                  Tổng doanh thu thực tế đã thu về
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-3xl font-bold text-green-900">
                {revenueSummaryRaw.actualRevenue !== null &&
                revenueSummaryRaw.actualRevenue !== undefined
                  ? `${(revenueSummaryRaw.actualRevenue / 1000000000).toFixed(
                      1
                    )} tỷ VND`
                  : "0.0 tỷ VND"}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    revenueSummaryRaw.actualGrowth !== null &&
                    revenueSummaryRaw.actualGrowth !== undefined &&
                    revenueSummaryRaw.actualGrowth >= 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {revenueSummaryRaw.actualGrowth !== null &&
                  revenueSummaryRaw.actualGrowth !== undefined &&
                  revenueSummaryRaw.actualGrowth >= 0
                    ? "↗"
                    : "↘"}{" "}
                  {revenueSummaryRaw.actualGrowth !== null &&
                  revenueSummaryRaw.actualGrowth !== undefined
                    ? Math.abs(revenueSummaryRaw.actualGrowth).toFixed(1)
                    : "0.0"}
                  %
                </span>
                <span className="text-sm text-green-600">so với kỳ trước</span>
              </div>
              <div className="text-sm text-green-700">
                💰{" "}
                {revenueSummaryRaw.actualRevenue !== null &&
                revenueSummaryRaw.actualRevenue !== undefined
                  ? revenueSummaryRaw.actualRevenue.toLocaleString("vi-VN")
                  : "0"}{" "}
                VND
              </div>
            </div>
          </div>

          {!revenueSummaryLoading &&
            !revenueSummaryError &&
            revenueSummaryRaw && (
              <div className="mt-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-lg md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800">
                      Phân tích hiệu quả
                    </h3>
                    <p className="text-sm text-blue-600">
                      So sánh tỷ lệ thu thực tế và chênh lệch
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900 mb-1">
                      {revenueSummaryRaw &&
                      revenueSummaryRaw.totalRevenue !== null &&
                      revenueSummaryRaw.totalRevenue !== undefined &&
                      revenueSummaryRaw.totalRevenue > 0 &&
                      revenueSummaryRaw.actualRevenue !== null &&
                      revenueSummaryRaw.actualRevenue !== undefined
                        ? (
                            (revenueSummaryRaw.actualRevenue /
                              revenueSummaryRaw.totalRevenue) *
                            100
                          ).toFixed(1)
                        : "0.0"}
                      %
                    </div>
                    <div className="text-sm text-blue-700">
                      Tỷ lệ thu thực tế
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Thực thu / Tổng Foxie
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900 mb-1">
                      {revenueSummaryRaw &&
                      revenueSummaryRaw.actualRevenue !== null &&
                      revenueSummaryRaw.actualRevenue !== undefined &&
                      revenueSummaryRaw.totalRevenue !== null &&
                      revenueSummaryRaw.totalRevenue !== undefined
                        ? (
                            (revenueSummaryRaw.actualRevenue -
                              revenueSummaryRaw.totalRevenue) /
                            1000000000
                          ).toFixed(1)
                        : "0.0"}{" "}
                      tỷ
                    </div>
                    <div className="text-sm text-blue-700">
                      Chênh lệch thu thực tế
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Thực thu - Tổng Foxie
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900 mb-1">
                      {revenueSummaryRaw &&
                      revenueSummaryRaw.actualGrowth !== null &&
                      revenueSummaryRaw.actualGrowth !== undefined
                        ? Math.abs(revenueSummaryRaw.actualGrowth).toFixed(1)
                        : "0.0"}
                      %
                    </div>
                    <div className="text-sm text-blue-700">
                      Tăng trưởng thực thu
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      So với kỳ trước
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      ) : null}
    </Suspense>
  );
}
