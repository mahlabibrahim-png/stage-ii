// Lists every photo/video in photos/<tab>/ into photos/manifest.json, so new uploads show up
// on the site without editing any code. Runs automatically on each deploy (see netlify.toml).
// A file named main.* opens the section full screen; everything else follows in name order.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'photos');
const ok = /\.(jpe?g|png|webp|gif|avif|mp4|webm|mov|m4v)$/i;
const skip = /^hero(-\d+)?(-poster)?\./i; // the home page video lives here too
const out = {};
for (const dir of fs.readdirSync(root, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const files = fs.readdirSync(path.join(root, dir.name)).filter((f) => ok.test(f) && !skip.test(f) && !f.startsWith('.'));
  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  const main = files.find((f) => /^main\./i.test(f));
  out[dir.name] = { main: main || null, media: files.filter((f) => f !== main) };
}
// photos/years.json says which season (year) each photo/video is from: { "<tab>": { "01.jpg": 2025 } }
try {
  const years = JSON.parse(fs.readFileSync(path.join(root, 'years.json'), 'utf8'));
  for (const [k, v] of Object.entries(years)) if (out[k]) out[k].years = v;
} catch (e) { /* no years file yet */ }
fs.writeFileSync(path.join(root, 'manifest.json'), JSON.stringify(out, null, 2));
console.log('manifest:', Object.entries(out).map(([k, v]) => `${k} ${v.media.length}${v.main ? '+main' : ''}`).join(', '));
