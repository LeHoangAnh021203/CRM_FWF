import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts";

interface StoreTypeSalesByDayData {
  date: string;
  Mall: number;
  Shophouse: number;
  NhaPho: number;
  DaDongCua: number;
  Khac: number;
  total?: number;
}

interface OrderTotalByStoreProps {
  data: StoreTypeSalesByDayData[];
  formatAxisDate: (date: string) => string;
}

function formatBillion(val: number) {
  if (!val) return "0M";
  return (val / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + "M";
}

const OrderTotalByStore: React.FC<OrderTotalByStoreProps> = ({ data, formatAxisDate }) => (
<div className="w-full bg-white rounded-xl shadow-lg mt-5 p-2 sm:p-4">
          <div className="text-base sm:text-xl font-medium text-gray-700 text-center mb-4">
            Tổng thực thu theo loại cửa hàng
          </div>
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={400} minWidth={320}>
              <LineChart
          data={data}
                margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  angle={-30}
                  textAnchor="end"
                  height={60}
                  tickFormatter={formatAxisDate}
                />
                <YAxis
            tickFormatter={(v: number) => formatBillion(v)}
                />
                <Tooltip
            formatter={(value: number) => formatBillion(value)}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: 10,
                    paddingBottom: 10,
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    width: "100%",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Mall"
                  name="Trong Mall"
                  stroke="#8d6e63"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Shophouse"
                  name="Shophouse"
                  stroke="#b6d47a"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="NhaPho"
                  name="Nhà phố"
                  stroke="#ff7f7f"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="DaDongCua"
                  name="Đã đóng cửa"
                  stroke="#f0bf4c"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Khac"
                  name="Khác"
                  stroke="#81d4fa"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
);

export default OrderTotalByStore;