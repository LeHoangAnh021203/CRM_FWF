"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  computeSkinInsights,
  type RemoteRecord,
  type SkinInsights,
  type SkinRecordSummary,
} from "@/app/lib/skin-insights-client";
import { DialogListCustomer } from "../skinreport/dialogListCustomer";
import { DialogDetailCustomer } from "../skinreport/dialogDetailCustomer";
import { SkinReportHeaderSection } from "../skinreport/sections/header/SkinReportHeaderSection";
import { SkinReportTabsSection } from "../skinreport/sections/tabs/SkinReportTabsSection";
import { useSkinReportState } from "../skinreport/hooks/useSkinReportState";
import { parseDateTime } from "../skinreport/transformers";
import { LoadingSpinner } from "@/app/components/loading";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

type DateRange = {
  from: string;
  to: string;
};
const normalizeDateInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildMonthRange = (date: Date): DateRange => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  let end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const today = new Date();
  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth()
  ) {
    end = today;
  }
  return {
    from: normalizeDateInput(start),
    to: normalizeDateInput(end),
  };
};

const isSameRange = (a: DateRange | null, b: DateRange | null) =>
  Boolean(a && b && a.from === b.from && a.to === b.to);

const parseRangeValue = (raw: unknown): string | null => {
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (/^\d{4}-\d{2}-\d{2}$/u.test(trimmed)) {
      return trimmed;
    }
    const asDate = new Date(trimmed);
    if (!Number.isNaN(asDate.getTime())) {
      return normalizeDateInput(asDate);
    }
    if (/^\d+$/u.test(trimmed)) {
      const asNumber = Number(trimmed);
      if (!Number.isNaN(asNumber)) {
        const date = new Date(asNumber);
        if (!Number.isNaN(date.getTime())) {
          return normalizeDateInput(date);
        }
      }
    }
  }
  if (typeof raw === "number" && Number.isFinite(raw)) {
    const date = new Date(raw);
    if (!Number.isNaN(date.getTime())) {
      return normalizeDateInput(date);
    }
  }
  return null;
};

const getLatestMonthRangeFromRecords = (records: SkinRecordSummary[]): DateRange | null => {
  let newest: Date | null = null;
  records.forEach((record) => {
    const candidate =
      parseDateTime(record.crtTime ?? record.createdAt) ??
      parseDateTime(record.testTime);
    if (!candidate) return;
    if (!newest || candidate.getTime() > newest.getTime()) {
      newest = candidate;
    }
  });
  return newest ? buildMonthRange(newest) : null;
};

export function SkinReportApiClient() {
  const [insights, setInsights] = useState<SkinInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBase = (() => {
    const envBase = (process.env.NEXT_PUBLIC_SKIN_API_BASE || "").trim();
    if (envBase) return envBase.replace(/\/+$/, "");
    if (typeof window !== "undefined" && window.location.hostname) {
      return `http://${window.location.hostname}:3001`;
    }
    return "https://scrape-skin-data.onrender.com";
  })();

  const SKIN_INSIGHTS_PATH =
    process.env.NEXT_PUBLIC_SKIN_API_SKIN_INSIGHTS_PATH || "/api/skin-insights";
  // Sử dụng đường dẫn tương đối để tự động trỏ về origin của FE (Next.js)
  const skinInsightsInternalUrl = useMemo(
    () => `${SKIN_INSIGHTS_PATH}`,
    [SKIN_INSIGHTS_PATH]
  );

  // Scraper / data API states
  const [health, setHealth] = useState<string | null>(null);

  // Full Sync states
  const [fullSyncLoading, setFullSyncLoading] = useState(false);
  const [dataSyncLoading, setDataSyncLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: "",
    to: "",
  });
  const [lastSyncInfo, setLastSyncInfo] = useState<{
    rangeFrom?: string;
    rangeTo?: string;
    startedAt?: string;
    finishedAt?: string | null;
  }>({});
  const [initialRangeSet, setInitialRangeSet] = useState(false);
  const [lastAutoRange, setLastAutoRange] = useState<DateRange | null>(null);
  const [backendRange, setBackendRange] = useState<DateRange | null>(null);
  const [statsFullRange, setStatsFullRange] = useState<DateRange | null>(null);
  const [statsFullRangeRaw, setStatsFullRangeRaw] =
    useState<{ start?: string; end?: string } | null>(null);
  const [totalRecordsAll, setTotalRecordsAll] = useState<number | null>(null);
  const [lastSyncedRange, setLastSyncedRange] = useState<DateRange | null>(null);
  const initialAutoSyncRef = useRef(true);
  const [waitingForStableData, setWaitingForStableData] = useState(false);
  // --- Health check + stats + data preview từ API mới ---
  const HEALTH_PATH =
    process.env.NEXT_PUBLIC_SKIN_API_HEALTH_PATH || "/api/health";
  const EXPORT_PATH =
    process.env.NEXT_PUBLIC_SKIN_API_EXPORT_PATH || "/api/data/export";
  const FULL_SYNC_PATH =
    process.env.NEXT_PUBLIC_SKIN_API_FULL_SYNC_PATH || "/api/scrape/full-sync";

  const healthUrl = useMemo(
    () => `${apiBase}${HEALTH_PATH}`,
    [apiBase, HEALTH_PATH]
  );
  const exportUrl = useMemo(
    () => `${apiBase}${EXPORT_PATH}`,
    [apiBase, EXPORT_PATH]
  );
  const fullSyncUrl = useMemo(
    () => `${apiBase}${FULL_SYNC_PATH}`,
    [apiBase, FULL_SYNC_PATH]
  );
  const dataExportUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("format", "json");
    if (dateRange.from) params.set("start", dateRange.from);
    if (dateRange.to) params.set("end", dateRange.to);
    const query = params.toString();
    return query ? `${exportUrl}?${query}` : exportUrl;
  }, [exportUrl, dateRange]);

  const DATA_PATH =
    process.env.NEXT_PUBLIC_SKIN_API_DATA_PATH || "/api/data";

  // --- Core skin insights fetch (luôn ưu tiên data thật từ BE) ---
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        setError(null);
        // Luôn lấy data thật từ BE để tính insights
        let data: SkinInsights | null = null;
        let success = false;
        try {
          const res = await fetch(`${DATA_PATH}?format=json`);
          if (res.ok) {
            const raw = (await res.json()) as RemoteRecord[];
            data = computeSkinInsights(raw);
            success = true;
          }
        } catch (e) {
          console.warn("Data JSON fetch failed, falling back...", e);
        }

        if (!success) {
          const res = await fetch(skinInsightsInternalUrl);
          if (!res.ok) {
            throw new Error(`Failed to fetch: ${res.statusText}`);
          }
          data = await res.json();
        }

        console.log("Fetched skin insights", data?.records?.length, data?.records?.[0]?.createdAt);
        setInsights(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load skin insights"
        );
        console.error("Error fetching skin insights:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [DATA_PATH, skinInsightsInternalUrl]);

  useEffect(() => {
    const rangeKeyMatrix = {
      from: ["from", "min", "start", "startDate", "rangeStart", "minDate"],
      to: ["to", "max", "end", "endDate", "rangeEnd", "maxDate"],
    };

    const pickRange = (map: Record<string, unknown>, keys: string[]) => {
      for (const key of keys) {
        const normalized = parseRangeValue(map[key]);
        if (normalized) {
          return normalized;
        }
      }
      return null;
    };

    const normalizeRangeValue = (value: unknown): DateRange | null => {
      if (!value) return null;

      if (Array.isArray(value) && value.length >= 2) {
        const from = parseRangeValue(value[0]);
        const to = parseRangeValue(value[1]);
        if (from && to) {
          return { from, to };
        }
        return null;
      }

      if (typeof value === "object") {
        const map = value as Record<string, unknown>;
        const from = pickRange(map, rangeKeyMatrix.from);
        const to = pickRange(map, rangeKeyMatrix.to);
        if (from && to) {
          return { from, to };
        }
      }

      if (typeof value === "string") {
        const parts = value.split(/\s*[\u2013\u2014–~-]\s*/u);
        if (parts.length >= 2) {
          const from = parseRangeValue(parts[0]);
          const to = parseRangeValue(parts[1]);
          if (from && to) {
            return { from, to };
          }
        }
      }

      return null;
    };

    const fetchBackendRange = async () => {
      try {
        const res = await fetch(`${DATA_PATH}?format=json`);
        if (!res.ok) return;
        const payload = await res.json();
        const fullRangeRaw = payload?.stats?.fullRange ?? payload?.stats?.full_range;
        setStatsFullRangeRaw(null);
        if (fullRangeRaw) {
          const start =
            typeof fullRangeRaw.start === "string"
              ? fullRangeRaw.start
              : typeof fullRangeRaw.from === "string"
                ? fullRangeRaw.from
                : undefined;
          const end =
            typeof fullRangeRaw.end === "string"
              ? fullRangeRaw.end
              : typeof fullRangeRaw.to === "string"
                ? fullRangeRaw.to
                : undefined;
          setStatsFullRangeRaw({ start, end });
        }
        const fullRange =
          normalizeRangeValue(fullRangeRaw) ??
          normalizeRangeValue(payload?.stats?.fullRange) ??
          normalizeRangeValue(payload?.stats?.full_range);
        setStatsFullRange(fullRange ?? null);
        const paginationTotal =
          typeof payload?.pagination?.total === "number"
            ? payload.pagination.total
            : null;
        if (paginationTotal != null) {
          setTotalRecordsAll(paginationTotal);
        } else if (typeof payload?.stats?.total === "number") {
          setTotalRecordsAll(payload.stats.total);
        }

        const range =
          normalizeRangeValue(payload?.stats?.dataTimeRange) ??
          normalizeRangeValue(payload?.stats?.range) ??
          normalizeRangeValue(payload?.range);
        if (range) {
          const toDate =
            parseDateTime(range.to) ?? parseDateTime(range.from);
          const monthRange = toDate ? buildMonthRange(toDate) : null;
          setBackendRange(monthRange ?? range);
        }
      } catch {
        // ignore
      }
    };

    void fetchBackendRange();
  }, [DATA_PATH, lastSyncInfo.finishedAt]);

  const fetchHealth = React.useCallback(async () => {
    try {
      const res = await fetch(healthUrl);
      if (!res.ok) {
        setHealth(`ERROR ${res.status}: ${res.statusText}`);
        return;
      }
      const text = await res.text();
      setHealth(text || "OK");
    } catch (e) {
      setHealth("Không thể kết nối tới /api/health");
      console.error("Health check error", e);
    }
  }, [healthUrl]);

  const startFullSync = React.useCallback(
    async (save: boolean) => {
      try {
        setFullSyncLoading(true);
        const syncStartedAt = new Date().toISOString();
        setLastSyncInfo({
          rangeFrom: dateRange.from || undefined,
          rangeTo: dateRange.to || undefined,
          startedAt: syncStartedAt,
          finishedAt: null,
        });

        const params = new URLSearchParams();
        params.set("save", save ? "true" : "false");
        if (dateRange.from) params.set("from", dateRange.from);
        if (dateRange.to) params.set("to", dateRange.to);
        params.set("incremental", "true");
        const query = `?${params.toString()}`;
        const res = await fetch(`${fullSyncUrl}${query}`, { method: "POST" });

        let payload: unknown = null;
        try {
          payload = await res.json();
        } catch {
          // ignore json parse error, handle by status/text
        }

        if (!res.ok) {
          let message = `Status ${res.status}`;
          if (payload && typeof payload === "object") {
            const msg = (payload as Record<string, unknown>).message;
            if (typeof msg === "string") message = msg;
          }
          throw new Error(message);
        }

        // Nếu backend trả trực tiếp data (save=false hoặc vẫn trả data), transform ngay để hiển thị
        if (payload && typeof payload === "object") {
          const record = payload as Record<string, unknown>;
          const startedAt =
            typeof record.startedAt === "string" ? record.startedAt : undefined;
          const finishedAt =
            typeof record.finishedAt === "string"
              ? record.finishedAt
              : new Date().toISOString();
          setLastSyncInfo((prev) => ({
            ...prev,
            startedAt: startedAt ?? prev.startedAt,
            finishedAt,
          }));
        }
        if (
          payload &&
          typeof payload === "object" &&
          Array.isArray((payload as Record<string, unknown>).data)
        ) {
          const raw = (payload as { data: unknown[] }).data as RemoteRecord[];
          try {
            const insights = computeSkinInsights(raw);
            setInsights(insights);
          } catch (e) {
            console.error("Transform raw -> SkinInsights error", e);
          }
        } else if (
          payload &&
          typeof payload === "object" &&
          (payload as Record<string, unknown>).saved === true
        ) {
          // Nếu server đã lưu vào DB mà không trả data, ưu tiên tải export JSON để tính toán đầy đủ và chính xác
          try {
            const expRes = await fetch(`${exportUrl}?format=json`);
            if (expRes.ok) {
              const expJson = (await expRes.json()) as RemoteRecord[];
              const insights = computeSkinInsights(expJson);
              setInsights(insights);
            }
          } catch (e) {
            console.warn("Export JSON fetch failed", e);
          }
        }
      } catch (e) {
        console.error("Full sync error", e);
        alert(
          e instanceof Error ? `Full sync lỗi: ${e.message}` : "Full sync lỗi"
        );
      } finally {
        setLastSyncInfo((prev) => ({
          ...prev,
          finishedAt: prev.finishedAt ?? new Date().toISOString(),
        }));
        setFullSyncLoading(false);
      }
    },
    [fullSyncUrl, exportUrl, dateRange]
  );

  const startDataSync = React.useCallback(async () => {
    try {
      setDataSyncLoading(true);
      const syncStartedAt = new Date().toISOString();
      setLastSyncInfo({
        rangeFrom: dateRange.from || undefined,
        rangeTo: dateRange.to || undefined,
        startedAt: syncStartedAt,
        finishedAt: null,
      });

      const res = await fetch(dataExportUrl);

      let payload: unknown = null;
      try {
        payload = await res.json();
      } catch {
        // ignore json parse error, handle by status/text
      }

      if (!res.ok) {
        let message = `Status ${res.status}`;
        if (payload && typeof payload === "object") {
          const msg = (payload as Record<string, unknown>).message;
          if (typeof msg === "string") message = msg;
        }
        throw new Error(message);
      }

      if (!Array.isArray(payload)) {
        throw new Error("Sync data trả về định dạng không mong đợi");
      }
      const records = payload as RemoteRecord[];
      setInsights(computeSkinInsights(records));
    } catch (e) {
      console.error("Sync data error", e);
      alert(e instanceof Error ? `Sync data lỗi: ${e.message}` : "Sync data lỗi");
    } finally {
      setLastSyncInfo((prev) => ({
        ...prev,
        finishedAt: prev.finishedAt ?? new Date().toISOString(),
      }));
      setDataSyncLoading(false);
    }
  }, [dataExportUrl, dateRange]);

  useEffect(() => {
    void fetchHealth();
  }, [fetchHealth]);

  const {
    activeTab,
    setActiveTab,
    recordsOpen,
    setRecordsOpen,
    detailOpen,
    selectedRecord,
    recordPage,
    setRecordPage,
    pageSize,
    summaryCards,
    tabs,
    issueDefinitions,
    kpiPlan,
    severeAcne,
    severePore,
    topMultiUseGoods,
    sortedRecords,
    totalPages,
    paginatedRecords,
    moduleDetails,
    formatPercent,
    formatSex,
    formatDateTime,
    handleCardClick,
    handleShowRecords,
    handleViewRecord,
    handleDetailOpenChange,
  } = useSkinReportState(
    insights ?? {
      totalRecords: 0,
      generatedAt: new Date().toISOString(),
      age: { count: 0, average: 0, median: null, min: null, max: null },
      sexDistribution: [],
      skinTypes: [],
      severity: {},
      darkCircleTypes: [],
      sensitivity: [],
      topGoods: [],
      keyInsights: [],
      dataQuality: {
        totalWithReportedAge: 0,
        totalWithPredictedAge: 0,
        averageAgeGap: 0,
        mismatchCount: 0,
        mismatchShare: 0,
        withPhoneCount: 0,
        missingPhoneCount: 0,
      },
      issueTrends: {},
      multiUseGoods: [],
      records: [],
      spotlightRecord: null,
    }
  );

  const latestMonthRange = useMemo(
    () => getLatestMonthRangeFromRecords(insights?.records ?? []),
    [insights?.records]
  );

  const activeRange = backendRange ?? latestMonthRange;

  const { oldestRecordAt, newestRecordAt } = useMemo(() => {
    const records = insights?.records ?? [];
    let oldest: string | null = null;
    let newest: string | null = null;
    records.forEach((record) => {
      const candidate =
        parseDateTime(record.crtTime ?? record.createdAt) ??
        parseDateTime(record.testTime);
      if (!candidate) return;
      const formatted = candidate.toISOString();
      const oldestTime = oldest ? parseDateTime(oldest)?.getTime() : null;
      const newestTime = newest ? parseDateTime(newest)?.getTime() : null;
      const candidateTime = candidate.getTime();
      if (!oldest || (oldestTime != null && candidateTime < oldestTime)) {
        oldest = record.crtTime ?? record.createdAt ?? record.testTime ?? formatted;
      }
      if (!newest || (newestTime != null && candidateTime > newestTime)) {
        newest = record.crtTime ?? record.createdAt ?? record.testTime ?? formatted;
      }
    });
    return { oldestRecordAt: oldest, newestRecordAt: newest };
  }, [insights?.records]);

  const formatRangeLabel = (value?: string | null) => {
    if (!value) return "—";
    const trimmed = value.trim();
    const match = trimmed.match(
      /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/
    );
    if (match) {
      const [, yyyy, mm, dd, hh, min] = match;
      return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    }
    return value;
  };

  const rawRangeStart =
    statsFullRangeRaw?.start ||
    statsFullRange?.from ||
    backendRange?.from ||
    latestMonthRange?.from ||
    oldestRecordAt ||
    undefined;
  const rawRangeEnd =
    statsFullRangeRaw?.end ||
    statsFullRange?.to ||
    backendRange?.to ||
    latestMonthRange?.to ||
    newestRecordAt ||
    undefined;
  const displayRangeStart = formatRangeLabel(rawRangeStart);
  const displayRangeEnd = formatRangeLabel(rawRangeEnd);

  useEffect(() => {
    if (!activeRange) return;
    if (isSameRange(activeRange, lastAutoRange)) return;
    console.log("Auto range update", activeRange, "previous", lastAutoRange);
    setDateRange(activeRange);
    setLastAutoRange(activeRange);
    if (!initialRangeSet) {
      setInitialRangeSet(true);
    }
  }, [activeRange, lastAutoRange, initialRangeSet]);

  useEffect(() => {
    if (!dateRange.from || !dateRange.to) return;
    if (lastSyncedRange && isSameRange(dateRange, lastSyncedRange)) return;
    setLastSyncedRange(dateRange);
    console.log("Auto sync data triggered after reload", dateRange);
    const isInitialSync = initialAutoSyncRef.current;
    if (isInitialSync) {
      setWaitingForStableData(true);
      initialAutoSyncRef.current = false;
    }
    void (async () => {
      try {
        await startDataSync();
      } finally {
        if (isInitialSync) {
          setWaitingForStableData(false);
        }
      }
    })();
  }, [dateRange, lastSyncedRange, startDataSync]);

  if (loading || waitingForStableData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Đang tải dữ liệu từ API..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">Lỗi: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Không có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-full mx-auto">
      {/* Khu vực điều khiển scraper & health */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3 rounded-md border bg-card p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2"></div>
          <div className="rounded-md border bg-card p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold" htmlFor="sync-from">
                  Từ ngày
                </label>
                <Input
                  id="sync-from"
                  type="date"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, from: e.target.value }))
                  }
                  className="h-8 w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold" htmlFor="sync-to">
                  Đến ngày
                </label>
                <Input
                  id="sync-to"
                  type="date"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, to: e.target.value }))
                  }
                  className="h-8 w-40"
                />
              </div>
              <p className=" text-muted-foreground">
                Dùng khoảng ngày này rồi bấm Tải Data để xem hoặc tải dữ liệu trong khoảng ngày đã chọn nhé!!!.
              </p>
            </div>
          </div>
          <div className="pt-3 border-t mt-3">
            <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:gap-3">
              <Button
                size="sm"
                onClick={() => startFullSync(true)}
                disabled={fullSyncLoading || dataSyncLoading}
                className="w-full sm:w-auto px-4 py-2"
              >
                {fullSyncLoading
                  ? "Đang tải data..."
                  : "Tải Data từ máy soi da"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={startDataSync}
                disabled={fullSyncLoading || dataSyncLoading}
                className="w-full sm:w-auto px-4 py-2"
              >
                {dataSyncLoading ? "Đang tải data..." : "Xem Data từ hệ thống"}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-md border bg-card p-3 sm:p-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">Tình trạng dữ liệu</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Trạng thái API: {health ?? "Đang kiểm tra..."}
            </p>
          </div>

          <p className="grid">
            <span className="font-semibold text-foreground">
              Hồ sơ:
            </span>
            <span>
              Cũ nhất {displayRangeStart} | Mới nhất {displayRangeEnd}</span>
          </p>
          <p className="">
            <span className="font-semibold text-foreground">Tổng hồ sơ toàn hệ thống:</span>{" "}
            {new Intl.NumberFormat("vi-VN").format(
              totalRecordsAll ?? insights.totalRecords ?? 0
            )}
          </p>
          <div className="space-y-2">
            <h3 className=" font-semibold">Export dữ liệu</h3>
            <div className="flex flex-wrap gap-2">
              <a
                href={`${exportUrl}?format=json`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="sm"
                  className="bg-[#0f9d58] text-white hover:bg-[#0d8b4b] border-none"
                >
                  Export JSON
                </Button>
              </a>
              <a
                href={`${exportUrl}?format=csv`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="sm"
                  className="bg-[#3b4cc0] text-white hover:bg-[#2a36a1] border-none"
                >
                  Export CSV
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats + bảng preview dữ liệu từ /api/data */}

      {/* Phần dashboard skin report gốc dùng SkinInsights */}
      <SkinReportHeaderSection generatedAt={insights.generatedAt} />

      <SkinReportTabsSection
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        summaryCards={summaryCards}
        insights={insights}
        severeAcne={severeAcne}
        severePore={severePore}
        issueDefinitions={issueDefinitions}
        topMultiUseGoods={topMultiUseGoods}
        formatPercent={formatPercent}
        kpiPlan={kpiPlan}
        onCardClick={handleCardClick}
        onShowRecords={handleShowRecords}
      />

      <DialogListCustomer
        isOpen={recordsOpen}
        onOpenChange={setRecordsOpen}
        insights={insights}
        records={sortedRecords}
        paginatedRecords={paginatedRecords}
        page={recordPage}
        totalPages={totalPages}
        pageSize={pageSize}
        formatSex={formatSex}
        formatDateTime={formatDateTime}
        onViewRecord={handleViewRecord}
        onPageChange={setRecordPage}
      />

      <DialogDetailCustomer
        open={detailOpen}
        onOpenChange={handleDetailOpenChange}
        record={selectedRecord}
        moduleDetails={moduleDetails}
        formatSex={formatSex}
        formatDateTime={formatDateTime}
      />
    </div>
  );
}
