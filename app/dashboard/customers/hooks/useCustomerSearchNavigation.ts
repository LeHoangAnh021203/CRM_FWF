import { useEffect } from "react";
import { SEARCH_TARGETS, normalize } from "@/app/lib/search-targets";

const normalizeKey = (s: string) => normalize(s).replace(/\s+/g, "");

export function useCustomerSearchNavigation() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("q");
    const hash = window.location.hash.replace("#", "");

    const scrollToRefWithRetry = (
      refKey: string,
      attempts = 25,
      delayMs = 120
    ) => {
      const tryOnce = (left: number) => {
        const el = document.querySelector(
          `[data-search-ref='${refKey}']`
        ) as HTMLElement | null;
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          el.classList.add("ring-2", "ring-[#41d1d9]", "rounded-lg");
          window.setTimeout(
            () => el.classList.remove("ring-2", "ring-[#41d1d9]", "rounded-lg"),
            1500
          );
          return;
        }
        if (left > 0) window.setTimeout(() => tryOnce(left - 1), delayMs);
      };
      tryOnce(attempts);
    };

    if (q) {
      window.dispatchEvent(
        new CustomEvent("global-search", { detail: { query: q } })
      );
      url.searchParams.delete("q");
      window.history.replaceState({}, "", url.toString());
    } else if (hash) {
      scrollToRefWithRetry(hash);
    }

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { query?: string };
      const query = String(detail?.query || "");
      const map = SEARCH_TARGETS.filter((t) => t.route === "customers").map(
        (t) => ({
          keys: [
            normalizeKey(t.label),
            ...t.keywords.map((k) => normalizeKey(k)),
          ],
          refKey: t.refKey,
        })
      );
      const found = map.find((m) =>
        m.keys.some((k) => normalizeKey(query).includes(k))
      );
      if (!found) return;
      scrollToRefWithRetry(found.refKey);
    };

    const jumpHandler = (ev: Event) => {
      const refKey = (ev as CustomEvent).detail?.refKey as string | undefined;
      if (!refKey) return;
      scrollToRefWithRetry(refKey);
    };

    window.addEventListener("global-search", handler as EventListener);
    window.addEventListener("jump-to-ref", jumpHandler as EventListener);

    return () => {
      window.removeEventListener("global-search", handler as EventListener);
      window.removeEventListener("jump-to-ref", jumpHandler as EventListener);
    };
  }, []);
}
