/**
 * Stacked homepage panels (`.stacked > section`) stay sticky in the viewport
 * while the next panel slides over them, so an IntersectionObserver on a
 * canvas inside them keeps reporting "visible" long after it's hidden. This
 * reports when the panel holding `el` is fully covered by the next one (the
 * next panel's top has reached the top of the viewport), so render loops can
 * pause instead of drawing frames nobody sees.
 *
 * Outside a stacked panel it never reports covered.
 */
export function watchCovered(el: HTMLElement, onChange: (covered: boolean) => void) {
  const panel = el.closest('.stacked > section');
  const next = panel?.nextElementSibling;
  if (!panel || !(next instanceof HTMLElement)) return () => {};
  // The root is shrunk to a thin strip at the top of the viewport: the next
  // panel intersects it exactly while it covers the top edge.
  const io = new IntersectionObserver(
    ([e]) => onChange(e.isIntersecting || e.boundingClientRect.top <= 0),
    { rootMargin: '0px 0px -98% 0px', threshold: 0 },
  );
  io.observe(next);
  return () => io.disconnect();
}
