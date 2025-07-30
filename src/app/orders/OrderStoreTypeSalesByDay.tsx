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
    <div className="w-full bg-white rounded-xl shadow-lg mt-5">
      <div className="text-sm sm:text-base md:text-xl font-medium text-gray-700 text-center mt-5">
        Tổng doanh số loại cửa hàng
      </div>
      <div className="w-full bg-white rounded-xl shadow-lg">
        <div className="w-full overflow-x-auto">
          <ResponsiveContainer 
            width="100%" 
            height={isMobile ? 300 : 400} 
            minWidth={isMobile ? 280 : 320}
          >
            <BarChart
              width={1000}
              height={isMobile ? 300 : 400}
              data={storeTypeSalesByDay}
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
              tick={{ fontSize: isMobile ? 10 : 14 }}
            />
            <YAxis
              tickFormatter={(v) => {
                if (typeof v === "number") {
                  // Luôn hiển thị đơn vị M (triệu) cho chart này
                  return (v / 1_000_000).toFixed(1) + "M";
                }
                return v;
              }}
              tick={{ fontSize: isMobile ? 10 : 14 }}
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
                paddingTop: isMobile ? 3 : 5,
                paddingBottom: isMobile ? 5 : 10,
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                width: "100%",
                fontSize: isMobile ? 10 : 14,
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
                      fontSize={isMobile ? 8 : 10}
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
                      fontSize={isMobile ? 8 : 10}
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
                      fontSize={isMobile ? 8 : 10}
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
                      fontSize={isMobile ? 8 : 10}
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
                      fontSize={isMobile ? 8 : 10}
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
};

export default StoreTypeSalesByDay;