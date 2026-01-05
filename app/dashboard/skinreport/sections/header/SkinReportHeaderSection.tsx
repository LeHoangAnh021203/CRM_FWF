"use client";

interface SkinReportHeaderSectionProps {
  generatedAt: string;
}

export function SkinReportHeaderSection({
  generatedAt,
}: SkinReportHeaderSectionProps) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold text-gray-900">
        Báo cáo phân tích da
      </h1>
      <p className="text-sm text-gray-500">
        Cập nhật{" "}
        {new Date(generatedAt).toLocaleString("vi-VN", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </p>
    </div>
  );
}
