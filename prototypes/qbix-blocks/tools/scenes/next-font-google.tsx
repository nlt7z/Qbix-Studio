/** next/font/google stand-in: each face gives a class that sets its CSS variable; the page loads the face itself (Google Fonts). */
const face = (variable: string) => () => ({ className: variable, variable, style: {} });
export const Barlow_Condensed = face('qm-font-hud');
export const WindSong = face('qm-font-script');
