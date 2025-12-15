"use client";

import type { RefObject } from "react";
import { useEffect, useState } from "react";

interface LazySectionOptions {
  rootMargin?: string;
  once?: boolean;
  delayMs?: number;
}

/**
 * Triggers data loading only when a section is visible (hoặc sau delay nếu cần prefetch).
 */
export function useLazySectionLoader<T extends Element>(
  ref: RefObject<T | null>,
  options: LazySectionOptions = {}
): boolean {
  const { rootMargin = "0px", once = true, delayMs } = options;
  const [shouldLoad, setShouldLoad] = useState(false);
  const element = ref.current;

  useEffect(() => {
    if (shouldLoad) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (typeof delayMs === "number") {
      timeoutId = setTimeout(() => {
        setShouldLoad(true);
      }, Math.max(0, delayMs));
    }

    if (!element || typeof window === "undefined") {
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          if (once) observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [element, rootMargin, once, delayMs, shouldLoad]);

  return shouldLoad;
}
