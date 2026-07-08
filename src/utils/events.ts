// src/utils/events.ts
// Local Events & Public Holidays database — 30+ destinations
// No API required. Month-based lookup with trip date awareness.

export type EventType = 'festival' | 'holiday' | 'season' | 'warning';

export interface LocalEvent {
  name: string;
  month: number;      // 1–12 (primary/start month)
  endMonth?: number;  // for multi-month seasons
  type: EventType;
  description: string;
  impact?: string;
  emoji: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS DATABASE — keyed by lowercase destination/country
// ─────────────────────────────────────────────────────────────────────────────
const EVENTS_DB: Record<string, LocalEvent[]> = {

  // ── THAILAND ──────────────────────────────────────────────────────────────
  'thailand': [
    { name: 'Songkran — Thai New Year', month: 4, type: 'festival', emoji: '💦', description: 'Biggest water festival in the world. Streets become giant water fights for 3+ days.', impact: 'Massive crowds. Book accommodation well in advance. Expect disruptions.' },
    { name: 'Loy Krathong', month: 11, type: 'festival', emoji: '🪔', description: 'Festival of lights — lanterns released on rivers and into the sky. Magical atmosphere especially in Chiang Mai.' },
    { name: 'King\'s Birthday', month: 12, type: 'holiday', emoji: '👑', description: 'Dec 5 — National holiday celebrating the late King\'s birthday.', impact: 'Government offices and many businesses closed.' },
    { name: 'Monsoon Season', month: 5, endMonth: 10, type: 'warning', emoji: '🌧️', description: 'Heavy rainfall throughout Thailand, especially Gulf Coast. Some islands may be inaccessible.', impact: 'Cheaper prices, fewer tourists, but expect rain daily.' },
    { name: 'High Season', month: 11, endMonth: 2, type: 'season', emoji: '☀️', description: 'Best weather — dry, sunny skies. Peak tourist season with higher prices and crowds.' },
  ],
  'bangkok': 'thailand' as unknown as LocalEvent[],
  'phuket': 'thailand' as unknown as LocalEvent[],
  'chiang mai': 'thailand' as unknown as LocalEvent[],

  // ── INDONESIA / BALI ──────────────────────────────────────────────────────
  'bali': [
    { name: 'Nyepi — Day of Silence', month: 3, type: 'holiday', emoji: '🤫', description: 'Unique Balinese New Year: entire island goes silent for 24 hours. No flights, no street activity, no lights outside.', impact: '⚠️ Bali airport closes. Plan travel around this date.' },
    { name: 'Galungan Festival', month: 6, type: 'festival', emoji: '🎋', description: 'Important Balinese holiday — streets decorated with penjor (bamboo poles). Temples come alive with offerings.' },
    { name: 'Bali Arts Festival', month: 6, endMonth: 7, type: 'festival', emoji: '🎭', description: 'Month-long celebration of Balinese arts, dance, and culture at Taman Budaya Art Centre in Denpasar.' },
    { name: 'Rainy Season', month: 11, endMonth: 3, type: 'warning', emoji: '🌦️', description: 'Afternoon rain showers common, mornings usually clear. Rice paddies are vibrant green.', impact: 'Lower prices, fewer tourists. Some surf spots change.' },
    { name: 'Dry Season — Best Time', month: 4, endMonth: 10, type: 'season', emoji: '🌞', description: 'Perfect weather — sunshine, low humidity, ideal for beaches, hiking, and outdoor activities.' },
  ],
  'indonesia': 'bali' as unknown as LocalEvent[],
  'denpasar': 'bali' as unknown as LocalEvent[],

  // ── JAPAN ──────────────────────────────────────────────────────────────────
  'japan': [
    { name: 'Cherry Blossom Season (Sakura)', month: 3, endMonth: 4, type: 'festival', emoji: '🌸', description: 'Japan\'s most iconic season. Parks fill with pink blossoms. Hanami (flower viewing) picnics everywhere.', impact: 'Extremely crowded and expensive. Book 6+ months in advance.' },
    { name: 'Golden Week', month: 4, endMonth: 5, type: 'holiday', emoji: '🎏', description: 'Late April–early May. A cluster of 4 national holidays. Most Japanese travel domestically.', impact: 'Hotels expensive. Shinkansen booked solid. Avoid if possible.' },
    { name: 'Obon Festival', month: 8, type: 'festival', emoji: '👻', description: 'Mid-August ancestor memorial festival. Traditional dances, lantern ceremonies, and family gatherings.', impact: 'Some businesses close. Many Japanese travel home — transport busy.' },
    { name: 'New Year (Shogatsu)', month: 1, type: 'holiday', emoji: '🎍', description: 'Jan 1–3. Most important Japanese holiday. Temples packed for first shrine visit.', impact: 'Many shops and restaurants closed. Book accommodation early.' },
    { name: 'Autumn Foliage (Koyo)', month: 10, endMonth: 11, type: 'season', emoji: '🍁', description: 'Japan\'s second peak season. Maples and ginkgo trees turn gold and red. Spectacular in Kyoto and Nikko.', impact: 'Popular and busy. Slightly more affordable than Sakura season.' },
  ],
  'tokyo': 'japan' as unknown as LocalEvent[],
  'osaka': 'japan' as unknown as LocalEvent[],
  'kyoto': 'japan' as unknown as LocalEvent[],

  // ── DUBAI / UAE ───────────────────────────────────────────────────────────
  'dubai': [
    { name: 'Ramadan', month: 3, endMonth: 4, type: 'warning', emoji: '🌙', description: 'Holy month of fasting (dates shift yearly). Eating/drinking in public during daytime is restricted. Many restaurants close by day.', impact: 'Respectful dress more important. Night-time comes alive with Iftar feasts.' },
    { name: 'Dubai Shopping Festival', month: 1, endMonth: 2, type: 'festival', emoji: '🛍️', description: 'Massive retail event with huge discounts, concerts, fireworks, and entertainment across Dubai malls.' },
    { name: 'UAE National Day', month: 12, type: 'holiday', emoji: '🇦🇪', description: 'Dec 2 — UAE\'s National Day with spectacular fireworks, parades, and celebrations.', impact: 'Roads may close for parades. Festive and fun atmosphere.' },
    { name: 'Summer Heat', month: 6, endMonth: 9, type: 'warning', emoji: '🌡️', description: 'Extreme heat — temperatures above 40°C+. Outdoor activities largely not possible.', impact: 'Indoor attractions only. Hotels offer deep discounts.' },
    { name: 'Best Season', month: 10, endMonth: 4, type: 'season', emoji: '☀️', description: 'Oct–April: perfect weather, 20–30°C. Peak season for Dubai tourism.' },
  ],
  'uae': 'dubai' as unknown as LocalEvent[],
  'abu dhabi': 'dubai' as unknown as LocalEvent[],

  // ── SINGAPORE ─────────────────────────────────────────────────────────────
  'singapore': [
    { name: 'Chinese New Year', month: 1, endMonth: 2, type: 'festival', emoji: '🧧', description: 'Chinatown transforms with spectacular decorations. Lion dances, fireworks, and reunion dinners everywhere.', impact: 'Some shops and restaurants close. Book restaurants in advance.' },
    { name: 'Deepavali / Diwali', month: 10, endMonth: 11, type: 'festival', emoji: '🪔', description: 'Little India lit up with thousands of lights. Vibrant street bazaars and cultural performances.' },
    { name: 'Singapore National Day', month: 8, type: 'holiday', emoji: '🎆', description: 'Aug 9 — parade at Marina Bay with spectacular aerial displays, fireworks, and performances.' },
    { name: 'Haze Season', month: 6, endMonth: 10, type: 'warning', emoji: '😷', description: 'Indonesian forest fires can cause air quality issues (PSI>100). Outdoor activities may be affected.', impact: 'Check daily PSI readings. N95 masks may be needed.' },
    { name: 'Great Singapore Sale', month: 5, endMonth: 8, type: 'season', emoji: '🛒', description: 'Major retail sales event across malls and shops. Great time for shopping.' },
  ],

  // ── INDIA ─────────────────────────────────────────────────────────────────
  'india': [
    { name: 'Diwali — Festival of Lights', month: 10, endMonth: 11, type: 'festival', emoji: '🪔', description: 'Biggest Hindu festival. Homes lit with diyas, fireworks fill the sky, sweets exchanged everywhere.' },
    { name: 'Holi — Festival of Colors', month: 3, type: 'festival', emoji: '🎨', description: 'Joyous spring festival where people throw colored powders. Incredible to experience, especially in Rajasthan.' },
    { name: 'Republic Day', month: 1, type: 'holiday', emoji: '🎖️', description: 'Jan 26 — Grand military parade on Rajpath, New Delhi. National holiday.', impact: 'Government offices closed. Spectacular parade if you\'re in Delhi.' },
    { name: 'Independence Day', month: 8, type: 'holiday', emoji: '🇮🇳', description: 'Aug 15 — PM addresses nation from Red Fort, Delhi. National holiday.' },
    { name: 'Monsoon Season', month: 6, endMonth: 9, type: 'warning', emoji: '🌧️', description: 'Heavy monsoon rains across most of India. Rajasthan/Ladakh less affected.', impact: 'Some areas flood. Lush greenery and waterfalls at their peak. Cheaper travel.' },
    { name: 'Goa Carnival', month: 2, type: 'festival', emoji: '🎭', description: 'Portuguese-influenced 4-day carnival in Goa with parades, music, and street parties.' },
    { name: 'Pushkar Camel Fair', month: 11, type: 'festival', emoji: '🐪', description: 'World\'s largest camel fair in Rajasthan. Extraordinary cultural spectacle.' },
    { name: 'Golden Triangle Peak Season', month: 10, endMonth: 3, type: 'season', emoji: '☀️', description: 'Oct–March: best time to visit North India. Cool, dry weather ideal for sightseeing.' },
  ],
  'goa': 'india' as unknown as LocalEvent[],
  'mumbai': 'india' as unknown as LocalEvent[],
  'delhi': 'india' as unknown as LocalEvent[],
  'rajasthan': 'india' as unknown as LocalEvent[],
  'kerala': 'india' as unknown as LocalEvent[],

  // ── SRI LANKA ─────────────────────────────────────────────────────────────
  'sri lanka': [
    { name: 'Vesak Festival', month: 5, type: 'festival', emoji: '🪔', description: 'Full moon day celebrating Buddha\'s birth. Streets illuminated with lanterns, free food at pandals. Magical.' },
    { name: 'Sinhala & Tamil New Year', month: 4, type: 'holiday', emoji: '🎊', description: 'April 13–14 — major national holiday. Traditional games, rituals, and family feasts.' , impact: 'Most businesses close. Book transport ahead.' },
    { name: 'Kandy Esala Perahera', month: 7, endMonth: 8, type: 'festival', emoji: '🐘', description: 'Sri Lanka\'s grandest festival — 10 nights of elaborately decorated elephants, dancers, fire-eaters in Kandy.', impact: 'Kandy hotels sell out. Book 3+ months ahead.' },
    { name: 'SW Monsoon', month: 5, endMonth: 9, type: 'warning', emoji: '🌧️', description: 'May–September: heavy rain on west and south coasts (Colombo, Galle). East coast sunny.', impact: 'Visit east coast (Trincomalee, Arugam Bay) during this period instead.' },
    { name: 'NE Monsoon', month: 10, endMonth: 1, type: 'warning', emoji: '🌧️', description: 'Oct–January: rain on east coast. West and south coasts are sunny and calm.', impact: 'Visit west coast (Colombo, Galle, Mirissa) during this period.' },
  ],
  'colombo': 'sri lanka' as unknown as LocalEvent[],

  // ── NEPAL ─────────────────────────────────────────────────────────────────
  'nepal': [
    { name: 'Dashain', month: 10, type: 'festival', emoji: '🐐', description: 'Nepal\'s biggest festival — 15 days of worship, family gatherings, kite flying and animal sacrifices. Entire country celebrates.' },
    { name: 'Tihar — Festival of Lights', month: 10, endMonth: 11, type: 'festival', emoji: '🪔', description: 'Nepal\'s Diwali equivalent — also called Deepawali. Houses lit with oil lamps, Lakshmi puja, and worship of crows/dogs/cows.' },
    { name: 'Buddha Jayanti', month: 5, type: 'festival', emoji: '☸️', description: 'Full moon celebration of Buddha\'s birth at Lumbini and Swayambhunath. Peaceful and spiritual.' },
    { name: 'Trekking Season (Autumn)', month: 10, endMonth: 11, type: 'season', emoji: '🏔️', description: 'Best time for Everest Base Camp and Annapurna treks. Clear skies, stable weather.', impact: 'Peak season — trails busy. Book tea houses in advance.' },
    { name: 'Trekking Season (Spring)', month: 3, endMonth: 5, type: 'season', emoji: '🌸', description: 'Second best trekking window. Rhododendrons bloom. Warmer than autumn.' },
    { name: 'Monsoon', month: 6, endMonth: 9, type: 'warning', emoji: '🌧️', description: 'Heavy rains. Most high-altitude trails become dangerous. Leeches on lower paths.', impact: 'Many trekking lodges close. Flights to remote airports often cancelled.' },
  ],
  'kathmandu': 'nepal' as unknown as LocalEvent[],
  'pokhara': 'nepal' as unknown as LocalEvent[],

  // ── MALDIVES ──────────────────────────────────────────────────────────────
  'maldives': [
    { name: 'High Season', month: 12, endMonth: 4, type: 'season', emoji: '🐠', description: 'Best weather — calm seas, great visibility for snorkelling/diving. Premium resort prices.' },
    { name: 'Low Season / Monsoon', month: 5, endMonth: 10, type: 'warning', emoji: '🌊', description: 'May–October: rough seas, some rain. Whale sharks more common. Big price discounts.', impact: 'Some remote resorts close. Water sports limited on rough days.' },
    { name: 'Independence Day', month: 7, type: 'holiday', emoji: '🇲🇻', description: 'July 26 — Maldives Independence Day. Celebrations in Malé.' },
  ],
  'male': 'maldives' as unknown as LocalEvent[],

  // ── VIETNAM ───────────────────────────────────────────────────────────────
  'vietnam': [
    { name: 'Tết — Lunar New Year', month: 1, endMonth: 2, type: 'festival', emoji: '🧨', description: 'Vietnam\'s most important holiday. Families reunite, fireworks, dragon dances, and flower markets.', impact: '⚠️ Most businesses close for 1 week. Many restaurants shut. Book everything well in advance.' },
    { name: 'Reunification Day', month: 4, type: 'holiday', emoji: '🏳️', description: 'April 30 — national holiday marking the end of the Vietnam War.' },
    { name: 'Hội An Lantern Festival', month: 2, endMonth: 12, type: 'festival', emoji: '🏮', description: 'Full moon every month — Hội An old town goes car-free, lit entirely by colourful lanterns. Unforgettable.' },
    { name: 'Rainy Season — South', month: 5, endMonth: 11, type: 'warning', emoji: '🌧️', description: 'Ho Chi Minh City gets afternoon downpours May–November. Mornings usually clear.', impact: 'Carry a poncho. Budget accommodation may flood.' },
    { name: 'Winter — North', month: 12, endMonth: 2, type: 'season', emoji: '🧥', description: 'Hanoi is cool/cold (10–17°C) and drizzly Dec–Feb. Pack layers.' },
    { name: 'Best Time to Visit', month: 2, endMonth: 4, type: 'season', emoji: '☀️', description: 'Feb–April: dry season across most of the country. Comfortable temperatures.' },
  ],
  'hanoi': 'vietnam' as unknown as LocalEvent[],
  'ho chi minh city': 'vietnam' as unknown as LocalEvent[],
  'hoi an': 'vietnam' as unknown as LocalEvent[],

  // ── MALAYSIA ──────────────────────────────────────────────────────────────
  'malaysia': [
    { name: 'Hari Raya (Eid Al-Fitr)', month: 3, endMonth: 4, type: 'holiday', emoji: '🌙', description: 'End of Ramadan — major Muslim festival. Families travel home for open house celebrations.', impact: 'Some businesses close. Intercity transport very crowded. Book early.' },
    { name: 'Chinese New Year', month: 1, endMonth: 2, type: 'festival', emoji: '🧧', description: 'Major celebration especially in KL, Penang, and Ipoh. Dragon dances, fireworks, and delicious food.' },
    { name: 'Thaipusam', month: 1, endMonth: 2, type: 'festival', emoji: '🕉️', description: 'Hindu festival with extraordinary kavadi-carrying devotees at Batu Caves. Intense and fascinating spectacle.' },
    { name: 'Malaysia National Day', month: 8, type: 'holiday', emoji: '🇲🇾', description: 'Aug 31 — Independence Day with parades and celebrations.' },
    { name: 'Malaysia Day', month: 9, type: 'holiday', emoji: '🇲🇾', description: 'Sep 16 — Malaysia Day public holiday.' },
  ],
  'kuala lumpur': 'malaysia' as unknown as LocalEvent[],
  'penang': 'malaysia' as unknown as LocalEvent[],

  // ── TURKEY ────────────────────────────────────────────────────────────────
  'turkey': [
    { name: 'Ramadan', month: 3, endMonth: 4, type: 'warning', emoji: '🌙', description: 'Fasting month — restaurants may be closed during daylight in conservative areas. Festive atmosphere at sunset (Iftar).' },
    { name: 'Tulip Festival — Istanbul', month: 4, type: 'festival', emoji: '🌷', description: 'April: over 30 million tulips bloom in Istanbul\'s parks and squares. Stunning and free.' },
    { name: 'Republic Day', month: 10, type: 'holiday', emoji: '🇹🇷', description: 'Oct 29 — Turkey\'s Republic Day. Parades and fireworks in major cities.' },
    { name: 'Balloon Season — Cappadocia', month: 4, endMonth: 10, type: 'season', emoji: '🎈', description: 'Best hot air balloon conditions. Clear skies and calm winds April–October.' },
    { name: 'High Season — Istanbul', month: 6, endMonth: 8, type: 'season', emoji: '☀️', description: 'Summer: very hot (35°C+) and crowded. Book ahead. Aegean coast perfect for beaches.' },
  ],
  'istanbul': 'turkey' as unknown as LocalEvent[],
  'cappadocia': 'turkey' as unknown as LocalEvent[],
  'antalya': 'turkey' as unknown as LocalEvent[],

  // ── EGYPT ─────────────────────────────────────────────────────────────────
  'egypt': [
    { name: 'Ramadan', month: 3, endMonth: 4, type: 'warning', emoji: '🌙', description: 'Slower pace, restaurants closed by day outside tourist areas. Vibrant atmosphere after sunset.', impact: 'Sites less crowded during the day — a silver lining for sightseeing.' },
    { name: 'Eid Al-Fitr', month: 4, type: 'holiday', emoji: '🎉', description: 'End of Ramadan — 3-day public holiday. Festive atmosphere everywhere.' },
    { name: 'Sham El-Nessim', month: 4, endMonth: 5, type: 'festival', emoji: '🌿', description: 'Ancient spring festival celebrated since Pharaonic times — picnics, colored eggs, and traditional foods.' },
    { name: 'Extreme Summer Heat', month: 6, endMonth: 8, type: 'warning', emoji: '☀️', description: 'Cairo and Luxor can exceed 42°C. Visiting ancient sites in midday heat is dangerous.', impact: 'Visit sites at dawn or late afternoon only. Carry lots of water.' },
    { name: 'Best Season', month: 10, endMonth: 3, type: 'season', emoji: '🌤️', description: 'Oct–March: ideal weather for sightseeing, 18–28°C. Peak tourist season.' },
  ],
  'cairo': 'egypt' as unknown as LocalEvent[],
  'luxor': 'egypt' as unknown as LocalEvent[],

  // ── FRANCE / PARIS ────────────────────────────────────────────────────────
  'france': [
    { name: 'Bastille Day', month: 7, type: 'holiday', emoji: '🎆', description: 'July 14 — France\'s National Day. Fireworks under the Eiffel Tower and military parade on Champs-Élysées.', impact: 'Crowds around Eiffel Tower. Book viewing spots early.' },
    { name: 'Christmas Markets', month: 12, type: 'festival', emoji: '🎄', description: 'December: beautiful Christmas markets across Paris and Alsace region. Mulled wine and festive treats.' },
    { name: 'Fermeture d\'Août', month: 8, type: 'warning', emoji: '🔒', description: 'Many Parisian restaurants and small shops close in August — owners on holiday.', impact: 'Some neighbourhood restaurants shut. Major tourist attractions open.' },
    { name: 'Paris High Season', month: 6, endMonth: 8, type: 'season', emoji: '☀️', description: 'Summer: warm, sunny, crowded with tourists. Lines at Eiffel Tower and Louvre longest.' },
    { name: 'Paris Fashion Week', month: 9, type: 'season', emoji: '👗', description: 'September and January: fashion week makes hotels pricier and events more exclusive.' },
  ],
  'paris': 'france' as unknown as LocalEvent[],

  // ── UK / LONDON ───────────────────────────────────────────────────────────
  'united kingdom': [
    { name: 'Notting Hill Carnival', month: 8, type: 'festival', emoji: '🎺', description: 'August Bank Holiday weekend — Europe\'s largest street festival. Caribbean culture, music, and food.', impact: 'Massive crowds in West London. Book nearby accommodation early.' },
    { name: 'Guy Fawkes Night', month: 11, type: 'festival', emoji: '🎇', description: 'Nov 5 — Bonfire Night. Fireworks displays across the UK, especially in London and Edinburgh.' },
    { name: 'Edinburgh Festival Fringe', month: 8, type: 'festival', emoji: '🎭', description: 'August: world\'s largest arts festival transforms Edinburgh. Thousands of shows daily.' },
    { name: 'Christmas', month: 12, type: 'holiday', emoji: '🎄', description: 'Dec 25: everything closed. Oxford Street Christmas lights from November.', impact: 'Many shops close Dec 25–26. Transport limited on Christmas Day.' },
    { name: 'Bank Holidays', month: 1, endMonth: 12, type: 'warning', emoji: '📅', description: 'Multiple bank holidays throughout the year. Some shops and services close on these days.' },
  ],
  'london': 'united kingdom' as unknown as LocalEvent[],
  'uk': 'united kingdom' as unknown as LocalEvent[],
  'england': 'united kingdom' as unknown as LocalEvent[],
  'scotland': 'united kingdom' as unknown as LocalEvent[],
  'edinburgh': 'united kingdom' as unknown as LocalEvent[],

  // ── AUSTRALIA ─────────────────────────────────────────────────────────────
  'australia': [
    { name: 'Sydney NYE Fireworks', month: 12, type: 'festival', emoji: '🎆', description: 'Dec 31 — World\'s first major New Year\'s Eve fireworks, Sydney Harbour Bridge. Iconic.', impact: 'Premium harbour viewing requires booking. Free public spots fill by midday.' },
    { name: 'Australia Day', month: 1, type: 'holiday', emoji: '🇦🇺', description: 'Jan 26 — National holiday with events in major cities.' },
    { name: 'Melbourne Cup', month: 11, type: 'festival', emoji: '🏇', description: '"The race that stops a nation" — public holiday in Melbourne on Cup day.', impact: 'Melbourne CBD very busy. Dress up is part of the culture.' },
    { name: 'Anzac Day', month: 4, type: 'holiday', emoji: '🌺', description: 'April 25 — dawn services remembering fallen soldiers. Public holiday.' },
    { name: 'Australian Summer', month: 12, endMonth: 2, type: 'season', emoji: '🏖️', description: 'Dec–Feb: Austrlian summer — hot beach weather. Peak school holiday season.', impact: 'Beaches and hotels busy. Book popular Great Barrier Reef tours ahead.' },
    { name: 'Australian Winter', month: 6, endMonth: 8, type: 'season', emoji: '🧥', description: 'Jun–Aug: mild winter in Sydney/Melbourne (10–17°C). Snow in alpine regions. Off-peak prices.' },
  ],
  'sydney': 'australia' as unknown as LocalEvent[],
  'melbourne': 'australia' as unknown as LocalEvent[],

  // ── SOUTH KOREA ───────────────────────────────────────────────────────────
  'south korea': [
    { name: 'Chuseok — Korean Harvest Festival', month: 9, endMonth: 10, type: 'holiday', emoji: '🌕', description: 'Major 3-day national holiday. Families travel home. Traditional hanbok worn, ancestral rites performed.', impact: 'Transport packed. Many businesses close. Seoul becomes quiet.' },
    { name: 'Seollal — Korean New Year', month: 1, endMonth: 2, type: 'holiday', emoji: '🎊', description: 'Lunar New Year — 3-day national holiday. Family gatherings and traditional foods (tteok).', impact: 'Similar to Chuseok — transport busy, shops close.' },
    { name: 'Cherry Blossom Season', month: 3, endMonth: 4, type: 'festival', emoji: '🌸', description: 'Late March–April: cherry blossoms bloom across Korea. Beautiful festivals in Jinhae and Yeouido.' },
    { name: 'Autumn Foliage', month: 10, endMonth: 11, type: 'season', emoji: '🍂', description: 'Stunning autumn colours in national parks and mountains. Popular hiking season.' },
    { name: 'Monsoon (Jangma)', month: 6, endMonth: 7, type: 'warning', emoji: '🌧️', description: 'June–July: monsoon season with heavy rainfall. Hiking trails can be dangerous.' },
  ],
  'seoul': 'south korea' as unknown as LocalEvent[],
  'korea': 'south korea' as unknown as LocalEvent[],
  'busan': 'south korea' as unknown as LocalEvent[],

  // ── ITALY ─────────────────────────────────────────────────────────────────
  'italy': [
    { name: 'Venice Carnival', month: 2, type: 'festival', emoji: '🎭', description: 'February: spectacular 2-week carnival with elaborate masks and costumes. Venice transforms completely.' },
    { name: 'Ferragosto', month: 8, type: 'holiday', emoji: '🏖️', description: 'Aug 15 — major Italian holiday. Many shops, restaurants, and businesses close as Italians vacation.', impact: 'Rome and Milan become quiet. Beaches and coastal towns are packed.' },
    { name: 'Easter (Pasqua)', month: 3, endMonth: 4, type: 'holiday', emoji: '🐣', description: 'Major religious holiday. Spectacular Easter Week in Rome. St. Peter\'s Square overflows with pilgrims.' },
    { name: 'High Season', month: 6, endMonth: 8, type: 'warning', emoji: '🌡️', description: 'Summer is very hot (35°C+) and extremely crowded at major sites. Book skip-the-line tickets.', impact: 'Vatican and Colosseum queues are brutally long. Visit at opening time.' },
    { name: 'Shoulder Season — Best Time', month: 4, endMonth: 5, type: 'season', emoji: '🌺', description: 'April–May and September–October: mild weather, fewer crowds, better prices.' },
  ],
  'rome': 'italy' as unknown as LocalEvent[],
  'venice': 'italy' as unknown as LocalEvent[],
  'florence': 'italy' as unknown as LocalEvent[],
  'milan': 'italy' as unknown as LocalEvent[],

  // ── SPAIN ─────────────────────────────────────────────────────────────────
  'spain': [
    { name: 'La Tomatina', month: 8, type: 'festival', emoji: '🍅', description: 'Last Wednesday of August in Buñol — the world\'s biggest tomato fight. Messy, fun, unforgettable.' },
    { name: 'San Fermín (Running of the Bulls)', month: 7, type: 'festival', emoji: '🐂', description: 'July 6–14 in Pamplona — the famous bull run. Crowds wear white and red.' },
    { name: 'Semana Santa (Holy Week)', month: 3, endMonth: 4, type: 'festival', emoji: '✝️', description: 'Easter week — processions across Spain, most spectacular in Seville and Málaga.' },
    { name: 'Siesta Culture', month: 1, endMonth: 12, type: 'warning', emoji: '😴', description: 'Year-round: many shops close 2–5pm for siesta, especially in smaller cities and towns.' },
    { name: 'High Season', month: 6, endMonth: 8, type: 'warning', emoji: '☀️', description: 'Very hot and crowded in cities (38°C+ in Madrid/Seville). Beaches are packed.', impact: 'Book accommodation well in advance. Avoid cities in July–August if possible.' },
  ],
  'barcelona': 'spain' as unknown as LocalEvent[],
  'madrid': 'spain' as unknown as LocalEvent[],
  'seville': 'spain' as unknown as LocalEvent[],

  // ── GREECE ────────────────────────────────────────────────────────────────
  'greece': [
    { name: 'Greek Orthodox Easter', month: 4, endMonth: 5, type: 'festival', emoji: '🕯️', description: 'Most important Greek holiday. Midnight candlelit processions, midnight feasts, fireworks. Magical.' },
    { name: 'Athens & Epidaurus Festival', month: 6, endMonth: 8, type: 'festival', emoji: '🎭', description: 'Summer: ancient dramas and concerts performed at ancient theatres including Herod Atticus in Athens.' },
    { name: 'High Season — Islands', month: 7, endMonth: 8, type: 'warning', emoji: '🌡️', description: 'July–August: extremely hot (35°C+) and very crowded on Santorini and Mykonos. Highest prices.', impact: 'Ferries overbooked. Book 3+ months ahead for Santorini in August.' },
    { name: 'Shoulder Season — Best', month: 5, endMonth: 6, type: 'season', emoji: '🌊', description: 'May–June and September–October: perfect weather, fewer crowds, reasonable prices.' },
  ],
  'athens': 'greece' as unknown as LocalEvent[],
  'santorini': 'greece' as unknown as LocalEvent[],
  'mykonos': 'greece' as unknown as LocalEvent[],

  // ── MOROCCO ───────────────────────────────────────────────────────────────
  'morocco': [
    { name: 'Ramadan', month: 3, endMonth: 4, type: 'warning', emoji: '🌙', description: 'Fasting month — restaurants largely closed during day. Streets come alive after sunset with ftour (Iftar).', impact: 'Respectful dress required. Some areas very quiet by day. Vibrant atmosphere at night.' },
    { name: 'Marrakech Film Festival', month: 11, endMonth: 12, type: 'festival', emoji: '🎬', description: 'November: major international film festival in Marrakech. Celebrities and screenings across the city.' },
    { name: 'Summer Heat', month: 6, endMonth: 8, type: 'warning', emoji: '🌡️', description: 'Marrakech and inland areas can hit 42°C+ in summer. Coastal cities (Essaouira, Agadir) are cooler.', impact: 'Avoid midday outdoor activities. Carry lots of water.' },
    { name: 'Best Season', month: 3, endMonth: 5, type: 'season', emoji: '🌸', description: 'March–May and September–November: mild weather, blooming gardens, ideal for sightseeing.' },
  ],
  'marrakech': 'morocco' as unknown as LocalEvent[],

  // ── SOUTH AFRICA ──────────────────────────────────────────────────────────
  'south africa': [
    { name: 'Cape Town Jazz Festival', month: 3, type: 'festival', emoji: '🎷', description: 'Late March: Africa\'s biggest jazz festival at Cape Town ICC with 40+ international artists.' },
    { name: 'Cape Town Summer', month: 11, endMonth: 2, type: 'season', emoji: '☀️', description: 'Nov–Feb: long sunny days, perfect for Cape Point, wine routes, and beaches. Peak season.' },
    { name: 'Whale Season', month: 7, endMonth: 11, type: 'season', emoji: '🐋', description: 'Southern Right Whales breach off Hermanus. World\'s best land-based whale watching.' },
    { name: 'Load Shedding', month: 1, endMonth: 12, type: 'warning', emoji: '⚡', description: 'Ongoing electricity outages (load shedding) 2–4 hours/day. Affects restaurants, ATMs, and hotels.', impact: 'Download Eskom Se Push app. Carry power bank. Most hotels have generators.' },
  ],
  'cape town': 'south africa' as unknown as LocalEvent[],
  'johannesburg': 'south africa' as unknown as LocalEvent[],

  // ── CAMBODIA ──────────────────────────────────────────────────────────────
  'cambodia': [
    { name: 'Khmer New Year', month: 4, type: 'holiday', emoji: '🎊', description: 'April 13–15 — biggest Cambodian holiday. Water festivals, traditional games, and family reunions.', impact: 'Most businesses closed. Transport busy. Angkor Wat area festive.' },
    { name: 'Bon Om Touk — Water Festival', month: 11, type: 'festival', emoji: '🚣', description: 'November full moon: spectacular boat races on the Tonle Sap and Mekong. Millions attend in Phnom Penh.', impact: 'Phnom Penh extremely crowded. Book accommodation months ahead.' },
    { name: 'Pchum Ben', month: 9, endMonth: 10, type: 'festival', emoji: '🍚', description: 'Festival of the Dead — 15-day period of offering food to ancestors at pagodas.' },
    { name: 'Hot Season', month: 3, endMonth: 5, type: 'warning', emoji: '🌡️', description: 'March–May: intense heat 35–40°C. Visiting Angkor Wat at dawn is essential.', impact: 'Carry lots of water. Wear sun protection. Avoid midday at exposed sites.' },
  ],
  'siem reap': 'cambodia' as unknown as LocalEvent[],
  'phnom penh': 'cambodia' as unknown as LocalEvent[],

  // ── PERU ──────────────────────────────────────────────────────────────────
  'peru': [
    { name: 'Inti Raymi — Festival of the Sun', month: 6, type: 'festival', emoji: '☀️', description: 'June 24 — Inca festival of the sun in Cusco. Spectacular re-enactment at Sacsayhuamán ruins.' },
    { name: 'Peru Independence Day', month: 7, type: 'holiday', emoji: '🇵🇪', description: 'July 28–29 — major national holiday with parades and celebrations.' },
    { name: 'Dry Season — Machu Picchu', month: 5, endMonth: 10, type: 'season', emoji: '🏔️', description: 'Best time to hike the Inca Trail and visit Machu Picchu. Clear skies, minimal rain.' },
    { name: 'Rainy Season — Machu Picchu', month: 11, endMonth: 3, type: 'warning', emoji: '🌧️', description: 'Heavy rainfall. Inca Trail sometimes closed in February. Machu Picchu can be foggy but atmospheric.', impact: 'Book Inca Trail permits months in advance (only 500/day). Buy waterproof gear.' },
  ],
  'cusco': 'peru' as unknown as LocalEvent[],
  'lima': 'peru' as unknown as LocalEvent[],
  'machu picchu': 'peru' as unknown as LocalEvent[],
};

// Resolve string aliases (e.g., 'bangkok' → 'thailand' events)
function resolveEvents(key: string): LocalEvent[] | null {
  const entry = EVENTS_DB[key];
  if (!entry) return null;
  // If it's an alias string, resolve it
  if (typeof entry === 'string') {
    return EVENTS_DB[entry as string] as LocalEvent[] ?? null;
  }
  return entry as LocalEvent[];
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getMonthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? '';
}

/**
 * Get local events for a destination during a trip's month range.
 * Always includes season/warning events that overlap the trip period.
 * Also includes notable festivals in the months surrounding the trip.
 */
export function getLocalEvents(
  destination: string,
  tripMonth: number,
  tripEndMonth?: number
): LocalEvent[] {
  const end = tripEndMonth ?? tripMonth;
  const key = destination.toLowerCase().trim().replace(/[^a-z\s]/g, '');

  // Try exact match first
  let events = resolveEvents(key);

  // Word-by-word match
  if (!events) {
    const words = key.split(/\s+/);
    for (const word of words) {
      if (word.length > 3) {
        events = resolveEvents(word);
        if (events) break;
      }
    }
  }

  // Substring match — longer keys first
  if (!events) {
    const keys = Object.keys(EVENTS_DB).sort((a, b) => b.length - a.length);
    for (const k of keys) {
      if (key.includes(k)) {
        events = resolveEvents(k);
        if (events) break;
      }
    }
  }

  if (!events) return [];

  // Filter: event overlaps with trip window
  return events.filter(event => {
    const evStart = event.month;
    const evEnd = event.endMonth ?? event.month;
    // Overlap: event starts before trip ends AND event ends after trip starts
    return evStart <= end && evEnd >= tripMonth;
  });
}


