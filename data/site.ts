export const siteConfig = {
  /** Show Get Tickets CTA during theatrical release only */
  theatricalReleaseActive: true,
  /** Mailchimp embedded form action — replace with live list URL */
  mailchimpAction: 'https://crowsarewhite.us21.list-manage.com/subscribe/post?u=PLACEHOLDER&id=PLACEHOLDER',
}

export const film = {
  title: 'Crows Are White',
  year: 2022,
  runtime: 98,
  director: 'Ahsen Nadeem',
  imdb: 'https://www.imdb.com/title/tt10332620/',
  trailer: 'https://www.youtube.com/watch?v=Joux-zYHEuY',
  trailerId: 'Joux-zYHEuY',
  /** Self-hosted trailer MP4 for custom player UI. Falls back to YouTube when empty. */
  trailerSrc: '',
  /** Optional poster override; defaults to YouTube maxres thumbnail */
  trailerPoster: '',
  /** Replace with dedicated 10–40 sec hero loop when available */
  heroVideoId: 'Joux-zYHEuY',
  /** Self-hosted hero loop — no YouTube UI. e.g. '/videos/hero-loop.mp4' */
  heroVideoSrc: '',
  logline:
    "Banned from a secretive Buddhist monastery, a filmmaker befriends a monk who prefers heavy metal and ice cream over meditation. Their unlikely bond forces him to confront the double life he's been hiding for years.",
  writers: 'Ahsen Nadeem, Matt H. Mayes, Dawn Light Blackman',
  cinematography: 'Matthew Nauser',
  rottenTomatoes: '100%',
  festivals: '80+',
  awards: 11,
  laurels: ['Sundance', 'Hot Docs', 'Sheffield', 'AFI Docs', 'Camden'],
}

export const screenings = [
  { date: 'Jun 12', city: 'Los Angeles', state: 'CA', venue: 'Nuart Theatre', status: 'on-sale' as const, ticketUrl: 'https://example.com/nuart' },
  { date: 'Jun 14', city: 'New York', state: 'NY', venue: 'Film Forum', status: 'on-sale' as const, ticketUrl: 'https://example.com/filmforum' },
  { date: 'Jun 18', city: 'Chicago', state: 'IL', venue: 'Music Box Theatre', status: 'on-sale' as const, ticketUrl: 'https://example.com/musicbox' },
  { date: 'Jul 2', city: 'Austin', state: 'TX', venue: 'AFS Cinema', status: 'coming-soon' as const, ticketUrl: '' },
  { date: 'Jul 9', city: 'Seattle', state: 'WA', venue: 'SIFF Film Center', status: 'coming-soon' as const, ticketUrl: '' },
]

export const pressQuotes = [
  { quote: 'A tender, funny, and unexpectedly moving portrait of faith and friendship.', pub: 'Variety', reviewer: 'Jane Smith' },
  { quote: 'Nadeem turns spiritual doubt into riveting cinema.', pub: 'IndieWire', reviewer: 'Alex Chen' },
  { quote: 'Heavy metal, ice cream, and enlightenment — somehow it all works.', pub: 'The Hollywood Reporter', reviewer: 'Morgan Lee' },
  { quote: "One of the year's most surprising documentaries.", pub: 'Screen Daily', reviewer: 'Ravi Patel' },
]

export const pressPhotos = [
  { id: 1, alt: 'Monk and filmmaker on temple steps' },
  { id: 2, alt: 'Director Ahsen Nadeem on location' },
  { id: 3, alt: 'Ice cream stand scene' },
  { id: 4, alt: 'Heavy metal concert moment' },
  { id: 5, alt: 'Meditation hall interior' },
  { id: 6, alt: 'Street scene in Japan' },
]

export const products = [
  { id: 'poster', name: 'Official Poster', price: 24 },
  { id: 'tee', name: "Director's Cut Tee", price: 32 },
  { id: 'hoodie', name: 'Monk & Metal Hoodie', price: 58 },
  { id: 'cap', name: 'Ice Cream Club Cap', price: 28 },
]

export const faqItems = [
  { q: 'Where can I watch Crows Are White?', a: 'Use Watch Now for streaming and rental links, or Get Tickets for theatrical screenings in your city.' },
  { q: 'How long is the film?', a: '98 minutes.' },
  { q: 'Can I host a screening?', a: 'Yes — use Host a Screening. We respond via bookings@crowsarewhite.com.' },
  { q: 'Is there a press kit?', a: 'Yes. Press page includes stills, poster, quotes, laurels, and Anne Takahashi contact.' },
]

export const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Watch', to: '/watch' },
  { label: 'Screenings', to: '/screenings' },
  { label: 'Trailer', to: '/#trailer' },
  { label: 'Videos', to: '/videos' },
  { label: 'Shop', to: '/shop' },
]

export const secondaryNavItems = [
  { label: 'Press', to: '/press' },
  { label: 'Host a Screening', to: '/host-a-screening' },
  { label: 'Shipping & Delivery', to: '/shipping-delivery' },
  { label: 'Terms & Conditions', to: '/terms-of-use' },
]

export type MenuLink = {
  type?: 'page' | 'url'
  page?: {slug?: string}
  url?: string
}

export type MenuItem = {
  _key?: string
  itemType?: 'link' | 'divider' | 'spacer'
  text?: string
  link?: MenuLink
}

export type Menu = {
  title?: string
  items?: MenuItem[]
}

export type FooterMenuGroup = {
  _key?: string
  title: string
  menu?: Menu
}

export type SocialLink = {
  platform: 'instagram' | 'youtube' | 'twitter' | 'tiktok'
  label: string
  url: string
}

export type LegalLink = {
  label: string
  to: string
}

export const defaultMainMenu: Menu = {
  title: 'Primary menu',
  items: navItems.map((item, index) => ({
    _key: `nav-${index}`,
    itemType: 'link',
    text: item.label,
    link: {type: 'url', url: item.to},
  })),
}

export const defaultFooterMenus: FooterMenuGroup[] = [
  {
    title: 'Documentary',
    menu: {
      items: [
        {itemType: 'link', text: 'Screenings', link: {type: 'url', url: '/screenings'}},
        {itemType: 'link', text: 'Trailer', link: {type: 'url', url: '/#trailer'}},
        {itemType: 'link', text: 'Press', link: {type: 'url', url: '/press'}},
        {itemType: 'link', text: 'Videos', link: {type: 'url', url: '/videos'}},
      ],
    },
  },
  {
    title: 'Shop',
    menu: {
      items: [
        {itemType: 'link', text: 'All', link: {type: 'url', url: '/shop'}},
        {itemType: 'link', text: 'Apparel', link: {type: 'url', url: '/shop?filter=apparel'}},
        {itemType: 'link', text: 'Prints', link: {type: 'url', url: '/shop?filter=prints'}},
        {itemType: 'link', text: 'Shipping & Delivery', link: {type: 'url', url: '/shipping-delivery'}},
      ],
    },
  },
  {
    title: 'Connect',
    menu: {
      items: [
        {itemType: 'link', text: 'Host a Screening', link: {type: 'url', url: '/host-a-screening'}},
        {itemType: 'link', text: 'FAQ', link: {type: 'url', url: '/faq'}},
        {itemType: 'link', text: 'Contact', link: {type: 'url', url: '/contact'}},
      ],
    },
  },
]

export const defaultPrivacyMenu: Menu = {
  title: 'Privacy',
  items: [
    {itemType: 'link', text: 'Privacy Policy', link: {type: 'url', url: '/privacy-policy'}},
    {itemType: 'link', text: 'Terms of Use', link: {type: 'url', url: '/terms-of-use'}},
    {itemType: 'link', text: 'Credits', link: {type: 'url', url: '/credits'}},
  ],
}

/** Secondary header links under the primary nav */
export const defaultMainMenuSub: Menu = {
  title: 'Secondary menu',
  items: secondaryNavItems.map((item, index) => ({
    _key: `sub-${index}`,
    itemType: 'link',
    text: item.label,
    link: {type: 'url', url: item.to},
  })),
}

export const defaultSocialLinks: SocialLink[] = [
  {platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/desire.monk'},
  {platform: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@crowsarewhite'},
  {platform: 'twitter', label: 'Twitter', url: 'https://twitter.com/crowsarewhite'},
  {platform: 'tiktok', label: 'TikTok', url: 'https://www.tiktok.com/@crowsarewhite'},
]

export const defaultFooterLegal: LegalLink[] = [
  {label: 'Privacy Policy', to: '/privacy-policy'},
  {label: 'Terms of Use', to: '/terms-of-use'},
  {label: 'Credits', to: '/credits'},
]

export const footerNavItems = [
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact', to: '/contact' },
]

export type StreamingLink = {
  label: string
  href: string
  featured?: boolean
}

export const streamingLinks: StreamingLink[] = [
  { label: 'Watch on crowsarewhite.com', href: '/watch', featured: true },
  { label: 'Amazon', href: 'https://www.amazon.com' },
  { label: 'Apple TV', href: 'https://tv.apple.com' },
  { label: 'Google Play', href: 'https://play.google.com/store/movies' },
  { label: 'YouTube', href: 'https://www.youtube.com' },
  { label: 'Fandango At Home', href: 'https://www.fandangoathome.com' },
]
