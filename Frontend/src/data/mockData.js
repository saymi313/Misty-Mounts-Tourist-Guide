// ─────────────────────────────────────────────────────────────────────────────
// Misty Mounts — Dummy data layer
//
// The backend is disconnected for this phase. Every shape below mirrors what the
// original Express/Mongo API returned, so components keep working unchanged.
// Images use deterministic picsum seeds so they always load and stay stable
// across reloads — swap `img()` for real Hazara photography later.
// ─────────────────────────────────────────────────────────────────────────────

/** Deterministic placeholder image keyed to a slug. */
export const img = (seed, w = 1200, h = 800) =>
  `https://picsum.photos/seed/mm-${seed}/${w}/${h}`;

// ── Tourist spots, grouped by city (mirrors GET /api/admin/spots) ─────────────
export const spotsByCity = {
  Hunza: {
    city: "Hunza",
    heroImage: img("hunza-hero", 1600, 900),
    tagline: "Terraced orchards, ancient forts, and the seven-thousanders that guard them.",
    nearbyPlaces: [
      {
        _id: "hunza-attabad",
        name: "Attabad Lake",
        location: "Gojal, Upper Hunza",
        picture: img("attabad", 1000, 750),
        description:
          "A startlingly turquoise lake born from a 2010 landslide that dammed the Hunza River. Today its still, mineral-blue water mirrors the surrounding peaks — best seen from a wooden boat at first light.",
        latitude: 36.3389,
        longitude: 74.8672,
        elevation: "2,428 m",
        bestTime: "May – October",
        activities: ["Boating", "Jet ski", "Lakeside cafés", "Photography"],
        hiddenGem: true,
        curatedBy: "Karim, local guide",
      },
      {
        _id: "hunza-baltit",
        name: "Baltit Fort",
        location: "Karimabad, Hunza",
        picture: img("baltit", 1000, 750),
        description:
          "A 700-year-old fort perched above Karimabad, its Tibetan-influenced timber-and-stone architecture watching over the valley. Restored by the Aga Khan Trust, its rooftop offers the definitive Hunza panorama.",
        latitude: 36.3245,
        longitude: 74.6693,
        elevation: "2,500 m",
        bestTime: "April – November",
        activities: ["Guided tours", "History walk", "Sunset viewing"],
        hiddenGem: false,
      },
      {
        _id: "hunza-eagles-nest",
        name: "Eagle's Nest Viewpoint",
        location: "Duikar, Hunza",
        picture: img("eaglesnest", 1000, 750),
        description:
          "The highest viewpoint in the valley, famous for sunrises that set Rakaposhi and Lady Finger peaks alight. Worth the pre-dawn jeep ride up the switchbacks from Karimabad.",
        latitude: 36.3556,
        longitude: 74.6861,
        elevation: "2,850 m",
        bestTime: "Year-round (clear mornings)",
        activities: ["Sunrise viewing", "Stargazing", "Short hikes"],
        hiddenGem: true,
        curatedBy: "Karim, local guide",
      },
    ],
  },
  Skardu: {
    city: "Skardu",
    heroImage: img("skardu-hero", 1600, 900),
    tagline: "The gateway to the Karakoram — cold deserts, alpine lakes, and K2 beyond.",
    nearbyPlaces: [
      {
        _id: "skardu-shangrila",
        name: "Shangrila (Lower Kachura Lake)",
        location: "Kachura, Skardu",
        picture: img("shangrila", 1000, 750),
        description:
          "A heart-shaped lake ringed by a resort of red-roofed cottages and poplar trees. The 'Heaven on Earth' that gave the region its Shangri-La nickname.",
        latitude: 35.4319,
        longitude: 75.4419,
        elevation: "2,500 m",
        bestTime: "April – October",
        activities: ["Boating", "Trout dining", "Garden walks"],
        hiddenGem: false,
      },
      {
        _id: "skardu-deosai",
        name: "Deosai Plains",
        location: "Deosai National Park",
        picture: img("deosai", 1000, 750),
        description:
          "The 'Land of the Giants' — the world's second-highest plateau, a rolling summer wilderness of wildflowers, brown bears, and star-blasted night skies above 4,000 metres.",
        latitude: 34.9667,
        longitude: 75.4,
        elevation: "4,114 m",
        bestTime: "July – September",
        activities: ["Wildlife safari", "Camping", "Sheosar Lake trek"],
        hiddenGem: true,
        curatedBy: "Fatima, local guide",
      },
      {
        _id: "skardu-cold-desert",
        name: "Katpana Cold Desert",
        location: "Katpana, Skardu",
        picture: img("katpana", 1000, 750),
        description:
          "One of the highest deserts in the world — great silver dunes that sit against snow-capped peaks, glowing at dusk. Surreal, quiet, and unlike anywhere else in Pakistan.",
        latitude: 35.3339,
        longitude: 75.5361,
        elevation: "2,226 m",
        bestTime: "May – September",
        activities: ["Dune walks", "Camel rides", "Sunset photography"],
        hiddenGem: true,
        curatedBy: "Fatima, local guide",
      },
    ],
  },
  "Naran Kaghan": {
    city: "Naran Kaghan",
    heroImage: img("naran-hero", 1600, 900),
    tagline: "Glacial rivers, meadow campsites, and the fabled Saif-ul-Malook.",
    nearbyPlaces: [
      {
        _id: "naran-saiful",
        name: "Saif-ul-Malook Lake",
        location: "Naran, Kaghan Valley",
        picture: img("saiful", 1000, 750),
        description:
          "An alpine lake wrapped in local legend, fed by the Malika Parbat glacier. On a still morning the reflection of the peaks doubles the sky.",
        latitude: 34.8783,
        longitude: 73.6931,
        elevation: "3,224 m",
        bestTime: "June – September",
        activities: ["Boating", "Jeep safari", "Lakeside horse rides"],
        hiddenGem: false,
      },
      {
        _id: "naran-lulusar",
        name: "Lulusar Lake",
        location: "Kaghan Valley",
        picture: img("lulusar", 1000, 750),
        description:
          "The primary source of the Kunhar River, this long emerald lake sits beside the Babusar road — often overlooked by travellers rushing to Naran, and all the better for it.",
        latitude: 35.0908,
        longitude: 73.9139,
        elevation: "3,410 m",
        bestTime: "June – September",
        activities: ["Roadside stops", "Photography", "Picnics"],
        hiddenGem: true,
        curatedBy: "Imran, local guide",
      },
    ],
  },
  "Fairy Meadows": {
    city: "Fairy Meadows",
    heroImage: img("fairy-hero", 1600, 900),
    tagline: "A green balcony beneath the Killer Mountain — Nanga Parbat, up close.",
    nearbyPlaces: [
      {
        _id: "fairy-meadows",
        name: "Fairy Meadows",
        location: "Raikot, Diamer",
        picture: img("fairymeadows", 1000, 750),
        description:
          "A lush grassland at the foot of Nanga Parbat, reached by jeep and a walk through pine forest. Wooden huts, grazing horses, and the ninth-highest mountain on Earth for a backdrop.",
        latitude: 35.3869,
        longitude: 74.5772,
        elevation: "3,300 m",
        bestTime: "May – October",
        activities: ["Base camp trek", "Camping", "Forest walks"],
        hiddenGem: true,
        curatedBy: "Sher Ali, local guide",
      },
      {
        _id: "fairy-basecamp",
        name: "Nanga Parbat Base Camp",
        location: "Beyal, Diamer",
        picture: img("basecamp", 1000, 750),
        description:
          "A day trek from the meadows to stand at the foot of the Raikot face of Nanga Parbat — glacier, moraine, and a 8,126 m wall of rock and ice directly overhead.",
        latitude: 35.2381,
        longitude: 74.5892,
        elevation: "3,967 m",
        bestTime: "June – September",
        activities: ["Day trek", "Glacier viewing", "Mountaineering"],
        hiddenGem: false,
      },
    ],
  },
  Swat: {
    city: "Swat",
    heroImage: img("swat-hero", 1600, 900),
    tagline: "The 'Switzerland of the East' — pine valleys, rivers, and Gandharan ruins.",
    nearbyPlaces: [
      {
        _id: "swat-kalam",
        name: "Kalam Valley",
        location: "Upper Swat",
        picture: img("kalam", 1000, 750),
        description:
          "Where the Ushu and Utror rivers meet, Kalam is a base for exploring waterfalls, forests, and the high meadows above. Dense pine, cool air, and roadside trout.",
        latitude: 35.4889,
        longitude: 72.5825,
        elevation: "2,000 m",
        bestTime: "April – October",
        activities: ["River walks", "4x4 to Mahodand", "Local bazaar"],
        hiddenGem: false,
      },
      {
        _id: "swat-mahodand",
        name: "Mahodand Lake",
        location: "Ushu, Upper Swat",
        picture: img("mahodand", 1000, 750),
        description:
          "The 'Lake of Fishes', set in the Ushu valley beyond Kalam — reachable by a rugged jeep track through forest and glacial streams. Trout, rowboats, and horse rides on the far bank.",
        latitude: 35.6667,
        longitude: 72.6833,
        elevation: "2,865 m",
        bestTime: "May – September",
        activities: ["Boating", "Trout fishing", "Horse rides"],
        hiddenGem: true,
        curatedBy: "Zubair, local guide",
      },
    ],
  },
  Gilgit: {
    city: "Gilgit",
    heroImage: img("gilgit-hero", 1600, 900),
    tagline: "Where three great ranges meet — Karakoram, Himalaya, and Hindu Kush.",
    nearbyPlaces: [
      {
        _id: "gilgit-kargah",
        name: "Kargah Buddha",
        location: "Kargah Nallah, Gilgit",
        picture: img("kargah", 1000, 750),
        description:
          "A seventh-century Buddha carved into a cliff face above the Kargah stream — a quiet reminder of the region's role on the ancient Silk Road.",
        latitude: 35.8994,
        longitude: 74.2542,
        elevation: "1,600 m",
        bestTime: "March – November",
        activities: ["Heritage walk", "Stream picnics"],
        hiddenGem: true,
        curatedBy: "Nadia, local guide",
      },
      {
        _id: "gilgit-naltar",
        name: "Naltar Valley",
        location: "Naltar, Gilgit",
        picture: img("naltar", 1000, 750),
        description:
          "A pine-forested valley famous for its coloured lakes and, in winter, one of Pakistan's few ski slopes. A jeep ride up from Nomal opens onto alpine calm.",
        latitude: 36.1667,
        longitude: 74.1833,
        elevation: "2,900 m",
        bestTime: "May – October (skiing Dec – Feb)",
        activities: ["Coloured lakes trek", "Skiing", "Camping"],
        hiddenGem: true,
        curatedBy: "Nadia, local guide",
      },
    ],
  },
};

export const cities = Object.keys(spotsByCity);

/** Flat list of every spot (mirrors GET /api/admin/spots as an array). */
export const allSpots = Object.values(spotsByCity);

/** Convenience flat array of individual places for cards. */
export const allPlaces = allSpots.flatMap((s) =>
  s.nearbyPlaces.map((p) => ({ ...p, city: s.city }))
);

// ── Accommodations — hotels & food (mirrors GET /api/admin/accommodations) ────
export const accommodations = [
  {
    _id: "acc-serena-hunza",
    name: "Hunza Serena Inn",
    type: "hotel",
    picture: img("serena-hunza", 1000, 700),
    location: "Karimabad, Hunza",
    city: "Hunza",
    description:
      "A stone-and-timber retreat built in traditional Hunza style, terraced into the hillside with every room facing Rakaposhi. Apricot-wood interiors, a garden of walnut trees, and slow mornings.",
    price: 27000,
    rating: 4.8,
    reviews: 214,
    amenities: ["Mountain-view rooms", "Garden restaurant", "Fireplace lounge", "Free Wi-Fi", "Airport pickup"],
    tags: ["Boutique", "Heritage"],
  },
  {
    _id: "acc-luxus-attabad",
    name: "Luxus Hunza — Attabad Lake",
    type: "hotel",
    picture: img("luxus-attabad", 1000, 700),
    location: "Gojal, Attabad Lake",
    city: "Hunza",
    description:
      "Glass-fronted chalets stepping down to the turquoise shoreline of Attabad Lake. Wake to the water, breakfast on the deck, and take a boat straight from the jetty.",
    price: 36000,
    rating: 4.7,
    reviews: 168,
    amenities: ["Lakefront", "Private jetty", "Heated rooms", "Restaurant", "Boat tours"],
    tags: ["Lakefront", "Luxury"],
  },
  {
    _id: "acc-shangrila-skardu",
    name: "Shangrila Resort Skardu",
    type: "hotel",
    picture: img("shangrila-resort", 1000, 700),
    location: "Lower Kachura Lake, Skardu",
    city: "Skardu",
    description:
      "The original 'Heaven on Earth' resort — red-roofed cottages set among poplars around a heart-shaped lake, with a restaurant built into the fuselage of an old aircraft.",
    price: 24000,
    rating: 4.6,
    reviews: 302,
    amenities: ["Lakeside cottages", "Trout restaurant", "Gardens", "Boating", "Family rooms"],
    tags: ["Classic", "Family"],
  },
  {
    _id: "acc-cafe-de-hunza",
    name: "Café de Hunza",
    type: "food",
    picture: img("cafe-hunza", 1000, 700),
    location: "Karimabad, Hunza",
    city: "Hunza",
    description:
      "The valley's most-loved café, famous for walnut cake and organic apricot-kernel coffee. A tiny stone terrace that catches the afternoon sun over Karimabad's rooftops.",
    price: 1800,
    rating: 4.9,
    reviews: 540,
    amenities: ["Walnut cake", "Apricot coffee", "Terrace seating", "Vegetarian"],
    tags: ["Café", "Local favourite"],
  },
  {
    _id: "acc-trout-kalam",
    name: "Ushu Trout House",
    type: "food",
    picture: img("trout-kalam", 1000, 700),
    location: "Kalam, Swat",
    city: "Swat",
    description:
      "Riverside grill serving fresh Swat trout the same day it's caught — charcoal-grilled, served with local bread beside the rushing Ushu river.",
    price: 2700,
    rating: 4.7,
    reviews: 176,
    amenities: ["Fresh trout", "Riverside seating", "Halal", "Local bread"],
    tags: ["Riverside", "Grill"],
  },
  {
    _id: "acc-ptdc-naran",
    name: "PTDC Motel Naran",
    type: "hotel",
    picture: img("ptdc-naran", 1000, 700),
    location: "Naran, Kaghan Valley",
    city: "Naran Kaghan",
    description:
      "A dependable riverside base in the heart of Naran, walking distance to the bazaar and the jeep stand for Saif-ul-Malook. Simple, warm rooms with the Kunhar rushing below.",
    price: 14000,
    rating: 4.3,
    reviews: 128,
    amenities: ["Riverside", "Restaurant", "Jeep tours", "Heating", "Parking"],
    tags: ["Value", "Central"],
  },
];

// ── Transportation (mirrors GET /api/admin/transportation/:spotId) ────────────
export const transportationBySpot = {
  default: [
    {
      _id: "tr-1",
      type: "Jeep (4x4)",
      from: "Karimabad",
      to: "Trailhead",
      provider: "Hunza Adventure Jeeps",
      duration: "45 min",
      price: 6000,
      schedule: "On demand, 6:00 AM – 5:00 PM",
      seats: 6,
    },
    {
      _id: "tr-2",
      type: "Shared van",
      from: "Gilgit",
      to: "Regional hub",
      provider: "NATCO",
      duration: "2 hr 30 min",
      price: 1500,
      schedule: "Daily 7:00 AM, 1:00 PM",
      seats: 14,
    },
    {
      _id: "tr-3",
      type: "Private car",
      from: "Airport",
      to: "Town centre",
      provider: "Silk Route Cars",
      duration: "1 hr 10 min",
      price: 8000,
      schedule: "24/7 on booking",
      seats: 4,
    },
  ],
};

// ── Reviews / feedback (mirrors GET /api/feedback → { feedbacks: [...] }) ──────
export const feedbacks = [
  {
    _id: "fb-1",
    name: "Ayesha Khan",
    locationName: "Attabad Lake, Hunza",
    rating: 5,
    message:
      "The boat ride at sunrise was unreal — the water really is that blue. Our guide arranged everything and the lakeside café was the perfect stop after.",
    avatar: img("avatar-ayesha", 200, 200),
    date: "2026-06-14",
    trip: "Hunza, 6 days",
  },
  {
    _id: "fb-2",
    name: "Daniyal Raza",
    locationName: "Deosai Plains, Skardu",
    rating: 5,
    message:
      "Camped on the plateau under more stars than I've ever seen. Spotted a Himalayan brown bear at dawn. A genuinely once-in-a-lifetime landscape.",
    avatar: img("avatar-daniyal", 200, 200),
    date: "2026-05-29",
    trip: "Skardu, 8 days",
  },
  {
    _id: "fb-3",
    name: "Sara Malik",
    locationName: "Fairy Meadows",
    rating: 4,
    message:
      "The jeep track is not for the faint-hearted, but standing under Nanga Parbat makes every bump worth it. Wooden huts were cosy and the food was hearty.",
    avatar: img("avatar-sara", 200, 200),
    date: "2026-07-02",
    trip: "Fairy Meadows, 4 days",
  },
  {
    _id: "fb-4",
    name: "Bilal Ahmed",
    locationName: "Saif-ul-Malook, Naran",
    rating: 5,
    message:
      "Reached the lake early before the crowds and had the reflection of the peaks all to ourselves. The horse ride down was a highlight for the kids.",
    avatar: img("avatar-bilal", 200, 200),
    date: "2026-06-21",
    trip: "Kaghan Valley, 5 days",
  },
  {
    _id: "fb-5",
    name: "Hina Yousafzai",
    locationName: "Mahodand Lake, Swat",
    rating: 5,
    message:
      "Swat is impossibly green. Mahodand was calm and quiet on a weekday — we rowed out and had trout grilled riverside afterwards. Will be back.",
    avatar: img("avatar-hina", 200, 200),
    date: "2026-05-11",
    trip: "Swat, 5 days",
  },
  {
    _id: "fb-6",
    name: "Usman Tariq",
    locationName: "Katpana Cold Desert, Skardu",
    rating: 4,
    message:
      "A cold desert next to snow peaks sounds impossible until you're standing on the dunes at sunset. Surreal light, hardly another soul around.",
    avatar: img("avatar-usman", 200, 200),
    date: "2026-04-30",
    trip: "Skardu, 7 days",
  },
];

// ── Natural-disaster alerts (mirrors GET /api/natural-disaster/get-disaster) ──
export const disasters = [
  {
    _id: "nd-1",
    name: "Babusar Pass — Temporary Closure",
    location: "Babusar Top, Kaghan–Chilas Road",
    description:
      "The pass is closed to traffic after overnight snowfall. Clearance crews are on site; expect reopening within 24–48 hours. Use the Karakoram Highway via Naran as an alternative.",
    date: "2026-07-19",
    severity: "Medium",
    isResolved: false,
  },
  {
    _id: "nd-2",
    name: "Flash-flood Advisory — Hunza River",
    location: "Lower Hunza & Nagar",
    description:
      "Glacial-melt surge expected on the Hunza River this week. Avoid riverside camping and low crossings between 2 PM and 7 PM.",
    date: "2026-07-16",
    severity: "High",
    isResolved: false,
  },
];

// ── Weather (previously hard-coded in the client) ─────────────────────────────
export const weatherBySpot = {
  default: {
    main: { temp: 12, feels_like: 9, humidity: 58 },
    weather: [{ description: "Partly cloudy", icon: "cloud-sun" }],
    wind: { speed: 4 },
    forecast: [
      { day: "Mon", high: 15, low: 4, icon: "sun" },
      { day: "Tue", high: 13, low: 3, icon: "cloud-sun" },
      { day: "Wed", high: 10, low: 1, icon: "cloud-rain" },
      { day: "Thu", high: 14, low: 4, icon: "sun" },
      { day: "Fri", high: 16, low: 6, icon: "sun" },
    ],
  },
};

// ── Home page trip categories & packages ──────────────────────────────────────
export const categories = [
  { _id: "cat-1", name: "Lakes & Valleys", count: 24, icon: "waves", image: img("cat-lakes", 600, 800) },
  { _id: "cat-2", name: "Treks & Base Camps", count: 18, icon: "mountain", image: img("cat-treks", 600, 800) },
  { _id: "cat-3", name: "Forts & Heritage", count: 12, icon: "landmark", image: img("cat-heritage", 600, 800) },
  { _id: "cat-4", name: "Food & Cafés", count: 31, icon: "coffee", image: img("cat-food", 600, 800) },
];

// ── Bookings / payments (admin dashboard) ─────────────────────────────────────
export const bookings = [
  { _id: "bk-1", guest: "Ayesha Khan", avatar: img("avatar-ayesha", 120, 120), hotel: "Hunza Serena Inn", city: "Hunza", date: "2026-05-20", nights: 3, amount: 81000, status: "Confirmed" },
  { _id: "bk-2", guest: "Daniyal Raza", avatar: img("avatar-daniyal", 120, 120), hotel: "Shangrila Resort Skardu", city: "Skardu", date: "2026-05-18", nights: 4, amount: 96000, status: "Confirmed" },
  { _id: "bk-3", guest: "Sara Malik", avatar: img("avatar-sara", 120, 120), hotel: "Luxus Hunza — Attabad Lake", city: "Hunza", date: "2026-05-22", nights: 2, amount: 72000, status: "Pending" },
  { _id: "bk-4", guest: "Bilal Ahmed", avatar: img("avatar-bilal", 120, 120), hotel: "PTDC Motel Naran", city: "Naran Kaghan", date: "2026-05-15", nights: 5, amount: 70000, status: "Confirmed" },
  { _id: "bk-5", guest: "Hina Yousafzai", avatar: img("avatar-hina", 120, 120), hotel: "Café de Hunza", city: "Hunza", date: "2026-05-24", nights: 1, amount: 1800, status: "Cancelled" },
  { _id: "bk-6", guest: "Usman Tariq", avatar: img("avatar-usman", 120, 120), hotel: "Ushu Trout House", city: "Swat", date: "2026-05-19", nights: 2, amount: 5400, status: "Pending" },
];

// ── Schedule (right-rail "My Schedule") ───────────────────────────────────────
export const scheduleItems = [
  { _id: "sc-1", title: "Attabad Lake", image: img("attabad", 200, 200), from: "20 May", to: "23 May", people: 3 },
  { _id: "sc-2", title: "Deosai Plains", image: img("deosai", 200, 200), from: "20 May", to: "23 May", people: 2 },
  { _id: "sc-3", title: "Fairy Meadows", image: img("fairymeadows", 200, 200), from: "24 May", to: "27 May", people: 4 },
];

// ── Mock authenticated user (auto-login while backend is disconnected) ─────────
export const mockUser = {
  email: "traveller@mistymounts.pk",
  name: "Zara Ahmed",
  type: "user",
  phone: "+92 300 1234567",
  city: "Hunza",
  bio: "Slow traveller chasing apricot blossoms and quiet mountain mornings across Hazara.",
  memberSince: "2026-01-08",
};

// ── The signed-in traveller's saved spots (ids into `allPlaces`) ───────────────
export const savedSpotIds = [
  "hunza-attabad",
  "skardu-deosai",
  "hunza-eagles-nest",
  "skardu-cold-desert",
];

// ── The signed-in traveller's bookings (mirrors GET /api/bookings/me) ──────────
export const myBookings = [
  {
    _id: "mb-1", accId: "acc-serena-hunza", hotel: "Hunza Serena Inn", city: "Hunza",
    image: img("serena-hunza", 800, 600), checkIn: "2026-08-14", nights: 3, guests: 2,
    amount: 81000, status: "Upcoming", bookedOn: "2026-07-02", ref: "MM-8F3K2A",
  },
  {
    _id: "mb-2", accId: "acc-luxus-attabad", hotel: "Luxus Hunza — Attabad Lake", city: "Hunza",
    image: img("luxus-attabad", 800, 600), checkIn: "2026-09-02", nights: 2, guests: 2,
    amount: 72000, status: "Upcoming", bookedOn: "2026-07-10", ref: "MM-2P9Q7B",
  },
  {
    _id: "mb-3", accId: "acc-shangrila-skardu", hotel: "Shangrila Resort Skardu", city: "Skardu",
    image: img("shangrila-resort", 800, 600), checkIn: "2026-05-18", nights: 4, guests: 3,
    amount: 96000, status: "Completed", bookedOn: "2026-04-20", ref: "MM-5T1R4C",
  },
  {
    _id: "mb-4", accId: "acc-ptdc-naran", hotel: "PTDC Motel Naran", city: "Naran Kaghan",
    image: img("ptdc-naran", 800, 600), checkIn: "2026-06-11", nights: 2, guests: 4,
    amount: 28000, status: "Completed", bookedOn: "2026-05-30", ref: "MM-9K3M8D",
  },
  {
    _id: "mb-5", accId: "acc-cafe-de-hunza", hotel: "Café de Hunza", city: "Hunza",
    image: img("cafe-hunza", 800, 600), checkIn: "2026-04-02", nights: 1, guests: 2,
    amount: 1800, status: "Cancelled", bookedOn: "2026-03-25", ref: "MM-1B7N6E",
  },
];

// ── The signed-in traveller's notifications (mirrors GET /api/notifications) ────
export const notifications = [
  {
    _id: "nt-1", type: "booking", title: "Booking confirmed",
    body: "Your stay at Hunza Serena Inn on 14 Aug is confirmed. Reference MM-8F3K2A.",
    time: "2026-07-21T09:12:00", read: false, link: "/bookings",
  },
  {
    _id: "nt-2", type: "guide", title: "Karim replied to your message",
    body: "“Attabad is calm at sunrise — I can arrange a boat for 6 AM if you'd like.”",
    time: "2026-07-21T07:40:00", read: false, link: "/feedback",
  },
  {
    _id: "nt-3", type: "alert", title: "Weather advisory — Hunza River",
    body: "Light flooding expected near Gojal this weekend. Plan lake visits for the morning.",
    time: "2026-07-20T18:05:00", read: false, link: "/destinations",
  },
  {
    _id: "nt-4", type: "price", title: "Price drop on a saved stay",
    body: "Luxus Hunza — Attabad Lake is now Rs 36,000 / night for your travel dates.",
    time: "2026-07-19T14:22:00", read: true, link: "/saved",
  },
  {
    _id: "nt-5", type: "review", title: "Share your Skardu trip",
    body: "How was Shangrila Resort Skardu? Leave a review to help other travellers.",
    time: "2026-07-18T11:00:00", read: true, link: "/feedback",
  },
  {
    _id: "nt-6", type: "system", title: "Welcome to Misty Mounts",
    body: "Save the spots you love and we'll keep an eye on prices and mountain weather for you.",
    time: "2026-07-15T08:30:00", read: true, link: "/destinations",
  },
];

// ── Users & guides (admin management screen — dummy fallback) ──────────────────
export const adminUsers = [
  {
    _id: "usr-zara", name: mockUser.name, username: "zara", email: mockUser.email, type: "user",
    city: "Hunza", phone: "+92 300 1234567", bio: mockUser.bio, avatar: img("avatar-zara", 120, 120),
    interests: ["Trekking", "Lakes", "Food & cafés"], savedSpots: savedSpotIds, isVerified: true, memberSince: "2026-01-08",
  },
  {
    _id: "usr-karim", name: "Karim Ali", username: "karimguide", email: "karim@mistymounts.pk", type: "local guide",
    city: "Hunza", phone: "+92 345 2223344", bio: "Hunza-born guide — forts, glaciers and the best apricot cake.",
    avatar: img("guide-0", 120, 120), interests: ["Culture & forts", "Trekking"], savedSpots: [], isVerified: true, memberSince: "2025-11-02",
  },
  {
    _id: "usr-fatima", name: "Fatima Baig", username: "fatimaguide", email: "fatima@mistymounts.pk", type: "local guide",
    city: "Skardu", phone: "+92 346 5556677", bio: "Skardu & Deosai specialist — wildlife and cold-desert nights.",
    avatar: img("guide-1", 120, 120), interests: ["Wildlife", "Stargazing"], savedSpots: [], isVerified: true, memberSince: "2025-12-14",
  },
  ...feedbacks.slice(0, 4).map((f, i) => ({
    _id: `usr-t${i}`,
    name: f.name,
    username: f.name.toLowerCase().replace(/\s+/g, ""),
    email: `${f.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    type: "user",
    city: ["Hunza", "Skardu", "Naran Kaghan", "Swat"][i % 4],
    phone: "",
    bio: f.trip ? `Travelled: ${f.trip}` : "",
    avatar: f.avatar,
    interests: [],
    savedSpots: [],
    isVerified: i % 2 === 0,
    memberSince: "2026-03-10",
  })),
];
