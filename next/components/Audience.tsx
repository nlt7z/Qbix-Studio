'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

/**
 * Who the homepage is talking to. "ai" (the default, at /) is founders and
 * product teams: studio services and Qbix Labs. "business" (at /business) is
 * local businesses: the two fixed-price kits. Both URLs render the same page
 * server-side in their own mode, so a shared or reloaded link never flashes
 * the other one; the switch in the hero swaps the copy in place and moves the
 * URL with history.replaceState (Next keeps usePathname in sync), so nothing
 * remounts and the 3D keeps running.
 */
export type Audience = 'ai' | 'business';

export const AUDIENCE_PATH: Record<Audience, string> = { ai: '/', business: '/business' };

const TITLES: Record<Audience, string> = {
  ai: 'Qbix — AI-native product design & software · Seattle, WA',
  business: 'Qbix for local businesses: listing kits and practice websites',
};

const Ctx = createContext<{ audience: Audience; setAudience: (a: Audience) => void }>({
  audience: 'ai',
  setAudience: () => {},
});

export function AudienceProvider({ initial, children }: { initial: Audience; children: ReactNode }) {
  const [audience, set] = useState<Audience>(initial);
  const setAudience = useCallback((a: Audience) => {
    set(a);
    const path = AUDIENCE_PATH[a];
    if (window.location.pathname !== path) window.history.replaceState(null, '', path);
    document.title = TITLES[a];
  }, []);
  return <Ctx.Provider value={{ audience, setAudience }}>{children}</Ctx.Provider>;
}

export const useAudience = () => useContext(Ctx);
