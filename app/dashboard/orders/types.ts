import type { CalendarDate } from "@internationalized/date";

export interface DataPoint {
  date: string;
  value: number;
  value2: number;
  type: string;
  status: string;
  gender: "Nam" | "Nữ" | "#N/A";
  region?: string;
  branch?: string;
  calendarDate: CalendarDate;
}

export interface RawDataRow {
  [key: string]: string | number | undefined | null;
}

export interface RegionalSalesByDayData {
  date: string;
  HCM: number;
  HaNoi: number;
  DaNang: number;
  NhaTrang: number;
  DaDongCua: number;
  VungTau: number;
  total?: number;
  [key: string]: string | number | undefined;
}

export interface StoreTypeSalesByDayData {
  date: string;
  Mall: number;
  Shophouse: number;
  NhaPho: number;
  DaDongCua: number;
  Khac: number;
  total?: number;
  [key: string]: string | number | undefined;
}

export interface CustomerTypeSalesByDayData {
  date: string;
  KHTraiNghiem: number;
  KHIron: number;
  KHSilver: number;
  KHBronze: number;
  KHDiamond: number;
  Khac: number;
  total?: number;
  [key: string]: string | number | undefined;
}

export interface RegionStatData {
  region: string;
  orders: number;
  delta: number;
  revenue: number;
  previousRevenue: number;
  growthPercent: number;
  percentage?: number;
}

export interface StoreOrderTableRow {
  location: string;
  totalOrders: number;
  totalOrdersDelta: number | null;
  cardOrders: number;
  cardOrdersDelta: number | null;
  retailOrders: number;
  retailOrdersDelta: number | null;
  foxieOrders: number;
  foxieOrdersDelta: number | null;
  comboOrders: number;
  comboOrdersDelta: number | null;
}

export interface TotalOrderSumAll {
  totalOrders: number;
  totalOrdersDelta: number;
  cardOrders: number;
  cardOrdersDelta: number;
  retailOrders: number;
  retailOrdersDelta: number;
  foxieOrders: number;
  foxieOrdersDelta: number;
  comboOrders: number;
  comboOrdersDelta: number;
}
