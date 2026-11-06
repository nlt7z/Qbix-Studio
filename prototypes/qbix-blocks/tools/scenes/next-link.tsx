/** next/link, stubbed for the library's bundle: a plain anchor. */
import { createElement, type AnchorHTMLAttributes } from 'react';

export default function Link({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return createElement('a', { href, ...rest });
}
