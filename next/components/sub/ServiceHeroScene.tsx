'use client';

import ServiceScene from '@/components/ServiceScene';
import { ServicePattern, SCENES } from '@/components/sections/WhatWeDo';

/** The service's card scene, set large as the detail page's hero visual. */
export default function ServiceHeroScene({ slug }: { slug: string }) {
  const variant = SCENES[slug];
  return (
    <div className="svc-pattern sp-scene" aria-hidden>
      {variant ? <ServiceScene variant={variant} fallback={<ServicePattern slug={slug} />} /> : <ServicePattern slug={slug} />}
    </div>
  );
}
