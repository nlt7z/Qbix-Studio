/** How long (in screens) a sub-page's pinned tour holds its last form before the section scrolls on. */
export const STAGE_TAIL = 0.3;

/**
 * Where a sub-page wants the story's object: an empty box in the layout (sized
 * like a figure), inside a section marked as a chapter (`data-chapter`,
 * `data-forms`, `data-tone`). The page's one stage (BlockStage) fits the
 * object into it, follows it as it scrolls, and plays the section's forms
 * with the scroll.
 */
export default function StageBox({ label, className = 'block-figure' }: { label: string; className?: string }) {
  return <div className={className} data-stage-box role="img" aria-label={label} />;
}
