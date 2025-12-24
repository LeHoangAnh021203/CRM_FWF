"use client";

import React from "react";
import { Dialog, DialogContent } from "@/app/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Badge } from "@/app/components/ui/badge";
import { SkinRecordSummary } from "@/app/lib/skin-insights";
import type { ModuleDetailEntry, ModuleData } from "./skin-report-client";
import productsData from "@/data/products.json";

type ProductInfo = {
  id: string;
  image: string;
  name: string;
  price: string;
  efficacy: string;
};

const productCatalog = productsData as ProductInfo[];
const productMap: Record<string, ProductInfo> = productCatalog.reduce(
  (acc, product) => {
    acc[product.id] = product;
    return acc;
  },
  {} as Record<string, ProductInfo>
);

interface DialogDetailCustomerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: SkinRecordSummary | null;
  moduleDetails: ModuleDetailEntry[];
  formatSex: (value?: number | string) => string;
  formatDateTime: (value?: string) => string;
}

export function DialogDetailCustomer({
  open,
  onOpenChange,
  record,
  moduleDetails,
  formatSex,
  formatDateTime,
}: DialogDetailCustomerProps) {
  const detailBody = record ? (
    <div className="max-h-[75vh] min-h-[75vh] overflow-y-auto pr-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-gray-50">
            {record.image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={record.image}
                  alt={record.nickname ?? "Ảnh khách hàng"}
                  className="h-full w-full object-cover"
                />
              </>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-gray-400">
                Không có ảnh
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm">
            <h4 className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Thông tin hồ sơ
            </h4>
            <div className="mt-3 space-y-2">
              <DetailInfo label="Mã hồ sơ" value={record.code} />
              {/* <DetailInfo label="Result ID" value={record.resultId} /> */}
              <DetailInfo
                label="Khách hàng"
                value={record.nickname ?? "Ẩn danh"}
              />
              <DetailInfo label="Số ĐT" value={record.phone ?? "—"} />
              <DetailInfo label="Account" value={record.account ?? "—"} />
              <DetailInfo label="Giới tính" value={formatSex(record.sex)} />
              <DetailInfo
                label="Tuổi CRM"
                value={
                  record.age !== null && record.age !== undefined
                    ? `${record.age} tuổi`
                    : "—"
                }
              />
              <DetailInfo
                label="Tuổi AI"
                value={
                  record.aiAge !== null && record.aiAge !== undefined
                    ? `${record.aiAge} tuổi`
                    : "—"
                }
              />
              <DetailInfo
                label="Thời gian"
                value={formatDateTime(record.createdAt)}
              />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-orange-500 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-orange-400">
              Tổng quan
            </p>
            <div className="mt-3 grid gap-3 text-sm text-gray-700 sm:grid-cols-3">
              <DetailInfo
                label="Loại da:"
                value={record.analysis?.skin_type?.type ?? "—"}
              />
              <DetailInfo
                label="Thiếu ẩm:"
                value={
                  record.analysis?.ext_water?.level
                    ? `Level ${record.analysis?.ext_water?.level}`
                    : "—"
                }
              />
              <DetailInfo
                label="Collagen:"
                value={
                  record.analysis?.collagen?.level
                    ? `Level ${record.analysis?.collagen?.level}`
                    : "—"
                }
              />
              {/* <DetailInfo
                label="Final goods"
                value={
                  record.analysis?.final_result?.goods ?? "Chưa có đề xuất"
                }
              /> */}
            </div>
          </div>

          {moduleDetails.length > 0 ? (
            <Tabs
              defaultValue={moduleDetails[0].key}
              className="rounded-2xl border border-orange-500 p-4"
            >
              <TabsList className="flex flex-wrap gap-2 bg-transparent">
                {moduleDetails.map((module) => (
                  <TabsTrigger
                    key={module.key}
                    value={module.key}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs uppercase tracking-wide text-gray-600 data-[state=active]:border-orange-300 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-500"
                  >
                    {module.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {moduleDetails.map((module) => {
                const data = module.data ?? ({} as ModuleData);
                const goods: string[] =
                  typeof data.goods === "string"
                    ? data.goods
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean)
                    : [];
                const resolvedGoods = goods.map((id) => ({
                  id,
                  product: productMap[id],
                }));
                return (
                  <TabsContent
                    key={module.key}
                    value={module.key}
                    className="mt-4"
                  >
                    <div className="space-y-3 text-sm text-gray-700">
                      <LevelGauge
                        level={data.level}
                       
                        label={module.label}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <DetailInfo
                          label="Score"
                          value={
                            data.score !== undefined ? `${data.score}` : "—"
                          }
                        />
                        {"type" in data && data.type ? (
                          <DetailInfo
                            label="Type"
                            value={data.type as string}
                          />
                        ) : (
                          <DetailInfo label="Type" value="—" />
                        )}
                      </div>
                      <div className="pt-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                          Sản phẩm đề xuất
                        </p>
                        {resolvedGoods.length > 0 ? (
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {resolvedGoods.map(({ id, product }) =>
                              product ? (
                                <div
                                  key={id}
                                  className="flex gap-3 rounded-2xl border border-gray-100 p-3"
                                >
                                  <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div className="space-y-1 text-xs">
                                    <p className="text-sm font-semibold text-gray-900">
                                      {product.name}
                                    </p>
                                    <p className="font-semibold text-[#f66035]">
                                      {formatPrice(product.price)}
                                    </p>
                                    <p className="text-gray-500">
                                      {product.efficacy}
                                    </p>
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">
                                      ID: {id}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <Badge key={id} variant="outline">
                                  {id}
                                </Badge>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-gray-400">
                            Chưa có goods cho hạng mục này.
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          ) : (
            <div className="rounded-2xl border border-gray-100 p-4 text-sm text-gray-500">
              Không tìm thấy dữ liệu module chi tiết cho hồ sơ này.
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <p className="text-sm text-gray-500">Chưa chọn hồ sơ.</p>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl sm:rounded-3xl">
        {detailBody}
      </DialogContent>
    </Dialog>
  );
}

function DetailInfo({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between text-sm text-gray-600">
      <span>{label}</span>
      <span className="font-semibold text-gray-900 text-right">
        {value ?? "—"}
      </span>
    </div>
  );
}

function formatPrice(raw?: string) {
  if (!raw) return "—";
  const num = Number(raw);
  if (Number.isFinite(num)) {
    return `${num.toLocaleString("vi-VN")}₫`;
  }
  return raw;
}

const LEVEL_ROMAN = ["I", "II", "III", "IV", "V"];
const LEVEL_COLORS = ["#9eeb47", "#32d5ff", "#ffd84d", "#ff9040", "#f64040"];
const LEVEL_SEGMENTS = [
  { start: 270, end: 310 },
  { start: 310, end: 350 },
  { start: 350, end: 355 },
  { start: 390, end: 420 },
  { start: 420, end: 450 },
];

function LevelGauge({
  level,
  score,
  label,
}: {
  level?: number | string;
  score?: number | string;
  label: string;
}) {
  const numeric = typeof level === "string" ? Number(level) : level ?? 0;
  const clamped = Math.min(Math.max(Math.round(numeric), 1), 5);
  const hasLevel = Number.isFinite(numeric) && numeric > 0;
  const roman = hasLevel ? LEVEL_ROMAN[clamped - 1] : "—";
  const color = LEVEL_COLORS[clamped - 1] ?? "#E5E7EB";
//   const markers = LEVEL_SEGMENTS.map((segment, index) => {
//     const angle = (segment.start + segment.end) / 2;
//     const { x, y } = polarToCartesian(140, 140, 95, angle);
//     return { x, y, mark: LEVEL_ROMAN[index] };
//   });
  const tickValues = Array.from({ length: 11 }, (_, idx) => idx * 10);

  return (
    <div className="rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
          Level
        </p>
        {score !== undefined && (
          <p className="text-xs text-gray-500">Score: {score}</p>
        )}
      </div>
      <div className="mt-2 flex flex-col items-center">
        <svg viewBox="0 0 280 180" className="h-40 w-full">
          <defs>
            <linearGradient id="gauge-glow" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(56, 219, 255, 0.3)" />
              <stop offset="50%" stopColor="rgba(56, 219, 255, 0.6)" />
              <stop offset="100%" stopColor="rgba(56, 219, 255, 0.3)" />
            </linearGradient>
          </defs>
          <path
            d={describeArc(140, 140, 130, 270, 90)}
            stroke="url(#gauge-glow)"
            strokeWidth={12}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={describeArc(140, 140, 110, 270, 90)}
            stroke="#D1D5DB"
            strokeWidth={28}
            fill="none"
            strokeLinecap="round"
          />
          {hasLevel &&
            LEVEL_SEGMENTS.map((segment, index) => {
              if (index >= clamped) return null;
              return (
                <path
                  key={`${segment.start}-${segment.end}`}
                  d={describeArc(140, 140, 110, segment.start, segment.end, 0)}
                  stroke={color}
                  strokeWidth={28}
                  fill="none"
                  strokeLinecap="round"
                />
              );
            })}
          {tickValues.map((tick) => {
            const fraction = tick / 100;
            const angle = 270 - fraction * 180;
            const outer = polarToCartesian(140, 140, 115, angle);
            const inner = polarToCartesian(140, 140, 105, angle);
            return (
              <line
                key={tick}
                x1={outer.x}
                y1={outer.y}
                x2={inner.x}
                y2={inner.y}
                stroke="#9CA3AF"
                strokeWidth={fraction % 0.2 === 0 ? 2 : 1}
                opacity={fraction % 0.2 === 0 ? 0.8 : 0.4}
              />
            );
          })}
          {/* {tickValues.map((tick) => {
            if (tick % 20 !== 0) return null;
            const fraction = tick / 100;
            const angle = 180 - fraction * 180;
            const pos = polarToCartesian(140, 140, 90, angle);
            return (
              <text
                key={`label-${tick}`}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                className="text-[10px] fill-gray-400"
              >
                {tick}
              </text>
            );
          })} */}
          {/* {markers.map((marker) => (
            <text
              key={marker.mark}
              x={marker.x}
              y={marker.y}
              textAnchor="middle"
              className="text-[11px] fill-gray-500"
            >
              {marker.mark}
            </text>
          ))} */}
          <text
            x={140}
            y={95}
            textAnchor="middle"
            className="text-3xl font-semibold fill-gray-900"
          >
            {roman}
          </text>
          <text
            x={140}
            y={115}
            textAnchor="middle"
            className="text-xs uppercase tracking-[0.3em] fill-gray-500"
          >
            {label}
          </text>
        </svg>
      </div>
    </div>
  );
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  sweepFlag = 0
) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= -180 ? 1 : 0;

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    sweepFlag,
    end.x,
    end.y,
  ].join(" ");
}
