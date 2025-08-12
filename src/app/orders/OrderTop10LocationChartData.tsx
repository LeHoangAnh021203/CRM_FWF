import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  LabelList,
} from "recharts";

interface Top10LocationData {
  name: string;
  revenue: number;
  foxie: number;
  rank?: number | null;
}

interface StoreRevenueData {
  storeName: string;
  currentOrders: number;
  deltaOrders: number;
  actualRevenue: number;
  foxieRevenue: number;
  revenueGrowth: number;
  revenuePercent: number;
  foxiePercent: number;
  orderPercent: number;
}

interface Props {
  isMobile: boolean;
  top10LocationChartData: Top10LocationData[];
  fullStoreRevenueData?: StoreRevenueData[]; // Thêm dữ liệu API cho bottom 5
  formatMoneyShort: (val: number) => string;
  totalRevenueThisWeek: number;
  percentRevenue: number | null;
  retailThisWeek: number;
  percentRetail: number | null;
  productThisWeek: number;
  percentProduct: number | null;
  cardThisWeek: number;
  percentCard: number | null;
  foxieThisWeek: number;
  percentFoxie: number | null;
  avgRevenueThisWeek: number;
  percentAvg: number | null;
}

const StatCard = ({
  title,
  value,
  delta,
  valueColor,
}: {
  title: string;
  value: number;
  delta: number | null;
  valueColor?: string;
}) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const isUp = delta !== null && delta > 0;
  const isDown = delta !== null && delta < 0;

  // Use consistent number formatting to prevent hydration mismatch
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Show loading state during SSR to prevent hydration mismatch
  if (!isClient) {
    return (
      <div
        className={`bg-white rounded-xl shadow p-3 flex flex-col items-center w-full border-2 ${
          valueColor ?? "border-gray-200"
        }`}
      >
        <div className="text-xs font-semibold text-gray-700 mb-2 text-center leading-tight">
          {title}
        </div>
        <div
          className={`text-lg sm:text-xl lg:text-2xl font-bold mb-2 text-center break-words ${
            valueColor ?? "text-black"
          }`}
        >
          -
        </div>
        <div
          className={`text-xs font-semibold flex items-center gap-1 text-gray-500`}
        >
          -
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl shadow p-3 flex flex-col items-center w-full border-2 ${
        valueColor ?? "border-gray-200"
      }`}
    >
      <div className="text-xs font-semibold text-gray-700 mb-2 text-center leading-tight">
        {title}
      </div>
      <div
        className={`text-lg sm:text-xl lg:text-2xl font-bold mb-2 text-center break-words ${
          valueColor ?? "text-black"
        }`}
      >
        {formatNumber(value)}
      </div>
      <div
        className={`text-xs font-semibold flex items-center gap-1 ${
          isUp ? "text-green-600" : isDown ? "text-red-500" : "text-gray-500"
        }`}
      >
        {isUp && <span>↑</span>}
        {isDown && <span>↓</span>}
        {delta === null ? "N/A" : formatNumber(Math.abs(delta))}
      </div>
    </div>
  );
};

const OrderTop10LocationChartData: React.FC<Props> = ({
  isMobile,
  top10LocationChartData,
  fullStoreRevenueData,
  formatMoneyShort,
  totalRevenueThisWeek,
  percentRevenue,
  retailThisWeek,
  percentRetail,
  productThisWeek,
  percentProduct,
  cardThisWeek,
  percentCard,
  foxieThisWeek,
  percentFoxie,
  avgRevenueThisWeek,
  percentAvg,
}) => {
  const [showTop10, setShowTop10] = React.useState(true);

  // Tạo dữ liệu bottom 5 trực tiếp từ API fullStoreRevenue
  // Lấy 5 stores có doanh thu thấp nhất từ tất cả stores
  const bottom5LocationChartData = React.useMemo(() => {
    if (!fullStoreRevenueData || fullStoreRevenueData.length === 0) {
      // Fallback data khi API chưa load
      return [
        { name: "Đang tải...", revenue: 0, foxie: 0, rank: 1 },
        { name: "Đang tải...", revenue: 0, foxie: 0, rank: 2 },
        { name: "Đang tải...", revenue: 0, foxie: 0, rank: 3 },
        { name: "Đang tải...", revenue: 0, foxie: 0, rank: 4 },
        { name: "Đang tải...", revenue: 0, foxie: 0, rank: 5 },
      ];
    }

    // Sắp xếp tất cả stores theo doanh thu tăng dần (thấp nhất lên đầu)
    const sortedStores = [...fullStoreRevenueData].sort(
      (a, b) => a.actualRevenue - b.actualRevenue
    );
    
    // Lấy 5 stores có doanh thu thấp nhất và giữ nguyên thứ tự tăng dần
    const bottom5 = sortedStores
      .slice(0, 5)
      .map((store, index) => ({
        name: store.storeName,
        revenue: store.actualRevenue,
        foxie: store.foxieRevenue,
        rank: index + 1,
      }));

    // Debug log để kiểm tra dữ liệu
    console.log('Full Store Revenue API Data:', fullStoreRevenueData);
    console.log('Bottom 5 Location Data (from API):', bottom5);
    
    return bottom5;
  }, [fullStoreRevenueData]);

  // Dữ liệu hiện tại dựa trên state
  const currentChartData = showTop10
    ? top10LocationChartData
    : bottom5LocationChartData;
  const currentTitle = showTop10
    ? "Top 10 cửa hàng trong tuần theo thực thu - API Data"
    : "Bottom 5 cửa hàng trong tuần theo thực thu - API Data";

  return (
    <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-2 sm:p-4">
      <div className="flex flex-col items-center mb-4">
        <div className="text-base sm:text-xl font-medium text-gray-700 text-center mb-3">
          {currentTitle}
        </div>

        {/* Nút chuyển đổi */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setShowTop10(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              showTop10
                ? "bg-white text-orange-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Top 10
          </button>
          <button
            onClick={() => setShowTop10(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              !showTop10
                ? "bg-white text-orange-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Bottom 5
          </button>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row w-full gap-4">
        <div className="flex-1 bg-white rounded-xl shadow-lg p-2 sm:p-4">
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer
              width="100%"
              height={isMobile ? 500 : 700}
              minWidth={500}
            >
              <BarChart
                layout="vertical"
                data={currentChartData}
                margin={{
                  top: 20,
                  right: isMobile ? 80 : 120,
                  left: isMobile ? 40 : 60,
                  bottom: 20,
                }}
                barCategoryGap={isMobile ? 30 : 50}
                barGap={isMobile ? 8 : 50}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={formatMoneyShort}
                  domain={[0, "auto"]}
                  tick={{ fontSize: isMobile ? 10 : 14 }}
                  allowDataOverflow={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={isMobile ? 120 : 220}
                  tick={{ fontWeight: 400, fontSize: isMobile ? 10 : 14 }}
                />
                <Tooltip formatter={formatMoneyShort} />
                <Legend
                  verticalAlign="top"
                  align="left"
                  iconType="rect"
                  className={isMobile ? "pb-5" : "pb-10"}
                  wrapperStyle={{ fontSize: isMobile ? 10 : 14 }}
                  formatter={(value: string) => <span>{value}</span>}
                />
                {showTop10 ? (
                  // Top 10: Thực thu ở dưới, Foxie ở trên
                  <>
                    <Bar
                      dataKey="revenue"
                      name="Thực thu"
                      fill="#8d6e63"
                      radius={[0, 8, 8, 0]}
                      maxBarSize={50}
                    >
                      <LabelList
                        dataKey="revenue"
                        position="right"
                        fontSize={isMobile ? 10 : 12}
                        fill="#8d6e63"
                        formatter={(value: React.ReactNode) => {
                          if (typeof value === "number" && value > 0) {
                            return (value / 1_000_000).toFixed(1) + "M";
                          }
                          return "";
                        }}
                      />
                    </Bar>
                    <Bar
                      dataKey="foxie"
                      name="Trả bằng thẻ Foxie"
                      fill="#b6d47a"
                      radius={[0, 8, 8, 0]}
                      maxBarSize={50}
                    >
                      <LabelList
                        dataKey="foxie"
                        position="right"
                        fontSize={isMobile ? 10 : 12}
                        fill="#b6d47a"
                        formatter={(value: React.ReactNode) => {
                          if (typeof value === "number" && value > 0) {
                            return (value / 1_000_000).toFixed(1) + "M";
                          }
                          return "";
                        }}
                      />
                    </Bar>
                  </>
                ) : (
                  // Bottom 5: Foxie ở trên, Thực thu ở dưới - bars to hơn
                  <>
                    <Bar
                      dataKey="foxie"
                      name="Trả bằng thẻ Foxie"
                      fill="#b6d47a"
                      radius={[0, 8, 8, 0]}
                      maxBarSize={80}
                    >
                      <LabelList
                        dataKey="foxie"
                        position="right"
                        fontSize={isMobile ? 10 : 12}
                        fill="#b6d47a"
                        formatter={(value: React.ReactNode) => {
                          if (typeof value === "number" && value > 0) {
                            return (value / 1_000_000).toFixed(1) + "M";
                          }
                          return "";
                        }}
                      />
                    </Bar>
                    <Bar
                      dataKey="revenue"
                      name="Thực thu"
                      fill="#8d6e63"
                      radius={[0, 8, 8, 0]}
                      maxBarSize={50}
                    >
                      <LabelList
                        dataKey="revenue"
                        position="right"
                        fontSize={isMobile ? 10 : 12}
                        fill="#8d6e63"
                        formatter={(value: React.ReactNode) => {
                          if (typeof value === "number" && value > 0) {
                            return (value / 1_000_000).toFixed(1) + "M";
                          }
                          return "";
                        }}
                      />
                    </Bar>
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="w-full lg:w-80 bg-white rounded-xl shadow-lg p-2 sm:p-4">
          {/* Mobile: Vertical scrollable layout */}
          <div
            className="lg:hidden max-h-56 overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#fbbf24 #f3f4f6",
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                width: 6px;
              }
              div::-webkit-scrollbar-track {
                background: #f3f4f6;
                border-radius: 3px;
              }
              div::-webkit-scrollbar-thumb {
                background: #fbbf24;
                border-radius: 3px;
              }
              div::-webkit-scrollbar-thumb:hover {
                background: #f59e0b;
              }
            `}</style>
            <div className="flex flex-col gap-3">
              <StatCard
                title="Tổng doanh thu"
                value={totalRevenueThisWeek}
                delta={percentRevenue}
                valueColor="text-[#a9b8c3]"
              />
              <StatCard
                title="Thực thu dịch vụ lẻ"
                value={retailThisWeek}
                delta={percentRetail}
                valueColor="text-[#fcb900]"
              />
              <StatCard
                title="Thực thu foxie card"
                value={productThisWeek}
                delta={percentProduct}
                valueColor="text-[#b6d47a]"
              />
              <StatCard
                title="Thực thu mua sản phẩm"
                value={cardThisWeek}
                delta={percentCard}
                valueColor="text-[#8ed1fc]"
              />
              <StatCard
                title="Tổng trả bằng thẻ Foxie"
                value={foxieThisWeek}
                delta={percentFoxie}
                valueColor="text-[#a9b8c3]"
              />
              <StatCard
                title="Trung bình thực thu mỗi ngày"
                value={avgRevenueThisWeek}
                delta={percentAvg}
                valueColor="text-[#b39ddb]"
              />
            </div>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden lg:grid lg:grid-cols-1 gap-3">
            <StatCard
              title="Tổng doanh thu"
              value={totalRevenueThisWeek}
              delta={percentRevenue}
              valueColor="text-[#a9b8c3]"
            />
            <StatCard
              title="Thực thu dịch vụ lẻ"
              value={retailThisWeek}
              delta={percentRetail}
              valueColor="text-[#fcb900]"
            />
            <StatCard
              title="Thực thu foxie card"
              value={productThisWeek}
              delta={percentProduct}
              valueColor="text-[#b6d47a]"
            />
            <StatCard
              title="Thực thu sản phẩm"
              value={cardThisWeek}
              delta={percentCard}
              valueColor="text-[#8ed1fc]"
            />
            <StatCard
              title="Tổng trả bằng thẻ Foxie"
              value={foxieThisWeek}
              delta={percentFoxie}
              valueColor="text-[#a9b8c3]"
            />
            <StatCard
              title="Trung bình thực thu mỗi ngày"
              value={avgRevenueThisWeek}
              delta={percentAvg}
              valueColor="text-[#b39ddb]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTop10LocationChartData;
