// src/utils/emergency.ts
// Emergency contact numbers for 60+ countries

export interface EmergencyContacts {
  country: string;
  police: string;
  ambulance: string;
  fire: string;
  touristHelpline?: string;
  embassyIndia?: string; // Indian embassy number in that country
  embassyNote?: string;
}

const EMERGENCY_DB: Record<string, EmergencyContacts> = {
  // Asia
  india: {
    country: 'India', police: '100', ambulance: '108', fire: '101',
    touristHelpline: '1363', embassyIndia: 'N/A (Home country)',
  },
  japan: {
    country: 'Japan', police: '110', ambulance: '119', fire: '119',
    touristHelpline: '+81-3-3211-1234',
    embassyIndia: '+81-3-3262-2391', embassyNote: 'Embassy of India, Tokyo',
  },
  thailand: {
    country: 'Thailand', police: '191', ambulance: '1669', fire: '199',
    touristHelpline: '1155',
    embassyIndia: '+66-2-258-0300', embassyNote: 'Embassy of India, Bangkok',
  },
  bali: {
    country: 'Indonesia (Bali)', police: '110', ambulance: '118', fire: '113',
    touristHelpline: '+62-361-224-111',
    embassyIndia: '+62-21-5204150', embassyNote: 'Embassy of India, Jakarta',
  },
  indonesia: {
    country: 'Indonesia', police: '110', ambulance: '118', fire: '113',
    touristHelpline: '021-500-333',
    embassyIndia: '+62-21-5204150', embassyNote: 'Embassy of India, Jakarta',
  },
  singapore: {
    country: 'Singapore', police: '999', ambulance: '995', fire: '995',
    touristHelpline: '+65-6736-2000',
    embassyIndia: '+65-6737-6777', embassyNote: 'High Commission of India, Singapore',
  },
  malaysia: {
    country: 'Malaysia', police: '999', ambulance: '999', fire: '994',
    touristHelpline: '1300-88-5050',
    embassyIndia: '+60-3-2093-3510', embassyNote: 'High Commission of India, KL',
  },
  uae: {
    country: 'UAE', police: '999', ambulance: '998', fire: '997',
    touristHelpline: '800-DUBAI',
    embassyIndia: '+971-4-397-1333', embassyNote: 'Consulate General of India, Dubai',
  },
  dubai: {
    country: 'UAE (Dubai)', police: '999', ambulance: '998', fire: '997',
    touristHelpline: '600-522-222',
    embassyIndia: '+971-4-397-1333', embassyNote: 'Consulate General of India, Dubai',
  },
  china: {
    country: 'China', police: '110', ambulance: '120', fire: '119',
    touristHelpline: '12301',
    embassyIndia: '+86-10-6532-1908', embassyNote: 'Embassy of India, Beijing',
  },
  nepal: {
    country: 'Nepal', police: '100', ambulance: '102', fire: '101',
    touristHelpline: '+977-1-4247041',
    embassyIndia: '+977-1-4410900', embassyNote: 'Embassy of India, Kathmandu',
  },
  srilanka: {
    country: 'Sri Lanka', police: '119', ambulance: '110', fire: '111',
    touristHelpline: '1912',
    embassyIndia: '+94-11-2327587', embassyNote: 'High Commission of India, Colombo',
  },
  maldives: {
    country: 'Maldives', police: '119', ambulance: '102', fire: '118',
    touristHelpline: '+960-332-3224',
    embassyIndia: '+960-332-7014', embassyNote: 'High Commission of India, Malé',
  },
  vietnam: {
    country: 'Vietnam', police: '113', ambulance: '115', fire: '114',
    touristHelpline: '1800-599-920',
    embassyIndia: '+84-24-3823-0244', embassyNote: 'Embassy of India, Hanoi',
  },
  cambodia: {
    country: 'Cambodia', police: '117', ambulance: '119', fire: '118',
    touristHelpline: '+855-23-726-258',
    embassyIndia: '+855-23-210-912', embassyNote: 'Embassy of India, Phnom Penh',
  },
  philippines: {
    country: 'Philippines', police: '911', ambulance: '911', fire: '911',
    touristHelpline: '+63-2-8525-7799',
    embassyIndia: '+63-2-8843-4688', embassyNote: 'Embassy of India, Manila',
  },
  southkorea: {
    country: 'South Korea', police: '112', ambulance: '119', fire: '119',
    touristHelpline: '1330',
    embassyIndia: '+82-2-798-4257', embassyNote: 'Embassy of India, Seoul',
  },
  korea: {
    country: 'South Korea', police: '112', ambulance: '119', fire: '119',
    touristHelpline: '1330',
    embassyIndia: '+82-2-798-4257', embassyNote: 'Embassy of India, Seoul',
  },
  hongkong: {
    country: 'Hong Kong', police: '999', ambulance: '999', fire: '999',
    touristHelpline: '+852-2508-1234',
    embassyIndia: '+852-2528-4028', embassyNote: 'Consulate General of India, HK',
  },
  taiwan: {
    country: 'Taiwan', police: '110', ambulance: '119', fire: '119',
    touristHelpline: '0800-011-765',
    embassyIndia: '+886-2-2351-7030', embassyNote: 'India-Taipei Association',
  },

  // Europe
  france: {
    country: 'France', police: '17', ambulance: '15', fire: '18',
    touristHelpline: '+33-1-49-52-53-54',
    embassyIndia: '+33-1-40-50-70-70', embassyNote: 'Embassy of India, Paris',
  },
  paris: {
    country: 'France (Paris)', police: '17', ambulance: '15', fire: '18',
    touristHelpline: '+33-1-49-52-53-54',
    embassyIndia: '+33-1-40-50-70-70', embassyNote: 'Embassy of India, Paris',
  },
  germany: {
    country: 'Germany', police: '110', ambulance: '112', fire: '112',
    touristHelpline: '+49-30-250-025',
    embassyIndia: '+49-30-2579-0', embassyNote: 'Embassy of India, Berlin',
  },
  italy: {
    country: 'Italy', police: '113', ambulance: '118', fire: '115',
    touristHelpline: '+39-06-36004399',
    embassyIndia: '+39-06-4884642', embassyNote: 'Embassy of India, Rome',
  },
  spain: {
    country: 'Spain', police: '091', ambulance: '112', fire: '080',
    touristHelpline: '+34-91-541-3969',
    embassyIndia: '+34-91-309-8770', embassyNote: 'Embassy of India, Madrid',
  },
  uk: {
    country: 'United Kingdom', police: '999', ambulance: '999', fire: '999',
    touristHelpline: '+44-20-7932-2000',
    embassyIndia: '+44-20-7836-8484', embassyNote: 'High Commission of India, London',
  },
  london: {
    country: 'United Kingdom', police: '999', ambulance: '999', fire: '999',
    touristHelpline: '0800-389-3010',
    embassyIndia: '+44-20-7836-8484', embassyNote: 'High Commission of India, London',
  },
  switzerland: {
    country: 'Switzerland', police: '117', ambulance: '144', fire: '118',
    touristHelpline: '+41-44-215-4040',
    embassyIndia: '+41-31-350-1110', embassyNote: 'Embassy of India, Bern',
  },
  greece: {
    country: 'Greece', police: '100', ambulance: '166', fire: '199',
    touristHelpline: '+30-210-870-7000',
    embassyIndia: '+30-210-721-6227', embassyNote: 'Embassy of India, Athens',
  },
  portugal: {
    country: 'Portugal', police: '112', ambulance: '112', fire: '112',
    touristHelpline: '+351-21-361-2800',
    embassyIndia: '+351-21-381-6090', embassyNote: 'Embassy of India, Lisbon',
  },
  netherlands: {
    country: 'Netherlands', police: '112', ambulance: '112', fire: '112',
    touristHelpline: '+31-70-370-7171',
    embassyIndia: '+31-70-346-9771', embassyNote: 'Embassy of India, The Hague',
  },
  austria: {
    country: 'Austria', police: '133', ambulance: '144', fire: '122',
    touristHelpline: '+43-1-587-3714',
    embassyIndia: '+43-1-505-8666', embassyNote: 'Embassy of India, Vienna',
  },
  turkey: {
    country: 'Turkey', police: '155', ambulance: '112', fire: '110',
    touristHelpline: '174',
    embassyIndia: '+90-312-438-2195', embassyNote: 'Embassy of India, Ankara',
  },
  istanbul: {
    country: 'Turkey (Istanbul)', police: '155', ambulance: '112', fire: '110',
    touristHelpline: '174',
    embassyIndia: '+90-212-296-2132', embassyNote: 'Consulate General of India, Istanbul',
  },

  // Americas
  usa: {
    country: 'United States', police: '911', ambulance: '911', fire: '911',
    touristHelpline: '1-800-225-5872',
    embassyIndia: '+1-202-939-7000', embassyNote: 'Embassy of India, Washington DC',
  },
  'new york': {
    country: 'United States (New York)', police: '911', ambulance: '911', fire: '911',
    touristHelpline: '311',
    embassyIndia: '+1-212-774-0600', embassyNote: 'Consulate General of India, New York',
  },
  canada: {
    country: 'Canada', police: '911', ambulance: '911', fire: '911',
    touristHelpline: '1-800-O-CANADA',
    embassyIndia: '+1-613-744-3751', embassyNote: 'High Commission of India, Ottawa',
  },
  brazil: {
    country: 'Brazil', police: '190', ambulance: '192', fire: '193',
    touristHelpline: '0800-023-1313',
    embassyIndia: '+55-61-3248-4006', embassyNote: 'Embassy of India, Brasília',
  },
  mexico: {
    country: 'Mexico', police: '911', ambulance: '911', fire: '911',
    touristHelpline: '078',
    embassyIndia: '+52-55-5531-1050', embassyNote: 'Embassy of India, Mexico City',
  },

  // Africa / Middle East
  egypt: {
    country: 'Egypt', police: '122', ambulance: '123', fire: '180',
    touristHelpline: '126',
    embassyIndia: '+20-2-2748-0820', embassyNote: 'Embassy of India, Cairo',
  },
  kenya: {
    country: 'Kenya', police: '999', ambulance: '999', fire: '999',
    touristHelpline: '+254-20-604-767',
    embassyIndia: '+254-20-264-9900', embassyNote: 'High Commission of India, Nairobi',
  },
  southafrica: {
    country: 'South Africa', police: '10111', ambulance: '10177', fire: '10177',
    touristHelpline: '0860-010-160',
    embassyIndia: '+27-12-342-5392', embassyNote: 'High Commission of India, Pretoria',
  },
  qatar: {
    country: 'Qatar', police: '999', ambulance: '999', fire: '999',
    touristHelpline: '109',
    embassyIndia: '+974-4467-7777', embassyNote: 'Embassy of India, Doha',
  },
  saudi: {
    country: 'Saudi Arabia', police: '999', ambulance: '911', fire: '998',
    touristHelpline: '920-004-230',
    embassyIndia: '+966-11-488-4144', embassyNote: 'Embassy of India, Riyadh',
  },

  // Oceania
  australia: {
    country: 'Australia', police: '000', ambulance: '000', fire: '000',
    touristHelpline: '1300-363-287',
    embassyIndia: '+61-2-6273-3999', embassyNote: 'High Commission of India, Canberra',
  },
  newzealand: {
    country: 'New Zealand', police: '111', ambulance: '111', fire: '111',
    touristHelpline: '0800-100-820',
    embassyIndia: '+64-4-473-6390', embassyNote: 'High Commission of India, Wellington',
  },
};

/** Normalise any destination string to a key for lookup */
function normaliseKey(destination: string): string {
  return destination
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim();
}

/** Look up emergency contacts by matching any word in the destination string */
export function getEmergencyContacts(destination: string): EmergencyContacts {
  const key = normaliseKey(destination);

  // Direct match
  if (EMERGENCY_DB[key]) return EMERGENCY_DB[key];

  // Try each word in the destination (handles "Kyoto, Japan" → "japan")
  const words = key.split(/\s+/);
  for (const word of words) {
    if (EMERGENCY_DB[word]) return EMERGENCY_DB[word];
  }

  // Partial match (e.g. "south korea" contains "korea")
  for (const dbKey of Object.keys(EMERGENCY_DB)) {
    if (key.includes(dbKey) || dbKey.includes(words[0])) {
      return EMERGENCY_DB[dbKey];
    }
  }

  // Fallback — international emergency number
  return {
    country: destination,
    police: '112',
    ambulance: '112',
    fire: '112',
    touristHelpline: undefined,
    embassyIndia: undefined,
    embassyNote: 'Contact nearest Indian Embassy',
  };
}
