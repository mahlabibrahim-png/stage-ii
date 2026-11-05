// Lists every photo/video in photos/<tab>/ into photos/manifest.json, so new uploads show up
// on the site without editing any code. Runs automatically on each deploy (see netlify.toml).
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'photos');
const ok = /\.(jpe?g|png|webp|gif|avif|mp4|webm|mov|m4v)$/i;
const skip = /^hero(-poster)?\./i; // the home page video lives here too
const out = {};
for (const dir of fs.readdirSync(root, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const files = fs.readdirSync(path.join(root, dir.name)).filter((f) => ok.test(f) && !skip.test(f) && !f.startsWith('.'));
  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  out[dir.name] = files;
}
fs.writeFileSync(path.join(root, 'manifest.json'), JSON.stringify(out, null, 2));
console.log('manifest:', Object.entries(out).map(([k, v]) => `${k} ${v.length}`).join(', '));
