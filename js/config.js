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
  // full-screen videos at the top of the home page; they take turns, switching every `heroHours` hours
  heroHours: 8,
  // seasons in the menu; photos/years.json says which year each photo/video belongs to
  seasons: [2021, 2022, 2023, 2024, 2025, 2026],
  heroes: [
    { video: 'photos/drone/hero.mp4', poster: 'photos/drone/hero-poster.jpg' },
    { video: 'photos/drone/hero-2.mp4', poster: 'photos/drone/hero-2-poster.jpg' },
    { video: 'photos/drone/hero-3.mp4', poster: 'photos/drone/hero-3-poster.jpg' },
  ],
  tabs: [
    {
      id: 'drone', group: 'collection', name: 'Drone', object: 'drone', color: '#8fe3ff',
      media: [],
      text: {
        '01.jpg': "27.4227° N, 33.6619° E · June 2025\n\nSee it the way we do: from the sky.\n\nRise with us over the quiet beauty of Egypt, its coastlines, deserts and lagoons, and enjoy the ride.",
        '02.mp4': "~27.42° N, 33.66° E · June 2025\n\nLast light over the fairways, and a game of chase across the greens.",
        '03.jpg': "27.4228° N, 33.6619° E · June 2025\n\nThe pride at rest, sprawled across the green after a long afternoon.",
        '04.mp4': "~27.40° N, 33.67° E · August 2025\n\nWhitewashed villas and still blue pools, seen the way the birds see them.",
        '05.jpg': "27.4584° N, 33.7116° E · August 2025\n\nAlone on the deep blue, a single boat cutting its own path out to sea.",
        '06.jpg': "27.4283° N, 33.6581° E · August 2025\n\nA ring of villas around its own quiet lagoon, the Red Sea waiting just beyond.",
        '07.mp4': "~27.43° N, 33.66° E · August 2025\n\nGliding low over the water as the day softens into evening.",
        '08.mp4': "~27.48° N, 33.92° E · July 2026\n\nTurquoise shallows against bare desert rock: a wild stretch of coast we had entirely to ourselves.",
        '09.mp4': "~27.40° N, 33.67° E · June 2025\n\nThe whole crew aboard, tracing a clean line of white across the lagoon.",
      },
    },
    {
      id: 'wake', group: 'collection', name: 'Wake', object: 'wakeboard', color: '#7dffd4',
      media: [],
      text: {
        '01.mp4': "~27.40° N, 33.67° E · June 2025\n\nOur favourite pastime.\n\nThe cleanest tricks, the funniest falls and the finest sunsets, all on the lagoons of El Gouna.",
        '02.jpg': "~27.40° N, 33.67° E\n\nSpray, speed and a clean line behind the boat.",
        '03.mp4': "~27.40° N, 33.67° E · June 2026\n\nThe final run of the evening, carving through the dark as the sun slips behind the palms.",
        '04.jpg': "~27.40° N, 33.67° E · July 2023\n\nRope out, engine humming, the lagoon all ours.",
        '05.mp4': "~27.40° N, 33.67° E · July 2024\n\nEyes on the kicker. A cable park session in the heat of July.",
        '06.jpg': "~27.40° N, 33.67° E · December 2024\n\nRiding into a sky on fire.",
        '07.mp4': "~27.40° N, 33.67° E · July 2023\n\nCutting across the wake on a slow summer afternoon.",
        '08.mp4': "~27.40° N, 33.67° E · July 2023\n\nHolding the line as the villas blur past.",
      },
    },
    {
      // center: true puts this object in the middle of the home wheel
      id: 'film', group: 'collection', name: 'Film', object: 'camera', color: '#d9dadc', center: true,
      media: [],
      text: {
        '01.mp4': "27.4296° N, 33.6601° E · December 2024\n\nDear visitor,\n\nWelcome to Stage II. Here you will meet the six members of a rare pride of young lions. Follow us through our adventures, and take your fill of the laughter and mischief we gather along the way.\n\nConsider this our gift: a small offering of joy, and a taste of freedom for anyone who cares to share it.\n\n— Stage II",
        '02.mp4': "~27.40° N, 33.67° E · July 2024\n\nThe sun sinks into the lagoon as we drift home.",
        '03.jpg': "~27.48° N, 33.92° E · December 2024\n\nA barbecue on white sand: cold drinks, hot coals and nowhere else to be.",
        '04.mp4': "~27.40° N, 33.67° E · June 2026\n\nAn evening swim as the lights come on along the shore.",
        '05.mp4': "~27.40° N, 33.67° E · July 2026\n\nFull throttle, lines out, open water ahead.",
        '06.jpg': "~27.40° N, 33.67° E · July 2023\n\nCotton-candy skies over the lagoon.",
        '07.mp4': "~27.40° N, 33.67° E · June 2026\n\nCruising through town, windows down.",
        '08.jpg': "~27.40° N, 33.67° E\n\nRunning into the last of the light.",
        '09.jpg': "~27.40° N, 33.67° E · December 2024\n\nPoolside, as the clouds catch fire.",
        '10.jpg': "~27.48° N, 33.92° E · January 2025\n\nAnchored in the shallows, moments before the jump.",
        '11.jpg': "~27.48° N, 33.92° E\n\nKnee-deep in crystal water, the boats waiting offshore.",
      },
    },
    {
      id: 'mahmoud', group: 'member', name: 'Doodo', object: 'goggles', actor: 'swim', color: '#6fe9ff',
      media: [],
      text: {
        '01.jpg': "27.4186° N, 33.6631° E\n\n04/29/06 · Michigan & Cairo\n\nMr. Nonchalant, and the most athletic of the group. A Division II All-American swimmer and a future AI guru: serious, with a taste of stupidity. Come to be inspired and to laugh, all at once.\n\n— M.E.W",
        '02.jpg': "27.4122° N, 33.6770° E\n\nTwo of the fittest in the pride, after a workout on the beach.",
      },
    },
    {
      id: 'muhammad', group: 'member', name: 'Dodo', object: 'drawing', actor: 'draw', color: '#a9c8ff',
      media: [],
      text: {
        '01.mp4': "~27.40° N, 33.67° E · December 2024\n\n08/08/06 · Brighton & Cairo\n\nArchitect, entrepreneur, visionary, and proudly an “idiot.” The most electric, outgoing and funniest of the pride. Follow Dodo’s adventures for a laugh you won’t want to miss.\n\n— M.N",
        '02.mp4': "~27.48° N, 33.92° E · June 2026\n\nClimbing aboard from the crystal shallows.",
        '03.mp4': "~27.40° N, 33.67° E · June 2026\n\nA crab caught by hand, and presented with great pride.",
        '04.jpg': "~27.40° N, 33.67° E · July 2026\n\nVictory, for reasons unknown.",
        '05.jpg': "~27.40° N, 33.67° E · December 2024\n\nOut cold on the deck. The sea always wins.",
        '06.jpg': "~27.40° N, 33.67° E\n\nHat on, crew assembled, setting out to sea.",
      },
    },
    {
      id: 'tareq', group: 'member', name: 'Teeka', object: 'gloves', actor: 'box', color: '#ff8f8f',
      media: [],
      text: {
        '01.jpg': "~27.48° N, 33.92° E · July 2024\n\n02/01/06 · Cairo\n\nA true rags-to-riches story: he knocked himself down and came back better than ever. Willpower and grit like no other, and as real as they come. A fine linguist; you will never beat him with words. Funny, with a hint of psycho. Follow Teeka, but don’t cross him. You don’t want to see the other side.\n\n— T.B",
        '02.mp4': "~27.40° N, 33.67° E · June 2026\n\nDusk settles over the road home.",
        '03.jpg': "~27.40° N, 33.67° E · July 2026\n\nA kingfish, and a crew too proud to stop smiling.",
        '04.jpg': "~27.40° N, 33.67° E · July 2026\n\nHanding over the prize, mid-sea.",
      },
    },
    {
      id: 'belal', group: 'member', name: 'Nosseir', object: 'angel', actor: 'mac', color: '#ffb3e6',
      media: [],
      text: {
        '01.jpg': "~27.40° N, 33.67° E · June 2025\n\n12/31/04 · Cairo\n\nThe entrepreneur: businessman, e-commerce, and the most effortless athlete you’ll ever meet. As fun and loyal as they come, always a step ahead with his eyes on the prize. Ruthless, with a big heart. Watch and learn, ladies and gentlemen.\n\n— B.N",
        '02.jpg': "~27.40° N, 33.67° E\n\nStanding tall on deck, the sea behind him.",
      },
    },
    {
      id: 'ibrahim', group: 'member', name: 'Hemi', object: 'hemi', actor: 'bench', color: '#ffbe6b',
      media: [],
      text: {
        '01.mp4': "~27.48° N, 33.92° E · June 2026\n\n08/06/06 · Boston & Cairo\n\nThe big one, the one who holds them together. Strength, endurance and intellect. He’ll find a solution to any problem, make you laugh until it hurts, and follow you to the grave if he has to.\n\n— I.M",
        '02.jpg': "~27.40° N, 33.67° E\n\nBucket hat, lagoon breeze, a lazy afternoon on the water.",
        '03.jpg': "27.4590° N, 33.8720° E\n\nHoodies on and the wind up, far out on the Red Sea.",
        '04.jpg': "27.4161° N, 33.6637° E\n\nOne last selfie as the lagoon turns pink.",
      },
    },
    {
      id: 'bilal', group: 'member', name: 'Bilo', object: 'perfume', actor: 'spray', color: '#6fffc8',
      media: [],
      text: {
        '01.jpg': "~27.40° N, 33.67° E · January 2024\n\n02/27/06 · Cairo & Barcelona\n\nEnergy and discipline like no other, and fun like no other. Unmatched athleticism, charisma and intellect, carried by an infectious smile. The guy you want to be around, and the one who will never leave you when you’re in need.\n\n— B.S",
        '02.jpg': "~27.40° N, 33.67° E · July 2026\n\nThe catch of the day, held high above the wake.",
        '03.jpg': "~27.40° N, 33.67° E\n\nFour smiles, one frame.",
        '04.jpg': "27.4837° N, 33.9219° E\n\nCurls, sunshine and a grin, far out at sea.",
      },
    },
  ],
};
