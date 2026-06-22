// src/utils/currency.ts

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

export const POPULAR_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'EGP' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR' },
  { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$' },
];

export const FALLBACK_RATES: { [key: string]: number } = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  INR: 83.5,
  JPY: 155.0,
  AUD: 1.50,
  CAD: 1.36,
  CHF: 0.90,
  CNY: 7.25,
  HKD: 7.80,
  NZD: 1.63,
  SGD: 1.35,
  KRW: 1360.0,
  THB: 36.5,
  AED: 3.67,
  ZAR: 18.20,
  MXN: 17.50,
  BRL: 5.15,
  EGP: 47.50,
  TRY: 32.20,
  VND: 25400.0,
  IDR: 16100.0,
  MYR: 4.70,
  NOK: 10.70,
  SEK: 10.60,
  DKK: 6.85,
  RUB: 91.0,
  PLN: 3.95,
  ILS: 3.70,
  PHP: 57.5,
  SAR: 3.75,
  TWD: 32.3
};

export function getFallbackRatesForBase(base: string): { [key: string]: number } {
  const baseToUSD = 1 / (FALLBACK_RATES[base] || 1);
  const convertedRates: { [key: string]: number } = {};
  for (const [code, rate] of Object.entries(FALLBACK_RATES)) {
    convertedRates[code] = rate * baseToUSD;
  }
  return convertedRates;
}

export function detectLocalCurrency(destination: string): string {
  const destLower = destination.toLowerCase();

  const countryMapping: { [key: string]: string } = {
    // Eurozone countries
    'france': 'EUR', 'paris': 'EUR', 'germany': 'EUR', 'berlin': 'EUR', 'munich': 'EUR',
    'italy': 'EUR', 'rome': 'EUR', 'venice': 'EUR', 'florence': 'EUR', 'milan': 'EUR',
    'spain': 'EUR', 'barcelona': 'EUR', 'madrid': 'EUR', 'netherlands': 'EUR', 'amsterdam': 'EUR',
    'belgium': 'EUR', 'brussels': 'EUR', 'austria': 'EUR', 'vienna': 'EUR', 'greece': 'EUR',
    'athens': 'EUR', 'santorini': 'EUR', 'portugal': 'EUR', 'lisbon': 'EUR', 'finland': 'EUR',
    'helsinki': 'EUR', 'ireland': 'EUR', 'dublin': 'EUR',

    // UK
    'united kingdom': 'GBP', 'uk': 'GBP', 'england': 'GBP', 'london': 'GBP', 'scotland': 'GBP',
    'edinburgh': 'GBP', 'wales': 'GBP', 'great britain': 'GBP',

    // India
    'india': 'INR', 'delhi': 'INR', 'mumbai': 'INR', 'bangalore': 'INR', 'goa': 'INR',
    'jaipur': 'INR', 'taj mahal': 'INR',

    // Japan
    'japan': 'JPY', 'tokyo': 'JPY', 'kyoto': 'JPY', 'osaka': 'JPY', 'okinawa': 'JPY',
    'hokkaido': 'JPY',

    // USA
    'united states': 'USD', 'usa': 'USD', 'us': 'USD', 'new york': 'USD', 'nyc': 'USD',
    'california': 'USD', 'hawaii': 'USD', 'los angeles': 'USD', 'san francisco': 'USD',
    'miami': 'USD', 'las vegas': 'USD',

    // Canada
    'canada': 'CAD', 'toronto': 'CAD', 'vancouver': 'CAD', 'montreal': 'CAD',

    // Australia
    'australia': 'AUD', 'sydney': 'AUD', 'melbourne': 'AUD', 'brisbane': 'AUD',

    // New Zealand
    'new zealand': 'NZD', 'auckland': 'NZD', 'queenstown': 'NZD',

    // Switzerland
    'switzerland': 'CHF', 'swiss': 'CHF', 'zurich': 'CHF', 'geneva': 'CHF',

    // Singapore
    'singapore': 'SGD',

    // Hong Kong
    'hong kong': 'HKD',

    // China
    'china': 'CNY', 'beijing': 'CNY', 'shanghai': 'CNY',

    // South Korea
    'south korea': 'KRW', 'korea': 'KRW', 'seoul': 'KRW',

    // Thailand
    'thailand': 'THB', 'bangkok': 'THB', 'phuket': 'THB', 'chiang mai': 'THB',

    // UAE
    'united arab emirates': 'AED', 'uae': 'AED', 'dubai': 'AED', 'abu dhabi': 'AED',

    // South Africa
    'south africa': 'ZAR', 'cape town': 'ZAR', 'johannesburg': 'ZAR',

    // Mexico
    'mexico': 'MXN', 'cancun': 'MXN', 'mexico city': 'MXN',

    // Brazil
    'brazil': 'BRL', 'rio': 'BRL', 'sao paulo': 'BRL',

    // Egypt
    'egypt': 'EGP', 'cairo': 'EGP', 'giza': 'EGP',

    // Turkey
    'turkey': 'TRY', 'istanbul': 'TRY', 'cappadocia': 'TRY',

    // Vietnam
    'vietnam': 'VND', 'hanoi': 'VND', 'ho chi minh': 'VND',

    // Indonesia
    'indonesia': 'IDR', 'bali': 'IDR', 'jakarta': 'IDR',

    // Malaysia
    'malaysia': 'MYR', 'kuala lumpur': 'MYR',

    // Saudi Arabia
    'saudi arabia': 'SAR', 'riyadh': 'SAR', 'mecca': 'SAR',

    // Philippines
    'philippines': 'PHP', 'manila': 'PHP',

    // Taiwan
    'taiwan': 'TWD', 'taipei': 'TWD',

    // Norway
    'norway': 'NOK', 'oslo': 'NOK',

    // Sweden
    'sweden': 'SEK', 'stockholm': 'SEK',

    // Denmark
    'denmark': 'DKK', 'copenhagen': 'DKK',

    // Russia
    'russia': 'RUB', 'moscow': 'RUB',

    // Poland
    'poland': 'PLN', 'warsaw': 'PLN',

    // Israel
    'israel': 'ILS', 'tel aviv': 'ILS', 'jerusalem': 'ILS',
  };

  for (const [key, currency] of Object.entries(countryMapping)) {
    if (destLower.includes(key)) {
      return currency;
    }
  }

  return 'USD'; // Default fallback
}

export interface ExchangeRatesData {
  base: string;
  rates: { [key: string]: number };
  isMock: boolean;
  fetchedAt: string;
}

export async function fetchExchangeRates(baseCurrency: string): Promise<ExchangeRatesData> {
  const cacheKey = `travel_rates_${baseCurrency}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      const fetchedTime = new Date(parsed.fetchedAt).getTime();
      const now = Date.now();
      // Cache for 24 hours
      if (now - fetchedTime < 86400000) {
        return parsed;
      }
    } catch (err) {
      console.warn('Error reading rates cache:', err);
    }
  }

  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
    if (!response.ok) throw new Error('Network error fetching exchange rates');
    const data = await response.json();
    if (data.result === 'success' && data.rates) {
      const ratesResult: ExchangeRatesData = {
        base: baseCurrency,
        rates: data.rates,
        isMock: false,
        fetchedAt: new Date().toISOString()
      };
      localStorage.setItem(cacheKey, JSON.stringify(ratesResult));
      return ratesResult;
    }
  } catch (err) {
    console.warn(`Failed to fetch live rates for ${baseCurrency}, checking cache fallbacks...`, err);
  }

  // Fallback to expired cache if it exists
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      return {
        ...parsed,
        isMock: true
      };
    } catch (err) {}
  }

  // Fallback to hardcoded rates
  return {
    base: baseCurrency,
    rates: getFallbackRatesForBase(baseCurrency),
    isMock: true,
    fetchedAt: new Date().toISOString()
  };
}
