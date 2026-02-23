import type {
  DistributionEntry,
  IssueTrend,
  SkinRecordSummary,
} from "@/app/lib/skin-insights";

export const sumPercent = (items: DistributionEntry[] = [], labels: string[]) =>
  Number(
    items
      .filter((item) => labels.includes(item.label))
      .reduce((total, item) => total + item.percent, 0)
      .toFixed(1),
  );

export const formatPercent = (value?: number) =>
  `${(value ?? 0).toFixed(1)}%`.replace(".0", "");

export const formatSex = (value?: number | string) => {
  const normalized = value !== undefined && value !== null ? String(value) : "";
  if (normalized === "2") return "female";
  if (normalized === "1") return "male";
  return "unknown";
};

export const parseDateTime = (value?: string) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // If ISO or has timezone, rely on Date parsing.
  if (/[Tt]/.test(trimmed) || /Z$|[+-]\d{2}:?\d{2}$/.test(trimmed)) {
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  // Handle "YYYY-MM-DD HH:mm[:ss]" as local time.
  const isoLocalMatch = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (isoLocalMatch) {
    const [, y, m, d, hh, mm, ss] = isoLocalMatch;
    const date = new Date(
      Number(y),
      Number(m) - 1,
      Number(d),
      Number(hh),
      Number(mm),
      Number(ss || 0),
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // Handle "M/D/YYYY, H:mm[:ss] AM/PM"
  const usMatch = trimmed.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AP]M)$/i,
  );
  if (usMatch) {
    const [, mm, dd, yyyy, hh, min, ss, period] = usMatch;
    let hour = Number(hh);
    if (/pm/i.test(period) && hour < 12) {
      hour += 12;
    }
    if (/am/i.test(period) && hour === 12) {
      hour = 0;
    }
    const date = new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      hour,
      Number(min),
      Number(ss || 0),
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const fallback = new Date(trimmed);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

export const formatDateTime = (value?: string) => {
  const parsed = parseDateTime(value);
  if (!parsed) return "—";
  return parsed.toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

export const getTrend = (
  trends: Partial<Record<string, IssueTrend>>,
  key: string,
): IssueTrend => {
  return (
    trends[key] ?? {
      highShare: 0,
      mediumShare: 0,
      lowShare: 0,
      averageScore: null,
    }
  );
};

export const buildSortedRecords = (records: SkinRecordSummary[] = []) =>
  [...records].sort((a, b) => {
    const aTime = parseDateTime(a.createdAt)?.getTime();
    const bTime = parseDateTime(b.createdAt)?.getTime();
    if (!aTime) return 1;
    if (!bTime) return -1;
    return bTime - aTime;
  });

export const buildPaginatedRecords = (
  records: SkinRecordSummary[],
  page: number,
  pageSize: number,
) => {
  const start = (page - 1) * pageSize;
  return records.slice(start, start + pageSize);
};
