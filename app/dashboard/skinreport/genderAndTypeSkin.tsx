import React, { useMemo } from "react";
import { TabsContent } from "@/app/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { SkinInsights } from "@/app/lib/skin-insights";

interface GenderAndTypeSkinProps {
  insights: SkinInsights;
}

const percentWithCount = (percent: number, total: number) => {
  const normalized = Number(percent.toFixed(2));
  const decimals = Number.isInteger(normalized)
    ? 0
    : Number.isInteger(normalized * 10)
    ? 1
    : 2;
  const formatted = normalized.toFixed(decimals);
  const count = Math.round((normalized / 100) * total);
  return {
    percent: formatted,
    count,
  };
};

const AGE_BUCKETS = [
  { label: "≤20", min: 0, max: 20 },
  { label: "21-30", min: 21, max: 30 },
  { label: "31-40", min: 31, max: 40 },
  { label: "41-50", min: 41, max: 50 },
  { label: ">50", min: 51, max: Infinity },
];

export function GenderAndTypeSkin({ insights }: GenderAndTypeSkinProps) {
  const genderStats = useMemo(() => {
    const male = insights.sexDistribution.find((item) => item.label === "1");
    const female = insights.sexDistribution.find((item) => item.label === "2");
    const maleInfo = male
      ? percentWithCount(male.percent, insights.totalRecords)
      : { percent: "0", count: 0 };
    const femaleInfo = female
      ? percentWithCount(female.percent, insights.totalRecords)
      : { percent: "0", count: 0 };
    const unknownCount = Math.max(
      0,
      insights.totalRecords - maleInfo.count - femaleInfo.count
    );
    const unknownPercent = Math.max(
      0,
      100 - Number(maleInfo.percent) - Number(femaleInfo.percent)
    )
      .toFixed(1)
      .replace(".0", "");
    return {
      male: maleInfo,
      female: femaleInfo,
      unknown: { percent: unknownPercent, count: unknownCount },
    };
  }, [insights.sexDistribution, insights.totalRecords]);

  const ageBuckets = useMemo(() => {
    if (!insights.records || insights.records.length === 0) {
      return AGE_BUCKETS.map((bucket) => ({ ...bucket, count: 0 }));
    }
    const counts = AGE_BUCKETS.map((bucket) => ({ ...bucket, count: 0 }));
    insights.records.forEach((record) => {
      if (record.age === null || record.age === undefined) return;
      const found = counts.find(
        (bucket) => record.age! >= bucket.min && record.age! <= bucket.max
      );
      if (found) found.count += 1;
    });
    return counts;
  }, [insights.records]);

  const maxAgeBucket = Math.max(1, ...ageBuckets.map((bucket) => bucket.count));
  const skinTypeColumns = insights.skinTypes.slice(0, 5);

  return (
    <TabsContent value="profile" className="space-y-6 pt-5">
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-orange-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-[0.2em] text-orange-500">
              Phân bố giới tính
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.sexDistribution.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có dữ liệu.</p>
            ) : (
              insights.sexDistribution.map((item) => {
                const display =
                  item.label === "2"
                    ? "Nữ"
                    : item.label === "1"
                    ? "Nam"
                    : item.label;
                const { percent, count } = percentWithCount(
                  item.percent,
                  insights.totalRecords
                );
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{display}</span>
                      <span>
                        {percent}% ·{" "}
                        <span className="font-semibold text-gray-900">
                          {count.toLocaleString("vi-VN")}
                        </span>
                      </span>
                    </div>
                    <Progress value={Number(percent)} className="h-2" />
                  </div>
                );
              })
            )}
            {insights.sexDistribution.length > 0 && (
              <GenderDonut
                malePercent={Number(genderStats.male.percent)}
                femalePercent={Number(genderStats.female.percent)}
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-orange-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-[0.2em] text-orange-500">
              Độ tuổi
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3 text-center">
            <AgeCard label="Nhỏ nhất" value={insights.age.min} />
            <AgeCard label="Trung vị" value={insights.age.median} />
            <AgeCard label="Lớn nhất" value={insights.age.max} />
          </CardContent>
        </Card>
      </section>

      <Card className="border-orange-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-[0.2em] text-orange-500">
            Phân bố loại da
          </CardTitle>
          <p className="text-xs text-gray-500">
            Ưu tiên oil/mid_oil đang chiếm đa số hồ sơ
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.skinTypes.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có dữ liệu.</p>
          ) : (
            <>
              <div className="flex items-end gap-3">
                {skinTypeColumns.map((type) => (
                  <div
                    key={`${type.label}-viz`}
                    className="flex flex-1 flex-col items-center"
                  >
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-orange-600 via-orange-400 to-orange-200"
                      style={{ height: `${Math.max(type.percent, 6)}%` }}
                    ></div>
                    <p className="mt-2 text-[10px] uppercase text-gray-500">
                      {type.label}
                    </p>
                  </div>
                ))}
              </div>
              {insights.skinTypes.map((type) => {
                const { percent, count } = percentWithCount(
                  type.percent,
                  insights.totalRecords
                );
                return (
                  <div key={type.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="font-medium capitalize text-gray-900">
                        {type.label}
                      </div>
                      <div>
                        {percent}% ·{" "}
                        <span className="font-semibold text-gray-900">
                          {count.toLocaleString("vi-VN")} /{" "}
                          {insights.totalRecords.toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </div>
                    <Progress value={Number(percent)} className="h-1.5" />
                  </div>
                );
              })}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-orange-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-[0.2em] text-orange-500">
            Nhóm tuổi khách hàng
          </CardTitle>
          <p className="text-xs text-gray-500">
            Gợi ý ưu tiên cho nhóm 21-40 tuổi (phổ biến nhất)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {ageBuckets.every((bucket) => bucket.count === 0) ? (
            <p className="text-sm text-gray-500">
              Không có dữ liệu tuổi để hiển thị.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-end gap-3">
                {ageBuckets.map((bucket) => (
                  <div key={bucket.label} className="flex-1">
                    <div className="flex h-32 items-end">
                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-orange-200 via-orange-300 to-orange-500"
                        style={{
                          height: `${
                            (bucket.count / maxAgeBucket) * 100 || 4
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-xs font-semibold text-gray-900">
                        {bucket.count.toLocaleString("vi-VN")}
                      </p>
                      <p className="text-[10px] uppercase text-gray-500">
                        {bucket.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <AgeSparkline buckets={ageBuckets} maxCount={maxAgeBucket} />
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}

function AgeCard({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-2xl border border-orange-50 bg-orange-50/40 p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
        {label}
      </p>
      <p className="text-lg font-semibold text-gray-900">{value ?? "—"}</p>
    </div>
  );
}

function GenderDonut({
  malePercent,
  femalePercent,
}: {
  malePercent: number;
  femalePercent: number;
}) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const femaleLength = (femalePercent / 100) * circumference;
  const maleLength = (malePercent / 100) * circumference;
  return (
    <div className="flex items-center justify-center">
      <svg viewBox="0 0 120 120" className="h-32 w-32">
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#ffe4e6"
          strokeWidth={10}
          fill="none"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#fb923c"
          strokeWidth={10}
          fill="none"
          strokeDasharray={`${femaleLength} ${circumference}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#f97316"
          strokeWidth={10}
          fill="none"
          strokeDasharray={`${maleLength} ${circumference}`}
          strokeDashoffset={circumference * 0.25 + femaleLength}
          strokeLinecap="round"
        />
        <text
          x="60"
          y="60"
          textAnchor="middle"
          className="text-[10px] font-semibold fill-gray-600"
          dy="4"
        >
          Nam / Nữ
        </text>
      </svg>
    </div>
  );
}

function AgeSparkline({
  buckets,
  maxCount,
}: {
  buckets: Array<{ label: string; count: number }>;
  maxCount: number;
}) {
  const width = 220;
  const height = 70;
  const points = buckets
    .map((bucket, index) => {
      const x = (index / (buckets.length - 1 || 1)) * width;
      const y = height - (bucket.count / (maxCount || 1)) * height;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-20 w-full max-w-[260px]"
        role="img"
        aria-label="Xu hướng nhóm tuổi"
      >
        <defs>
          <linearGradient id="ageSparkline" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fdba74" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke="url(#ageSparkline)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {buckets.map((bucket, index) => {
          const x = (index / (buckets.length - 1 || 1)) * width;
          const y = height - (bucket.count / (maxCount || 1)) * height;
          return (
            <circle key={bucket.label} cx={x} cy={y} r="3" fill="#f97316" />
          );
        })}
      </svg>
    </div>
  );
}
