'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ContactModal from '@/components/ContactModal';

type ContactModalContextValue = {
  open: () => void;
  close: () => void;
};

const ContactModalContext = createContext<ContactModalContextValue | null>(null);

/**
 * Holds the single shared "Start a project" contact modal. Mounted once at the
 * root so every CTA across the site opens the same form instead of scrolling to
 * #contact or firing a mailto link.
 */
export function ContactModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <ContactModalContext.Provider value={value}>
      {children}
      <ContactModal open={isOpen} onClose={close} />
    </ContactModalContext.Provider>
  );
}

export function useContactModal() {
  const ctx = useContext(ContactModalContext);
  if (!ctx) {
    throw new Error('useContactModal must be used within a ContactModalProvider');
  }
  return ctx;
}
