/**
 * Run `fn` once the browser is idle (or after `timeout` ms), so 3D setup never
 * competes with first paint or a scroll in progress. Kept out of the three.js
 * modules so pages can import it without pulling three into their bundle.
 */
export function whenIdle(fn: () => void, timeout = 1200) {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout });
  else setTimeout(fn, 200);
}
