import React from "react";
import { ApiService } from "@/app/lib/api-service";
import { useBranchFilter } from "@/app/contexts/BranchContext";
import { getActualStockIds } from "@/app/constants/branches";
import { useWindowWidth } from "@/app/hooks/useWindowWidth";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/app/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from "recharts";
import { ChevronDown } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { fetchChunked, aggregateStockResponses } from "@/app/lib/api-chunking";

interface PaymentMonthlyData {
  month: string; // MM/YYYY
  tmckqt: number;
  foxie: number;
  vi: number;
}

interface GrowthByPaymentChartProps {
  data: PaymentMonthlyData[];
  compareFromDay: number;
  compareToDay: number;
  compareMonth: string;
  setCompareFromDay: (d:number) => void;
  setCompareToDay: (d:number) => void;
  setCompareMonth: (m:string) => void;
  onMonthSelect?: (monthKey: string, month: string, year: number) => Promise<PaymentMonthlyData>;
  // New props for 2 separate month selection
  month1?: string;
  month2?: string;
  month1FromDay?: number;
  month1ToDay?: number;
  month2FromDay?: number;
  month2ToDay?: number;
  setMonth1?: (m: string) => void;
  setMonth2?: (m: string) => void;
  setMonth1FromDay?: (d: number) => void;
  setMonth1ToDay?: (d: number) => void;
  setMonth2FromDay?: (d: number) => void;
  setMonth2ToDay?: (d: number) => void;
}

const METHOD_CONFIG = {
  tmckqt: { name: "TM+CK+QT", color: "black" },
  foxie: { name: "Thẻ Foxie", color: "black" },
  vi: { name: "Thanh toán ví", color: "black" },
};
const COMPARE_COLOR = "#f16a3f";

type MethodKey = keyof typeof METHOD_CONFIG;

export default function GrowthByPaymentChart({
  data,
  compareFromDay,
  compareToDay,
  compareMonth,
  setCompareFromDay,
  setCompareToDay,
  setCompareMonth,
  onMonthSelect,
  month1,
  month2,
  month1FromDay = 1,
  month1ToDay = 31,
  month2FromDay = 1,
  month2ToDay = 31,
  setMonth1,
  setMonth2,
  setMonth1FromDay,
  setMonth1ToDay,
  setMonth2FromDay,
  setMonth2ToDay,
}: GrowthByPaymentChartProps) {
  const width = useWindowWidth();
  const { stockId: selectedStockId } = useBranchFilter();
  const actualStockIds = React.useMemo(() => {
    return getActualStockIds(selectedStockId || "");
  }, [selectedStockId]);
  
  // Helper function to call POST API via proxy (to avoid CORS issues)
  const postViaProxy = React.useCallback(async (endpoint: string, data: unknown) => {
    console.log(`[GrowthByPaymentChart] Calling POST via proxy: ${endpoint}`);
    console.log(`[GrowthByPaymentChart] Request data:`, data);
    
    try {
      const response = await ApiService.post(endpoint, data);
      console.log(`[GrowthByPaymentChart] POST successful`);
      return response;
    } catch (error) {
      console.error(`[GrowthByPaymentChart] POST failed:`, error);
      throw error;
    }
  }, []);
  const isMobile = width < 640; // tailwind sm breakpoint
  const allMonths = React.useMemo(() => data.map(d => d.month), [data]);
  const currentMonth = allMonths.length > 0 ? allMonths[allMonths.length - 1] : "";
  const [loadingMonth, setLoadingMonth] = React.useState<string | null>(null);
  const [loadingMonth1, setLoadingMonth1] = React.useState<string | null>(null);
  const [loadingMonth2, setLoadingMonth2] = React.useState<string | null>(null);
  const [allAvailableMonths, setAllAvailableMonths] = React.useState<string[]>(allMonths);
  const [isMonthPicker1Open, setIsMonthPicker1Open] = React.useState(false);
  const [isMonthPicker2Open, setIsMonthPicker2Open] = React.useState(false);
  const monthPicker1Ref = React.useRef<HTMLDivElement>(null);
  const monthPicker2Ref = React.useRef<HTMLDivElement>(null);
  const trigger1Ref = React.useRef<HTMLDivElement>(null);
  const trigger2Ref = React.useRef<HTMLDivElement>(null);
  
  // Use new 2-month mode if month1 and month2 props are provided (setters must exist)
  // Always use new mode if setters are provided, even if months are empty initially
  const useNewMode = setMonth1 !== undefined && setMonth2 !== undefined && setMonth1 !== null && setMonth2 !== null;

  // Close month pickers when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (!trigger1Ref.current?.contains(target) && !monthPicker1Ref.current?.contains(target)) {
        setIsMonthPicker1Open(false);
      }
      if (!trigger2Ref.current?.contains(target) && !monthPicker2Ref.current?.contains(target)) {
        setIsMonthPicker2Open(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Generate list of available months (last 12 months) for dropdown
  React.useEffect(() => {
    const dateNow = new Date();
    const months: string[] = [];
    for (let i = 0; i < 12; i++) {
      const targetDate = new Date(dateNow.getFullYear(), dateNow.getMonth() - i, 1);
      const month = String(targetDate.getMonth() + 1).padStart(2, "0");
      const year = targetDate.getFullYear();
      months.push(`${month}/${year}`);
    }
    setAllAvailableMonths(months);
  }, []);
  
  // Đảm bảo dropdown tháng luôn valid default
  React.useEffect(() => {
    if (!compareMonth || compareMonth === currentMonth) {
      const fallback = allMonths.find(m => m !== currentMonth) || "";
      if (fallback) setCompareMonth(fallback);
    }
  }, [allMonths, currentMonth, compareMonth, setCompareMonth]);

  // Handle month selection - lazy load if needed (old mode)
  const handleMonthChange = React.useCallback(
    async (selectedMonth: string) => {
      setCompareMonth(selectedMonth);

      if (data.some((d) => d.month === selectedMonth)) {
        return;
      }

      if (onMonthSelect && selectedMonth) {
        setLoadingMonth(selectedMonth);
        try {
          const [monthStr, yearStr] = selectedMonth.split("/");
          await onMonthSelect(selectedMonth, monthStr, Number(yearStr));
        } catch (err) {
          console.error(`Failed to load month ${selectedMonth}:`, err);
        } finally {
          setLoadingMonth(null);
        }
      }
    },
    [data, onMonthSelect, setCompareMonth]
  );

  // Handle month1 selection - lazy load if needed (new mode)
  const handleMonth1Change = React.useCallback(
    async (selectedMonth: string) => {
      if (!setMonth1) return;
      setMonth1(selectedMonth);

      if (data.some((d) => d.month === selectedMonth)) {
        return;
      }

      if (onMonthSelect && selectedMonth) {
        setLoadingMonth1(selectedMonth);
        try {
          const [monthStr, yearStr] = selectedMonth.split("/");
          const fetchedData = await onMonthSelect(
            selectedMonth,
            monthStr,
            Number(yearStr)
          );
          console.log(`✅ Đã tải dữ liệu cho tháng ${selectedMonth}:`, fetchedData);
        } catch (err) {
          console.error(`❌ Không thể tải dữ liệu cho tháng ${selectedMonth}:`, err);
        } finally {
          setLoadingMonth1(null);
        }
      }
    },
    [data, onMonthSelect, setMonth1]
  );

  // Handle month2 selection - lazy load if needed (new mode)
  const handleMonth2Change = React.useCallback(
    async (selectedMonth: string) => {
      if (!setMonth2) return;
      setMonth2(selectedMonth);

      if (data.some((d) => d.month === selectedMonth)) {
        return;
      }

      if (onMonthSelect && selectedMonth) {
        setLoadingMonth2(selectedMonth);
        try {
          const [monthStr, yearStr] = selectedMonth.split("/");
          const fetchedData = await onMonthSelect(
            selectedMonth,
            monthStr,
            Number(yearStr)
          );
          console.log(`✅ Đã tải dữ liệu cho tháng ${selectedMonth}:`, fetchedData);
        } catch (err) {
          console.error(`❌ Không thể tải dữ liệu cho tháng ${selectedMonth}:`, err);
        } finally {
          setLoadingMonth2(null);
        }
      }
    },
    [data, onMonthSelect, setMonth2]
  );

  const [visibleMethods, setVisibleMethods] = React.useState<MethodKey[]>(['tmckqt', 'foxie', 'vi']);
  const [rangeLoading, setRangeLoading] = React.useState(false);
  const [overrideByMonth, setOverrideByMonth] = React.useState<Record<string, { tmckqt: number; foxie: number; vi: number }>>({});
  const [applied, setApplied] = React.useState<{ from: number; to: number; month: string } | null>(null);
  
  // Temporary state for new mode (before applying)
  const [tempMonth1FromDay, setTempMonth1FromDay] = React.useState(month1FromDay || 1);
  const [tempMonth1ToDay, setTempMonth1ToDay] = React.useState(month1ToDay || 31);
  const [tempMonth2FromDay, setTempMonth2FromDay] = React.useState(month2FromDay || 1);
  const [tempMonth2ToDay, setTempMonth2ToDay] = React.useState(month2ToDay || 31);
  const [appliedRange, setAppliedRange] = React.useState<{
    month1: string;
    month2: string;
    month1From: number;
    month1To: number;
    month2From: number;
    month2To: number;
  } | null>(null);
  
  // Sync temp values when props change
  React.useEffect(() => {
    if (month1FromDay !== undefined) setTempMonth1FromDay(month1FromDay);
    if (month1ToDay !== undefined) setTempMonth1ToDay(month1ToDay);
    if (month2FromDay !== undefined) setTempMonth2FromDay(month2FromDay);
    if (month2ToDay !== undefined) setTempMonth2ToDay(month2ToDay);
  }, [month1FromDay, month1ToDay, month2FromDay, month2ToDay]);
  const handleMethodToggle = (method: MethodKey) => {
    setVisibleMethods(prev => prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]);
  };

  // Handle apply button click for new mode
  const handleApplyNewMode = React.useCallback(async () => {
    if (!month1 || !month2 || !setMonth1FromDay || !setMonth1ToDay || !setMonth2FromDay || !setMonth2ToDay) return;
    
    // Update actual state from temp values
    setMonth1FromDay(tempMonth1FromDay);
    setMonth1ToDay(tempMonth1ToDay);
    setMonth2FromDay(tempMonth2FromDay);
    setMonth2ToDay(tempMonth2ToDay);
    
    // Set applied range to trigger fetch
    setAppliedRange({
      month1,
      month2,
      month1From: tempMonth1FromDay,
      month1To: tempMonth1ToDay,
      month2From: tempMonth2FromDay,
      month2To: tempMonth2ToDay,
    });
  }, [month1, month2, tempMonth1FromDay, tempMonth1ToDay, tempMonth2FromDay, tempMonth2ToDay, setMonth1FromDay, setMonth1ToDay, setMonth2FromDay, setMonth2ToDay]);

  // Refetch 2 tháng theo khoảng ngày CHỈ khi người dùng bấm "Áp dụng"
  React.useEffect(() => {
    const fetchRange = async () => {
      if (useNewMode) {
        // New mode: fetch only when applied range is set
        if (!appliedRange) return;
        const { month1: m1, month2: m2, month1From, month1To, month2From, month2To } = appliedRange;
        if (!m1 || !m2) return;
        
        setRangeLoading(true);
        const clampDay = (m: string, d: number) => {
          const [mm, yyyy] = m.split("/");
          const last = new Date(Number(yyyy), Number(mm), 0).getDate();
          return Math.min(Math.max(1, d), last);
        };
        const toDateStr = (m: string, d: number) => {
          const [mm, yyyy] = m.split("/");
          const dd = String(clampDay(m, d)).padStart(2, '0');
          return `${dd}/${mm}/${yyyy}`;
        };
        const build = async (m: string, from: number, to: number) => {
          const [mm, yyyy] = m.split("/");
          
          // Generate array of dates from 'from' day to 'to' day in ISO format (YYYY-MM-DD)
          const dateStrings: string[] = [];
          for (let day = from; day <= to; day++) {
            const date = new Date(Number(yyyy), Number(mm) - 1, day);
            const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            dateStrings.push(isoDate);
          }
          
          // Prepare stockIds for API request
          // For "all branches", API requires [""] (array with empty string), not []
          const requestStockIds = actualStockIds.length === 0 ? [""] : actualStockIds;
          
          // Use chunking for large requests to prevent timeout
          console.log(`[GrowthByPaymentChart] Fetching data for month ${m}, days ${from}-${to}:`, {
            requestStockIds,
            dateCount: dateStrings.length,
            firstDate: dateStrings[0],
            lastDate: dateStrings[dateStrings.length - 1]
          });
          
          const chunkedResponses = await fetchChunked(
            async (stockIds: string[], dates: string[]) => {
              return await postViaProxy(
                'real-time/per-stock',
                { stockIds, dates }
              ) as Array<{
                stockId: string;
                days: Array<{
                  date: string;
                  cash?: string | number;
                  transfer?: string | number;
                  card?: string | number;
                  foxieUsageRevenue?: string | number;
                  walletUsageRevenue?: string | number;
                }>;
              }>;
            },
            requestStockIds,
            dateStrings,
            {
              maxDatesPerChunk: 10,
              maxStocksPerChunk: 5,
              delayBetweenChunks: 300,
              maxRetries: 2,
              onProgress: (current, total) => {
                if (total > 1) {
                  console.log(`[GrowthByPaymentChart] Month ${m}: Progress ${current}/${total} chunks`);
                }
              }
            }
          );

          // Aggregate all chunked responses
          const response = aggregateStockResponses(
            chunkedResponses.flat()
          );
          
          console.log(`[GrowthByPaymentChart] Response received for month ${m}:`, {
            stockCount: response.length,
            totalDays: response.reduce((sum, stock) => sum + stock.days.length, 0),
            sampleData: response[0]?.days?.[0],
            chunksProcessed: chunkedResponses.length
          });
          
          // Aggregate data across all stocks and all dates
          const parse = (v: unknown) => {
            if (v === null || v === undefined) return 0;
            if (typeof v === "number") return isNaN(v) ? 0 : v;
            if (typeof v === "string") {
              const cleaned = v.replace(/[^0-9.-]/g, "");
              const parsed = Number(cleaned);
              return isNaN(parsed) ? 0 : parsed;
            }
            return Number(v) || 0;
          };
          
          let totalCash = 0;
          let totalTransfer = 0;
          let totalCard = 0;
          let totalFoxie = 0;
          let totalWallet = 0;
          
          response.forEach((stockData) => {
            stockData.days.forEach((dayData) => {
              totalCash += parse(dayData.cash);
              totalTransfer += parse(dayData.transfer);
              totalCard += parse(dayData.card);
              totalFoxie += Math.abs(parse(dayData.foxieUsageRevenue));
              totalWallet += Math.abs(parse(dayData.walletUsageRevenue));
            });
          });
          
          const result = {
            tmckqt: totalCash + totalTransfer + totalCard,
            foxie: totalFoxie,
            vi: totalWallet
          };
          
          console.log(`[GrowthByPaymentChart] Aggregated result for month ${m}:`, result);
          
          return result;
        };
        try {
          const [month1Vals, month2Vals] = await Promise.all([
            build(m1, month1From, month1To),
            build(m2, month2From, month2To)
          ]);
          
          console.log(`[GrowthByPaymentChart] Setting overrideByMonth:`, {
            [m1]: month1Vals,
            [m2]: month2Vals
          });
          
          setOverrideByMonth(prev => {
            const updated = { ...prev, [m1]: month1Vals, [m2]: month2Vals };
            console.log(`[GrowthByPaymentChart] Updated overrideByMonth keys:`, Object.keys(updated));
            return updated;
          });
        } catch (error) {
          console.error(`[GrowthByPaymentChart] Error fetching range data:`, error);
        } finally {
          setRangeLoading(false);
        }
      } else {
        // Old mode: fetch for currentMonth and compareMonth
      if (!applied) return;
      const { from, to, month } = applied;
      if (!currentMonth || !month || month === currentMonth) return;
      setRangeLoading(true);
      const clampDay = (m: string, d: number) => {
        const [mm, yyyy] = m.split("/");
        const last = new Date(Number(yyyy), Number(mm), 0).getDate();
        return Math.min(Math.max(1, d), last);
      };
      const toDateStr = (m: string, d: number) => {
        const [mm, yyyy] = m.split("/");
        const dd = String(clampDay(m, d)).padStart(2, '0');
        return `${dd}/${mm}/${yyyy}`;
      };
      const build = async (m: string) => {
        const [mm, yyyy] = m.split("/");
        
        // Generate array of dates from 'from' day to 'to' day in ISO format (YYYY-MM-DD)
        const dateStrings: string[] = [];
        for (let day = from; day <= to; day++) {
          const date = new Date(Number(yyyy), Number(mm) - 1, day);
          const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          dateStrings.push(isoDate);
        }
        
        // Prepare stockIds for API request
        // For "all branches", API requires [""] (array with empty string), not []
        const requestStockIds = actualStockIds.length === 0 ? [""] : actualStockIds;
        
        // Use chunking for large requests to prevent timeout
        const chunkedResponses = await fetchChunked(
          async (stockIds: string[], dates: string[]) => {
            return await postViaProxy(
              'real-time/per-stock',
              { stockIds, dates }
            ) as Array<{
              stockId: string;
              days: Array<{
                date: string;
                cash?: string | number;
                transfer?: string | number;
                card?: string | number;
                foxieUsageRevenue?: string | number;
                walletUsageRevenue?: string | number;
              }>;
            }>;
          },
          requestStockIds,
          dateStrings,
          {
            maxDatesPerChunk: 10,
            maxStocksPerChunk: 5,
            delayBetweenChunks: 300,
            maxRetries: 2,
            onProgress: (current, total) => {
              if (total > 1) {
                console.log(`[GrowthByPaymentChart] Old mode month ${m}: Progress ${current}/${total} chunks`);
              }
            }
          }
        );

        // Aggregate all chunked responses
        const response = aggregateStockResponses(
          chunkedResponses.flat()
        );
        
        // Aggregate data across all stocks and all dates
        const parse = (v: unknown) => {
          if (v === null || v === undefined) return 0;
          if (typeof v === "number") return isNaN(v) ? 0 : v;
          if (typeof v === "string") {
            const cleaned = v.replace(/[^0-9.-]/g, "");
            const parsed = Number(cleaned);
            return isNaN(parsed) ? 0 : parsed;
          }
          return Number(v) || 0;
        };
        
        let totalCash = 0;
        let totalTransfer = 0;
        let totalCard = 0;
        let totalFoxie = 0;
        let totalWallet = 0;
        
        response.forEach((stockData) => {
          stockData.days.forEach((dayData) => {
            totalCash += parse(dayData.cash);
            totalTransfer += parse(dayData.transfer);
            totalCard += parse(dayData.card);
            totalFoxie += Math.abs(parse(dayData.foxieUsageRevenue));
            totalWallet += Math.abs(parse(dayData.walletUsageRevenue));
          });
        });
        
        return {
          tmckqt: totalCash + totalTransfer + totalCard,
          foxie: totalFoxie,
          vi: totalWallet
        };
      };
      try {
        const [nowVals, cmpVals] = await Promise.all([build(currentMonth), build(month)]);
        
        console.log(`[GrowthByPaymentChart] Setting overrideByMonth (old mode):`, {
          [currentMonth]: nowVals,
          [month]: cmpVals
        });
        
        setOverrideByMonth(prev => {
          const updated = { ...prev, [currentMonth]: nowVals, [month]: cmpVals };
          console.log(`[GrowthByPaymentChart] Updated overrideByMonth keys (old mode):`, Object.keys(updated));
          return updated;
        });
      } catch (error) {
        console.error(`[GrowthByPaymentChart] Error fetching range data (old mode):`, error);
      } finally {
        setRangeLoading(false);
        }
      }
    };
    
    // In new mode, fetch only when applied range is set
    if (useNewMode && appliedRange) {
      fetchRange();
    } else if (!useNewMode && applied) {
      fetchRange();
    }
  }, [applied, appliedRange, currentMonth, actualStockIds, postViaProxy, useNewMode]);

  // Build chart data for 2 months based on user range or overrides
  const comparisonChartData = React.useMemo(() => {
    const emptyMonthData = { tmckqt: 0, foxie: 0, vi: 0 };

    if (useNewMode && month1 && month2) {
      // New mode: use month1 and month2
      const month1Data = overrideByMonth[month1] || data.find(d => d.month === month1) || emptyMonthData;
      const month2Data = overrideByMonth[month2] || data.find(d => d.month === month2) || emptyMonthData;
      
      console.log(`[GrowthByPaymentChart] Building comparison data for new mode:`, {
        month1,
        month2,
        month1Data: month1Data ? { tmckqt: month1Data.tmckqt, foxie: month1Data.foxie, vi: month1Data.vi } : null,
        month2Data: month2Data ? { tmckqt: month2Data.tmckqt, foxie: month2Data.foxie, vi: month2Data.vi } : null,
        overrideByMonthKeys: Object.keys(overrideByMonth),
        dataMonths: data.map(d => d.month)
      });
      
      return visibleMethods.map(key => ({
        method: METHOD_CONFIG[key].name,
        current: month1Data[key],
        compare: month2Data[key],
      }));
    } else {
      // Old mode: use currentMonth and compareMonth
    const monthNow = overrideByMonth[currentMonth] || data.find(d => d.month === currentMonth) || emptyMonthData;
    const monthComp = overrideByMonth[compareMonth] || data.find(d => d.month === compareMonth) || emptyMonthData;
    
    console.log(`[GrowthByPaymentChart] Building comparison data for old mode:`, {
      currentMonth,
      compareMonth,
      monthNow: monthNow ? { tmckqt: monthNow.tmckqt, foxie: monthNow.foxie, vi: monthNow.vi } : null,
      monthComp: monthComp ? { tmckqt: monthComp.tmckqt, foxie: monthComp.foxie, vi: monthComp.vi } : null,
      overrideByMonthKeys: Object.keys(overrideByMonth),
      dataMonths: data.map(d => d.month)
    });
    
    return visibleMethods.map(key => ({
      method: METHOD_CONFIG[key].name,
      current: monthNow[key],
      compare: monthComp[key],
    }));
    }
  }, [data, currentMonth, compareMonth, visibleMethods, overrideByMonth, useNewMode, month1, month2]);

  // Helper: Get max day for month
  const getDaysInMonth = (m: string) => {
    if (!m) return 31;
    const [mm, yyyy] = m.split("/");
    const days = new Date(Number(yyyy), Number(mm), 0).getDate();
    return days;
  };
  
  // Calculate dropdown days for both modes
  const daysCurrent = currentMonth ? getDaysInMonth(currentMonth) : 31;
  const daysComp = compareMonth ? getDaysInMonth(compareMonth) : 31;
  const daysMonth1 = month1 ? getDaysInMonth(month1) : 31;
  const daysMonth2 = month2 ? getDaysInMonth(month2) : 31;
  
  const maxDay = useNewMode ? Math.min(daysMonth1, daysMonth2) : Math.min(daysCurrent, daysComp);
  const dropdownFromDays = Array.from({length: maxDay}, (_,i)=>i+1);
  const dropdownToDays1 = month1FromDay ? Array.from({length: Math.max(1, daysMonth1-month1FromDay+1)}, (_,i)=>i+month1FromDay) : dropdownFromDays;
  const dropdownToDays2 = month2FromDay ? Array.from({length: Math.max(1, daysMonth2-month2FromDay+1)}, (_,i)=>i+month2FromDay) : dropdownFromDays;
  const dropdownToDays = useNewMode ? [] : Array.from({length: maxDay-compareFromDay+1}, (_,i)=>i+compareFromDay);

  // Kiểm tra khi không thể so sánh hoặc không có data hợp lệ
  if (useNewMode) {
    // In new mode, always show the UI, even if months are not selected yet
    // Only show error if both months are selected but invalid
    if (month1 && month2 && month1 === month2) {
      return (
        <Card className="border-[#41d1d9]/20 shadow-lg mb-8">
          <CardHeader className="bg-[#f16a3f] text-white rounded-t-lg flex-col items-start gap-2">
            <CardTitle className="text-base sm:text-lg">So sánh tăng trưởng doanh thu theo phương thức</CardTitle>
            <CardDescription className="text-white/80 text-xs sm:text-sm">
              So sánh 2 tháng với khoảng ngày riêng biệt cho mỗi tháng.
            </CardDescription>
            <div className="flex flex-col gap-3 mt-3 w-full">
              {/* Month 1 Selection */}
              <div className="flex flex-wrap gap-2 items-center bg-white/10 rounded-lg p-2">
                <span className="text-sm font-semibold">Tháng 1:</span>
                <div className="relative" ref={trigger1Ref}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMonthPicker1Open(!isMonthPicker1Open)}
                    disabled={!!loadingMonth1}
                    className="bg-white hover:bg-gray-50 text-black border-gray-300 min-w-[140px] justify-between"
                  >
                    <span className="text-sm">
                      {month1 ? month1 : "Chọn tháng"}
                      {loadingMonth1 === month1 && " (đang tải...)"}
                      {month1 && loadingMonth1 !== month1 && !data.some(d => d.month === month1) && " (chưa tải)"}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isMonthPicker1Open ? 'rotate-180' : ''}`} />
                  </Button>
                  {isMonthPicker1Open && (
                    <div
                      ref={monthPicker1Ref}
                      className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]"
                    >
                      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                        {allAvailableMonths.map(m => {
                          const isLoaded = data.some(d => d.month === m);
                          const isLoading = loadingMonth1 === m;
                          return (
                            <button
                              key={m}
                              onClick={() => {
                                handleMonth1Change(m);
                                setIsMonthPicker1Open(false);
                              }}
                              disabled={isLoading}
                              className={`px-3 py-2 text-sm rounded-md text-left hover:bg-gray-100 ${
                                month1 === m ? 'bg-[#f16a3f] text-white hover:bg-[#d55a2f]' : 'bg-gray-50'
                              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {m} {isLoading ? "(đang tải...)" : isLoaded ? "" : "(chưa tải)"}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                {month1 && setMonth1FromDay && setMonth1ToDay && (
                  <>
                    <span className="text-xs">Từ ngày</span>
                    <select className="border rounded px-1 py-1 text-sm text-black" value={month1FromDay} onChange={e=>setMonth1FromDay(Number(e.target.value))}>
                      {dropdownFromDays.map(day=>(<option key={day} value={day}>{day}</option>))}
                    </select>
                    <span className="text-xs">Đến ngày</span>
                    <select className="border rounded px-1 py-1 text-sm text-black" value={month1ToDay} onChange={e=>setMonth1ToDay(Number(e.target.value))}>
                      {dropdownToDays1.map(day=>(<option key={day} value={day}>{day}</option>))}
                    </select>
                  </>
                )}
              </div>
              {/* Month 2 Selection */}
              <div className="flex flex-wrap gap-2 items-center bg-white/10 rounded-lg p-2">
                <span className="text-sm font-semibold">Tháng 2:</span>
                <div className="relative" ref={trigger2Ref}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMonthPicker2Open(!isMonthPicker2Open)}
                    disabled={!!loadingMonth2}
                    className="bg-white hover:bg-gray-50 text-black border-gray-300 min-w-[140px] justify-between"
                  >
                    <span className="text-sm">
                      {month2 ? month2 : "Chọn tháng"}
                      {loadingMonth2 === month2 && " (đang tải...)"}
                      {month2 && loadingMonth2 !== month2 && !data.some(d => d.month === month2) && " (chưa tải)"}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isMonthPicker2Open ? 'rotate-180' : ''}`} />
                  </Button>
                  {isMonthPicker2Open && (
                    <div
                      ref={monthPicker2Ref}
                      className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]"
                    >
                      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                        {allAvailableMonths.map(m => {
                          const isLoaded = data.some(d => d.month === m);
                          const isLoading = loadingMonth2 === m;
                          return (
                            <button
                              key={m}
                              onClick={() => {
                                handleMonth2Change(m);
                                setIsMonthPicker2Open(false);
                              }}
                              disabled={isLoading}
                              className={`px-3 py-2 text-sm rounded-md text-left hover:bg-gray-100 ${
                                month2 === m ? 'bg-[#f16a3f] text-white hover:bg-[#d55a2f]' : 'bg-gray-50'
                              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {m} {isLoading ? "(đang tải...)" : isLoaded ? "" : "(chưa tải)"}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                {month2 && setMonth2FromDay && setMonth2ToDay && (
                  <>
                    <span className="text-xs">Từ ngày</span>
                    <select className="border rounded px-1 py-1 text-sm text-black" value={month2FromDay} onChange={e=>setMonth2FromDay(Number(e.target.value))}>
                      {dropdownFromDays.map(day=>(<option key={day} value={day}>{day}</option>))}
                    </select>
                    <span className="text-xs">Đến ngày</span>
                    <select className="border rounded px-1 py-1 text-sm text-black" value={month2ToDay} onChange={e=>setMonth2ToDay(Number(e.target.value))}>
                      {dropdownToDays2.map(day=>(<option key={day} value={day}>{day}</option>))}
                    </select>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-red-600 p-4 text-center">Hãy chọn 2 tháng khác nhau để so sánh.</div>
          </CardContent>
        </Card>
      );
    }
    // Check if any month is loading
    const isMonth1Loading = loadingMonth1 === month1;
    const isMonth2Loading = loadingMonth2 === month2;
    // Show loading state if any month is being loaded
    if (month1 && month2 && (isMonth1Loading || isMonth2Loading)) {
      const loadingMonths = [];
      if (isMonth1Loading) loadingMonths.push(`Tháng 1 (${month1})`);
      if (isMonth2Loading) loadingMonths.push(`Tháng 2 (${month2})`);
      const loadingText = loadingMonths.length > 0 ? loadingMonths.join(' và ') : '';
      return (
        <Card className="border-[#41d1d9]/20 shadow-lg mb-8">
          <CardHeader className="bg-[#f16a3f] text-white rounded-t-lg flex-col items-start gap-2">
            <CardTitle className="text-base sm:text-lg">So sánh tăng trưởng doanh thu theo phương thức</CardTitle>
            <CardDescription className="text-white/80 text-xs sm:text-sm">
              So sánh 2 tháng với khoảng ngày riêng biệt cho mỗi tháng.
            </CardDescription>
            {/* Month pickers UI - render full UI here */}
            {useNewMode && (
              <div className="flex flex-col gap-3 mt-3 w-full">
                {/* Month 1 Selection */}
                <div className="flex flex-wrap gap-2 items-center bg-white/10 rounded-lg p-2">
                  <span className="text-sm font-semibold">Tháng 1:</span>
                  <div className="relative" ref={trigger1Ref}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMonthPicker1Open(!isMonthPicker1Open)}
                      disabled={!!loadingMonth1}
                      className="bg-white hover:bg-gray-50 text-black border-gray-300 min-w-[140px] justify-between"
                    >
                      <span className="text-sm">
                        {month1 ? month1 : "Chọn tháng"}
                        {loadingMonth1 === month1 && " (đang tải...)"}
                        {month1 && loadingMonth1 !== month1 && !data.some(d => d.month === month1) && " (chưa tải)"}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isMonthPicker1Open ? 'rotate-180' : ''}`} />
                    </Button>
                    {isMonthPicker1Open && (
                      <div
                        ref={monthPicker1Ref}
                        className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]"
                      >
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto text-black">
                          {allAvailableMonths.map(m => {
                            const isLoaded = data.some(d => d.month === m);
                            const isLoading = loadingMonth1 === m;
                            return (
                              <button
                                key={m}
                                onClick={() => {
                                  handleMonth1Change(m);
                                  setIsMonthPicker1Open(false);
                                }}
                                disabled={isLoading}
                                className={`px-3 py-2 text-sm rounded-md text-left hover:bg-gray-100 ${
                                  month1 === m ? 'bg-[#f16a3f] text-white hover:bg-[#d55a2f]' : 'bg-gray-50'
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {m} {isLoading ? "(đang tải...)" : isLoaded ? "" : "(chưa tải)"}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  {month1 && (
                    <>
                      <span className="text-xs">Từ ngày</span>
                      <select className="border rounded px-1 py-1 text-sm text-black" value={tempMonth1FromDay} onChange={e=>setTempMonth1FromDay(Number(e.target.value))}>
                        {dropdownFromDays.map(day=>(<option key={day} value={day}>{day}</option>))}
                      </select>
                      <span className="text-xs">Đến ngày</span>
                      <select className="border rounded px-1 py-1 text-sm text-black" value={tempMonth1ToDay} onChange={e=>setTempMonth1ToDay(Number(e.target.value))}>
                        {dropdownToDays1.map(day=>(<option key={day} value={day}>{day}</option>))}
                      </select>
                    </>
                  )}
                </div>
                {/* Month 2 Selection */}
                <div className="flex flex-wrap gap-2 items-center bg-white/10 rounded-lg p-2">
                  <span className="text-sm font-semibold">Tháng 2:</span>
                  <div className="relative" ref={trigger2Ref}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMonthPicker2Open(!isMonthPicker2Open)}
                      disabled={!!loadingMonth2}
                      className="bg-white hover:bg-gray-50 text-black border-gray-300 min-w-[140px] justify-between"
                    >
                      <span className="text-sm">
                        {month2 ? month2 : "Chọn tháng"}
                        {loadingMonth2 === month2 && " (đang tải...)"}
                        {month2 && loadingMonth2 !== month2 && !data.some(d => d.month === month2) && " (chưa tải)"}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isMonthPicker2Open ? 'rotate-180' : ''}`} />
                    </Button>
                    {isMonthPicker2Open && (
                      <div
                        ref={monthPicker2Ref}
                        className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]"
                      >
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto text-black">
                          {allAvailableMonths.map(m => {
                            const isLoaded = data.some(d => d.month === m);
                            const isLoading = loadingMonth2 === m;
                            return (
                              <button
                                key={m}
                                onClick={() => {
                                  handleMonth2Change(m);
                                  setIsMonthPicker2Open(false);
                                }}
                                disabled={isLoading}
                                className={`px-3 py-2 text-sm rounded-md text-left hover:bg-gray-100 ${
                                  month2 === m ? 'bg-[#f16a3f] text-white hover:bg-[#d55a2f]' : 'bg-gray-50'
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {m} {isLoading ? "(đang tải...)" : isLoaded ? "" : "(chưa tải)"}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  {month2 && (
                    <>
                      <span className="text-xs">Từ ngày</span>
                      <select className="border rounded px-1 py-1 text-sm text-black" value={tempMonth2FromDay} onChange={e=>setTempMonth2FromDay(Number(e.target.value))}>
                        {dropdownFromDays.map(day=>(<option key={day} value={day}>{day}</option>))}
                      </select>
                      <span className="text-xs">Đến ngày</span>
                      <select className="border rounded px-1 py-1 text-sm text-black" value={tempMonth2ToDay} onChange={e=>setTempMonth2ToDay(Number(e.target.value))}>
                        {dropdownToDays2.map(day=>(<option key={day} value={day}>{day}</option>))}
                      </select>
                    </>
                  )}
                </div>
                {/* Apply Button */}
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleApplyNewMode}
                    disabled={!month1 || !month2 || month1 === month2 || rangeLoading}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white"
                    size="sm"
                  >
                    {rangeLoading ? "Đang tải..." : "Áp dụng"}
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f16a3f]"></div>
              <div className="text-[#f16a3f] font-semibold text-center">
                Đang tải dữ liệu cho {loadingText}...
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // Show chart only if both months are selected and have data
    if (month1 && month2 && !comparisonChartData.length) {
      return (
        <Card className="border-[#41d1d9]/20 shadow-lg mb-8">
          <CardHeader className="bg-[#f16a3f] text-white rounded-t-lg flex-col items-start gap-2">
            <CardTitle className="text-base sm:text-lg">So sánh tăng trưởng doanh thu theo phương thức</CardTitle>
            <CardDescription className="text-white/80 text-xs sm:text-sm">
              So sánh 2 tháng với khoảng ngày riêng biệt cho mỗi tháng.
            </CardDescription>
            {/* Month pickers UI - same as below */}
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-gray-600 p-4 text-center">Không có dữ liệu trong khoảng ngày/tháng đã chọn.</div>
          </CardContent>
        </Card>
      );
    }
  } else {
  if (allMonths.length < 2) {
    return <div className="text-gray-700 p-5">Không đủ dữ liệu tháng để so sánh. Hãy nhập giao dịch vào hệ thống trước.</div>;
  }
  if (!compareMonth || compareMonth === currentMonth) {
    return <div className="text-gray-600 p-5">Hãy chọn một tháng khác để so sánh với tháng hiện tại.</div>;
  }
  if (!comparisonChartData.length) {
    return <div className="text-gray-600 p-5">Không có dữ liệu trong khoảng ngày/tháng đã chọn.</div>;
    }
  }
  const onlyZero = comparisonChartData.every(item => (!item.current && !item.compare));
  return (
    <Card className="border-[#41d1d9]/20 shadow-lg mb-8">
      <CardHeader className="bg-[#f16a3f] text-white rounded-t-lg flex-col items-start gap-2">
        <CardTitle className="text-base sm:text-lg">So sánh tăng trưởng doanh thu theo phương thức</CardTitle>
        <CardDescription className="text-white/80 text-xs sm:text-sm">
          {useNewMode ? "So sánh 2 tháng với khoảng ngày riêng biệt cho mỗi tháng." : "So sánh theo từng khoảng ngày và tháng bạn chọn."}
        </CardDescription>
        {useNewMode ? (
          // New mode: 2 separate month selectors with date pickers
          <div className="flex  gap-3 mt-3">
            {/* Month 1 Selection */}
            <div className="flex flex-wrap gap-2 items-center bg-white/10 rounded-lg p-2">
              <span className="text-sm font-semibold">Tháng đầu tiên:</span>
              <div className="relative" ref={trigger1Ref}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMonthPicker1Open(!isMonthPicker1Open)}
                  disabled={!!loadingMonth1}
                  className="bg-white hover:bg-gray-50 text-black border-gray-300 min-w-[140px] justify-between"
                >
                  <span className="text-sm">
                    {month1 ? month1 : "Chọn tháng"}
                    {loadingMonth1 === month1 && " (đang tải...)"}
                    {month1 && loadingMonth1 !== month1 && !data.some(d => d.month === month1) && " (chưa tải)"}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isMonthPicker1Open ? 'rotate-180' : ''}`} />
                </Button>
                {isMonthPicker1Open && (
                  <div
                    ref={monthPicker1Ref}
                    className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]"
                  >
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto text-black">
                      {allAvailableMonths.map(m => {
                        const isLoaded = data.some(d => d.month === m);
                        const isLoading = loadingMonth1 === m;
                        return (
                          <button
                            key={m}
                            onClick={() => {
                              handleMonth1Change(m);
                              setIsMonthPicker1Open(false);
                            }}
                            disabled={isLoading}
                            className={`px-3 py-2 text-sm rounded-md text-left hover:bg-gray-100 ${
                              month1 === m ? 'bg-[#f16a3f] text-white hover:bg-[#d55a2f]' : 'bg-gray-50'
                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {m} {isLoading ? "(đang tải...)" : isLoaded ? "" : "(chưa tải)"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              {month1 && (
                <>
                  <span className="text-xs">Từ ngày</span>
                  <select className="border rounded px-1 py-1 text-sm text-black" value={tempMonth1FromDay} onChange={e=>setTempMonth1FromDay(Number(e.target.value))}>
                    {dropdownFromDays.map(day=>(<option key={day} value={day}>{day}</option>))}
                  </select>
                  <span className="text-xs">Đến ngày</span>
                  <select className="border rounded px-1 py-1 text-sm text-black" value={tempMonth1ToDay} onChange={e=>setTempMonth1ToDay(Number(e.target.value))}>
                    {dropdownToDays1.map(day=>(<option key={day} value={day}>{day}</option>))}
                  </select>
                </>
              )}
            </div>
            {/* Month 2 Selection */}
            <div className="flex flex-wrap gap-2 items-center bg-white/10 rounded-lg p-2">
              <span className="text-sm font-semibold">Tháng thứ hai:</span>
              <div className="relative" ref={trigger2Ref}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMonthPicker2Open(!isMonthPicker2Open)}
                  disabled={!!loadingMonth2}
                  className="bg-white hover:bg-gray-50 text-black border-gray-300 min-w-[140px] justify-between"
                >
                  <span className="text-sm">
                    {month2 ? month2 : "Chọn tháng"}
                    {loadingMonth2 === month2 && " (đang tải...)"}
                    {month2 && loadingMonth2 !== month2 && !data.some(d => d.month === month2) && " (chưa tải)"}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isMonthPicker2Open ? 'rotate-180' : ''}`} />
                </Button>
                {isMonthPicker2Open && (
                  <div
                    ref={monthPicker2Ref}
                    className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px] text-black"
                  >
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {allAvailableMonths.map(m => {
                        const isLoaded = data.some(d => d.month === m);
                        const isLoading = loadingMonth2 === m;
                        return (
                          <button
                            key={m}
                            onClick={() => {
                              handleMonth2Change(m);
                              setIsMonthPicker2Open(false);
                            }}
                            disabled={isLoading}
                            className={`px-3 py-2 text-sm rounded-md text-left hover:bg-gray-100 ${
                              month2 === m ? 'bg-[#f16a3f] text-white hover:bg-[#d55a2f]' : 'bg-gray-50'
                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {m} {isLoading ? "(đang tải...)" : isLoaded ? "" : "(chưa tải)"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              {month2 && (
                <>
                  <span className="text-xs">Từ ngày</span>
                  <select className="border rounded px-1 py-1 text-sm text-black" value={tempMonth2FromDay} onChange={e=>setTempMonth2FromDay(Number(e.target.value))}>
                    {dropdownFromDays.map(day=>(<option key={day} value={day}>{day}</option>))}
                  </select>
                  <span className="text-xs">Đến ngày</span>
                  <select className="border rounded px-1 py-1 text-sm text-black" value={tempMonth2ToDay} onChange={e=>setTempMonth2ToDay(Number(e.target.value))}>
                    {dropdownToDays2.map(day=>(<option key={day} value={day}>{day}</option>))}
                  </select>
                </>
              )}
            </div>
            {/* Apply Button */}
            <div className="flex justify-end mt-2">
              <Button
                onClick={handleApplyNewMode}
                disabled={!month1 || !month2 || month1 === month2 || rangeLoading}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white"
                size="sm"
              >
                {rangeLoading ? "Đang tải..." : "Áp dụng"}
              </Button>
            </div>
          </div>
        ) : (
          // Old mode: single month comparison
        <div className="flex flex-wrap gap-2 mt-3 items-center">
          <span className="text-sm font-semibold">Từ ngày</span>
          <select className="border rounded px-1 py-1 text-sm mr-2 text-black" value={compareFromDay} onChange={e=>setCompareFromDay(Number(e.target.value))}>
            {dropdownFromDays.map(day=>(<option key={day} value={day}>{day}</option>))}
          </select>
          <span className="text-sm font-semibold">Đến ngày</span>
          <select className="border rounded px-1 py-1 text-sm mr-2 text-black" value={compareToDay} onChange={e=>setCompareToDay(Number(e.target.value))}>
            {dropdownToDays.map(day=>(<option key={day} value={day}>{day}</option>))}
          </select>
          <span className="text-sm font-semibold">So sánh với tháng</span>
          <select 
            className="border rounded px-1 py-1 text-sm text-black" 
            value={compareMonth} 
            onChange={(e) => handleMonthChange(e.target.value)}
            disabled={!!loadingMonth}
          >
            {allAvailableMonths
              .filter(m => m !== currentMonth)
              .map(m => {
                const isLoaded = data.some(d => d.month === m);
                const isLoading = loadingMonth === m;
                return (
                  <option key={m} value={m} disabled={isLoading}>
                    {m} {isLoading ? "(đang tải...)" : isLoaded ? "" : "(chưa tải)"}
                  </option>
                );
              })}
          </select>
          <button
            className="ml-2 px-2 py-1 text-sm rounded bg-white/20 hover:bg-white/30 border border-white/30"
            onClick={() => setApplied({ from: compareFromDay, to: compareToDay, month: compareMonth })}
            disabled={!compareMonth || compareMonth === currentMonth}
          >
            Áp dụng
          </button>
        </div>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 items-center">
          <span className="text-sm font-semibold">Hiển thị: </span>
          {Object.entries(METHOD_CONFIG).map(([key, { name, color }]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <input
                type="checkbox"
                checked={visibleMethods.includes(key as MethodKey)}
                onChange={() => handleMethodToggle(key as MethodKey)}
                className="form-checkbox h-4 w-4 rounded accent-[#f16a3f]"
                style={{ accentColor: color }}
              />
              <span style={{ color }}>{name}</span>
            </label>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {rangeLoading && (
          <div className="text-xs text-gray-500 mb-2">Đang áp dụng khoảng ngày...</div>
        )}
        {onlyZero
          ? <div className="text-gray-600 p-4 text-center">Không có dữ liệu trong khoảng ngày đã chọn.</div>
          : <ResponsiveContainer width="100%" height={isMobile ? 280 : 390}>
              <BarChart
                data={comparisonChartData}
                margin={{ top: 5, right: isMobile ? 30 : 80, left: 10, bottom: isMobile ? 40 : 5 }}
                barCategoryGap={isMobile ? "30%" : "20%"}
                barGap={isMobile ? 3 : 6}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" fontSize={isMobile ? 10 : 12} interval={0} angle={isMobile ? -20 : 0} dy={isMobile ? 10 : 0} height={isMobile ? 50 : undefined} />
                <YAxis domain={[0, 'auto']} allowDecimals={false} tickFormatter={v => `${(v / 1_000_000).toFixed(0)}M`} fontSize={isMobile ? 10 : 12} />
                <Tooltip cursor={false} formatter={(value: number) => `${value.toLocaleString()} VNĐ`} />
                <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                <Bar dataKey="current" name={useNewMode && month1 ? `Tháng ${month1}` : `Tháng ${currentMonth}`} fill="#111827" barSize={isMobile ? 22 : 34} isAnimationActive={false} minPointSize={3}>
                  <LabelList
                    position="top"
                    dataKey="current"
                    content={(props) => {
                      const p = props as unknown as { value?: number; x?: number; y?: number; payload?: { method?: string } };
                      if (!p.payload || p.payload.method !== METHOD_CONFIG.vi.name || !p.value) return null;
                      return <text x={p.x} y={(p.y ?? 0) - 4} textAnchor="middle" fontSize={isMobile ? 9 : 10} fill="#111827">{Number(p.value).toLocaleString()}</text>;
                    }}
                  />
                </Bar>
                <Bar dataKey="compare" name={useNewMode && month2 ? `Tháng ${month2}` : `Tháng ${compareMonth}`} fill={COMPARE_COLOR} barSize={isMobile ? 18 : 28} isAnimationActive={false} minPointSize={3}>
                  <LabelList
                    position="top"
                    dataKey="compare"
                    content={(props) => {
                      const p = props as unknown as { value?: number; x?: number; y?: number; payload?: { method?: string } };
                      if (!p.payload || p.payload.method !== METHOD_CONFIG.vi.name || !p.value) return null;
                      return <text x={p.x} y={(p.y ?? 0) - 4} textAnchor="middle" fontSize={isMobile ? 9 : 10} fill={COMPARE_COLOR}>{Number(p.value).toLocaleString()}</text>;
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
        }
      </CardContent>
    </Card>
  );
}
