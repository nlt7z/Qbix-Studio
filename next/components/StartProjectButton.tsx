'use client';

import { useContactModal } from '@/components/ContactModalProvider';

/**
 * The "Start a project" CTA. Opens the shared contact modal. Drop-in for the
 * styled buttons/links that used to scroll to #contact, usable inside server
 * components (the detail pages).
 */
export default function StartProjectButton({
  className = 'btn btn-primary btn-lg',
  label = 'Start a project',
}: {
  className?: string;
  label?: string;
}) {
  const { open } = useContactModal();
  return (
    <button type="button" className={className} onClick={open}>
      {label}
      <span className="arrow">→</span>
    </button>
  );
}
