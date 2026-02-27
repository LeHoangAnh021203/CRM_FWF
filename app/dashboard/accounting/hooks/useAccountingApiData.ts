import { useEffect, useState } from "react";
import { ApiService } from "@/app/lib/api-service";

const API_BASE_URL = "/api/proxy";

const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export function useAccountingApiData<T>(
  url: string,
  fromDate: string,
  toDate: string,
  priority = 0
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedFromDate = useDebounce(fromDate, 300);
  const debouncedToDate = useDebounce(toDate, 300);

  useEffect(() => {
    let isActive = true;
    const delay = priority * 100;
    const timeoutId = setTimeout(() => {
      setLoading(true);
      setError(null);

      const endpoint = url
        .replace(API_BASE_URL, "")
        .replace("/api", "")
        .replace(/^\/+/, "");

      ApiService.post(endpoint, {
        fromDate: debouncedFromDate,
        toDate: debouncedToDate,
      })
        .then((resp: unknown) => {
          if (!isActive) return;
          setData(resp as T);
          setLoading(false);
        })
        .catch((err: Error) => {
          if (!isActive) return;
          setError(err.message);
          setLoading(false);
        });
    }, delay);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [url, debouncedFromDate, debouncedToDate, priority]);

  return { data, loading, error };
}
