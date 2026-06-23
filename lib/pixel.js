/**
 * Safe Meta (Facebook) Pixel + TikTok Pixel event helper — no-ops when not loaded.
 * Event names follow the standard events shared by both platforms
 * (Lead, CompleteRegistration, ViewContent, AddToCart, InitiateCheckout, Contact).
 */
export function trackPixel(event, params = {}) {
  if (typeof window === 'undefined') return
  try {
    if (typeof window.fbq === 'function') window.fbq('track', event, params)
  } catch {}
  try {
    if (window.ttq && typeof window.ttq.track === 'function') window.ttq.track(event, params)
  } catch {}
}
