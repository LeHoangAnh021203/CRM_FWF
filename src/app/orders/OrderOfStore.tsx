"use client";
import React from "react";

interface StoreOrderTableData {
  location: string;
  totalOrders: number;
  totalOrdersDelta: number | null;
  cardOrders: number;
  cardOrdersDelta: number | null;
  retailOrders: number;
  retailOrdersDelta: number | null;
  foxieOrders: number;
  foxieOrdersDelta: number | null;
  comboOrders: number;
  comboOrdersDelta: number | null;
}

interface TotalOrderSumAll {
  totalOrders: number;
  totalOrdersDelta: number;
  cardOrders: number;
  cardOrdersDelta: number;
  retailOrders: number;
  retailOrdersDelta: number;
  foxieOrders: number;
  foxieOrdersDelta: number;
  comboOrders: number;
  comboOrdersDelta: number;
}

interface OrderOfStoreProps {
  storeOrderTableData: StoreOrderTableData[];
  totalOrderSumAll: TotalOrderSumAll;
}

export default function OrderOfStore({
  storeOrderTableData,
  totalOrderSumAll,
}: OrderOfStoreProps) {
  const [isClient, setIsClient] = React.useState(false);
  
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Show loading state during SSR to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-2 sm:p-4">
        <div className="text-base sm:text-xl font-medium text-gray-700 text-center mb-4">
          Số đơn tại các cửa hàng
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200 max-h-[520px] overflow-y-auto">
          <table className="min-w-[700px] w-full text-xs sm:text-sm">
            <thead className="sticky top-0 z-10 bg-yellow-200">
              <tr className="bg-yellow-200 font-bold text-gray-900">
                <th className="px-3 py-3 text-left rounded-tl-xl">STT</th>
                <th className="px-3 py-3 text-left">Locations</th>
                <th className="px-3 py-3 text-right ">Số đơn hàng</th>
                <th className="px-3 py-3 text-right">Δ</th>
                <th className="px-3 py-3 text-right ">Đơn mua thẻ</th>
                <th className="px-3 py-3 text-right">Δ</th>
                <th className="px-3 py-3 text-right ">Đơn dịch vụ lẻ</th>
                <th className="px-3 py-3 text-right">Δ</th>
                <th className="px-3 py-3 text-right ">
                  Đơn trả bằng thẻ Foxie
                </th>
                <th className="px-3 py-3 text-right">Δ</th>
                <th className="px-3 py-3 text-right ">Đơn combo</th>
                <th className="px-3 py-3 text-right rounded-tr-xl">Δ</th>
              </tr>
            </thead>
            <tbody>
              {storeOrderTableData.map((row: StoreOrderTableData, idx: number) => (
                <tr key={row.location}>
                  <td className="px-3 py-2 text-left">{idx + 1}</td>
                  <td className="px-3 py-2 text-left">{row.location}</td>
                  <td className="px-3 py-2 text-right bg-[#f8a0ca] font-bold">-</td>
                  <td className="px-3 py-2 text-right">-</td>
                  <td className="px-3 py-2 text-right bg-[#8ed1fc]">-</td>
                  <td className="px-3 py-2 text-right">-</td>
                  <td className="px-3 py-2 text-right bg-[#fcb900]">-</td>
                  <td className="px-3 py-2 text-right">-</td>
                  <td className="px-3 py-2 text-right bg-[#a9b8c3]">-</td>
                  <td className="px-3 py-2 text-right">-</td>
                  <td className="px-3 py-2 text-right bg-[#98d8c8]">-</td>
                  <td className="px-3 py-2 text-right">-</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="sticky bottom-0 bg-gray-100 z-20">
              <tr className="font-bold">
                <td colSpan={2} className="px-3 py-2 text-left rounded-bl-xl">
                  Tổng cộng
                </td>
                <td className="px-3 py-2 text-right bg-[#f8a0ca]">-</td>
                <td className="px-3 py-2 text-right">-</td>
                <td className="px-3 py-2 text-right bg-[#8ed1fc]">-</td>
                <td className="px-3 py-2 text-right">-</td>
                <td className="px-3 py-2 text-right bg-[#fcb900]">-</td>
                <td className="px-3 py-2 text-right">-</td>
                <td className="px-3 py-2 text-right bg-[#a9b8c3]">-</td>
                <td className="px-3 py-2 text-right rounded-br-xl">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-2 sm:p-4">
      <div className="text-base sm:text-xl font-medium text-gray-700 text-center mb-4">
        Số đơn tại các cửa hàng
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 max-h-[520px] overflow-y-auto">
        <table className="min-w-[700px] w-full text-xs sm:text-sm">
          <thead className="sticky top-0 z-10 bg-yellow-200">
            <tr className="bg-yellow-200 font-bold text-gray-900">
              <th className="px-3 py-3 text-left rounded-tl-xl">STT</th>
              <th className="px-3 py-3 text-left">Locations</th>
              <th className="px-3 py-3 text-right ">Số đơn hàng</th>
              <th className="px-3 py-3 text-right">Δ</th>
              <th className="px-3 py-3 text-right ">Đơn mua thẻ</th>
              <th className="px-3 py-3 text-right">Δ</th>
              <th className="px-3 py-3 text-right ">Đơn dịch vụ lẻ</th>
              <th className="px-3 py-3 text-right">Δ</th>
              <th className="px-3 py-3 text-right ">
                Đơn trả bằng thẻ Foxie
              </th>
              <th className="px-3 py-3 text-right">Δ</th>
              <th className="px-3 py-3 text-right ">
                Đơn Combo
              </th>
              <th className="px-3 py-3 text-right rounded-tr-xl">Δ</th>
            </tr>
          </thead>
          <tbody>
            {storeOrderTableData.map((row: StoreOrderTableData, idx: number) => (
              <tr key={row.location}>
                <td className="px-3 py-2 text-left">{idx + 1}</td>
                <td className="px-3 py-2 text-left">{row.location}</td>
                <td className="px-3 py-2 text-right bg-[#f8a0ca] font-bold">
                  {row.totalOrders}
                </td>
                <td
                  className={`px-3 py-2 text-right ${
                    row.totalOrdersDelta !== null
                      ? row.totalOrdersDelta > 0
                        ? "text-green-600"
                        : row.totalOrdersDelta < 0
                        ? "text-red-500"
                        : ""
                      : ""
                  }`}
                >
                  {row.totalOrdersDelta === null
                    ? "N/A"
                    : `${row.totalOrdersDelta > 0 ? "+" : ""}${
                        row.totalOrdersDelta
                      }`}
                </td>
                <td className="px-3 py-2 text-right bg-[#8ed1fc]">
                  {row.cardOrders}
                </td>
                <td
                  className={`px-3 py-2 text-right ${
                    row.cardOrdersDelta !== null
                      ? row.cardOrdersDelta > 0
                        ? "text-green-600"
                        : row.cardOrdersDelta < 0
                        ? "text-red-500"
                        : ""
                      : ""
                  }`}
                >
                  {row.cardOrdersDelta === null
                    ? "N/A"
                    : `${row.cardOrdersDelta > 0 ? "+" : ""}${
                        row.cardOrdersDelta
                      }`}
                </td>
                <td className="px-3 py-2 text-right bg-[#fcb900]">
                  {row.retailOrders}
                </td>
                <td
                  className={`px-3 py-2 text-right ${
                    row.retailOrdersDelta !== null
                      ? row.retailOrdersDelta > 0
                        ? "text-green-600"
                        : row.retailOrdersDelta < 0
                        ? "text-red-500"
                        : ""
                      : ""
                  }`}
                >
                  {row.retailOrdersDelta === null
                    ? "N/A"
                    : `${row.retailOrdersDelta > 0 ? "+" : ""}${
                        row.retailOrdersDelta
                      }`}
                </td>
                <td className="px-3 py-2 text-right bg-[#a9b8c3]">
                  {row.foxieOrders}
                </td>
                <td
                  className={`px-3 py-2 text-right ${
                    row.foxieOrdersDelta !== null
                      ? row.foxieOrdersDelta > 0
                        ? "text-green-600"
                        : row.foxieOrdersDelta < 0
                        ? "text-red-500"
                        : ""
                      : ""
                  }`}
                >
                  {row.foxieOrdersDelta === null
                    ? "N/A"
                    : `${row.foxieOrdersDelta > 0 ? "+" : ""}${
                        row.foxieOrdersDelta
                      }`}
                </td>
                <td className="px-3 py-2 text-right bg-[#98d8c8]">
                  {row.comboOrders}
                </td>
                <td
                  className={`px-3 py-2 text-right ${
                    row.comboOrdersDelta !== null
                      ? row.comboOrdersDelta > 0
                        ? "text-green-600"
                        : row.comboOrdersDelta < 0
                        ? "text-red-500"
                        : ""
                      : ""
                  }`}
                >
                  {row.comboOrdersDelta === null
                    ? "N/A"
                    : `${row.comboOrdersDelta > 0 ? "+" : ""}${
                        row.comboOrdersDelta
                      }`}
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
                {totalOrderSumAll.totalOrders}
              </td>
              <td className="px-3 py-2 text-right">
                {totalOrderSumAll.totalOrdersDelta}
              </td>
              <td className="px-3 py-2 text-right bg-[#8ed1fc]">
                {totalOrderSumAll.cardOrders}
              </td>
              <td className="px-3 py-2 text-right">
                {totalOrderSumAll.cardOrdersDelta}
              </td>
              <td className="px-3 py-2 text-right bg-[#fcb900]">
                {totalOrderSumAll.retailOrders}
              </td>
              <td className="px-3 py-2 text-right">
                {totalOrderSumAll.retailOrdersDelta}
              </td>
              <td className="px-3 py-2 text-right bg-[#a9b8c3]">
                {totalOrderSumAll.foxieOrders}
              </td>
              <td className="px-3 py-2 text-right">
                {totalOrderSumAll.foxieOrdersDelta}
              </td>
              <td className="px-3 py-2 text-right bg-[#98d8c8]">
                {totalOrderSumAll.comboOrders}
              </td>
              <td className="px-3 py-2 text-right rounded-br-xl">
                {totalOrderSumAll.comboOrdersDelta}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}