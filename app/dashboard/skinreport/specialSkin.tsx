import React, { useMemo, useState } from "react";
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

const ISSUE_LABEL_MAP: Record<string, string> = {
  acne: "Mụn",
  pore: "Lỗ chân lông",
  spot: "Đốm / nám",
  wrinkle: "Nếp nhăn",
  ext_water: "Thiếu ẩm bề mặt",
  collagen: "Collagen suy giảm",
  pockmark: "Rỗ / texture",
  blackhead: "Mụn đầu đen",
  uv_spot: "Đốm UV",
  pigment: "Sắc tố",
  dark_circle: "Quầng thâm",
  sensitive: "Độ nhạy cảm",
};

const ISSUE_ORDER = [
  "acne",
  "spot",
  "pore",
  "wrinkle",
  "blackhead",
  "ext_water",
  "collagen",
  "pockmark",
  "uv_spot",
  "pigment",
  "dark_circle",
  "sensitive",
];

const getGender = (sex?: number | string): "male" | "female" | "unknown" => {
  if (sex === 1 || sex === "1") return "male";
  if (sex === 2 || sex === "2") return "female";
  return "unknown";
};

const toLevel = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
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
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<
    "all" | "male" | "female"
  >("all");

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



  const issueOccurrenceSummary = useMemo(() => {
    const totalRecords = insights.records?.length ?? 0;
    const issueKeys = Array.from(
      new Set([...ISSUE_ORDER, ...issueDefinitions.map((issue) => issue.key)])
    );
    const rows = issueKeys.map((issueKey) => {
      let appearCount = 0;
      let maleCount = 0;
      let femaleCount = 0;
      let severeCount = 0;
      const levelCounts = [0, 0, 0, 0, 0];

      for (const record of insights.records ?? []) {
        const analysis = record.analysis as
          | Record<
            string,
            {
              level?: number | string;
              score?: number | string;
              type?: string | number;
            }
          >
          | undefined;
        const issueData = analysis?.[issueKey];
        if (!issueData) continue;

        const hasLevel =
          issueData.level !== undefined &&
          issueData.level !== null &&
          String(issueData.level).trim() !== "";
        const hasScore =
          issueData.score !== undefined &&
          issueData.score !== null &&
          String(issueData.score).trim() !== "";
        const hasType =
          issueData.type !== undefined &&
          issueData.type !== null &&
          String(issueData.type).trim() !== "";
        if (!hasLevel && !hasScore && !hasType) continue;

        appearCount += 1;

        const gender = getGender(record.sex);
        if (gender === "male") maleCount += 1;
        if (gender === "female") femaleCount += 1;

        const level = toLevel(issueData.level);
        if (level !== null && level >= 1 && level <= 5) {
          levelCounts[level - 1] += 1;
          if (level >= 4) severeCount += 1;
        }
      }
      const share = totalRecords > 0 ? (appearCount / totalRecords) * 100 : 0;
      const severeShare =
        appearCount > 0 ? (severeCount / appearCount) * 100 : 0;

      return {
        key: issueKey,
        title: ISSUE_LABEL_MAP[issueKey] || issueKey,
        appearCount,
        share,
        maleCount,
        femaleCount,
        severeCount,
        severeShare,
        levelCounts,
      };
    });
    return rows
      .filter((item) => item.appearCount > 0)
      .sort((a, b) => b.appearCount - a.appearCount);
  }, [insights.records, issueDefinitions]);

  const genderTotals = useMemo(() => {
    let male = 0;
    let female = 0;
    for (const record of insights.records ?? []) {
      const gender = getGender(record.sex);
      if (gender === "male") male += 1;
      if (gender === "female") female += 1;
    }
    return {
      all: insights.records?.length ?? 0,
      male,
      female,
    };
  }, [insights.records]);

  const issueRowsByGender = useMemo(() => {
    const denominator =
      selectedGenderFilter === "all"
        ? genderTotals.all
        : selectedGenderFilter === "male"
          ? genderTotals.male
          : genderTotals.female;

    return issueOccurrenceSummary
      .map((item) => {
        const selectedCount =
          selectedGenderFilter === "all"
            ? item.appearCount
            : selectedGenderFilter === "male"
              ? item.maleCount
              : item.femaleCount;
        const selectedShare =
          denominator > 0 ? (selectedCount / denominator) * 100 : 0;
        return {
          ...item,
          selectedCount,
          selectedShare,
        };
      })
      .filter((item) => item.selectedCount > 0)
      .sort((a, b) => b.selectedCount - a.selectedCount);
  }, [issueOccurrenceSummary, selectedGenderFilter, genderTotals]);

  return (
    <TabsContent value="conditions" className="space-y-6 pt-5">

      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm uppercase text-orange-500">
            So sánh tần suất xuất hiện theo vấn đề
          </CardTitle>
          <p className="text-xs text-gray-500">
            Chọn giới tính để xem số lần xuất hiện và tỉ lệ theo từng nhóm khách hàng.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSelectedGenderFilter("all")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${selectedGenderFilter === "all"
                ? "bg-orange-500 text-white"
                : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setSelectedGenderFilter("male")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${selectedGenderFilter === "male"
                ? "bg-orange-500 text-white"
                : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                }`}
            >
              Nam
            </button>
            <button
              type="button"
              onClick={() => setSelectedGenderFilter("female")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${selectedGenderFilter === "female"
                ? "bg-orange-500 text-white"
                : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                }`}
            >
              Nữ
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-gray-500">
                  <th className="py-2 pr-4">Hạng</th>
                  <th className="py-2 pr-4">Nhóm vấn đề</th>
                  <th className="py-2 pr-4">Số lần xuất hiện</th>
                  <th className="py-2 pr-4">Tỉ lệ</th>
                </tr>
              </thead>
              <tbody>
                {issueRowsByGender.map((item, index) => (
                  <tr key={`summary-${item.key}`} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-semibold text-gray-900">#{index + 1}</td>
                    <td className="py-2 pr-4 font-medium text-gray-900">{item.title}</td>
                    <td className="py-2 pr-4">
                      {item.selectedCount.toLocaleString("vi-VN")}
                    </td>
                    <td className="py-2 pr-4">{formatPercent(item.selectedShare)}</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
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

