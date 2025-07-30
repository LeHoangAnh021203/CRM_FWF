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
}) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-2 sm:p-4">
      <div className="text-sm sm:text-base md:text-xl font-medium text-gray-700 text-center mb-4">
        Tổng doanh số vùng
      </div>
      <div className="w-full overflow-x-auto">
        <ResponsiveContainer width="100%" height={isMobile ? 300 : 400} minWidth={280}>
          <BarChart
            data={regionalSalesByDay}
            margin={{ 
              top: isMobile ? 30 : 50, 
              right: isMobile ? 10 : 30, 
              left: isMobile ? 10 : 20, 
              bottom: isMobile ? 20 : 5 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatAxisDate}
              fontSize={isMobile ? 10 : 12}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 60 : 30}
            />
            <YAxis
              tickFormatter={(v) => {
                if (typeof v === "number" && v >= 1_000_000)
                  return (v / 1_000_000).toFixed(1) + "M";
                if (typeof v === "number") return v.toLocaleString();
                return v;
              }}
              fontSize={isMobile ? 10 : 12}
              width={isMobile ? 60 : 80}
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
              contentStyle={{
                fontSize: isMobile ? 12 : 14,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px'
              }}
            />
            <Legend 
              wrapperStyle={{
                fontSize: isMobile ? 10 : 12,
                paddingTop: isMobile ? 10 : 20
              }}
            />
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
                      fontSize={isMobile ? 8 : 10}
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
                      fontSize={isMobile ? 8 : 10}
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
                      fontSize={isMobile ? 8 : 10}
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
                      fontSize={isMobile ? 8 : 10}
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
                      fontSize={isMobile ? 8 : 10}
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
                      fontSize={isMobile ? 8 : 10}
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
                fontSize: isMobile ? 12 : 16,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OrderRegionalSalesByDay;