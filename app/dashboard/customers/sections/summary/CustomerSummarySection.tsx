import React, { Suspense } from "react";
import CustomerAccordionCard from "../../CustomerAccordionCard";
import CustomerNewOldSummaryTable from "../../CustomerNewOldSummaryTable";
import CustomerRangeTrendChart from "../../CustomerRangeTrendChart";
import CustomerBreakdownAnalysisChart from "../../CustomerBreakdownAnalysisChart";
import type {
  CustomerSummaryRaw,
  UniqueCustomersComparison,
} from "../../types";

interface CustomerSummarySectionProps {
  fromDate: string;
  toDate: string;
  uniqueCustomersComparisonRaw: UniqueCustomersComparison | null;
  uniqueCustomersLoading: boolean;
  uniqueCustomersError: string | null;
  customerSummaryRaw: CustomerSummaryRaw | null;
  customerSummaryLoading: boolean;
  customerSummaryError: string | null;
  totalCustomersInRange: number;
  totalExistingCustomers: number;
  rangedCustomersLoading: boolean;
  rangedCustomersError: string | null;
  rangedCustomersBreakdowns: Array<{
    label: string;
    key: string;
    rows: { label: string; value: number }[];
  }>;
}

export function CustomerSummarySection({
  fromDate,
  toDate,
  uniqueCustomersComparisonRaw,
  uniqueCustomersLoading,
  uniqueCustomersError,
  customerSummaryRaw,
  customerSummaryLoading,
  customerSummaryError,
  totalCustomersInRange,
  totalExistingCustomers,
  rangedCustomersLoading,
  rangedCustomersError,
  rangedCustomersBreakdowns,
}: CustomerSummarySectionProps) {
  return (
    <>
      <Suspense
        fallback={
          <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
            <div className="text-center">
              <div className="text-lg text-gray-700 mb-2">
                Tổng số lượt khách sử dụng dịch vụ
              </div>
              <div className="text-3xl font-bold text-gray-400">
                Đang tải dữ liệu...
              </div>
            </div>
          </div>
        }
      >
        <CustomerAccordionCard
          key={`${fromDate}-${toDate}-${Date.now()}`}
          mainValue={
            uniqueCustomersComparisonRaw?.currentTotal?.toLocaleString() ??
            "Chưa có dữ liệu"
          }
          mainLabel="Tổng số lượt khách sử dụng dịch vụ trong khoảng ngày đã chọn"
          mainPercentChange={uniqueCustomersComparisonRaw?.changePercentTotal}
          loading={uniqueCustomersLoading}
          error={uniqueCustomersError}
        />
      </Suspense>

      <div className="mt-5">
        <CustomerNewOldSummaryTable
          data-search-ref="customers_summary"
          data={customerSummaryRaw}
          loading={customerSummaryLoading}
          error={customerSummaryError}
        />
      </div>

      <CustomerRangeTrendChart
        fromDate={fromDate}
        toDate={toDate}
        totalCustomersInRange={totalCustomersInRange}
        totalExistingCustomers={totalExistingCustomers}
        loading={rangedCustomersLoading}
        error={rangedCustomersError}
      />

      {rangedCustomersBreakdowns.length > 0 && (
        <CustomerBreakdownAnalysisChart
          breakdowns={rangedCustomersBreakdowns}
          totalCustomers={totalCustomersInRange}
          loading={rangedCustomersLoading}
          error={rangedCustomersError}
        />
      )}
    </>
  );
}
