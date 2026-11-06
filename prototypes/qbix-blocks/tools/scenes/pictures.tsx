/**
 * Stands in for the site's components/scene/pictures.tsx in the library's bundle.
 *
 * The site: a context says whether a scene shows its real things (a house, a
 * kitchen, an office) as photographs; the business homepage turns it on, the
 * offer pages keep the drawings. ListingStory and PracticeStory switch it on
 * themselves, with `<Pictures.Provider value>` inside the component.
 *
 * Here `Pictures.Provider` still does exactly that, unless the demo page forces
 * the choice (the Photographs / Drawings toggle): `Force` wraps the scene and
 * wins over whatever a Provider inside it asks for. With no `Force` value, it
 * behaves as the site's.
 */
import { createContext, createElement, useContext, type ReactNode } from 'react';

const Ctx = createContext(false);

/** The page's choice, over the scene's own: true photographs, false drawings, undefined as the site has it. */
export const Force = createContext<boolean | undefined>(undefined);

export const Pictures = {
  Provider({ value, children }: { value: boolean; children?: ReactNode }) {
    const forced = useContext(Force);
    return createElement(Ctx.Provider, { value: forced ?? value }, children);
  },
};

export const usePictures = () => useContext(Ctx);
