"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  computeSkinInsights,
  type RemoteRecord,
  type SkinInsights,
} from "@/app/lib/skin-insights-client";
import { DialogListCustomer } from "../skinreport/dialogListCustomer";
import { DialogDetailCustomer } from "../skinreport/dialogDetailCustomer";
import { SkinReportHeaderSection } from "../skinreport/sections/header/SkinReportHeaderSection";
import { SkinReportTabsSection } from "../skinreport/sections/tabs/SkinReportTabsSection";
import { useSkinReportState } from "../skinreport/hooks/useSkinReportState";
import { LoadingSpinner } from "@/app/components/loading";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

type DateRange = {
  from: string;
  to: string;
};
type SystemStats = {
  total: number;
  oldestRecord?: string | null;
  newestRecord?: string | null;
  dataTimeRange?: { from?: string | null; to?: string | null };
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
    return "http://localhost:3001";
  })();

  // Scraper / data API states
  const [, setHealth] = useState<string | null>(null);
  const [fullSyncLoading, setFullSyncLoading] = useState(false);
  const [dataSyncLoading, setDataSyncLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>(() =>
    buildMonthRange(new Date())
  );
  const rangeField = "crt_time";
  const waitingForStableData = fullSyncLoading || dataSyncLoading;
  const handleManualDateChange =
    (field: keyof DateRange) =>
    (value: string) => {
      setDateRange((prev) => ({ ...prev, [field]: value }));
    };
  const initialRangeRef = useRef<DateRange>(dateRange);
  const initialLoadRef = useRef(true);
  // --- Health check + stats + data preview từ API mới ---
  const HEALTH_PATH =
    process.env.NEXT_PUBLIC_SKIN_API_HEALTH_PATH || "/api/health";
  const EXPORT_PATH =
    process.env.NEXT_PUBLIC_SKIN_API_EXPORT_PATH || "/api/data/export";
  const FULL_SYNC_PATH =
    process.env.NEXT_PUBLIC_SKIN_API_FULL_SYNC_PATH || "/api/scrape/full-sync";
  const VIEW_PATH =
    process.env.NEXT_PUBLIC_SKIN_API_DATA_VIEW_PATH || "/api/data/view";
  const STATS_PATH =
    process.env.NEXT_PUBLIC_SKIN_API_STATS_PATH || "/api/data/stats";

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
  const viewUrlBase = useMemo(
    () => `${apiBase}${VIEW_PATH}`,
    [apiBase, VIEW_PATH]
  );
  const statsUrl = useMemo(
    () => `${apiBase}${STATS_PATH}?rangeField=crt_time`,
    [apiBase, STATS_PATH]
  );
  const buildRangeQuery = useCallback(
    (range: DateRange) => {
      const params = new URLSearchParams();
      if (range.from) {
        params.set("start", range.from);
        params.set("from", range.from);
        params.set("st", range.from);
      }
      if (range.to) {
        params.set("end", range.to);
        params.set("to", range.to);
        params.set("ed", range.to);
      }
      params.set("rangeField", rangeField);
      return params.toString();
    },
    [rangeField]
  );
  const rangeFilterString = useMemo(
    () => buildRangeQuery(dateRange),
    [buildRangeQuery, dateRange]
  );

  const extractRecordsFromPayload = (payload: unknown): RemoteRecord[] | null => {
    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === "object") {
      const candidate = (payload as Record<string, unknown>).data;
      if (Array.isArray(candidate)) {
        return candidate as RemoteRecord[];
      }
    }
    return null;
  };

  const dataExportJsonUrl = useMemo(() => {
    const suffix = rangeFilterString ? `${rangeFilterString}&format=json` : "format=json";
    return `${exportUrl}?${suffix}`;
  }, [exportUrl, rangeFilterString]);

  const dataExportCsvUrl = useMemo(() => {
    const suffix = rangeFilterString ? `${rangeFilterString}&format=csv` : "format=csv";
    return `${exportUrl}?${suffix}`;
  }, [exportUrl, rangeFilterString]);

  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);

  const fetchSystemStats = React.useCallback(async () => {
    try {
      const res = await fetch(statsUrl);
      if (!res.ok) {
        console.error("fetchSystemStats failed", res.status);
        return;
      }
      const payload = await res.json();
      if (!payload || typeof payload !== "object") return;
      const stats = (payload as Record<string, unknown>).stats;
      if (!stats || typeof stats !== "object") return;
      const totalValue = (stats as Record<string, unknown>).total;
      const total =
        typeof totalValue === "number"
          ? totalValue
          : typeof totalValue === "string"
          ? Number(totalValue)
          : 0;
      const dataTimeRange = (stats as Record<string, unknown>).dataTimeRange;
      setSystemStats({
        total: Number.isNaN(total) ? 0 : total,
        oldestRecord: (stats as Record<string, unknown>).oldestRecord as
          | string
          | undefined,
        newestRecord: (stats as Record<string, unknown>).newestRecord as
          | string
          | undefined,
        dataTimeRange:
          dataTimeRange && typeof dataTimeRange === "object"
            ? (dataTimeRange as { from?: string | null; to?: string | null })
            : undefined,
      });
    } catch (err) {
      console.error("fetch system stats", err);
    }
  }, [statsUrl]);

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

  const startDataSync = React.useCallback(
    async (targetRange: DateRange) => {
      if (!targetRange.from || !targetRange.to) {
        setError("Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc.");
        return;
      }
      if (initialLoadRef.current) {
        setLoading(true);
      }
      setDataSyncLoading(true);
      setError(null);
      try {
        const query = buildRangeQuery(targetRange);
        const url = query ? `${viewUrlBase}?${query}` : viewUrlBase;
        const res = await fetch(url);

        let payload: unknown = null;
        try {
          payload = await res.json();
        } catch {
          // ignore
        }

        if (!res.ok) {
          let message = `Status ${res.status}`;
          if (payload && typeof payload === "object") {
            const msg = (payload as Record<string, unknown>).message;
            if (typeof msg === "string") message = msg;
          }
          throw new Error(message);
        }

        const records = extractRecordsFromPayload(payload);
        if (!records) {
          throw new Error("Sync data trả về định dạng không mong đợi");
        }
        setInsights(computeSkinInsights(records));
        await fetchSystemStats();
      } catch (e) {
        console.error("Sync data error", e);
        alert(e instanceof Error ? `Sync data lỗi: ${e.message}` : "Sync data lỗi");
      } finally {
        setDataSyncLoading(false);
        if (initialLoadRef.current) {
          setLoading(false);
          initialLoadRef.current = false;
        }
      }
    },
    [buildRangeQuery, viewUrlBase, fetchSystemStats]
  );

  const startFullSync = React.useCallback(
    async (save: boolean) => {
      try {
        setFullSyncLoading(true);
        const params = new URLSearchParams();
        params.set("save", save ? "true" : "false");
        if (dateRange.from) params.set("from", dateRange.from);
        if (dateRange.to) params.set("to", dateRange.to);
        params.set("incremental", "true");
        const res = await fetch(`${fullSyncUrl}?${params.toString()}`, {
          method: "POST",
        });

        if (!res.ok) {
          let message = `Status ${res.status}`;
          try {
            const payload = await res.json();
            const msg = (payload as Record<string, unknown>).message;
            if (typeof msg === "string") message = msg;
          } catch {
            // ignore
          }
          throw new Error(message);
        }
        await res.json().catch(() => null);
        await startDataSync(dateRange);
      } catch (e) {
        console.error("Full sync error", e);
        alert(
          e instanceof Error ? `Full sync lỗi: ${e.message}` : "Full sync lỗi"
        );
      } finally {
        setFullSyncLoading(false);
      }
    },
    [fullSyncUrl, dateRange, startDataSync]
  );

  useEffect(() => {
    void startDataSync(initialRangeRef.current);
  }, [startDataSync]);

  useEffect(() => {
    void fetchHealth();
  }, [fetchHealth]);

  useEffect(() => {
    void fetchSystemStats();
  }, [fetchSystemStats]);

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

  const systemRangeStart = systemStats?.dataTimeRange?.from ?? null;
  const systemRangeEnd = systemStats?.dataTimeRange?.to ?? null;
  const displayRangeStart = formatRangeLabel(systemRangeStart);
  const displayRangeEnd = formatRangeLabel(systemRangeEnd);
  const totalRecordsText = systemStats
    ? new Intl.NumberFormat("vi-VN").format(systemStats.total)
    : "Đang tải...";
  const hasSystemStats = Boolean(systemStats);

  if (loading) {
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
      {waitingForStableData && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
          Đang cập nhật dữ liệu mới nhất, các tab vẫn sẵn sàng dùng dữ liệu cũ cho tới khi xong.
        </div>
      )}
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
                  onChange={(e) => handleManualDateChange("from")(e.target.value)}
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
                  onChange={(e) => handleManualDateChange("to")(e.target.value)}
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
                onClick={() => startDataSync(dateRange)}
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
            
          </div>

          <p className="grid">
            <span className="font-semibold text-foreground">
              Hồ sơ:
            </span>
            <span>
              Cũ nhất {displayRangeStart} | Mới nhất {displayRangeEnd}
            </span>
          </p>
          <p className="">
            <span className="font-semibold text-foreground">Tổng hồ sơ toàn hệ thống:</span>{" "}
            {totalRecordsText}
          </p>
          {!hasSystemStats && (
            <p className="text-xs text-muted-foreground">
              Đang lấy dữ liệu tổng hệ thống... Vui lòng đợi một chút.
            </p>
          )}
          <div className="space-y-2">
            <h3 className=" font-semibold">Export dữ liệu</h3>
            <div className="flex flex-wrap gap-2">
              <a
                href={dataExportJsonUrl}
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
                href={dataExportCsvUrl}
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
