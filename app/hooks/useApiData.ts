import { useEffect, useState } from "react";
import { ApiService } from "../lib/api-service";

const API_BASE_URL = "/api/proxy";

export function useApiData<T>(
  url: string,
  fromDate: string,
  toDate: string,
  extraBody?: Record<string, unknown>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    setError(null);

    const endpoint = url
      .replace(API_BASE_URL, "")
      .replace("/api", "")
      .replace(/^\/+/, "");

    ApiService.post(endpoint, { fromDate, toDate, ...(extraBody || {}) })
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

    return () => {
      isActive = false;
    };
  }, [url, fromDate, toDate, extraBody]);

  return { data, loading, error };
}

export function useApiGetData<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    setError(null);

    const endpoint = url
      .replace(API_BASE_URL, "")
      .replace("/api", "")
      .replace(/^\/+/, "");

    ApiService.get(endpoint)
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

    return () => {
      isActive = false;
    };
  }, [url]);

  return { data, loading, error };
}
