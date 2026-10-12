'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * prefers-reduced-motion, but `false` until the component has mounted. The
 * server can't know the preference, so branching on it during the first
 * render would make the client's markup differ from the server's (a
 * hydration error); this switches to the reduced branch right after mount.
 */
export function useReducedMotionSafe() {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && !!reduced;
}
