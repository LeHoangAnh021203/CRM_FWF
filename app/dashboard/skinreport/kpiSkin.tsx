import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { TabsContent } from "@/app/components/ui/tabs";
import { Progress } from "@/app/components/ui/progress";
import { GoodsInsight, SkinInsights } from "@/app/lib/skin-insights";
import { PackageSearch } from "lucide-react";
import productsData from "@/data/products.json";
import Image from "next/image";

interface KpiSkinProps {
  insights: SkinInsights;
  topMultiUseGoods: GoodsInsight[];
  formatPercent: (value?: number) => string;
  kpiPlan: Array<{
    title: string;
    target: string;
    evidence: string;
  }>;
}

type ProductCatalogEntry = {
  id: string;
  image?: string;
  name?: string;
};

const productCatalog = new Map(
  (productsData as ProductCatalogEntry[]).map((item) => [item.id, item])
);

const getProductInitial = (label: string) => {
  const trimmed = label.trim();
  if (!trimmed) return "P";
  return trimmed[0]?.toUpperCase() ?? "P";
};

const buildProductImageSrc = (label: string) => {
  const product = productCatalog.get(label);
  if (product?.image) return product.image;
  const initial = getProductInitial(product?.name ?? label);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#f66035"/><stop offset="1" stop-color="#ffb199"/></linearGradient></defs><rect width="64" height="64" rx="12" fill="url(#g)"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="24" fill="#fff">${initial}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export function KpiSkin({
  insights,
  topMultiUseGoods,
  formatPercent,
  kpiPlan,
}: KpiSkinProps) {
  return (
    <TabsContent value="recommendations" className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageSearch className="h-4 w-4 text-[#f66035]" />
              Sản phẩm đa nhiệm (theo vấn đề)
            </CardTitle>
            <p className="text-xs text-gray-500">
              Ưu tiên ID xuất hiện ở nhiều nhóm vấn đề
            </p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {topMultiUseGoods.length === 0 ? (
              <p className="text-sm text-gray-500">
                Chưa có dữ liệu goods đa nhiệm.
              </p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-gray-500">
                    <th className="py-1">Sản phẩm</th>
                    <th className="py-1">Xuất hiện</th>
                    <th className="py-1">Vấn đề</th>
                  </tr>
                </thead>
                <tbody>
                  {topMultiUseGoods.map((item) => {
                    const product = productCatalog.get(item.label);
                    const productName = product?.name ?? item.label;
                    return (
                      <tr key={item.label} className="border-t text-gray-700">
                        <td className="py-2">
                          <div className="flex items-center gap-3">
                            <Image
                              src={buildProductImageSrc(item.label)}
                              alt={productName}
                              className="h-9 w-9 rounded-lg border border-gray-200 object-cover"
                              width={36}
                              height={36}
                              loading="lazy"
                              unoptimized
                            />
                            <span className="font-semibold text-gray-900">
                              {productName}
                            </span>
                          </div>
                        </td>
                        <td className="py-1">
                          {item.count} lần ({formatPercent(item.percent)})
                        </td>
                        <td className="py-1 text-xs text-gray-500">
                          {item.modules.join(", ")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Top sản phẩm tổng hợp</CardTitle>
            <p className="text-xs text-gray-500">
              Theo danh sách tổng hợp từ hệ thống
            </p>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-gray-700">
              {insights.topGoods.map((item, index) => {
                const product = productCatalog.get(item.label);
                const productName = product?.name ?? item.label;
                return (
                  <li
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={buildProductImageSrc(item.label)}
                        alt={productName}
                        className="h-9 w-9 rounded-lg border border-gray-200 object-cover"
                        width={36}
                        height={36}
                        loading="lazy"
                        unoptimized
                      />
                      <span className="text-xs font-semibold text-gray-500">
                        #{index + 1}
                      </span>
                      <span className="font-medium text-gray-900">
                        {productName}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {item.count} lần
                    </span>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Độ nhạy cảm da</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.sensitivity.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{item.label}</span>
                  <span>{item.percent}%</span>
                </div>
                <Progress value={item.percent} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Quầng thâm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.darkCircleTypes.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span>{item.percent}%</span>
                </div>
                <Progress value={item.percent} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle>KPI vận hành đề xuất</CardTitle>
          <p className="text-xs text-gray-500">
            Dựa trên tần suất vấn đề & logic DA từ dữ liệu gốc
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {kpiPlan.map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-gray-100 p-3 text-sm text-gray-700"
            >
              <p className="font-semibold">{item.title}</p>
              <p className="text-xs text-gray-500">Mục tiêu: {item.target}</p>
              <p className="mt-1 text-xs text-[#f66035]">{item.evidence}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
