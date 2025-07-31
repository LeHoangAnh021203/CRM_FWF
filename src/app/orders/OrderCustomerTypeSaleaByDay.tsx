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



const OrderCustomerTypeSaleaByDay: React.FC<Props> = ({ isMobile, customerTypeSalesByDay }) => {
  // Create a map of max values for each date
  const maxValuesByDate = React.useMemo(() => {
    const maxMap = new Map<string, number>();
    customerTypeSalesByDay.forEach(item => {
      const values = [
        item.KHTraiNghiem || 0,
        item.KHIron || 0,
        item.KHSilver || 0,
        item.KHBronze || 0,
        item.KHDiamond || 0,
        item.Khac || 0
      ];
      maxMap.set(item.date, Math.max(...values));
    });
    return maxMap;
  }, [customerTypeSalesByDay]);

  return (
  <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-2 sm:p-4">
    <div className="text-base sm:text-xl font-medium text-gray-700 text-center mb-4">
      Tổng thực thu theo loại khách hàng trong tuần
    </div>
    <div className="w-full overflow-x-auto">
    <ResponsiveContainer width="100%" height={isMobile ? 300 : 400} minWidth={280}>
        <BarChart
          data={customerTypeSalesByDay}
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
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? "end" : "middle"}

            height={isMobile ? 60 : 30}
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
                if (value >= 1_000_000) {
                  return (value / 1_000_000).toFixed(1) + "M";
                }
                return value.toLocaleString();
              }
              return value;
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: isMobile ? 10 : 15,
              paddingBottom: isMobile ? 10 : 15,
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              width: "100%",
              fontSize: isMobile ? 10 : 14,
            }}
          />
          <Bar dataKey="KHTraiNghiem" name="KH trải nghiệm" fill="#8d6e63" maxBarSize={isMobile ? 120 : 150}>
            <LabelList 
              dataKey="KHTraiNghiem" 
              position="top" 
              fontSize={isMobile ? 11 : 13} 
              fill="#8d6e63"
              formatter={(value: React.ReactNode) => {
                if (typeof value === "number" && value === 0) {
                  return "";
                }
                // Find the current data point to get the date
                const currentDataPoint = customerTypeSalesByDay.find(item => 
                  item.KHTraiNghiem === value
                );
                if (!currentDataPoint) return "";
                
                const maxValue = maxValuesByDate.get(currentDataPoint.date) || 0;
                if (typeof value === "number" && value === maxValue && value > 0) {
                  if (value >= 1_000_000) {
                    return (value / 1_000_000).toFixed(1) + "M";
                  }
                  return value.toString();
                }
                return "";
              }}
            />
          </Bar>
          <Bar dataKey="KHIron" name="KH Iron" fill="#b6d47a" maxBarSize={isMobile ? 120 : 150}>
            <LabelList 
              dataKey="KHIron" 
              position="top" 
              fontSize={isMobile ? 11 : 13} 
              fill="#b6d47a"
              formatter={(value: React.ReactNode) => {
                if (typeof value === "number" && value === 0) {
                  return "";
                }
                const currentDataPoint = customerTypeSalesByDay.find(item => 
                  item.KHIron === value
                );
                if (!currentDataPoint) return "";
                
                const maxValue = maxValuesByDate.get(currentDataPoint.date) || 0;
                if (typeof value === "number" && value === maxValue && value > 0) {
                  if (value >= 1_000_000) {
                    return (value / 1_000_000).toFixed(1) + "M";
                  }
                  return value.toString();
                }
                return "";
              }}
            />
          </Bar>
          <Bar dataKey="KHSilver" name="KH Silver" fill="#ff7f7f" maxBarSize={isMobile ? 120 : 150}>
            <LabelList 
              dataKey="KHSilver" 
              position="top" 
              fontSize={isMobile ? 11 : 13} 
              fill="#ff7f7f"
              formatter={(value: React.ReactNode) => {
                if (typeof value === "number" && value === 0) {
                  return "";
                }
                const currentDataPoint = customerTypeSalesByDay.find(item => 
                  item.KHSilver === value
                );
                if (!currentDataPoint) return "";
                
                const maxValue = maxValuesByDate.get(currentDataPoint.date) || 0;
                if (typeof value === "number" && value === maxValue && value > 0) {
                  if (value >= 1_000_000) {
                    return (value / 1_000_000).toFixed(1) + "M";
                  }
                  return value.toString();
                }
                return "";
              }}
            />
          </Bar>
          <Bar dataKey="KHBronze" name="KH Bronze" fill="#81d4fa" maxBarSize={isMobile ? 120 : 150}>
            <LabelList 
              dataKey="KHBronze" 
              position="top" 
              fontSize={isMobile ? 11 : 13} 
              fill="#81d4fa"
              formatter={(value: React.ReactNode) => {
                if (typeof value === "number" && value === 0) {
                  return "";
                }
                const currentDataPoint = customerTypeSalesByDay.find(item => 
                  item.KHBronze === value
                );
                if (!currentDataPoint) return "";
                
                const maxValue = maxValuesByDate.get(currentDataPoint.date) || 0;
                if (typeof value === "number" && value === maxValue && value > 0) {
                  if (value >= 1_000_000) {
                    return (value / 1_000_000).toFixed(1) + "M";
                  }
                  return value.toString();
                }
                return "";
              }}
            />
          </Bar>
          <Bar dataKey="KHDiamond" name="KH Diamond" fill="#f0bf4c" maxBarSize={isMobile ? 120 : 150}>
            <LabelList 
              dataKey="KHDiamond" 
              position="top" 
              fontSize={isMobile ? 11 : 13} 
              fill="#f0bf4c"
              formatter={(value: React.ReactNode) => {
                if (typeof value === "number" && value === 0) {
                  return "";
                }
                const currentDataPoint = customerTypeSalesByDay.find(item => 
                  item.KHDiamond === value
                );
                if (!currentDataPoint) return "";
                
                const maxValue = maxValuesByDate.get(currentDataPoint.date) || 0;
                if (typeof value === "number" && value === maxValue && value > 0) {
                  if (value >= 1_000_000) {
                    return (value / 1_000_000).toFixed(1) + "M";
                  }
                  return value.toString();
                }
                return "";
              }}
            />
          </Bar>
          <Bar dataKey="Khac" name="Khác" fill="#bccefb" maxBarSize={isMobile ? 120 : 150}>
            <LabelList 
              dataKey="Khac" 
              position="top" 
              fontSize={isMobile ? 11 : 13} 
              fill="#bccefb"
              formatter={(value: React.ReactNode) => {
                if (typeof value === "number" && value === 0) {
                  return "";
                }
                const currentDataPoint = customerTypeSalesByDay.find(item => 
                  item.Khac === value
                );
                if (!currentDataPoint) return "";
                
                const maxValue = maxValuesByDate.get(currentDataPoint.date) || 0;
                if (typeof value === "number" && value === maxValue && value > 0) {
                  if (value >= 1_000_000) {
                    return (value / 1_000_000).toFixed(1) + "M";
                  }
                  return value.toString();
                }
                return "";
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
  );
};

export default OrderCustomerTypeSaleaByDay;