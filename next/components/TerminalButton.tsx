import Link from 'next/link';

type Props = {
  href: string;
  label: string;
  icon?: string;
  ghost?: boolean;
  brackets?: boolean;
};

export default function TerminalButton({ href, label, icon = '→', ghost = false, brackets = true }: Props) {
  const isExternal = href.startsWith('mailto:') || href.startsWith('http');
  const className = `t-btn ${ghost ? 'ghost' : ''}`.trim();

  const inner = (
    <>
      {brackets && !ghost && <span className="bracket-l">&gt;</span>}
      <span>{label}</span>
      <span className="arrow">{icon}</span>
      {brackets && !ghost && <span className="bracket-r">&lt;</span>}
    </>
  );

  if (isExternal) {
    return (
      <a href={href} className={className}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
