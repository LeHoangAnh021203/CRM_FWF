import React from "react";
import CustomerNewChart from "../../CustomerNewChart";
import CustomerOldTypeTrendChart from "../../CustomerOldTypeTrendChart";
import CustomerOldStatCard from "../../CustomerOldStatCard";
import CustomerTypeTrendChart from "../../CustomerTypeTrendChart";
import CustomerSourceBarChart from "../../CustomerSourceBarChart";
import CustomerAppDownloadPieChart from "../../CustomerAppDownloadPieChart";
import CustomerAppDownloadBarChart from "../../CustomerAppDownloadBarChart";
import type { CustomerSummaryRaw, LineChartRanges } from "../../types";

interface CustomerTrendsSectionProps {
  isMobile: boolean;
  COLORS: string[];
  customerSummaryRaw: CustomerSummaryRaw | null;
  customerSummaryLoading: boolean;
  customerSummaryError: string | null;
  customerOldTypeRaw: LineChartRanges | null;
  customerOldTypeLoading: boolean;
  customerOldTypeError: string | null;
  customerOldTypeTrendData: Array<{ [key: string]: string | number }>;
  customerTypeTrendData: Array<Record<string, string | number>>;
  customerTypeKeys: string[];
  customerSourceTrendData: Array<Record<string, string | number>>;
  customerSourceKeys: string[];
  appDownloadLoading: boolean;
  appDownloadError: string | null;
  appDownloadPieData: Array<{ name: string; value: number }>;
  appDownloadStatusLoading: boolean;
  appDownloadStatusError: string | null;
  sortedAppDownloadStatusData: Record<string, string | number>[];
}

export function CustomerTrendsSection({
  isMobile,
  COLORS,
  customerSummaryRaw,
  customerSummaryLoading,
  customerSummaryError,
  customerOldTypeRaw,
  customerOldTypeLoading,
  customerOldTypeError,
  customerOldTypeTrendData,
  customerTypeTrendData,
  customerTypeKeys,
  customerSourceTrendData,
  customerSourceKeys,
  appDownloadLoading,
  appDownloadError,
  appDownloadPieData,
  appDownloadStatusLoading,
  appDownloadStatusError,
  sortedAppDownloadStatusData,
}: CustomerTrendsSectionProps) {
  return (
    <>
      <CustomerOldTypeTrendChart
        data-search-ref="customers_old_trend"
        isMobile={isMobile}
        customerTypeTrendData={customerOldTypeTrendData}
        customerTypeKeys={["Khách cũ hiện tại", "Khách cũ tháng trước"]}
        COLORS={COLORS}
      />

      <CustomerNewChart
        data-search-ref="customers_new_chart"
        loadingCustomerSummary={customerSummaryLoading}
        errorCustomerSummary={customerSummaryError}
        customerSummaryRaw={customerSummaryRaw}
      />

      <div className="mt-5">
        {(() => {
          if (customerOldTypeLoading) {
            return (
              <div className="bg-white rounded-xl shadow p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">
                    Đang tải dữ liệu khách cũ...
                  </p>
                </div>
              </div>
            );
          }

          if (customerOldTypeError) {
            return (
              <div className="bg-white rounded-xl shadow p-6">
                <div className="text-center text-red-500">
                  <p>Lỗi tải dữ liệu khách cũ: {customerOldTypeError}</p>
                </div>
              </div>
            );
          }

          if (!customerOldTypeRaw) {
            return (
              <div className="bg-white rounded-xl shadow p-6">
                <div className="text-center text-gray-500">
                  <p>Chưa có dữ liệu khách cũ</p>
                </div>
              </div>
            );
          }

          return (
            <CustomerOldStatCard
              data-search-ref="customers_old_stat"
              data={customerOldTypeRaw}
              loading={customerOldTypeLoading}
              error={customerOldTypeError}
            />
          );
        })()}
      </div>

      <CustomerTypeTrendChart
        data-search-ref="customers_type_trend"
        isMobile={isMobile}
        customerTypeTrendData={customerTypeTrendData}
        customerTypeKeys={customerTypeKeys}
        COLORS={COLORS}
      />

      <CustomerSourceBarChart
        data-search-ref="customers_source_bar"
        isMobile={isMobile}
        customerSourceTrendData={customerSourceTrendData}
        customerSourceKeys={customerSourceKeys}
        COLORS={COLORS}
      />

      <CustomerAppDownloadPieChart
        data-search-ref="customers_app_pie"
        loadingAppDownload={appDownloadLoading}
        errorAppDownload={appDownloadError}
        appDownloadPieData={appDownloadPieData}
      />

      <CustomerAppDownloadBarChart
        data-search-ref="customers_app_bar"
        isMobile={isMobile}
        loading={appDownloadStatusLoading}
        error={appDownloadStatusError}
        sortedAppDownloadStatusData={sortedAppDownloadStatusData}
      />
    </>
  );
}
