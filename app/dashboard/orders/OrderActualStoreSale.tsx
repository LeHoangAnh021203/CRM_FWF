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
  revenueRank?: number;
  foxieRank?: number;
  ordersRank?: number;
  revenueLastMonth?: number;
  foxieLastMonth?: number;
  ordersLastMonth?: number;
  revenueRankLastMonth?: number;
  foxieRankLastMonth?: number;
  ordersRankLastMonth?: number;
}

interface Props {
  storeTableData: StoreTableRow[];
  avgRevenuePercent: number;
  avgFoxiePercent: number;
  avgOrderPercent: number;
}

const OrderActualStoreSale: React.FC<Props> = ({
  storeTableData,
  avgRevenuePercent,
  avgFoxiePercent,
}) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Tính toán thứ hạng cho từng chi nhánh
  const calculateRanks = (data: StoreTableRow[]) => {
    // Tính dữ liệu tháng trước
    const dataWithLastMonth = data.map((store) => {
      // Tính revenue tháng trước
      let revenueLastMonth = store.revenue;
      if (store.revenueDelta !== null) {
        const percentChange = store.revenueDelta / 100;
        revenueLastMonth = store.revenue / (1 + percentChange);
      }

      // Tính foxie tháng trước
      let foxieLastMonth = store.foxie;
      if (store.foxieDelta !== null) {
        if (Math.abs(store.foxieDelta) <= 1000) {
          const percentChange = store.foxieDelta / 100;
          foxieLastMonth = store.foxie / (1 + percentChange);
        } else {
          foxieLastMonth = store.foxie - store.foxieDelta;
        }
      } else if (store.revenueDelta !== null) {
        const revenuePercentChange = store.revenueDelta / 100;
        foxieLastMonth = store.foxie / (1 + revenuePercentChange);
      }

      // Tính orders tháng trước
      let ordersLastMonth = store.orders;
      if (store.ordersDelta !== null) {
        const percentChange = store.ordersDelta / 100;
        ordersLastMonth = store.orders / (1 + percentChange);
      }

      return {
        ...store,
        revenueLastMonth,
        foxieLastMonth,
        ordersLastMonth,
      };
    });

    // Sắp xếp theo revenue tháng này (giảm dần)
    const revenueSorted = [...dataWithLastMonth].sort(
      (a, b) => b.revenue - a.revenue
    );
    const revenueRanks = new Map<string, number>();
    revenueSorted.forEach((store, index) => {
      revenueRanks.set(store.location, index + 1);
    });

    // Sắp xếp theo revenue tháng trước (giảm dần)
    const revenueLastMonthSorted = [...dataWithLastMonth].sort(
      (a, b) => b.revenueLastMonth! - a.revenueLastMonth!
    );
    const revenueRanksLastMonth = new Map<string, number>();
    revenueLastMonthSorted.forEach((store, index) => {
      revenueRanksLastMonth.set(store.location, index + 1);
    });

    // Sắp xếp theo foxie tháng này (giảm dần)
    const foxieSorted = [...dataWithLastMonth].sort(
      (a, b) => b.foxie - a.foxie
    );
    const foxieRanks = new Map<string, number>();
    foxieSorted.forEach((store, index) => {
      foxieRanks.set(store.location, index + 1);
    });

    // Sắp xếp theo foxie tháng trước (giảm dần)
    const foxieLastMonthSorted = [...dataWithLastMonth].sort(
      (a, b) => b.foxieLastMonth! - a.foxieLastMonth!
    );
    const foxieRanksLastMonth = new Map<string, number>();
    foxieLastMonthSorted.forEach((store, index) => {
      foxieRanksLastMonth.set(store.location, index + 1);
    });

    // Sắp xếp theo orders tháng này (giảm dần)
    const ordersSorted = [...dataWithLastMonth].sort(
      (a, b) => b.orders - a.orders
    );
    const ordersRanks = new Map<string, number>();
    ordersSorted.forEach((store, index) => {
      ordersRanks.set(store.location, index + 1);
    });

    // Sắp xếp theo orders tháng trước (giảm dần)
    const ordersLastMonthSorted = [...dataWithLastMonth].sort(
      (a, b) => b.ordersLastMonth! - a.ordersLastMonth!
    );
    const ordersRanksLastMonth = new Map<string, number>();
    ordersLastMonthSorted.forEach((store, index) => {
      ordersRanksLastMonth.set(store.location, index + 1);
    });

    // Thêm thứ hạng vào data
    return dataWithLastMonth.map((store) => ({
      ...store,
      revenueRank: revenueRanks.get(store.location),
      foxieRank: foxieRanks.get(store.location),
      ordersRank: ordersRanks.get(store.location),
      revenueRankLastMonth: revenueRanksLastMonth.get(store.location),
      foxieRankLastMonth: foxieRanksLastMonth.get(store.location),
      ordersRankLastMonth: ordersRanksLastMonth.get(store.location),
    }));
  };

  const rankedData = calculateRanks(storeTableData);

  // Use consistent number formatting to prevent hydration mismatch
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Tính toán tổng thực tế
  const totalRevenue = rankedData.reduce(
    (sum, store) => sum + store.revenue,
    0
  );
  const totalFoxie = rankedData.reduce((sum, store) => sum + store.foxie, 0);
  const totalOrders = rankedData.reduce((sum, store) => sum + store.orders, 0);

  // Tính tổng tháng trước để so sánh với tổng tháng này
  // Giả sử dữ liệu từ API đã có sẵn thông tin tháng trước
  // Hoặc cần tính từ dữ liệu gốc

  // Tính tổng tháng trước (giả lập từ dữ liệu hiện tại)
  // Trong thực tế, cần lấy dữ liệu tháng trước từ API
  const totalRevenueLastMonth = rankedData.reduce((sum, store) => {
    // Giả sử revenueDelta là % thay đổi, tính ngược lại để có giá trị tháng trước
    if (store.revenueDelta !== null) {
      const currentRevenue = store.revenue;
      const percentChange = store.revenueDelta / 100;
      const lastMonthRevenue = currentRevenue / (1 + percentChange);
      return sum + lastMonthRevenue;
    }
    return sum + store.revenue; // Nếu không có delta, giả sử không thay đổi
  }, 0);

  const totalFoxieLastMonth = rankedData.reduce((sum, store) => {
    if (store.foxieDelta !== null) {
      // Nếu foxieDelta là phần trăm thay đổi
      if (Math.abs(store.foxieDelta) <= 1000) {
        // Giả sử phần trăm thay đổi < 1000%
        const currentFoxie = store.foxie;
        const percentChange = store.foxieDelta / 100;
        const lastMonthFoxie = currentFoxie / (1 + percentChange);
        return sum + lastMonthFoxie;
      } else {
        // Nếu foxieDelta là số lượng thay đổi
        return sum + (store.foxie - store.foxieDelta);
      }
    }
    // Nếu không có foxieDelta, tính dựa trên revenueDelta (vì Foxie thường tỷ lệ với revenue)
    if (store.revenueDelta !== null) {
      const currentFoxie = store.foxie;
      const revenuePercentChange = store.revenueDelta / 100;
      const lastMonthFoxie = currentFoxie / (1 + revenuePercentChange);
      return sum + lastMonthFoxie;
    }
    return sum + store.foxie;
  }, 0);

  const totalOrdersLastMonth = rankedData.reduce((sum, store) => {
    if (store.ordersDelta !== null) {
      const currentOrders = store.orders;
      const percentChange = store.ordersDelta / 100;
      const lastMonthOrders = currentOrders / (1 + percentChange);
      return sum + lastMonthOrders;
    }
    return sum + store.orders;
  }, 0);

  // Tính phần trăm thay đổi tổng thể
  const totalRevenueDelta =
    totalRevenueLastMonth > 0
      ? ((totalRevenue - totalRevenueLastMonth) / totalRevenueLastMonth) * 100
      : 0;

  const totalFoxieDelta =
    totalFoxieLastMonth > 0
      ? ((totalFoxie - totalFoxieLastMonth) / totalFoxieLastMonth) * 100
      : totalFoxie > 0
      ? 100
      : 0;

  const totalOrderDelta =
    totalOrdersLastMonth > 0
      ? ((totalOrders - totalOrdersLastMonth) / totalOrdersLastMonth) * 100
      : 0;

  // Show loading state during SSR to prevent hydration mismatch
  if (!isClient) {
    return (
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
                <th className="px-3 py-3 text-right">% Tỉ trọng</th>
                <th className="px-3 py-3 text-right">Hạng</th>
                <th className="px-3 py-3 text-right">Tổng trả thẻ Foxie</th>
                <th className="px-3 py-3 text-right">% Δ</th>
                <th className="px-3 py-3 text-right">Hạng</th>
                <th className="px-3 py-3 text-right">Số đơn hàng</th>
                <th className="px-3 py-3 text-right">% Δ</th>
                <th className="px-3 py-3 text-right rounded-tr-xl">Hạng</th>
              </tr>
            </thead>
            <tbody>
              {rankedData.map((row, idx) => (
                <tr key={row.location}>
                  <td className="px-3 py-2 text-left">{idx + 1}</td>
                  <td className="px-3 py-2 text-left">{row.location}</td>
                  <td className="px-3 py-2 text-right bg-[#f8a0ca] font-bold">
                    -
                  </td>
                  <td className="px-3 py-2 text-right">-</td>
                  <td className="px-3 py-2 text-right">-</td>
                  <td className="px-3 py-2 text-right bg-yellow-100 font-bold">
                    -
                  </td>
                  <td className="px-3 py-2 text-right bg-[#8ed1fc]">-</td>
                  <td className="px-3 py-2 text-right">-</td>
                  <td className="px-3 py-2 text-right bg-yellow-100 font-bold">
                    -
                  </td>
                  <td className="px-3 py-2 text-right bg-[#a9b8c3]">-</td>
                  <td className="px-3 py-2 text-right">-</td>
                  <td className="px-3 py-2 text-right bg-yellow-100 font-bold">
                    -
                  </td>
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
                <td className="px-3 py-2 text-right  text-green-600 font-bold">
                  -
                </td>
                <td className="px-3 py-2 text-right bg-yellow-100">-</td>
                <td className="px-3 py-2 text-right bg-[#8ed1fc]">-</td>
                <td className="px-3 py-2 text-right  text-green-600 font-bold">
                  -
                </td>
                <td className="px-3 py-2 text-right bg-yellow-100">-</td>
                <td className="px-3 py-2 text-right bg-[#a9b8c3]">-</td>
                <td className="px-3 py-2 text-right">-</td>
                <td className="px-3 py-2 text-right text-green-600 font-bold rounded-br-xl">
                  -
                </td>
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
              <th className="px-3 py-3 text-right">% Tỉ trọng</th>
              <th className="px-3 py-3 text-right">Hạng</th>
              <th className="px-3 py-3 text-right">Tổng trả thẻ Foxie</th>
              <th className="px-3 py-3 text-right">% Δ</th>
              <th className="px-3 py-3 text-right">Hạng</th>
              <th className="px-3 py-3 text-right">Số đơn hàng</th>
              <th className="px-3 py-3 text-right">% Δ</th>
              <th className="px-3 py-3 text-right rounded-tr-xl">Hạng</th>
            </tr>
          </thead>
          <tbody>
            {rankedData.map((row, idx) => (
              <tr key={row.location}>
                <td className="px-3 py-2 text-left">{idx + 1}</td>
                <td className="px-3 py-2 text-left">{row.location}</td>
                <td className="px-3 py-2 text-right bg-[#f8a0ca] font-bold">
                  {formatNumber(row.revenue)}
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
                  className={`px-3 py-2 text-right  ${
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
                <td className="px-3 py-2 text-right bg-yellow-100 font-bold">
                  {row.revenueRank} ({row.revenueRankLastMonth})
                </td>
                <td className="px-3 py-2 text-right bg-[#8ed1fc]">
                  {formatNumber(row.foxie)}
                </td>
                <td
                  className={`px-3 py-2 text-right  ${
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
                <td className="px-3 py-2 text-right bg-yellow-100 font-bold">
                  {row.foxieRank} ({row.foxieRankLastMonth})
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
                <td className="px-3 py-2 text-right bg-yellow-100 font-bold">
                  {row.ordersRank} ({row.ordersRankLastMonth})
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
                {formatNumber(totalRevenue)}
              </td>
              <td
                className={`px-3 py-2 text-right ${
                  totalRevenueDelta > 0
                    ? "text-green-600"
                    : totalRevenueDelta < 0
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {totalRevenueDelta > 0 ? "+" : ""}
                {totalRevenueDelta.toFixed(1)}%
              </td>
              <td className="px-3 py-2 text-right  text-green-600 font-bold">
                100.00%
              </td>
              <td className="px-3 py-2 text-right bg-yellow-100">-</td>
              <td className="px-3 py-2 text-right bg-[#8ed1fc]">
                {formatNumber(totalFoxie)}
              </td>
              <td className="px-3 py-2 text-right  text-green-600 font-bold">
                {totalFoxieDelta > 0 ? "+" : ""}
                {totalFoxieDelta.toFixed(1)}%
              </td>
              <td className="px-3 py-2 text-right bg-yellow-100">-</td>
              <td className="px-3 py-2 text-right bg-[#a9b8c3]">
                {formatNumber(totalOrders)}
              </td>
              <td
                className={`px-3 py-2 text-right ${
                  totalOrderDelta > 0
                    ? "text-green-600"
                    : totalOrderDelta < 0
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {totalOrderDelta > 0 ? "+" : ""}
                {totalOrderDelta.toFixed(1)}%
              </td>
              <td className="px-3 py-2 text-right  text-green-600 font-bold">
                -
              </td>
              <td className="px-3 py-2 text-right bg-orange-100 rounded-br-xl">
                -
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default OrderActualStoreSale;
