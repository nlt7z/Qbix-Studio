import type { Metadata } from 'next';
import Link from 'next/link';
import SplitText from '@/components/SplitText';
import NotFoundBlocks from '@/components/NotFoundBlocks';
import '@/app/not-found.css';

export const metadata: Metadata = { title: 'Not found' };

/** Any address that isn't a page: one screen, its 404 as blocks on the floor that you can throw. */
export default function NotFound() {
  return (
    <main className="nf" data-nav-theme="dark" data-tone="dark">
      <NotFoundBlocks className="nf-blocks" />
      <div className="container nf-copy">
        <h1 className="nf-title">This page isn&rsquo;t built yet.</h1>
        <p className="nf-lede">Nothing lives at this address. Pick up a number and throw it, or go back home.</p>
        <div className="nf-acts">
          <Link href="/" className="btn btn-white btn-lg split-cta cut">
            <SplitText text="Back to home" arrow />
          </Link>
          <Link href="/samples" className="nf-link">
            See our samples <span aria-hidden>↗︎</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
