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

function buildLocalBusinessSchema(v) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BarOrPub',
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
    url: typeof window !== 'undefined' ? window.location.origin : undefined,
    servesCuisine: ['Irish', 'Italian'],
    priceRange: '€€',
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
