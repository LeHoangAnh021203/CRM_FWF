import React from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";

interface StoreTypeSalesByDayData {
  date: string;
  Mall: number;
  Shophouse: number;
  NhaPho: number;
  DaDongCua: number;
  Khac: number;
}

interface StoreTypeSalesByDayProps {
  storeTypeSalesByDay: StoreTypeSalesByDayData[];
  formatAxisDate: (date: string) => string;
  formatMoneyShort: (val: number) => string;
}

const StoreTypeSalesByDay: React.FC<StoreTypeSalesByDayProps> = ({
  storeTypeSalesByDay,
  formatAxisDate,
  formatMoneyShort,
}) => (
  <div className="w-full bg-white rounded-xl shadow-lg mt-5">
    <div className="text-base sm:text-xl font-medium text-gray-700 text-center mt-5">
      Tổng doanh số loại cửa hàng
    </div>
    <div className="w-full bg-white rounded-xl shadow-lg">
      <div className="w-full ">
        <ResponsiveContainer width="100%" height={400} minWidth={320}>
          <BarChart
            width={1000}
            height={400}
            data={storeTypeSalesByDay}
            margin={{ top: 50, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatAxisDate} />
            <YAxis
              tickFormatter={(v) => {
                if (typeof v === "number") {
                  // Luôn hiển thị đơn vị M (triệu) cho chart này
                  return (v / 1_000_000).toFixed(1) + "M";
                }
                return v;
              }}
            />
            <Tooltip
              formatter={(value) => {
                if (typeof value === "number") {
                  // Luôn hiển thị đơn vị M (triệu) cho chart này
                  return `${(value / 1_000_000).toFixed(1)}M`;
                }
                return value;
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: 5,
                paddingBottom: 10,
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                width: "100%",
              }}
            />
            <Bar
              dataKey="Mall"
              fill="#ff7f7f"
              name="Mall"
              label={{
                position: "top",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content: (props: any) => {
                  const { value, x, y } = props;
                  if (typeof value !== "number" || value === 0) return null;
                  return (
                    <text
                      x={Number(x)}
                      y={Number(y) - 6}
                      fontSize={10}
                      fill="#ff7f7f"
                      textAnchor="middle"
                    >
                      {formatMoneyShort(value)}
                    </text>
                  );
                },
              }}
            />
            <Bar
              dataKey="Shophouse"
              fill="#b39ddb"
              name="Shophouse"
              label={{
                position: "top",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content: (props: any) => {
                  const { value, x, y } = props;
                  if (typeof value !== "number" || value === 0) return null;
                  return (
                    <text
                      x={Number(x)}
                      y={Number(y) - 6}
                      fontSize={10}
                      fill="#b39ddb"
                      textAnchor="middle"
                    >
                      {formatMoneyShort(value)}
                    </text>
                  );
                },
              }}
            />
            <Bar
              dataKey="NhaPho"
              fill="#8d6e63"
              name="Nhà phố"
              label={{
                position: "top",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content: (props: any) => {
                  const { value, x, y } = props;
                  if (typeof value !== "number" || value === 0) return null;
                  return (
                    <text
                      x={Number(x)}
                      y={Number(y) - 6}
                      fontSize={10}
                      fill="#8d6e63"
                      textAnchor="middle"
                    >
                      {formatMoneyShort(value)}
                    </text>
                  );
                },
              }}
            />
            <Bar
              dataKey="DaDongCua"
              fill="#c5e1a5"
              name="Đã đóng cửa"
              label={{
                position: "top",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content: (props: any) => {
                  const { value, x, y } = props;
                  if (typeof value !== "number" || value === 0) return null;
                  return (
                    <text
                      x={Number(x)}
                      y={Number(y) - 6}
                      fontSize={10}
                      fill="#c5e1a5"
                      textAnchor="middle"
                    >
                      {formatMoneyShort(value)}
                    </text>
                  );
                },
              }}
            />
            <Bar
              dataKey="Khac"
              fill="#81d4fa"
              name="Khác"
              label={{
                position: "top",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content: (props: any) => {
                  const { value, x, y } = props;
                  if (typeof value !== "number" || value === 0) return null;
                  return (
                    <text
                      x={Number(x)}
                      y={Number(y) - 6}
                      fontSize={10}
                      fill="#81d4fa"
                      textAnchor="middle"
                    >
                      {formatMoneyShort(value)}
                    </text>
                  );
                },
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

export default StoreTypeSalesByDay;