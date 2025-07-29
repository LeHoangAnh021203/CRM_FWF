import React from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";

interface CustomerSourceBarChartProps {
  isMobile: boolean;
  customerSourceTrendData: Record<string, string | number>[];
  customerSourceKeys: string[];
  COLORS: string[];
}

const CustomerSourceBarChart: React.FC<CustomerSourceBarChartProps> = ({
  isMobile,
  customerSourceTrendData,
  customerSourceKeys,
  COLORS,
}) => (
  <div className="w-full bg-white rounded-xl shadow-lg mt-5">
    <div className="text-xl font-medium text-gray-700 text-center pt-5">
      Nguồn của đơn hàng
    </div>
    <div className="w-full bg-white rounded-xl shadow-lg">
      <ResponsiveContainer
        width="100%"
        height={isMobile ? 220 : 350}
        minWidth={isMobile ? 180 : 320}
      >
        <BarChart
          data={customerSourceTrendData}
          margin={{
            top: isMobile ? 20 : 50,
            right: 10,
            left: 10,
            bottom: isMobile ? 20 : 40,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            fontSize={isMobile ? 9 : 12}
            tickFormatter={(date: string) => {
              // date dạng 'YYYY-MM-DD' => 'DD/MM'
              const match = date.match(/^\d{4}-(\d{2})-(\d{2})$/);
              if (match) {
                const [, month, day] = match;
                return `${day}/${month}`;
              }
              return date;
            }}
          />
          <YAxis fontSize={isMobile ? 9 : 12} />
          <Tooltip />
          <Legend
            wrapperStyle={{
              paddingTop: isMobile ? 0 : 5,
              paddingBottom: isMobile ? 0 : 10,
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              width: "100%",
              fontSize: isMobile ? 9 : 14,
            }}
          />
          {customerSourceKeys.map((source: string, idx: number) => (
            <Bar
              key={source}
              dataKey={source}
              fill={COLORS[idx % COLORS.length]}
              name={source}
              label={
                isMobile
                  ? undefined
                  : (props: {
                      x?: number;
                      y?: number;
                      width?: number;
                      value?: number;
                      index?: number;
                    }) => {
                      const { x, y, width, value, index } = props;
                      if (
                        typeof index !== "number" ||
                        index < 0 ||
                        typeof x !== "number" ||
                        typeof y !== "number" ||
                        typeof width !== "number"
                      ) {
                        // Trả về 1 <g /> rỗng thay vì null
                        return <g />;
                      }
                      const d = customerSourceTrendData[index] as Record<string, number>;
                      if (!d) return <g />;
                      // Tìm giá trị lớn nhất trong các nguồn tại ngày đó
                      const max = Math.max(
                        ...customerSourceKeys.map((k: string) =>
                          Number(d[k] || 0)
                        )
                      );
                      if (value === max && value > 0) {
                        return (
                          <text
                            x={x + width / 2}
                            y={y - 5}
                            textAnchor="middle"
                            fill={COLORS[idx % COLORS.length]}
                            fontSize={14}
                            fontWeight={600}
                          >
                            {value}
                          </text>
                        );
                      }
                      // Trả về 1 <g /> rỗng thay vì null
                      return <g />;
                    }
              }
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default CustomerSourceBarChart;