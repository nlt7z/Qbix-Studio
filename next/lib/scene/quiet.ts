/**
 * Whether the page is being scrolled right now: the generative drawings hold
 * still while it is, so the scroll keeps every frame (they pick up again once
 * it stops).
 */
let last = -1e9;
let listening = false;

export function scrolling() {
  if (!listening && typeof window !== 'undefined') {
    listening = true;
    window.addEventListener('scroll', () => (last = performance.now()), { passive: true });
  }
  return performance.now() - last < 180;
}
