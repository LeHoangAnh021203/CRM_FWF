import { NextRequest, NextResponse } from 'next/server'
import { AUTH_CONFIG, getApiEndpoint } from '@/app/lib/auth-config'

// Temporary fix for SSL certificate mismatch in production
// TODO: Fix backend certificate to include backend.facewashfox.com or use correct domain
// WARNING: This bypasses SSL verification - only use temporarily!
if (process.env.NODE_ENV === 'production' && process.env.ALLOW_INSECURE_SSL === 'true') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  console.warn('⚠️ SSL verification disabled in production - this is insecure!')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  const path = resolvedParams.path.join('/')
  
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    
    // Get Authorization header and cookies
    const authHeader = request.headers.get('Authorization')
    const cookies = request.headers.get('cookie')
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    if (cookies) {
      headers['Cookie'] = cookies
    }

    // Build backend URL using centralized config and normalization
    const base = (AUTH_CONFIG.API_BASE_URL || '').replace(/\/+$/, '')
    const prefix = AUTH_CONFIG.API_PREFIX || ''
    const backendUrl = queryString 
      ? `${base}${prefix}/${path}?${queryString}`
      : `${base}${prefix}/${path}`
    
    console.log(' Proxy GET Debug:', {
      path,
      backendUrl,
      queryString,
      hasAuth: !!authHeader,
      API_BASE_URL: AUTH_CONFIG.API_BASE_URL,
      API_PREFIX: AUTH_CONFIG.API_PREFIX
    })

    // Forward GET request to backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      console.error('❌ Backend GET Error:', {
        status: response.status,
        statusText: response.statusText,
        url: backendUrl
      })
      
      return NextResponse.json(
        { error: `Backend Error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('❌ Proxy GET Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    const isConnError = /ECONNREFUSED|ENOTFOUND|EAI_AGAIN|fetch failed/i.test(message)
    return NextResponse.json(
      { error: `Proxy Error: ${message}` },
      { status: isConnError ? 502 : 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  const path = resolvedParams.path.join('/')
  
  try {
    const body = await request.json()
    
    // Get Authorization header and cookies from original request
    const authHeader = request.headers.get('Authorization')
    const cookies = request.headers.get('cookie')
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    if (cookies) {
      headers['Cookie'] = cookies
    }

    // Build backend URL using centralized config and normalization
    const base = (AUTH_CONFIG.API_BASE_URL || '').replace(/\/+$/, '')
    const prefix = AUTH_CONFIG.API_PREFIX || ''
    const backendUrl = `${base}${prefix}/${path}`
    
    console.log('🔍 Proxy Debug:', {
      path,
      backendUrl,
      hasAuth: !!authHeader,
      hasCookies: !!cookies,
      API_BASE_URL: AUTH_CONFIG.API_BASE_URL,
      API_PREFIX: AUTH_CONFIG.API_PREFIX
    })

    // Forward request to backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.error('❌ Backend Error:', {
        status: response.status,
        statusText: response.statusText,
        url: backendUrl
      })
      
      const errorText = await response.text()
      console.error('❌ Error Response:', errorText)
      
      return NextResponse.json(
        { error: `Backend Error: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('❌ Proxy Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    const isConnError = /ECONNREFUSED|ENOTFOUND|EAI_AGAIN|fetch failed/i.test(message)
    return NextResponse.json(
      { error: `Proxy Error: ${message}` },
      { status: isConnError ? 502 : 500 }
    )
  }
}
