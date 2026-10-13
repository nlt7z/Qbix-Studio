import SplitText from '@/components/SplitText';
import { CONTACT_EMAIL } from '@/lib/data';

/**
 * "Start" button for a fixed-price offer. Goes straight to the Stripe Payment
 * Link in CHECKOUT (lib/data.ts), in the same tab; if a link is ever empty it
 * opens an email with the offer named in the subject, so it's never a dead end.
 */
export default function CheckoutButton({
  href,
  offer,
  label,
  className = '',
}: {
  href: string;
  offer: string;
  label: string;
  className?: string;
}) {
  const url = href || `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Start: ${offer}`)}`;
  return (
    <a className={`btn btn-lg split-cta offer-cta ${className}`} href={url}>
      <SplitText text={label} arrow />
    </a>
  );
}

/** The one muted line under every pay button. */
export function CheckoutNote({ className = '' }: { className?: string }) {
  return (
    <p className={`checkout-note ${className}`}>
      Secure checkout through Stripe. Questions first? Email{' '}
      <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
    </p>
  );
}
