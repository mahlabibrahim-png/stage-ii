/* ============================================================
   STAGE II — site content. This is the only file you need to edit.

   Every entry below becomes an object on the home ring and its own tab.
   - group:  "collection" (shared shoots) or "member" (one person)
   - object: which 3D object to show (see js/objects.js BUILDERS)
   - actor:  optional little animated guy shown next to it on the tab page (js/objects.js ACTORS)
   - media:  filled in automatically from photos/<id>/ on every deploy (photos/manifest.json).
             A file called main.* opens the section full screen; the rest follow in name order.
   - text:   optional words shown beside each photo/video, by file name, e.g.
             text: { '01.jpg': 'Lake day, June' }

   To add a new collection later: copy an entry, give it a new id,
   make the folder photos/<id>/ and drop the files in.
   ============================================================ */
window.STAGE = {
  title: 'Stage II',
  // full-screen video at the top of the home page
  hero: 'photos/drone/hero.mp4',
  heroPoster: 'photos/drone/hero-poster.jpg',
  tabs: [
    {
      id: 'drone', group: 'collection', name: 'Drone', object: 'drone', color: '#8fe3ff',
      media: [],
    },
    {
      id: 'wake', group: 'collection', name: 'Wake', object: 'wakeboard', color: '#7dffd4',
      media: [],
    },
    {
      // center: true puts this object in the middle of the home wheel
      id: 'film', group: 'collection', name: 'Film', object: 'camera', color: '#d9dadc', center: true,
      media: [],
    },
    {
      id: 'mahmoud', group: 'member', name: 'Doodo', object: 'goggles', actor: 'swim', color: '#6fe9ff',
      media: [],
    },
    {
      id: 'muhammad', group: 'member', name: 'Dodo', object: 'drawing', actor: 'draw', color: '#a9c8ff',
      media: [],
    },
    {
      id: 'tareq', group: 'member', name: 'Teeka', object: 'gloves', actor: 'box', color: '#ff8f8f',
      media: [],
    },
    {
      id: 'belal', group: 'member', name: 'Nosseir', object: 'angel', actor: 'mac', color: '#ffb3e6',
      media: [],
    },
    {
      id: 'ibrahim', group: 'member', name: 'Hemi', object: 'hemi', actor: 'bench', color: '#ffbe6b',
      media: [],
    },
    {
      id: 'bilal', group: 'member', name: 'Bilo', object: 'perfume', actor: 'spray', color: '#6fffc8',
      media: [],
    },
  ],
};
