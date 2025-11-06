import { NextRequest, NextResponse } from "next/server";
import { getApiEndpoint, AUTH_CONFIG } from '@/app/lib/auth-config'
// API endpoint configuration
const LOGIN_ENDPOINT = getApiEndpoint('auth/login');

// In development, disable SSL certificate verification for testing
// WARNING: This is only for development. Never use in production!
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Temporary fix for SSL certificate mismatch in production
// TODO: Fix backend certificate to include backend.facewashfox.com or use correct domain
// WARNING: This bypasses SSL verification - only use temporarily!
if (process.env.NODE_ENV === 'production' && process.env.ALLOW_INSECURE_SSL === 'true') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.warn('⚠️ SSL verification disabled in production - this is insecure!')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log("🔍 Login attempt:", {
      username,
      password: password ? "***" : "empty",
      LOGIN_ENDPOINT,
      mode: 'api'
    });

    // Runtime diagnostics to verify env configuration
    console.log('🧪 Auth Login Diagnostics:', {
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
      NEXT_PUBLIC_API_PREFIX: process.env.NEXT_PUBLIC_API_PREFIX,
      AUTH_CONFIG_API_BASE_URL: AUTH_CONFIG.API_BASE_URL,
      AUTH_CONFIG_API_PREFIX: AUTH_CONFIG.API_PREFIX,
      LOGIN_ENDPOINT,
      NODE_ENV: process.env.NODE_ENV,
      FORCE_MOCK_MODE: false,
      resolvedMode: 'api'
    })


    console.log('🌐 Calling real API:', LOGIN_ENDPOINT)

    try {
      // Call the real API (primary endpoint)
      const apiResponse = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000) // 10 seconds timeout
      });

      console.log("📡 API Response Status:", apiResponse.status);
      console.log(
        "📡 API Response Headers:",
        Object.fromEntries(apiResponse.headers.entries())
      );

      // If primary failed with route-ish errors, try fallback endpoint toggling prefix
      if (!apiResponse.ok) {
        const status = apiResponse.status
        let errorBody: unknown = null
        try { errorBody = await apiResponse.json() } catch {}
        console.warn('⚠️ Primary login endpoint failed:', { status, errorBody })

        // Build a fallback endpoint by toggling the prefix presence
        const hasPrefix = (AUTH_CONFIG.API_PREFIX || '').trim() !== ''
        const base = (AUTH_CONFIG.API_BASE_URL || '').replace(/\/+$/, '')
        const altPrefix = hasPrefix ? '' : '/api'
        const altEndpoint = `${base}${altPrefix}/auth/login`

        console.log('🔁 Retrying login with fallback endpoint:', altEndpoint)
        const fallbackResp = await fetch(altEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ username, password }),
          signal: AbortSignal.timeout(10000)
        })

        if (!fallbackResp.ok) {
          let fbError: unknown = null
          try { fbError = await fallbackResp.json() } catch {}
          console.error('❌ Fallback login endpoint also failed:', { status: fallbackResp.status, fbError })

          const fb = (typeof fbError === 'object' && fbError !== null) ? fbError as Record<string, unknown> : {}
          const primary = (typeof errorBody === 'object' && errorBody !== null) ? errorBody as Record<string, unknown> : {}
          const errorMsg = (fb['error'] ?? primary['error'] ?? 'Login failed') as string
          const detailsMsg = (fb['details'] ?? fb['message'] ?? primary['message'] ?? 'Please check your credentials and try again') as string

        return NextResponse.json(
            { error: String(errorMsg), details: String(detailsMsg) },
            { status: fallbackResp.status }
          )
        }

        // Use fallback successful response
        const data = await fallbackResp.json()
        console.log('✅ API Login successful (fallback):', {
          role: data.role,
          user: data.user?.username,
          hasAccessToken: !!data.access_token,
          hasRefreshToken: !!data.refresh_token,
        })
        return NextResponse.json(data)
      }

      // Parse successful response
      const data = await apiResponse.json();
      console.log("✅ API Login successful:", {
        role: data.role,
        user: data.user?.username,
        hasAccessToken: !!data.access_token,
        hasRefreshToken: !!data.refresh_token,
      });

      return NextResponse.json(data);
    } catch (apiError) {
      console.error("❌ API Connection failed:", apiError);
        return NextResponse.json(
          {
          error: "Connection failed",
          details: "Unable to connect to authentication server. Please check if the API is running.",
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("❌ Login error:", error);

    // Handle different types of errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error: "Connection failed",
          details:
            "Unable to connect to authentication server. Please check if the API is running.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
