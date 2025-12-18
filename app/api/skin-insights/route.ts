import { NextResponse } from "next/server";
import { computeSkinInsights } from "@/app/lib/skin-insights";

export const dynamic = "force-dynamic";

export async function GET() {
  const insights = computeSkinInsights();
  return NextResponse.json(insights);
}
