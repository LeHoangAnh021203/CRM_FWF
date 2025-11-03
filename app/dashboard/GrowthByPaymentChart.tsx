import React from "react";
import { ApiService } from "@/app/lib/api-service";
import { useWindowWidth } from "@/app/hooks/useWindowWidth";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/app/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from "recharts";

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
}: GrowthByPaymentChartProps) {
  const width = useWindowWidth();
  const isMobile = width < 640; // tailwind sm breakpoint
  const allMonths = React.useMemo(() => data.map(d => d.month), [data]);
  const currentMonth = allMonths.length > 0 ? allMonths[allMonths.length - 1] : "";
  const [loadingMonth, setLoadingMonth] = React.useState<string | null>(null);
  const [allAvailableMonths, setAllAvailableMonths] = React.useState<string[]>(allMonths);
  
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

  // Handle month selection - lazy load if needed
  const handleMonthChange = React.useCallback(async (selectedMonth: string) => {
    setCompareMonth(selectedMonth);
    
    // Check if month already exists in data
    if (data.some(d => d.month === selectedMonth)) {
      return; // Already loaded
    }

    // Fetch the month if onMonthSelect callback is provided
    if (onMonthSelect && selectedMonth) {
      setLoadingMonth(selectedMonth);
      try {
        const [monthStr, yearStr] = selectedMonth.split("/");
        await onMonthSelect(selectedMonth, monthStr, Number(yearStr));
        // Parent component will update state via useEffect
      } catch (err) {
        console.error(`Failed to load month ${selectedMonth}:`, err);
      } finally {
        setLoadingMonth(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, onMonthSelect]); // setCompareMonth is stable from props

  const [visibleMethods, setVisibleMethods] = React.useState<MethodKey[]>(['tmckqt', 'foxie', 'vi']);
  const [rangeLoading, setRangeLoading] = React.useState(false);
  const [overrideByMonth, setOverrideByMonth] = React.useState<Record<string, { tmckqt: number; foxie: number; vi: number }>>({});
  const [applied, setApplied] = React.useState<{ from: number; to: number; month: string } | null>(null);
  const handleMethodToggle = (method: MethodKey) => {
    setVisibleMethods(prev => prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]);
  };

  // Refetch 2 tháng theo khoảng ngày CHỈ khi người dùng bấm "Áp dụng"
  React.useEffect(() => {
    const fetchRange = async () => {
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
        const start = toDateStr(m, from);
        const end = toDateStr(m, to);
        const res = await ApiService.get(`real-time/sales-summary?dateStart=${start}&dateEnd=${end}`) as {
          cash?: string | number;
          transfer?: string | number;
          card?: string | number;
          foxieUsageRevenue?: string | number;
          walletUsageRevenue?: string | number;
        };
        const parse = (v: unknown) => typeof v === 'string' ? Number((v||'').replace(/[^\d.-]/g, '')) || 0 : Number(v) || 0;
        return {
          tmckqt: parse(res.cash) + parse(res.transfer) + parse(res.card),
          foxie: Math.abs(parse(res.foxieUsageRevenue)),
          vi: Math.abs(parse(res.walletUsageRevenue))
        };
      };
      try {
        const [nowVals, cmpVals] = await Promise.all([build(currentMonth), build(month)]);
        setOverrideByMonth(prev => ({ ...prev, [currentMonth]: nowVals, [month]: cmpVals }));
      } finally {
        setRangeLoading(false);
      }
    };
    fetchRange();
  }, [applied, currentMonth]);

  // Build chart data for 2 months based on user range or overrides
  const comparisonChartData = React.useMemo(() => {
    const monthNow = overrideByMonth[currentMonth] || data.find(d => d.month === currentMonth);
    const monthComp = overrideByMonth[compareMonth] || data.find(d => d.month === compareMonth);
    if (!monthNow || !monthComp) return [];
    return visibleMethods.map(key => ({
      method: METHOD_CONFIG[key].name,
      current: monthNow[key],
      compare: monthComp[key],
    }));
  }, [data, currentMonth, compareMonth, visibleMethods, overrideByMonth]);

  // Helper: Get max day for month
  const getDaysInMonth = (m: string) => {
    if (!m) return 31;
    const [mm, yyyy] = m.split("/");
    const days = new Date(Number(yyyy), Number(mm), 0).getDate();
    return days;
  };
  const daysCurrent = currentMonth ? getDaysInMonth(currentMonth) : 31;
  const daysComp = compareMonth ? getDaysInMonth(compareMonth) : 31;
  const maxDay = Math.min(daysCurrent, daysComp);
  const dropdownFromDays = Array.from({length: maxDay}, (_,i)=>i+1);
  const dropdownToDays = Array.from({length: maxDay-compareFromDay+1}, (_,i)=>i+compareFromDay);

  // Kiểm tra khi không thể so sánh hoặc không có data hợp lệ
  if (allMonths.length < 2) {
    return <div className="text-gray-700 p-5">Không đủ dữ liệu tháng để so sánh. Hãy nhập giao dịch vào hệ thống trước.</div>;
  }
  if (!compareMonth || compareMonth === currentMonth) {
    return <div className="text-gray-600 p-5">Hãy chọn một tháng khác để so sánh với tháng hiện tại.</div>;
  }
  if (!comparisonChartData.length) {
    return <div className="text-gray-600 p-5">Không có dữ liệu trong khoảng ngày/tháng đã chọn.</div>;
  }
  const onlyZero = comparisonChartData.every(item => (!item.current && !item.compare));
  return (
    <Card className="border-[#41d1d9]/20 shadow-lg mb-8">
      <CardHeader className="bg-[#f16a3f] text-white rounded-t-lg flex-col items-start gap-2">
        <CardTitle className="text-base sm:text-lg">So sánh tăng trưởng doanh thu theo phương thức</CardTitle>
        <CardDescription className="text-white/80 text-xs sm:text-sm">
          So sánh theo từng khoảng ngày và tháng bạn chọn.
        </CardDescription>
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
                <Bar dataKey="current" name={`Tháng ${currentMonth}`} fill="#111827" barSize={isMobile ? 22 : 34} isAnimationActive={false} minPointSize={3}>
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
                <Bar dataKey="compare" name={`Tháng ${compareMonth}`} fill={COMPARE_COLOR} barSize={isMobile ? 18 : 28} isAnimationActive={false} minPointSize={3}>
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