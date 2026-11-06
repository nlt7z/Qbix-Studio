import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Btn from '@/components/blocks/Btn';
import Footer from '@/components/blocks/Footer';
import { Rise } from '@/components/blocks/Rise';
import NotFoundBlocks from '@/components/NotFoundBlocks';
import './not-found-page.css';

export const metadata: Metadata = { title: 'Not found' };

/** Any address that isn't a page: a white block with its 404 as blocks on the floor that you can throw. */
export default function NotFound() {
  return (
    <main className="blocks pg-404" data-stack>
      <section className="block block--flat nf" data-tone="white">
        <NotFoundBlocks className="nf-blocks" />
        <div className="in nf-in">
          <Rise as="h1" className="h1 nf-h">
            This page isn’t built yet.
          </Rise>
          <p className="lede" data-up="">
            Nothing lives at this address. Pick up a number and throw it, or go back home.
          </p>
          <div className="acts" data-up="" style={{ '--ud': '120ms' } as CSSProperties}>
            <Btn href="/">Back to home</Btn>
            <Btn href="/samples" variant="2">
              See our samples
            </Btn>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
