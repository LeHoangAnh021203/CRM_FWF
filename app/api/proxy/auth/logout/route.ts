import { NextRequest, NextResponse } from 'next/server'

const clearAuthCookies = (response: NextResponse) => {
  const baseCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 0,
  }

  const cookieNames = ['token', 'access_token', 'refresh_token']
  cookieNames.forEach((name) => {
    response.cookies.set(name, '', baseCookieOptions)
  })
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Invalid or missing authorization header' },
        { status: 401 }
      )
    }

    // Mock logout response
    const response = NextResponse.json({
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    })

    clearAuthCookies(response)
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
