export type RequirementGroup = {
  id: string
  title: string
  items: string[]
}

export const technicalRequirementGroups: RequirementGroup[] = [
  {
    id: 'goals',
    title: 'Site goals & conversion rules',
    items: [
      'Primary goal: drive ticket sales and streaming rentals — CTA must be visible before scroll on every device and every page.',
      'Secondary goal: serve press and industry — journalists must reach press kit, stills, quotes, and contact within two clicks.',
      'Tertiary goal: build the audience list via newsletter signups.',
      'Critical test: a visitor must find a ticket or streaming link within five seconds of landing.',
      'Get Tickets is live only during the theatrical release window; hide when theatrical run ends.',
    ],
  },
  {
    id: 'home',
    title: 'Home page',
    items: [
      'Full-bleed cinematic photo still or 10–40 second video loop in hero.',
      'CTAs: Trailer, Request a Screening newsletter modal, Watch Now, Get Tickets (when theatrical).',
      'Request a Screening modal fields: Email, Country, State, Region, City.',
      'Below fold: film logline and festival laurels.',
      'Remove home-page stats row (runtime, Rotten Tomatoes, festivals, awards).',
      'Press quotes displayed at the bottom of the home page.',
      'Trailer section on the same long page — accessible via nav anchor or scroll.',
    ],
  },
  {
    id: 'trailer',
    title: 'Trailer',
    items: [
      'YouTube trailer source: https://www.youtube.com/watch?v=Joux-zYHEuY',
      'Trailer loops on the home page (muted autoplay).',
      'On click: smooth fade to black overlay, autoplay in expanded modal.',
      'Custom minimal player UI (Plyr): play, scrub bar, fullscreen — no default YouTube chrome.',
      'Close control: × top right. Reference: sandboxfilms.org/films/fire-of-love.',
      'Trailer nav link scrolls to /#trailer on the home page.',
    ],
  },
  {
    id: 'tickets',
    title: 'Get tickets & screenings',
    items: [
      'Primary conversion page — city-by-city listings sorted by date.',
      'Filter by city and state.',
      'Coming Soon flags for upcoming markets.',
      'Buy Tickets links directly to each theater’s ticketing platform.',
      'Ticketing powered by Powster or Assemble — decision pending.',
      'Manual listings alternative: reference ourherobalthazar.com.',
      'Page may live on-site or as external URL depending on integration choice.',
      'References: blueheron.film, thelovethatremains.film, hokum.film, andreisanidiot.film/tickets.',
    ],
  },
  {
    id: 'press',
    title: 'Press kit',
    items: [
      'Two-click rule: press kit, stills, quotes, and contact reachable from any page.',
      'Synopsis with director, writers, produced by, cinematography, IMDb link.',
      'Downloadable press kit PDF.',
      'Production stills as a clickable gallery with lightbox.',
      'Poster displayed and downloadable as a single asset.',
      '3–5 press pull quotes with publication and reviewer.',
      '5 festival laurel images (TBC).',
      'Press contact: Anne Takahashi — anne@takapr.com.',
      'Reference: janusfilms.com/films/2307.',
    ],
  },
  {
    id: 'host-screening',
    title: 'Host a screening',
    items: [
      'Form submissions to bookings@crowsarewhite.com.',
      'Required: first name, last name, email, organization name, organization type, city, state, expected audience size.',
      'Organization type dropdown: College/University, Buddhist or Meditation Center, Interfaith or Religious Organization, Cultural Institution, Community Cinema, Other.',
      'Audience size dropdown: Under 25, 25–50, 50–100, 100–250, 250+.',
      'Optional: preferred date range (open text), how did you hear about the film, anything else (3 lines max).',
      'Reference: ourherobalthazar.com.',
    ],
  },
  {
    id: 'merchandise',
    title: 'Merchandise & Shopify',
    items: [
      'Shop powered natively by Shopify — collection page styled to match film site.',
      'Phase 1: print-on-demand via Printful or Printify — no upfront inventory.',
      'Products TBD by client; developer configures Shopify product pages and collection.',
      'Cart icon in nav with item count; Shopify checkout flow.',
      'Merchandise expected ready in ~1 month — shop must be launch-ready.',
      'Abandoned cart emails via Shopify Email or Klaviyo.',
      'Affiliate tracking via UTM parameters; Rewardful if affiliate payouts required.',
      'Shopify template options under consideration: Luxe, Cascade.',
    ],
  },
  {
    id: 'streaming',
    title: 'Streaming & watch now',
    items: [
      'Watch Now dropdown in Neon / A24 style — expands to show all rental and streaming destinations.',
      'On-site streaming via Vimeo OTT on dedicated /watch page.',
      'External platforms: Amazon, Apple TV, Google Play, YouTube, Fandango At Home.',
      'Vimeo OTT player embed once film mastering is complete.',
      'Phase 2: Watch Now and Get Tickets visible together during theatrical + streaming overlap.',
    ],
  },
  {
    id: 'newsletter',
    title: 'Newsletter & audience capture',
    items: [
      'Mailchimp integration for newsletter signups.',
      'Footer newsletter signup on all pages.',
      'Request a Screening modal on home captures Email, Country, State, Region, City.',
      'Audience list captures visitors who cannot see the film in their city yet or want streaming updates.',
    ],
  },
  {
    id: 'contact-footer',
    title: 'Contact, footer & legals',
    items: [
      'Contact page: Press (Anne Takahashi) and Bookings (bookings@crowsarewhite.com).',
      'Footer: brand, Mailchimp signup, Connect links, Legals & Credits.',
      'Legals: Privacy Policy, Terms of Use, Credits.',
      'Instagram linked in header and footer.',
    ],
  },
  {
    id: 'platform',
    title: 'Platform & integrations',
    items: [
      'Platform: Shopify primary consideration for merchandise.',
      'Ticketing: Assemble or Powster.',
      'Newsletter: Mailchimp.',
      'Streaming: Vimeo OTT.',
      'Affiliate tracking: Refersion under consideration.',
      'Analytics: Google Analytics 4 + Google Search Console.',
      'Mobile-first, fully responsive across all breakpoints.',
    ],
  },
  {
    id: 'performance-seo',
    title: 'Performance, SEO & analytics',
    items: [
      'Fast load times — optimise all images before upload.',
      'SEO on launch: page titles, meta descriptions, Open Graph tags for social sharing.',
      'Google Search Console submitted on launch day.',
      'Priority: site must rank for “Crows Are White” and “Desire Monk” searches.',
      'Google Analytics 4 event tracking for conversions (tickets, streaming, newsletter, shop).',
    ],
  },
  {
    id: 'visual',
    title: 'Visual references',
    items: [
      'Neon Rated (neonrated.com) — simplicity, Watch Now dropdown pattern.',
      'A24 Aftersun (a24films.com/films/after-sun) — streaming dropdown and film page structure.',
      'Criterion Collection (criterion.com) — buttons and menus.',
      'Type Goes Here (typegoeshere.com) — colour and playfulness. Graphic design by Dylan Haley.',
      'André Is an Idiot (andreisanidiot.film/tickets) — Assemble screening listings reference.',
      'Fire of Love (sandboxfilms.org/films/fire-of-love) — looping trailer with modal expand.',
      'Hundreds of Beavers (hundredsofbeavers.com) — stills gallery reference.',
    ],
  },
]

export type SuggestedSeo = {
  page: string
  path: string
  title: string
  description: string
  notes?: string
}

export const suggestedSeo: SuggestedSeo[] = [
  {
    page: 'Home',
    path: '/',
    title: 'Crows Are White | Official Documentary Site — Ahsen Nadeem',
    description:
      'Official site for Crows Are White (Desire Monk) — the award-winning documentary by Ahsen Nadeem. Watch the trailer, get tickets, stream the film, and book a screening.',
    notes: 'Targets primary search terms “Crows Are White” and “Desire Monk”. Keep title under 60 characters where possible.',
  },
  {
    page: 'Get Tickets',
    path: '/tickets',
    title: 'Get Tickets — Crows Are White Theatrical Screenings',
    description:
      'Find Crows Are White screenings near you. City-by-city showtimes with direct links to buy tickets at local theaters.',
  },
  {
    page: 'Watch Now',
    path: '/watch',
    title: 'Watch Crows Are White Online | Stream & Rent',
    description:
      'Stream or rent Crows Are White on crowsarewhite.com via Vimeo OTT, plus Amazon, Apple TV, Google Play, YouTube, and Fandango At Home.',
  },
  {
    page: 'Press',
    path: '/press',
    title: 'Press Kit — Crows Are White Documentary',
    description:
      'Download the Crows Are White press kit: synopsis, production stills, poster, festival laurels, quotes, and press contact Anne Takahashi.',
  },
  {
    page: 'Host a Screening',
    path: '/host-a-screening',
    title: 'Host a Screening — Crows Are White',
    description:
      'Request a community or institutional screening of Crows Are White. Submit your organization details to bookings@crowsarewhite.com.',
  },
  {
    page: 'Shop',
    path: '/shop',
    title: 'Crows Are White Merchandise | Official Film Store',
    description:
      'Shop official Crows Are White merchandise — posters, apparel, and more. Print-on-demand via Shopify.',
  },
]

export const requiredFromClient = [
  'YouTube trailer link — https://www.youtube.com/watch?v=Joux-zYHEuY (supplied).',
  'Production stills — high resolution, press-ready.',
  'Festival laurel artwork — source files for 5 laurels.',
  'Press kit PDF — final downloadable asset.',
  'Press quotes and review text with publication and reviewer credits.',
  'Screening dates, venues, and direct theater ticket links.',
  'Vimeo OTT account and embed credentials once mastering is complete.',
  'Streaming platform URLs: Amazon, Apple TV, Google Play, YouTube, Fandango At Home.',
  'Merchandise product list, pricing, and product photography.',
  'Mailchimp list ID and embedded signup form action URL.',
  'Instagram profile URL for header and footer.',
  'Privacy policy and terms of use copy for legals pages.',
  'Full credits including produced by line.',
  'Powster or Assemble account decision and integration access.',
  'Shopify store account with Printful or Printify connected.',
  'Asset drops: https://www.dropbox.com/scl/fi/dt0pqe95l8yqpufcyi6fd/15-Website.zip and press folder on Dropbox.',
]

export const requiredFromDesigner = [
  'Title treatment and logo — final artwork for header, favicon, and social.',
  'Hero cinematic still or 10–40 second video loop for home page.',
  'Visual design system: typography, colour palette, spacing, and component styles.',
  'Poster artwork — final press-ready downloadable file.',
  'Festival laurel lockups — composed layouts if not supplied as finished artwork by client.',
  'Open Graph share image — 1200×630px for social previews.',
  'Favicon and touch icons.',
  'Shopify storefront styling direction — product cards, collection layout, cart UI.',
  'Final UI design handoff (Figma or equivalent) for developer build.',
  'Reference alignment with brief visuals: neonrated.com, criterion.com, typegoeshere.com.',
]

export const suggestedOpenGraph = {
  title: 'Crows Are White — Official Documentary by Ahsen Nadeem',
  description:
    'Banned from a Buddhist monastery, a filmmaker befriends a monk who prefers heavy metal and ice cream. Watch the trailer and get tickets.',
  type: 'website',
  imageNote: 'Use hero still or official poster at 1200×630px for og:image.',
}
