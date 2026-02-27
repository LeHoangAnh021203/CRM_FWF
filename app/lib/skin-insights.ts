import { pickRecordTime } from "@/app/lib/skin-insights-client";

interface LevelModule {
  level?: number | string;
  score?: number | string;
  goods?: string;
}

export interface RemoteRecord {
  id?: number;
  result_id?: string;
  code?: string;
  status?: number | string;
  crt_time?: string;
  image?: string;
  user_acct?: string;
  customer_nickname?: string;
  customer_sex?: number | string;
  customer_age?: number | string;
  customer_mobile?: string;
  analysis?: {
    age?: { result?: number };
    skin_type?: LevelModule & { type?: string };
    acne?: LevelModule;
    pore?: LevelModule;
    spot?: LevelModule;
    wrinkle?: LevelModule;
    dark_circle?: { type?: string };
    sensitive?: { type?: string };
    final_result?: { goods?: string; age?: number };
    ext_water?: LevelModule;
    collagen?: LevelModule;
    pockmark?: LevelModule;
    uv_spot?: LevelModule;
    pigment?: LevelModule;
    blackhead?: LevelModule;
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

export interface ConsistencyStats {
  totalWithReportedAge: number;
  totalWithPredictedAge: number;
  averageAgeGap: number;
  mismatchCount: number;
  mismatchShare: number;
  withPhoneCount: number;
  missingPhoneCount: number;
}

export interface IssueTrend {
  highShare: number;
  mediumShare: number;
  lowShare: number;
  averageScore: number | null;
}

export interface GoodsInsight {
  label: string;
  count: number;
  percent: number;
  modules: string[];
}

export interface SkinRecordSummary {
  id?: number;
  code?: string;
  resultId?: string;
  status?: number | string;
  createdAt?: string;
  nickname?: string;
  account?: string;
  phone?: string;
  sex?: number | string;
  age?: number | null;
  aiAge?: number | null;
  image?: string;
  analysis?: RemoteRecord["analysis"];
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
  dataQuality: ConsistencyStats;
  issueTrends: Partial<Record<string, IssueTrend>>;
  multiUseGoods: GoodsInsight[];
  records: SkinRecordSummary[];
  spotlightRecord?: SpotlightRecord | null;
}

export interface SpotlightRecord {
  id?: number;
  code?: string;
  resultId?: string;
  status?: number | string;
  createdAt?: string;
  nickname?: string;
  userAccount?: string;
  customerPhone?: string;
  sex?: number | string;
  age?: number | null;
  aiAge?: number | null;
  ageGap?: number | null;
  goods?: string[];
  image?: string;
}


const percent = (value: number, total: number) =>
  total === 0 ? 0 : Number(((value / total) * 100).toFixed(1));

const toNumber = (value: unknown): number | null => {
  if (value === undefined || value === null) return null;
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return null;
};

const ISSUE_MODULES = [
  "ext_water",
  "collagen",
  "wrinkle",
  "pore",
  "pockmark",
  "skin_type",
  "acne",
  "blackhead",
  "spot",
  "uv_spot",
  "dark_circle",
] as const;

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

export const computeSkinInsights = (
  records: RemoteRecord[] = []
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
  const moduleStats: Record<
    string,
    { levels: Record<string, number>; scoreSum: number; scoreCount: number }
  > = {};
  const goodsCrossMap: Record<
    string,
    { count: number; modules: Set<string> }
  > = {};
  let reportedAgeCount = 0;
  let predictedAgeCount = 0;
  let ageGapSum = 0;
  let ageGapSamples = 0;
  let mismatchCount = 0;
  let withPhoneCount = 0;
  let spotlightRecord: RemoteRecord | null = null;
  let spotlightGap = -1;

  severityFields.forEach((field) => {
    severity[field] = {};
  });

  const registerGoods = (source: string, goods?: string) => {
    if (!goods) return;
    goods.split(",").forEach((code) => {
      const trimmed = code.trim();
      if (!trimmed) return;

      if (source === "final_result") {
        goodsMap[trimmed] = (goodsMap[trimmed] || 0) + 1;
      }

      if (!goodsCrossMap[trimmed]) {
        goodsCrossMap[trimmed] = { count: 0, modules: new Set<string>() };
      }
      goodsCrossMap[trimmed].count += 1;
      goodsCrossMap[trimmed].modules.add(source);
    });
  };

  const registerIssueModule = (key: string, module?: LevelModule) => {
    if (!module) return;
    if (!moduleStats[key]) {
      moduleStats[key] = { levels: {}, scoreSum: 0, scoreCount: 0 };
    }
    if (module.level !== undefined && module.level !== null) {
      const label = String(module.level);
      moduleStats[key].levels[label] =
        (moduleStats[key].levels[label] || 0) + 1;
    }
    const scoreValue = toNumber(module.score);
    if (scoreValue !== null) {
      moduleStats[key].scoreSum += scoreValue;
      moduleStats[key].scoreCount += 1;
    }
    registerGoods(key, module.goods);
  };

  records.forEach((record) => {
    collectCounts(sexCounts, record.customer_sex);

    const customerAge =
      typeof record.customer_age === "number" ? record.customer_age : null;
    if (customerAge !== null) {
      reportedAgeCount += 1;
      ages.push(customerAge);
    }

    const predictedAge =
      toNumber(record.analysis?.final_result?.age) ??
      toNumber(record.analysis?.age?.result);
    if (customerAge !== null && predictedAge !== null) {
      predictedAgeCount += 1;
      const gap = Math.abs(customerAge - predictedAge);
      ageGapSum += gap;
      ageGapSamples += 1;
      if (gap >= 5) mismatchCount += 1;
      if (gap > spotlightGap) {
        spotlightRecord = record;
        spotlightGap = gap;
      }
    } else if (predictedAge !== null) {
      predictedAgeCount += 1;
      if (spotlightRecord === null) {
        spotlightRecord = record;
        spotlightGap = 0;
      }
    } else if (spotlightRecord === null) {
      spotlightRecord = record;
      spotlightGap = 0;
    }

    if (record.customer_mobile?.trim()) {
      withPhoneCount += 1;
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

    registerGoods("final_result", record.analysis?.final_result?.goods);
    ISSUE_MODULES.forEach((moduleKey) => {
      const moduleData =
        (record.analysis?.[
          moduleKey as keyof RemoteRecord["analysis"]
        ] as LevelModule | undefined) ?? undefined;
      registerIssueModule(moduleKey, moduleData);
    });
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

  ISSUE_MODULES.forEach((moduleKey) => {
    if (!moduleStats[moduleKey]) {
      moduleStats[moduleKey] = { levels: {}, scoreSum: 0, scoreCount: 0 };
    }
  });

  const issueTrends = Object.fromEntries(
    Object.entries(moduleStats).map(([key, stats]) => {
      const high =
        (stats.levels["4"] ?? 0) + (stats.levels["5"] ?? 0);
      const medium =
        (stats.levels["2"] ?? 0) + (stats.levels["3"] ?? 0);
      const low = stats.levels["1"] ?? 0;
      const averageScore =
        stats.scoreCount > 0
          ? Number((stats.scoreSum / stats.scoreCount).toFixed(1))
          : null;
      return [
        key,
        {
          highShare: percent(high, total),
          mediumShare: percent(medium, total),
          lowShare: percent(low, total),
          averageScore,
        },
      ];
    })
  );

  const multiUseGoods = Object.entries(goodsCrossMap)
    .map(([label, entry]) => ({
      label,
      count: entry.count,
      percent: percent(entry.count, total),
      modules: Array.from(entry.modules).sort(),
    }))
    .sort(
      (a, b) =>
        b.modules.length - a.modules.length || b.count - a.count
    )
    .slice(0, 10);

  const averageAgeGap =
    ageGapSamples > 0 ? Number((ageGapSum / ageGapSamples).toFixed(1)) : 0;

  const simplifiedRecords: SkinRecordSummary[] = records.map((record) => {
    const customerAge = toNumber(record.customer_age);
    const predictedAge =
      toNumber(record.analysis?.final_result?.age) ??
      toNumber(record.analysis?.age?.result);
    return {
      id: record.id,
      code: record.code,
      resultId: record.result_id,
      status: record.status,
      createdAt: pickRecordTime(record),
      nickname: record.customer_nickname,
      account: record.user_acct,
      phone: record.customer_mobile,
      sex: record.customer_sex,
      age: customerAge,
      aiAge: predictedAge,
      image: record.image,
      analysis: record.analysis,
    };
  });

  const dataQuality: ConsistencyStats = {
    totalWithReportedAge: reportedAgeCount,
    totalWithPredictedAge: predictedAgeCount,
    averageAgeGap,
    mismatchCount,
    mismatchShare: percent(mismatchCount, total),
    withPhoneCount,
    missingPhoneCount: total - withPhoneCount,
  };

  let spotlightDetails: SpotlightRecord | null = null;
  if (spotlightRecord) {
    const record: RemoteRecord = spotlightRecord;
    const finalResultGoods =
      record.analysis?.final_result?.goods
        ?.split(",")
        .map((code: string) => code.trim())
        .filter(Boolean) ?? [];

    const recordTime = pickRecordTime(record);
    spotlightDetails = {
      id: record.id,
      code: record.code,
      resultId: record.result_id,
      status: record.status,
      createdAt: recordTime,
      nickname: record.customer_nickname,
      userAccount: record.user_acct,
      customerPhone: record.customer_mobile,
      sex: record.customer_sex,
      age: toNumber(record.customer_age) ?? null,
      aiAge:
        toNumber(record.analysis?.final_result?.age) ??
        toNumber(record.analysis?.age?.result),
      ageGap: spotlightGap >= 0 ? Number(spotlightGap.toFixed(1)) : null,
      goods: finalResultGoods,
      image: record.image,
    };
  }

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
    dataQuality,
    issueTrends,
    multiUseGoods,
    records: simplifiedRecords,
    spotlightRecord: spotlightDetails,
  };
};
