import { computeSkinInsights } from "@/app/lib/skin-insights";
import { SkinReportClient } from "./skin-report-client";

export default function SkinReportPage() {
    const insights = computeSkinInsights();
    return (
        <div className="font-sans">
            <SkinReportClient insights={insights} />
        </div>
    );
}