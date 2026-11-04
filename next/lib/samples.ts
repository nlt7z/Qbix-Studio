/**
 * The samples shown on /samples (six of them on /business, the real estate ones on
 * /listing-kit), in Sera's order (Nov 3).
 * Each sample is static, in public/samples/<slug>/: its page is /samples/<slug>, thumb.webp its
 * cover at 540x960 and preview.mp4 the first seconds of its video, small, for the cards.
 * The name, the town and the line are the sample page's own words; nothing is added.
 */
export type Sample = { slug: string; name: string; town: string; line: string };
export type SampleGroup = { title: string; samples: Sample[] };

export const SAMPLE_GROUPS: SampleGroup[] = [
  {
    title: 'Real estate',
    samples: [
      { slug: 'justin-allen', name: 'Justin Allen', town: 'Gig Harbor', line: 'A listing, cut for Reels' },
      { slug: 'chris-conroy', name: 'Chris Conroy, Ensemble', town: 'Gig Harbor', line: 'Waterfront on Lay Inlet' },
    ],
  },
  {
    title: 'Remodels and custom homes',
    samples: [
      { slug: 'nip-tuck', name: 'Nip Tuck Remodeling', town: 'Woodinville', line: 'On the 2026 Remodeled Homes Tour' },
      { slug: 'kim-west-designs', name: 'West Designs', town: 'Sacramento', line: 'A Zellige master bath' },
      { slug: 'ko-construction', name: 'KO Construction', town: 'Lake Tapps', line: 'A primary suite on the water' },
      { slug: 'marin-kitchen-works', name: 'Marin Kitchen Works', town: 'Novato', line: 'Bel Marin Breeze, before and after' },
      { slug: 'edge-homes', name: 'Edge Homes NW', town: 'Spokane', line: 'The home Spokane voted for' },
      { slug: 'epic-design-build', name: 'Epic Design Build', town: 'Altadena', line: 'Custom homes, from drawing to design' },
    ],
  },
  {
    title: 'Wedding venues',
    samples: [
      { slug: 'bridal-veil-lakes', name: 'Bridal Veil Lakes', town: 'Columbia River Gorge', line: 'A spring-fed lake in old-growth forest' },
      { slug: 'mt-view-orchards', name: 'Mt. View Orchards Weddings', town: 'Mt. Hood', line: 'An orchard wedding, now booking 2027' },
      { slug: 'rustic-meadows', name: 'Rustic Meadows', town: 'Cheney', line: 'Married in the meadow' },
    ],
  },
  {
    title: 'Christmas tree farms',
    samples: [
      { slug: 'hemphill-tree-farm', name: 'Hemphill Farms', town: 'Oregon City', line: 'Opening day, Friday, November 27' },
      { slug: 'alpine-meadows-tree-farm', name: 'Alpine Meadows Christmas Tree Farm', town: 'Deming', line: 'Opening Weekend, Nov 27 and 28' },
      { slug: 'mcburney-tree-farm', name: 'McBurney Tree Farm', town: 'Grass Valley', line: 'Reserve your tree now' },
      { slug: 'shining-star-tree-farm', name: 'Shining Star Tree Farm + Venue', town: 'Eatonville', line: 'Choose and Cut, November 27 to December 6' },
    ],
  },
  {
    title: 'Estate sales',
    samples: [
      { slug: 'family-loyalty', name: 'Family Loyalty Estate Sales', town: 'Winston', line: 'The Lookingglass Estate sale' },
      { slug: 'teresas-estate-sales', name: 'Teresa’s Estate Sales', town: 'Menifee', line: 'The Pickers Delight sale' },
    ],
  },
  {
    title: 'Auctions',
    samples: [
      { slug: 'leftover-treasures', name: 'Leftover Treasures', town: 'Fresno', line: 'Three auctions in one week' },
    ],
  },
];

/** The strip on /business: one sample from each group. */
const STRIP_SLUGS = ['justin-allen', 'nip-tuck', 'bridal-veil-lakes', 'hemphill-tree-farm', 'family-loyalty', 'leftover-treasures'];
const bySlug = new Map(SAMPLE_GROUPS.flatMap((g) => g.samples).map((s) => [s.slug, s]));
export const STRIP_SAMPLES: Sample[] = STRIP_SLUGS.map((slug) => bySlug.get(slug)!);

/** On /listing-kit: the ones made for agents. */
export const LISTING_SAMPLES: Sample[] = SAMPLE_GROUPS.find((g) => g.title === 'Real estate')!.samples;

/** The honest line under the title, on /samples and on the strip. */
export const SAMPLES_LEDE = 'Short videos and posters we made for local businesses.';
