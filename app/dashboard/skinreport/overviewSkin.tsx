import React from "react";
import { TabsContent } from "@/app/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Sparkles, Activity, Droplets, Shield, Smartphone } from "lucide-react";
import { SkinInsights } from "@/app/lib/skin-insights";
import productsData from "@/data/products.json";

type ProductInfo = {
  id: string;
  image: string;
  name: string;
  price: string;
  efficacy: string;
};

const productCatalog = productsData as ProductInfo[];
const productMap = productCatalog.reduce<Record<string, ProductInfo>>(
  (acc, product) => {
    acc[product.id] = product;
    return acc;
  },
  {}
);

interface SummaryCard {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  tab?: string;
  action?: "records" | string;
}

interface OverviewSkinProps {
  summaryCards: SummaryCard[];
  insights: SkinInsights;
  severeAcne: number;
  severePore: number;
  onCardClick?: (tab: string) => void;
  onShowRecords?: () => void;
}

const formatPercent = (value?: number, total?: number) => {
  if (value === undefined) return "0%";
  const normalized = Number(value.toFixed(2));
  const decimals = Number.isInteger(normalized)
    ? 0
    : Number.isInteger(normalized * 10)
    ? 1
    : 2;
  const formatted = normalized.toFixed(decimals);
  if (total !== undefined) {
    const count = Math.round((normalized / 100) * total);
    return `${formatted}% · ${count.toLocaleString(
      "vi-VN"
    )} / ${total.toLocaleString("vi-VN")}`;
  }
  return `${formatted}%`;
};

export function OverviewSkin({
  summaryCards,
  insights,
  severeAcne,
  severePore,
  onCardClick,
  onShowRecords,
}: OverviewSkinProps) {
  const handleCardClick = (card: SummaryCard) => {
    if (card.action === "records" && onShowRecords) {
      onShowRecords();
      return;
    }
    if (card.tab && onCardClick) onCardClick(card.tab);
  };

  const extWaterShare = insights.issueTrends.ext_water?.highShare ?? 0;
  const metricBars = [
    {
      label: "Hydration",
      value: 100 - insights.dataQuality.averageAgeGap * 2,
    },
    {
      label: "Collagen",
      value: 100 - (insights.issueTrends.collagen?.highShare ?? 65),
    },
    {
      label: "Pore control",
      value: 100 - severePore,
    },
  ].map((item) => ({
    ...item,
    value: Math.max(10, Math.min(100, item.value)),
  }));

  const columnChartData = insights.skinTypes.slice(0, 4);
  const topProductHighlights = insights.topGoods.slice(0, 4).map((item) => ({
    ...item,
    product: productMap[item.label],
  }));

  return (
    <TabsContent value="overview" className="space-y-6 pt-5">
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="col-span-full rounded-3xl border border-orange-200 bg-gradient-to-r from-white to-orange-50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-orange-500">
              OVERVIEW SNAPSHOT
              <Shield size={16} />
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 grid-cols-1 lg:grid-cols-[1.3fr_minmax(0,1fr)]">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {summaryCards.map((card) => (
                <div
                  key={card.title}
                  onClick={() => handleCardClick(card)}
                  className={`rounded-2xl border border-orange-500 bg-white/70 p-4 transition ${
                    card.tab ? "cursor-pointer hover:-translate-y-1" : ""
                  }`}
                >
                  <p className="text-[11px] uppercase  text-orange-400">
                    {card.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-2xl font-semibold text-gray-900">
                      {card.value}
                    </span>
                    <card.icon className="h-4 w-4 text-orange-400" />
                  </div>
                  <p className="text-xs text-gray-500">
                    {getSummaryDescription(
                      card.title,
                      insights,
                      extWaterShare,
                      card.description
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-orange-100 bg-white/80 p-5">
              <p className="text-[11px] uppercase  text-orange-400">
                Health meters
              </p>
              <div className="mt-4 space-y-3">
                {metricBars.map((bar) => (
                  <div key={bar.label}>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{bar.label}</span>
                      <span>{formatPercent(bar.value)}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-orange-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500"
                        style={{ width: `${bar.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-orange-200 bg-white shadow-lg lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs uppercase  text-orange-400">
              Data Quality
              <Activity size={16} />
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 grid-cols-1 lg:grid-cols-[1.2fr_minmax(0,1fr)] text-sm text-gray-700">
            <div className="space-y-2">
              <InfoRow
                label="Hồ sơ có tuổi CRM"
                value={insights.dataQuality.totalWithReportedAge}
              />
              <InfoRow
                label="Hồ sơ có tuổi AI"
                value={insights.dataQuality.totalWithPredictedAge}
              />
              <InfoRow
                label="Age gap trung bình"
                value={`${insights.dataQuality.averageAgeGap} năm`}
              />
              <InfoRow
                label="Số hồ sơ lệch ≥ 5 năm"
                value={`${insights.dataQuality.mismatchCount} (${formatPercent(
                  insights.dataQuality.mismatchShare
                )})`}
              />
            </div>
            <div className="space-y-2">
              <InfoRow
                label="Có số điện thoại"
                value={
                  <>
                    <span className="inline-flex items-center gap-1">
                      <Smartphone className="h-3.5 w-3.5 text-green-500" />
                      {insights.dataQuality.withPhoneCount}
                    </span>
                  </>
                }
              />
              <InfoRow
                label="Thiếu số điện thoại"
                value={insights.dataQuality.missingPhoneCount}
              />
              <InfoRow
                label="Mụn độ 4-5"
                value={formatPercent(severeAcne, insights.totalRecords)}
              />
              <InfoRow
                label="Pore độ 4-5"
                value={formatPercent(severePore, insights.totalRecords)}
              />
            </div>
          </CardContent>
        </Card>

          <Card className="rounded-3xl border border-orange-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xs uppercase  text-orange-400">
              Phân bổ loại da
              <Droplets size={16} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-3">
              {columnChartData.map((type) => (
                <div
                  key={type.label}
                  className="flex flex-1 flex-col items-center"
                >
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-orange-600 via-orange-400 to-orange-200"
                    style={{ height: `${Math.max(type.percent, 8)}%` }}
                  ></div>
                  <p className="mt-2 text-[11px] uppercase text-gray-500">
                    {type.label}
                  </p>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">
                      {`${type.percent.toFixed(1).replace(".0", "")}%`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {`${Math.round(
                        (type.percent / 100) * insights.totalRecords
                      ).toLocaleString(
                        "vi-VN"
                      )} / ${insights.totalRecords.toLocaleString("vi-VN")}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-3xl border border-orange-100 bg-white shadow-md ">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xs uppercase  text-orange-400">
            Thông tin nổi bật
            <Sparkles size={16} />
          </CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row">
          <CardContent className="space-y-3 w-full lg:w-3/4">
            {insights.keyInsights.map((insight) => (
              <div
                key={insight}
                className="flex gap-3 rounded-2xl border border-orange-100 bg-orange-50/50 p-3"
              >
                <Sparkles className="h-4 w-4 text-orange-500 mt-1" />
                <p className="text-sm text-gray-800">{insight}</p>
              </div>
            ))}
          </CardContent>

          <CardContent className="w-full lg:w-1/4">
            <div className="relative h-64 sm:h-72 lg:h-72 overflow-hidden rounded-3xl border border-orange-100 bg-black">
              <video
                src="/video/logo_3d.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              >
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            </div>
          </CardContent>
        </div>
        <CardContent className="border-t border-orange-100 bg-orange-50/30 mt-2 rounded-b-3xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-[11px] uppercase  text-orange-400">
              Sản phẩm nổi bật
            </p>
            <span className="text-xs text-gray-500"></span>
          </div>
          {topProductHighlights.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">
              Chưa có dữ liệu sản phẩm phù hợp.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {topProductHighlights.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-2 rounded-2xl border border-orange-100 bg-white/90 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-xl border border-orange-100 bg-orange-50">
                      {item.product ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
                        {item.product?.name ?? `Goods #${item.label}`}
                      </p>
                      <p className="text-xs font-semibold text-[#f66035]">
                        {formatCurrency(item.product?.price)}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    <p>
                      Tần suất:{" "}
                      <span className="font-semibold text-gray-900">
                        {item.count} lần · {item.percent.toFixed(1)}%
                      </span>
                    </p>
                    <p className="mt-1">
                      Công dụng:{" "}
                      <span className="text-gray-700">
                        {item.product?.efficacy ?? "—"}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-gray-600">
      <span>{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function getSummaryDescription(
  title: string,
  insights: SkinInsights,
  extWaterShare: number,
  fallback?: string
) {
  switch (title) {
    case "Tổng hồ sơ":
      return `Tổng ${insights.totalRecords.toLocaleString("vi-VN")} hồ sơ`;
    case "Chênh lệch tuổi AI":
      return `${formatPercent(
        insights.dataQuality.mismatchShare,
        insights.totalRecords
      )} lệch ≥ 5 năm`;
    case "Da chủ đạo":
      return `${formatPercent(
        insights.skinTypes[0]?.percent ?? 0,
        insights.totalRecords
      )} hồ sơ`;
    case "Thiếu ẩm độ 4-5":
      return `${formatPercent(
        extWaterShare,
        insights.totalRecords
      )} hồ sơ thiếu ẩm`;
    default:
      return fallback ?? "";
  }
}

function formatCurrency(value?: string) {
  if (!value) return "—";
  const num = Number(value);
  if (Number.isFinite(num)) {
    return `${num.toLocaleString("vi-VN")}₫`;
  }
  return value;
}
