import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { TabsContent } from "@/app/components/ui/tabs";
import { Progress } from "@/app/components/ui/progress";
import { SkinInsights } from "@/app/lib/skin-insights";
import { BarChart3, Droplets } from "lucide-react";
import { SeverityPie3DChart } from "./SeverityPie3DChart";

type SeverityKey = "acne" | "pore" | "spot" | "wrinkle";

const severityModules: SeverityKey[] = ["acne", "pore", "spot", "wrinkle"];

const titleMap: Record<SeverityKey, string> = {
  acne: "Mức độ mụn",
  pore: "Lỗ chân lông",
  spot: "Đốm / nám",
  wrinkle: "Nếp nhăn",
};

const iconColorMap: Record<SeverityKey, string> = {
  acne: "text-rose-500",
  pore: "text-orange-500",
  spot: "text-amber-500",
  wrinkle: "text-cyan-500",
};

interface IssueDefinition {
  key: string;
  title: string;
  description: string;
  action: string;
  trend: {
    highShare: number;
    mediumShare: number;
    averageScore: number | null;
  };
}

interface SpecialSkinProps {
  insights: SkinInsights;
  issueDefinitions: IssueDefinition[];
  formatPercent: (value?: number) => string;
}

export function SpecialSkin({
  insights,
  issueDefinitions,
  formatPercent,
}: SpecialSkinProps) {
  const severitySummary = useMemo(() => {
    return severityModules.map((key) => {
      const distribution = insights.severity[key] ?? [];
      const high = distribution
        .filter((item) => Number(item.label) >= 4)
        .reduce((sum, item) => sum + item.percent, 0);
      const medium = distribution
        .filter((item) => Number(item.label) === 3)
        .reduce((sum, item) => sum + item.percent, 0);
      let low = distribution
        .filter((item) => Number(item.label) <= 2)
        .reduce((sum, item) => sum + item.percent, 0);
      const total = high + medium + low;
      const diff = 100 - total;
      if (diff !== 0) {
        low = Math.max(0, low + diff);
      }
      return { key, high, medium, low };
    });
  }, [insights.severity]);

  const scoreTrendPoints = useMemo(() => {
    return issueDefinitions.map((issue, index) => ({
      x: index,
      label: issue.title,
      value: issue.trend.averageScore ?? 0,
    }));
  }, [issueDefinitions]);

  return (
    <TabsContent value="conditions" className="space-y-6 pt-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-orange-500">
            Nhóm vấn đề da nổi bật
          </h2>
          <p className="text-sm text-gray-500">
            Phân bố theo cấp độ (1 tốt → 5 nghiêm trọng)
          </p>
        </div>
        <BarChart3 className="h-5 w-5 text-gray-400" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {severityModules.map((key) => {
          const distribution = insights.severity[key] ?? [];
          return (
            <Card key={key} className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{titleMap[key]}</span>
                  <Droplets className={`h-4 w-4 ${iconColorMap[key]}`} />
                </CardTitle>
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
                {distribution.length === 0 && (
                  <p className="text-xs text-gray-400">Chưa có dữ liệu.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {severitySummary.map((summary) => (
          <Card
            key={`${summary.key}-donut`}
            className="border-orange-100 shadow-sm"
          >
            <CardHeader>
              <CardTitle className="text-sm uppercase text-orange-500">
                {titleMap[summary.key]}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <SeverityPie3DChart
                segments={[
                  { label: "Độ 4-5", value: summary.high, color: "#fb923c" },
                  { label: "Độ 3", value: summary.medium, color: "#ffd84d" },
                  { label: "Độ 1-2", value: summary.low, color: "#32d5ff" },
                ]}
              />
              <div className="text-xs text-gray-500 space-y-1 w-full">
                <div className="flex justify-between">
                  <span className="text-orange-500">Độ 4-5</span>
                  <span>{summary.high.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-500">Độ 3</span>
                  <span>{summary.medium.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-600">Độ 1-2</span>
                  <span>{summary.low.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {issueDefinitions.map((issue) => (
          <Card key={issue.key} className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle>{issue.title}</CardTitle>
              <p className="text-xs text-gray-500">{issue.description}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <InfoRow
                label="Độ 4-5"
                value={formatPercent(issue.trend.highShare)}
              />
              <InfoRow
                label="Độ 2-3"
                value={formatPercent(issue.trend.mediumShare)}
              />
              <InfoRow
                label="Điểm trung bình"
                value={
                  issue.trend.averageScore !== null
                    ? issue.trend.averageScore
                    : "—"
                }
              />
              <p className="mt-2 text-xs text-[#f66035]">{issue.action}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm uppercase text-orange-500">
            Xu hướng điểm trung bình
          </CardTitle>
          <p className="text-xs text-gray-500">
            So sánh điểm các nhóm vấn đề để ưu tiên nguồn lực
          </p>
        </CardHeader>
        <CardContent>
          <TrendLineChart points={scoreTrendPoints} />
        </CardContent>
      </Card>
    </TabsContent>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function TrendLineChart({
  points,
}: {
  points: Array<{ x: number; label: string; value: number }>;
}) {
  const width = 320;
  const height = 120;
  const maxValue = Math.max(1, ...points.map((p) => p.value));
  const path = points
    .map((point, index) => {
      const x = (index / (points.length - 1 || 1)) * width;
      const y = height - (point.value / maxValue) * height;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-32 w-full text-orange-500"
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          points={path}
        />
        {points.map((point, index) => {
          const x = (index / (points.length - 1 || 1)) * width;
          const y = height - (point.value / maxValue) * height;
          return (
            <circle key={point.label} cx={x} cy={y} r={4} fill="#fb923c" />
          );
        })}
      </svg>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500 md:grid-cols-3">
        {points.map((point) => (
          <div key={point.label}>
            <p className="font-semibold text-gray-900">{point.value || "—"}</p>
            <p className="truncate">{point.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
