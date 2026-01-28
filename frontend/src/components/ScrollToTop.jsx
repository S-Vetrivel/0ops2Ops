import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Smoothly scrolls to top on route change.
 *
 * Works on:
 * - pathname changes (e.g. /shop -> /shop/1)
 * - search changes (e.g. ?q=... )
 * - navigation key changes (location.key) which normally updates on each navigation
 *
 * If you need to force a scroll even when the URL and key do not change,
 * pass a unique value in navigate's state (see example below).
 */
export default function ScrollToTop({ smooth = true }) {
  const location = useLocation();

  // optional shortcut to read a custom state value (useful when navigating to same URL)
  const forcedScrollKey = location.state && location.state.__scrollKey;

  useEffect(() => {
    // small timeout lets the new route render (images/layout shifts) before scrolling
    const t = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.scrollTo({
          top: 0,
          behavior: smooth ? "smooth" : "auto",
        });
      }
    }, 40);

    return () => clearTimeout(t);
  }, [
    location.key,
    location.pathname,
    location.search,
    forcedScrollKey,
    smooth,
  ]);

  return null;
}
