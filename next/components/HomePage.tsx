import Story from '@/components/story/Story';
import Colophon from '@/components/Colophon';
import { AudienceProvider, type Audience } from '@/components/Audience';
import '@/app/story.css';

/**
 * The homepage, in one of its two modes: / talks to founders and product
 * teams, /business to local businesses (see components/Audience.tsx). Both
 * are one story: chapters with their own words, one 3D object behind them
 * (components/story/Story.tsx). The story's last chapter is the sign-off, so
 * the footer below it is just the sitemap.
 */
export default function HomePage({ audience }: { audience: Audience }) {
  return (
    <AudienceProvider initial={audience}>
      <Story />
      <Colophon bare />
    </AudienceProvider>
  );
}
