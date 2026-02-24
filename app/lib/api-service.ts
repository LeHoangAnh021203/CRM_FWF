const API_BASE_URL = "/api/proxy"
import { TokenService } from './token-service'
import { AUTH_CONFIG } from './auth-config'

type DirectGetOptions = {
  cacheTtlMs?: number
  forceRefresh?: boolean
  directTimeoutMs?: number
  proxyTimeoutMs?: number
  abortRetries?: number
}

// Helper function to create AbortSignal with timeout
function createTimeoutSignal(timeoutMs: number): AbortSignal {
  if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
    // Modern browsers support AbortSignal.timeout()
    return AbortSignal.timeout(timeoutMs)
  }
  // Fallback for older browsers
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeoutMs)
  return controller.signal
}

export class ApiService {
  private static directGetCache = new Map<string, { expiresAt: number; data: unknown }>()
  private static directGetInflight = new Map<string, Promise<unknown>>()

  static async get(endpoint: string, token?: string, timeoutMs: number = 30000): Promise<unknown> {
    const validToken = token || await TokenService.getValidAccessToken()
    
    if (!validToken) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-expired'))
      }
      throw new Error('No valid token available')
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${validToken}`
    }

    // Retry on 429 with exponential backoff
    let attempt = 0
    const maxRetries = 3
    while (true) {
      try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
          method: 'GET',
          headers,
          signal: createTimeoutSignal(timeoutMs),
        })

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired, try to refresh
            console.log('Token expired; refresh disabled -> logout')
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auth-expired'))
            }
            throw new Error('Authentication failed - please login again')
          }
          if (response.status === 429 && attempt < maxRetries) {
            const retryAfter = response.headers.get('Retry-After')
            const delayMs = retryAfter ? Number(retryAfter) * 1000 : (2 ** attempt) * 500
            await new Promise(r => setTimeout(r, delayMs))
            attempt += 1
            continue
          }
          
          // Get error details from response
          let errorDetails = ''
          try {
            const errorText = await response.text()
            if (errorText) {
              try {
                const errorJson = JSON.parse(errorText)
                errorDetails = errorJson.error || errorJson.message || errorText
              } catch {
                errorDetails = errorText
              }
            }
          } catch {
            // Ignore errors when reading response
          }
          
          const errorMessage = errorDetails 
            ? `GET request failed: ${response.status} - ${errorDetails}`
            : `GET request failed: ${response.status}`
          
          throw new Error(errorMessage)
        }

        return response.json()
      } catch (error) {
        // Handle timeout errors
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`Request timeout: API không phản hồi sau ${timeoutMs / 1000} giây. Vui lòng thử lại sau.`)
        }
        // Re-throw other errors
        throw error
      }
    }
  }

  static async post(endpoint: string, data: unknown, token?: string, timeoutMs: number = 30000): Promise<unknown> {
    const validToken = token || await TokenService.getValidAccessToken()
    
    if (!validToken) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-expired'))
      }
      throw new Error('No valid token available')
    }

    console.log('🔍 API Service Debug:')
    console.log('  - Endpoint:', endpoint)
    console.log('  - Token present:', !!validToken)
    console.log('  - Token length:', validToken.length)
    console.log('  - Token preview:', validToken.substring(0, 20) + '...')

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${validToken}`
    }
    
    console.log('🔍 Request Headers:', headers)

    // Retry on 429 with exponential backoff
    let attempt = 0
    const maxRetries = 3
    while (true) {
      try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
          signal: createTimeoutSignal(timeoutMs),
        })

        if (!response.ok) {
          if (response.status === 401) {
            // Get response body for debugging
            const errorText = await response.text()
            console.log('🔍 401 Error Response:', errorText)
            console.log('Token expired; refresh disabled -> logout')
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auth-expired'))
            }
            throw new Error('Authentication failed - please login again')
          }
          if (response.status === 429 && attempt < maxRetries) {
            const retryAfter = response.headers.get('Retry-After')
            const delayMs = retryAfter ? Number(retryAfter) * 1000 : (2 ** attempt) * 500
            await new Promise(r => setTimeout(r, delayMs))
            attempt += 1
            continue
          }
          throw new Error(`POST request failed: ${response.status}`)
        }

        return response.json()
      } catch (error) {
        // Handle timeout errors
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`Request timeout: API không phản hồi sau ${timeoutMs / 1000} giây. Vui lòng thử lại sau.`)
        }
        // Re-throw other errors
        throw error
      }
    }
  }

  // Customer Sale APIs
  static async getCustomerSourceTrend(token?: string) {
    return this.post('customer-sale/customer-source-trend', {}, token)
  }

  static async getAppDownloadStatus(token?: string) {
    return this.post('customer-sale/app-download-status', {}, token)
  }

  static async getGenderRevenue(token?: string) {
    return this.post('customer-sale/gender-revenue', {}, token)
  }

  static async getFacilityHourService(token?: string) {
    return this.post('customer-sale/facility-hour-service', {}, token)
  }

  static async getAppDownloadPieChart(token?: string) {
    return this.post('customer-sale/app-download-pieChart', {}, token)
  }

  // Dashboard APIs
  static async getDashboardStats(token?: string) {
    return this.get('dashboard/stats', token)
  }

  static async getDashboardRevenue(token?: string) {
    return this.get('dashboard/revenue', token)
  }

  static async getDashboardActivity(token?: string) {
    return this.get('dashboard/activity', token)
  }

  static async getDashboardInsights(token?: string) {
    return this.get('dashboard/insights', token)
  }

  // Client-side direct fetch (bypasses Vercel proxy timeout)
  // Use this for long-running API calls from client components
  // Falls back to proxy if direct fetch fails (CORS issues)
  static async getDirect(endpoint: string, token?: string, options?: DirectGetOptions): Promise<unknown> {
    // Only works on client-side
    if (typeof window === 'undefined') {
      throw new Error('getDirect can only be used on client-side')
    }

    const validToken = token || await TokenService.getValidAccessToken()
    
    if (!validToken) {
      window.dispatchEvent(new CustomEvent('auth-expired'))
      throw new Error('No valid token available')
    }

    // Build direct backend URL (bypass proxy)
    const base = (AUTH_CONFIG.API_BASE_URL || '').replace(/\/+$/, '')
    const prefix = AUTH_CONFIG.API_PREFIX || ''
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    const directUrl = `${base}${prefix}/${cleanEndpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${validToken}`
    }

    const cacheTtlMs = options?.cacheTtlMs ?? 20_000
    const directTimeoutMs = options?.directTimeoutMs ?? 60_000
    const proxyTimeoutMs = options?.proxyTimeoutMs ?? 130_000
    const abortRetries = options?.abortRetries ?? 1
    const forceProxyOnly = process.env.NEXT_PUBLIC_FORCE_PROXY === 'true'
    const cacheKey = `${validToken.slice(-16)}::${endpoint}`
    const now = Date.now()

    if (!options?.forceRefresh) {
      const cached = this.directGetCache.get(cacheKey)
      if (cached && cached.expiresAt > now) {
        return cached.data
      }
      const inflight = this.directGetInflight.get(cacheKey)
      if (inflight) {
        return inflight
      }
    }

    const callWithRetry = async (
      fn: () => Promise<unknown>,
      label: string
    ): Promise<unknown> => {
      let attempt = 0
      while (true) {
        try {
          return await fn()
        } catch (error) {
          const isAbort = error instanceof Error && error.name === 'AbortError'
          if (!isAbort || attempt >= abortRetries) throw error
          attempt += 1
          console.warn(`[ApiService] ${label} aborted. Retry ${attempt}/${abortRetries}`)
        }
      }
    }

    const requestPromise = (async (): Promise<unknown> => {
      if (forceProxyOnly) {
        console.log('[ApiService] Force proxy mode enabled. Skipping direct fetch.')
        const payload = await callWithRetry(async () => {
          const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'GET',
            headers,
            signal: AbortSignal.timeout(proxyTimeoutMs),
          })
          if (!response.ok) {
            if (response.status === 401) {
              window.dispatchEvent(new CustomEvent('auth-expired'))
              throw new Error('Authentication failed - please login again')
            }
            const errorText = await response.text().catch(() => '')
            throw new Error(`Proxy request failed: ${response.status}${errorText ? ` - ${errorText}` : ''}`)
          }
          return response.json()
        }, 'proxy only fetch')

        this.directGetCache.set(cacheKey, {
          data: payload,
          expiresAt: Date.now() + cacheTtlMs,
        })
        return payload
      }

      try {
        console.log('[ApiService] Attempting direct fetch to:', directUrl)
        const payload = await callWithRetry(async () => {
          const response = await fetch(directUrl, {
            method: 'GET',
            headers,
            signal: AbortSignal.timeout(directTimeoutMs),
          })
          if (!response.ok) {
            if (response.status === 401) {
              console.log('Token expired; refresh disabled -> logout')
              window.dispatchEvent(new CustomEvent('auth-expired'))
              throw new Error('Authentication failed - please login again')
            }
            const errorText = await response.text().catch(() => '')
            throw new Error(`GET request failed: ${response.status}${errorText ? ` - ${errorText}` : ''}`)
          }
          return response.json()
        }, 'direct fetch')

        this.directGetCache.set(cacheKey, {
          data: payload,
          expiresAt: Date.now() + cacheTtlMs,
        })
        console.log('[ApiService] Direct fetch successful')
        return payload
      } catch (directError) {
        const directMessage = directError instanceof Error ? directError.message : String(directError)
        const isNetworkError =
          directError instanceof TypeError ||
          /Failed to fetch|NetworkError|CORS|fetch failed|certificate|timeout|aborted/i.test(directMessage)

        if (!isNetworkError) throw directError

        console.warn('[ApiService] Direct fetch failed, falling back to proxy:', directMessage)
        console.log('[ApiService] Falling back to proxy endpoint:', `${API_BASE_URL}/${endpoint}`)

        const payload = await callWithRetry(async () => {
          const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'GET',
            headers,
            signal: AbortSignal.timeout(proxyTimeoutMs),
          })
          if (!response.ok) {
            if (response.status === 401) {
              window.dispatchEvent(new CustomEvent('auth-expired'))
              throw new Error('Authentication failed - please login again')
            }
            const errorText = await response.text().catch(() => '')
            throw new Error(`Proxy fallback failed: ${response.status}${errorText ? ` - ${errorText}` : ''}`)
          }
          return response.json()
        }, 'proxy fallback')

        this.directGetCache.set(cacheKey, {
          data: payload,
          expiresAt: Date.now() + cacheTtlMs,
        })
        console.log('[ApiService] Proxy fallback successful')
        return payload
      }
    })()

    this.directGetInflight.set(cacheKey, requestPromise)
    try {
      return await requestPromise
    } finally {
      this.directGetInflight.delete(cacheKey)
    }
  }

  // Get user info by username from get-all-users API
  static async getUserByUsername(username: string, token?: string): Promise<unknown | null> {
    try {
      // Call get-all-users API with username filter
      const response = await this.get(`user/get-all-users?pageNumber=0&pageSize=100&sortBy=username&sortDir=asc`, token) as {
        content?: Array<{
          id: number
          firstname: string
          lastname: string
          username: string
          email: string
          phoneNumber: string
          role: string
          active: boolean
        }>
        totalElements?: number
      }
      
      if (response && response.content && Array.isArray(response.content)) {
        // Find user by username
        const user = response.content.find(u => u.username === username)
        if (user) {
          console.log('[ApiService] Found user by username:', user)
          return user
        }
      }
      
      console.warn('[ApiService] User not found by username:', username)
      return null
    } catch (error) {
      console.error('[ApiService] Error fetching user by username:', error)
      return null
    }
  }

  static async patch(endpoint: string, data: unknown, token?: string): Promise<unknown> {
    const validToken = token || await TokenService.getValidAccessToken()
    
    if (!validToken) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-expired'))
      }
      throw new Error('No valid token available')
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${validToken}`
    }

    // Retry on 429 with exponential backoff
    let attempt = 0
    const maxRetries = 3
    while (true) {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      })

      // Read response body once (can only be read once)
      const responseText = await response.text()
      let responseData: unknown = null
      
      try {
        responseData = responseText ? JSON.parse(responseText) : null
      } catch {
        responseData = responseText
      }

      if (!response.ok) {
        if (response.status === 401) {
          console.log('🔍 401 Error Response:', responseData)
          console.log('Token expired; refresh disabled -> logout')
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth-expired'))
          }
          throw new Error('Authentication failed - please login again')
        }
        if (response.status === 429 && attempt < maxRetries) {
          const retryAfter = response.headers.get('Retry-After')
          const delayMs = retryAfter ? Number(retryAfter) * 1000 : (2 ** attempt) * 500
          await new Promise(r => setTimeout(r, delayMs))
          attempt += 1
          continue
        }
        
        let errorDetails = ''
        if (responseData) {
          if (typeof responseData === 'object') {
            const errorObj = responseData as Record<string, unknown>
            errorDetails = (errorObj.error || errorObj.message || JSON.stringify(responseData)) as string
          } else {
            errorDetails = String(responseData)
          }
        }
        
        const errorMessage = errorDetails 
          ? `PATCH request failed: ${response.status} - ${errorDetails}`
          : `PATCH request failed: ${response.status}`
        
        throw new Error(errorMessage)
      }

      return responseData
    }
  }
}
