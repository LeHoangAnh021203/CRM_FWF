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

interface CustomerTypeSalesByDayData {
  date: string;
  KHTraiNghiem?: number;
  KHIron?: number;
  KHSilver?: number;
  KHBronze?: number;
  KHDiamond?: number;
  Khac?: number;
  [key: string]: string | number | undefined;
}

interface Props {
  isMobile: boolean;
  customerTypeSalesByDay: CustomerTypeSalesByDayData[];
}

const OrderCustomerTypeSaleaByDay: React.FC<Props> = ({ isMobile, customerTypeSalesByDay }) => (
  <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-2 sm:p-4">
    <div className="text-base sm:text-xl font-medium text-gray-700 text-center mb-4">
      Tổng thực thu theo loại khách hàng trong tuần
    </div>
    <div className="w-full overflow-x-auto">
      <ResponsiveContainer
        width="100%"
        height={isMobile ? 300 : 400}
        minWidth={320}
      >
        <BarChart
          data={customerTypeSalesByDay}
          margin={{
            top: 30,
            right: isMobile ? 20 : 40,
            left: isMobile ? 20 : 40,
            bottom: isMobile ? 10 : 20,
          }}
          barCategoryGap={isMobile ? 10 : 20}
          barGap={isMobile ? 2 : 4}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            angle={isMobile ? -20 : -30}
            textAnchor="end"
            height={isMobile ? 40 : 60}
            tick={{ fontSize: isMobile ? 10 : 14 }}
            tickFormatter={(dateString) => {
              if (!dateString || typeof dateString !== "string") return dateString;
              if (dateString.includes("-")) {
                const d = new Date(dateString);
                if (!isNaN(d.getTime())) {
                  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
                }
              }
              return dateString;
            }}
          />
          <YAxis
            tickFormatter={(v) => {
              if (typeof v === "number" && v >= 1_000_000)
                return (v / 1_000_000).toFixed(1) + "M";
              if (typeof v === "number") return v.toLocaleString();
              return v;
            }}
            tick={{ fontSize: isMobile ? 10 : 14 }}
          />
          <Tooltip
            formatter={(value) => {
              if (typeof value === "number") {
                return value.toFixed(1);
              }
              return value;
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: isMobile ? 5 : 10,
              paddingBottom: isMobile ? 5 : 10,
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              width: "100%",
              fontSize: isMobile ? 10 : 14,
            }}
          />
          <Bar dataKey="KHTraiNghiem" name="KH trải nghiệm" fill="#8d6e63" />
          <Bar dataKey="KHIron" name="KH Iron" fill="#b6d47a" />
          <Bar dataKey="KHSilver" name="KH Silver" fill="#ff7f7f" />
          <Bar dataKey="KHBronze" name="KH Bronze" fill="#81d4fa" />
          <Bar dataKey="KHDiamond" name="KH Diamond" fill="#f0bf4c" />
          <Bar dataKey="Khac" name="Khác" fill="#bccefb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default OrderCustomerTypeSaleaByDay;