import { NextRequest, NextResponse } from "next/server";
import { getApiEndpoint } from "@/app/lib/auth-config";
import { getActualStockIds } from "@/app/constants/branches";

// Some backend environments are still using certificates that are not part of the
// default trust store. Reuse the same opt‑in flag that the proxy routes use so
// the aggregator can talk to those hosts without failing every fetch.
if (process.env.ALLOW_INSECURE_SSL === "true") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

type EndpointConfig = {
  key: string;
  path: string;
  includeStock?: boolean;
};

const ENDPOINTS: EndpointConfig[] = [
  { key: "salesSummary", path: "real-time/sales-summary-copied" },
  { key: "serviceSummary", path: "real-time/service-summary" },
  { key: "topServices", path: "real-time/get-top-10-service" },
  { key: "salesByHour", path: "real-time/get-sales-by-hour" },
  { key: "bookingSummary", path: "real-time/booking" },
  { key: "bookingByHour", path: "real-time/get-booking-by-hour" },
  { key: "newCustomers", path: "real-time/get-new-customer" },
  { key: "oldCustomers", path: "real-time/get-old-customer" },
  { key: "salesDetail", path: "real-time/sales-detail" },
];

const ACTUAL_REVENUE_ENDPOINT = "real-time/get-actual-revenue";

const parseNumeric = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

async function fetchBackendJSON(
  endpoint: EndpointConfig,
  params: URLSearchParams,
  authHeader: string
) {
  const url = new URL(getApiEndpoint(endpoint.path));
  params.forEach((value, key) => {
    if (endpoint.includeStock === false && key === "stockId") return;
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText ? `(${response.status}) ${errorText}` : `(${response.status})`
    );
  }

  return response.json();
}

const sumNumericStrings = (a: unknown, b: unknown): string => {
  const total = parseNumeric(a) + parseNumeric(b);
  return total.toString();
};

const aggregateArrayByKey = <T extends Record<string, unknown>>(
  arrays: T[][],
  makeKey: (item: T) => string,
  sumFields: string[]
): T[] => {
  const map = new Map<string, T>();
  arrays.forEach((arr) => {
    arr.forEach((item) => {
      const key = makeKey(item);
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { ...item });
        return;
      }
      sumFields.forEach((field) => {
        const existingRecord = existing as Record<string, unknown>;
        const itemRecord = item as Record<string, unknown>;
        existingRecord[field] = sumNumericStrings(
          existingRecord[field],
          itemRecord[field]
        );
      });
    });
  });
  return Array.from(map.values());
};

const aggregateEndpointData = (
  key: string,
  results: unknown[]
): unknown => {
  if (results.length === 0) return null;
  switch (key) {
    case "salesSummary": {
      const numericFields = [
        "totalRevenue",
        "cash",
        "transfer",
        "card",
        "actualRevenue",
        "foxieUsageRevenue",
        "walletUsageRevenue",
        "toPay",
        "debt",
      ];
      const aggregated = numericFields.reduce<Record<string, string>>(
        (acc, field) => {
          acc[field] = results
            .map((res) => parseNumeric((res as Record<string, unknown>)[field]))
            .reduce((sum, value) => sum + value, 0)
            .toString();
          return acc;
        },
        {}
      );
      return aggregated;
    }
    case "serviceSummary": {
      const totals = ["totalServices", "totalServicesServing", "totalServiceDone"];
      const aggregated = totals.reduce<Record<string, string>>((acc, field) => {
        acc[field] = results
          .map((res) => parseNumeric((res as Record<string, unknown>)[field]))
          .reduce((sum, value) => sum + value, 0)
          .toString();
        return acc;
      }, {});
      const items = aggregateArrayByKey(
        results
          .map((res) => ((res as Record<string, unknown>).items as Record<string, unknown>[]) ?? [])
          .filter(Boolean),
        (item) => String(item.serviceName ?? item.name ?? ""),
        ["serviceUsageAmount", "serviceUsagePercentage"]
      );
      return { ...aggregated, items };
    }
    case "topServices": {
      const arrays = results.map(
        (res) => res as Record<string, unknown>[]
      );
      return aggregateArrayByKey(
        arrays,
        (item) => String(item.serviceName ?? item.name ?? ""),
        ["serviceUsageAmount", "serviceUsagePercentage"]
      );
    }
    case "salesByHour": {
      const arrays = results.map(
        (res) => res as Array<Record<string, unknown>>
      );
      const aggregated = aggregateArrayByKey(
        arrays,
        (item) => `${item.date}-${item.timeRange}`,
        ["totalSales"]
      );
      aggregated.forEach((row) => {
        row.totalSales = parseNumeric(row.totalSales);
      });
      return aggregated;
    }
    case "bookingSummary": {
      const fields = [
        "notConfirmed",
        "confirmed",
        "denied",
        "customerCome",
        "customerNotCome",
        "cancel",
        "autoConfirmed",
      ];
      const aggregated = fields.reduce<Record<string, string>>((acc, field) => {
        acc[field] = results
          .map((res) => parseNumeric((res as Record<string, unknown>)[field]))
          .reduce((sum, value) => sum + value, 0)
          .toString();
        return acc;
      }, {});
      return aggregated;
    }
    case "bookingByHour": {
      const arrays = results.map(
        (res) => res as Array<Record<string, unknown>>
      );
      return aggregateArrayByKey(
        arrays,
        (item) =>
          `${item.date ?? ""}-${item.type ?? item.timeRange ?? ""}`,
        ["count"]
      );
    }
    case "newCustomers":
    case "oldCustomers": {
      const arrays = results.map(
        (res) => res as Array<Record<string, unknown>>
      );
      return aggregateArrayByKey(
        arrays,
        (item) => String(item.type ?? ""),
        ["count"]
      );
    }
    case "salesDetail": {
      const arrays = results.map(
        (res) => res as Array<Record<string, unknown>>
      );
      return ([] as Array<Record<string, unknown>>).concat(...arrays);
    }
    default:
      return results[0];
  }
};

async function fetchActualRevenueValue(
  rangeStart: string,
  rangeEnd: string,
  stockIds: string[],
  authHeader: string
): Promise<{ total: number; partialError?: string }> {
  const targets = stockIds.length > 0 ? stockIds : [""];

  const settled = await Promise.allSettled(
    targets.map(async (sid) => {
      const url = new URL(getApiEndpoint(ACTUAL_REVENUE_ENDPOINT));
      url.searchParams.set("dateStart", rangeStart);
      url.searchParams.set("dateEnd", rangeEnd);
      url.searchParams.set("stockId", sid);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText ? `(${response.status}) ${errorText}` : `(${response.status})`
        );
      }

      const payload = await response.json();
      return parseNumeric(payload);
    })
  );

  let total = 0;
  const errors: string[] = [];

  settled.forEach((result) => {
    if (result.status === "fulfilled") {
      total += result.value;
    } else {
      errors.push(
        result.reason instanceof Error ? result.reason.message : String(result.reason)
      );
    }
  });

  if (errors.length === targets.length) {
    throw new Error(errors.join("; "));
  }

  return {
    total,
    partialError: errors.length > 0 ? errors.join("; ") : undefined,
  };
}

const getMonthStartString = (dateStr: string): string => {
  const [day, month, year] = dateStr.split("/");
  if (!day || !month || !year) {
    return dateStr;
  }
  return `01/${month}/${year}`;
};

const MAX_CONCURRENT_STOCK_REQUESTS = 3;

async function fetchEndpointData(
  endpoint: EndpointConfig,
  baseParams: URLSearchParams,
  stockIdList: string[],
  authHeader: string
) {
  if (stockIdList.length <= 1) {
    return fetchBackendJSON(endpoint, baseParams, authHeader);
  }

  const values: unknown[] = [];
  const errors: string[] = [];

  for (let i = 0; i < stockIdList.length; i += MAX_CONCURRENT_STOCK_REQUESTS) {
    const batch = stockIdList.slice(i, i + MAX_CONCURRENT_STOCK_REQUESTS);
    const settled = await Promise.allSettled(
      batch.map(async (sid) => {
        const params = new URLSearchParams(baseParams);
        params.set("stockId", sid);
        return fetchBackendJSON(endpoint, params, authHeader);
      })
    );

    settled.forEach((result) => {
      if (result.status === "fulfilled") {
        values.push(result.value);
      } else {
        errors.push(
          result.reason instanceof Error ? result.reason.message : String(result.reason)
        );
      }
    });
  }

  if (values.length === 0) {
    throw new Error(errors.join("; ") || "Failed to fetch endpoint data");
  }

  const aggregated = aggregateEndpointData(endpoint.key, values);
  return {
    data: aggregated,
    partialError: errors.length > 0 ? errors.join("; ") : undefined,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const dateStart = searchParams.get("dateStart");
  const dateEnd = searchParams.get("dateEnd");
  const stockId = searchParams.get("stockId") ?? "";

  if (!dateStart || !dateEnd) {
    return NextResponse.json(
      { error: "Missing dateStart or dateEnd" },
      { status: 400 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { error: "Missing Authorization header" },
      { status: 401 }
    );
  }

  const resolveStockIds = (raw: string): string[] => {
    if (!raw) return [];
    const tokens = raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (tokens.length === 0) return [];

    const resolved = tokens.flatMap((token) => {
      const ids = getActualStockIds(token);
      if (ids.length === 0 && token !== "") {
        return [token];
      }
      return ids;
    });

    return Array.from(new Set(resolved));
  };

  const stockIdList = resolveStockIds(stockId);

  const baseParams = new URLSearchParams();
  baseParams.set("dateStart", dateStart);
  baseParams.set("dateEnd", dateEnd);
  if (stockIdList.length === 1) {
    baseParams.set("stockId", stockIdList[0]);
  } else {
    baseParams.set("stockId", "");
  }

  const data: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  const endpointResults = await Promise.allSettled(
    ENDPOINTS.map((endpoint) =>
      fetchEndpointData(endpoint, baseParams, stockIdList, authHeader)
    )
  );

  endpointResults.forEach((result, idx) => {
    const { key } = ENDPOINTS[idx];
    if (result.status === "fulfilled") {
      data[key] =
        typeof result.value === "object" && result.value !== null && "data" in result.value
          ? (result.value as { data: unknown }).data
          : result.value;
      if (
        typeof result.value === "object" &&
        result.value !== null &&
        "partialError" in result.value &&
        result.value.partialError
      ) {
        errors[key] = result.value.partialError as string;
      }
    } else {
      errors[key] =
        result.reason instanceof Error ? result.reason.message : "Unknown error";
    }
  });

  // Actual revenue for current day (using dateEnd) and month-to-date.
  try {
    const { total, partialError } = await fetchActualRevenueValue(
      dateEnd,
      dateEnd,
      stockIdList,
      authHeader
    );
    data.actualRevenueToday = total;
    if (partialError) {
      errors.actualRevenueToday = partialError;
    }
  } catch (err) {
    errors.actualRevenueToday =
      err instanceof Error ? err.message : "Failed to fetch actual revenue (day)";
  }

  const monthStart = getMonthStartString(dateEnd);
  try {
    const { total, partialError } = await fetchActualRevenueValue(
      monthStart,
      dateEnd,
      stockIdList,
      authHeader
    );
    data.actualRevenueMTD = total;
    if (partialError) {
      errors.actualRevenueMTD = partialError;
    }
  } catch (err) {
    errors.actualRevenueMTD =
      err instanceof Error ? err.message : "Failed to fetch actual revenue (month)";
  }

  return NextResponse.json({ data, errors });
}
