import { computeSkinInsights } from "@/app/lib/skin-insights";
import { SkinReportClient } from "./skin-report-client";

export default function SkinReportPage() {
  const insights = computeSkinInsights();
  return <SkinReportClient insights={insights} />;
}
