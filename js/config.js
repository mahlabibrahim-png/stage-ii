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
        '10.jpg': "27.4297° N, 33.6602° E · June 2025\n\nMorning over the lagoons, where the town ends and the open sea begins.",
        '11.jpg': "27.4296° N, 33.6603° E · June 2025\n\nStraight down: pools, rooftops and gardens in neat rows.",
        '12.jpg': "27.4226° N, 33.6627° E · June 2025\n\nOne boat, one swimmer, and an endless sheet of green water.",
        '13.jpg': "27.4296° N, 33.6593° E · August 2025\n\nA whole lagoon wrapped in villas, glowing in the evening light.",
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
        '09.jpg': "~27.40° N, 33.67° E\n\nRiding the wake under the lights of the marina.",
        '10.jpg': "27.4151° N, 33.6633° E · June 2025\n\nA long, clean pull down the channel.",
      },
    },
    {
      // center: true puts this object in the middle of the home wheel
      id: 'film', group: 'collection', name: 'Film', object: 'camera', color: '#d9dadc', center: true,
      media: [],
      text: {
        '01.mp4': "27.4296° N, 33.6601° E · December 2024\n\nDear visitor,\n\nWelcome to Stage II. Here you will meet the seven members of a rare pride of young lions. Follow us through our adventures, and take your fill of the laughter and mischief we gather along the way.\n\nConsider this our gift: a small offering of joy, and a taste of freedom for anyone who cares to share it.\n\n— Stage II",
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
        '12.jpg': "29.9492° N, 31.3497° E · January 2026\n\nCars on the cliff edge and a table set in the middle of nowhere.",
        '13.jpg': "~29.95° N, 31.35° E · January 2026\n\nDust in the air, music up, and a party on the plateau.",
        '14.jpg': "~27.40° N, 33.67° E · August 2026\n\nSpikeball on the sand, and every point a war.",
        '15.jpg': "27.4227° N, 33.6630° E · June 2025\n\nHolding our breath at the bottom of the pool.",
      },
    },
    {
      id: 'mahmoud', group: 'member', name: 'Doodo', object: 'goggles', actor: 'swim', color: '#6fe9ff',
      media: [],
      text: {
        '01.jpg': "27.4186° N, 33.6631° E\n\n04/29/06 · Michigan & Cairo\n\nMr. Nonchalant, and the most athletic of the group. A Division II All-American swimmer and a future AI guru: serious, with a taste of stupidity. Come to be inspired and to laugh, all at once.\n\n— M.E.W",
        '02.jpg': "27.4122° N, 33.6770° E\n\nTwo of the fittest in the pride, after a workout on the beach.",
        '03.jpg': "27.5021° N, 33.9327° E · January 2025\n\nTowels down on an empty island beach, the whole day ahead of us.",
        '04.jpg': "29.9491° N, 31.3499° E · January 2026\n\nFire lit and the grill loaded at the edge of the desert, just outside Cairo.",
        '05.jpg': "27.4238° N, 33.6613° E · June 2025\n\nGliding under the bridge as the sun goes down.",
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
        '07.jpg': "27.5021° N, 33.9321° E · January 2025\n\nBucket hat, coral flats and the widest grin on the island.",
        '08.jpg': "~27.40° N, 33.67° E · June 2025\n\nOver the side and into the turquoise.",
        '09.jpg': "27.4214° N, 33.6628° E · June 2025\n\nTwo cameras, one afternoon, nothing but sunshine.",
        '10.jpg': "~27.40° N, 33.67° E · June 2025\n\nDown on his knees for the shot. Every frame matters.",
        '11.jpg': "27.4228° N, 33.6630° E · June 2025\n\nTongues out, glasses on: the official portrait.",
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
        '03.jpg': "~27.40° N, 33.67° E · December 2025\n\nTowels on, cooler stocked, holding court on the sand.",
        '04.jpg': "27.4185° N, 33.6631° E · June 2025\n\nSalt in his hair as the boat heads home in the dark.",
        '05.jpg': "~27.40° N, 33.67° E · June 2025\n\nA crab for an earring. Fashion, island style.",
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
        '05.jpg': "~29.95° N, 31.35° E · February 2025\n\nAn axe, a sandstorm and absolutely no plan.",
        '06.jpg': "~27.40° N, 33.67° E\n\nSunburnt, salty and grinning on the back of the boat.",
        '07.jpg': "~29.95° N, 31.35° E · January 2026\n\nCairo on his back and dinner on the grill.",
        '08.jpg': "~42.35° N, 71.06° W · November 2026\n\nThirteen miles in, and still performing for the camera.",
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
        '05.jpg': "27.3954° N, 33.6751° E · June 2025\n\nArm in arm and one leg up: an ice cream run, done properly.",
      },
    },
    {
      id: 'selim', group: 'member', name: 'Kika', object: 'huracan', actor: 'coffee', color: '#2f6b4a',
      media: [],
      text: {
        '01.jpg': "~27.40° N, 33.67° E · December 2024\n\nThe smartest in the room, and the most mysterious; some might say a vigilante. Mr. CEO, the founder, always working, always grinding, always ready to pounce on the next opportunity. The kindest heart, and ruthless in his ambition. Laugh and learn: Mr. Selim Al Ramlawy.\n\n— S.A.R",
        '02.jpg': "29.9566° N, 31.2669° E · March 2025\n\nThe first night of Ramadan, dressed for the occasion.",
        '03.jpg': "27.4245° N, 33.6597° E · December 2025\n\nGrinning into the dusk as the lagoon goes dark.",
        '04.jpg': "~27.40° N, 33.67° E · December 2025\n\nArms crossed at the bow, the board ready behind him.",
        '05.jpg': "27.4227° N, 33.6632° E · June 2025\n\nSprawled on the grass, the whole pride in one lazy frame.",
        '06.jpg': "27.4162° N, 33.6659° E · June 2025\n\nThree grins, one boat, all sun.",
      },
    },
  ],
};
