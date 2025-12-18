import fs from "node:fs";
import path from "node:path";

export interface RemoteRecord {
  customer_sex?: number | string;
  customer_age?: number;
  analysis?: {
    skin_type?: { type?: string };
    acne?: { level?: number | string };
    pore?: { level?: number | string };
    spot?: { level?: number | string };
    wrinkle?: { level?: number | string };
    dark_circle?: { type?: string };
    sensitive?: { type?: string };
    final_result?: { goods?: string };
  };
}

export interface DistributionEntry {
  label: string;
  count: number;
  percent: number;
}

export interface AgeStats {
  count: number;
  average: number;
  median: number | null;
  min: number | null;
  max: number | null;
}

export interface SkinInsights {
  totalRecords: number;
  generatedAt: string;
  age: AgeStats;
  sexDistribution: DistributionEntry[];
  skinTypes: DistributionEntry[];
  severity: Record<string, DistributionEntry[]>;
  darkCircleTypes: DistributionEntry[];
  sensitivity: DistributionEntry[];
  topGoods: DistributionEntry[];
  keyInsights: string[];
}

const DATA_FILES = [
  "api_response (1).json",
  "api_response_1.json",
  "api_response_3.json",
  "api_response_4.json",
  "api_response_5.json",
];

const dataDir = path.join(process.cwd(), "data");

const percent = (value: number, total: number) =>
  total === 0 ? 0 : Number(((value / total) * 100).toFixed(1));

const asDistribution = (
  map: Record<string, number>,
  total: number
): DistributionEntry[] =>
  Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      label,
      count,
      percent: percent(count, total),
    }));

const collectCounts = (
  map: Record<string, number>,
  raw: string | number | undefined | null
) => {
  if (raw === undefined || raw === null) return;
  const label = String(raw);
  map[label] = (map[label] || 0) + 1;
};

export const readSkinRecords = (): RemoteRecord[] => {
  const merged: RemoteRecord[] = [];
  DATA_FILES.forEach((file) => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`[skin-insights] File not found: ${filePath}`);
      return;
    }

    try {
      const parsed = JSON.parse(
        fs.readFileSync(filePath, "utf8")
      ) as { data?: { list?: RemoteRecord[] } };
      if (Array.isArray(parsed.data?.list)) {
        merged.push(...parsed.data.list);
      }
    } catch (error) {
      console.error(`[skin-insights] Failed to parse ${file}`, error);
    }
  });

  return merged;
};

export const computeSkinInsights = (
  records: RemoteRecord[] = readSkinRecords()
): SkinInsights => {
  const total = records.length;
  const sexCounts: Record<string, number> = {};
  const skinTypes: Record<string, number> = {};
  const severityFields = ["acne", "pore", "spot", "wrinkle"] as const;
  const severity: Record<string, Record<string, number>> = {};
  const goodsMap: Record<string, number> = {};
  const darkCircles: Record<string, number> = {};
  const sensitivity: Record<string, number> = {};
  const ages: number[] = [];

  severityFields.forEach((field) => {
    severity[field] = {};
  });

  records.forEach((record) => {
    collectCounts(sexCounts, record.customer_sex);

    if (typeof record.customer_age === "number") {
      ages.push(record.customer_age);
    }

    collectCounts(skinTypes, record.analysis?.skin_type?.type ?? "unknown");

    severityFields.forEach((field) => {
      const level = record.analysis?.[field]?.level;
      if (level !== undefined && level !== null) {
        collectCounts(severity[field], level);
      }
    });

    collectCounts(darkCircles, record.analysis?.dark_circle?.type ?? "UNKNOWN");
    collectCounts(sensitivity, record.analysis?.sensitive?.type ?? "UNKNOWN");

    const goods = record.analysis?.final_result?.goods;
    if (goods) {
      goods.split(",").forEach((code) => {
        const trimmed = code.trim();
        if (trimmed) {
          goodsMap[trimmed] = (goodsMap[trimmed] || 0) + 1;
        }
      });
    }
  });

  ages.sort((a, b) => a - b);
  const ageStats: AgeStats = {
    count: ages.length,
    average: ages.length
      ? Number((ages.reduce((sum, age) => sum + age, 0) / ages.length).toFixed(1))
      : 0,
    median: ages.length ? ages[Math.floor(ages.length / 2)] : null,
    min: ages[0] ?? null,
    max: ages[ages.length - 1] ?? null,
  };

  const severityDistribution = Object.fromEntries(
    severityFields.map((field) => [
      field,
      asDistribution(severity[field], total),
    ])
  );

  const topGoods = asDistribution(goodsMap, total).slice(0, 10);
  const dominantSkinType = asDistribution(skinTypes, total)[0];
  const acneLvl4 = severity.acne?.["4"] ?? 0;
  const acneLvl5 = severity.acne?.["5"] ?? 0;
  const poreLvl4 = severity.pore?.["4"] ?? 0;
  const poreLvl5 = severity.pore?.["5"] ?? 0;

  const keyInsights = [
    dominantSkinType
      ? `Nhóm da chủ đạo: ${dominantSkinType.label} (${dominantSkinType.percent}%).`
      : "Chưa xác định nhóm da chủ đạo.",
    `Tuổi trung bình ${ageStats.average} (min ${ageStats.min ?? "—"} / max ${
      ageStats.max ?? "—"
    }).`,
    `Tỷ lệ mụn nặng (độ 4-5): ${percent(acneLvl4 + acneLvl5, total)}%.`,
    `Tỷ lệ lỗ chân lông to (độ 4-5): ${percent(
      poreLvl4 + poreLvl5,
      total
    )}%.`,
    `Mã sản phẩm nổi bật: ${topGoods
      .slice(0, 3)
      .map((item) => item.label)
      .join(", ")}.`,
  ];

  return {
    totalRecords: total,
    generatedAt: new Date().toISOString(),
    age: ageStats,
    sexDistribution: asDistribution(sexCounts, total),
    skinTypes: asDistribution(skinTypes, total),
    severity: severityDistribution,
    darkCircleTypes: asDistribution(darkCircles, total),
    sensitivity: asDistribution(sensitivity, total),
    topGoods,
    keyInsights,
  };
};
