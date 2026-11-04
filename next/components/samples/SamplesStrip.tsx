import Link from 'next/link';
import SplitText from '@/components/SplitText';
import SampleCard from './SampleCard';
import { SAMPLES_LEDE, STRIP_SAMPLES } from '@/lib/samples';
import '@/app/samples.css';

/** Six samples on /business, one from each group, right after the hero; all of them are on /samples. */
export default function SamplesStrip() {
  return (
    <section id="samples" className="smp-strip" data-nav-theme="dark" data-tone="dark" aria-labelledby="smp-strip-title">
      <div className="container">
        <div className="smp-strip-head">
          <h2 id="smp-strip-title" className="smp-strip-title">Samples</h2>
          <p className="smp-lede">{SAMPLES_LEDE}</p>
        </div>
        <ul className="smp-grid smp-grid--strip">
          {STRIP_SAMPLES.map((s) => (
            <li key={s.slug}>
              <SampleCard sample={s} />
            </li>
          ))}
        </ul>
        <div className="smp-strip-foot">
          <Link href="/samples" className="btn btn-white btn-lg split-cta cut">
            <SplitText text="See all samples" arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
