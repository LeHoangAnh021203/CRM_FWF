import CustomerPaymentPieChart from "../../CustomerPaymentPieChart";
import OrderPaymentRegionData from "../../OrderPaymentRegionData";
import type {
  PaymentPieItem,
  PaymentRegionChartItem,
} from "../../types";

interface AccountingChartsSectionProps {
  isMobile: boolean;
  paymentPercentNewPieData: PaymentPieItem[];
  paymentPercentOldPieData: PaymentPieItem[];
  paymentRegionData: PaymentRegionChartItem[];
}

export function AccountingChartsSection({
  isMobile,
  paymentPercentNewPieData,
  paymentPercentOldPieData,
  paymentRegionData,
}: AccountingChartsSectionProps) {
  return (
    <>
      <CustomerPaymentPieChart
        isMobile={isMobile}
        paymentPercentNewPieData={paymentPercentNewPieData}
        paymentPercentOldPieData={paymentPercentOldPieData}
      />

      <OrderPaymentRegionData
        paymentRegionData={paymentRegionData}
        isMobile={isMobile}
      />
    </>
  );
}
