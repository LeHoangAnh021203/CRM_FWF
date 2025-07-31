"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface WeeklyServiceChartDataProps {
  weeklyServiceChartData: Array<{
    date: string;
    combo: number;
    service: number;
    addedon: number;
    foxcard: number;
  }>;
  isMobile: boolean;
}



export default function WeeklyServiceChartData({
  weeklyServiceChartData,
  isMobile,
}: WeeklyServiceChartDataProps) {


  return (
    <div className="w-full bg-white rounded-xl shadow-lg mt-5 p-4">
      <div className="text-xl font-medium text-gray-700 text-center mb-4">
        Tổng dịch vụ thực hiện trong tuần
      </div>
      <div className="w-full overflow-x-auto">
        <div style={{ minWidth: 520 }}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={weeklyServiceChartData}
              margin={{ top: 20, right: 10, left: 10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                angle={-30}
                textAnchor="end"
                height={isMobile ? 40 : 60}
                tick={{ fontSize: isMobile ? 10 : 14 }}
              />
              <YAxis tick={{ fontSize: isMobile ? 10 : 14 }} />
              <Tooltip />
              {/* Ẩn legend trên mobile */}
              {!isMobile && <Legend />}
              <Bar dataKey="combo" name="Combo" fill="#795548">
                <LabelList 
                  dataKey="combo" 
                  position="top" 
                  fontSize={isMobile ? 10 : 12} 
                  fill="#795548"
                  formatter={(value: React.ReactNode) => {
                    if (typeof value === "number") {
                      const currentDataPoint = weeklyServiceChartData.find(item => item.combo === value);
                      if (currentDataPoint) {
                        const maxValue = Math.max(currentDataPoint.combo, currentDataPoint.service, currentDataPoint.addedon, currentDataPoint.foxcard);
                        return value === maxValue && value > 0 ? value.toString() : "";
                      }
                    }
                    return "";
                  }}
                />
              </Bar>
              <Bar dataKey="service" name="Dịch vụ" fill="#c5e1a5">
                <LabelList 
                  dataKey="service" 
                  position="top" 
                  fontSize={isMobile ? 10 : 12} 
                  fill="#c5e1a5"
                  formatter={(value: React.ReactNode) => {
                    if (typeof value === "number") {
                      const currentDataPoint = weeklyServiceChartData.find(item => item.service === value);
                      if (currentDataPoint) {
                        const maxValue = Math.max(currentDataPoint.combo, currentDataPoint.service, currentDataPoint.addedon, currentDataPoint.foxcard);
                        return value === maxValue && value > 0 ? value.toString() : "";
                      }
                    }
                    return "";
                  }}
                />
              </Bar>
              <Bar dataKey="addedon" name="Added on" fill="#f16a3f">
                <LabelList 
                  dataKey="addedon" 
                  position="top" 
                  fontSize={isMobile ? 10 : 12} 
                  fill="#f16a3f"
                  formatter={(value: React.ReactNode) => {
                    if (typeof value === "number") {
                      const currentDataPoint = weeklyServiceChartData.find(item => item.addedon === value);
                      if (currentDataPoint) {
                        const maxValue = Math.max(currentDataPoint.combo, currentDataPoint.service, currentDataPoint.addedon, currentDataPoint.foxcard);
                        return value === maxValue && value > 0 ? value.toString() : "";
                      }
                    }
                    return "";
                  }}
                />
              </Bar>
              <Bar dataKey="foxcard" name="Fox card" fill="#c86b82">
                <LabelList 
                  dataKey="foxcard" 
                  position="top" 
                  fontSize={isMobile ? 10 : 12} 
                  fill="#c86b82"
                  formatter={(value: React.ReactNode) => {
                    if (typeof value === "number") {
                      const currentDataPoint = weeklyServiceChartData.find(item => item.foxcard === value);
                      if (currentDataPoint) {
                        const maxValue = Math.max(currentDataPoint.combo, currentDataPoint.service, currentDataPoint.addedon, currentDataPoint.foxcard);
                        return value === maxValue && value > 0 ? value.toString() : "";
                      }
                    }
                    return "";
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Custom legend cho mobile */}
      {isMobile && (
        <div className="flex flex-wrap justify-center gap-2 mt-2 text-xs">
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: "#795548" }}
            />
            Combo
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: "#c5e1a5" }}
            />
            Dịch vụ
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: "#f16a3f" }}
            />
            Added on
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: "#c86b82" }}
            />
            Fox card
          </span>
        </div>
      )}
    </div>
  );
}