import type {
  PaymentByRegionRow,
  PaymentPercentData,
  PaymentPieItem,
  PaymentRegionChartItem,
} from "./types";

const PAYMENT_COLORS: Record<string, string> = {
  "TIỀN MẶT": "#00d084",
  "CHUYỂN KHOẢN": "#5bd1d7",
  "THẺ TÍN DỤNG": "#ff7f7f",
  "THẺ TRẢ TRƯỚC": "#f66035",
  "CÒN NỢ": "#eb94cf",
};

export const buildPaymentPercentPieData = (
  raw: PaymentPercentData | null
): PaymentPieItem[] => {
  if (!raw) return [];
  return [
    {
      name: "TIỀN MẶT",
      value: raw.totalCash || 0,
      color: PAYMENT_COLORS["TIỀN MẶT"],
    },
    {
      name: "CHUYỂN KHOẢN",
      value: raw.totalTransfer || 0,
      color: PAYMENT_COLORS["CHUYỂN KHOẢN"],
    },
    {
      name: "THẺ TÍN DỤNG",
      value: raw.totalCreditCard || 0,
      color: PAYMENT_COLORS["THẺ TÍN DỤNG"],
    },
    {
      name: "THẺ TRẢ TRƯỚC",
      value: raw.totalPrepaidCard || 0,
      color: PAYMENT_COLORS["THẺ TRẢ TRƯỚC"],
    },
    {
      name: "CÒN NỢ",
      value: raw.totalDebt || 0,
      color: PAYMENT_COLORS["CÒN NỢ"],
    },
  ].filter((item) => item.value > 0);
};

export const buildPaymentRegionData = (
  paymentByRegionData: PaymentByRegionRow[] | null
): PaymentRegionChartItem[] => {
  if (!paymentByRegionData) return [];
  const transformedData = paymentByRegionData.map((item) => ({
    region: item.region,
    bank: item.transfer || 0,
    cash: item.cash || 0,
    card: item.creditCard || 0,
  }));

  return transformedData.filter((item) => item.bank + item.cash + item.card > 0);
};
