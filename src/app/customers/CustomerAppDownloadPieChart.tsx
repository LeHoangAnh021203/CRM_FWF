import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface PieData {
  name: string;
  value: number;
}

interface CustomerAppDownloadPieChartProps {
  loadingAppDownload: boolean;
  errorAppDownload: string | null;
  appDownloadPieData: PieData[];
  APP_CUSTOMER_PIE_COLORS: string[];
  loadingCustomerOldNewOrder: boolean;
  errorCustomerOldNewOrder: string | null;
  customerOldNewOrderPieData: PieData[];
  NEW_OLD_COLORS: string[];
}

const CustomerAppDownloadPieChart: React.FC<CustomerAppDownloadPieChartProps> = ({
  loadingAppDownload,
  errorAppDownload,
  appDownloadPieData,
  APP_CUSTOMER_PIE_COLORS,
  loadingCustomerOldNewOrder,
  errorCustomerOldNewOrder,
  customerOldNewOrderPieData,
  NEW_OLD_COLORS,
}) => (
  <div className="flex flex-col lg:flex-row gap-4 lg:gap-2">
    <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-lg mt-4 lg:mt-5">
      <div className="text-lg lg:text-xl font-medium text-gray-700 text-center pt-6 lg:pt-10">
        Tỷ lệ tải app
      </div>
      <div className="flex justify-center items-center py-4 lg:py-8">
        {loadingAppDownload ? (
          <div>Đang tải dữ liệu...</div>
        ) : errorAppDownload ? (
          <div className="text-red-500">{errorAppDownload}</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={appDownloadPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="30%"
                outerRadius="60%"
                label={({ percent }) =>
                  percent && percent > 0.05
                    ? `${(percent * 100).toFixed(0)}%`
                    : ""
                }
                labelLine={false}
              >
                {appDownloadPieData.map((entry, idx) => (
                  <Cell
                    key={entry.name}
                    fill={APP_CUSTOMER_PIE_COLORS[idx % APP_CUSTOMER_PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                wrapperStyle={{
                  paddingTop: 10,
                  paddingBottom: 10,
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  width: "100%",
                  fontSize: "11px",
                }}
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
    {/* Chart tỉ lệ khách mới/cũ */}
    <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-lg mt-4 lg:mt-5">
      <div className="text-lg lg:text-xl font-medium text-gray-700 text-center pt-6 lg:pt-10">
        Tỉ lệ khách mới/cũ
      </div>
      <div className="flex justify-center items-center py-4 lg:py-8">
        {loadingCustomerOldNewOrder ? (
          <div>Đang tải dữ liệu...</div>
        ) : errorCustomerOldNewOrder ? (
          <div className="text-red-500">{errorCustomerOldNewOrder}</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerOldNewOrderPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="30%"
                outerRadius="60%"
                label={({ percent }) =>
                  percent && percent > 0
                    ? `${(percent * 100).toFixed(0)}%`
                    : ""
                }
                labelLine={false}
              >
                {customerOldNewOrderPieData.map((entry, idx) => (
                  <Cell
                    key={entry.name}
                    fill={NEW_OLD_COLORS[idx % NEW_OLD_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                wrapperStyle={{
                  paddingTop: 10,
                  paddingBottom: 10,
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  width: "100%",
                  fontSize: "11px",
                }}
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  </div>
);

export default CustomerAppDownloadPieChart;