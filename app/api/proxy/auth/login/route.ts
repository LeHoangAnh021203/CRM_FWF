import { NextRequest, NextResponse } from "next/server";
import { mockLogin } from '@/app/lib/mock-auth'
import { shouldUseMockMode, getApiEndpoint } from '@/app/lib/auth-config'
// API endpoint configuration
const LOGIN_ENDPOINT = getApiEndpoint('auth/login');

// In development, disable SSL certificate verification for testing
// WARNING: This is only for development. Never use in production!
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log("🔍 Login attempt:", {
      username,
      password: password ? "***" : "empty",
      LOGIN_ENDPOINT,
      mode: shouldUseMockMode() ? 'mock' : 'api'
    });

    // Runtime diagnostics to verify env configuration
    console.log('🧪 Auth Login Diagnostics:', {
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      FORCE_MOCK_MODE: false,
      resolvedMode: shouldUseMockMode() ? 'mock' : 'api'
    })

    // Check if mock mode is enabled or if no backend API is configured
    const shouldUseMock = shouldUseMockMode();

    if (shouldUseMock) {
      console.log('🎭 Using mock authentication')
      const mockResult = mockLogin(username, password)

      if (!mockResult.success) {
        return NextResponse.json(
          {
            error: "Invalid credentials",
            details: "Please check your username and password"
          },
          { status: 401 }
        );
      }

      // Return mock response in the same format as real API
      return NextResponse.json({
        success: true,
        user: mockResult.user,
        access_token: mockResult.token,
        refresh_token: mockResult.token, // Same token for simplicity
        role: mockResult.user?.role,
        message: 'Login successful (Mock Mode)'
      })
    }

    console.log('🌐 Calling real API:', LOGIN_ENDPOINT)

    try {
      // Call the real API
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

      // Check if API call was successful
      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({}));
        console.error("❌ API Error:", errorData);

        return NextResponse.json(
          {
            error: errorData.error || "Login failed",
            details:
              errorData.details ||
              errorData.message ||
              "Please check your credentials and try again",
          },
          { status: apiResponse.status }
        );
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
      console.error("❌ API Connection failed, falling back to mock:", apiError);
      
      // Fallback to mock authentication when API is unavailable
      console.log('🔄 API unavailable, using mock authentication as fallback')
      const mockResult = mockLogin(username, password)

      if (!mockResult.success) {
        return NextResponse.json(
          {
            error: "Invalid credentials",
            details: "Please check your username and password"
          },
          { status: 401 }
        );
      }

      // Return mock response in the same format as real API
      return NextResponse.json({
        success: true,
        user: mockResult.user,
        access_token: mockResult.token,
        refresh_token: mockResult.token,
        role: mockResult.user?.role,
        message: 'Login successful (Mock Mode - API Fallback)'
      })
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
