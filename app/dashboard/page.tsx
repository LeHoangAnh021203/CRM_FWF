"use client";

import React from "react";
import { useState } from "react";
import { Suspense, useEffect, useRef } from "react";
import { Notification, useNotification } from "@/app/components/notification";
import { usePageStatus } from "@/app/hooks/usePageStatus";
import { useDashboardData } from "@/app/hooks/useDashboardData";
import { useDateRange } from "@/app/contexts/DateContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { Button } from "@/app/components/ui/button";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { QuickActions } from "@/app/components/quick-actions";
import {
  Users,
  Calendar,
  CreditCard,
  Banknote,
  Clock,
  DollarSign,
  Wallet,
  Star,
} from "lucide-react";

// Sample data for charts
const customerSourceData = [
  { name: "Website", value: 35, color: "#f16a3f" },
  { name: "Social Media", value: 28, color: "#0693e3" },
  { name: "Giới thiệu", value: 22, color: "#00d084" },
  { name: "Quảng cáo", value: 15, color: "#fcb900" },
];

const topServices = [
  { name: "Massage thư giãn", revenue: 45000000, growth: 12 },
  { name: "Chăm sóc da mặt", revenue: 38000000, growth: 8 },
  { name: "Tắm trắng", revenue: 32000000, growth: 15 },
  { name: "Nail art", revenue: 28000000, growth: -3 },
  { name: "Gội đầu dưỡng sinh", revenue: 25000000, growth: 6 },
];

const revenueRankingData = [
  {
    rank: 1,
    name: "Chi nhánh Quận 1",
    revenue: 45000000,
    growth: 15,
    type: "top",
  },
  {
    rank: 2,
    name: "Chi nhánh Quận 3",
    revenue: 38000000,
    growth: 12,
    type: "top",
  },
  {
    rank: 3,
    name: "Chi nhánh Quận 7",
    revenue: 32000000,
    growth: 8,
    type: "top",
  },
  {
    rank: 4,
    name: "Chi nhánh Thủ Đức",
    revenue: 28000000,
    growth: 6,
    type: "top",
  },
  {
    rank: 5,
    name: "Chi nhánh Quận 2",
    revenue: 25000000,
    growth: 4,
    type: "top",
  },
  {
    rank: 6,
    name: "Chi nhánh Quận 5",
    revenue: 22000000,
    growth: 2,
    type: "top",
  },
  {
    rank: 7,
    name: "Chi nhánh Quận 8",
    revenue: 18000000,
    growth: -1,
    type: "top",
  },
  {
    rank: 8,
    name: "Chi nhánh Quận 9",
    revenue: 15000000,
    growth: -3,
    type: "top",
  },
  {
    rank: 9,
    name: "Chi nhánh Quận 6",
    revenue: 12000000,
    growth: -5,
    type: "top",
  },
  {
    rank: 10,
    name: "Chi nhánh Quận 4",
    revenue: 8000000,
    growth: -8,
    type: "top",
  },
  {
    rank: 11,
    name: "Chi nhánh Bình Thạnh",
    revenue: 6000000,
    growth: -12,
    type: "bottom",
  },
  {
    rank: 12,
    name: "Chi nhánh Tân Bình",
    revenue: 4500000,
    growth: -15,
    type: "bottom",
  },
  {
    rank: 13,
    name: "Chi nhánh Gò Vấp",
    revenue: 3200000,
    growth: -18,
    type: "bottom",
  },
  {
    rank: 14,
    name: "Chi nhánh Phú Nhuận",
    revenue: 2800000,
    growth: -22,
    type: "bottom",
  },
  {
    rank: 15,
    name: "Chi nhánh Tân Phú",
    revenue: 2200000,
    growth: -25,
    type: "bottom",
  },
  {
    rank: 16,
    name: "Chi nhánh Bình Tân",
    revenue: 1800000,
    growth: -28,
    type: "bottom",
  },
  {
    rank: 17,
    name: "Chi nhánh Quận 11",
    revenue: 1500000,
    growth: -32,
    type: "bottom",
  },
  {
    rank: 18,
    name: "Chi nhánh Quận 12",
    revenue: 1200000,
    growth: -35,
    type: "bottom",
  },
  {
    rank: 19,
    name: "Chi nhánh Hóc Môn",
    revenue: 800000,
    growth: -40,
    type: "bottom",
  },
  {
    rank: 20,
    name: "Chi nhánh Củ Chi",
    revenue: 500000,
    growth: -45,
    type: "bottom",
  },
];

const foxieRankingData = [
  {
    rank: 1,
    name: "Chi nhánh Quận 1",
    revenue: 45000000,
    growth: 15,
    type: "top",
  },
  {
    rank: 2,
    name: "Chi nhánh Quận 3",
    revenue: 38000000,
    growth: 12,
    type: "top",
  },
  {
    rank: 3,
    name: "Chi nhánh Quận 7",
    revenue: 32000000,
    growth: 8,
    type: "top",
  },
  {
    rank: 4,
    name: "Chi nhánh Thủ Đức",
    revenue: 28000000,
    growth: 6,
    type: "top",
  },
  {
    rank: 5,
    name: "Chi nhánh Quận 2",
    revenue: 25000000,
    growth: 4,
    type: "top",
  },
  {
    rank: 6,
    name: "Chi nhánh Quận 5",
    revenue: 22000000,
    growth: 2,
    type: "top",
  },
  {
    rank: 7,
    name: "Chi nhánh Quận 8",
    revenue: 18000000,
    growth: -1,
    type: "top",
  },
  {
    rank: 8,
    name: "Chi nhánh Quận 9",
    revenue: 15000000,
    growth: -3,
    type: "top",
  },
  {
    rank: 9,
    name: "Chi nhánh Quận 6",
    revenue: 12000000,
    growth: -5,
    type: "top",
  },
  {
    rank: 10,
    name: "Chi nhánh Quận 4",
    revenue: 8000000,
    growth: -8,
    type: "top",
  },
  {
    rank: 11,
    name: "Chi nhánh Bình Thạnh",
    revenue: 6000000,
    growth: -12,
    type: "bottom",
  },
  {
    rank: 12,
    name: "Chi nhánh Tân Bình",
    revenue: 4500000,
    growth: -15,
    type: "bottom",
  },
  {
    rank: 13,
    name: "Chi nhánh Gò Vấp",
    revenue: 3200000,
    growth: -18,
    type: "bottom",
  },
  {
    rank: 14,
    name: "Chi nhánh Phú Nhuận",
    revenue: 2800000,
    growth: -22,
    type: "bottom",
  },
  {
    rank: 15,
    name: "Chi nhánh Tân Phú",
    revenue: 2200000,
    growth: -25,
    type: "bottom",
  },
  {
    rank: 16,
    name: "Chi nhánh Bình Tân",
    revenue: 1800000,
    growth: -28,
    type: "bottom",
  },
  {
    rank: 17,
    name: "Chi nhánh Quận 11",
    revenue: 1500000,
    growth: -32,
    type: "bottom",
  },
  {
    rank: 18,
    name: "Chi nhánh Quận 12",
    revenue: 1200000,
    growth: -35,
    type: "bottom",
  },
  {
    rank: 19,
    name: "Chi nhánh Hóc Môn",
    revenue: 800000,
    growth: -40,
    type: "bottom",
  },
  {
    rank: 20,
    name: "Chi nhánh Củ Chi",
    revenue: 500000,
    growth: -45,
    type: "bottom",
  },
];

const allPaymentMethods = [
  // TM + CK + QT methods
  {
    method: "TM+CK+QT",
    amount: 188000000,
    percentage: 59.2,
    transactions: 1247,
  },
  // Wallet methods
  {
    method: "Thanh toán ví",
    amount: 85000000,
    percentage: 26.7,
    transactions: 523,
  },
  // Foxie methods
  {
    method: "Thẻ Foxie",
    amount: 45000000,
    percentage: 14.1,
    transactions: 234,
  },
];

const totalRevenue = allPaymentMethods.reduce(
  (sum, method) => sum + method.amount,
  0
);

const productDataByDistrict = [
  { name: "Q1", value: 28, color: "#ff6b6b" },
  { name: "Q3", value: 22, color: "#4ecdc4" },
  { name: "Q7", value: 18, color: "#45b7d1" },
  { name: "Thủ Đức", value: 15, color: "#96ceb4" },
  { name: "Q2", value: 12, color: "#feca57" },
  { name: "Khác", value: 5, color: "#ff9ff3" },
];

const foxieCardDataByDistrict = [
  { name: "Q1", value: 32, color: "#6c5ce7" },
  { name: "Q3", value: 25, color: "#a29bfe" },
  { name: "Q7", value: 20, color: "#fd79a8" },
  { name: "Thủ Đức", value: 13, color: "#fdcb6e" },
  { name: "Q2", value: 8, color: "#e17055" },
  { name: "Khác", value: 2, color: "#74b9ff" },
];

const serviceDataByDistrict = [
  { name: "Q1", value: 30, color: "#00b894" },
  { name: "Q3", value: 24, color: "#00cec9" },
  { name: "Q7", value: 19, color: "#55a3ff" },
  { name: "Thủ Đức", value: 16, color: "#fd79a8" },
  { name: "Q2", value: 9, color: "#fdcb6e" },
  { name: "Khác", value: 2, color: "#e84393" },
];

export default function Dashboard() {
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();
  const hasShownSuccess = useRef(false);
  const hasShownError = useRef(false);
  const {
    reportPageError,
    reportDataLoadSuccess,
    reportPagePerformance,
    reportDataLoadError,
  } = usePageStatus("dashboard");

  const { loading, error, apiErrors, apiSuccesses, stats } = useDashboardData();

  const [showTopRanking, setShowTopRanking] = useState(true);
  const [showTopFoxieRanking, setShowTopFoxieRanking] = useState(true);

  const monthlyTarget = 500000000; // 500M VND target
  const currentRevenue = stats?.totalRevenue || 0;
  const currentDay = new Date().getDate();
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();
  const dailyTargetForToday = (monthlyTarget / daysInMonth) * currentDay;
  const dailyTargetPercentage = (dailyTargetForToday / monthlyTarget) * 100;
  const currentPercentage = (currentRevenue / monthlyTarget) * 100;
  const remainingTarget = Math.max(0, monthlyTarget - currentRevenue);

  const getTargetStatus = () => {
    if (currentRevenue >= dailyTargetForToday) {
      return currentRevenue > dailyTargetForToday * 1.1 ? "ahead" : "ontrack";
    }
    return "behind";
  };

  const targetStatus = getTargetStatus();
  const statusColors = {
    ahead: { bg: "#00d084", text: "Vượt tiến độ" },
    ontrack: { bg: "#fcb900", text: "Đúng tiến độ" },
    behind: { bg: "#ff6b6b", text: "Chậm tiến độ" },
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const getTopRanking = () =>
    revenueRankingData.filter((item) => item.type === "top");
  const getBottomRanking = () =>
    revenueRankingData.filter((item) => item.type === "bottom");

  const getTopFoxieRanking = () =>
    foxieRankingData.filter((item) => item.type === "top");
  const getBottomFoxieRanking = () =>
    foxieRankingData.filter((item) => item.type === "bottom");

  const getRankingChartData = () => {
    const data = showTopRanking ? getTopRanking() : getBottomRanking();
    return data
      .map((item) => ({
        name: item.name.replace("Chi nhánh ", ""),
        revenue: item.revenue / 1000000, // Convert to millions for better display
        growth: item.growth,
        fullName: item.name,
      }))
      .reverse(); // Reverse to show highest at top
  };

  const getFoxieRankingChartData = () => {
    const data = showTopFoxieRanking
      ? getTopFoxieRanking()
      : getBottomFoxieRanking();
    return data
      .map((item) => ({
        name: item.name.replace("Chi nhánh ", ""),
        foxiePayment: item.revenue / 1000000, // FIXED
        growth: item.growth,
        fullName: item.name,
      }))
      .reverse();
  };

  // Use global date context instead of local state
  const { isLoaded: dateLoaded } = useDateRange();

  // Monitor API success notifications
  useEffect(() => {
    if (apiSuccesses.length > 0 && !hasShownSuccess.current) {
      const successMessage =
        apiSuccesses.length === 1
          ? apiSuccesses[0]
          : `${apiSuccesses.length} data sources loaded successfully`;

      showSuccess(successMessage);
      hasShownSuccess.current = true;
      reportDataLoadSuccess("dashboard", apiSuccesses.length);
    }
  }, [apiSuccesses, showSuccess, reportDataLoadSuccess]);

  // Monitor API error notifications
  useEffect(() => {
    if (apiErrors.length > 0 && !hasShownError.current) {
      const errorMessage =
        apiErrors.length === 1
          ? apiErrors[0]
          : `${apiErrors.length} data sources failed to load`;

      showError(errorMessage);
      hasShownError.current = true;
      reportDataLoadError("dashboard", errorMessage);
    }
  }, [apiErrors, showError, reportDataLoadError]);

  // Monitor general error
  useEffect(() => {
    if (error && !hasShownError.current) {
      showError(error);
      hasShownError.current = true;
      reportPageError(error);
    }
  }, [error, showError, reportPageError]);

  // Report page performance
  useEffect(() => {
    if (!loading) {
      reportPagePerformance({ loadTime: 2000 });
    }
  }, [loading, reportPagePerformance]);

  // Show loading if date context is not loaded yet
  if (!dateLoaded) {
    return (
      <div className="p-3 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Notification Component */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <div className="mb-3 sm:mb-6">
        <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-2">
          Dashboard
        </h1>

        <p className="text-gray-600 flex flex-wrap items-center gap-[3px] text-sm sm:text-base">
          Welcome back! Here&apos;s what&apos;s happening with{" "}
          <span className="text-orange-500 flex">Face Wash Fox</span> today.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-32"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        }
      >
        <QuickActions />
      </Suspense>

      {/* Top Sale Chart */}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance ">
              Dashboard Quản Lý Kinh Doanh
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-sm border-[#f16a3f] text-[#f16a3f]"
            >
              Hôm nay: {new Date().toLocaleDateString("vi-VN")}
            </Badge>
          </div>
        </div>

        {/* DOANH SỐ SECTION */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-[#f16a3f]" />
            <h2 className="text-2xl font-bold text-[#334862]">Doanh Số</h2>
          </div>

          {/* KPI Cards */}
          <Card className="border-[#f16a3f]/20 shadow-lg bg-gradient-to-r from-white to-[#f16a3f]/5">
            <CardHeader>
              <CardTitle className="text-orange-500 font-bold text-[25px] pt-2 pl-4">
                Bảng Tổng Doanh Số
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-4 p-3 bg-gradient-to-r from-[#7bdcb5]/20 to-[#00d084]/20 rounded-lg font-semibold text-sm">
                  <div className="col-span-4 text-gray-800">
                    Phương thức thanh toán
                  </div>
                  <div className="col-span-3 text-right text-gray-800">
                    Số tiền
                  </div>
                  <div className="col-span-3 text-center text-gray-800">
                    Tỷ lệ
                  </div>
                  <div className="col-span-2 text-center text-gray-800">GD</div>
                </div>

                {allPaymentMethods
                  .sort((a, b) => b.amount - a.amount)
                  .map((method, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-4 p-3 border border-[#f16a3f]/10 rounded-lg hover:bg-gradient-to-r hover:from-[#f8a0ca]/10 hover:to-[#41d1d9]/10 transition-all duration-300"
                    >
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {method.method === "TM+CK+QT" && (
                            <Banknote className="h-4 w-4 text-[#00d084]" />
                          )}
                          {method.method === "Thanh toán ví" && (
                            <Wallet className="h-4 w-4 text-[#fcb900]" />
                          )}
                          {method.method === "Thẻ Foxie" && (
                            <CreditCard className="h-4 w-4 text-[#9b51e0]" />
                          )}
                          <span className="font-medium">{method.method}</span>
                        </div>
                      </div>
                      <div className="col-span-3 text-right font-semibold">
                        {formatCurrency(method.amount)}
                      </div>
                      <div className="col-span-3 text-center">
                        <span className="text-sm font-medium bg-gradient-to-r from-[#f16a3f] to-[#d26e4b] bg-clip-text text-transparent">
                          {method.percentage}%
                        </span>
                      </div>
                      <div className="col-span-2 text-center text-sm text-muted-foreground">
                        {method.transactions}
                      </div>
                    </div>
                  ))}

                <div className="grid grid-cols-12 gap-4 p-3 bg-[#f16a3f] rounded-lg font-bold border-2 border-[#f16a3f]">
                  <div className="col-span-4 flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-white" />
                    <span className="text-white font-bold">TỔNG CỘNG</span>
                  </div>
                  <div className="col-span-3 text-right text-lg text-white font-bold">
                    {formatCurrency(totalRevenue)}
                  </div>
                  <div className="col-span-3 text-center">
                    <span className="text-sm text-white font-bold">100%</span>
                  </div>
                  <div className="col-span-2 text-center text-sm text-white font-bold">
                    {allPaymentMethods.reduce(
                      (sum, method) => sum + method.transactions,
                      0
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-[#0693e3]/20 shadow-lg">
              <CardHeader className="bg-[#0693e3] text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="p-2">
                    <CardTitle className="text-white font-bold">
                      Ranking Chi Nhánh Theo Doanh Số
                    </CardTitle>
                    <CardDescription className="text-white/90 font-medium">
                      Xếp hạng theo TM/CK/QT (triệu VNĐ)
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={showTopRanking ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setShowTopRanking(true)}
                      className="text-xs bg-white text-[#0693e3] hover:bg-gray-100 border-white font-semibold"
                    >
                      Top 10
                    </Button>
                    <Button
                      variant={!showTopRanking ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setShowTopRanking(false)}
                      className="text-xs bg-white text-[#0693e3] hover:bg-gray-100 border-white font-semibold"
                    >
                      Bottom 10
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={getRankingChartData()}
                    layout="horizontal"
                    margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={showTopRanking ? "#0693e3" : "#cf2e2e"} stopOpacity={0.8}/>
                        <stop offset="100%" stopColor={showTopRanking ? "#41d1d9" : "#ff6b6b"} stopOpacity={0.6}/>
                      </linearGradient>
                      <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(241,106,63,0.1)" stopOpacity={0}/>
                        <stop offset="100%" stopColor="rgba(241,106,63,0.2)" stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                    
                    <CartesianGrid
                      strokeDasharray="2 4"
                      stroke="url(#gridGradient)"
                      strokeWidth={1}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                      formatter={(value: number | string) => {
                        if (typeof value === "number" && !isNaN(value)) {
                          return [`${value.toFixed(1)}M VNĐ`, "Doanh thu"];
                        }
                        return ["0M VNĐ", "Doanh thu"];
                      }}
                      labelFormatter={(
                        label: string,
                        payload: readonly { payload?: { fullName: string; growth: number } }[]
                      ) => {
                        if (payload && payload[0]?.payload) {
                          const data = payload[0].payload;
                          return `${data.fullName} (${
                            data.growth > 0 ? "+" : ""
                          }${data.growth}%)`;
                        }
                        return label;
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="url(#revenueGradient)"
                      radius={[0, 8, 8, 0]}
                      stroke={showTopRanking ? "#0693e3" : "#cf2e2e"}
                      strokeWidth={1}
                      animationBegin={0}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-[#00d084]/20 shadow-lg">
              <CardHeader className="bg-[#00d084] text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="p-2">
                    <CardTitle className="text-white font-bold">
                      Ranking Chi Nhánh Theo Thẻ Foxie
                    </CardTitle>
                    <CardDescription className="text-white/90 font-medium">
                      Xếp hạng thanh toán thẻ Foxie (triệu VNĐ)
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={showTopFoxieRanking ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setShowTopFoxieRanking(true)}
                      className="text-xs bg-white text-[#00d084] hover:bg-gray-100 border-white font-semibold"
                    >
                      Top 10
                    </Button>
                    <Button
                      variant={!showTopFoxieRanking ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setShowTopFoxieRanking(false)}
                      className="text-xs bg-white text-[#00d084] hover:bg-gray-100 border-white font-semibold"
                    >
                      Bottom 10
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={getFoxieRankingChartData()}
                    layout="horizontal"
                    margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="foxieGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={showTopFoxieRanking ? "#00d084" : "#fcb900"} stopOpacity={0.9}/>
                        <stop offset="100%" stopColor={showTopFoxieRanking ? "#7bdcb5" : "#fdd835"} stopOpacity={0.7}/>
                      </linearGradient>
                      <linearGradient id="foxieGridGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(0,208,132,0.05)" stopOpacity={0}/>
                        <stop offset="100%" stopColor="rgba(0,208,132,0.15)" stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                    
                    <CartesianGrid 
                      strokeDasharray="2 4" 
                      stroke="url(#foxieGridGradient)" 
                      strokeWidth={1}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                      formatter={(value: number | string) => [
                        `${Number(value).toFixed(1)}M VNĐ`,
                        "Thanh toán Foxie",
                      ]}
                      labelFormatter={(
                        label: string,
                        payload: readonly { payload?: { fullName: string; growth: number } }[]
                      ) => {
                        if (payload && payload[0]?.payload) {
                          const data = payload[0].payload;
                          return `${data.fullName} (${
                            data.growth > 0 ? "+" : ""
                          }${data.growth}%)`;
                        }
                        return label;
                      }}
                    />
                    <Bar
                      dataKey="foxiePayment"
                      fill="url(#foxieGradient)"
                      radius={[0, 8, 8, 0]}
                      stroke={showTopFoxieRanking ? "#00d084" : "#fcb900"}
                      strokeWidth={1}
                      animationBegin={200}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Service & Foxie Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-[#41d1d9]/20 shadow-lg bg-gradient-to-br from-white to-[#41d1d9]/10">
              <CardHeader className="bg-[#0891b2] text-white rounded-t-lg p-2">
                <CardTitle className="text-white font-bold">
                  % Sản Phẩm Theo Cửa Hàng
                </CardTitle>
                <CardDescription className="text-white/90 font-medium">
                  Phân bố sản phẩm theo từng cửa hàng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <defs>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <Pie
                      data={productDataByDistrict}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                      labelLine={false}
                      animationBegin={0}
                      animationDuration={2000}
                      animationEasing="ease-out"
                    >
                      {productDataByDistrict.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="rgba(255,255,255,0.8)"
                          strokeWidth={2}
                          filter="url(#glow)"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                      formatter={(value) => [`${value}%`, "Tỷ lệ"]} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-[#9b51e0]/20 shadow-lg bg-gradient-to-br from-white to-[#9b51e0]/10">
              <CardHeader className="bg-[#9b51e0] text-white rounded-t-lg p-2">
                <CardTitle className="text-white font-bold">
                  % Thẻ Foxie Theo Cửa Hàng
                </CardTitle>
                <CardDescription className="text-white/90 font-medium">
                  Phân bố thẻ Foxie theo từng cửa hàng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <defs>
                      <filter id="foxieGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <Pie
                      data={foxieCardDataByDistrict}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                      labelLine={false}
                      animationBegin={300}
                      animationDuration={2000}
                      animationEasing="ease-out"
                    >
                      {foxieCardDataByDistrict.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="rgba(255,255,255,0.8)"
                          strokeWidth={2}
                          filter="url(#foxieGlow)"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                      formatter={(value) => [`${value}%`, "Tỷ lệ"]} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-[#00b894]/20 shadow-lg bg-gradient-to-br from-white to-[#00b894]/10">
              <CardHeader className="bg-[#00b894] text-white rounded-t-lg p-2">
                <CardTitle className="text-white font-bold">
                  % Dịch Vụ Theo Cửa Hàng
                </CardTitle>
                <CardDescription className="text-white/90 font-medium">
                  Phân bố dịch vụ theo cửa hàng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <defs>
                      <filter id="serviceGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <Pie
                      data={serviceDataByDistrict}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                      labelLine={false}
                      animationBegin={600}
                      animationDuration={2000}
                      animationEasing="ease-out"
                    >
                      {serviceDataByDistrict.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="rgba(255,255,255,0.8)"
                          strokeWidth={2}
                          filter="url(#serviceGlow)"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                      formatter={(value) => [`${value}%`, "Tỷ lệ"]} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-[#fcb900]/20 shadow-lg bg-gradient-to-br from-white to-[#fcb900]/10">
              <CardHeader className="bg-[#d97706] text-white rounded-t-lg p-2">
                <CardTitle className="text-white font-bold">
                  Tiến Độ Thẻ Foxie
                </CardTitle>
                <CardDescription className="text-white/90 font-medium">
                  Số tiền chưa sử dụng tổng thể
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Đã sử dụng</span>
                    <span className="font-semibold text-[#f16a3f]">68%</span>
                  </div>
                  <Progress value={68} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Còn lại:{" "}
                    <span className="text-[#f16a3f] font-semibold">
                      {formatCurrency(25000000)}
                    </span>
                  </p>
                </div>
                <div className="pt-2 border-t border-[#fcb900]/20">
                  <p className="text-sm font-medium">Tổng giá trị thẻ</p>
                  <p className="text-lg font-bold text-[#f16a3f]">
                    {formatCurrency(78000000)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#7bdcb5]/20 shadow-lg bg-gradient-to-br from-[#7bdcb5]/20 via-[#41d1d9]/20 to-[#0693e3]/20 relative overflow-hidden">
              <CardHeader className="bg-[#00b894] text-white rounded-t-lg p-4">
                <CardTitle className="text-white font-bold">
                  Target KPI
                </CardTitle>
                <CardDescription className="text-white font-medium">
                  Tiến độ hoàn thành mục tiêu doanh thu tháng
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 bg-gradient-to-br from-[#7bdcb5]/10 via-[#41d1d9]/10 to-[#0693e3]/10">
                <div className="space-y-6">
                  {/* Scale markers */}
                  <div className="relative">
                    <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                      <span>0M</span>
                      <span>100M</span>
                      <span>250M</span>
                      <span>400M</span>
                      <span>500M</span>
                    </div>

                    {/* Progress bar container */}
                    <div className="relative h-12 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      {/* Gradient progress fill */}
                      <div
                        className="h-full bg-gradient-to-r from-[#ff6b6b] via-[#ff9500] to-[#fcb900] rounded-full transition-all duration-1000 ease-out shadow-lg"
                        style={{ width: `${currentPercentage}%` }}
                      />

                      <div
                        className="absolute top-0 h-full w-1 bg-gray-800 shadow-lg z-10"
                        style={{ left: `${dailyTargetPercentage}%` }}
                      />

                      {/* Scale tick marks */}
                      <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center px-1">
                        <div className="w-0.5 h-8 bg-gray-400"></div>
                        <div className="w-0.5 h-8 bg-gray-400"></div>
                        <div className="w-0.5 h-6 bg-gray-600 font-bold"></div>
                        <div className="w-0.5 h-8 bg-gray-400"></div>
                        <div className="w-0.5 h-8 bg-gray-400"></div>
                      </div>
                    </div>

                    {/* Current value indicator */}
                    <div className="mt-4 text-center">
                      <p className="text-2xl font-bold text-gray-800">
                        {formatCurrency(currentRevenue)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {currentPercentage.toFixed(1)}% hoàn thành mục tiêu
                        tháng
                      </p>
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <div
                          className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                          style={{
                            backgroundColor: statusColors[targetStatus].bg,
                          }}
                        >
                          {statusColors[targetStatus].text}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Mục tiêu</p>
                      <p className="text-lg font-bold text-[#0693e3]">
                        {formatCurrency(monthlyTarget)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Cần hôm nay</p>
                      <p className="text-lg font-bold text-gray-800">
                        {formatCurrency(dailyTargetForToday)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Còn lại</p>
                      <p className="text-lg font-bold text-[#ff6b6b]">
                        {formatCurrency(remainingTarget)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <div className="w-3 h-3 bg-gray-800 rounded"></div>
                      <span className="text-gray-700 font-medium">
                        Mục tiêu hôm nay: {formatCurrency(dailyTargetForToday)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* KHÁCH HÀNG SECTION */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-[#f16a3f]" />
            <h2 className="text-2xl font-bold text-[#334862]">Khách Hàng</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-[#00d084]/20 shadow-lg bg-gradient-to-br from-white to-[#00d084]/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Khách Mới Hôm Nay
                </CardTitle>
                <Users className="h-4 w-4 text-[#00d084]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#f16a3f]">24</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-[#00d084] font-semibold">+18%</span> so
                  với hôm qua
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#0693e3]/20 shadow-lg bg-gradient-to-br from-white to-[#0693e3]/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Khách Cũ Quay Lại
                </CardTitle>
                <Users className="h-4 w-4 text-[#0693e3]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#f16a3f]">156</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-[#00d084] font-semibold">+5%</span> so
                  với hôm qua
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#9b51e0]/20 shadow-lg bg-gradient-to-br from-white to-[#9b51e0]/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng Khách Hàng
                </CardTitle>
                <Users className="h-4 w-4 text-[#9b51e0]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#f16a3f]">2,847</div>
                <p className="text-xs text-muted-foreground">
                  Tích lũy đến nay
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Nguồn Khách Mới</CardTitle>
                <CardDescription>Phân loại theo kênh tiếp cận</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <defs>
                      <filter id="customerGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <Pie
                      data={customerSourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={80}
                      paddingAngle={3}
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={2000}
                      animationEasing="ease-out"
                    >
                      {customerSourceData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="rgba(255,255,255,0.8)"
                          strokeWidth={2}
                          filter="url(#customerGlow)"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nguồn Khách Cũ</CardTitle>
                <CardDescription>Kênh quay lại của khách cũ</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <defs>
                      <filter id="oldCustomerGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <Pie
                      data={[
                        { name: "Trực tiếp", value: 45, color: "#9b51e0" },
                        { name: "Điện thoại", value: 32, color: "#f78da7" },
                        { name: "App", value: 23, color: "#41d1d9" },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={80}
                      paddingAngle={3}
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      dataKey="value"
                      animationBegin={200}
                      animationDuration={2000}
                      animationEasing="ease-out"
                    >
                      {[
                        { name: "Trực tiếp", value: 45, color: "#9b51e0" },
                        { name: "Điện thoại", value: 32, color: "#f78da7" },
                        { name: "App", value: 23, color: "#41d1d9" },
                      ].map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="rgba(255,255,255,0.8)"
                          strokeWidth={2}
                          filter="url(#oldCustomerGlow)"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ĐẶT LỊCH SECTION */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-[#f16a3f]" />
            <h2 className="text-2xl font-bold text-[#334862]">Đặt Lịch</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-[#41d1d9]/20 shadow-lg bg-gradient-to-br from-white to-[#41d1d9]/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng Đặt Lịch
                </CardTitle>
                <Calendar className="h-4 w-4 text-[#41d1d9]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#f16a3f]">89</div>
                <p className="text-xs text-muted-foreground">Hôm nay</p>
              </CardContent>
            </Card>

            <Card className="border-[#fcb900]/20 shadow-lg bg-gradient-to-br from-white to-[#fcb900]/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Đã Sử Dụng
                </CardTitle>
                <Clock className="h-4 w-4 text-[#fcb900]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#f16a3f]">67</div>
                <p className="text-xs text-muted-foreground">75% hoàn thành</p>
              </CardContent>
            </Card>

            <Card className="border-[#ff6900]/20 shadow-lg bg-gradient-to-br from-white to-[#ff6900]/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Đang Sử Dụng
                </CardTitle>
                <Clock className="h-4 w-4 text-[#ff6900]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#f16a3f]">22</div>
                <p className="text-xs text-muted-foreground">Đang thực hiện</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* DỊCH VỤ SECTION */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Star className="h-6 w-6 text-[#f16a3f]" />
            <h2 className="text-2xl font-bold text-[#334862]">Dịch Vụ</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-[#f78da7]/20 shadow-lg bg-gradient-to-br from-white to-[#f78da7]/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Dịch Vụ Đang Làm
                </CardTitle>
                <Star className="h-4 w-4 text-[#f78da7]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#f16a3f]">34</div>
                <p className="text-xs text-muted-foreground">
                  Combo & dịch vụ lẻ
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#8ed1fc]/20 shadow-lg bg-gradient-to-br from-white to-[#8ed1fc]/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Dịch Vụ Đã Làm
                </CardTitle>
                <Star className="h-4 w-4 text-[#8ed1fc]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#f16a3f]">156</div>
                <p className="text-xs text-muted-foreground">
                  Hoàn thành hôm nay
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#9b51e0]/20 shadow-lg bg-gradient-to-br from-white to-[#9b51e0]/10">
            <CardHeader className="bg-[#9b51e0] text-white rounded-t-lg p-2">
              <CardTitle className="text-white font-bold">
                Top 10 Dịch Vụ Bán Chạy
              </CardTitle>
              <CardDescription className="text-white/90 font-medium">
                Xếp hạng theo doanh thu (triệu VNĐ)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={topServices
                    .map((service) => ({
                      name: service.name
                        .replace("Massage ", "")
                        .replace("Chăm sóc ", "")
                        .replace("Gội đầu ", ""),
                      revenue: service.revenue / 1000000,
                      growth: service.growth,
                      fullName: service.name,
                    }))
                    .reverse()}
                  layout="horizontal"
                  margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="serviceRevenueGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#9b51e0" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#a29bfe" stopOpacity={0.7}/>
                    </linearGradient>
                    <linearGradient id="serviceGridGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(155,81,224,0.05)" stopOpacity={0}/>
                      <stop offset="100%" stopColor="rgba(155,81,224,0.15)" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid 
                    strokeDasharray="2 4" 
                    stroke="url(#serviceGridGradient)" 
                    strokeWidth={1}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                    formatter={(value: number | string) => [
                      `${Number(value).toFixed(1)}M VNĐ`,
                      "Doanh thu",
                    ]}
                    labelFormatter={(
                      label: string,
                      payload: readonly { payload?: { fullName: string; growth: number } }[]
                    ) => {
                      if (payload && payload[0]?.payload) {
                        const data = payload[0].payload;
                        return `${data.fullName} (${
                          data.growth > 0 ? "+" : ""
                        }${data.growth}%)`;
                      }
                      return label;
                    }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="url(#serviceRevenueGradient)" 
                    radius={[0, 8, 8, 0]}
                    stroke="#9b51e0"
                    strokeWidth={1}
                    animationBegin={0}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
