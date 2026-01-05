import type { DistributionEntry, IssueTrend, SkinRecordSummary } from "@/app/lib/skin-insights";

export const sumPercent = (items: DistributionEntry[] = [], labels: string[]) =>
  Number(
    items
      .filter((item) => labels.includes(item.label))
      .reduce((total, item) => total + item.percent, 0)
      .toFixed(1)
  );

export const formatPercent = (value?: number) =>
  `${(value ?? 0).toFixed(1)}%`.replace(".0", "");

export const formatSex = (value?: number | string) => {
  const normalized = value !== undefined && value !== null ? String(value) : "";
  if (normalized === "2") return "female";
  if (normalized === "1") return "male";
  return "unknown";
};

export const formatDateTime = (value?: string) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

export const getTrend = (
  trends: Partial<Record<string, IssueTrend>>,
  key: string
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
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

export const buildPaginatedRecords = (
  records: SkinRecordSummary[],
  page: number,
  pageSize: number
) => {
  const start = (page - 1) * pageSize;
  return records.slice(start, start + pageSize);
};
