# Stage II

Static site, no build step. Open `index.html` through any static host (or `python3 -m http.server` locally).

## Adding photos and videos
1. Put files in `photos/<tab id>/`, e.g. `photos/ibrahim/01.jpg`, `photos/drone/clip-01.mp4`. A file named `main` (main.jpg or main.mp4) opens that section full screen as you scroll; the rest follow in name order, each with space for text (set in `js/config.js` → `text`). Keep videos web-sized (H.264 mp4, about 1920px wide or less).
2. Tabs with `media: 6` in `js/config.js` look for `01.jpg` … `06.jpg`. Change the number to show more.
   Or list file names instead: `media: ['sunset.jpg', 'jump.mp4']`. Videos: mp4 / webm / mov.
3. Empty slots show the exact path they expect, so you can see what's missing.

Tip: resize photos to about 2000px on the long side and keep clips short (under ~20 MB) so the site stays fast.

## Top video
The home page opens with one of the `heroes` videos in `js/config.js` (photos/drone/hero.mp4, hero-2.mp4, hero-3.mp4), switching every `heroHours` (8) hours. To swap it, convert the clip to a web-friendly mp4, for example:
`ffmpeg -i clip.mov -an -vf scale=1920:-2 -c:v libx264 -crf 24 -pix_fmt yuv420p -movflags +faststart photos/drone/hero.mp4`

## Adding a new collection
Copy an entry in `js/config.js`, give it a new `id`, `name` and an `object`.
Available objects: drone, wakeboard, camera (movie camera), perfume, goggles, drawing, gloves, angel, hemi, tank. Add `center: true` to a tab to put its object in the middle of the wheel (Film does this).
People pages can also show a little animated guy next to the object: set `actor` in `js/config.js` (spray, box, bench, draw, swim, mac; see ACTORS in `js/objects.js`).
A new object is one builder function in `js/objects.js` (BUILDERS).

## Files
- `index.html`, `styles.css`
- `js/config.js` content (the only file you normally edit)
- `js/objects.js` the 3D objects and the rotating ring (Three.js r149, vendored in `js/vendor/`)
- `js/app.js` dropdown menu, pages, galleries, viewer

## Hosting and adding photos as a group
- The site is meant to live in a GitHub repo deployed by Netlify (or Cloudflare Pages) on your own domain.
- On every deploy, `scripts/build-manifest.js` lists everything in `photos/<tab>/` into `photos/manifest.json`, so any uploaded photo or clip shows up automatically. File names don't matter; they're shown in name order.
- To add photos: open the repo on github.com, go into `photos/<name>/`, choose "Add file → Upload files", drop the files, and commit. The site updates about a minute later.
- Keep each file under 25 MB when uploading in the browser (GitHub web limit; 100 MB via git). Export videos as .mp4 (H.264) so every browser can play them.
