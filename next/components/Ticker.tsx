import { tickerItems } from '@/lib/data';

export default function Ticker() {
  const trackHtml = tickerItems.map((t) => `<span>${t}</span>`).join('');
  // duplicate for seamless loop
  const html = trackHtml + trackHtml;

  return (
    <div className="ticker">
      <div className="ticker-track" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
