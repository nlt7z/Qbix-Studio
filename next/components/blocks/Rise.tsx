import { Children, cloneElement, isValidElement, type CSSProperties, type ElementType, type ReactElement, type ReactNode } from 'react';

/**
 * A headline whose words rise out of their sleeves as it comes into view (the runtime sets data-in).
 * The words are split here, while rendering, so nothing rewrites text React owns. Nested spans (a .mark,
 * a .line) keep their place; an element with the class `keep` (a picture set in the line) is left whole.
 * With `fit`, the lines (.line spans) are set to the container's width by the runtime, one XL size a page.
 */
export function Rise({
  as: Tag = 'h2',
  className,
  style,
  delay,
  fit,
  id,
  hidden,
  aud,
  wave,
  children,
}: {
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** ms before the first word */
  delay?: number;
  /** max and min in px (max × --u), ratio: the share of the column the longest line takes */
  fit?: { max?: number; min?: number; ratio?: number };
  id?: string;
  hidden?: boolean;
  /** the homepage audience it belongs to (data-aud): its words rise again when the audience switches to it */
  aud?: 'ai' | 'business';
  /** each word's letters flip like a button's when the word is pointed at (blocks.css .wave; the runtime
      puts the split letters back where the font's kerning sets them) */
  wave?: boolean;
  children: ReactNode;
}) {
  let i = 0;
  const letters = (word: string) =>
    Array.from(word).map((c, j) => (
      <span className="lt" key={j} style={{ '--d': j } as CSSProperties}>
        <span>{c}</span>
        <span aria-hidden="true">{c}</span>
      </span>
    ));
  const split = (node: ReactNode): ReactNode =>
    Children.map(node, (n) => {
      if (typeof n === 'string' || typeof n === 'number') {
        return String(n)
          .split(/(\s+)/)
          .map((p, k) =>
            !p ? null : /^\s+$/.test(p) ? (
              ' '
            ) : (
              <span className="w" key={k}>
                <i style={{ '--i': i++ } as CSSProperties}>{wave ? letters(p) : p}</i>
              </span>
            ),
          );
      }
      if (isValidElement(n)) {
        const el = n as ReactElement<{ className?: string; children?: ReactNode }>;
        if (el.type === 'br' || (el.props.className ?? '').split(' ').includes('keep')) return el;
        return cloneElement(el, undefined, split(el.props.children));
      }
      return n;
    });
  const s = { ...(delay ? { '--rd': `${delay}ms` } : null), ...style } as CSSProperties;
  return (
    <Tag
      id={id}
      className={wave ? `${className ?? ''} wave`.trim() : className}
      aria-label={wave ? text(children) : undefined}
      style={s}
      hidden={hidden}
      data-aud={aud}
      data-rise=""
      data-fit={fit ? (fit.ratio ?? '') : undefined}
      data-max={fit?.max}
      data-min={fit?.min}
    >
      {split(children)}
    </Tag>
  );
}

/** A headline's words as plain text (its name, when its letters are split twice over). */
function text(node: ReactNode): string {
  return Children.toArray(node)
    .map((n) => (typeof n === 'string' || typeof n === 'number' ? String(n) : isValidElement(n) ? text((n as ReactElement<{ children?: ReactNode }>).props.children) : ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** One line of a fitted headline. */
export const Line = ({ children }: { children: ReactNode }) => <span className="line">{children}</span>;

/** The one point in a headline: plain ink on white, a lime word on the dark (block.css .mark). */
export const Mark = ({ children }: { children: ReactNode }) => (
  <span className="mark" data-wipe="">
    {children}
  </span>
);
