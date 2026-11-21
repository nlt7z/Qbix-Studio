'use client';

import { createContext, useContext, type ReactNode } from 'react';

/**
 * Whether a scene shows the real things in it (a house, a kitchen, an office)
 * as photographs (public/art) instead of its flat drawings. The business
 * homepage turns it on, and since Nov 20, 2026 the offer pages do too.
 */
export const Pictures = createContext(false);
export const usePictures = () => useContext(Pictures);

/** Photographs on, for a server page that wraps a scene. */
export function PicturesOn({ children }: { children: ReactNode }) {
  return <Pictures.Provider value>{children}</Pictures.Provider>;
}
