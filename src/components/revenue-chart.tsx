"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/useDashboardData";

export function RevenueChart() {
  const { revenueData, loading, error } = useDashboardData();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  
  const formatDate = (dateString: string) => {
    if (!dateString || typeof dateString !== "string") return dateString;

    
    if (dateString.includes("T")) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return `${String(date.getDate()).padStart(2, "0")}/${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
      }
    }

    // Handle other date formats
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
    }

    return dateString; // fallback
  };

  // Format revenue for display
  const formatRevenue = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)} T`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)} K`;
    }
    return value.toLocaleString();
  };

  if (loading) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-32"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  if (error || !revenueData || revenueData.length === 0) {
    return (
      <Card className="bg-white">
              <CardHeader>
        <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Tổng Quan Doanh Thu</CardTitle>
        <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Doanh thu theo ngày trong tháng</p>
      </CardHeader>
        <CardContent>
          <div className={`${isMobile ? 'h-48' : 'h-64'} flex items-center justify-center text-gray-500`}>
            <div className="text-center">
              <p className={`${isMobile ? 'text-sm' : 'text-base'}`}>Không có dữ liệu doanh thu</p>
              {error && <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-red-500 mt-2`}>{error}</p>}
              <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-400 mt-2`}>Kiểm tra console để xem debug logs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));

  // Filter data for mobile to show fewer bars
  const displayData = isMobile && revenueData.length > 15 
    ? revenueData.filter((_, index) => index % 2 === 0) // Show every other day on mobile
    : revenueData;

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Tổng Quan Doanh Thu</CardTitle>
        <p className="text-sm text-gray-600">Doanh thu theo ngày trong tháng</p>
      </CardHeader>
      <CardContent>
        <div className={`${isMobile ? 'h-48' : 'h-64'} overflow-x-auto`}>
          <div className="flex items-end justify-between space-x-1 sm:space-x-2 min-w-max">
            {displayData.map((item) => (
              <div key={item.date} className="flex flex-col items-center flex-1 min-w-[20px] sm:min-w-[30px]">
                <div
                  className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                  style={{
                    height: `${(item.revenue / maxRevenue) * (isMobile ? 150 : 200)}px`,
                    minHeight: isMobile ? "15px" : "20px",
                  }}
                />
                <span className={`${isMobile ? 'text-[8px]' : 'text-[10px]'} text-gray-600 mt-1 sm:mt-2 whitespace-nowrap`}>
                  {formatDate(item.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-between text-sm text-gray-600">
          <span>0</span>
          <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>{formatRevenue(maxRevenue)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
