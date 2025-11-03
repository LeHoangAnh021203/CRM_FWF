const API_BASE_URL = "/api/proxy"

export interface LoginRequest {
  username: string
  password: string
}

export interface User {
  id: number
  firstname: string
  lastname: string
  username: string
  email: string
  phoneNumber: string
  dob: string
  gender: boolean
  bio: string
  avatar: string | null
  role: string
  active: boolean
}

export interface LoginResponse {
  role: string
  user: User
  access_token: string
  refresh_token: string
}

// JWT Token interface
export interface JWTPayload {
  ipAddress: string
  userId: number
  authorities: string[]
  sub: string
  iss: string
  iat: number
  exp: number
}

export class AuthAPI {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('AuthAPI.login called with:', credentials)
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      console.log('AuthAPI.login response status:', response.status)
      console.log('AuthAPI.login response ok:', response.ok)
      console.log('AuthAPI.login response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        let errorData: Record<string, unknown> = {}
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json()
          } else {
            const errorText = await response.text()
            errorData = { error: errorText || 'Unknown error' }
          }
        } catch (parseError) {
          console.warn('Failed to parse error response:', parseError)
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }

        // Fallback if server returned an empty JSON object
        if (
          !errorData ||
          (typeof errorData === 'object' && Object.keys(errorData).length === 0)
        ) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        
        console.error('AuthAPI.login error details:', errorData)
        const errMsg =
          (errorData && typeof errorData === 'object' && (
            (errorData as any).error || (errorData as any).details || (errorData as any).message
          )) || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(`Login failed: ${response.status} - ${errMsg}`)
      }

      console.log('AuthAPI.login parsing response...')
      
      // Check if response has content
      const responseText = await response.text()
      console.log('AuthAPI.login response text:', responseText)
      
      if (!responseText) {
        throw new Error('Empty response body')
      }
      
      // Parse JSON from text
      const data = JSON.parse(responseText)
      console.log('AuthAPI.login success:', data)
      console.log('AuthAPI.login returning data')
      return data
    } catch (error) {
      console.error('AuthAPI.login error:', error)
      throw error
    }
  }

  static async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${refreshToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`)
    }

    return response.json()
  }

  static async logout(token?: string): Promise<void> {
    const accessToken = token || localStorage.getItem('access_token')
    
    if (!accessToken) {
      console.log('No access token to logout')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        console.warn(`Logout API failed: ${response.status} - ${response.statusText}`)
        // Continue with local logout even if API fails
      } else {
        console.log('Logout API successful')
      }
    } catch (error) {
      console.warn('Logout API error:', error)
      // Continue with local logout even if API fails
    }
  }

  // Decode JWT token to get user permissions
  static decodeToken(token: string): JWTPayload | null {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Error decoding token:', error)
      return null
    }
  }

  // Get user permissions from token
  static getUserPermissions(token: string): string[] {
    const payload = this.decodeToken(token)
    return payload?.authorities || []
  }

  // Check if user has specific permission
  static hasPermission(token: string, permission: string): boolean {
    const permissions = this.getUserPermissions(token)
    return permissions.includes(permission)
  }

  // Check if user has admin role
  static isAdmin(token: string): boolean {
    const permissions = this.getUserPermissions(token)
    return permissions.includes('ROLE_ADMIN')
  }
}
