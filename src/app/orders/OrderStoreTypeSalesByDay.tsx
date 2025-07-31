import React from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, LabelList } from "recharts";

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
}

const StoreTypeSalesByDay: React.FC<StoreTypeSalesByDayProps> = ({
  storeTypeSalesByDay,
  formatAxisDate,
}) => {
  const [isMobile, setIsMobile] = React.useState(false);

  // Create a map of max values for each date
  const maxValuesByDate = React.useMemo(() => {
    const maxMap = new Map<string, number>();
    storeTypeSalesByDay.forEach(item => {
      const values = [
        item.Mall || 0,
        item.Shophouse || 0,
        item.NhaPho || 0,
        item.DaDongCua || 0,
        item.Khac || 0
      ];
      maxMap.set(item.date, Math.max(...values));
    });
    return maxMap;
  }, [storeTypeSalesByDay]);

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
            <Bar dataKey="Mall" name="Mall" fill="#ff7f7f">
              <LabelList 
                dataKey="Mall" 
                position="top" 
                fontSize={isMobile ? 10 : 12} 
                fill="#ff7f7f"
                formatter={(value: React.ReactNode) => {
                  if (typeof value === "number" && value === 0) {
                    return "";
                  }
                  // Find the current data point to get the date
                  const currentDataPoint = storeTypeSalesByDay.find(item => 
                    item.Mall === value
                  );
                  if (!currentDataPoint) return "";
                  
                  const maxValue = maxValuesByDate.get(currentDataPoint.date) || 0;
                  if (typeof value === "number" && value === maxValue && value > 0) {
                    return (value / 1_000_000).toFixed(1) + "M";
                  }
                  return "";
                }}
              />
            </Bar>
            <Bar dataKey="Shophouse" name="Shophouse" fill="#b39ddb">
              <LabelList 
                dataKey="Shophouse" 
                position="top" 
                fontSize={isMobile ? 10 : 12} 
                fill="#b39ddb"
                formatter={(value: React.ReactNode) => {
                  if (typeof value === "number" && value === 0) {
                    return "";
                  }
                  const currentDataPoint = storeTypeSalesByDay.find(item => 
                    item.Shophouse === value
                  );
                  if (!currentDataPoint) return "";
                  
                  const maxValue = maxValuesByDate.get(currentDataPoint.date) || 0;
                  if (typeof value === "number" && value === maxValue && value > 0) {
                    return (value / 1_000_000).toFixed(1) + "M";
                  }
                  return "";
                }}
              />
            </Bar>
            <Bar dataKey="NhaPho" name="Nhà phố" fill="#8d6e63">
              <LabelList 
                dataKey="NhaPho" 
                position="top" 
                fontSize={isMobile ? 10 : 12} 
                fill="#8d6e63"
                formatter={(value: React.ReactNode) => {
                  if (typeof value === "number" && value === 0) {
                    return "";
                  }
                  const currentDataPoint = storeTypeSalesByDay.find(item => 
                    item.NhaPho === value
                  );
                  if (!currentDataPoint) return "";
                  
                  const maxValue = maxValuesByDate.get(currentDataPoint.date) || 0;
                  if (typeof value === "number" && value === maxValue && value > 0) {
                    return (value / 1_000_000).toFixed(1) + "M";
                  }
                  return "";
                }}
              />
            </Bar>
            <Bar dataKey="DaDongCua" name="Đã đóng cửa" fill="#c5e1a5">
              <LabelList 
                dataKey="DaDongCua" 
                position="top" 
                fontSize={isMobile ? 10 : 12} 
                fill="#c5e1a5"
                formatter={(value: React.ReactNode) => {
                  if (typeof value === "number" && value === 0) {
                    return "";
                  }
                  const currentDataPoint = storeTypeSalesByDay.find(item => 
                    item.DaDongCua === value
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
            <Bar dataKey="Khac" name="Khác" fill="#81d4fa">
              <LabelList 
                dataKey="Khac" 
                position="top" 
                fontSize={isMobile ? 10 : 12} 
                fill="#81d4fa"
                formatter={(value: React.ReactNode) => {
                  if (typeof value === "number" && value === 0) {
                    return "";
                  }
                  const currentDataPoint = storeTypeSalesByDay.find(item => 
                    item.Khac === value
                  );
                  if (!currentDataPoint) return "";
                  
                                    const maxValue = maxValuesByDate.get(currentDataPoint.date) || 0;
                  if (typeof value === "number" && value === maxValue && value > 0) {
                    return (value / 1_000_000).toFixed(1) + "M";
                  }
                  return "";
                }}
              />
            </Bar>
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
  );
};

export default StoreTypeSalesByDay;