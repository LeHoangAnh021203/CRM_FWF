import type { CustomerRecord } from "@/app/lib/customers";

export type DateCountPoint = { date: string; count: number };

export interface LineChartRanges {
  currentRange?: DateCountPoint[];
  previousRange?: DateCountPoint[];
}

export type TrendSeriesMap = Record<string, DateCountPoint[]>;

export interface AppDownloadPie {
  totalNew?: number;
  totalOld?: number;
}

export type AppDownloadStatusMap = Record<
  string,
  Array<{ date?: string; [key: string]: unknown }>
>;

export interface FacilityHourItem {
  facility: string;
  hourlyCounts: Record<string, number>;
  total: number;
}

export type FacilityHourService = FacilityHourItem[];

export interface UniqueCustomersComparison {
  currentTotal?: number;
  changePercentTotal?: number;
  currentMale?: number;
  changePercentMale?: number;
  currentFemale?: number;
  changePercentFemale?: number;
}

export type CustomerSummaryRaw = Record<string, unknown>;

export interface CustomerAllResponse extends Record<string, unknown> {
  content?: CustomerRecord[];
  totalElements?: number;
  totalCustomers?: number;
  totalPages?: number;
  number?: number;
  size?: number;
  numberOfElements?: number;
  pageable?: {
    pageSize?: number;
    pageNumber?: number;
  };
}
