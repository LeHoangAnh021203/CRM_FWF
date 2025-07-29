import React from "react";

interface StoreTableRow {
  location: string;
  revenue: number;
  revenueDelta: number | null;
  foxie: number;
  foxieDelta: number | null;
  orders: number;
  ordersDelta: number | null;
  revenuePercent: number | null;
  foxiePercent: number | null;
  orderPercent: number | null;
}

interface Props {
  storeTableData: StoreTableRow[];
  avgRevenuePercent: number;
  avgFoxiePercent: number;
  avgOrderPercent: number;
  avgRevenueAll: number;
  avgRevenueDeltaAll: number;
  totalFoxieAll: number;
  totalOrdersAll: number;
  avgOrdersDeltaAll: number;
}

const OrderActualStoreSale: React.FC<Props> = ({
  storeTableData,
  avgRevenuePercent,
  avgFoxiePercent,
  avgOrderPercent,
  avgRevenueAll,
  avgRevenueDeltaAll,
  totalFoxieAll,
  totalOrdersAll,
  avgOrdersDeltaAll,
}) => (
  <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-2 sm:p-4">
    <div className="text-base sm:text-xl font-medium text-gray-700 text-center mb-4">
      Thực thu cửa hàng
    </div>
    <div className="overflow-x-auto rounded-xl border border-gray-200 max-h-[520px] overflow-y-auto w-full">
      <table className="w-full min-w-[700px] w-full text-xs sm:text-sm">
        <thead className="w-full sticky top-0 z-10 bg-yellow-200">
          <tr className="bg-yellow-200 font-bold text-gray-900">
            <th className="px-3 py-3 text-left rounded-tl-xl">STT</th>
            <th className="px-3 py-3 text-left">Locations</th>
            <th className="px-3 py-3 text-right">Thực thu</th>
            <th className="px-3 py-3 text-right">% Δ</th>
            <th className="px-3 py-3 text-right">% Tổng thực thu</th>
            <th className="px-3 py-3 text-right">Tổng trả thẻ Foxie</th>
            <th className="px-3 py-3 text-right">% Δ</th>
            <th className="px-3 py-3 text-right">Số đơn hàng</th>
            <th className="px-3 py-3 text-right">% Δ</th>
            <th className="px-3 py-3 text-right rounded-tr-xl">
              % Tổng đơn hàng
            </th>
          </tr>
        </thead>
        <tbody>
          {storeTableData.map((row, idx) => (
            <tr key={row.location}>
              <td className="px-3 py-2 text-left">{idx + 1}</td>
              <td className="px-3 py-2 text-left">{row.location}</td>
              <td className="px-3 py-2 text-right bg-[#f8a0ca] font-bold">
                {row.revenue.toLocaleString()}
              </td>
              <td
                className={`px-3 py-2 text-right ${
                  row.revenueDelta !== null
                    ? row.revenueDelta > 0
                      ? "text-green-600"
                      : row.revenueDelta < 0
                      ? "text-red-500"
                      : ""
                    : ""
                }`}
              >
                {row.revenueDelta === null
                  ? "N/A"
                  : `${row.revenueDelta.toFixed(1)}%`}
              </td>
              <td
                className={`px-3 py-2 text-right bg-[#f8a0ca] ${
                  row.revenuePercent !== null
                    ? row.revenuePercent >= avgRevenuePercent
                      ? "text-green-600 font-bold"
                      : "text-red-500 font-bold"
                    : ""
                }`}
              >
                {row.revenuePercent !== null
                  ? `${row.revenuePercent.toFixed(2)}%`
                  : "N/A"}
              </td>
              <td className="px-3 py-2 text-right bg-[#8ed1fc]">
                {row.foxie.toLocaleString()}
              </td>
              <td
                className={`px-3 py-2 text-right bg-[#8ed1fc] ${
                  row.foxiePercent !== null
                    ? row.foxiePercent >= avgFoxiePercent
                      ? "text-green-600 font-bold"
                      : "text-red-500 font-bold"
                    : ""
                }`}
              >
                {row.foxiePercent !== null
                  ? `${row.foxiePercent.toFixed(2)}%`
                  : "N/A"}
              </td>
              <td className="px-3 py-2 text-right bg-[#a9b8c3]">
                {row.orders}
              </td>
              <td
                className={`px-3 py-2 text-right ${
                  row.ordersDelta !== null
                    ? row.ordersDelta > 0
                      ? "text-green-600"
                      : row.ordersDelta < 0
                      ? "text-red-500"
                      : ""
                    : ""
                }`}
              >
                {row.ordersDelta === null
                  ? "N/A"
                  : `${row.ordersDelta.toFixed(1)}%`}
              </td>
              <td
                className={`px-3 py-2 text-right bg-[#a9b8c3] ${
                  row.orderPercent !== null
                    ? row.orderPercent >= avgOrderPercent
                      ? "text-green-600 font-bold"
                      : "text-red-500 font-bold"
                    : ""
                }`}
              >
                {row.orderPercent !== null
                  ? `${row.orderPercent.toFixed(2)}%`
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="sticky bottom-0 bg-gray-100 z-20">
          <tr className="font-bold">
            <td colSpan={2} className="px-3 py-2 text-left rounded-bl-xl">
              Tổng cộng
            </td>
            <td className="px-3 py-2 text-right bg-[#f8a0ca]">
              {avgRevenueAll.toLocaleString()}
            </td>
            <td
              className={`px-3 py-2 text-right ${
                avgRevenueDeltaAll > 0
                  ? "text-green-600"
                  : avgRevenueDeltaAll < 0
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {avgRevenueDeltaAll > 0 ? "+" : ""}
              {avgRevenueDeltaAll.toFixed(1)}%
            </td>
            <td className="px-3 py-2 text-right bg-[#f8a0ca] text-green-600 font-bold">
              {avgRevenuePercent.toFixed(2)}%
            </td>
            <td className="px-3 py-2 text-right bg-[#8ed1fc]">
              {totalFoxieAll.toLocaleString()}
            </td>
            <td className="px-3 py-2 text-right bg-[#8ed1fc] text-green-600 font-bold">
              {avgFoxiePercent.toFixed(2)}%
            </td>
            <td className="px-3 py-2 text-right bg-[#a9b8c3]">
              {totalOrdersAll.toLocaleString()}
            </td>
            <td
              className={`px-3 py-2 text-right ${
                avgOrdersDeltaAll > 0
                  ? "text-green-600"
                  : avgOrdersDeltaAll < 0
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {avgOrdersDeltaAll > 0 ? "+" : ""}
              {avgOrdersDeltaAll.toFixed(1)}%
            </td>
            <td className="px-3 py-2 text-right bg-[#a9b8c3] text-green-600 font-bold rounded-br-xl">
              {avgOrderPercent.toFixed(2)}%
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
);

export default OrderActualStoreSale;