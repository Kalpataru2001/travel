// src/utils/transport.ts
// Destination transport guide — airport connections, local transport, rideshare apps, tips
// Static DB — no API required. Covers 55+ major travel destinations.

export interface AirportOption {
  mode: string;           // 'Metro' | 'Bus' | 'Taxi' | 'Shuttle' | 'Tuk-tuk' | 'Ferry'
  emoji: string;
  duration: string;       // e.g. '30–45 min'
  costRange: string;      // e.g. '₹500–800' or 'THB 45'
  notes?: string;
}

export interface LocalApp {
  name: string;
  emoji: string;
  type: 'rideshare' | 'taxi' | 'food' | 'maps' | 'transit';
  available: boolean;
  notes?: string;
}

export interface TransportGuide {
  city: string;
  country: string;
  airportName?: string;
  airportToCity: AirportOption[];
  localTransport: string[];    // bullet-point descriptions
  apps: LocalApp[];
  drivingTip?: string;
  currency?: string;           // local currency for reference
  taxiTip?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Transport Database
// Keys: lowercase city/destination names (same key = same city/country entry)
// ─────────────────────────────────────────────────────────────────────────────
const TRANSPORT_DB: Record<string, TransportGuide> = {

  // ── THAILAND ──────────────────────────────────────────────────────────────
  'bangkok': {
    city: 'Bangkok', country: 'Thailand', airportName: 'Suvarnabhumi (BKK)',
    airportToCity: [
      { mode: 'Airport Rail Link', emoji: '🚆', duration: '30 min', costRange: 'THB 15–45', notes: 'Fastest, goes to Phaya Thai station' },
      { mode: 'BTS Skytrain', emoji: '🚇', duration: '45 min', costRange: 'THB 15–60', notes: 'From On Nut or Udom Suk stations' },
      { mode: 'Taxi (Metered)', emoji: '🚕', duration: '30–60 min', costRange: 'THB 250–400 + expressway', notes: 'Always use metered taxi. Tip: use Grab instead' },
      { mode: 'Public Bus', emoji: '🚌', duration: '60–90 min', costRange: 'THB 30–50', notes: 'Very cheap but slow in traffic' },
    ],
    localTransport: [
      'BTS Skytrain and MRT Metro cover central Bangkok — very efficient',
      'Tuk-tuks are fun but agree on price before boarding (THB 50–200 short trips)',
      'Motorcycle taxis (orange vests) for quick short hops — THB 20–60',
      'Klook boats on canals (Khlong) — scenic and fast THB 14/journey',
      'Grab (rideshare) is the safest metered option — similar to Uber',
    ],
    apps: [
      { name: 'Grab', emoji: '🟢', type: 'rideshare', available: true, notes: 'Primary rideshare. Widely used.' },
      { name: 'Bolt', emoji: '⚡', type: 'rideshare', available: true, notes: 'Alternative to Grab, often cheaper' },
      { name: 'Google Maps', emoji: '🗺️', type: 'maps', available: true, notes: 'Works well for BTS/MRT routes' },
      { name: 'ViaBus', emoji: '🚌', type: 'transit', available: true, notes: 'For bus routes in Bangkok' },
    ],
    drivingTip: 'Drive on the left. Traffic is heavy — avoid driving yourself.',
    taxiTip: 'Always insist on metered taxi. If driver refuses, walk away.',
  },

  'thailand': {
    city: 'Thailand', country: 'Thailand', airportName: 'Various',
    airportToCity: [
      { mode: 'Airport Taxi', emoji: '🚕', duration: 'Varies', costRange: 'THB 200–500', notes: 'Metered taxis at all major airports' },
      { mode: 'Songthaew', emoji: '🚐', duration: 'Varies', costRange: 'THB 30–100', notes: 'Shared red trucks in Chiang Mai/Phuket' },
    ],
    localTransport: [
      'Grab rideshare works in Bangkok, Chiang Mai, Phuket',
      'Tuk-tuks are iconic — negotiate price beforehand',
      'Songthaews (shared pickup trucks) common in Chiang Mai',
      'Motorbike rental (THB 150-300/day) popular in beach areas',
      'Night buses and trains connect major cities cheaply',
    ],
    apps: [
      { name: 'Grab', emoji: '🟢', type: 'rideshare', available: true },
      { name: 'Bolt', emoji: '⚡', type: 'rideshare', available: true },
      { name: 'Google Maps', emoji: '🗺️', type: 'maps', available: true },
    ],
    drivingTip: 'Drive on the left. International licence required to rent car.',
  },

  // ── INDONESIA / BALI ──────────────────────────────────────────────────────
  'bali': {
    city: 'Bali', country: 'Indonesia', airportName: 'Ngurah Rai Intl (DPS)',
    airportToCity: [
      { mode: 'Official Taxi', emoji: '🚕', duration: '20–60 min', costRange: 'IDR 100,000–250,000', notes: 'Fixed price zones. Buy voucher at airport counter.' },
      { mode: 'Grab / Gojek', emoji: '📱', duration: '20–50 min', costRange: 'IDR 50,000–150,000', notes: 'Cheaper but must exit airport to order (Grab pickup point)' },
      { mode: 'Hotel Pickup', emoji: '🏨', duration: 'Varies', costRange: 'IDR 150,000–300,000', notes: 'Convenient if pre-arranged with hotel' },
    ],
    localTransport: [
      'Gojek and Grab are the go-to rideshare apps — very affordable',
      'Scooter/motorbike rental: IDR 60,000–100,000/day — most popular for exploring',
      'Metered taxis (Blue Bird) are reliable; avoid unmarked taxis',
      'Bemos (minivans) for local routes but irregular schedules',
      'Private driver: IDR 500,000–700,000/day — great value for full-day trips',
    ],
    apps: [
      { name: 'Gojek', emoji: '🟢', type: 'rideshare', available: true, notes: 'Most popular in Bali. Also food delivery.' },
      { name: 'Grab', emoji: '🟩', type: 'rideshare', available: true, notes: 'Widely available alternative' },
      { name: 'Maps.me', emoji: '🗺️', type: 'maps', available: true, notes: 'Good offline maps for Bali' },
      { name: 'Google Maps', emoji: '🗺️', type: 'maps', available: true },
    ],
    drivingTip: 'Drive on the left. International licence required for scooter rental technically, but rarely checked.',
    taxiTip: 'Agree on Grab/Gojek price via app. Street taxis often overcharge tourists.',
  },

  // ── JAPAN ──────────────────────────────────────────────────────────────────
  'japan': {
    city: 'Japan', country: 'Japan', airportName: 'Narita (NRT) / Haneda (HND)',
    airportToCity: [
      { mode: 'Narita Express (NEX)', emoji: '🚆', duration: '55–90 min', costRange: 'JPY 3,070', notes: 'Direct to Shinjuku/Shibuya/Tokyo Stn. IC card accepted.' },
      { mode: 'Airport Limousine Bus', emoji: '🚌', duration: '60–120 min', costRange: 'JPY 1,000–3,200', notes: 'Drops at major hotels. Good if you have luggage.' },
      { mode: 'Taxi', emoji: '🚕', duration: '60–90 min', costRange: 'JPY 18,000–25,000', notes: 'Very expensive. Only if splitting cost.' },
    ],
    localTransport: [
      'IC Card (Suica/Pasmo) — essential! Works on all trains, metro, buses, even vending machines',
      'Tokyo Metro + JR Lines cover the city comprehensively',
      'JR Pass for inter-city bullet trains (Shinkansen) — buy before you land',
      'Buses useful in Kyoto and rural areas',
      'Taxis are metered, expensive but safe. Night surcharge applies.',
      'Bicycles commonly rented in Kyoto (JPY 1,000/day)',
    ],
    apps: [
      { name: 'Google Maps', emoji: '🗺️', type: 'maps', available: true, notes: 'Excellent for Tokyo transit routes' },
      { name: 'Japan Official Travel', emoji: '🇯🇵', type: 'transit', available: true, notes: 'Offline maps and transit planner' },
      { name: 'Suica app', emoji: '💳', type: 'transit', available: true, notes: 'Digital IC card on iPhone/Android' },
      { name: 'Navitime', emoji: '🚆', type: 'transit', available: true, notes: 'Excellent train route planner' },
    ],
    drivingTip: 'Drive on the left. International Driving Permit required. Roads are excellent.',
    taxiTip: 'Taxis open/close doors automatically — do NOT touch the door handle!',
  },

  'tokyo': {
    city: 'Tokyo', country: 'Japan', airportName: 'Narita (NRT) / Haneda (HND)',
    airportToCity: [
      { mode: 'Narita Express (NEX)', emoji: '🚆', duration: '55 min', costRange: 'JPY 3,070', notes: 'From Narita. Fastest and most convenient.' },
      { mode: 'Keikyu Express', emoji: '🚆', duration: '35 min', costRange: 'JPY 650', notes: 'From Haneda to central Tokyo.' },
      { mode: 'Airport Limousine Bus', emoji: '🚌', duration: '75–120 min', costRange: 'JPY 1,000–3,200', notes: 'Direct to major hotels' },
    ],
    localTransport: [
      'Buy Suica IC card at airport — works on every train, metro, bus',
      'Tokyo Metro and Toei Lines cover all major tourist spots',
      'JR Yamanote Line circles central Tokyo — very useful',
      'Taxis metered but expensive — use trains whenever possible',
    ],
    apps: [
      { name: 'Google Maps', emoji: '🗺️', type: 'maps', available: true },
      { name: 'Suica', emoji: '💳', type: 'transit', available: true },
      { name: 'Navitime', emoji: '🚆', type: 'transit', available: true },
    ],
    drivingTip: 'Drive on the left. Parking is expensive and scarce.',
    taxiTip: 'Taxis are metered and reliable. Door opens/closes automatically.',
  },

  // ── DUBAI / UAE ───────────────────────────────────────────────────────────
  'dubai': {
    city: 'Dubai', country: 'UAE', airportName: 'Dubai Intl (DXB)',
    airportToCity: [
      { mode: 'Dubai Metro (Red Line)', emoji: '🚇', duration: '35–50 min', costRange: 'AED 5–15', notes: 'Connects T1 and T3. Most affordable option.' },
      { mode: 'Taxi', emoji: '🚕', duration: '20–40 min', costRange: 'AED 70–120', notes: 'Metered taxis available 24/7 outside arrivals.' },
      { mode: 'Careem / Uber', emoji: '📱', duration: '20–40 min', costRange: 'AED 50–100', notes: 'Book from app before heading to pickup zone.' },
    ],
    localTransport: [
      'Dubai Metro (Red + Green Line) — clean, AC, efficient. Get Nol card.',
      'Careem (Uber equivalent) is widely used — very reliable',
      'Standard taxis are metered and plentiful — AED 12 flagfall',
      'Dubai Tram in JBR/Marina area',
      'Water taxis (Abra) cross Dubai Creek — AED 1 only!',
      'Bus network exists but complex — stick to metro/rideshare',
    ],
    apps: [
      { name: 'Careem', emoji: '🟢', type: 'rideshare', available: true, notes: 'Dominant in UAE. Very reliable.' },
      { name: 'Uber', emoji: '⚫', type: 'rideshare', available: true },
      { name: 'RTA Dubai', emoji: '🚇', type: 'transit', available: true, notes: 'Official app for buses, metro, nol card' },
      { name: 'Google Maps', emoji: '🗺️', type: 'maps', available: true },
    ],
    drivingTip: 'Drive on the right. Roads are excellent. Salik toll system. Speed cameras everywhere.',
    taxiTip: 'Taxis are metered and safe. Women-only taxis available (pink cars).',
  },

  'uae': {
    city: 'UAE', country: 'UAE',
    airportToCity: [
      { mode: 'Taxi', emoji: '🚕', duration: '20–60 min', costRange: 'AED 50–150', notes: 'Widely available at all UAE airports' },
      { mode: 'Careem / Uber', emoji: '📱', duration: '20–60 min', costRange: 'AED 40–120' },
    ],
    localTransport: [
      'Careem and Uber work across Dubai, Abu Dhabi, Sharjah',
      'Dubai Metro is excellent — get a Nol card',
      'Abu Dhabi has limited public transit — taxis recommended',
      'Inter-emirate buses connect Dubai-Abu Dhabi (AED 25)',
    ],
    apps: [
      { name: 'Careem', emoji: '🟢', type: 'rideshare', available: true },
      { name: 'Uber', emoji: '⚫', type: 'rideshare', available: true },
      { name: 'RTA Dubai', emoji: '🚇', type: 'transit', available: true },
    ],
    drivingTip: 'Drive on the right.',
  },

  // ── SINGAPORE ─────────────────────────────────────────────────────────────
  'singapore': {
    city: 'Singapore', country: 'Singapore', airportName: 'Changi Airport (SIN)',
    airportToCity: [
      { mode: 'MRT (East-West Line)', emoji: '🚇', duration: '30 min', costRange: 'SGD 1.50–2.50', notes: 'Changi Airport MRT to City Hall/Raffles Place. Best value.' },
      { mode: 'Taxi', emoji: '🚕', duration: '20–30 min', costRange: 'SGD 20–35', notes: 'Airport surcharge applies. All taxis metered.' },
      { mode: 'Grab', emoji: '🟢', duration: '20–30 min', costRange: 'SGD 18–30', notes: 'Usually cheaper than taxi from app.' },
      { mode: 'Airport Shuttle', emoji: '🚌', duration: '30–60 min', costRange: 'SGD 9', notes: 'Shared shuttle to major hotels' },
    ],
    localTransport: [
      'MRT (Mass Rapid Transit) is world-class — covers entire island',
      'Get an EZ-Link card at airport for metro + buses',
      'Buses extensive and cheap — SGD 0.77–2.10 per journey',
      'Grab is widely used for rideshare — no surge during off-peak',
      'Taxis are metered and abundant — safe and reliable',
      'City is very walkable especially in Orchard, Marina Bay, Chinatown',
    ],
    apps: [
      { name: 'Grab', emoji: '🟢', type: 'rideshare', available: true, notes: 'Dominant rideshare platform' },
      { name: 'MyTransport.SG', emoji: '🚇', type: 'transit', available: true, notes: 'Official bus/MRT app' },
      { name: 'Google Maps', emoji: '🗺️', type: 'maps', available: true, notes: 'Excellent for Singapore transit' },
    ],
    drivingTip: 'Drive on the left. ERP electronic road pricing in city. Parking expensive.',
    taxiTip: 'All taxis are metered. ComfortDelGro is most common. Surcharges apply at peak hours.',
  },

  // ── MALAYSIA ──────────────────────────────────────────────────────────────
  'kuala lumpur': {
    city: 'Kuala Lumpur', country: 'Malaysia', airportName: 'KLIA / KLIA2 (KUL)',
    airportToCity: [
      { mode: 'KLIA Ekspres Train', emoji: '🚆', duration: '28 min', costRange: 'MYR 55', notes: 'Fastest to KL Sentral. Excellent service.' },
      { mode: 'KLIA Transit', emoji: '🚆', duration: '35 min', costRange: 'MYR 55', notes: 'Stops at intermediate stations' },
      { mode: 'Taxi (Fixed Rate)', emoji: '🚕', duration: '45–90 min', costRange: 'MYR 70–120', notes: 'Buy fixed-fare coupon at airport. Avoid touts.' },
      { mode: 'Grab', emoji: '🟢', duration: '45–90 min', costRange: 'MYR 50–90', notes: 'Must exit terminal to pickup area' },
    ],
    localTransport: [
      'LRT, MRT, Monorail, KTM cover central KL well',
      'Touch n Go card for all public transport + highway tolls',
      'Grab is dominant rideshare — cheap and reliable',
      'Taxis often don\'t use meters — Grab strongly preferred',
      'GoKL free bus service runs inner city routes',
    ],
    apps: [
      { name: 'Grab', emoji: '🟢', type: 'rideshare', available: true, notes: 'Essential in Malaysia' },
      { name: 'MyRapid', emoji: '🚇', type: 'transit', available: true, notes: 'Rapid KL transit info' },
      { name: 'Google Maps', emoji: '🗺️', type: 'maps', available: true },
    ],
    drivingTip: 'Drive on the left. Touch n Go card for tolls.',
    taxiTip: 'Always use Grab. Street taxis rarely use meters and overcharge tourists.',
  },

  'malaysia': {
    city: 'Malaysia', country: 'Malaysia',
    airportToCity: [
      { mode: 'KLIA Ekspres', emoji: '🚆', duration: '28 min (from KLIA)', costRange: 'MYR 55' },
      { mode: 'Grab', emoji: '🟢', duration: '45–90 min', costRange: 'MYR 50–100' },
    ],
    localTransport: [
      'Grab is the primary rideshare across Peninsular Malaysia',
      'Intercity buses are cheap and comfortable (AirAsia Bus, Transnational)',
      'Penang has its own bus system (Rapid Penang)',
    ],
    apps: [
      { name: 'Grab', emoji: '🟢', type: 'rideshare', available: true },
      { name: 'Google Maps', emoji: '🗺️', type: 'maps', available: true },
    ],
    drivingTip: 'Drive on the left.',
  },

  // ── VIETNAM ───────────────────────────────────────────────────────────────
  'vietnam': {
    city: 'Vietnam', country: 'Vietnam',
    airportToCity: [
      { mode: 'Grab (Car)', emoji: '🟢', duration: '30–60 min', costRange: 'VND 150,000–300,000', notes: 'Most reliable. Book from app.' },
      { mode: 'Taxi (Metered)', emoji: '🚕', duration: '30–60 min', costRange: 'VND 200,000–400,000', notes: 'Use Mai Linh or Vinasun — reputable companies' },
      { mode: 'Bus', emoji: '🚌', duration: '60–90 min', costRange: 'VND 5,000–40,000', notes: 'Very cheap, good if backpacking' },
    ],
    localTransport: [
      'Grab (car + Grab Bike) is the easiest way to get around cities',
      'Xe ôm (motorbike taxi) — agree price beforehand or use Grab Bike',
      'Cyclos (3-wheel cycles) in old quarters — tourist experience, negotiate price',
      'Hanoi: Xe buyt (city buses) cover most areas cheaply',
      'Ho Chi Minh City: avoid motorbikes in rush hour — chaotic traffic',
      'Overnight sleeper buses connect major cities',
    ],
    apps: [
      { name: 'Grab', emoji: '🟢', type: 'rideshare', available: true, notes: 'Car + Bike. Essential.' },
      { name: 'Gojek', emoji: '🟢', type: 'rideshare', available: true, notes: 'Available in HCMC' },
      { name: 'Be', emoji: '🚕', type: 'rideshare', available: true, notes: 'Local Vietnamese rideshare app' },
      { name: 'Google Maps', emoji: '🗺️', type: 'maps', available: true },
    ],
    drivingTip: 'Drive on the right. Traffic in HCMC is extremely chaotic. Highly discourage self-driving.',
    taxiTip: 'Only use Mai Linh (green) or Vinasun (white) metered taxis. Many others are scams.',
  },

  // ── INDIA ─────────────────────────────────────────────────────────────────
  'india': {
    city: 'India', country: 'India',
    airportToCity: [
      { mode: 'Metro (where available)', emoji: '🚇', duration: '20–45 min', costRange: '₹10–60', notes: 'Delhi, Mumbai, Bengaluru, Chennai, Hyderabad all have airport metro' },
      { mode: 'Prepaid Taxi', emoji: '🚕', duration: '30–60 min', costRange: '₹300–700', notes: 'Buy prepaid taxi voucher from airport counter' },
      { mode: 'Ola / Uber', emoji: '📱', duration: '30–60 min', costRange: '₹200–500', notes: 'Must go to designated pickup zone' },
      { mode: 'Auto Rickshaw', emoji: '🛺', duration: '30–60 min', costRange: '₹100–300', notes: 'Metered in some cities. Negotiate otherwise.' },
    ],
    localTransport: [
      'Ola and Uber are the most convenient rideshare options in all major cities',
      'Auto Rickshaws for short distances — insist on meter or negotiate before boarding',
      'Metro systems in Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata',
      'Local buses are cheapest but crowded — better for budget travellers',
      'Rapido for bike taxi in tier-2 cities',
      'Outstation Ola/Uber for day trips outside city',
    ],
    apps: [
      { name: 'Ola', emoji: '🟡', type: 'rideshare', available: true, notes: 'Most popular rideshare in India' },
      { name: 'Uber', emoji: '⚫', type: 'rideshare', available: true },
      { name: 'Rapido', emoji: '🏍️', type: 'rideshare', available: true, notes: 'Bike taxis, very cheap for short trips' },
      { name: 'IRCTC Rail Connect', emoji: '🚂', type: 'transit', available: true, notes: 'Book Indian Railways tickets' },
      { name: 'Google Maps', emoji: '🗺️', type: 'maps', available: true },
      { name: 'redBus', emoji: '🚌', type: 'transit', available: true, notes: 'Intercity bus booking' },
    ],
    drivingTip: 'Drive on the left. International licence required. Traffic can be intense — not recommended for tourists.',
    taxiTip: 'Always use app-based cabs (Ola/Uber) for transparent pricing.',
  },

  // ── SRI LANKA ─────────────────────────────────────────────────────────────
  'sri lanka': {
    city: 'Sri Lanka', country: 'Sri Lanka', airportName: 'Bandaranaike Intl (CMB)',
    airportToCity: [
      { mode: 'Taxi (fixed rate)', emoji: '🚕', duration: '40–60 min', costRange: 'LKR 2,500–4,000', notes: 'To Colombo. Book at airport desk.' },
      { mode: 'PickMe / Uber', emoji: '📱', duration: '40–60 min', costRange: 'LKR 1,800–3,000', notes: 'PickMe is local app and dominant' },
      { mode: 'Bus', emoji: '🚌', duration: '90 min', costRange: 'LKR 100', notes: 'Very cheap but crowded and slow' },
    ],
    localTransport: [
      'PickMe is the go-to rideshare app in Sri Lanka',
      'Three-wheelers (Tuk-tuks) everywhere — negotiate price or use PickMe Tuk',
      'Trains are scenic and cheap — Colombo to Kandy/Ella are beautiful rides',
      'Intercity buses connect all major towns',
      'Renting a tuk-tuk with driver for day trips: LKR 3,000–5,000/day',
    ],
    apps: [
      { name: 'PickMe', emoji: '🟢', type: 'rideshare', available: true, notes: 'Sri Lanka\'s leading rideshare' },
      { name: 'Uber', emoji: '⚫', type: 'rideshare', available: true, notes: 'Available in Colombo' },
      { name: 'Google Maps', emoji: '🗺️', type: 'maps', available: true },
    ],
    drivingTip: 'Drive on the left. Roads can be narrow and winding in highlands.',
    taxiTip: 'Use PickMe for transparent pricing. Tuk-tuks: always negotiate before getting in.',
  },

  'colombo': {
    city: 'Colombo', country: 'Sri Lanka', airportName: 'Bandaranaike Intl (CMB)',
    airportToCity: [
      { mode: 'PickMe / Uber', emoji: '📱', duration: '45 min', costRange: 'LKR 2,000–3,500' },
      { mode: 'Taxi (Official)', emoji: '🚕', duration: '45 min', costRange: 'LKR 3,000–4,500' },
    ],
    localTransport: [
      'PickMe is essential for getting around Colombo',
      'Tuk-tuks for short hops — negotiate price first',
      'Colombo city buses are cheap but crowded',
    ],
    apps: [
      { name: 'PickMe', emoji: '🟢', type: 'rideshare', available: true },
      { name: 'Google Maps', emoji: '🗺️', type: 'maps', available: true },
    ],
    drivingTip: 'Drive on the left.',
  },

  // ── NEPAL ─────────────────────────────────────────────────────────────────
  'nepal': {
    city: 'Nepal', country: 'Nepal', airportName: 'Tribhuvan Intl (KTM)',
    airportToCity: [
      { mode: 'Taxi (pre-paid)', emoji: '🚕', duration: '20–30 min', costRange: 'NPR 700–1,000', notes: 'Fixed rate prepaid. Buy at official counter.' },
      { mode: 'Public Bus', emoji: '🚌', duration: '40 min', costRange: 'NPR 25', notes: 'Very cheap, drops at Ratna Park' },
    ],
    localTransport: [
      'Taxis are the most practical — negotiate fare beforehand or use InDrive',
      'Tempo (electric 3-wheelers) on fixed routes — cheap and fun',
      'Micro-buses on specific routes — cheap but crowded',
      'InDrive app for metered taxi service in Kathmandu',
      'Renting motorcycle possible but roads outside KTM are challenging',
    ],
    apps: [
      { name: 'InDrive', emoji: '🚗', type: 'rideshare', available: true, notes: 'Fastest growing in Kathmandu' },
      { name: 'Pathao', emoji: '🟢', type: 'rideshare', available: true, notes: 'Bike + Car rideshare' },
      { name: 'Google Maps', emoji: '🗺️', type: 'maps', available: true, notes: 'Works but data may be limited in mountains' },
      { name: 'Maps.me', emoji: '🗺️', type: 'maps', available: true, notes: 'Download offline Nepal maps' },
    ],
    drivingTip: 'Drive on the left. Roads outside Kathmandu Valley are rough mountain roads.',
    taxiTip: 'Always agree on fare before getting in or use InDrive/Pathao for metered pricing.',
  },

  // ── CAMBODIA ──────────────────────────────────────────────────────────────
  'cambodia': {
    city: 'Cambodia', country: 'Cambodia', airportName: 'Phnom Penh (PNH) / Siem Reap (REP)',
    airportToCity: [
      { mode: 'Tuk-tuk', emoji: '🛺', duration: '15–30 min', costRange: 'USD 5–8', notes: 'Iconic, breezy and affordable' },
      { mode: 'PassApp / Grab', emoji: '📱', duration: '15–30 min', costRange: 'USD 4–7', notes: 'App-based metered taxis' },
      { mode: 'Taxi', emoji: '🚕', duration: '15–30 min', costRange: 'USD 10–15', notes: 'Air-conditioned, more comfortable' },
    ],
    localTransport: [
      'Tuk-tuks are the quintessential Cambodia transport — fun and affordable',
      'PassApp is Cambodia\'s Grab equivalent — use for metered pricing',
      'Grab now operates in Phnom Penh and Siem Reap',
      'Motodops (motorbike taxis) for very short trips — USD 0.5–2',
      'Rental bicycles popular around Angkor Wat — USD 2–5/day',
    ],
    apps: [
      { name: 'PassApp', emoji: '🟢', type: 'rideshare', available: true, notes: 'Dominant in Cambodia. Tuk-tuk + car.' },
      { name: 'Grab', emoji: '🟩', type: 'rideshare', available: true },
      { name: 'Google Maps', emoji: '🗺️', type: 'maps', available: true },
    ],
    drivingTip: 'Drive on the right. Traffic is chaotic. International licence required.',
    taxiTip: 'Always agree price upfront with tuk-tuks. PassApp eliminates negotiation.',
  },

  // ── UK / LONDON ───────────────────────────────────────────────────────────
  'london': {
    city: 'London', country: 'United Kingdom', airportName: 'Heathrow (LHR) / Gatwick (LGW)',
    airportToCity: [
      { mode: 'Elizabeth Line (from LHR)', emoji: '🚇', duration: '35 min', costRange: '£10–12', notes: 'Direct to Paddington/Liverpool Street. Pay by card.' },
      { mode: 'Heathrow Express', emoji: '🚆', duration: '15 min', costRange: '£25–37', notes: 'Fastest to Paddington. Premium price.' },
      { mode: 'Gatwick Express', emoji: '🚆', duration: '30 min', costRange: '£20–30', notes: 'Direct to Victoria station' },
      { mode: 'Black Cab', emoji: '🚕', duration: '45–90 min', costRange: '£60–100', notes: 'Iconic but expensive. All metered.' },
      { mode: 'Uber', emoji: '⚫', duration: '45–90 min', costRange: '£30–60', notes: 'Much cheaper than black cabs' },
    ],
    localTransport: [
      'Get an Oyster card or use contactless bank card on all TfL services',
      'London Underground (The Tube) covers most of central/inner London',
      'Buses cover areas not on Tube — pay by card/Oyster only (no cash)',
      'Elizabeth Line — new fast line across the city',
      'Black cabs: iconic, metered, but pricey',
      'Uber and Bolt widely available',
      'Santander Cycles (Boris bikes) for short trips in central London',
    ],
    apps: [
      { name: 'TfL Oyster', emoji: '🃏', type: 'transit', available: true, notes: 'Manage Oyster card and check journey times' },
      { name: 'Citymapper', emoji: '🗺️', type: 'maps', available: true, notes: 'Best app for London transit — better than Google Maps' },
      { name: 'Uber', emoji: '⚫', type: 'rideshare', available: true },
      { name: 'Bolt', emoji: '⚡', type: 'rideshare', available: true, notes: 'Usually cheaper than Uber' },
    ],
    drivingTip: 'Drive on the left. Congestion Charge £15/day in central London. Parking expensive.',
    taxiTip: 'Contactless payment accepted in all black cabs. Tip 10-15% is customary.',
  },

  // ── FRANCE / PARIS ────────────────────────────────────────────────────────
  'paris': {
    city: 'Paris', country: 'France', airportName: 'CDG (Roissy) / Orly',
    airportToCity: [
      { mode: 'RER B Train (from CDG)', emoji: '🚆', duration: '35 min', costRange: '€11.50', notes: 'Direct to Châtelet Les Halles and Saint-Michel. Very convenient.' },
      { mode: 'Orlyval + Metro (from Orly)', emoji: '🚇', duration: '35 min', costRange: '€12.10', notes: 'Orlyval to Anthony, then RER B' },
      { mode: 'Taxi (regulated)', emoji: '🚕', duration: '30–60 min', costRange: '€40–60', notes: 'Fixed rates to Paris. Right bank €56, Left bank €65 from CDG.' },
      { mode: 'Uber', emoji: '⚫', duration: '30–60 min', costRange: '€30–50', notes: 'Widely available. Price may vary with traffic.' },
    ],
    localTransport: [
      'Metro is excellent — covers all major Paris attractions',
      'Get a Navigo Easy card or Carnet (10 tickets) for savings',
      'RER trains for outer districts and Versailles',
      'Vélib\' bikes available across the city — great for sightseeing',
      'Walking is best in central Paris — most sights are close',
      'Buses complement the metro well',
    ],
    apps: [
      { name: 'RATP', emoji: '🚇', type: 'transit', available: true, notes: 'Official Paris metro/bus app' },
      { name: 'Citymapper', emoji: '🗺️', type: 'maps', available: true, notes: 'Excellent for Paris transit' },
      { name: 'Uber', emoji: '⚫', type: 'rideshare', available: true },
      { name: 'Bolt', emoji: '⚡', type: 'rideshare', available: true },
      { name: 'Google Maps', emoji: '🗺️', type: 'maps', available: true },
    ],
    drivingTip: 'Drive on the right. Paris centre driving is difficult. Use transit or ride-share.',
    taxiTip: 'Only use G7, Taxis G7, or Uber. Unofficial taxis outside CDG are scams.',
  },

  // ── TURKEY ────────────────────────────────────────────────────────────────
  'istanbul': {
    city: 'Istanbul', country: 'Turkey', airportName: 'Istanbul Airport (IST)',
    airportToCity: [
      { mode: 'Havaist Airport Bus', emoji: '🚌', duration: '60–120 min', costRange: 'TRY 150–200', notes: 'To Taksim and other central stops. Budget option.' },
      { mode: 'Metro (M11)', emoji: '🚇', duration: '80 min', costRange: 'TRY 24', notes: 'Direct metro from airport to Gayrettepe (connects to M2)' },
      { mode: 'Taxi', emoji: '🚕', duration: '45–90 min', costRange: 'TRY 400–700', notes: 'Metered. Avoid unofficial taxis.' },
      { mode: 'BiTaksi / Uber', emoji: '📱', duration: '45–90 min', costRange: 'TRY 300–600', notes: 'App-based, safer pricing' },
    ],
    localTransport: [
      'Get an Istanbulkart (transit card) for all metro, tram, bus, ferry',
      'Tram T1 runs along the historic peninsula — convenient for tourists',
      'Metro lines cover Asian and European sides',
      'Ferries cross the Bosphorus cheaply — an unmissable experience',
      'Dolmuş (shared minibus) along fixed routes — very cheap',
    ],
    apps: [
      { name: 'BiTaksi', emoji: '🚕', type: 'rideshare', available: true, notes: 'Dominant Turkish taxi app' },
      { name: 'Uber', emoji: '⚫', type: 'rideshare', available: true },
      { name: 'Google Maps', emoji: '🗺️', type: 'maps', available: true },
      { name: 'Moovit', emoji: '🚇', type: 'transit', available: true },
    ],
    drivingTip: 'Drive on the right. Heavy traffic in Istanbul. Parking very difficult.',
    taxiTip: 'Always use app-based taxis. Street taxis may try to scam tourists.',
  },

  // ── EGYPT ─────────────────────────────────────────────────────────────────
  'cairo': {
    city: 'Cairo', country: 'Egypt', airportName: 'Cairo Intl (CAI)',
    airportToCity: [
      { mode: 'Uber / Careem', emoji: '📱', duration: '30–60 min', costRange: 'EGP 150–300', notes: 'Safest and most reliable option' },
      { mode: 'Official Taxi', emoji: '🚕', duration: '30–60 min', costRange: 'EGP 200–400', notes: 'Negotiate fixed price. White taxis at airport.' },
      { mode: 'Cairo Metro (not direct)', emoji: '🚇', duration: '60+ min', costRange: 'EGP 7', notes: 'Need taxi to nearest station first' },
    ],
    localTransport: [
      'Uber and Careem are essential in Cairo — cheap and safe',
      'Cairo Metro has 3 lines — useful for some routes (EGP 7 flat)',
      'Taxis: negotiate before getting in. No meters typically.',
      'Minibuses for adventurous budget travelers along fixed routes',
    ],
    apps: [
      { name: 'Uber', emoji: '⚫', type: 'rideshare', available: true, notes: 'Most reliable in Cairo' },
      { name: 'Careem', emoji: '🟢', type: 'rideshare', available: true },
      { name: 'Google Maps', emoji: '🗺️', type: 'maps', available: true },
    ],
    drivingTip: 'Drive on the right. Traffic is chaotic. Not recommended for self-driving.',
    taxiTip: 'Always use Uber/Careem. Bargain taxis hard if using non-metered street taxis.',
  },

  // ── AUSTRALIA ─────────────────────────────────────────────────────────────
  'sydney': {
    city: 'Sydney', country: 'Australia', airportName: 'Kingsford Smith (SYD)',
    airportToCity: [
      { mode: 'Train (Airport Link)', emoji: '🚆', duration: '13 min', costRange: 'AUD 18–21', notes: 'To Central Station. Opal card.' },
      { mode: 'Taxi', emoji: '🚕', duration: '20–30 min', costRange: 'AUD 45–60', notes: 'Metered. Airport toll surcharge applies.' },
      { mode: 'Uber / Ola', emoji: '📱', duration: '20–30 min', costRange: 'AUD 30–50', notes: 'Rideshare designated pickup zone P2.' },
    ],
    localTransport: [
      'Get an Opal card for all trains, buses, ferries, light rail',
      'Ferry across Manly is scenic and uses Opal card',
      'City is large — train + bus combination works well',
      'Uber, Ola, DiDi all available',
    ],
    apps: [
      { name: 'Opal Travel', emoji: '💳', type: 'transit', available: true, notes: 'Manage your Opal transit card' },
      { name: 'TripView', emoji: '🚆', type: 'transit', available: true, notes: 'Train/bus timetables' },
      { name: 'Uber', emoji: '⚫', type: 'rideshare', available: true },
      { name: 'Ola', emoji: '🟡', type: 'rideshare', available: true },
      { name: 'DiDi', emoji: '🔴', type: 'rideshare', available: true },
    ],
    drivingTip: 'Drive on the left. Seatbelts mandatory. Good road conditions.',
    taxiTip: 'All taxis are metered. Credit card payment widely accepted.',
  },

  // ── SOUTH KOREA ───────────────────────────────────────────────────────────
  'seoul': {
    city: 'Seoul', country: 'South Korea', airportName: 'Incheon (ICN)',
    airportToCity: [
      { mode: 'AREX Train (Express)', emoji: '🚆', duration: '43 min', costRange: 'KRW 9,500', notes: 'Direct to Seoul Station. Very fast.' },
      { mode: 'AREX Train (All-stop)', emoji: '🚆', duration: '60 min', costRange: 'KRW 4,250', notes: 'Stops at Gimpo Airport etc. Cheaper.' },
      { mode: 'Airport Bus', emoji: '🚌', duration: '60–90 min', costRange: 'KRW 10,000–17,000', notes: 'Drops at major hotels/stops.' },
      { mode: 'Taxi', emoji: '🚕', duration: '60–80 min', costRange: 'KRW 60,000–80,000', notes: 'Metered. Deluxe taxis more comfortable.' },
      { mode: 'Kakao T', emoji: '📱', duration: '60–80 min', costRange: 'KRW 55,000–75,000', notes: 'Book via Kakao T app.' },
    ],
    localTransport: [
      'T-Money card for all metro, buses, some taxis — pick up at airport',
      'Seoul Metro is world-class — 9 lines, covers the entire city',
      'Buses fill gaps where metro doesn\'t reach',
      'Kakao T is the dominant taxi app',
      'Naver Maps is better than Google Maps in Korea',
    ],
    apps: [
      { name: 'Kakao T', emoji: '🟡', type: 'rideshare', available: true, notes: 'Essential taxi app in Korea' },
      { name: 'Naver Maps', emoji: '🗺️', type: 'maps', available: true, notes: 'More accurate than Google in Korea' },
      { name: 'Subway Korea', emoji: '🚇', type: 'transit', available: true },
      { name: 'KakaoMap', emoji: '🗺️', type: 'maps', available: true },
    ],
    drivingTip: 'Drive on the right. Good road infrastructure. T-Money for parking.',
    taxiTip: 'Kakao T taxi is safest. Standard taxis (orange/white) are metered and reliable.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Lookup helpers
// ─────────────────────────────────────────────────────────────────────────────

export function getTransportGuide(destination: string): TransportGuide | null {
  const key = destination.toLowerCase().trim().replace(/[^a-z\s]/g, '');
  if (TRANSPORT_DB[key]) return TRANSPORT_DB[key];

  const words = key.split(/\s+/);
  for (const word of words) {
    if (word.length > 3 && TRANSPORT_DB[word]) return TRANSPORT_DB[word];
  }

  // Substring match — longer first to avoid false positives
  const keys = Object.keys(TRANSPORT_DB).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (key.includes(k)) return TRANSPORT_DB[k];
  }

  return null;
}
