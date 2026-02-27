"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Droplets, Leaf, Users } from "lucide-react";
import type { SkinInsights, SkinRecordSummary } from "@/app/lib/skin-insights";
import { moduleDisplay, skinReportTabs } from "../config";
import {
  buildPaginatedRecords,
  buildSortedRecords,
  formatDateTime,
  formatPercent,
  formatSex,
  getTrend,
  sumPercent,
} from "../transformers";
import type { ModuleData, ModuleDetailEntry, SkinReportTab } from "../types";

const PAGE_SIZE = 30;

export function useSkinReportState(insights: SkinInsights) {
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

  const summaryCards = useMemo(
    () => [
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
        description: dominantSkinType
          ? `${dominantSkinType.percent}% hồ sơ`
          : "",
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
    ],
    [
      dominantSkinType,
      extWaterTrend.highShare,
      insights.dataQuality.averageAgeGap,
      insights.dataQuality.mismatchShare,
      insights.totalRecords,
    ]
  );

  const tabs: SkinReportTab[] = skinReportTabs;

  const issueDefinitions = useMemo(
    () => [
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
    ],
    [collagenTrend, extWaterTrend, pockmarkTrend, poreTrend, wrinkleTrend]
  );

  const topMultiUseGoods = useMemo(
    () => insights.multiUseGoods.filter((item) => item.modules.length > 1).slice(0, 8),
    [insights.multiUseGoods]
  );

  const sortedRecords = useMemo(
    () => buildSortedRecords(insights.records ?? []),
    [insights.records]
  );
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / PAGE_SIZE));
  const paginatedRecords = useMemo(
    () => buildPaginatedRecords(sortedRecords, recordPage, PAGE_SIZE),
    [sortedRecords, recordPage]
  );

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

  const kpiPlan = useMemo(
    () => [
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
    ],
    [
      collagenTrend.highShare,
      extWaterTrend.highShare,
      poreTrend.highShare,
      wrinkleTrend.highShare,
      wrinkleTrend.mediumShare,
    ]
  );

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

  return {
    activeTab,
    setActiveTab,
    recordsOpen,
    setRecordsOpen,
    detailOpen,
    selectedRecord,
    recordPage,
    setRecordPage,
    pageSize: PAGE_SIZE,
    summaryCards,
    tabs,
    issueDefinitions,
    kpiPlan,
    severeAcne,
    severePore,
    topMultiUseGoods,
    sortedRecords,
    totalPages,
    paginatedRecords,
    moduleDetails,
    formatPercent,
    formatSex,
    formatDateTime,
    handleCardClick,
    handleShowRecords,
    handleViewRecord,
    handleDetailOpenChange,
  };
}
