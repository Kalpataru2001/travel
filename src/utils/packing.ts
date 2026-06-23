// src/utils/packing.ts
import type { FullTripItinerary, PackingItem } from '../types/travel';

export function generateDefaultPackingList(
  trip: FullTripItinerary,
  currentTemp?: number,
  currentCondition?: string
): PackingItem[] {
  const items: Omit<PackingItem, 'id'>[] = [];
  const duration = trip.metadata.durationInDays;
  const styles = trip.metadata.travelStyles || [trip.metadata.travelStyle];

  // 1. ESSENTIALS (Core Documents, Money, Health)
  items.push(
    { item: 'Passport & Travel ID / Visas', category: 'Essentials', packed: false },
    { item: 'Flight / Transit Tickets & Confirmations', category: 'Essentials', packed: false },
    { item: 'Wallet (Cash, Cards, IDs)', category: 'Essentials', packed: false },
    { item: 'Phone, Charger & Power Bank', category: 'Essentials', packed: false },
    { item: 'First-Aid Kit & Personal Medications', category: 'Essentials', packed: false }
  );

  // International/Travel adaptors if needed (can be general)
  items.push({ item: 'Universal Travel Adapter', category: 'Essentials', packed: false });

  // 2. CLOTHING (Scaled based on duration)
  const underwearCount = Math.min(10, duration + 1);
  const socksCount = Math.min(10, duration + 1);
  const topsCount = Math.min(8, Math.ceil(duration * 0.8) + 1);

  items.push(
    { item: `${underwearCount}x Underwear & ${socksCount}x Socks`, category: 'Clothing', packed: false },
    { item: `${topsCount}x Shirts / Tops`, category: 'Clothing', packed: false },
    { item: 'Sleepwear (1–2 sets)', category: 'Clothing', packed: false },
    { item: 'Comfortable Walking Shoes', category: 'Clothing', packed: false }
  );

  // Travel Style specific clothing
  if (styles.includes('Adventure')) {
    items.push(
      { item: '2x Active/Hiking Pants', category: 'Clothing', packed: false },
      { item: 'Light Windbreaker / Jacket', category: 'Clothing', packed: false },
      { item: 'Sturdy Hiking Boots / Trail Shoes', category: 'Clothing', packed: false }
    );
  }
  if (styles.includes('Relaxation')) {
    items.push(
      { item: '2x Swimwear & Cover-ups', category: 'Clothing', packed: false },
      { item: '2x Casual Shorts / Skirts', category: 'Clothing', packed: false },
      { item: 'Sandals / Flip-flops', category: 'Clothing', packed: false }
    );
  }
  if (styles.includes('Culture')) {
    items.push(
      { item: 'Conservative Clothes (Temple-appropriate)', category: 'Clothing', packed: false },
      { item: 'Lightweight Smart-Casual Pants/Dresses', category: 'Clothing', packed: false }
    );
  }
  if (styles.includes('Luxury')) {
    items.push(
      { item: '1–2x Formal / Evening Wear Outfits', category: 'Clothing', packed: false },
      { item: 'Smart Casual Outfits (Dinner-ready)', category: 'Clothing', packed: false },
      { item: 'Premium Footwear / Dress Shoes', category: 'Clothing', packed: false }
    );
  }
  if (styles.includes('Budget')) {
    items.push(
      { item: 'Versatile Mix-and-match Pants (2)', category: 'Clothing', packed: false }
    );
  }

  // 3. TOILETRIES (Core + travel size essentials)
  items.push(
    { item: 'Toothbrush & Toothpaste', category: 'Toiletries', packed: false },
    { item: 'Shampoo, Conditioner & Soap (Travel size)', category: 'Toiletries', packed: false },
    { item: 'Deodorant', category: 'Toiletries', packed: false },
    { item: 'Hairbrush or Comb', category: 'Toiletries', packed: false },
    { item: 'Nail Clippers & Tweezers', category: 'Toiletries', packed: false }
  );

  // Style specific toiletries
  if (styles.includes('Luxury')) {
    items.push({ item: 'Premium Skincare / Cologne / Perfume', category: 'Toiletries', packed: false });
  }

  // 4. GEAR & OTHER (Gadgets, accessories, weather items)
  items.push(
    { item: 'Reusable Water Bottle', category: 'Gear', packed: false },
    { item: 'Small Daypack / Shoulder Bag', category: 'Gear', packed: false },
    { item: 'Ziploc Bags (for wet clothes or electronics)', category: 'Gear', packed: false }
  );

  // Travel style gear
  if (styles.includes('Adventure')) {
    items.push(
      { item: 'Insect Repellent Spray', category: 'Gear', packed: false },
      { item: 'Quick-dry Microfiber Towel', category: 'Gear', packed: false },
      { item: 'Headlamp / Small Flashlight', category: 'Gear', packed: false }
    );
  }
  if (styles.includes('Relaxation')) {
    items.push(
      { item: 'Polarized Sunglasses', category: 'Gear', packed: false },
      { item: 'Sunscreen (SPF 50+) & Lip Balm with SPF', category: 'Gear', packed: false },
      { item: 'Beach Towel & Sun Hat', category: 'Gear', packed: false }
    );
  }
  if (styles.includes('Budget')) {
    items.push(
      { item: 'Hostel Locker Padlock', category: 'Gear', packed: false },
      { item: 'Earplugs & Sleep Mask', category: 'Gear', packed: false },
      { item: 'Student / Youth Discount Card', category: 'Gear', packed: false }
    );
  }
  if (styles.includes('Culture')) {
    items.push(
      { item: 'Travel Camera / Extra Memory Card', category: 'Gear', packed: false },
      { item: 'Journal & Pen', category: 'Gear', packed: false },
      { item: 'Sunglasses & Sun Hat', category: 'Gear', packed: false }
    );
  }
  if (styles.includes('Luxury')) {
    items.push(
      { item: 'Noise-canceling Headphones', category: 'Gear', packed: false },
      { item: 'Designer Sunglasses', category: 'Gear', packed: false }
    );
  }

  // 5. WEATHER FALLBACK & INPUT (Dynamic weather adaptation)
  const condition = (currentCondition || '').toLowerCase();
  const temp = currentTemp;

  // Rain rules
  if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm') || condition.includes('mist')) {
    items.push(
      { item: 'Compact Travel Umbrella', category: 'Gear', packed: false },
      { item: 'Waterproof Rain Jacket / Poncho', category: 'Clothing', packed: false }
    );
  }

  // Hot weather rules
  if (temp !== undefined && temp > 25) {
    // Make sure sunscreen and sunglasses are present
    if (!items.some(i => i.item.toLowerCase().includes('sunscreen'))) {
      items.push({ item: 'Sunscreen (SPF 50+)', category: 'Toiletries', packed: false });
    }
    if (!items.some(i => i.item.toLowerCase().includes('sunglasses'))) {
      items.push({ item: 'Sunglasses', category: 'Gear', packed: false });
    }
    items.push({ item: 'Breathable Wide-brimmed Hat', category: 'Gear', packed: false });
  }

  // Cold weather rules
  if (temp !== undefined && temp < 15 || condition.includes('snow')) {
    items.push(
      { item: 'Heavy Winter Coat / Thermal Jacket', category: 'Clothing', packed: false },
      { item: 'Thermal Base Layers (Tops & Bottoms)', category: 'Clothing', packed: false },
      { item: 'Warm Beanie / Hat', category: 'Gear', packed: false },
      { item: 'Insulated Gloves', category: 'Gear', packed: false },
      { item: 'Scarf', category: 'Clothing', packed: false },
      { item: 'Extra Hydrating Skin Cream / Moisturizer', category: 'Toiletries', packed: false }
    );
  }

  // Deduplicate items list based on item name (lowercase check)
  const uniqueItems: Omit<PackingItem, 'id'>[] = [];
  const seenItems = new Set<string>();
  for (const item of items) {
    const itemKey = item.item.toLowerCase().trim();
    if (!seenItems.has(itemKey)) {
      seenItems.add(itemKey);
      uniqueItems.push(item);
    }
  }

  // Map to add IDs
  return uniqueItems.map((item, index) => ({
    ...item,
    id: `pack-${index + 1}-${Math.floor(Math.random() * 100000)}`
  }));
}
