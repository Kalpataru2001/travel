// src/utils/budget.ts
import type { BudgetData } from '../types/travel';

const DISTRIBUTIONS: Record<string, Record<string, number>> = {
  Budget: { Accommodation: 0.35, Transport: 0.20, Food: 0.30, Activities: 0.10, Shopping: 0.05, Others: 0.00 },
  Luxury: { Accommodation: 0.45, Transport: 0.15, Food: 0.20, Activities: 0.10, Shopping: 0.08, Others: 0.02 },
  Adventure: { Accommodation: 0.30, Transport: 0.15, Food: 0.25, Activities: 0.25, Shopping: 0.03, Others: 0.02 },
  Relaxation: { Accommodation: 0.45, Transport: 0.10, Food: 0.25, Activities: 0.15, Shopping: 0.03, Others: 0.02 },
  Culture: { Accommodation: 0.35, Transport: 0.15, Food: 0.25, Activities: 0.20, Shopping: 0.03, Others: 0.02 },
  Default: { Accommodation: 0.40, Transport: 0.15, Food: 0.25, Activities: 0.15, Shopping: 0.05, Others: 0.00 }
};

/**
 * Generates an estimated initial budget breakdown based on duration and travel style.
 */
export function generateDefaultBudget(duration: number, travelStyle: string, destination: string): BudgetData {
  // Base daily cost estimations
  let dailyCost = 120;
  
  if (travelStyle === 'Budget') dailyCost = 50;
  else if (travelStyle === 'Luxury') dailyCost = 500;
  else if (travelStyle === 'Relaxation') dailyCost = 160;
  else if (travelStyle === 'Adventure') dailyCost = 130;
  else if (travelStyle === 'Culture') dailyCost = 100;

  // Modify daily cost slightly based on destination tags if needed
  const destLower = destination.toLowerCase();
  if (destLower.includes('switzerland') || destLower.includes('japan') || destLower.includes('paris') || destLower.includes('london') || destLower.includes('new york') || destLower.includes('dubai')) {
    dailyCost *= 1.3; // expensive destinations
  } else if (destLower.includes('india') || destLower.includes('thailand') || destLower.includes('vietnam') || destLower.includes('indonesia') || destLower.includes('egypt')) {
    dailyCost *= 0.7; // budget destinations
  }

  const totalBudget = Math.round(duration * dailyCost);
  const dist = DISTRIBUTIONS[travelStyle] || DISTRIBUTIONS.Default;

  const categoryBudgets: Record<string, number> = {};
  for (const [category, percent] of Object.entries(dist)) {
    categoryBudgets[category] = Math.round(totalBudget * percent);
  }

  return {
    totalBudget,
    categoryBudgets,
    expenses: []
  };
}
