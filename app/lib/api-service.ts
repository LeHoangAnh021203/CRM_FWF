const API_BASE_URL = "/api/proxy"
import { TokenService } from './token-service'

export class ApiService {
  static async get(endpoint: string, token?: string): Promise<unknown> {
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
        method: 'GET',
        headers,
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
    }
  }

  static async post(endpoint: string, data: unknown, token?: string): Promise<unknown> {
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
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
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
