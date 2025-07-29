import React from "react";

interface CustomerSummaryRaw {
  totalNewCustomers?: number;
  actualCustomers?: number;
}

interface CustomerNewChartProps {
  loadingCustomerSummary: boolean;
  errorCustomerSummary: string | null;
  customerSummaryRaw: CustomerSummaryRaw | null;
}

const CustomerNewChart: React.FC<CustomerNewChartProps> = ({
  loadingCustomerSummary,
  errorCustomerSummary,
  customerSummaryRaw,
}) => (
  <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-4">
    {/* Tổng số khách mới trong hệ thống */}
    <div className="flex-1 bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
      <div className="text-xl font-medium text-gray-700 mb-2 text-center">
        Tổng số khách mới trong hệ thống
      </div>
      <div className="text-5xl font-bold text-black mb-2">
        {loadingCustomerSummary ? (
          <span>Đang tải dữ liệu...</span>
        ) : errorCustomerSummary ? (
          <span className="text-red-500">{errorCustomerSummary}</span>
        ) : (
          customerSummaryRaw?.totalNewCustomers?.toLocaleString() ?? 0
        )}
      </div>
    </div>
    {/* Tổng số khách mới thực đi */}
    <div className="flex-1 bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
      <div className="text-xl font-medium text-gray-700 mb-2 text-center">
        Tổng số khách mới thực đi
      </div>
      <div className="text-5xl font-bold text-black mb-2">
        {loadingCustomerSummary ? (
          <span>Đang tải dữ liệu...</span>
        ) : errorCustomerSummary ? (
          <span className="text-red-500">{errorCustomerSummary}</span>
        ) : (
          customerSummaryRaw?.actualCustomers?.toLocaleString() ?? 0
        )}
      </div>
    </div>
  </div>
);

export default CustomerNewChart;