// Keeps Puppeteer's downloaded Chrome inside Netlify's own build cache
// directory (referenced directly in Netlify's error output:
// /opt/buildhome/.cache/puppeteer) so it survives between builds instead
// of being re-downloaded from scratch every single deploy.
//
// Falls back to Puppeteer's own default elsewhere (e.g. local development
// on a Mac) since this path is Netlify-specific.
const path = require('node:path')

const isNetlify = Boolean(process.env.NETLIFY)

module.exports = {
  cacheDirectory: isNetlify
    ? '/opt/buildhome/.cache/puppeteer'
    : path.join(require('os').homedir(), '.cache', 'puppeteer'),
}
