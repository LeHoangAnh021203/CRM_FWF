import { NextRequest, NextResponse } from "next/server";
// import { mockLogin, isMockModeEnabled } from '@/app/lib/mock-auth'

// API endpoint configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? "https://your-backend-api.com" // Replace with your actual backend URL
    : "http://localhost:3001");
const LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/login`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log("🔍 Login attempt:", {
      username,
      password: password ? "***" : "empty",
      API_BASE_URL,
      LOGIN_ENDPOINT,
    });

    // Check if we should use mock mode (when no backend API is configured)
    const isMockMode = API_BASE_URL === "https://your-backend-api.com" || !process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (isMockMode) {
      console.log('🎭 Using mock authentication (no backend API configured)')
      
      // Simple mock authentication
      if (username === 'admin' && password === 'admin') {
        const mockToken = 'mock-jwt-token-' + Date.now();
        return NextResponse.json({
          success: true,
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            role: 'ROLE_ADMIN'
          },
          access_token: mockToken,
          refresh_token: mockToken,
          role: 'ROLE_ADMIN',
          message: 'Login successful (Mock Mode)'
        });
      } else {
        return NextResponse.json(
          {
            error: "Invalid credentials",
            details: "Please use admin/admin for mock login"
          },
          { status: 401 }
        );
      }
    }

    console.log('🌐 Calling real API:', LOGIN_ENDPOINT)

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
