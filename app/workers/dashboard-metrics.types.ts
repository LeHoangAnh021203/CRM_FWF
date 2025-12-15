export interface KPIEntry {
  dateLabel: string;
  isoDate: string;
  total: number;
}

export interface DashboardWorkerInput {
  kpiDailySeries: KPIEntry[] | null;
  selectedDateIso: string;
  endDateIso: string;
  todayIso: string;
  specialHolidays: number[];
  companyMonthTarget: number;
  weekendTargetPerDay: number;
  holidayTargetPerDay: number;
  actualRevenueToday: number | null;
  actualRevenueMTD: number | null;
}

export interface DailyGrowthPoint {
  day: string;
  date: string;
  revenue: number;
  target: number;
  percentage: number;
  isToday: boolean;
}

export interface DashboardWorkerResult {
  targetUntilNow: number;
  currentRevenue: number;
  remainingTarget: number;
  currentPercentage: number;
  dailyTargetForCurrentDay: number;
  dailyTargetForSelectedDay: number;
  dailyKpiRevenue: number;
  dailyPercentage: number;
  dailyKpiLeft: number;
  dailyStatus: "ahead" | "ontrack" | "behind";
  monthlyStatus: "ahead" | "ontrack" | "behind";
  dailyKpiGrowthData: DailyGrowthPoint[];
  selectedDay: number;
  lastDay: number;
  daysInMonth: number;
}

export type DashboardWorkerRequestMessage = {
  type: "compute";
  payload: DashboardWorkerInput;
};

export type DashboardWorkerResponseMessage =
  | { type: "success"; payload: DashboardWorkerResult }
  | { type: "error"; error: string };
