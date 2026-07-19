import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

const container = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// react-snap prerenders this page at build time and leaves real markup
// inside #root before the bundle ever runs. If we call createRoot() on
// that container we'd blow the prerendered DOM away and re-render from
// scratch — a flash of empty content for real visitors and a wasted
// prerender. hydrateRoot attaches to what's already there instead.
if (container.hasChildNodes()) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
