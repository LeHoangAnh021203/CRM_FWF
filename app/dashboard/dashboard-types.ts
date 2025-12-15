export type SalesSummaryResponse = {
  totalRevenue?: string | number;
  cash?: string | number;
  transfer?: string | number;
  card?: string | number;
  actualRevenue?: string | number;
  foxieUsageRevenue?: string | number;
  walletUsageRevenue?: string | number;
  toPay?: string | number;
  debt?: string | number;
};

export type ServiceSummaryItem = {
  serviceName: string;
  serviceUsageAmount: string;
  serviceUsagePercentage: string;
};

export type ServiceSummaryResponse = {
  totalServices: string;
  totalServicesServing: string;
  totalServiceDone: string;
  items: ServiceSummaryItem[];
};

export type CustomerSourceBreakdown = {
  count: number;
  type: string;
};

export type SalesByHourEntry = {
  date: string;
  totalSales: number;
  timeRange: string;
};

export type SalesDetailItem = {
  productName: string;
  productPrice: string;
  productQuantity: string;
  productDiscount: string;
  productCode: string;
  productUnit: string;
  formatTable: string;
  cash: string;
  transfer: string;
  card: string;
  wallet: string;
  foxie: string;
};

export type BookingSummaryResponse = {
  notConfirmed: string;
  confirmed: string;
  denied: string;
  customerCome: string;
  customerNotCome: string;
  cancel: string;
  autoConfirmed: string;
};

export type BookingByHourEntry = {
  type: string;
  count: number;
};

export type DashboardSummarySections = {
  salesSummary?: SalesSummaryResponse | null;
  serviceSummary?: ServiceSummaryResponse | null;
  topServices?: ServiceSummaryItem[] | null;
  salesByHour?: SalesByHourEntry[] | null;
  bookingSummary?: BookingSummaryResponse | null;
  bookingByHour?: BookingByHourEntry[] | null;
  newCustomers?: CustomerSourceBreakdown[] | null;
  oldCustomers?: CustomerSourceBreakdown[] | null;
  salesDetail?: SalesDetailItem[] | null;
  actualRevenueToday?: number | null;
  actualRevenueMTD?: number | null;
};
