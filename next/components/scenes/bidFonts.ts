import { Barlow_Condensed, WindSong } from 'next/font/google';

/**
 * AI Bidding's own two faces (the game's HUD and its neon script), only for
 * its drawn screen (BidScreen.tsx). Not preloaded: the screen sits far down
 * the page and its words wait for document.fonts before they're measured.
 */
export const hud = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-hud',
  display: 'swap',
  preload: false,
});

export const script = WindSong({
  subsets: ['latin'],
  weight: '500',
  variable: '--font-script',
  display: 'swap',
  preload: false,
});
