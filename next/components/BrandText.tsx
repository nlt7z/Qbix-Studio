import { Fragment, type ReactNode } from 'react';

/**
 * Renders text with every "Qbix" / "qbix" occurrence styled with a lime Q.
 * Use it whenever brand-bearing copy comes from a string source (data.ts, props, etc.).
 */
export default function BrandText({ children }: { children: string }) {
  const parts: ReactNode[] = [];
  const re = /qbix/gi;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = re.exec(children)) !== null) {
    if (match.index > last) parts.push(<Fragment key={`t-${i}`}>{children.slice(last, match.index)}</Fragment>);
    // preserve any non-Q casing the author used (e.g. "QBIX" → keep BIX uppercase)
    const rest = match[0].slice(1);
    parts.push(
      <Fragment key={`b-${i}`}>
        <span className="brand-q">Q</span>{rest}
      </Fragment>,
    );
    last = match.index + match[0].length;
    i += 1;
  }
  if (last < children.length) parts.push(<Fragment key="tail">{children.slice(last)}</Fragment>);
  return <>{parts}</>;
}
