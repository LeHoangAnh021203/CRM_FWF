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

      // Read response body once - it can only be read once
      const responseText = await response.text()
      console.log('[AuthAPI] Response text:', responseText)
      console.log('[AuthAPI] Response status:', response.status)
      console.log('[AuthAPI] Response ok:', response.ok)
      
      if (!response.ok) {
        let errorData: Record<string, unknown> = {}
        let errMsg = ''
        
        // Try to parse as JSON first
        if (responseText) {
          try {
            errorData = JSON.parse(responseText) as Record<string, unknown>
            console.log('[AuthAPI] Parsed error data:', errorData)
            console.log('[AuthAPI] Error data keys:', Object.keys(errorData))
            console.log('[AuthAPI] emailVerified in errorData?', 'emailVerified' in errorData)
            console.log('[AuthAPI] emailVerified value:', (errorData as any)?.emailVerified)
          } catch (parseError) {
            console.error('[AuthAPI] Failed to parse response as JSON:', parseError)
            // Not JSON, treat as text
            errorData = { error: responseText }
          }
        } else {
          console.warn('[AuthAPI] Empty response text')
        }

        // Get details field first - this is often more specific than message
        const errorDetails = (errorData as any)?.details || ''
        
        // Determine error message from various possible fields (prioritize details if it contains verification info)
        // Safely check if errorData is a valid object
        const isValidErrorData = errorData && 
                                 typeof errorData === 'object' && 
                                 errorData !== null && 
                                 !Array.isArray(errorData)
        
        if (isValidErrorData && Object.keys(errorData).length > 0) {
          // If details exists and is a string, prioritize it (especially for verification errors)
          if (errorDetails && typeof errorDetails === 'string') {
            const detailsLower = errorDetails.toLowerCase()
            // Always use details if it contains verification keywords
            if (detailsLower.includes("verify") || 
                detailsLower.includes("verification") || 
                detailsLower.includes("not verified") ||
                detailsLower.includes("account is not verified") ||
                detailsLower.includes("your account is not verified")) {
              errMsg = errorDetails
            } else {
              // Otherwise, use details if available, or fallback to other fields
              errMsg = errorDetails || 
                      (errorData as any).message ||
                      (errorData as any).error ||
                      (errorData as any).detail ||
                      ''
            }
          } else {
            // No details, use message or error field
            errMsg = (
              (errorData as any).message ||
              (errorData as any).error ||
              (errorData as any).details ||
              (errorData as any).detail ||
              ''
            ) as string
          }
        }
        
        // Fallback to response text if no structured error message found
        if (!errMsg && responseText) {
          try {
            const parsed = JSON.parse(responseText)
            errMsg = parsed.details || parsed.message || parsed.error || responseText
          } catch {
            errMsg = responseText
          }
        }
        
        // Final fallback to HTTP status
        if (!errMsg || errMsg.trim() === '') {
          errMsg = response.status === 401 
            ? 'Invalid username or password' 
            : `HTTP ${response.status}: ${response.statusText || 'Request failed'}`
        }
        
        // Combine error message and details for keyword checking
        const combinedErrorText = `${errMsg} ${errorDetails}`.toLowerCase()
        
        // IMPORTANT: Check emailVerified flag FIRST (highest priority)
        // This is set by our API route when it detects verification error
        const hasEmailVerifiedFlag = (errorData as any)?.emailVerified === false
        
        // Check if error indicates email is not verified
        // Priority: 1. emailVerified flag, 2. status codes, 3. keywords in message/details
        const isEmailNotVerified = hasEmailVerifiedFlag ||
                                   response.status === 403 || 
                                   response.status === 423 ||
                                   (errorData as any)?.email_verified === false ||
                                   (errorData as any)?.verified === false ||
                                   combinedErrorText.includes("verify") ||
                                   combinedErrorText.includes("verification") ||
                                   combinedErrorText.includes("unverified") ||
                                   combinedErrorText.includes("not verified") ||
                                   combinedErrorText.includes("account is not verified") ||
                                   combinedErrorText.includes("verification token expired") ||
                                   combinedErrorText.includes("token expired") ||
                                   combinedErrorText.includes("link has expired") ||
                                   combinedErrorText.includes("chưa xác thực") ||
                                   combinedErrorText.includes("cần được xác thực") ||
                                   combinedErrorText.includes("mail đã tồn tại nhưng cần được xác thực")
        
        // Log more informative error details (use try-catch to avoid console errors)
        try {
          if (typeof console !== 'undefined' && console.error) {
            console.error('[AuthAPI] Login error details:', {
              status: response.status,
              statusText: response.statusText,
              errorMessage: errMsg,
              errorDetails: errorDetails,
              emailVerifiedFlag: (errorData as any)?.emailVerified,
              hasEmailVerifiedFlag,
              isEmailNotVerified,
              combinedErrorText
            })
          }
        } catch (logError) {
          // Ignore console errors - they shouldn't break the flow
        }
        
        // Create error with message that includes details if available
        // For verification errors, prioritize details in the error message so keywords are found
        const errorMessageText = isEmailNotVerified && errorDetails 
          ? errorDetails  // Use details directly for verification errors
          : (errorDetails || errMsg)  // Otherwise use details if available, or errMsg
        
        const error = new Error(`Login failed: ${response.status} - ${errorMessageText}`)
        
        if (isEmailNotVerified) {
          // Set flag and properties on error object FIRST (before any console.log)
          (error as any).isEmailNotVerified = true
          
          // Try to extract email from error data if available
          const emailFromError = (errorData as any)?.email
          if (emailFromError) {
            (error as any).email = emailFromError
          }
          
          // Always preserve details as property for UI
          if (errorDetails) {
            (error as any).details = errorDetails
          }
          
          // Log after setting properties (use try-catch to avoid console.log errors)
          try {
            if (typeof console !== 'undefined' && console.log && typeof console.log === 'function') {
              console.log('[AuthAPI] Email not verified detected, setting flag')
              const props = {
                isEmailNotVerified: (error as any).isEmailNotVerified,
                email: (error as any).email,
                details: (error as any).details,
                message: error.message
              }
              console.log('[AuthAPI] Error object properties set:', props)
            }
          } catch (logError) {
            // Ignore console.log errors, but ensure error is still thrown
          }
        }
        
        // Throw error immediately - don't let it be caught by outer catch
        throw error
      }
      
      // Success path
      if (!responseText) {
        throw new Error('Empty response body')
      }
      
      // Parse JSON from text
      try {
        const data = JSON.parse(responseText)
        console.log('AuthAPI.login success:', data)
        console.log('AuthAPI.login returning data')
        return data
      } catch (parseError) {
        console.error('AuthAPI.login JSON parse error:', {
          error: parseError,
          responseText: responseText?.substring(0, 200) || 'No response text'
        })
        throw new Error(`Failed to parse login response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`)
      }
    } catch (error) {
      // Handle errors that occur before response parsing
      if (error instanceof Error) {
        const errorAny = error as any
        
        // IMPORTANT: Check for verification flag FIRST before doing anything else
        // This ensures verification errors are preserved and re-thrown immediately
        // Check multiple ways to ensure we catch the flag even if it's been modified
        const hasVerificationFlag = errorAny?.isEmailNotVerified === true ||
                                    errorAny?.isEmailNotVerified === 'true' ||
                                    (typeof errorAny === 'object' && errorAny !== null && 
                                     'isEmailNotVerified' in errorAny && 
                                     errorAny.isEmailNotVerified === true)
        
        if (hasVerificationFlag) {
          // This is a verification error - preserve it and re-throw immediately
          // Don't create new error, just re-throw the original with all properties
          throw error
        }
        
        // Check if error message starts with 'Login failed:' (our formatted error)
        // OR contains verification keywords (fallback detection)
        const errorMsg = error.message || ''
        const hasVerificationKeywords = errorMsg.toLowerCase().includes('not verified') ||
                                       errorMsg.toLowerCase().includes('account is not verified') ||
                                       errorMsg.toLowerCase().includes('your account is not verified')
        
        if (error.message.startsWith('Login failed:') || hasVerificationKeywords) {
          // This is already a formatted error from above, or contains verification keywords
          // Re-throw as-is to preserve properties
          throw error
        }
      }
      
      // Handle network/other errors (only for non-verification errors)
      // Use try-catch to avoid console.error issues
      try {
        if (typeof console !== 'undefined' && console.error) {
          console.error('[AuthAPI] Network/other error:', {
            error: error instanceof Error ? {
              name: error.name,
              message: error.message,
              stack: error.stack
            } : error,
            errorType: error instanceof Error ? error.constructor.name : typeof error
          })
        }
      } catch (logError) {
        // Ignore console errors
      }
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred during login'
      throw new Error(errorMessage)
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
