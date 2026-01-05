import React, { Suspense } from "react";
import type {
  StoreOrderTableRow,
  TotalOrderSumAll,
  RegionalSalesByDayData,
  CustomerTypeSalesByDayData,
} from "../../types";
import type { StoreTableRow } from "../../OrderActualStoreSale";
import type { RegionStat } from "../../OrderActualCollection";
import type {
  OverallOrderSummary,
  StoreRevenueData,
} from "../../OrderTop10LocationChartData";
import type { ShopTypeRevenueData } from "../../OrderTotalByStore";
import {
  LazyOrderActualCollection,
  LazyOrderTotalByDay,
  LazyOrderTotalByStore,
  LazyOrderCustomerTypeSaleaByDay,
  LazyOrderTop10LocationChartData,
  LazyOrderActualStoreSale,
  LazyOrdersChartData,
  LazyOrderTop10StoreOfOrder,
  LazyOrderOfStore,
  LazyOrderStatCardsWithAPI,
} from "../../lazy-charts";
import { formatAxisDate, formatMoneyShort } from "../../transformers";

interface OrderSummaryData {
  totalOrders: number;
  serviceOrders: number;
  foxieCardOrders: number;
  productOrders: number;
  cardPurchaseOrders: number;
  deltaTotalOrders: number;
  deltaServiceOrders: number;
  deltaFoxieCardOrders: number;
  deltaProductOrders: number;
  deltaCardPurchaseOrders: number;
}

interface Top10LocationData {
  name: string;
  revenue: number;
  foxie: number;
  rank?: number | null;
}

interface OrdersChartDataPoint {
  date: string;
  orders: number;
  avgPerShop: number;
}

interface ChartOrderData {
  name: string;
  totalOrders: number;
  retailOrders: number;
  cardOrders: number;
  foxieOrders: number;
}

interface OrderChartsSectionProps {
  fromDate: string;
  toDate: string;
  isMobile: boolean;
  storeOrderTableData: StoreOrderTableRow[];
  totalOrderSumAll: TotalOrderSumAll;
  storeTableData: StoreTableRow[];
  avgRevenuePercent: number;
  avgOrderPercent: number;
  regionStats: RegionStat[];
  totalPercentChange: number;
  pieRegionRevenueData: Array<{ name: string; value: number }>;
  regionActualPie: { actualRevenue?: number } | null;
  regionStatRaw: Array<{ revenue: number }> | null;
  regionalSalesByDay: RegionalSalesByDayData[];
  dailyByShopType: ShopTypeRevenueData[] | null;
  customerTypeSalesByDay: CustomerTypeSalesByDayData[];
  top10LocationChartData: Top10LocationData[];
  fullStoreRevenue: StoreRevenueData[] | null;
  overallSummary: OverallOrderSummary | null;
  overallSummaryLoading: boolean;
  overallSummaryError: string | null;
  overallOrderSummary: OrderSummaryData | null;
  overallOrderSummaryLoading: boolean;
  overallOrderSummaryError: string | null;
  ordersChartData: OrdersChartDataPoint[];
  chartOrderData: ChartOrderData[];
}

export function OrderChartsSection({
  fromDate,
  toDate,
  isMobile,
  storeOrderTableData,
  totalOrderSumAll,
  storeTableData,
  avgRevenuePercent,
  avgOrderPercent,
  regionStats,
  totalPercentChange,
  pieRegionRevenueData,
  regionActualPie,
  regionStatRaw,
  regionalSalesByDay,
  dailyByShopType,
  customerTypeSalesByDay,
  top10LocationChartData,
  fullStoreRevenue,
  overallSummary,
  overallSummaryLoading,
  overallSummaryError,
  overallOrderSummary,
  overallOrderSummaryLoading,
  overallOrderSummaryError,
  ordersChartData,
  chartOrderData,
}: OrderChartsSectionProps) {
  return (
    <>
      <Suspense
        fallback={
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        }
      >
        <LazyOrderOfStore
          data-search-ref="orders_store_table"
          storeOrderTableData={storeOrderTableData}
          totalOrderSumAll={totalOrderSumAll}
        />
      </Suspense>

      <Suspense
        fallback={
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        }
      >
        <LazyOrderActualStoreSale
          data-search-ref="orders_store_revenue"
          storeTableData={storeTableData}
          avgRevenuePercent={avgRevenuePercent}
          avgFoxiePercent={0}
          avgOrderPercent={avgOrderPercent}
        />
      </Suspense>

      <Suspense
        fallback={
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        }
      >
        <LazyOrderActualCollection
          data-search-ref="orders_region_pie"
          regionStats={regionStats}
          totalRevenueThisWeek={
            regionActualPie?.actualRevenue ||
            (Array.isArray(regionStatRaw)
              ? regionStatRaw.reduce((sum, r) => sum + r.revenue, 0)
              : 0)
          }
          totalPercentChange={totalPercentChange}
          pieRegionRevenueData={pieRegionRevenueData}
          isMobile={isMobile}
        />
      </Suspense>

      <Suspense
        fallback={
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        }
      >
        <LazyOrderTotalByDay
          data-search-ref="orders_total_by_day"
          key={`regional-chart-${fromDate}-${toDate}`}
          data={regionalSalesByDay}
          isMobile={isMobile}
          formatAxisDate={formatAxisDate}
        />
      </Suspense>

      <Suspense
        fallback={
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        }
      >
        <LazyOrderTotalByStore
          data-search-ref="orders_total_by_store"
          data={dailyByShopType}
          formatAxisDate={formatAxisDate}
        />
      </Suspense>

      <Suspense
        fallback={
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        }
      >
        <LazyOrderCustomerTypeSaleaByDay
          data-search-ref="orders_customer_type_by_day"
          isMobile={isMobile}
          customerTypeSalesByDay={customerTypeSalesByDay}
        />
      </Suspense>

      <Suspense
        fallback={
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        }
      >
        <LazyOrderTop10LocationChartData
          data-search-ref="orders_top10_location"
          isMobile={isMobile}
          top10LocationChartData={top10LocationChartData}
          fullStoreRevenueData={fullStoreRevenue || undefined}
          formatMoneyShort={formatMoneyShort}
          overallOrderSummary={overallSummary}
          overallOrderSummaryLoading={overallSummaryLoading}
          overallOrderSummaryError={overallSummaryError}
        />
      </Suspense>

      <Suspense
        fallback={
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        }
      >
        <LazyOrdersChartData
          data-search-ref="orders_orders_chart"
          isMobile={isMobile}
          ordersChartData={ordersChartData}
        />
      </Suspense>

      <Suspense
        fallback={
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        }
      >
        <LazyOrderTop10StoreOfOrder
          data-search-ref="orders_top10_store"
          chartOrderData={chartOrderData}
          isMobile={isMobile}
        />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-lg p-4 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        }
      >
        <LazyOrderStatCardsWithAPI
          data-search-ref="orders_stat_cards"
          data={overallOrderSummary}
          loading={overallOrderSummaryLoading}
          error={overallOrderSummaryError}
        />
      </Suspense>
    </>
  );
}
