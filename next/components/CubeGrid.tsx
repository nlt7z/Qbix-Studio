'use client';

import GlassCube from '@/components/GlassCube';

/**
 * Hero right column: the proprietary cube totem. Capabilities are covered
 * by the "What we do" section below, so the hero owns positioning only.
 */
export default function CubeGrid() {
  return (
    <div className="hero-totem">
      <GlassCube label="01" />
    </div>
  );
}
