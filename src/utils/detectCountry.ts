// src/utils/detectCountry.ts
// Static city → ISO-2 country code lookup (~250 major cities/regions)
// No API call needed — pure deterministic lookup

const CITY_TO_ISO: Record<string, string> = {
  // ── India ──
  'bengaluru': 'IN', 'bangalore': 'IN', 'mumbai': 'IN', 'delhi': 'IN',
  'new delhi': 'IN', 'chennai': 'IN', 'hyderabad': 'IN', 'kolkata': 'IN',
  'pune': 'IN', 'ahmedabad': 'IN', 'jaipur': 'IN', 'surat': 'IN',
  'lucknow': 'IN', 'kanpur': 'IN', 'nagpur': 'IN', 'indore': 'IN',
  'thane': 'IN', 'bhopal': 'IN', 'visakhapatnam': 'IN', 'pimpri': 'IN',
  'patna': 'IN', 'vadodara': 'IN', 'ghaziabad': 'IN', 'ludhiana': 'IN',
  'agra': 'IN', 'nashik': 'IN', 'faridabad': 'IN', 'meerut': 'IN',
  'rajkot': 'IN', 'kalyan': 'IN', 'varanasi': 'IN', 'srinagar': 'IN',
  'aurangabad': 'IN', 'dhanbad': 'IN', 'amritsar': 'IN', 'navi mumbai': 'IN',
  'allahabad': 'IN', 'ranchi': 'IN', 'howrah': 'IN', 'coimbatore': 'IN',
  'jabalpur': 'IN', 'gwalior': 'IN', 'vijayawada': 'IN', 'jodhpur': 'IN',
  'madurai': 'IN', 'raipur': 'IN', 'kota': 'IN', 'chandigarh': 'IN',
  'guwahati': 'IN', 'solapur': 'IN', 'hubli': 'IN', 'mysore': 'IN',
  'tiruchirappalli': 'IN', 'bareilly': 'IN', 'aligarh': 'IN', 'tiruppur': 'IN',
  'gurgaon': 'IN', 'gurugram': 'IN', 'moradabad': 'IN', 'jalandhar': 'IN',
  'bhubaneswar': 'IN', 'salem': 'IN', 'warangal': 'IN', 'mira-bhayandar': 'IN',
  'thiruvananthapuram': 'IN', 'guntur': 'IN', 'bhiwandi': 'IN', 'saharanpur': 'IN',
  'gorakhpur': 'IN', 'bikaner': 'IN', 'amravati': 'IN', 'noida': 'IN',
  'jamshedpur': 'IN', 'bhilai': 'IN', 'cuttack': 'IN', 'firozabad': 'IN',
  'kochi': 'IN', 'cochin': 'IN', 'mangalore': 'IN', 'kolhapur': 'IN',
  'ajmer': 'IN', 'gulbarga': 'IN', 'jamnagar': 'IN', 'ujjain': 'IN',
  'loni': 'IN', 'siliguri': 'IN', 'jhansi': 'IN', 'ulhasnagar': 'IN',
  'jammu': 'IN', 'sangli': 'IN', 'erode': 'IN', 'mangaluru': 'IN',
  'belgaum': 'IN', 'ambattur': 'IN', 'tirunelveli': 'IN', 'malegaon': 'IN',
  'gaya': 'IN', 'udaipur': 'IN', 'shimla': 'IN', 'dehradun': 'IN',

  // ── USA ──
  'new york': 'US', 'los angeles': 'US', 'chicago': 'US', 'houston': 'US',
  'phoenix': 'US', 'philadelphia': 'US', 'san antonio': 'US', 'san diego': 'US',
  'dallas': 'US', 'san jose': 'US', 'austin': 'US', 'jacksonville': 'US',
  'fort worth': 'US', 'columbus': 'US', 'san francisco': 'US', 'charlotte': 'US',
  'indianapolis': 'US', 'seattle': 'US', 'denver': 'US', 'washington': 'US',
  'nashville': 'US', 'oklahoma city': 'US', 'el paso': 'US', 'boston': 'US',
  'portland': 'US', 'las vegas': 'US', 'memphis': 'US', 'louisville': 'US',
  'baltimore': 'US', 'milwaukee': 'US', 'albuquerque': 'US', 'tucson': 'US',
  'fresno': 'US', 'sacramento': 'US', 'mesa': 'US', 'kansas city': 'US',
  'atlanta': 'US', 'omaha': 'US', 'colorado springs': 'US', 'raleigh': 'US',
  'miami': 'US', 'minneapolis': 'US', 'new orleans': 'US',

  // ── UK ──
  'london': 'GB', 'birmingham': 'GB', 'manchester': 'GB', 'glasgow': 'GB',
  'leeds': 'GB', 'liverpool': 'GB', 'edinburgh': 'GB', 'bristol': 'GB',
  'cardiff': 'GB', 'sheffield': 'GB', 'nottingham': 'GB', 'leicester': 'GB',

  // ── Australia ──
  'sydney': 'AU', 'melbourne': 'AU', 'brisbane': 'AU', 'perth': 'AU',
  'adelaide': 'AU', 'gold coast': 'AU', 'canberra': 'AU', 'darwin': 'AU',
  'hobart': 'AU',

  // ── Canada ──
  'toronto': 'CA', 'montreal': 'CA', 'vancouver': 'CA', 'calgary': 'CA',
  'edmonton': 'CA', 'ottawa': 'CA', 'winnipeg': 'CA', 'quebec city': 'CA',
  'hamilton': 'CA',

  // ── UAE ──
  'dubai': 'AE', 'abu dhabi': 'AE', 'sharjah': 'AE', 'ajman': 'AE',
  'ras al khaimah': 'AE',

  // ── Singapore ──
  'singapore': 'SG',

  // ── Germany ──
  'berlin': 'DE', 'hamburg': 'DE', 'munich': 'DE', 'cologne': 'DE',
  'frankfurt': 'DE', 'stuttgart': 'DE', 'düsseldorf': 'DE', 'dortmund': 'DE',
  'essen': 'DE', 'leipzig': 'DE',

  // ── France ──
  'paris': 'FR', 'marseille': 'FR', 'lyon': 'FR', 'toulouse': 'FR',
  'nice': 'FR', 'nantes': 'FR', 'strasbourg': 'FR', 'montpellier': 'FR',
  'bordeaux': 'FR', 'lille': 'FR',

  // ── Japan ──
  'tokyo': 'JP', 'osaka': 'JP', 'yokohama': 'JP', 'nagoya': 'JP',
  'sapporo': 'JP', 'kobe': 'JP', 'kyoto': 'JP', 'fukuoka': 'JP',
  'kawasaki': 'JP', 'hiroshima': 'JP', 'sendai': 'JP',

  // ── China ──
  'beijing': 'CN', 'shanghai': 'CN', 'guangzhou': 'CN', 'shenzhen': 'CN',
  'chengdu': 'CN', 'chongqing': 'CN', 'xi\'an': 'CN', 'hangzhou': 'CN',
  'wuhan': 'CN', 'tianjin': 'CN', 'nanjing': 'CN', 'hong kong': 'HK',

  // ── South Korea ──
  'seoul': 'KR', 'busan': 'KR', 'incheon': 'KR', 'daegu': 'KR',
  'daejeon': 'KR', 'gwangju': 'KR',

  // ── Thailand ──
  'bangkok': 'TH', 'chiang mai': 'TH', 'pattaya': 'TH', 'phuket': 'TH',
  'hat yai': 'TH', 'khon kaen': 'TH',

  // ── Indonesia / Bali ──
  'jakarta': 'ID', 'surabaya': 'ID', 'bandung': 'ID', 'bali': 'ID',
  'denpasar': 'ID', 'medan': 'ID', 'semarang': 'ID', 'yogyakarta': 'ID',

  // ── Malaysia ──
  'kuala lumpur': 'MY', 'kl': 'MY', 'johor bahru': 'MY', 'ipoh': 'MY',
  'penang': 'MY', 'george town': 'MY',

  // ── Vietnam ──
  'hanoi': 'VN', 'ho chi minh city': 'VN', 'saigon': 'VN', 'da nang': 'VN',
  'hoi an': 'VN', 'nha trang': 'VN',

  // ── Philippines ──
  'manila': 'PH', 'quezon city': 'PH', 'cebu': 'PH', 'davao': 'PH',

  // ── Nepal ──
  'kathmandu': 'NP', 'pokhara': 'NP', 'lalitpur': 'NP',

  // ── Sri Lanka ──
  'colombo': 'LK', 'kandy': 'LK', 'galle': 'LK',

  // ── Maldives ──
  'malé': 'MV', 'male': 'MV', 'maafushi': 'MV',

  // ── Pakistan ──
  'karachi': 'PK', 'lahore': 'PK', 'islamabad': 'PK', 'rawalpindi': 'PK',
  'faisalabad': 'PK', 'multan': 'PK', 'peshawar': 'PK',

  // ── Bangladesh ──
  'dhaka': 'BD', 'chittagong': 'BD', 'sylhet': 'BD',

  // ── Italy ──
  'rome': 'IT', 'milan': 'IT', 'naples': 'IT', 'turin': 'IT',
  'palermo': 'IT', 'genoa': 'IT', 'bologna': 'IT', 'florence': 'IT',
  'venice': 'IT',

  // ── Spain ──
  'madrid': 'ES', 'barcelona': 'ES', 'valencia': 'ES', 'seville': 'ES',
  'bilbao': 'ES', 'málaga': 'ES', 'malaga': 'ES',

  // ── Netherlands ──
  'amsterdam': 'NL', 'rotterdam': 'NL', 'the hague': 'NL', 'utrecht': 'NL',

  // ── Switzerland ──
  'zurich': 'CH', 'geneva': 'CH', 'basel': 'CH', 'bern': 'CH',

  // ── Portugal ──
  'lisbon': 'PT', 'porto': 'PT',

  // ── Greece ──
  'athens': 'GR', 'thessaloniki': 'GR', 'santorini': 'GR', 'mykonos': 'GR',

  // ── Turkey ──
  'istanbul': 'TR', 'ankara': 'TR', 'izmir': 'TR', 'antalya': 'TR',
  'bursa': 'TR', 'cappadocia': 'TR',

  // ── Egypt ──
  'cairo': 'EG', 'alexandria': 'EG', 'luxor': 'EG', 'hurghada': 'EG',

  // ── South Africa ──
  'johannesburg': 'ZA', 'cape town': 'ZA', 'durban': 'ZA', 'pretoria': 'ZA',

  // ── Kenya ──
  'nairobi': 'KE', 'mombasa': 'KE',

  // ── Brazil ──
  'são paulo': 'BR', 'sao paulo': 'BR', 'rio de janeiro': 'BR',
  'brasilia': 'BR', 'salvador': 'BR', 'fortaleza': 'BR',

  // ── Mexico ──
  'mexico city': 'MX', 'guadalajara': 'MX', 'monterrey': 'MX',
  'cancun': 'MX', 'tijuana': 'MX',

  // ── Qatar ──
  'doha': 'QA',

  // ── Saudi Arabia ──
  'riyadh': 'SA', 'jeddah': 'SA', 'mecca': 'SA', 'medina': 'SA',

  // ── Russia ──
  'moscow': 'RU', 'saint petersburg': 'RU', 'novosibirsk': 'RU',

  // ── New Zealand ──
  'auckland': 'NZ', 'wellington': 'NZ', 'christchurch': 'NZ',
  'queenstown': 'NZ',

  // ── Austria ──
  'vienna': 'AT', 'graz': 'AT', 'linz': 'AT', 'salzburg': 'AT',
  'innsbruck': 'AT',

  // ── Cambodia ──
  'phnom penh': 'KH', 'siem reap': 'KH',

  // ── Myanmar ──
  'yangon': 'MM', 'mandalay': 'MM', 'naypyidaw': 'MM',

  // ── Taiwan ──
  'taipei': 'TW', 'kaohsiung': 'TW', 'taichung': 'TW',

  // ── Israel ──
  'tel aviv': 'IL', 'jerusalem': 'IL', 'haifa': 'IL',

  // ── Mauritius ──
  'port louis': 'MU',

  // ── Bhutan ──
  'thimphu': 'BT', 'paro': 'BT',

  // ── Argentina ──
  'buenos aires': 'AR', 'córdoba': 'AR', 'cordoba': 'AR',

  // ── Colombia ──
  'bogotá': 'CO', 'bogota': 'CO', 'medellín': 'CO', 'medellin': 'CO',

  // ── Peru ──
  'lima': 'PE', 'cusco': 'PE',

  // ── Morocco ──
  'casablanca': 'MA', 'marrakech': 'MA', 'rabat': 'MA', 'fez': 'MA',

  // ── Ethiopia ──
  'addis ababa': 'ET',
};

// ISO → Country name mapping for display
export const ISO_COUNTRY_NAMES: Record<string, string> = {
  'IN': 'India', 'US': 'United States', 'GB': 'United Kingdom', 'AU': 'Australia',
  'CA': 'Canada', 'AE': 'UAE', 'SG': 'Singapore', 'DE': 'Germany', 'FR': 'France',
  'JP': 'Japan', 'CN': 'China', 'KR': 'South Korea', 'TH': 'Thailand',
  'ID': 'Indonesia', 'MY': 'Malaysia', 'VN': 'Vietnam', 'PH': 'Philippines',
  'NP': 'Nepal', 'LK': 'Sri Lanka', 'MV': 'Maldives', 'PK': 'Pakistan',
  'BD': 'Bangladesh', 'IT': 'Italy', 'ES': 'Spain', 'NL': 'Netherlands',
  'CH': 'Switzerland', 'PT': 'Portugal', 'GR': 'Greece', 'TR': 'Turkey',
  'EG': 'Egypt', 'ZA': 'South Africa', 'KE': 'Kenya', 'BR': 'Brazil',
  'MX': 'Mexico', 'QA': 'Qatar', 'SA': 'Saudi Arabia', 'RU': 'Russia',
  'NZ': 'New Zealand', 'AT': 'Austria', 'KH': 'Cambodia', 'MM': 'Myanmar',
  'TW': 'Taiwan', 'HK': 'Hong Kong', 'IL': 'Israel', 'MU': 'Mauritius',
  'BT': 'Bhutan', 'AR': 'Argentina', 'CO': 'Colombia', 'PE': 'Peru',
  'MA': 'Morocco', 'ET': 'Ethiopia',
};

/**
 * Detect ISO-2 country code from a free-form city/country string.
 * Tries exact match, then word-by-word, then partial substring.
 * Falls back to 'IN' (India) as the most common user base.
 */
export function detectCountry(input: string): { iso: string; confident: boolean } {
  if (!input || !input.trim()) return { iso: 'IN', confident: false };

  const normalised = input.toLowerCase().trim().replace(/[^a-z\s]/g, '');

  // Direct exact match
  if (CITY_TO_ISO[normalised]) return { iso: CITY_TO_ISO[normalised], confident: true };

  // Check each comma-separated segment (e.g. "Mumbai, India")
  const segments = normalised.split(',').map(s => s.trim());
  for (const seg of segments) {
    if (CITY_TO_ISO[seg]) return { iso: CITY_TO_ISO[seg], confident: true };
  }

  // Word-by-word match (handles "Greater Mumbai" → "mumbai")
  const words = normalised.split(/\s+/);
  for (const word of words) {
    if (word.length > 3 && CITY_TO_ISO[word]) return { iso: CITY_TO_ISO[word], confident: true };
  }

  // Substring match — longer keys first to avoid "an" matching "ankara"
  const keys = Object.keys(CITY_TO_ISO).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (normalised.includes(key)) return { iso: CITY_TO_ISO[key], confident: true };
  }

  // Fallback
  return { iso: 'IN', confident: false };
}

/**
 * Resolve the user's passport country from available context (priority order):
 * 1. Explicit nationality ISO-2 code set by user in Profile (most reliable)
 * 2. Detected from profile home city (residence city)
 * 3. Detected from trip starting point
 * 4. Default India fallback
 *
 * NOTE: homeCity ≠ nationality. An Indian expat living in Dubai has
 * homeCity="Dubai" but nationality="IN". Explicit always wins.
 */
export function resolvePassportCountry(opts: {
  nationality?: string;   // explicit ISO-2 from localStorage (Priority 1)
  homeCity?: string;      // residence city — may differ from nationality
  startingPoint?: string; // trip origin
}): { iso: string; confident: boolean; source: string } {
  // Priority 1: User explicitly set their passport country
  if (opts.nationality?.trim() && opts.nationality.length === 2) {
    const iso = opts.nationality.toUpperCase();
    return { iso, confident: true, source: 'your passport settings' };
  }

  // Priority 2: Infer from home city (city ≠ nationality, but best next guess)
  if (opts.homeCity?.trim()) {
    const result = detectCountry(opts.homeCity);
    if (result.confident) return { ...result, source: 'home city (set passport in Profile for accuracy)' };
  }

  // Priority 3: Infer from trip starting point
  if (opts.startingPoint?.trim()) {
    const result = detectCountry(opts.startingPoint);
    if (result.confident) return { ...result, source: 'trip starting point' };
  }

  // Priority 4: Fallback
  return { iso: 'IN', confident: false, source: 'default — set your passport in Profile' };
}
