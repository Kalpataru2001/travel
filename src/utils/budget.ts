// src/utils/budget.ts
import type { BudgetData } from '../types/travel';

const DISTRIBUTIONS: Record<string, Record<string, number>> = {
  Budget:     { Accommodation: 0.35, Transport: 0.20, Food: 0.30, Activities: 0.10, Shopping: 0.05, Others: 0.00 },
  Luxury:     { Accommodation: 0.45, Transport: 0.15, Food: 0.20, Activities: 0.10, Shopping: 0.08, Others: 0.02 },
  Adventure:  { Accommodation: 0.30, Transport: 0.15, Food: 0.25, Activities: 0.25, Shopping: 0.03, Others: 0.02 },
  Relaxation: { Accommodation: 0.45, Transport: 0.10, Food: 0.25, Activities: 0.15, Shopping: 0.03, Others: 0.02 },
  Culture:    { Accommodation: 0.35, Transport: 0.15, Food: 0.25, Activities: 0.20, Shopping: 0.03, Others: 0.02 },
  Default:    { Accommodation: 0.40, Transport: 0.15, Food: 0.25, Activities: 0.15, Shopping: 0.05, Others: 0.00 }
};

/**
 * Base daily costs in USD, per travel style.
 */
const BASE_DAILY_USD: Record<string, number> = {
  Budget:     50,
  Luxury:     500,
  Relaxation: 160,
  Adventure:  130,
  Culture:    100,
  Default:    120,
};

/**
 * Destination cost multipliers relative to global average.
 */
function getDestinationMultiplier(destination: string): number {
  const parts = destination.split(/[→,;]/).map((p) => p.trim().toLowerCase());
  let totalMultiplier = 0;
  
  parts.forEach((part) => {
    let mult = 1.0;
    if (
      part.includes('switzerland') || part.includes('japan') || part.includes('paris') ||
      part.includes('london') || part.includes('new york') || part.includes('dubai') ||
      part.includes('singapore') || part.includes('scandinavia') || part.includes('norway')
    ) {
      mult = 1.3;
    } else if (
      part.includes('india') || part.includes('thailand') || part.includes('vietnam') ||
      part.includes('indonesia') || part.includes('egypt') || part.includes('nepal') ||
      part.includes('cambodia') || part.includes('bali') || part.includes('goa') ||
      part.includes('mumbai') || part.includes('delhi') || part.includes('bangalore') ||
      part.includes('jaipur') || part.includes('kerala') || part.includes('bengaluru') ||
      part.includes('mysore') || part.includes('coorg') || part.includes('gokarna')
    ) {
      mult = 0.7;
    }
    totalMultiplier += mult;
  });
  
  return parts.length > 0 ? totalMultiplier / parts.length : 1.0;
}

/**
 * Fallback exchange rates relative to 1 USD.
 * Imported from currency.ts indirectly to avoid circular deps.
 */
const RATES_FROM_USD: Record<string, number> = {
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
};

/**
 * Generates an estimated initial budget breakdown based on duration, travel style,
 * destination, and user's preferred currency (defaulting to INR).
 */
export function generateDefaultBudget(
  duration: number,
  travelStyles: string[] | string,
  destination: string,
  preferredCurrency = 'INR'
): BudgetData {
  const styles = Array.isArray(travelStyles) ? travelStyles : [travelStyles];

  // Calculate average base daily cost
  let totalBaseDaily = 0;
  styles.forEach((style) => {
    totalBaseDaily += BASE_DAILY_USD[style] || BASE_DAILY_USD.Default;
  });
  const baseDaily = styles.length > 0 ? totalBaseDaily / styles.length : BASE_DAILY_USD.Default;

  const multiplier = getDestinationMultiplier(destination);
  const dailyCostUSD = baseDaily * multiplier;

  // Convert from USD to preferred currency
  const rate = RATES_FROM_USD[preferredCurrency] ?? RATES_FROM_USD.INR;
  const dailyCostLocal = dailyCostUSD * rate;

  const totalBudget = Math.round(duration * dailyCostLocal);

  // Merge category distributions by averaging them
  const mergedDist: Record<string, number> = {
    Accommodation: 0,
    Transport: 0,
    Food: 0,
    Activities: 0,
    Shopping: 0,
    Others: 0,
  };

  styles.forEach((style) => {
    const dist = DISTRIBUTIONS[style] || DISTRIBUTIONS.Default;
    for (const [category, percent] of Object.entries(dist)) {
      mergedDist[category] = (mergedDist[category] || 0) + percent;
    }
  });

  // Average and normalize distributions so they sum to exactly 1.0
  let sum = 0;
  for (const category of Object.keys(mergedDist)) {
    mergedDist[category] /= styles.length;
    sum += mergedDist[category];
  }

  // Handle rounding/normalization to ensure exactly 100% total
  if (sum > 0 && Math.abs(sum - 1.0) > 0.0001) {
    const categories = Object.keys(mergedDist);
    mergedDist[categories[0]] += (1.0 - sum);
  }

  const categoryBudgets: Record<string, number> = {};
  for (const [category, percent] of Object.entries(mergedDist)) {
    categoryBudgets[category] = Math.round(totalBudget * percent);
  }

  return {
    totalBudget,
    categoryBudgets,
    expenses: [],
    currency: preferredCurrency,
  };
}
