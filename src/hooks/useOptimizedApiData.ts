import { useState, useEffect, useMemo, useRef } from 'react';
import OptimizedApiService from '../lib/optimized-api-service';

interface UseOptimizedApiDataOptions {
  cache?: boolean;
  ttl?: number;
  skipCache?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

interface UseOptimizedApiDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

export function useOptimizedApiData<T>(
  url: string,
  fromDate: string,
  toDate: string,
  options: UseOptimizedApiDataOptions = {}
): UseOptimizedApiDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  const {
    cache = true,
    ttl = 5 * 60 * 1000, // 5 minutes
    skipCache = false,
    retryCount = 3,
    retryDelay = 1000
  } = options;

  // Create cache key
  const cacheKey = useMemo(() => `${url}-${fromDate}-${toDate}`, [url, fromDate, toDate]);

  // Extract endpoint from full URL
  const endpoint = useMemo(() => {
    return url
      .replace('/api/proxy', '')
      .replace('/api', '')
      .replace(/^\/+/, '');
  }, [url]);

  const fetchData = async (isRetry = false): Promise<void> => {
    try {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      const response = await OptimizedApiService.post<T>(
        endpoint,
        { fromDate, toDate },
        {
          cache,
          ttl,
          skipCache: isRetry ? true : skipCache // Skip cache on retry
        }
      );

      setData(response);
      retryCountRef.current = 0; // Reset retry count on success
    } catch (err: any) {
      const errorMessage = err?.message || 'Unknown error occurred';
      
      // Handle retry logic
      if (retryCountRef.current < retryCount && !err?.name === 'AbortError') {
        retryCountRef.current++;
        setTimeout(() => fetchData(true), retryDelay);
        return;
      }

      setError(errorMessage);
      retryCountRef.current = 0; // Reset retry count
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [cacheKey]);

  // Refetch function
  const refetch = async (): Promise<void> => {
    retryCountRef.current = 0;
    await fetchData();
  };

  // Clear cache function
  const clearCache = (): void => {
    OptimizedApiService.clearCacheEntry(cacheKey);
  };

  return {
    data,
    loading,
    error,
    refetch,
    clearCache
  };
}

// Hook for batch API calls
export function useBatchApiData<T>(
  endpoints: Array<{ url: string; fromDate: string; toDate: string }>,
  options: UseOptimizedApiDataOptions = {}
) {
  const results = endpoints.map(({ url, fromDate, toDate }) =>
    useOptimizedApiData<T>(url, fromDate, toDate, options)
  );

  const allLoading = results.some(result => result.loading);
  const allErrors = results.map(result => result.error).filter(Boolean);
  const allData = results.map(result => result.data);

  const refetchAll = async (): Promise<void> => {
    await Promise.all(results.map(result => result.refetch()));
  };

  const clearAllCache = (): void => {
    results.forEach(result => result.clearCache());
  };

  return {
    results,
    allLoading,
    allErrors,
    allData,
    refetchAll,
    clearAllCache
  };
}

