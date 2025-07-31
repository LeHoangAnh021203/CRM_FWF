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
}

const OrderRegionalSalesByDay: React.FC<RegionalSalesByDayProps> = ({
  regionalSalesByDay,
  formatAxisDate,
}) => {
  const [isMobile, setIsMobile] = React.useState(false);

  // Create a map of max values for each date
  const maxValuesByDate = React.useMemo(() => {
    const maxMap = new Map<string, number>();
    regionalSalesByDay.forEach(item => {
      const values = [
        item.HCM || 0,
        item.HaNoi || 0,
        item.DaNang || 0,
        item.NhaTrang || 0,
        item.DaDongCua || 0,
        item.VungTau || 0
      ];
      maxMap.set(item.date, Math.max(...values));
    });
    return maxMap;
  }, [regionalSalesByDay]);

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
            <Bar dataKey="HCM" name="HCM" fill="#ff7f7f">
              <LabelList 
                dataKey="HCM" 
                position="top" 
                fontSize={isMobile ? 10 : 12} 
                fill="#ff7f7f"
                formatter={(value: React.ReactNode) => {
                  if (typeof value === "number" && value === 0) {
                    return "";
                  }
                  // Find the current data point to get the date
                  const currentDataPoint = regionalSalesByDay.find(item => 
                    item.HCM === value
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
            <Bar dataKey="HaNoi" name="Hà Nội" fill="#b39ddb">
              <LabelList 
                dataKey="HaNoi" 
                position="top" 
                fontSize={isMobile ? 10 : 12} 
                fill="#b39ddb"
                formatter={(value: React.ReactNode) => {
                  if (typeof value === "number" && value === 0) {
                    return "";
                  }
                  const currentDataPoint = regionalSalesByDay.find(item => 
                    item.HaNoi === value
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
            <Bar dataKey="DaNang" name="Đà Nẵng" fill="#8d6e63">
              <LabelList 
                dataKey="DaNang" 
                position="top" 
                fontSize={isMobile ? 10 : 12} 
                fill="#8d6e63"
                formatter={(value: React.ReactNode) => {
                  if (typeof value === "number" && value === 0) {
                    return "";
                  }
                  const currentDataPoint = regionalSalesByDay.find(item => 
                    item.DaNang === value
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
            <Bar dataKey="NhaTrang" name="Nha Trang" fill="#c5e1a5">
              <LabelList 
                dataKey="NhaTrang" 
                position="top" 
                fontSize={isMobile ? 10 : 12} 
                fill="#c5e1a5"
                formatter={(value: React.ReactNode) => {
                  if (typeof value === "number" && value === 0) {
                    return "";
                  }
                  const currentDataPoint = regionalSalesByDay.find(item => 
                    item.NhaTrang === value
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
            <Bar dataKey="DaDongCua" stackId="a" name="Đã đóng cửa" fill="#f0bf4c">
              <LabelList 
                dataKey="DaDongCua" 
                position="top" 
                fontSize={isMobile ? 10 : 12} 
                fill="#f0bf4c"
                formatter={(value: React.ReactNode) => {
                  if (typeof value === "number" && value === 0) {
                    return "";
                  }
                  const currentDataPoint = regionalSalesByDay.find(item => 
                    item.DaDongCua === value
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
            <Bar dataKey="VungTau" stackId="a" name="Vũng Tàu" fill="#4db6ac">
              <LabelList 
                dataKey="VungTau" 
                position="top" 
                fontSize={isMobile ? 10 : 12} 
                fill="#4db6ac"
                formatter={(value: React.ReactNode) => {
                  if (typeof value === "number" && value === 0) {
                    return "";
                  }
                  const currentDataPoint = regionalSalesByDay.find(item => 
                    item.VungTau === value
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