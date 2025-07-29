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
} from "recharts";
import { Props as LabelProps } from "recharts/types/component/Label";

interface Top10LocationData {
  name: string;
  revenue: number;
  foxie: number;
  rank?: number | null;
}

interface Props {
  isMobile: boolean;
  top10LocationChartData: Top10LocationData[];
  formatMoneyShort: (val: number) => string;
  renderBarLabel: (props: LabelProps) => React.ReactNode;
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

const StatCard = ({ title, value, delta, valueColor }: { title: string; value: number; delta: number | null; valueColor?: string }) => {
  const isUp = delta !== null && delta > 0;
  const isDown = delta !== null && delta < 0;
  return (
    <div className={`bg-white rounded-xl shadow p-3 flex flex-col items-center w-full border-2 ${valueColor ?? "border-gray-200"}`}>
      <div className="text-xs font-semibold text-gray-700 mb-2 text-center leading-tight">{title}</div>
      <div className={`text-lg sm:text-xl lg:text-2xl font-bold mb-2 text-center break-words ${valueColor ?? "text-black"}`}>{value.toLocaleString()}</div>
      <div className={`text-xs font-semibold flex items-center gap-1 ${isUp ? "text-green-600" : isDown ? "text-red-500" : "text-gray-500"}`}>{isUp && <span>↑</span>}{isDown && <span>↓</span>}{delta === null ? "N/A" : Math.abs(delta).toLocaleString()}</div>
    </div>
  );
};

const OrderTop10LocationChartData: React.FC<Props> = ({
  isMobile,
  top10LocationChartData,
  formatMoneyShort,
  renderBarLabel,
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
}) => (
  <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-2 sm:p-4">
    <div className="text-base sm:text-xl font-medium text-gray-700 text-center mb-4">
      Top 10 cửa hàng trong tuần theo thực thu
    </div>
    <div className="flex flex-col lg:flex-row w-full gap-4">
      <div className="flex-1 bg-white rounded-xl shadow-lg p-2 sm:p-4">
        <div className="w-full overflow-x-auto">
          <ResponsiveContainer
            width="100%"
            height={isMobile ? 400 : 600}
            minWidth={500}
          >
            <BarChart
              layout="vertical"
              data={top10LocationChartData}
              margin={{
                top: 20,
                right: isMobile ? 80 : 120,
                left: isMobile ? 40 : 60,
                bottom: 20,
              }}
              barCategoryGap={isMobile ? 20 : 40}
              barGap={isMobile ? 4 : 8}
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
              <Bar
                dataKey="revenue"
                name="Thực thu"
                fill="#8d6e63"
                radius={[0, 8, 8, 0]}
                maxBarSize={50}
                label={{
                  position: "right",
                  content: (props: LabelProps) => renderBarLabel({ ...props, fill: "#8d6e63" }),
                }}
              />
              <Bar
                dataKey="foxie"
                name="Trả bằng thẻ Foxie"
                fill="#b6d47a"
                radius={[0, 8, 8, 0]}
                maxBarSize={50}
                label={{
                  position: "right",
                  content: (props: LabelProps) => renderBarLabel({ ...props, fill: "#b6d47a" }),
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="w-full lg:w-80 bg-white rounded-xl shadow-lg p-2 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          <StatCard title="Thực thu" value={totalRevenueThisWeek} delta={percentRevenue} valueColor="text-[#a9b8c3]" />
          <StatCard title="Thực thu của dịch vụ lẻ" value={retailThisWeek} delta={percentRetail} valueColor="text-[#fcb900]" />
          <StatCard title="Thực thu mua sản phẩm" value={productThisWeek} delta={percentProduct} valueColor="text-[#b6d47a]" />
          <StatCard title="Thực thu của mua thẻ" value={cardThisWeek} delta={percentCard} valueColor="text-[#8ed1fc]" />
          <StatCard title="Tổng trả bằng thẻ Foxie" value={foxieThisWeek} delta={percentFoxie} valueColor="text-[#a9b8c3]" />
          <StatCard title="Trung bình thực thu mỗi ngày" value={avgRevenueThisWeek} delta={percentAvg} valueColor="text-[#b39ddb]" />
        </div>
      </div>
    </div>
  </div>
);

export default OrderTop10LocationChartData;