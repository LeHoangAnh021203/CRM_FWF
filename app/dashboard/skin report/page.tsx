import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { computeSkinInsights, DistributionEntry } from "@/app/lib/skin-insights";
import {
  Activity,
  BarChart3,
  Droplets,
  Leaf,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

const sumPercent = (items: DistributionEntry[] = [], labels: string[]) =>
  Number(
    items
      .filter((item) => labels.includes(item.label))
      .reduce((total, item) => total + item.percent, 0)
      .toFixed(1)
  );

export default function SkinReportPage() {
  const insights = computeSkinInsights();

  const severeAcne = sumPercent(insights.severity.acne ?? [], ["4", "5"]);
  const severePore = sumPercent(insights.severity.pore ?? [], ["4", "5"]);
  const femaleShare =
    insights.sexDistribution.find((item) => item.label === "2")?.percent ?? 0;
  const maleShare =
    insights.sexDistribution.find((item) => item.label === "1")?.percent ?? 0;

  const summaryCards = [
    {
      title: "Tổng hồ sơ",
      value: insights.totalRecords.toLocaleString("vi-VN"),
      description: "Hợp nhất từ 5 file JSON",
      icon: Users,
    },
    {
      title: "Tuổi trung bình",
      value: `${insights.age.average}`,
      description: `Min ${insights.age.min ?? "—"} / Max ${insights.age.max ?? "—"}`,
      icon: Activity,
    },
    {
      title: "Da chủ đạo",
      value: insights.skinTypes[0]
        ? `${insights.skinTypes[0].label}`
        : "Đang cập nhật",
      description: insights.skinTypes[0]
        ? `${insights.skinTypes[0].percent}% tổng khách`
        : "",
      icon: Leaf,
    },
    {
      title: "Mụn độ 4-5",
      value: `${severeAcne}%`,
      description: "Tỷ lệ khách có mụn nặng",
      icon: Target,
    },
  ];

  const severitySections = [
    {
      key: "acne",
      title: "Mức độ mụn",
      color: "text-rose-500",
      highlight: severeAcne,
      rangeLabel: "độ 4-5",
    },
    {
      key: "pore",
      title: "Lỗ chân lông",
      color: "text-orange-500",
      highlight: severePore,
      rangeLabel: "độ 4-5",
    },
    {
      key: "spot",
      title: "Đốm / nám",
      color: "text-amber-500",
      highlight: sumPercent(insights.severity.spot ?? [], ["3", "4", "5"]),
      rangeLabel: "độ 3-5",
    },
    {
      key: "wrinkle",
      title: "Nếp nhăn",
      color: "text-cyan-500",
      highlight: sumPercent(insights.severity.wrinkle ?? [], ["3", "4", "5"]),
      rangeLabel: "độ 3-5",
    },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-gray-900">
          Báo cáo phân tích da
        </h1>
        <p className="text-sm text-gray-500">
          Cập nhật{" "}
          {new Date(insights.generatedAt).toLocaleString("vi-VN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {card.value}
              </div>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.keyInsights.map((insight) => (
              <div key={insight} className="flex gap-3">
                <Sparkles className="h-4 w-4 text-[#f66035] mt-1" />
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Nhân khẩu học</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-700">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Giới tính
              </p>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span>Nữ</span>
                  <span>{femaleShare}%</span>
                </div>
                <Progress value={femaleShare} className="h-2" />
                <div className="flex justify-between">
                  <span>Nam</span>
                  <span>{maleShare}%</span>
                </div>
                <Progress value={maleShare} className="h-2" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Tuổi nhỏ nhất</p>
                <p className="text-lg font-semibold">{insights.age.min ?? "—"}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Trung vị</p>
                <p className="text-lg font-semibold">
                  {insights.age.median ?? "—"}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Lớn nhất</p>
                <p className="text-lg font-semibold">{insights.age.max ?? "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Chỉ số tình trạng da
            </h2>
            <p className="text-sm text-gray-500">
              Phân bố theo cấp độ (1 tốt → 5 nghiêm trọng)
            </p>
          </div>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {severitySections.map((section) => {
            const distribution = insights.severity[section.key] ?? [];
            return (
              <Card key={section.key} className="border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{section.title}</span>
                    <Droplets className={`h-4 w-4 ${section.color}`} />
                  </CardTitle>
                  <p className="text-xs text-gray-500">
                    {section.rangeLabel}: {section.highlight}%
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {distribution.slice(0, 4).map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Độ {item.label}</span>
                        <span>{item.percent}%</span>
                      </div>
                      <Progress value={item.percent} className="h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Top sản phẩm đề xuất</CardTitle>
            <p className="text-xs text-gray-500">
              Dựa trên các gợi ý chăm sóc tự động
            </p>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-gray-700">
              {insights.topGoods.map((item, index) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-500">
                      #{index + 1}
                    </span>
                    <span className="font-medium text-gray-900">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {item.count} lần
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Nhạy cảm da</CardTitle>
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
    </div>
  );
}
