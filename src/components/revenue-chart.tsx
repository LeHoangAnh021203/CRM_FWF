"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/useDashboardData";

export function RevenueChart() {
  const { revenueData, loading, error } = useDashboardData();

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
          <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
          <p className="text-sm text-gray-600">Monthly revenue for the last 6 months</p>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>No revenue data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
        <p className="text-sm text-gray-600">Monthly revenue for the last 6 months</p>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between space-x-2">
          {revenueData.map((item) => (
            <div key={item.date} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                style={{
                  height: `${(item.revenue / maxRevenue) * 200}px`,
                  minHeight: "20px",
                }}
              />
              <span className="text-xs text-gray-600 mt-2">{formatDate(item.date)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between text-sm text-gray-600">
          <span>0 M</span>
          <span>{(maxRevenue / 1000000).toFixed(1)} M</span>
        </div>
      </CardContent>
    </Card>
  );
}
