"use client";

import dynamic from "next/dynamic";

const SkinReportApiClient = dynamic(
  () =>
    import("./skin-report-api-client").then((mod) => {
      return mod.SkinReportApiClient;
    }),
  {
    loading: () => (
      <div className="flex items-center justify-center w-full py-10 text-sm text-muted-foreground">
        Đang tải dashboard...
      </div>
    ),
    ssr: false,
  }
);

export default function SkinReportApiPage() {
  return (
    <div className="font-sans space-y-4">
      <SkinReportApiClient />
    </div>
  );
}
