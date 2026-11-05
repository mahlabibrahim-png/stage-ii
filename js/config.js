/* ============================================================
   STAGE II — site content. This is the only file you need to edit.

   Every entry below becomes an object on the home ring and its own tab.
   - group:  "collection" (shared shoots) or "member" (one person)
   - object: which 3D object to show (see js/objects.js BUILDERS)
   - media:  either a number N  -> loads photos/<id>/01.jpg ... N.jpg
             or a list of file names inside photos/<id>/ (jpg, png, webp, mp4, webm, mov)
   Missing files just show an empty slot, so you can fill them in over time.

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
      media: ['01.jpg', '02.jpg', '03.jpg', '04.jpg', 'clip-01.mp4', '05.jpg', '06.jpg', 'clip-02.mp4'],
    },
    {
      id: 'wake', group: 'collection', name: 'Wake', object: 'wakeboard', color: '#7dffd4',
      media: 8,
    },
    {
      // center: true puts this object in the middle of the home wheel
      id: 'film', group: 'collection', name: 'Film', object: 'camera', color: '#d9dadc', center: true,
      media: 8,
    },
    {
      id: 'mahmoud', group: 'member', name: 'Doodo', object: 'goggles', color: '#6fe9ff',
      media: 6,
    },
    {
      id: 'muhammad', group: 'member', name: 'Dodo', object: 'drawing', color: '#a9c8ff',
      media: 6,
    },
    {
      id: 'tareq', group: 'member', name: 'Teeka', object: 'gloves', color: '#ff8f8f',
      media: 6,
    },
    {
      id: 'belal', group: 'member', name: 'Nosseir', object: 'angel', color: '#ffb3e6',
      media: 6,
    },
    {
      id: 'ibrahim', group: 'member', name: 'Hemi', object: 'hemi', color: '#ffbe6b',
      media: 6,
    },
    {
      id: 'bilal', group: 'member', name: 'Bilo', object: 'tank', color: '#6fffc8',
      media: 6,
    },
  ],
};
