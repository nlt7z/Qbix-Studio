'use client';

import { createContext, useContext } from 'react';

/**
 * Whether a scene shows the real things in it (a house, a kitchen, an office)
 * as photographs (public/art) instead of its flat drawings. The business
 * homepage turns it on; the offer pages keep the drawings.
 */
export const Pictures = createContext(false);
export const usePictures = () => useContext(Pictures);
