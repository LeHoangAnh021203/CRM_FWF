import type {
  AppDownloadPie,
  AppDownloadStatusMap,
  FacilityHourService,
  LineChartRanges,
  TrendSeriesMap,
} from "./types";

export const buildCustomerTypeTrendData = (raw: TrendSeriesMap | null) => {
  if (!raw) return [];
  const allDatesSet = new Set<string>();
  Object.values(raw).forEach((arr) => {
    (arr as Array<{ date: string; count: number }>).forEach((item) => {
      allDatesSet.add(item.date.slice(0, 10));
    });
  });
  const allDates = Array.from(allDatesSet).sort();
  const allTypes = Object.keys(raw);

  return allDates.map((date) => {
    const row: Record<string, string | number> = { date: String(date) };
    allTypes.forEach((type) => {
      const arr = raw[type] as Array<{ date: string; count: number }>;
      const found = arr.find((item) => item.date.slice(0, 10) === date);
      row[type] = found ? found.count : 0;
    });
    return row;
  });
};

export const buildCustomerOldTypeTrendData = (raw: LineChartRanges | null) => {
  if (!raw) return [];
  const current = Array.isArray(raw.currentRange) ? raw.currentRange : [];
  const previous = Array.isArray(raw.previousRange) ? raw.previousRange : [];
  return current.map((item, idx) => ({
    date: item.date || "",
    "Khách cũ hiện tại": item.count,
    "Khách cũ tháng trước": previous[idx]?.count ?? 0,
  }));
};

export const buildCustomerSourceTrendData = (raw: TrendSeriesMap | null) => {
  if (!raw) return [];
  const allDatesSet = new Set<string>();
  Object.values(raw).forEach((arr) => {
    (arr as Array<{ date: string; count: number }>).forEach((item) => {
      allDatesSet.add(item.date.slice(0, 10));
    });
  });
  const allDates = Array.from(allDatesSet).sort();

  const sourceMapping: Record<string, string> = {
    Fanpage: "Fanpage",
    Facebook: "Fanpage",
    app: "App",
    web: "App",
    Shoppe: "Ecommerce",
    "TT Shop": "Ecommerce",
    "Không có": "Vãng lai",
    "Vãng lai": "Vãng lai",
  };

  const groupedData = new Map<string, Record<string, number>>();
  allDates.forEach((date) => {
    groupedData.set(date as string, {
      Fanpage: 0,
      App: 0,
      Ecommerce: 0,
      "Vãng lai": 0,
    });
  });

  Object.entries(raw).forEach(([sourceType, data]) => {
    const mappedType = sourceMapping[sourceType as string] || sourceType;
    (data as Array<{ date: string; count: number }>).forEach((item) => {
      const date = item.date.slice(0, 10);
      const existing = groupedData.get(date as string);
      if (existing && mappedType in existing) {
        existing[mappedType as keyof typeof existing] += item.count;
      }
    });
  });

  return allDates.map((date) => {
    const data = groupedData.get(date as string) || {
      Fanpage: 0,
      App: 0,
      Ecommerce: 0,
      "Vãng lai": 0,
    };
    return {
      date: String(date),
      ...data,
    };
  });
};

export const buildAppDownloadStatusData = (raw: AppDownloadStatusMap | null) =>
  raw ? Object.values(raw).flat() : [];

export const buildAppDownloadPieData = (raw: AppDownloadPie | null) =>
  raw
    ? [
        { name: "Đã tải app", value: raw.totalNew || 0 },
        { name: "Chưa tải app", value: raw.totalOld || 0 },
      ]
    : [];

export const buildAllHourRanges = (raw: FacilityHourService | null) => {
  if (!raw) return [];
  const set = new Set<string>();
  raw.forEach((item) => {
    Object.keys(item.hourlyCounts).forEach((hour) => set.add(hour));
  });
  return Array.from(set).sort((a, b) => {
    const getStart = (s: string) => parseInt(s.split("-")[0], 10);
    return getStart(a) - getStart(b);
  });
};

export const buildFacilityHourTableData = (raw: FacilityHourService | null) => {
  if (!raw) return [];
  const data = raw.map((item) => ({
    facility: item.facility,
    ...item.hourlyCounts,
    total: item.total,
  }));
  return data.sort((a, b) => (b.total as number) - (a.total as number));
};

export const buildBookingCompletionTableData = (
  raw: FacilityHourService | null
) => {
  if (!raw) return [];
  const data = raw.map((item) => ({
    facility: item.facility,
    ...item.hourlyCounts,
    total: item.total,
  }));
  return data.sort(
    (a, b) => (Number(b.total) as number) - (Number(a.total) as number)
  );
};

export const buildSortedAppDownloadStatusData = (
  appDownloadStatusData: Array<Record<string, unknown>>
) => {
  const toPlain = (
    obj: Record<string, unknown>
  ): Record<string, string | number> => {
    const out: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "string" || typeof v === "number") out[k] = v;
    }
    return out;
  };

  const getDate = (d: Record<string, string | number>) => {
    const s = String(d.date ?? "");
    const m1 = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m1) return new Date(`${m1[1]}-${m1[2]}-${m1[3]}`).getTime();
    const m2 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m2) return new Date(`${m2[3]}-${m2[2]}-${m2[1]}`).getTime();
    return s ? new Date(s).getTime() : 0;
  };

  return appDownloadStatusData.map(toPlain).sort((a, b) => getDate(a) - getDate(b));
};
