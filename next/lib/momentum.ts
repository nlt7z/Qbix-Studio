/**
 * The page's scroll momentum, shared by everything that reacts to it.
 * `vel` is the sprung, normalised scroll velocity in [-1, 1] (positive while
 * scrolling down). It is written by components/Momentum.tsx and read by the
 * canvases on their own frames, so reading it costs nothing.
 */
export const momentum = { vel: 0 };
