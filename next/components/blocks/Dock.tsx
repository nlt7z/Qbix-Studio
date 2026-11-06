'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Btn from '@/components/blocks/Btn';

/**
 * Start a brief, hung at the bottom centre of every page (Wise keeps its "Get in touch" so), the one Start a
 * brief on a page. It takes the tone of whatever is under it, to the pixel: one copy of it sits in each block
 * (fixed to the same spot, so the block's own clip shows only the part over that block), one in the wipe's
 * cover (the white cut back by the 45° edge), and one under all of them for the gaps between blocks. Where an
 * edge crosses it, it is dark on one side of the edge and white on the other. Not on /start, which is the
 * brief; out of the way while the menu sheet is open (blocks.css: html.menu-open .dock-copy).
 */
type Host = { el: HTMLElement; tone: string; cover: boolean };

// only the copy under everything is in the tab order and read out; it comes to the front when focused
function Copy({ tone, base = false }: { tone: string; base?: boolean }) {
  return (
    <div className={`dock-copy${base ? ' dock-base' : ''}`} data-tone={tone} aria-hidden={base ? undefined : true}>
      <Btn href="/start" tabIndex={base ? undefined : -1}>
        Start a brief
      </Btn>
    </div>
  );
}

export default function Dock() {
  const pathname = usePathname();
  const off = pathname === '/start';
  const [hosts, setHosts] = useState<Host[]>([]);

  useEffect(() => {
    if (off) {
      setHosts([]);
      return;
    }
    const root = document.documentElement;
    const t = setTimeout(() => root.classList.add('dock-on'), 400);
    const list: Host[] = [];
    document.querySelectorAll<HTMLElement>('.blocks').forEach((b) => list.push({ el: b, tone: 'base', cover: false }));
    document.querySelectorAll<HTMLElement>('.blocks > .block').forEach((b) => {
      const tone = b.dataset.tone || 'white';
      list.push({ el: b, tone, cover: tone !== 'white' });
    });
    setHosts(list);
    return () => {
      clearTimeout(t);
      root.classList.remove('dock-on');
    };
  }, [off, pathname]);

  if (off) return null;
  return (
    <>
      {hosts.map((h, i) =>
        createPortal(
          h.tone === 'base' ? (
            <Copy tone="white" base />
          ) : (
            <>
              <Copy tone={h.tone} />
              {/* the wipe's cover: the white before a dark block, cut back by the scroll (Runtime sets --wc) */}
              {h.cover && (
                <div className="sw-cover" aria-hidden="true">
                  <Copy tone="white" />
                </div>
              )}
            </>
          ),
          h.el,
          `dock-${i}`,
        ),
      )}
    </>
  );
}
