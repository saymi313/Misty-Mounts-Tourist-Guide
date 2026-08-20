/**
 * Real Northern-Pakistan destination data for seeding the TouristSpot collection
 * (Gilgit-Baltistan, Khyber Pakhtunkhwa, Azad Jammu & Kashmir). Coordinates,
 * elevations and descriptions are real; photos reuse the app's bundled northern
 * imagery in /public (swap for spot-specific photos via the admin panel anytime).
 */

const IMG = ["/Hunza.jpg", "/Naran.jpg", "/Front.jpg", "/L1.jpg", "/L2.jpg", "/L3.jpg", "/L4.jpeg", "/Pic2.jpg", "/Pic3.jpg"];
let _i = 0;
const pic = () => IMG[_i++ % IMG.length];

const cities = [
  // ── Gilgit-Baltistan ──────────────────────────────────────────────────────
  {
    city: "Hunza",
    heroImage: "/Hunza.jpg",
    tagline: "Apricot orchards, ancient forts and the Karakoram at eye level.",
    nearbyPlaces: [
      { _id: "hunza-attabad-lake", name: "Attabad Lake", location: "Gojal, Hunza", elevation: "2,450 m", latitude: 36.3400, longitude: 74.8600, bestTime: "April to October", activities: ["Boating", "Photography", "Jet skiing"], description: "A startlingly turquoise lake formed by a 2010 landslide that dammed the Hunza River. Today its still, mineral-blue water draws boaters and photographers." },
      { _id: "hunza-passu-cones", name: "Passu Cones", location: "Passu, Upper Hunza", elevation: "6,106 m (peak)", latitude: 36.4667, longitude: 74.8833, bestTime: "May to September", activities: ["Photography", "Hiking", "Sightseeing"], description: "The cathedral-like spires of Tupopdan, among the most photographed peaks in Pakistan, towering over the Karakoram Highway." },
      { _id: "hunza-baltit-fort", name: "Baltit Fort", location: "Karimabad, Hunza", elevation: "2,500 m", latitude: 36.3256, longitude: 74.6694, bestTime: "March to November", activities: ["Sightseeing", "History", "Photography"], description: "A 700-year-old fort perched above Karimabad, once the seat of the Mirs of Hunza, restored and open as a museum." },
      { _id: "hunza-altit-fort", name: "Altit Fort", location: "Altit, Hunza", elevation: "2,400 m", latitude: 36.3389, longitude: 74.6469, bestTime: "March to November", activities: ["Sightseeing", "History"], description: "The oldest monument in Gilgit-Baltistan, over 1,000 years old, rising on a rock cliff above the Hunza River with royal gardens below." },
      { _id: "hunza-eagles-nest", name: "Eagle's Nest (Duikar)", location: "Duikar, Hunza", elevation: "3,000 m", latitude: 36.3600, longitude: 74.7000, bestTime: "May to October", activities: ["Photography", "Sunrise viewing", "Sightseeing"], description: "A ridgetop viewpoint above Karimabad famous for sunrise and sunset panoramas over Rakaposhi, Ladyfinger and Golden Peak.", hiddenGem: true },
      { _id: "hunza-khunjerab-pass", name: "Khunjerab Pass", location: "Pak-China Border, Gojal", elevation: "4,693 m", latitude: 36.8500, longitude: 75.4200, bestTime: "May to October", activities: ["Sightseeing", "Photography", "Road trip"], description: "The highest paved international border crossing in the world, marking the frontier with China at the top of the Karakoram Highway." },
    ],
  },
  {
    city: "Skardu",
    heroImage: "/L3.jpg",
    tagline: "Gateway to K2, cold deserts and mirror-still alpine lakes.",
    nearbyPlaces: [
      { _id: "skardu-shangrila", name: "Shangrila (Lower Kachura Lake)", location: "Kachura, Skardu", elevation: "2,500 m", latitude: 35.4306, longitude: 75.7500, bestTime: "April to October", activities: ["Boating", "Photography", "Dining"], description: "The famous heart-shaped resort lake ringed by a red-roofed retreat, one of the most iconic scenes in Baltistan." },
      { _id: "skardu-upper-kachura", name: "Upper Kachura Lake", location: "Kachura, Skardu", elevation: "2,500 m", latitude: 35.4400, longitude: 75.7550, bestTime: "April to October", activities: ["Boating", "Fishing", "Hiking"], description: "A deep, clear glacial lake a short walk from Shangrila, quieter and framed by poplars and snow peaks." },
      { _id: "skardu-deosai", name: "Deosai National Park", location: "Deosai Plains", elevation: "4,114 m", latitude: 34.9800, longitude: 75.4000, bestTime: "July to September", activities: ["Camping", "Wildlife", "Photography"], description: "The Land of Giants, the world's second-highest plateau, a summer carpet of wildflowers and home to the Himalayan brown bear." },
      { _id: "skardu-sheosar-lake", name: "Sheosar Lake", location: "Deosai Plains", elevation: "4,142 m", latitude: 34.8300, longitude: 75.1300, bestTime: "July to September", activities: ["Camping", "Photography"], description: "A vivid blue high-altitude lake set in the Deosai plains, reflecting Nanga Parbat on still mornings.", hiddenGem: true },
      { _id: "skardu-katpana-desert", name: "Katpana Cold Desert", location: "Skardu", elevation: "2,226 m", latitude: 35.3100, longitude: 75.6000, bestTime: "April to October", activities: ["Photography", "Sightseeing"], description: "One of the highest cold deserts in the world, its white sand dunes glowing against the surrounding peaks." },
      { _id: "skardu-shigar-fort", name: "Shigar Fort", location: "Shigar Valley", elevation: "2,300 m", latitude: 35.4200, longitude: 75.7333, bestTime: "March to November", activities: ["History", "Sightseeing", "Heritage stay"], description: "A 400-year-old Raja fort restored as a heritage residence at the mouth of the Shigar Valley, the route to K2." },
    ],
  },
  {
    city: "Gilgit",
    heroImage: "/L2.jpg",
    tagline: "The bustling hub of the Karakoram, gateway to every valley.",
    nearbyPlaces: [
      { _id: "gilgit-kargah-buddha", name: "Kargah Buddha", location: "Kargah Nallah, Gilgit", elevation: "1,700 m", latitude: 35.9167, longitude: 74.2500, bestTime: "April to October", activities: ["History", "Sightseeing"], description: "A large 7th-century Buddha carved into a cliff face in the Kargah valley, a relic of Gilgit's Buddhist past." },
      { _id: "gilgit-naltar-valley", name: "Naltar Valley", location: "Naltar, Gilgit", elevation: "2,900 m", latitude: 36.1667, longitude: 74.1833, bestTime: "May to September (ski Dec to Feb)", activities: ["Skiing", "Hiking", "Photography"], description: "A pine-forested valley famous for its ski slopes and the jeep track to a chain of coloured alpine lakes." },
      { _id: "gilgit-naltar-lakes", name: "Naltar Lakes", location: "Upper Naltar", elevation: "3,050 m", latitude: 36.2000, longitude: 74.2000, bestTime: "June to September", activities: ["Hiking", "Photography", "Fishing"], description: "A cluster of vividly coloured glacial lakes, blue, green and turquoise, above Naltar village.", hiddenGem: true },
    ],
  },
  {
    city: "Fairy Meadows",
    heroImage: "/Front.jpg",
    tagline: "The green balcony beneath Nanga Parbat, the Killer Mountain.",
    nearbyPlaces: [
      { _id: "fairy-meadows", name: "Fairy Meadows", location: "Diamer, near Raikot", elevation: "3,300 m", latitude: 35.3878, longitude: 74.5772, bestTime: "May to October", activities: ["Camping", "Hiking", "Photography"], description: "A lush alpine meadow of pine and wildflowers facing the north face of Nanga Parbat, reached by jeep and a final trek." },
      { _id: "fairy-nanga-base-camp", name: "Nanga Parbat Base Camp", location: "Raikot Face", elevation: "3,967 m", latitude: 35.3200, longitude: 74.5900, bestTime: "June to September", activities: ["Trekking", "Photography"], description: "A day trek beyond Beyal Camp to the foot of the world's ninth-highest mountain and its groaning glacier." },
      { _id: "fairy-beyal-camp", name: "Beyal Camp", location: "Above Fairy Meadows", elevation: "3,500 m", latitude: 35.3600, longitude: 74.5800, bestTime: "June to September", activities: ["Trekking", "Camping"], description: "A tiny cluster of huts on the trail to base camp, with the closest unobstructed views of Nanga Parbat.", hiddenGem: true },
    ],
  },
  {
    city: "Astore",
    heroImage: "/L1.jpg",
    tagline: "Alpine meadows and lakes on the eastern flank of Nanga Parbat.",
    nearbyPlaces: [
      { _id: "astore-rama-lake", name: "Rama Lake", location: "Rama, Astore", elevation: "3,300 m", latitude: 35.3639, longitude: 74.8100, bestTime: "June to September", activities: ["Camping", "Hiking", "Photography"], description: "A glacial lake above Rama Meadow, ringed by pine forest and glaciers spilling off Nanga Parbat." },
      { _id: "astore-rama-meadow", name: "Rama Meadow", location: "Rama, Astore", elevation: "3,050 m", latitude: 35.3700, longitude: 74.8000, bestTime: "June to September", activities: ["Camping", "Sightseeing"], description: "A wide green meadow of tall pines and grazing horses, a serene base for exploring the Astore valley." },
    ],
  },

  // ── Khyber Pakhtunkhwa ────────────────────────────────────────────────────
  {
    city: "Naran",
    heroImage: "/Naran.jpg",
    tagline: "Kaghan's crown, home to Saif-ul-Malook and the road to Babusar.",
    nearbyPlaces: [
      { _id: "naran-saiful-malook", name: "Saif-ul-Malook Lake", location: "Naran, Kaghan", elevation: "3,224 m", latitude: 34.8797, longitude: 73.6931, bestTime: "June to September", activities: ["Boating", "Photography", "Hiking"], description: "A legendary glacial lake wrapped in folklore, mirroring Malika Parbat in water so clear it seems to glow." },
      { _id: "naran-lulusar-lake", name: "Lulusar Lake", location: "Kaghan Valley", elevation: "3,410 m", latitude: 35.0900, longitude: 73.9200, bestTime: "June to September", activities: ["Photography", "Sightseeing"], description: "The source of the Kunhar River, a long emerald lake beside the Naran to Babusar road." },
      { _id: "naran-babusar-top", name: "Babusar Top", location: "Kaghan / Chilas boundary", elevation: "4,173 m", latitude: 35.1500, longitude: 74.0500, bestTime: "July to September", activities: ["Road trip", "Photography", "Sightseeing"], description: "The high pass linking Kaghan to the Karakoram Highway, with sweeping views across the valleys." },
      { _id: "naran-ansoo-lake", name: "Ansoo Lake", location: "Malika Parbat, Naran", elevation: "4,245 m", latitude: 34.8300, longitude: 73.7100, bestTime: "July to August", activities: ["Trekking", "Photography"], description: "A tear-shaped alpine lake reached by a demanding high trek, one of Kaghan's most rewarding hikes.", hiddenGem: true },
    ],
  },
  {
    city: "Mansehra",
    heroImage: "/L1.jpg",
    tagline: "Gateway to Kaghan, with green plateaus and ancient edicts.",
    nearbyPlaces: [
      { _id: "mansehra-shogran", name: "Shogran", location: "Shogran, Kaghan", elevation: "2,362 m", latitude: 34.6300, longitude: 73.4600, bestTime: "April to October", activities: ["Sightseeing", "Photography", "Nature walks"], description: "A green plateau of pine forest above the Kaghan valley, the base for the Siri Paye jeep track." },
      { _id: "mansehra-siri-paye", name: "Siri Paye Meadows", location: "Above Shogran", elevation: "3,000 m", latitude: 34.6500, longitude: 73.4800, bestTime: "June to September", activities: ["Jeep safari", "Photography", "Camping"], description: "High meadows above Shogran with mirror ponds and views of Makra Peak and Malika Parbat.", hiddenGem: true },
      { _id: "mansehra-rock-edicts", name: "Mansehra Rock Edicts", location: "Mansehra city", elevation: "1,088 m", latitude: 34.3333, longitude: 73.2000, bestTime: "Year-round", activities: ["History", "Sightseeing"], description: "Ashoka's 3rd-century BCE edicts carved on three boulders, among the oldest surviving inscriptions in Pakistan." },
    ],
  },
  {
    city: "Swat",
    heroImage: "/L2.jpg",
    tagline: "The Switzerland of the East, green valleys and alpine lakes.",
    nearbyPlaces: [
      { _id: "swat-mahodand-lake", name: "Mahodand Lake", location: "Ushu, Kalam", elevation: "2,865 m", latitude: 35.6800, longitude: 72.6300, bestTime: "May to September", activities: ["Boating", "Fishing", "Camping"], description: "The Lake of Fishes at the head of the Ushu Valley, fed by glaciers and circled by pine-clad slopes." },
      { _id: "swat-malam-jabba", name: "Malam Jabba", location: "Malam Jabba, Swat", elevation: "2,804 m", latitude: 34.8000, longitude: 72.5667, bestTime: "December to March (ski), May to September", activities: ["Skiing", "Chairlift", "Zip-line"], description: "Pakistan's premier ski resort, with a chairlift, snow slopes in winter and green meadows in summer." },
      { _id: "swat-kalam", name: "Kalam Valley", location: "Upper Swat", elevation: "2,000 m", latitude: 35.4900, longitude: 72.5800, bestTime: "April to October", activities: ["Sightseeing", "Riverside walks", "Photography"], description: "The lush confluence town where the Ushu and Utror rivers meet, a base for exploring upper Swat." },
      { _id: "swat-ushu-forest", name: "Ushu Forest", location: "Ushu, Kalam", elevation: "2,300 m", latitude: 35.5300, longitude: 72.6000, bestTime: "May to September", activities: ["Nature walks", "Photography"], description: "A dense deodar forest along the Ushu River on the way to Mahodand, cool and fragrant even in summer.", hiddenGem: true },
      { _id: "swat-white-palace", name: "White Palace, Marghazar", location: "Marghazar, Swat", elevation: "1,300 m", latitude: 34.7000, longitude: 72.3600, bestTime: "March to October", activities: ["History", "Sightseeing"], description: "The marble summer palace of the Wali of Swat, set among terraced gardens below Elum mountain." },
    ],
  },
  {
    city: "Kumrat",
    heroImage: "/L4.jpeg",
    tagline: "Deodar forests, meadows and waterfalls in Upper Dir.",
    nearbyPlaces: [
      { _id: "kumrat-valley", name: "Kumrat Valley", location: "Upper Dir", elevation: "2,042 m", latitude: 35.5300, longitude: 72.1000, bestTime: "May to September", activities: ["Camping", "Riverside walks", "Photography"], description: "A broad valley of towering deodar cedars along the Panjkora River, still wonderfully unspoilt." },
      { _id: "kumrat-jahaz-banda", name: "Jahaz Banda Meadow", location: "Thal, Upper Dir", elevation: "3,100 m", latitude: 35.5800, longitude: 72.1500, bestTime: "June to September", activities: ["Trekking", "Camping"], description: "A high green meadow above Kumrat and the gateway to the Katora Lake trek.", hiddenGem: true },
    ],
  },
  {
    city: "Chitral",
    heroImage: "/Pic2.jpg",
    tagline: "Kalash culture, Tirich Mir and the passes of the Hindu Kush.",
    nearbyPlaces: [
      { _id: "chitral-kalash-bumburet", name: "Kalash Valley (Bumburet)", location: "Bumburet, Chitral", elevation: "1,640 m", latitude: 35.7200, longitude: 71.6700, bestTime: "May to September (festivals in spring/summer)", activities: ["Cultural tour", "Photography", "Festivals"], description: "The largest of the Kalash valleys, home to an ancient indigenous culture with its own religion, dress and festivals." },
      { _id: "chitral-shandur-pass", name: "Shandur Pass", location: "Chitral / Ghizer boundary", elevation: "3,700 m", latitude: 36.0800, longitude: 72.5300, bestTime: "June to September", activities: ["Polo festival", "Camping", "Photography"], description: "The Roof of the World, host to the world's highest polo ground and its famous summer polo festival." },
      { _id: "chitral-gol-park", name: "Chitral Gol National Park", location: "Chitral", elevation: "2,500 m", latitude: 35.8800, longitude: 71.7500, bestTime: "April to October", activities: ["Wildlife", "Hiking"], description: "A forested valley reserve beneath Tirich Mir, a stronghold of the markhor, Pakistan's national animal.", hiddenGem: true },
    ],
  },

  // ── Azad Jammu & Kashmir ──────────────────────────────────────────────────
  {
    city: "Neelum",
    heroImage: "/Pic3.jpg",
    tagline: "Kashmir's greenest valley, ringed by forests and alpine lakes.",
    nearbyPlaces: [
      { _id: "neelum-ratti-gali", name: "Ratti Gali Lake", location: "Dowarian, Neelum", elevation: "3,700 m", latitude: 34.7900, longitude: 74.2600, bestTime: "July to September", activities: ["Trekking", "Camping", "Photography"], description: "An alpine glacial lake framed by snow peaks and summer wildflowers, reached by jeep and a short trek from Dowarian." },
      { _id: "neelum-arang-kel", name: "Arang Kel", location: "Kel, Neelum", elevation: "2,600 m", latitude: 34.8000, longitude: 74.3800, bestTime: "May to October", activities: ["Hiking", "Photography", "Village stay"], description: "A storybook meadow village above Kel, reached by chairlift and a forest climb, with views over the valley." },
      { _id: "neelum-sharda", name: "Sharda", location: "Sharda, Neelum", elevation: "1,981 m", latitude: 34.7900, longitude: 74.1800, bestTime: "April to October", activities: ["Sightseeing", "History", "Riverside walks"], description: "A riverside town home to the ruins of the ancient Sharda Peeth, a centre of learning on the Neelum River." },
      { _id: "neelum-kutton-waterfall", name: "Kutton (Jagran) Waterfall", location: "Kutton, Neelum", elevation: "1,700 m", latitude: 34.6300, longitude: 73.7900, bestTime: "April to October", activities: ["Photography", "Nature walks"], description: "A powerful forest waterfall in the Jagran valley, a cool stop on the lower Neelum road.", hiddenGem: true },
      { _id: "neelum-kel", name: "Kel", location: "Upper Neelum", elevation: "2,097 m", latitude: 34.8000, longitude: 74.3800, bestTime: "May to October", activities: ["Sightseeing", "Base for treks"], description: "A high valley town at the confluence of the Shounter and Neelum rivers, the base for Arang Kel and Shounter." },
    ],
  },
  {
    city: "Rawalakot",
    heroImage: "/Pic2.jpg",
    tagline: "The pine-clad hills and lakes of the Poonch valley.",
    nearbyPlaces: [
      { _id: "rawalakot-banjosa-lake", name: "Banjosa Lake", location: "Banjosa, Rawalakot", elevation: "1,981 m", latitude: 33.7900, longitude: 73.8500, bestTime: "April to October", activities: ["Boating", "Photography", "Picnic"], description: "A serene artificial lake surrounded by dense pine forest, a favourite retreat above Rawalakot." },
      { _id: "rawalakot-toli-pir", name: "Toli Pir", location: "Rawalakot", elevation: "2,621 m", latitude: 33.7500, longitude: 73.9200, bestTime: "May to October", activities: ["Hiking", "Photography", "Camping"], description: "The highest point around Rawalakot, a ridge of rolling meadows with panoramic views of the Pir Panjal.", hiddenGem: true },
    ],
  },
];

const PROVINCE = {
  Hunza: "Gilgit-Baltistan", Skardu: "Gilgit-Baltistan", Gilgit: "Gilgit-Baltistan",
  "Fairy Meadows": "Gilgit-Baltistan", Astore: "Gilgit-Baltistan",
  Naran: "Khyber Pakhtunkhwa", Mansehra: "Khyber Pakhtunkhwa", Swat: "Khyber Pakhtunkhwa",
  Kumrat: "Khyber Pakhtunkhwa", Chitral: "Khyber Pakhtunkhwa",
  Neelum: "Azad Jammu & Kashmir", Rawalakot: "Azad Jammu & Kashmir",
};

cities.forEach((c) => {
  c.province = PROVINCE[c.city] || "";
  c.nearbyPlaces.forEach((p) => { if (!p.picture) p.picture = pic(); });
});

module.exports = cities;
