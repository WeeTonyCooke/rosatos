// Post-build prerender for a single-route static SPA.
//
// Rosato's has no per-request data — venue.json / programme.json / menu.json
// are baked in at build time — so there's nothing a full SSR setup would buy
// us beyond snapshotting the one route once, here, at build time.
//
// This spins up `vite preview` against the built `dist/`, opens it in
// headless Chrome, waits for the JSON-LD <script> that App.jsx injects via
// useEffect to land in <head>, then writes the fully-rendered HTML back over
// dist/index.html. Real visitors still get the normal JS bundle and it
// hydrates in place (see the hasChildNodes() check in src/main.jsx);
// crawlers that don't execute JS now see complete markup and the schema.org
// data instead of an empty <div id="root">.
//
// Deliberately NOT using react-snap: it pins Puppeteer 1.20.0 (2019) with
// multiple known-critical CVEs and hasn't had a real release in years.
// This script does the same job with a current, maintained Puppeteer and
// nothing beyond dependencies already in this project (vite, puppeteer).
//
// SAFETY NOTE: this machine runs multiple Quiet Objects demo sites, several
// of which use `vite preview`'s default port. An earlier version of this
// script picked a fixed port and only checked "does anything respond" —
// if a stale preview from a *different* demo was already bound to that
// port, this script would silently capture and deploy THAT site's content
// instead of Rosato's. Two safeguards now prevent that:
//   1. A random high port, to make collisions very unlikely.
//   2. A hard content check: the captured HTML must contain this venue's
//      own name (read from content/venue.json) before it's written anywhere.
//      If it doesn't match, the script fails loudly instead of writing.

import { spawn } from 'node:child_process'
import { writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import puppeteer from 'puppeteer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
const indexPath = path.join(rootDir, 'dist', 'index.html')

// Random port in a high, unlikely-to-collide range rather than vite's
// well-known default (4173), which other demos on this machine also use.
const PORT = 41730 + Math.floor(Math.random() * 8000)
const URL = `http://localhost:${PORT}/`

const venue = JSON.parse(readFileSync(path.join(rootDir, 'content', 'venue.json'), 'utf-8'))
const expectedName = venue.name
if (!expectedName) {
  throw new Error('content/venue.json has no "name" field — cannot verify prerendered content')
}

function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      fetch(url)
        .then(() => resolve())
        .catch(() => {
          if (Date.now() - start > timeoutMs) {
            reject(new Error(`vite preview did not come up within ${timeoutMs}ms`))
          } else {
            setTimeout(tryOnce, 250)
          }
        })
    }
    tryOnce()
  })
}

async function main() {
  let previewFailed = false
  // detached: true puts vite preview in its own process group. `npx` spawns
  // `vite` as a child of itself — killing just the npx process (as this
  // script did before) does NOT kill that vite child, which keeps listening
  // and keeps Node's event loop alive forever. Netlify's build hung for the
  // full 18-minute timeout because of exactly this: the script had already
  // finished its actual work and logged success, but the orphaned vite
  // preview server never let the process exit. Killing the whole group
  // (via the negative PID) takes the real vite process down with it.
  const previewProcess = spawn(
    'npx',
    ['vite', 'preview', '--port', String(PORT), '--strictPort'],
    { cwd: rootDir, stdio: 'pipe', detached: true },
  )
  previewProcess.on('exit', (code) => {
    if (code !== null && code !== 0) previewFailed = true
  })

  function killPreviewGroup() {
    try {
      process.kill(-previewProcess.pid)
    } catch {
      // Already dead, or platform doesn't support process groups (rare) —
      // either way there's nothing left to clean up.
    }
  }

  let browser
  try {
    await waitForServer(URL)

    if (previewFailed) {
      throw new Error(
        `vite preview exited before we could confirm it — likely a port conflict. Refusing to continue rather than risk capturing a different server's content.`,
      )
    }

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    await page.goto(URL, { waitUntil: 'networkidle0' })

    // App.jsx injects the LocalBusiness/Restaurant JSON-LD via useEffect —
    // wait for it explicitly rather than trusting networkidle0 alone.
    await page.waitForSelector('script[type="application/ld+json"]', { timeout: 5000 })

    const renderedHtml = await page.content()

    // Hard safety check: refuse to write anything that isn't actually
    // this venue's own site. This is what would have caught the
    // wrong-site-in-production incident before it reached `dist/`.
    if (!renderedHtml.includes(expectedName)) {
      throw new Error(
        `Captured page does not contain venue name "${expectedName}" — this looks like ` +
        `it captured the WRONG SITE (possibly a stale preview server on another port). ` +
        `Refusing to overwrite dist/index.html.`,
      )
    }

    writeFileSync(indexPath, renderedHtml)
    console.log(`[prerender] verified "${expectedName}" present, wrote rendered HTML to ${path.relative(rootDir, indexPath)}`)
  } finally {
    if (browser) await browser.close()
    killPreviewGroup()
  }
}

main()
  .then(() => {
    // Guaranteed safeguard: even if some other handle is keeping the event
    // loop alive (a lingering socket, timer, etc. we haven't spotted), force
    // the process to exit now that the actual work is done. A prerender
    // script hanging until Netlify's build timeout kills it 18 minutes later
    // is a much worse failure mode than exiting a little too forcefully.
    process.exit(0)
  })
  .catch((err) => {
    console.error('[prerender] failed:', err.message)
    process.exit(1)
  })
