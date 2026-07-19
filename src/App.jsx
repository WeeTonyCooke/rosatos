import { useEffect } from 'react'
import venueBase from '../content/venue.json'
import programme from '../content/programme.json'
import menu from '../content/menu.json'
import { mergeVenue } from './lib/programme.js'
import { CartProvider } from './cart/CartContext.jsx'
import { Header } from './components/Header.jsx'
import { Hero } from './components/Hero.jsx'
import { Room } from './components/Room.jsx'
import { Pint } from './components/Pint.jsx'
import { Menu } from './components/Menu.jsx'
import { OrderPizza } from './components/OrderPizza.jsx'
import { CartDrawer } from './components/CartDrawer.jsx'
import { WhatsOn } from './components/WhatsOn.jsx'
import { Visit } from './components/Visit.jsx'
import { Footer } from './components/Footer.jsx'
import { useReveal } from './hooks/useReveal.js'

const venue = mergeVenue(venueBase, programme, menu)

// Maps this venue's human-readable "days" strings to schema.org's expected
// day-name format for openingHoursSpecification.
const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function daysToSchema(daysLabel) {
  // "Monday – Friday" -> ["Monday", ..., "Friday"]; "Saturday" -> ["Saturday"]
  const names = daysLabel
    .split(/[–-]/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (names.length === 1) return names
  const startIndex = DAY_ORDER.indexOf(names[0])
  const endIndex = DAY_ORDER.indexOf(names[names.length - 1])
  if (startIndex === -1 || endIndex === -1) return names
  return DAY_ORDER.slice(startIndex, endIndex + 1)
}

function buildOpeningHours(hours) {
  return (hours || []).map((row) => {
    const [opens, closes] = row.time.split(/[–-]/).map((t) => t.trim())
    return {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: daysToSchema(row.days),
      opens,
      closes,
    }
  })
}

function buildLocalBusinessSchema(v) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
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
    image: v.room?.image ? `${origin}${v.room.image}` : undefined,
    menu: origin ? `${origin}/#menu` : undefined,
    servesCuisine: ['Irish', 'Italian'],
    priceRange: '€€',
    paymentAccepted: ['Cash', 'Credit Card'],
    openingHoursSpecification: buildOpeningHours(v.hours),
    sameAs: [v.social?.instagram, v.social?.facebook].filter(Boolean),
  }
}

function AppShell() {
  useReveal()

  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(buildLocalBusinessSchema(venue))
    document.head.appendChild(script)
    return () => script.remove()
  }, [])

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header venue={venue} />
      <main id="main">
        <Hero venue={venue} />
        <Room venue={venue} />
        <Pint venue={venue} />
        <Menu venue={venue} />
        <OrderPizza />
        <WhatsOn venue={venue} />
        <Visit venue={venue} />
      </main>
      <Footer venue={venue} />
      <CartDrawer venue={venue} />
    </>
  )
}

export default function App() {
  return (
    <CartProvider venue={venue}>
      <AppShell />
    </CartProvider>
  )
}
