'use client';

import { useContactModal } from '@/components/ContactModalProvider';
import SplitText from '@/components/SplitText';

/**
 * The "Start a project" CTA. Opens the shared contact modal. Drop-in for the
 * styled buttons/links that used to scroll to #contact, usable inside server
 * components (the detail pages).
 */
export default function StartProjectButton({
  className = 'btn btn-primary btn-lg split-cta',
  label = 'Start a project',
}: {
  className?: string;
  label?: string;
}) {
  const { open } = useContactModal();
  return (
    <button type="button" className={className} onClick={open}>
      <SplitText text={label} arrow />
    </button>
  );
}
