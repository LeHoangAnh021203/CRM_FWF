export interface CustomerSummaryData {
  totalNewCustomers: number;
  actualCustomers: number;
  growthTotal?: number;
  growthActual?: number;
}

export interface PaymentPercentData {
  totalCash: number;
  totalTransfer: number;
  totalCreditCard: number;
  totalPrepaidCard: number;
  totalDebt: number;
  percentCash?: number;
  percentTransfer?: number;
  percentPrepaidCard?: number;
  percentDebt?: number;
}

export interface PaymentByRegionRow {
  region: string;
  transfer: number;
  cash: number;
  creditCard: number;
}

export interface PaymentPieItem {
  name: string;
  value: number;
  color: string;
}

export interface PaymentRegionChartItem {
  region: string;
  bank: number;
  cash: number;
  card: number;
}
