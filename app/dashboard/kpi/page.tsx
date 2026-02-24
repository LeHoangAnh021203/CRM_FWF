"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import KPIChart from "@/app/dashboard/KPIChart";
import GrowthByPaymentChart from "@/app/dashboard/GrowthByPaymentChart";
import { PaymentMethod } from "@/app/dashboard/TotalSaleTable";
import { ApiService } from "@/app/lib/api-service";
import { toDdMmYyyy, toIsoYyyyMmDd } from "@/app/lib/date";
import { getActualStockIds, parseNumericValue } from "@/app/constants/branches";
import { useBranchFilter } from "@/app/contexts/BranchContext";
import { useDateRange } from "@/app/contexts/DateContext";

interface SalesSummaryData {
  totalRevenue: string;
  cash: string;
  transfer: string;
  card: string;
  actualRevenue: string;
  foxieUsageRevenue: string;
  walletUsageRevenue: string;
  toPay: string;
  debt: string;
}

interface DailyKpiPoint {
  day: string;
  date: string;
  revenue: number;
  target: number;
  percentage: number;
  isToday: boolean;
}

interface PaymentMonthlyData {
  month: string;
  tmckqt: number;
  foxie: number;
  vi: number;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const formatCurrency = (value: number) => currencyFormatter.format(value);
const formatIsoToDdMm = (iso: string) => (iso ? iso.split("-").reverse().join("/") : iso);

const DEFAULT_MONTH_TARGET = 9750000000;

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workerCount = Math.max(1, Math.min(concurrency, items.length));

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (true) {
        const index = cursor++;
        if (index >= items.length) return;
        results[index] = await mapper(items[index], index);
      }
    })
  );

  return results;
}

export default function KpiDashboardPage() {
  const { fromDate, toDate } = useDateRange();
  const { stockId: selectedStockId } = useBranchFilter();

  const actualStockIds = useMemo(() => getActualStockIds(selectedStockId || ""), [selectedStockId]);
  const stockQueryParam = useMemo(() => {
    if (actualStockIds.length === 0) return "&stockId=";
    if (actualStockIds.length === 1) return `&stockId=${actualStockIds[0]}`;
    return `&stockId=${actualStockIds.join(",")}`;
  }, [actualStockIds]);

  const fromDateStr = useMemo(() => (fromDate ? fromDate.split("T")[0] : ""), [fromDate]);
  const toDateStr = useMemo(() => (toDate ? toDate.split("T")[0] : ""), [toDate]);
  const rangeText = useMemo(() => {
    if (!fromDateStr || !toDateStr) return undefined;
    return `từ ${formatIsoToDdMm(fromDateStr)} đến ${formatIsoToDdMm(toDateStr)}`;
  }, [fromDateStr, toDateStr]);

  const [salesSummaryData, setSalesSummaryData] = useState<SalesSummaryData | null>(null);
  const [, setSalesLoading] = useState(true);
  const [, setSalesError] = useState<string | null>(null);

  const [kpiDailySeries, setKpiDailySeries] = useState<Array<{ dateLabel: string; isoDate: string; total: number }> | null>(null);
  const [kpiDailySeriesLoading, setKpiDailySeriesLoading] = useState(true);
  const [kpiDailySeriesError, setKpiDailySeriesError] = useState<string | null>(null);

  const [actualRevenueToday, setActualRevenueToday] = useState<number | null>(null);
  const [actualRevenueMTD, setActualRevenueMTD] = useState<number | null>(null);

  const [kpiViewMode, setKpiViewMode] = useState<"monthly" | "daily">("monthly");
  const [dailyRevenueLoading, setDailyRevenueLoading] = useState(true);
  const [kpiMonthlyRevenueLoading, setKpiMonthlyRevenueLoading] = useState(true);

  const currentMonthKeyForHoliday = useMemo(() => {
    const now = toDate ? new Date(toDate.split("T")[0]) : new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, [toDate]);

  const [specialHolidays, setSpecialHolidays] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(`kpi_special_holidays_${currentMonthKeyForHoliday}`);
      if (!raw) return [];
      const arr = JSON.parse(raw) as number[];
      return Array.isArray(arr) ? arr.filter((d) => Number.isFinite(d)) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(`kpi_special_holidays_${currentMonthKeyForHoliday}`);
      if (!raw) {
        setSpecialHolidays([]);
        return;
      }
      const arr = JSON.parse(raw) as number[];
      setSpecialHolidays(Array.isArray(arr) ? arr.filter((d) => Number.isFinite(d)) : []);
    } catch {
      setSpecialHolidays([]);
    }
  }, [currentMonthKeyForHoliday]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        `kpi_special_holidays_${currentMonthKeyForHoliday}`,
        JSON.stringify(specialHolidays)
      );
    } catch {
      // ignore storage errors
    }
  }, [specialHolidays, currentMonthKeyForHoliday]);

  const [userMonthlyTarget, setUserMonthlyTarget] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("kpi_monthly_target");
    return stored ? Number(stored) : null;
  });

  const COMPANY_MONTH_TARGET = userMonthlyTarget ?? DEFAULT_MONTH_TARGET;

  const handleMonthlyTargetChange = useCallback((target: number) => {
    setUserMonthlyTarget(target);
    if (typeof window === "undefined") return;
    localStorage.setItem("kpi_monthly_target", target.toString());
  }, []);

  const today = useMemo(() => new Date(), []);
  const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
  const todayDay = today.getDate();
  const endDateObj = useMemo(() => {
    if (!toDateStr) return null;
    return new Date(toDateStr);
  }, [toDateStr]);
  const daysInMonth = endDateObj
    ? new Date(endDateObj.getFullYear(), endDateObj.getMonth() + 1, 0).getDate()
    : 0;
  const lastDay = endDateObj ? endDateObj.getDate() : 0;
  const year = endDateObj ? endDateObj.getFullYear() : today.getFullYear();
  const month = endDateObj ? endDateObj.getMonth() : today.getMonth();
  const holidayDaysSet = useMemo(
    () =>
      new Set<number>(
        specialHolidays.map((d) => Math.max(1, Math.min(d, daysInMonth)))
      ),
    [specialHolidays, daysInMonth]
  );

  let holidayDaysCount = 0;
  let weekendDaysCount = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const dow = new Date(year, month, day).getDay();
    const isHoliday = holidayDaysSet.has(day);
    const isWeekend = dow === 0 || dow === 6;
    if (isHoliday) holidayDaysCount++;
    if (isWeekend && !isHoliday) weekendDaysCount++;
  }

  const weekendTargetPerDay = 500000000;
  const holidayTargetPerDay = 600000000;
  const totalFixedTarget =
    holidayDaysCount * holidayTargetPerDay + weekendDaysCount * weekendTargetPerDay;
  const weekdayDaysCount = Math.max(0, daysInMonth - holidayDaysCount - weekendDaysCount);
  const weekdayTargetPerDay = weekdayDaysCount > 0
    ? Math.max(0, (COMPANY_MONTH_TARGET - totalFixedTarget) / weekdayDaysCount)
    : 0;

  const getDailyTargetForDay = useCallback(
    (day: number) => {
      if (daysInMonth === 0 || !endDateObj) return 0;
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if (holidayDaysSet.has(day)) return holidayTargetPerDay;
      if (dayOfWeek === 0 || dayOfWeek === 6) return weekendTargetPerDay;
      return weekdayTargetPerDay;
    },
    [
      daysInMonth,
      endDateObj,
      holidayDaysSet,
      month,
      weekdayTargetPerDay,
      weekendTargetPerDay,
      holidayTargetPerDay,
      year,
    ]
  );

  const dailyTargetForCurrentDay = todayDay > 0 ? getDailyTargetForDay(todayDay) : 0;

  const targetUntilNow = useMemo(() => {
    if (daysInMonth === 0 || lastDay === 0 || !endDateObj) return 0;
    let sum = 0;
    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if (holidayDaysSet.has(day)) {
        sum += holidayTargetPerDay;
      } else if (dayOfWeek === 0 || dayOfWeek === 6) {
        sum += weekendTargetPerDay;
      } else {
        sum += weekdayTargetPerDay;
      }
    }
    return sum;
  }, [daysInMonth, endDateObj, holidayDaysSet, lastDay, month, weekdayTargetPerDay, weekendTargetPerDay, year]);

  const selectedDay = endDateObj ? endDateObj.getDate() : todayDay;
  const selectedDateStr = toDateStr || todayDateStr;
  const selectedDayTarget = selectedDay > 0 ? getDailyTargetForDay(selectedDay) : 0;
  const dailyTargetForSelectedDay = selectedDayTarget || dailyTargetForCurrentDay;
  const dailyKpiDateStr = selectedDateStr;

  const dailyKpiRevenue = actualRevenueToday ?? (kpiDailySeries && dailyKpiDateStr
    ? kpiDailySeries.find((entry) => entry.isoDate === dailyKpiDateStr)?.total || 0
    : 0);
  const dailyPercentage = dailyTargetForSelectedDay > 0
    ? (dailyKpiRevenue / dailyTargetForSelectedDay) * 100
    : 0;
  const dailyKpiLeft = Math.max(0, dailyTargetForSelectedDay - dailyKpiRevenue);

  const currentRevenue = actualRevenueMTD ?? (() => {
    if (!kpiDailySeries || !toDate || !endDateObj) return 0;
    const monthKey = `${endDateObj.getFullYear()}-${String(
      endDateObj.getMonth() + 1
    ).padStart(2, "0")}`;
    let sum = 0;
    for (const entry of kpiDailySeries) {
      if (entry.isoDate.startsWith(monthKey)) {
        const entryDay = Number(entry.isoDate.split("-")[2]);
        if (entryDay <= lastDay) sum += entry.total;
      }
    }
    return sum;
  })();

  const currentPercentage = targetUntilNow > 0 ? (currentRevenue / targetUntilNow) * 100 : 0;
  const remainingTarget = Math.max(0, targetUntilNow - currentRevenue);

  const dailyKpiGrowthData = useMemo<DailyKpiPoint[]>(() => {
    if (!kpiDailySeries || kpiDailySeries.length === 0) return [];
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return kpiDailySeries.map((entry) => {
      const [yyyy, mm, dd] = entry.isoDate.split("-");
      const jsDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      const targetForThisDay = getDailyTargetForDay(Number(dd));
      const percentage = targetForThisDay > 0 ? (entry.total / targetForThisDay) * 100 : 0;
      return {
        day: dayNames[jsDate.getDay()],
        date: entry.dateLabel,
        revenue: entry.total,
        target: targetForThisDay,
        percentage,
        isToday: jsDate.toDateString() === today.toDateString(),
      };
    });
  }, [getDailyTargetForDay, kpiDailySeries, today]);

  const dailyStatus = dailyTargetForSelectedDay === 0
    ? "ontrack"
    : dailyKpiRevenue >= dailyTargetForSelectedDay
      ? dailyKpiRevenue > dailyTargetForSelectedDay * 1.1
        ? "ahead"
        : "ontrack"
      : "behind";

  const monthlyStatus = targetUntilNow === 0
    ? "ontrack"
    : currentRevenue >= targetUntilNow
      ? currentRevenue > targetUntilNow * 1.1
        ? "ahead"
        : "ontrack"
      : "behind";

  const paymentMethods = useMemo<PaymentMethod[]>(() => {
    if (!salesSummaryData) return [];
    const totalRevenue = parseNumericValue(salesSummaryData.totalRevenue);
    const cashAmount = parseNumericValue(salesSummaryData.cash);
    const transferAmount = parseNumericValue(salesSummaryData.transfer);
    const cardAmount = parseNumericValue(salesSummaryData.card);
    const foxieAmount = Math.abs(parseNumericValue(salesSummaryData.foxieUsageRevenue));
    const walletAmount = Math.abs(parseNumericValue(salesSummaryData.walletUsageRevenue));

    return [
      {
        method: "TM+CK+QT",
        amount: cashAmount + transferAmount + cardAmount,
        percentage: totalRevenue > 0
          ? Math.round(((cashAmount + transferAmount + cardAmount) / totalRevenue) * 100)
          : 0,
        transactions: Math.floor((cashAmount + transferAmount + cardAmount) / 100000),
      },
      {
        method: "Thanh toán ví",
        amount: walletAmount,
        percentage: totalRevenue > 0 ? Math.round((walletAmount / totalRevenue) * 100) : 0,
        transactions: Math.floor(walletAmount / 100000),
      },
      {
        method: "Thẻ Foxie",
        amount: foxieAmount,
        percentage: totalRevenue > 0 ? Math.round((foxieAmount / totalRevenue) * 100) : 0,
        transactions: Math.floor(foxieAmount / 100000),
      },
    ];
  }, [salesSummaryData]);


  const [paymentGrowthByMonth, setPaymentGrowthByMonth] = useState<PaymentMonthlyData[]>([]);
  const [compareFromDay, setCompareFromDay] = useState(1);
  const [compareToDay, setCompareToDay] = useState(31);
  const [compareMonth, setCompareMonth] = useState("");
  const [month1, setMonth1] = useState<string>("");
  const [month2, setMonth2] = useState<string>("");
  const [month1FromDay, setMonth1FromDay] = useState(1);
  const [month1ToDay, setMonth1ToDay] = useState(31);
  const [month2FromDay, setMonth2FromDay] = useState(1);
  const [month2ToDay, setMonth2ToDay] = useState(31);

  const monthCacheRef = useRef<Map<string, { data: PaymentMonthlyData; timestamp: number }>>(new Map());

  useEffect(() => {
    monthCacheRef.current.clear();
    setPaymentGrowthByMonth([]);
  }, [selectedStockId]);

  const allMonths = useMemo(
    () => paymentGrowthByMonth.map((entry) => entry.month),
    [paymentGrowthByMonth]
  );
  const currentMonthKey = allMonths.length > 0 ? allMonths[allMonths.length - 1] : "";

  useEffect(() => {
    if (!compareMonth || compareMonth === currentMonthKey) {
      const fallback = allMonths.find((m) => m !== currentMonthKey);
      if (fallback) setCompareMonth(fallback);
    }
  }, [allMonths, compareMonth, currentMonthKey]);

  useEffect(() => {
    if (!month1 && paymentGrowthByMonth.length > 0) {
      setMonth1(paymentGrowthByMonth[0].month);
    }
    if (!month2 && paymentGrowthByMonth.length > 1) {
      setMonth2(paymentGrowthByMonth[paymentGrowthByMonth.length - 1].month);
    }
  }, [month1, month2, paymentGrowthByMonth]);

  const fetchSingleMonth = useCallback(
    async (monthKey: string, month: string, year: number): Promise<PaymentMonthlyData> => {
      const cached = monthCacheRef.current.get(monthKey);
      const now = Date.now();
      const cacheDuration = 10 * 60 * 1000;
      if (cached && now - cached.timestamp < cacheDuration) {
        setPaymentGrowthByMonth((prev) => {
          if (prev.some((entry) => entry.month === monthKey)) return prev;
          const updated = [...prev, cached.data].sort((a, b) => {
            const [mA, yA] = a.month.split("/").map(Number);
            const [mB, yB] = b.month.split("/").map(Number);
            if (yA !== yB) return yA - yB;
            return mA - mB;
          });
          return updated;
        });
        return cached.data;
      }

      const lastDayOfMonth = new Date(year, Number(month), 0).getDate();
      const startDate = `01/${month}/${year}`;
      const endDate = `${lastDayOfMonth}/${month}/${year}`;

      const parse = (value: string | number | undefined) => {
        if (typeof value === "string") {
          return Number((value || "").replace(/[^\d.-]/g, "")) || 0;
        }
        return Number(value) || 0;
      };

      try {
        const res = await ApiService.getDirect(
          `real-time/sales-summary?dateStart=${startDate}&dateEnd=${endDate}${stockQueryParam}`
        );
        const parsed = res as {
          cash?: string | number;
          transfer?: string | number;
          card?: string | number;
          foxieUsageRevenue?: string | number;
          walletUsageRevenue?: string | number;
        };
        const data: PaymentMonthlyData = {
          month: monthKey,
          tmckqt: parse(parsed.cash) + parse(parsed.transfer) + parse(parsed.card),
          foxie: Math.abs(parse(parsed.foxieUsageRevenue)),
          vi: Math.abs(parse(parsed.walletUsageRevenue)),
        };

        monthCacheRef.current.set(monthKey, {
          data,
          timestamp: Date.now(),
        });

        setPaymentGrowthByMonth((prev) => {
          if (prev.some((entry) => entry.month === monthKey)) return prev;
          const updated = [...prev, data].sort((a, b) => {
            const [mA, yA] = a.month.split("/").map(Number);
            const [mB, yB] = b.month.split("/").map(Number);
            if (yA !== yB) return yA - yB;
            return mA - mB;
          });
          return updated;
        });

        return data;
      } catch (err) {
        console.error(`Failed to fetch sales data for ${monthKey}:`, err);
        return { month: monthKey, tmckqt: 0, foxie: 0, vi: 0 };
      }
    },
    [stockQueryParam]
  );

  useEffect(() => {
    let isSubscribed = true;
    async function fetchInitialMonths() {
      const dateNow = new Date();
      const currentMonth = String(dateNow.getMonth() + 1).padStart(2, "0");
      const currentYear = dateNow.getFullYear();
      const currentMonthKey = `${currentMonth}/${currentYear}`;
      const prevDate = new Date(dateNow.getFullYear(), dateNow.getMonth() - 1, 1);
      const prevMonth = String(prevDate.getMonth() + 1).padStart(2, "0");
      const prevYear = prevDate.getFullYear();
      const prevMonthKey = `${prevMonth}/${prevYear}`;

      try {
        const [currentData, prevData] = await Promise.all([
          fetchSingleMonth(currentMonthKey, currentMonth, currentYear),
          fetchSingleMonth(prevMonthKey, prevMonth, prevYear),
        ]);
        if (!isSubscribed) return;
        const initialData = [prevData, currentData].sort((a, b) => {
          const [mA, yA] = a.month.split("/").map(Number);
          const [mB, yB] = b.month.split("/").map(Number);
          if (yA !== yB) return yA - yB;
          return mA - mB;
        });
        setPaymentGrowthByMonth(initialData);
        setCompareMonth(prevMonthKey);
      } catch (err) {
        console.error("Failed to fetch initial months:", err);
      }
    }
    fetchInitialMonths();
    return () => {
      isSubscribed = false;
    };
  }, [fetchSingleMonth]);
  const kpiSeriesStockRef = useRef<string | null>(null);

  useEffect(() => {
    if (!fromDateStr || !toDateStr) return;
    let isMounted = true;
    const fetchSalesSummary = async () => {
      setSalesLoading(true);
      setSalesError(null);
      const startDate = toDdMmYyyy(fromDateStr + "T00:00:00");
      const endDate = toDdMmYyyy(toDateStr + "T23:59:59");

      try {
        let data: SalesSummaryData;
        if (actualStockIds.length > 1) {
          const results = await mapWithConcurrency(
            actualStockIds,
            3,
            async (sid) =>
              (await ApiService.getDirect(
                `real-time/sales-summary-copied?dateStart=${startDate}&dateEnd=${endDate}&stockId=${sid}`
              )) as SalesSummaryData
          );
          const aggregate = (key: keyof SalesSummaryData) =>
            results
              .reduce((sum, entry) => sum + parseNumericValue(entry[key]), 0)
              .toString();
          data = {
            totalRevenue: aggregate("totalRevenue"),
            cash: aggregate("cash"),
            transfer: aggregate("transfer"),
            card: aggregate("card"),
            actualRevenue: aggregate("actualRevenue"),
            foxieUsageRevenue: aggregate("foxieUsageRevenue"),
            walletUsageRevenue: aggregate("walletUsageRevenue"),
            toPay: aggregate("toPay"),
            debt: aggregate("debt"),
          };
        } else {
          data = (await ApiService.getDirect(
            `real-time/sales-summary-copied?dateStart=${startDate}&dateEnd=${endDate}${stockQueryParam}`
          )) as SalesSummaryData;
        }
        if (isMounted) {
          setSalesSummaryData(data);
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : "Không thể tải dữ liệu tổng doanh số";
          setSalesError(message);
        }
      } finally {
        if (isMounted) setSalesLoading(false);
      }
    };

    fetchSalesSummary();
    return () => {
      isMounted = false;
    };
  }, [fromDateStr, toDateStr, stockQueryParam, actualStockIds]);

  useEffect(() => {
    const run = async () => {
      try {
        const today = toDateStr ? new Date(toDateStr) : new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const dayStr = toDdMmYyyy(today);
        const startMonthStr = toDdMmYyyy(firstDay);

        const fetchActualRevenue = async (startDate: string, endDate: string) => {
          if (actualStockIds.length > 1) {
            const results = await mapWithConcurrency(
              actualStockIds,
              3,
              async (sid) =>
                (await ApiService.getDirect(
                  `real-time/get-actual-revenue?dateStart=${startDate}&dateEnd=${endDate}&stockId=${sid}`
                )) as number | string | null | undefined
            );
            let total = 0;
            for (const value of results) {
              total += parseNumericValue(value);
            }
            return total;
          }
          const value = (await ApiService.getDirect(
            `real-time/get-actual-revenue?dateStart=${startDate}&dateEnd=${endDate}${stockQueryParam}`
          )) as number | string | null | undefined;
          return parseNumericValue(value);
        };

        const [dayValue, mtdValue] = await Promise.all([
          fetchActualRevenue(dayStr, dayStr),
          fetchActualRevenue(startMonthStr, dayStr),
        ]);

        setActualRevenueToday(dayValue ?? null);
        setActualRevenueMTD(mtdValue ?? null);
      } catch {

      }
    };
    run();
  }, [fromDateStr, toDateStr, stockQueryParam, actualStockIds]);

  useEffect(() => {
    const fetchDailyRevenue = async () => {
      setDailyRevenueLoading(true);
      const todayStr = toDdMmYyyy(new Date());
      try {
        await ApiService.getDirect(
          `real-time/sales-summary?dateStart=${todayStr}&dateEnd=${todayStr}${stockQueryParam}`
        );
      } catch (err) {
        console.error("Daily revenue fetch error:", err);
      } finally {
        setDailyRevenueLoading(false);
      }
    };
    fetchDailyRevenue();
  }, [stockQueryParam]);

  useEffect(() => {
    const fetchKpiMonthlyRevenue = async () => {
      setKpiMonthlyRevenueLoading(true);
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const startDate = toDdMmYyyy(firstDay);
      const endDate = toDdMmYyyy(today);

      try {
        if (actualStockIds.length > 1) {
          await mapWithConcurrency(actualStockIds, 3, async (sid) => {
            await ApiService.getDirect(
              `real-time/sales-summary?dateStart=${startDate}&dateEnd=${endDate}&stockId=${sid}`
            );
            return null;
          });
        } else {
          await ApiService.getDirect(
            `real-time/sales-summary?dateStart=${startDate}&dateEnd=${endDate}${stockQueryParam}`
          );
        }
      } catch (err) {
        console.error("KPI monthly revenue error:", err);
      } finally {
        setKpiMonthlyRevenueLoading(false);
      }
    };
    fetchKpiMonthlyRevenue();
  }, [stockQueryParam, actualStockIds]);

  useEffect(() => {
    const currentKey = `${selectedStockId}-${stockQueryParam}-${actualStockIds.join(",")}`;
    if (kpiSeriesStockRef.current === currentKey) return;
    kpiSeriesStockRef.current = currentKey;
    let isCancelled = false;

    const fetchDailySeries = async () => {
      setKpiDailySeriesLoading(true);
      setKpiDailySeriesError(null);
      try {
        const todayDate = new Date();
        const firstDayOfMonth = new Date(
          todayDate.getFullYear(),
          todayDate.getMonth(),
          1
        );
        const dates: Date[] = [];
        for (
          let day = new Date(firstDayOfMonth);
          day <= todayDate;
          day.setDate(day.getDate() + 1)
        ) {
          dates.push(new Date(day));
        }

        const parseCurrency = (value: unknown) => {
          if (value === null || value === undefined) return 0;
          if (typeof value === "number") return Number.isNaN(value) ? 0 : value;
          if (typeof value === "string") {
            const cleaned = value.replace(/[^0-9.-]/g, "");
            const parsed = Number(cleaned);
            return Number.isNaN(parsed) ? 0 : parsed;
          }
          const converted = Number(value);
          return Number.isNaN(converted) ? 0 : converted;
        };

        const toIso = (date: Date) => toIsoYyyyMmDd(date);

        const results = await mapWithConcurrency(dates, 2, async (date) => {
            const formatted = toDdMmYyyy(date);
            const fetchPerDate = async () => {
              if (actualStockIds.length > 1) {
                const branchResults: Array<{ cash?: number | string; transfer?: number | string; card?: number | string }> = [];
                for (let i = 0; i < actualStockIds.length; i += 10) {
                  const batch = actualStockIds.slice(i, i + 10);
                  const batchResults = await Promise.all(
                    batch.map(async (sid) =>
                      ApiService.getDirect(
                        `real-time/sales-summary?dateStart=${formatted}&dateEnd=${formatted}&stockId=${sid}`
                      ) as Promise<{ cash?: string | number; transfer?: string | number; card?: string | number }>
                    )
                  );
                  branchResults.push(...batchResults);
                  if (i + 10 < actualStockIds.length) {
                    await new Promise((resolve) => setTimeout(resolve, 50));
                  }
                }
                return branchResults.reduce((sum, entry) => {
                  const cash = parseCurrency(entry.cash);
                  const transfer = parseCurrency(entry.transfer);
                  const card = parseCurrency(entry.card);
                  return sum + cash + transfer + card;
                }, 0);
              }

              const response = await ApiService.getDirect(
                `real-time/sales-summary?dateStart=${formatted}&dateEnd=${formatted}${stockQueryParam}`
              );
              return (
                parseCurrency((response as { cash?: string | number }).cash) +
                parseCurrency((response as { transfer?: string | number }).transfer) +
                parseCurrency((response as { card?: string | number }).card)
              );
            };
            try {
              const total = await fetchPerDate();
              return {
                dateLabel: `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`,
                isoDate: toIso(date),
                total,
              };
            } catch (error) {
              console.error(`KPI series failed for ${formatted}:`, error);
              return {
                dateLabel: `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`,
                isoDate: toIso(date),
                total: 0,
              };
            }
          });

        if (!isCancelled) {
          setKpiDailySeries(results);
          setKpiDailySeriesError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : "Không thể tải dữ liệu KPI";
          setKpiDailySeriesError(message);
          setKpiDailySeries([]);
        }
      } finally {
        if (!isCancelled) setKpiDailySeriesLoading(false);
      }
    };

    fetchDailySeries();
    return () => {
      isCancelled = true;
    };
  }, [selectedStockId, stockQueryParam, actualStockIds]);
  const isDaily = kpiViewMode === "daily";
  const currentStatus = isDaily ? dailyStatus : monthlyStatus;
  const currentDayForDaily = isDaily ? selectedDay : lastDay;
  const chartPercentage = isDaily ? dailyPercentage : currentPercentage;
  const chartRevenue = isDaily ? dailyKpiRevenue : currentRevenue;
  const targetForCurrentDay = isDaily ? dailyTargetForSelectedDay : dailyTargetForCurrentDay;
  const targetForTodayValue = isDaily ? dailyTargetForSelectedDay : targetUntilNow;
  const remainingValue = isDaily ? dailyKpiLeft : remainingTarget;

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 pb-10">
      <header className="space-y-1">
        <p className="text-sm text-gray-500">Tổng hợp KPI và doanh thu theo cài đặt hiện tại.</p>
        <h1 className="text-3xl font-semibold text-gray-900">Báo cáo KPI</h1>
      </header>

      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="px-4 pt-4">
          <h2 className="text-lg font-semibold text-gray-800">Target KPI</h2>
          <p className="text-xs text-gray-500">Tiến độ hoàn thành mục tiêu tháng hiện tại</p>
        </div>
        <div className="p-4 md:p-6">
          <KPIChart
            kpiDailySeriesLoading={kpiDailySeriesLoading}
            kpiDailySeriesError={kpiDailySeriesError}
            dailyKpiGrowthData={dailyKpiGrowthData}
            kpiViewMode={kpiViewMode}
            setKpiViewMode={setKpiViewMode}
            currentDayForDaily={currentDayForDaily}
            currentPercentage={chartPercentage}
            dailyPercentageForCurrentDay={chartPercentage}
            kpiMonthlyRevenueLoading={kpiMonthlyRevenueLoading}
            dailyRevenueLoading={dailyRevenueLoading}
            targetStatus={currentStatus}
            monthlyTarget={COMPANY_MONTH_TARGET}
            onMonthlyTargetChange={handleMonthlyTargetChange}
            specialHolidays={specialHolidays}
            onSpecialHolidaysChange={setSpecialHolidays}
            dailyTargetForCurrentDay={targetForCurrentDay}
            dailyTargetForToday={targetForTodayValue}
            remainingTarget={remainingValue}
            remainingDailyTarget={remainingValue}
            dailyTargetPercentageForCurrentDay={100}
            currentRevenue={chartRevenue}
          />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Tăng trưởng doanh thu theo phương thức</h2>
            <p className="text-sm text-gray-500">So sánh các tháng gần nhất và tùy chỉnh phạm vi ngày</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <GrowthByPaymentChart
            data={paymentGrowthByMonth}
            compareFromDay={compareFromDay}
            compareToDay={compareToDay}
            compareMonth={compareMonth}
            setCompareFromDay={setCompareFromDay}
            setCompareToDay={setCompareToDay}
            setCompareMonth={setCompareMonth}
            onMonthSelect={fetchSingleMonth}
            month1={month1}
            month2={month2}
            month1FromDay={month1FromDay}
            month1ToDay={month1ToDay}
            month2FromDay={month2FromDay}
            month2ToDay={month2ToDay}
            setMonth1={setMonth1}
            setMonth2={setMonth2}
            setMonth1FromDay={setMonth1FromDay}
            setMonth1ToDay={setMonth1ToDay}
            setMonth2FromDay={setMonth2FromDay}
            setMonth2ToDay={setMonth2ToDay}
          />
        </div>
      </section>
    </div>
  );
}

function DailyKpiGrowthTable({ data, loading, error }: { data: DailyKpiPoint[]; loading: boolean; error: string | null }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
        Đang tải dữ liệu KPI...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white px-4 py-6 text-center text-sm text-gray-500">
        Chưa có dữ liệu KPI theo ngày trong khoảng thời gian này.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="grid grid-cols-6 gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <span className="col-span-2">Ngày</span>
        <span className="text-right">Doanh thu</span>
        <span className="text-right">Target</span>
        <span className="text-right">Hoàn thành</span>
      </div>
      <div className="divide-y divide-gray-100">
        {data.map((point) => (
          <div
            key={`${point.date}-${point.day}`}
            className={`grid grid-cols-6 gap-2 px-4 py-3 text-sm ${point.isToday ? "bg-gray-50" : "bg-white"}`}
          >
            <div className="col-span-2 space-y-1">
              <p className="text-xs text-gray-400">{point.day}</p>
              <p className="font-semibold text-gray-900">{point.date}</p>
            </div>
            <div className="text-right font-semibold text-gray-900">{formatCurrency(point.revenue)}</div>
            <div className="text-right text-gray-600">{formatCurrency(point.target)}</div>
            <div className="text-right">
              <span className="font-semibold text-[#f97316]">{point.percentage.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
