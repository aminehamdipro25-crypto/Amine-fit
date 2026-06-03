/**
 * Safe GA4 event helper — no-ops when gtag is not loaded.
 */
export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined') return
  if (typeof window.gtag !== 'function') return
  window.gtag('event', name, params)
}
