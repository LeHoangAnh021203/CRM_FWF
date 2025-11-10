import { NextRequest, NextResponse } from "next/server";
import { getApiEndpoint, AUTH_CONFIG } from '@/app/lib/auth-config'

// API endpoint configuration
const CHANGE_PASSWORD_ENDPOINT = getApiEndpoint('user/change-password');

// In development, disable SSL certificate verification for testing
// WARNING: This is only for development. Never use in production!
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore - Node env var
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Temporary fix for SSL certificate mismatch in production
// WARNING: This bypasses SSL verification - only use temporarily!
if (process.env.NODE_ENV === 'production' && process.env.ALLOW_INSECURE_SSL === 'true') {
  // @ts-ignore - Node env var
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.warn('⚠️ SSL verification disabled in production - this is insecure!')
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body: { currentPassword?: string; newPassword?: string; confirmPassword?: string } = {};
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: "Invalid request body", details: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword, confirmPassword } = body;

    const authHeader = request.headers.get('authorization') || '';

    console.log('🔐 Change password (user) attempt:', {
      hasAuthHeader: !!authHeader,
      CHANGE_PASSWORD_ENDPOINT,
    })

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Missing required fields: currentPassword, newPassword, confirmPassword' },
        { status: 400 }
      );
    }

    // Call backend API with timeout and forward Authorization header
    try {
      const apiResponse = await fetch(CHANGE_PASSWORD_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
        signal: AbortSignal.timeout(10000),
      })

      const responseText = await apiResponse.text();
      console.log('📡 API Response Status:', apiResponse.status, apiResponse.statusText)

      if (!apiResponse.ok) {
        let errorData: any = null;
        try { errorData = JSON.parse(responseText) } catch {}
        return NextResponse.json(
          { error: (errorData?.message || errorData?.error || responseText || 'Change password failed'), details: errorData || undefined },
          { status: apiResponse.status }
        )
      }

      let data: any;
      try { data = JSON.parse(responseText) } catch { data = { message: responseText } }
      return NextResponse.json(data)
    } catch (apiError) {
      console.error('❌ API Connection failed:', apiError)
      if (apiError instanceof Error && apiError.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timeout' }, { status: 504 })
      }
      return NextResponse.json(
        { error: 'Connection failed', details: 'Unable to reach backend user service' },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('❌ Change Password Proxy Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    let body: { currentPassword?: string; newPassword?: string; confirmPassword?: string } = {};
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: "Invalid request body", details: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword, confirmPassword } = body;
    const authHeader = request.headers.get('authorization') || '';

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Missing required fields: currentPassword, newPassword, confirmPassword' },
        { status: 400 }
      );
    }

    try {
      const apiResponse = await fetch(CHANGE_PASSWORD_ENDPOINT, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
        signal: AbortSignal.timeout(10000),
      })

      const responseText = await apiResponse.text();
      if (!apiResponse.ok) {
        let errorData: any = null;
        try { errorData = JSON.parse(responseText) } catch {}
        return NextResponse.json(
          { error: (errorData?.message || errorData?.error || responseText || 'Change password failed'), details: errorData || undefined },
          { status: apiResponse.status }
        )
      }

      let data: any;
      try { data = JSON.parse(responseText) } catch { data = { message: responseText } }
      return NextResponse.json(data)
    } catch (apiError) {
      console.error('❌ API Connection failed:', apiError)
      if (apiError instanceof Error && apiError.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timeout' }, { status: 504 })
      }
      return NextResponse.json(
        { error: 'Connection failed', details: 'Unable to reach backend user service' },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('❌ Change Password Proxy Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


