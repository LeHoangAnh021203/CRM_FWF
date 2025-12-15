"use client";

import { useQuery } from "@tanstack/react-query";
import { TokenService } from "@/app/lib/token-service";
import type { DashboardSummarySections } from "@/app/dashboard/dashboard-types";

type DashboardSummaryApiResponse = {
  data: DashboardSummarySections;
  errors: Record<string, string>;
};

interface UseDashboardSummaryParams {
  dateStart: string | null | undefined;
  dateEnd: string | null | undefined;
  stockId?: string;
  enabled?: boolean;
}

const fetchDashboardSummary = async ({
  dateStart,
  dateEnd,
  stockId = "",
}: {
  dateStart: string;
  dateEnd: string;
  stockId: string;
}): Promise<DashboardSummaryApiResponse> => {
  const token = await TokenService.getValidAccessToken();
  if (!token) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth-expired"));
    }
    throw new Error("Authentication failed - please login again");
  }

  const params = new URLSearchParams();
  params.set("dateStart", dateStart);
  params.set("dateEnd", dateEnd);
  params.set("stockId", stockId);

  const response = await fetch(`/api/dashboard/summary?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(
      message || `Dashboard summary request failed (${response.status})`
    );
  }

  return response.json();
};

export function useDashboardSummary({
  dateStart,
  dateEnd,
  stockId = "",
  enabled = true,
}: UseDashboardSummaryParams) {
  return useQuery<DashboardSummaryApiResponse>({
    queryKey: ["dashboard-summary", dateStart, dateEnd, stockId],
    queryFn: () =>
      fetchDashboardSummary({
        dateStart: dateStart as string,
        dateEnd: dateEnd as string,
        stockId,
      }),
    enabled: Boolean(enabled && dateStart && dateEnd),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
}
