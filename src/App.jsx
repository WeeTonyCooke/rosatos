import venueBase from '../content/venue.json'
import programme from '../content/programme.json'
import menu from '../content/menu.json'
import { mergeVenue } from './lib/programme.js'
import imageManifest from './lib/image-manifest.json'
import { CartProvider } from './cart/CartContext.jsx'
import { BookingProvider } from './booking/BookingContext.jsx'
import { Header } from './components/Header.jsx'
import { Hero } from './components/Hero.jsx'
import { Room } from './components/Room.jsx'
import { Menu } from './components/Menu.jsx'
import { OrderPizza } from './components/OrderPizza.jsx'
import { CartDrawer } from './components/CartDrawer.jsx'
import { BookingSheet } from './components/BookingSheet.jsx'
import { WhatsOn } from './components/WhatsOn.jsx'
import { GiftCard } from './components/GiftCard.jsx'
import { Visit } from './components/Visit.jsx'
import { Footer } from './components/Footer.jsx'
import { useReveal } from './hooks/useReveal.js'

const venue = mergeVenue(venueBase, programme, menu)

/**
 * Canonical site origin, read from the <link rel="canonical"> already in
 * index.html.
 *
 * This used to be `window.location.origin`, which broke the prerender:
 * scripts/prerender.mjs renders the page against `vite preview` on localhost,
 * so the schema baked into dist/index.html advertised the business as living
 * at http://localhost:43663 — and non-JS crawlers, the entire audience the
 * prerender exists to serve, were the only ones who ever saw it.
 *
 * Reading the canonical link gives the same value during prerender and in the
 * browser, which also keeps the JSON-LD byte-identical across hydration.
 */
const FALLBACK_ORIGIN = 'https://rosatos-moville.netlify.app'

function resolveSiteUrl() {
  if (typeof document === 'undefined') return FALLBACK_ORIGIN
  const canonical = document.querySelector('link[rel="canonical"]')?.href
  if (!canonical) return FALLBACK_ORIGIN
  return canonical.replace(/\/+$/, '')
}

const SITE_URL = resolveSiteUrl()

function largestVariant(base) {
  const entry = imageManifest[base]
  if (!entry?.widths?.length) return ''
  return `/images/${base}-${entry.widths[entry.widths.length - 1]}.${entry.ext}`
}

function buildLocalBusinessSchema(v) {
  const origin = SITE_URL
  return {
    '@context': 'https://schema.org',
    '@type': ['Restaurant', 'BarOrPub'],
    name: v.name,
    description: v.tagline,
    telephone: v.phone,
    email: v.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: v.address.street,
      addressLocality: v.address.locality,
      addressRegion: v.address.region,
      postalCode: v.address.postalCode,
      addressCountry: v.address.country,
    },
    // Town-level coordinates for Moville — no exact building-level geo is
    // available for 7 Malin Road, so this is an approximation, not a
    // precise pin. Good enough for schema.org's purposes; not for turn-by-turn.
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 55.1889,
      longitude: -7.0406,
    },
    url: origin || undefined,
    // Room now references a manifest base rather than a literal path, so the
    // widest generated variant is resolved here. This is the image Google and
    // link-preview bots show, so it has to be a real deployed file.
    image: v.room?.base ? `${origin}${largestVariant(v.room.base)}` : undefined,
    menu: origin ? `${origin}/#menu` : undefined,
    servesCuisine: ['Irish', 'Italian'],
    priceRange: '€€',
    paymentAccepted: ['Cash', 'Credit Card'],
    // NO openingHoursSpecification, deliberately.
    //
    // venue.json's `hours` are *kitchen* hours (16:00–21:00 etc.), not bar
    // opening hours — the footer and the ordering note both describe them
    // that way, and the What's On listings run to 22:00, an hour after the
    // "close" this block used to publish. Marking kitchen hours up as
    // opening hours told Google the pub shuts at 21:00 on nights it has live
    // music at 22:00.
    //
    // Omitting the property is the honest option: Google falls back to the
    // Google Business Profile, which is the authoritative source for opening
    // hours anyway. If real bar hours are ever added to venue.json as their
    // own field, publish those here — not these.
    sameAs: [v.social?.instagram, v.social?.facebook].filter(Boolean),
  }
}

// Serialised once at module scope: the value is fully static, and computing it
// during render would risk drift between the prerendered and hydrated markup.
const SCHEMA_JSON = JSON.stringify(buildLocalBusinessSchema(venue))

function AppShell() {
  useReveal()

  return (
    <>
      {/* Rendered as static markup rather than injected into <head> from an
          effect. The effect version ran *after* the prerender had already
          baked its own copy into the HTML, so every live page ended up with
          two competing LocalBusiness records carrying different url/image
          values. JSON-LD is valid in <body>, and this way there is exactly
          one block, present for non-JS crawlers, identical across hydration. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: SCHEMA_JSON }}
      />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header venue={venue} />
      <main id="main">
        <Hero venue={venue} />
        <Room venue={venue} />
        <Menu venue={venue} />
        <OrderPizza />
        <WhatsOn venue={venue} />
        <GiftCard venue={venue} />
        <Visit venue={venue} />
      </main>
      <Footer venue={venue} />
      <CartDrawer venue={venue} />
      <BookingSheet venue={venue} />
    </>
  )
}

export default function App() {
  return (
    <CartProvider venue={venue}>
      <BookingProvider>
        <AppShell />
      </BookingProvider>
    </CartProvider>
  )
}
