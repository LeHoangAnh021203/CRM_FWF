import { NextRequest, NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/app/lib/auth-config";

const buildBackendUrl = (req: NextRequest) => {
  const base = (AUTH_CONFIG.API_BASE_URL || "").replace(/\/+$/, "");
  const prefix = AUTH_CONFIG.API_PREFIX || "";
  const url = new URL(req.url);
  const query = url.searchParams.toString();
  return query
    ? `${base}${prefix}/user/get-all-users?${query}`
    : `${base}${prefix}/user/get-all-users`;
};

const buildHeaders = (req: NextRequest) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authHeader = req.headers.get("Authorization");
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }
  const cookies = req.headers.get("cookie");
  if (cookies) {
    headers["Cookie"] = cookies;
  }
  return headers;
};

export async function GET(request: NextRequest) {
  try {
    const backendUrl = buildBackendUrl(request);
    console.log("[Proxy] GET user/get-all-users:", backendUrl);
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: buildHeaders(request),
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "Không có thông tin lỗi");
      console.error("[Proxy] user/get-all-users error", {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      return NextResponse.json(
        { error: `Backend Error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Proxy] Error fetching user/get-all-users:", error);
    const message =
      error instanceof Error ? error.message : "Unknown proxy error";
    const isConnError = /ECONNREFUSED|ENOTFOUND|EAI_AGAIN|fetch failed|timeout|aborted/i.test(
      message
    );
    const status = isConnError ? 502 : 500;
    return NextResponse.json(
      {
        error: `Proxy Error: ${message}`,
        details: isConnError
          ? `Không thể kết nối tới backend tại ${AUTH_CONFIG.API_BASE_URL}`
          : "Lỗi proxy không xác định",
      },
      { status }
    );
  }
}
