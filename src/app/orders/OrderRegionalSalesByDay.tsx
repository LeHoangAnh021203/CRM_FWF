import React from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, LabelList } from "recharts";

interface RegionalSalesByDayData {
  date: string;
  HCM: number;
  HaNoi: number;
  DaNang: number;
  NhaTrang: number;
  DaDongCua: number;
  VungTau: number;
  total?: number;
}

interface RegionalSalesByDayProps {
  regionalSalesByDay: RegionalSalesByDayData[];
  formatAxisDate: (date: string) => string;
  formatMoneyShort: (val: number) => string;
}

const OrderRegionalSalesByDay: React.FC<RegionalSalesByDayProps> = ({
  regionalSalesByDay,
  formatAxisDate,
  formatMoneyShort,
}) => (
  <div className="w-full bg-white rounded-xl shadow-lg mt-5">
    <div className="text-base sm:text-xl font-medium text-gray-700 text-center mt-5">
      Tổng doanh số vùng
    </div>
    <div className="w-full bg-white rounded-xl shadow-lg">
      <div className="w-full overflow-x-auto">
        <ResponsiveContainer width="100%" height={400} minWidth={320}>
          <BarChart
            width={1000}
            height={400}
            data={regionalSalesByDay}
            margin={{ top: 50, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatAxisDate}
              fontSize={12}
            />
            <YAxis
              tickFormatter={(v) => {
                if (typeof v === "number" && v >= 1_000_000)
                  return (v / 1_000_000).toFixed(1) + "M";
                if (typeof v === "number") return v.toLocaleString();
                return v;
              }}
            />
            <Tooltip
              formatter={(value) => {
                if (typeof value === "number") {
                  if (value >= 1_000_000)
                    return `${(value / 1_000_000).toFixed(1)}M`;
                  return value.toLocaleString();
                }
                return value;
              }}
            />
            <Legend />
            <Bar
              dataKey="HCM"
              fill="#ff7f7f"
              name="HCM"
              label={{
                position: "top",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content: (props: any) => {
                  const { value, x, y } = props;
                  if (typeof value === "number" && value < 1_000_000)
                    return null;
                  const xNum = Number(x);
                  const yNum = Number(y);
                  return (
                    <text
                      x={xNum}
                      y={yNum - 6}
                      fontSize={10}
                      fill="#ff7f7f"
                      textAnchor="middle"
                    >
                      {typeof value === "number"
                        ? formatMoneyShort(value)
                        : ""}
                    </text>
                  );
                },
              }}
            />
            <Bar
              dataKey="HaNoi"
              fill="#b39ddb"
              name="Hà Nội"
              label={{
                position: "top",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content: (props: any) => {
                  const { value, x, y } = props;
                  if (typeof value === "number" && value < 1_000_000)
                    return null;
                  const xNum = Number(x);
                  const yNum = Number(y);
                  return (
                    <text
                      x={xNum}
                      y={yNum - 6}
                      fontSize={10}
                      fill="#b39ddb"
                      textAnchor="middle"
                    >
                      {typeof value === "number"
                        ? formatMoneyShort(value)
                        : ""}
                    </text>
                  );
                },
              }}
            />
            <Bar
              dataKey="DaNang"
              fill="#8d6e63"
              name="Đà Nẵng"
              label={{
                position: "top",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content: (props: any) => {
                  const { value, x, y } = props;
                  if (typeof value === "number" && value < 1_000_000)
                    return null;
                  const xNum = Number(x);
                  const yNum = Number(y);
                  return (
                    <text
                      x={xNum}
                      y={yNum - 6}
                      fontSize={10}
                      fill="#8d6e63"
                      textAnchor="middle"
                    >
                      {typeof value === "number"
                        ? formatMoneyShort(value)
                        : ""}
                    </text>
                  );
                },
              }}
            />
            <Bar
              dataKey="NhaTrang"
              fill="#c5e1a5"
              name="Nha Trang"
              label={{
                position: "top",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content: (props: any) => {
                  const { value, x, y } = props;
                  if (typeof value === "number" && value < 1_000_000)
                    return null;
                  const xNum = Number(x);
                  const yNum = Number(y);
                  return (
                    <text
                      x={xNum}
                      y={yNum - 6}
                      fontSize={10}
                      fill="#c5e1a5"
                      textAnchor="middle"
                    >
                      {typeof value === "number"
                        ? formatMoneyShort(value)
                        : ""}
                    </text>
                  );
                },
              }}
            />
            <Bar
              dataKey="DaDongCua"
              stackId="a"
              fill="#f0bf4c"
              name="Đã đóng cửa"
              label={{
                position: "top",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content: (props: any) => {
                  const { value, x, y } = props;
                  if (typeof value === "number" && value < 1_000_000)
                    return null;
                  const xNum = Number(x);
                  const yNum = Number(y);
                  return (
                    <text
                      x={xNum}
                      y={yNum - 6}
                      fontSize={10}
                      fill="#f0bf4c"
                      textAnchor="middle"
                    >
                      {typeof value === "number"
                        ? formatMoneyShort(value)
                        : ""}
                    </text>
                  );
                },
              }}
            />
            <Bar
              dataKey="VungTau"
              stackId="a"
              fill="#4db6ac"
              name="Vũng Tàu"
              label={{
                position: "top",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content: (props: any) => {
                  const { value, x, y } = props;
                  if (typeof value === "number" && value < 1_000_000)
                    return null;
                  const xNum = Number(x);
                  const yNum = Number(y);
                  return (
                    <text
                      x={xNum}
                      y={yNum - 6}
                      fontSize={10}
                      fill="#4db6ac"
                      textAnchor="middle"
                    >
                      {typeof value === "number"
                        ? formatMoneyShort(value)
                        : ""}
                    </text>
                  );
                },
              }}
            />
            <LabelList
              dataKey="total"
              position="top"
              formatter={(label: React.ReactNode) => {
                if (typeof label === "number") {
                  return label.toLocaleString();
                }
                return "";
              }}
              style={{
                fontWeight: "bold",
                fill: "#f0bf4c",
                fontSize: 16,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

export default OrderRegionalSalesByDay;