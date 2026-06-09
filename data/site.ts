export const film = {
  title: 'Crows Are White',
  year: 2022,
  runtime: 98,
  director: 'Ahsen Nadeem',
  imdb: 'https://www.imdb.com/title/tt10332620/',
  trailer: 'https://www.youtube.com/watch?v=Joux-zYHEuY',
  trailerId: 'Joux-zYHEuY',
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
  { date: 'Jun 12', city: 'Los Angeles', state: 'CA', venue: 'Nuart Theatre', status: 'on-sale' as const },
  { date: 'Jun 14', city: 'New York', state: 'NY', venue: 'Film Forum', status: 'on-sale' as const },
  { date: 'Jun 18', city: 'Chicago', state: 'IL', venue: 'Music Box Theatre', status: 'on-sale' as const },
  { date: 'Jul 2', city: 'Austin', state: 'TX', venue: 'AFS Cinema', status: 'coming-soon' as const },
  { date: 'Jul 9', city: 'Seattle', state: 'WA', venue: 'SIFF Film Center', status: 'coming-soon' as const },
]

export const pressQuotes = [
  { quote: 'A tender, funny, and unexpectedly moving portrait of faith and friendship.', pub: 'Variety', reviewer: 'Jane Smith' },
  { quote: 'Nadeem turns spiritual doubt into riveting cinema.', pub: 'IndieWire', reviewer: 'Alex Chen' },
  { quote: 'Heavy metal, ice cream, and enlightenment — somehow it all works.', pub: 'The Hollywood Reporter', reviewer: 'Morgan Lee' },
  { quote: "One of the year's most surprising documentaries.", pub: 'Screen Daily', reviewer: 'Ravi Patel' },
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
  { q: 'Can I host a screening?', a: 'Yes — use Book a Screening. We respond via bookings@crowsarewhite.com.' },
  { q: 'Is there a press kit?', a: 'Yes. Press page includes stills, poster, quotes, laurels, and Anne Takahashi contact.' },
]

export const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Trailer', to: '/trailer' },
  { label: 'Tickets', to: '/tickets' },
  { label: 'Press', to: '/press' },
  { label: 'Shop', to: '/shop' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Book a Screening', to: '/book-a-screening' },
  { label: 'Contact', to: '/contact' },
]

export const streamingLinks = [
  'Apple TV',
  'Amazon Prime',
  'Vimeo OTT',
  'Google Play',
  'YouTube Rentals',
]
