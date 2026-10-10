import SplitText from '@/components/SplitText';
import { CONTACT_EMAIL } from '@/lib/data';

/**
 * "Start" button for a fixed-price offer. Goes straight to the Stripe Payment
 * Link when one is set in CHECKOUT (lib/data.ts); until then it opens an email
 * with the offer named in the subject, so the page is never a dead end.
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
