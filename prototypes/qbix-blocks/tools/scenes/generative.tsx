/**
 * Wraps the site's components/scene/Generative.tsx in the library's bundle.
 *
 * Contours and Ridges are the site's, untouched. Halftone reads its photograph
 * back off a canvas (getImageData), which a page opened from disk (file://)
 * is not allowed to do with a file next to it: the canvas is tainted. So the
 * one picture it is given (the house, for the listing's In Escrow post) is
 * handed over as a data: URL, inlined at build time: same picture, same dots.
 */
import { createElement } from 'react';
import * as real from 'qm-real/components/scene/Generative';
import house from 'qm-public/art/house.webp';

export const Contours = real.Contours;
export const Ridges = real.Ridges;

const INLINE: Record<string, string> = { 'house.webp': house };

export function Halftone(p: Parameters<typeof real.Halftone>[0]) {
  const name = p.src.split('/').pop() ?? '';
  return createElement(real.Halftone, { ...p, src: INLINE[name] ?? p.src });
}
