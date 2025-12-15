/// <reference lib="webworker" />

import {
  type DashboardWorkerInput,
  type DashboardWorkerRequestMessage,
  type DashboardWorkerResponseMessage,
  type DashboardWorkerResult,
  type KPIEntry,
} from "./dashboard-metrics.types";

const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const formatIso = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const clampDay = (day: number, daysInMonth: number) =>
  Math.max(1, Math.min(day, daysInMonth));

const sumSeriesForMonth = (
  series: KPIEntry[],
  monthKey: string,
  lastDay: number
) => {
  return series.reduce((sum, entry) => {
    if (!entry.isoDate.startsWith(monthKey)) return sum;
    const entryDay = Number(entry.isoDate.split("-")[2]);
    if (Number.isNaN(entryDay) || entryDay > lastDay) return sum;
    return sum + (entry.total || 0);
  }, 0);
};

const computeDailyTarget = (
  day: number,
  daysInMonth: number,
  holidayDaysSet: Set<number>,
  weekendTargetPerDay: number,
  holidayTargetPerDay: number,
  weekdayTargetPerDay: number,
  year: number,
  month: number
) => {
  if (!daysInMonth || day < 1) return 0;
  const safeDay = clampDay(day, daysInMonth);
  if (holidayDaysSet.has(safeDay)) return holidayTargetPerDay;
  const dow = new Date(year, month, safeDay).getDay();
  if (dow === 0 || dow === 6) return weekendTargetPerDay;
  return weekdayTargetPerDay;
};

const computeMetrics = (payload: DashboardWorkerInput): DashboardWorkerResult => {
  const series = payload.kpiDailySeries ?? [];
  const today = payload.todayIso ? new Date(payload.todayIso) : new Date();
  const tempEnd = payload.endDateIso
    ? new Date(payload.endDateIso)
    : new Date(today);
  const selectedEnd = Number.isNaN(tempEnd.getTime()) ? new Date(today) : tempEnd;
  const selectedDayIso = payload.selectedDateIso || formatIso(selectedEnd);
  const tempSelectedDay = new Date(selectedDayIso);
  const selectedDayDate = Number.isNaN(tempSelectedDay.getTime())
    ? new Date(selectedEnd)
    : tempSelectedDay;
  const daysInMonth = new Date(
    selectedEnd.getFullYear(),
    selectedEnd.getMonth() + 1,
    0
  ).getDate();
  const lastDay = clampDay(selectedEnd.getDate(), daysInMonth);
  const selectedDay = clampDay(selectedDayDate.getDate(), daysInMonth);
  const todayDay = today.getDate();

  const holidayDaysSet = new Set<number>(
    (payload.specialHolidays || []).map((day) =>
      clampDay(Math.trunc(day), daysInMonth)
    )
  );

  let holidayDaysCount = 0;
  let weekendDaysCount = 0;
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dow = new Date(
      selectedEnd.getFullYear(),
      selectedEnd.getMonth(),
      day
    ).getDay();
    const isHoliday = holidayDaysSet.has(day);
    const isWeekend = dow === 0 || dow === 6;
    if (isHoliday) holidayDaysCount += 1;
    if (isWeekend && !isHoliday) weekendDaysCount += 1;
  }

  const totalFixedTarget =
    holidayDaysCount * payload.holidayTargetPerDay +
    weekendDaysCount * payload.weekendTargetPerDay;
  const weekdayDaysCount = Math.max(
    0,
    daysInMonth - holidayDaysCount - weekendDaysCount
  );
  const weekdayTargetPerDay = weekdayDaysCount
    ? Math.max(
        0,
        (payload.companyMonthTarget - totalFixedTarget) / weekdayDaysCount
      )
    : 0;

  const getTarget = (day: number) =>
    computeDailyTarget(
      day,
      daysInMonth,
      holidayDaysSet,
      payload.weekendTargetPerDay,
      payload.holidayTargetPerDay,
      weekdayTargetPerDay,
      selectedEnd.getFullYear(),
      selectedEnd.getMonth()
    );

  const dailyTargetForCurrentDay = getTarget(todayDay);
  const dailyTargetForSelectedDay = getTarget(selectedDay) || dailyTargetForCurrentDay;

  const monthKey = `${selectedEnd.getFullYear()}-${String(
    selectedEnd.getMonth() + 1
  ).padStart(2, "0")}`;

  const dailyKpiRevenue =
    typeof payload.actualRevenueToday === "number"
      ? payload.actualRevenueToday
      : series.find((entry) => entry.isoDate === selectedDayIso)?.total ?? 0;

  const currentRevenue =
    typeof payload.actualRevenueMTD === "number"
      ? payload.actualRevenueMTD
      : sumSeriesForMonth(series, monthKey, lastDay);

  let targetUntilNow = 0;
  for (let day = 1; day <= lastDay; day += 1) {
    targetUntilNow += getTarget(day);
  }

  const currentPercentage = targetUntilNow
    ? currentRevenue / targetUntilNow * 100
    : 0;
  const remainingTarget = Math.max(0, targetUntilNow - currentRevenue);

  const dailyPercentage = dailyTargetForSelectedDay
    ? (dailyKpiRevenue / dailyTargetForSelectedDay) * 100
    : 0;
  const dailyKpiLeft = Math.max(0, dailyTargetForSelectedDay - dailyKpiRevenue);

  const statusFor = (actual: number, target: number) => {
    if (!target) return "ontrack" as const;
    if (actual > target * 1.1) return "ahead" as const;
    if (actual >= target) return "ontrack" as const;
    return "behind" as const;
  };

  const dailyStatus = statusFor(dailyKpiRevenue, dailyTargetForSelectedDay);
  const monthlyStatus = statusFor(currentRevenue, targetUntilNow);

  const dailyKpiGrowthData = series.map((entry) => {
    const date = new Date(entry.isoDate);
    const day = date.getDate();
    const target = getTarget(day);
    const dow = date.getDay();
    const percentage = target ? (entry.total / target) * 100 : 0;
    return {
      day: dayNames[dow] ?? "",
      date: entry.dateLabel,
      revenue: entry.total,
      target,
      percentage,
      isToday: formatIso(date) === formatIso(today),
    };
  });

  return {
    targetUntilNow,
    currentRevenue,
    remainingTarget,
    currentPercentage,
    dailyTargetForCurrentDay,
    dailyTargetForSelectedDay,
    dailyKpiRevenue,
    dailyPercentage,
    dailyKpiLeft,
    dailyStatus,
    monthlyStatus,
    dailyKpiGrowthData,
    selectedDay,
    lastDay,
    daysInMonth,
  };
};

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

ctx.addEventListener("message", (event: MessageEvent<DashboardWorkerRequestMessage>) => {
  const request = event.data;
  if (request?.type !== "compute") return;

  try {
    const payload = computeMetrics(request.payload);
    const response: DashboardWorkerResponseMessage = {
      type: "success",
      payload,
    };
    ctx.postMessage(response);
  } catch (error) {
    const response: DashboardWorkerResponseMessage = {
      type: "error",
      error: error instanceof Error ? error.message : "Unknown worker error",
    };
    ctx.postMessage(response);
  }
});

export {};
