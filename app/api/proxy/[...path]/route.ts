import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/api"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  const path = resolvedParams.path.join('/')
  const url = new URL(request.url)
  const searchParams = url.searchParams.toString()
  
  try {
    // Get Authorization header and cookies from original request
    const authHeader = request.headers.get('Authorization')
    const cookies = request.headers.get('cookie')
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Forward Authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    // Forward cookies if present
    if (cookies) {
      headers['Cookie'] = cookies
    }
    
    const response = await fetch(`${API_BASE_URL}/${path}?${searchParams}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error: ${response.status} - ${errorText}`)
      
      // Nếu ngrok offline, trả về lỗi rõ ràng
      if (errorText.includes('ERR_NGROK_3200') || errorText.includes('offline')) {
        return NextResponse.json(
          { 
            error: 'Backend service is currently offline. Please try again later.',
            details: 'Ngrok tunnel is offline',
            code: 'BACKEND_OFFLINE'
          }, 
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { error: `API Error: ${response.status}` }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy Error:', error)
    return NextResponse.json(
      { 
        error: 'Backend service is currently unavailable. Please try again later.',
        details: error instanceof Error ? error.message : 'Unknown error',
        code: 'BACKEND_UNAVAILABLE'
      }, 
      { status: 503 }
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
    
    console.log(`=== PROXY DEBUG ===`)
    console.log(`Proxying POST to: ${API_BASE_URL}/${path}`)
    console.log('Request body:', JSON.stringify(body, null, 2))
    console.log('Authorization header:', authHeader ? 'Present' : 'Missing')
    console.log('Cookies:', cookies ? 'Present' : 'Missing')
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
    
    // Forward Authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    // Forward cookies if present
    if (cookies) {
      headers['Cookie'] = cookies
    }
    
    const response = await fetch(`${API_BASE_URL}/${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    console.log(`API Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error: ${response.status} - ${errorText}`)
      console.log('🔍 Full response headers:', Object.fromEntries(response.headers.entries()))
      
      // Nếu ngrok offline, trả về lỗi rõ ràng
      if (errorText.includes('ERR_NGROK_3200') || errorText.includes('offline')) {
        return NextResponse.json(
          { 
            error: 'Backend service is currently offline. Please try again later.',
            details: 'Ngrok tunnel is offline',
            code: 'BACKEND_OFFLINE'
          }, 
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { 
          error: `API Error: ${response.status}`, 
          details: errorText,
        }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('API Response data:', JSON.stringify(data, null, 2))
    console.log('🔍 Response content-type:', response.headers.get('content-type'))
    console.log('🔍 Response body length:', JSON.stringify(data).length)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy Error:', error)
    return NextResponse.json(
      { 
        error: 'Backend service is currently unavailable. Please try again later.',
        details: error instanceof Error ? error.message : 'Unknown error',
        code: 'BACKEND_UNAVAILABLE'
      }, 
      { status: 500 }
    )
  }
}
