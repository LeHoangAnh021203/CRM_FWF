"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
  SkinInsights,
  DistributionEntry,
  IssueTrend,
  SkinRecordSummary,
} from "@/app/lib/skin-insights";
import { Activity, Droplets, Leaf, Users } from "lucide-react";
import { OverviewSkin } from "./overviewSkin";
import { DialogListCustomer } from "./dialogListCustomer";
import { DialogDetailCustomer } from "./dialogDetailCustomer";
import { GenderAndTypeSkin } from "./genderAndTypeSkin";
import { SpecialSkin } from "./specialSkin";
import { KpiSkin } from "./kpiSkin";

interface SkinReportClientProps {
  insights: SkinInsights;
}

const sumPercent = (items: DistributionEntry[] = [], labels: string[]) =>
  Number(
    items
      .filter((item) => labels.includes(item.label))
      .reduce((total, item) => total + item.percent, 0)
      .toFixed(1)
  );

const formatPercent = (value?: number) =>
  `${(value ?? 0).toFixed(1)}%`.replace(".0", "");

const formatSex = (value?: number | string) => {
  const normalized = value !== undefined && value !== null ? String(value) : "";
  if (normalized === "2") return "female";
  if (normalized === "1") return "male";
  return "unknown";
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const moduleDisplay = [
  { key: "skin_type", label: "Sebum" },
  { key: "ext_water", label: "Hydration" },
  { key: "pore", label: "Pores" },
  { key: "spot", label: "Spots" },
  { key: "wrinkle", label: "Wrinkles" },
  { key: "acne", label: "Acne" },
  { key: "blackhead", label: "Blackheads" },
  { key: "dark_circle", label: "Dark circles" },
  { key: "collagen", label: "Collagen" },
  { key: "pockmark", label: "Pockmark" },
  { key: "uv_spot", label: "UV spot" },
] as const;

export type ModuleData = {
  level?: number | string;
  score?: number | string;
  goods?: string;
  type?: string;
  [key: string]: unknown;
};

export type ModuleDetailEntry = {
  key: string;
  label: string;
  data?: ModuleData;
};

const getTrend = (
  trends: Partial<Record<string, IssueTrend>>,
  key: string
): IssueTrend => {
  return (
    trends[key] ?? {
      highShare: 0,
      mediumShare: 0,
      lowShare: 0,
      averageScore: null,
    }
  );
};

export function SkinReportClient({ insights }: SkinReportClientProps) {
  const PAGE_SIZE = 30;
  const [activeTab, setActiveTab] = useState("overview");
  const [recordsOpen, setRecordsOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<SkinRecordSummary | null>(null);
  const [recordPage, setRecordPage] = useState(1);
  const severeAcne = sumPercent(insights.severity.acne ?? [], ["4", "5"]);
  const severePore = sumPercent(insights.severity.pore ?? [], ["4", "5"]);
  const dominantSkinType = insights.skinTypes[0];

  const extWaterTrend = getTrend(insights.issueTrends, "ext_water");
  const collagenTrend = getTrend(insights.issueTrends, "collagen");
  const poreTrend = getTrend(insights.issueTrends, "pore");
  const wrinkleTrend = getTrend(insights.issueTrends, "wrinkle");
  const pockmarkTrend = getTrend(insights.issueTrends, "pockmark");

  const summaryCards = [
    {
      title: "Tổng hồ sơ",
      value: insights.totalRecords.toLocaleString("vi-VN"),
      description: "Dataset hợp nhất từ 6 file JSON",
      icon: Users,
      tab: "overview",
      action: "records" as const,
    },
    {
      title: "Chênh lệch tuổi AI",
      value: `${insights.dataQuality.averageAgeGap} năm`,
      description: `${formatPercent(
        insights.dataQuality.mismatchShare
      )} lệch ≥ 5 năm`,
      icon: Activity,
      tab: "overview",
    },
    {
      title: "Da chủ đạo",
      value: dominantSkinType ? dominantSkinType.label : "Đang cập nhật",
      description: dominantSkinType ? `${dominantSkinType.percent}% hồ sơ` : "",
      icon: Leaf,
      tab: "profile",
    },
    {
      title: "Thiếu ẩm độ 4-5",
      value: formatPercent(extWaterTrend.highShare),
      description: "Hồ sơ thiếu ẩm bề mặt nặng",
      icon: Droplets,
      tab: "conditions",
    },
  ];

  const tabs = [
    {
      value: "overview",
      label: "Tổng quan hồ sơ",
      description: "Snapshot & chất lượng dữ liệu",
    },
    {
      value: "profile",
      label: "Nhân khẩu & loại da",
      description: "Tuổi, giới tính & phân loại da",
    },
    {
      value: "conditions",
      label: "Nhóm vấn đề da",
      description: "Tính nghiêm trọng & ưu tiên điều trị",
    },
    {
      value: "recommendations",
      label: "Đề xuất & KPI",
      description: "Sản phẩm nổi bật & mục tiêu",
    },
  ];

  const issueDefinitions = [
    {
      key: "ext_water",
      title: "Thiếu ẩm bề mặt",
      description: "Thiếu ẩm làm lỗ chân lông & nếp nhăn lộ rõ.",
      action: "Ưu tiên routine cấp ẩm sâu + khóa ẩm.",
      trend: extWaterTrend,
    },
    {
      key: "collagen",
      title: "Collagen suy giảm",
      description:
        "Điểm collagen thấp tạo cảm giác lão hoá nền và da thiếu đàn hồi.",
      action: "Nhấn mạnh liệu trình trẻ hóa & chống nắng nghiêm ngặt.",
      trend: collagenTrend,
    },
    {
      key: "pore",
      title: "Lỗ chân lông to",
      description: "Kết hợp dầu vùng T-zone + thiếu ẩm khiến pore mở rộng rõ.",
      action: "Kiểm soát dầu vùng T-zone song song dưỡng ẩm.",
      trend: poreTrend,
    },
    {
      key: "wrinkle",
      title: "Nếp nhăn vùng mắt/rãnh má",
      description: "Nếp nhăn level 3-4 tập trung tại đuôi mắt và rãnh mũi má.",
      action: "Ưu tiên sản phẩm chống lão hoá & chăm sóc vùng mắt.",
      trend: wrinkleTrend,
    },
    {
      key: "pockmark",
      title: "Rỗ / texture không đều",
      description: "Đòi hỏi liệu trình dài hơi sau khi ổn định dầu & ẩm.",
      action: "Thiết kế lộ trình 2 pha: ổn định nền → xử lý rỗ.",
      trend: pockmarkTrend,
    },
  ];

  const multiUseGoods = insights.multiUseGoods.filter(
    (item) => item.modules.length > 1
  );

  const topMultiUseGoods = multiUseGoods.slice(0, 8);
  const sortedRecords = useMemo(
    () =>
      [...(insights.records ?? [])].sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }),
    [insights.records]
  );
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / PAGE_SIZE));
  const paginatedRecords = useMemo(() => {
    const start = (recordPage - 1) * PAGE_SIZE;
    return sortedRecords.slice(start, start + PAGE_SIZE);
  }, [sortedRecords, recordPage]);
  const moduleDetails = useMemo<ModuleDetailEntry[]>(() => {
    if (!selectedRecord?.analysis) return [];
    const analysis = selectedRecord.analysis as Record<string, ModuleData>;
    return moduleDisplay
      .map((config) => ({
        ...config,
        data: analysis[config.key],
      }))
      .filter((entry) => entry.data);
  }, [selectedRecord]);

  useEffect(() => {
    setRecordPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const kpiPlan = [
    {
      title: "Hydration score",
      target: "+15 điểm / 4 tuần",
      evidence: `Thiếu ẩm độ 4-5: ${formatPercent(
        extWaterTrend.highShare
      )} hồ sơ`,
    },
    {
      title: "Pore score",
      target: "+10 điểm / 6 tuần",
      evidence: `Pore độ 4-5: ${formatPercent(poreTrend.highShare)} hồ sơ`,
    },
    {
      title: "Collagen score",
      target: "+10 điểm / 8 tuần",
      evidence: `Collagen độ 4-5: ${formatPercent(
        collagenTrend.highShare
      )} hồ sơ`,
    },
    {
      title: "Wrinkle score",
      target: "+8 điểm / 8 tuần",
      evidence: `Nhóm nếp nhăn độ 3-5: ${formatPercent(
        (wrinkleTrend.highShare ?? 0) + (wrinkleTrend.mediumShare ?? 0)
      )} hồ sơ`,
    },
  ];

  const handleCardClick = (tab?: string) => {
    if (tab) setActiveTab(tab);
  };

  const handleShowRecords = () => {
    setRecordPage(1);
    setRecordsOpen(true);
  };

  const handleViewRecord = (record: SkinRecordSummary) => {
    setSelectedRecord(record);
    setDetailOpen(true);
  };

  const handleDetailOpenChange = (open: boolean) => {
    setDetailOpen(open);
    if (!open) setSelectedRecord(null);
  };

  return (
    <div className="p-3 sm:p-6">
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

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-transparent">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex flex-col items-center justify-center rounded-lg border border-white/30 bg-white/10 px-4 py-3 text-left text-black data-[state=active]:bg-white data-[state=active]:text-[#f66035] data-[state=active]:shadow-sm"
            >
              <span className="text-sm font-semibold">{tab.label}</span>
              <span className="text-xs text-gray-400">{tab.description}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <OverviewSkin
          summaryCards={summaryCards}
          insights={insights}
          severeAcne={severeAcne}
          severePore={severePore}
          onCardClick={handleCardClick}
          onShowRecords={handleShowRecords}
        />

        <GenderAndTypeSkin insights={insights} />

        <SpecialSkin
          insights={insights}
          issueDefinitions={issueDefinitions}
          formatPercent={formatPercent}
        />

        <KpiSkin
          insights={insights}
          topMultiUseGoods={topMultiUseGoods}
          formatPercent={formatPercent}
          kpiPlan={kpiPlan}
        />
      </Tabs>

      <DialogListCustomer
        isOpen={recordsOpen}
        onOpenChange={setRecordsOpen}
        insights={insights}
        records={sortedRecords}
        paginatedRecords={paginatedRecords}
        page={recordPage}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        formatSex={formatSex}
        formatDateTime={formatDateTime}
        onViewRecord={handleViewRecord}
        onPageChange={setRecordPage}
      />

      <DialogDetailCustomer
        open={detailOpen}
        onOpenChange={handleDetailOpenChange}
        record={selectedRecord}
        moduleDetails={moduleDetails}
        formatSex={formatSex}
        formatDateTime={formatDateTime}
      />
    </div>
  );
}
