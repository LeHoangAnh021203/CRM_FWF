import { ApiService } from './api-service';

// Cache for API responses
const apiCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

// Debounce function for API calls
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Optimized API service with caching
export class OptimizedApiService {
  private static instance: OptimizedApiService;
  private pendingRequests = new Map<string, Promise<any>>();

  static getInstance(): OptimizedApiService {
    if (!OptimizedApiService.instance) {
      OptimizedApiService.instance = new OptimizedApiService();
    }
    return OptimizedApiService.instance;
  }

  // Get cached data if available and not expired
  private getCachedData(key: string): any | null {
    const cached = apiCache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    if (cached) {
      apiCache.delete(key);
    }
    return null;
  }

  // Set cache data
  private setCachedData(key: string, data: any, ttl: number = CACHE_TTL): void {
    apiCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Clear expired cache entries
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of apiCache.entries()) {
      if (now - value.timestamp > value.ttl) {
        apiCache.delete(key);
      }
    }
  }

  // Optimized POST method with caching and deduplication
  async post<T>(endpoint: string, data: any, options?: { 
    cache?: boolean; 
    ttl?: number; 
    skipCache?: boolean;
  }): Promise<T> {
    const cacheKey = `${endpoint}-${JSON.stringify(data)}`;
    
    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    // Check cache if enabled
    if (options?.cache !== false && !options?.skipCache) {
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // Cleanup expired cache entries
    this.cleanupCache();

    // Create new request
    const requestPromise = ApiService.post(endpoint, data)
      .then((response: T) => {
        // Cache successful responses
        if (options?.cache !== false) {
          this.setCachedData(cacheKey, response, options?.ttl);
        }
        this.pendingRequests.delete(cacheKey);
        return response;
      })
      .catch((error: Error) => {
        this.pendingRequests.delete(cacheKey);
        throw error;
      });

    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  // Clear all cache
  clearCache(): void {
    apiCache.clear();
  }

  // Clear specific cache entry
  clearCacheEntry(pattern: string): void {
    for (const key of apiCache.keys()) {
      if (key.includes(pattern)) {
        apiCache.delete(key);
      }
    }
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: apiCache.size,
      keys: Array.from(apiCache.keys())
    };
  }
}

// Debounced version for rapid successive calls
export const debouncedApiCall = debounce(
  (endpoint: string, data: any) => OptimizedApiService.getInstance().post(endpoint, data),
  300
);

export default OptimizedApiService.getInstance();

