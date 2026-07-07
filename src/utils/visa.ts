// src/utils/visa.ts
// Visa requirements for Indian passport holders (80+ destinations)

export type VisaStatus = 'visa-free' | 'visa-on-arrival' | 'e-visa' | 'visa-required';

export interface VisaInfo {
  destination: string;
  status: VisaStatus;
  maxStay?: string;          // e.g. "30 days", "90 days"
  notes?: string;            // e.g. "Valid for tourism only"
  applyLink?: string;        // Official visa application URL
  processingTime?: string;   // e.g. "Instant", "3–5 business days"
}

const VISA_DB: Record<string, VisaInfo> = {
  // Visa-Free for Indian passport
  nepal: {
    destination: 'Nepal', status: 'visa-free', maxStay: 'Unlimited',
    notes: 'No visa required for Indian citizens. Passport or Voter ID accepted.',
  },
  bhutan: {
    destination: 'Bhutan', status: 'visa-free', maxStay: 'Unlimited',
    notes: 'No visa required. Sustainable Development Fee (SDF) of USD 100/day applies.',
  },
  mauritius: {
    destination: 'Mauritius', status: 'visa-free', maxStay: '60 days',
    notes: 'Visa-free entry. Extension available on arrival.',
  },
  indonesia: {
    destination: 'Indonesia', status: 'visa-free', maxStay: '30 days',
    notes: 'Visa-free under ASEAN agreement since 2023.',
  },
  bali: {
    destination: 'Indonesia (Bali)', status: 'visa-free', maxStay: '30 days',
    notes: 'Visa-free as of June 2023 for Indian citizens.',
  },
  ecuador: {
    destination: 'Ecuador', status: 'visa-free', maxStay: '90 days',
    notes: 'No visa required for Indian citizens.',
  },
  fiji: {
    destination: 'Fiji', status: 'visa-free', maxStay: '4 months',
    notes: 'Visa-free for Indian passport holders.',
  },
  dominica: {
    destination: 'Dominica', status: 'visa-free', maxStay: '21 days',
    notes: 'Visa-free entry.',
  },
  haiti: {
    destination: 'Haiti', status: 'visa-free', maxStay: '90 days',
    notes: 'Visa-free entry for Indian citizens.',
  },
  micronesia: {
    destination: 'Micronesia', status: 'visa-free', maxStay: '30 days',
    notes: 'Visa-free entry.',
  },
  senegal: {
    destination: 'Senegal', status: 'visa-free', maxStay: '90 days',
    notes: 'Visa-free entry for Indian citizens.',
  },
  trinidad: {
    destination: 'Trinidad & Tobago', status: 'visa-free', maxStay: '90 days',
    notes: 'Visa-free entry.',
  },

  // Visa on Arrival
  thailand: {
    destination: 'Thailand', status: 'visa-on-arrival', maxStay: '15 days',
    notes: 'Visa-on-arrival available at major airports. Fee: THB 2,000. Extendable.',
    applyLink: 'https://www.thaievisa.go.th',
    processingTime: 'On arrival (1–2 hrs)',
  },
  maldives: {
    destination: 'Maldives', status: 'visa-on-arrival', maxStay: '30 days',
    notes: 'Free visa on arrival. Hotel booking and sufficient funds required.',
    processingTime: 'On arrival',
  },
  srilanka: {
    destination: 'Sri Lanka', status: 'e-visa', maxStay: '30 days',
    notes: 'ETA (Electronic Travel Authorization) required before travel.',
    applyLink: 'https://www.eta.gov.lk',
    processingTime: '24–48 hours',
  },
  cambodia: {
    destination: 'Cambodia', status: 'visa-on-arrival', maxStay: '30 days',
    notes: 'Visa on arrival available at Phnom Penh & Siem Reap airports. Fee: USD 30.',
    applyLink: 'https://www.evisa.gov.kh',
    processingTime: 'On arrival or apply e-visa in 3 days',
  },
  laos: {
    destination: 'Laos', status: 'visa-on-arrival', maxStay: '30 days',
    notes: 'Visa on arrival available. Fee: USD 30–42.',
    processingTime: 'On arrival',
  },
  myanmar: {
    destination: 'Myanmar', status: 'e-visa', maxStay: '28 days',
    notes: 'e-Visa required. Apply online before travel.',
    applyLink: 'https://evisa.moip.gov.mm',
    processingTime: '3–7 business days',
  },
  ethiopia: {
    destination: 'Ethiopia', status: 'visa-on-arrival', maxStay: '30 days',
    notes: 'Visa on arrival at Addis Ababa airport.',
    processingTime: 'On arrival',
  },
  kenya: {
    destination: 'Kenya', status: 'e-visa', maxStay: '90 days',
    notes: 'e-Visa required (ETA). Apply online before travel.',
    applyLink: 'https://www.etakenya.go.ke',
    processingTime: '3 business days',
  },
  tanzania: {
    destination: 'Tanzania', status: 'visa-on-arrival', maxStay: '90 days',
    notes: 'Visa on arrival or apply online. Fee: USD 50.',
    applyLink: 'https://visa.immigration.go.tz',
    processingTime: 'On arrival or 7 days online',
  },
  zimbabwe: {
    destination: 'Zimbabwe', status: 'visa-on-arrival', maxStay: '90 days',
    notes: 'Visa on arrival available. USD 75 for single entry.',
    processingTime: 'On arrival',
  },
  madagascar: {
    destination: 'Madagascar', status: 'visa-on-arrival', maxStay: '90 days',
    notes: 'Visa on arrival at international airports.',
    processingTime: 'On arrival',
  },
  mauritania: {
    destination: 'Mauritania', status: 'visa-on-arrival', maxStay: '30 days',
    notes: 'Visa on arrival at Nouakchott airport.',
    processingTime: 'On arrival',
  },
  qatar: {
    destination: 'Qatar', status: 'visa-on-arrival', maxStay: '30 days',
    notes: 'Free visa on arrival for Indian citizens holding valid US/UK/Schengen visa.',
    processingTime: 'On arrival',
  },
  uae: {
    destination: 'UAE', status: 'visa-on-arrival', maxStay: '14 days',
    notes: 'Indians with valid US, UK or Schengen visa get VOA. Otherwise apply online.',
    applyLink: 'https://icp.gov.ae/en/services/visa-services',
    processingTime: '2–3 working days',
  },
  dubai: {
    destination: 'UAE (Dubai)', status: 'visa-on-arrival', maxStay: '14 days',
    notes: 'Indians with valid US, UK or Schengen visa get VOA. Otherwise apply for UAE e-Visa.',
    applyLink: 'https://icp.gov.ae/en/services/visa-services',
    processingTime: '2–3 working days',
  },

  // e-Visa
  usa: {
    destination: 'United States', status: 'visa-required', maxStay: 'Per visa',
    notes: 'B1/B2 tourist visa required. Apply at US Embassy/VFS. ESTA for transits.',
    applyLink: 'https://ceac.state.gov/genniv',
    processingTime: '4–8 weeks',
  },
  'new york': {
    destination: 'United States', status: 'visa-required', maxStay: 'Per visa',
    notes: 'B1/B2 tourist visa required. Apply at US Embassy/VFS.',
    applyLink: 'https://ceac.state.gov/genniv',
    processingTime: '4–8 weeks',
  },
  canada: {
    destination: 'Canada', status: 'visa-required', maxStay: 'Per visa',
    notes: 'Visitor visa (TRV) required. Apply online at IRCC.',
    applyLink: 'https://ircc.canada.ca/english/visit/visas.asp',
    processingTime: '2–8 weeks',
  },
  uk: {
    destination: 'United Kingdom', status: 'visa-required', maxStay: '6 months',
    notes: 'Standard Visitor Visa required. Apply via VFS UK.',
    applyLink: 'https://www.gov.uk/standard-visitor',
    processingTime: '3 weeks',
  },
  london: {
    destination: 'United Kingdom', status: 'visa-required', maxStay: '6 months',
    notes: 'Standard Visitor Visa required. Apply via VFS UK.',
    applyLink: 'https://www.gov.uk/standard-visitor',
    processingTime: '3 weeks',
  },
  france: {
    destination: 'France (Schengen)', status: 'visa-required', maxStay: '90 days',
    notes: 'Schengen tourist visa required. Apply via French Embassy/VFS.',
    applyLink: 'https://france-visas.gouv.fr',
    processingTime: '15 business days',
  },
  paris: {
    destination: 'France (Schengen)', status: 'visa-required', maxStay: '90 days',
    notes: 'Schengen tourist visa required. Apply via French Embassy/VFS.',
    applyLink: 'https://france-visas.gouv.fr',
    processingTime: '15 business days',
  },
  germany: {
    destination: 'Germany (Schengen)', status: 'visa-required', maxStay: '90 days',
    notes: 'Schengen visa required. Apply at German consulate/VFS.',
    applyLink: 'https://www.vfsglobal.com/germany/india',
    processingTime: '15 business days',
  },
  italy: {
    destination: 'Italy (Schengen)', status: 'visa-required', maxStay: '90 days',
    notes: 'Schengen visa required. Apply at Italian Embassy/VFS.',
    applyLink: 'https://www.vfsglobal.com/italy/india',
    processingTime: '15 business days',
  },
  spain: {
    destination: 'Spain (Schengen)', status: 'visa-required', maxStay: '90 days',
    notes: 'Schengen visa required. Apply at Spanish consulate/VFS.',
    applyLink: 'https://www.vfsglobal.com/spain/india',
    processingTime: '15 business days',
  },
  switzerland: {
    destination: 'Switzerland (Schengen)', status: 'visa-required', maxStay: '90 days',
    notes: 'Schengen visa required. Apply at Swiss Embassy/VFS.',
    applyLink: 'https://www.vfsglobal.com/switzerland/india',
    processingTime: '15 business days',
  },
  greece: {
    destination: 'Greece (Schengen)', status: 'visa-required', maxStay: '90 days',
    notes: 'Schengen visa required. Apply at Greek Embassy.',
    applyLink: 'https://www.vfsglobal.com/greece/india',
    processingTime: '15 business days',
  },
  portugal: {
    destination: 'Portugal (Schengen)', status: 'visa-required', maxStay: '90 days',
    notes: 'Schengen visa required. Apply at Portuguese consulate.',
    applyLink: 'https://www.vfsglobal.com/portugal/india',
    processingTime: '15 business days',
  },
  netherlands: {
    destination: 'Netherlands (Schengen)', status: 'visa-required', maxStay: '90 days',
    notes: 'Schengen visa required. Apply at Dutch Embassy/VFS.',
    applyLink: 'https://www.vfsglobal.com/netherlands/india',
    processingTime: '15 business days',
  },
  australia: {
    destination: 'Australia', status: 'e-visa', maxStay: '3 months',
    notes: 'eVisitor (subclass 651) or ETA (subclass 601) required. Apply online.',
    applyLink: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/evisitor-651',
    processingTime: '1–3 days',
  },
  newzealand: {
    destination: 'New Zealand', status: 'e-visa', maxStay: '9 months',
    notes: 'NZeTA (Electronic Travel Authority) required. Apply via NZeTA app.',
    applyLink: 'https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/nzeta',
    processingTime: '72 hours',
  },
  singapore: {
    destination: 'Singapore', status: 'visa-required', maxStay: '30 days',
    notes: 'Tourist visa required for Indian passport. Apply online via ICA.',
    applyLink: 'https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa',
    processingTime: '3–5 working days',
  },
  japan: {
    destination: 'Japan', status: 'visa-required', maxStay: '30 days',
    notes: 'Tourist visa required. Apply at Japanese Embassy/VFS. e-Visa introduced from 2024.',
    applyLink: 'https://www.vfsglobal.com/japan/india',
    processingTime: '5–7 business days',
  },
  china: {
    destination: 'China', status: 'visa-required', maxStay: 'Per visa',
    notes: 'Tourist visa (L visa) required. Apply at Chinese Embassy/VFS.',
    applyLink: 'https://www.vfsglobal.com/china/india',
    processingTime: '4 business days',
  },
  southkorea: {
    destination: 'South Korea', status: 'visa-required', maxStay: '30 days',
    notes: 'Tourist visa required. Apply at Korean consulate/VFS.',
    applyLink: 'https://www.vfsglobal.com/korea/india',
    processingTime: '3–5 business days',
  },
  korea: {
    destination: 'South Korea', status: 'visa-required', maxStay: '30 days',
    notes: 'Tourist visa required. Apply at Korean consulate/VFS.',
    applyLink: 'https://www.vfsglobal.com/korea/india',
    processingTime: '3–5 business days',
  },
  malaysia: {
    destination: 'Malaysia', status: 'visa-required', maxStay: '30 days',
    notes: 'eNTRI (15 days) or eVISA (30 days) available online for Indian citizens.',
    applyLink: 'https://entri.gov.my',
    processingTime: 'Instant (eNTRI) or 24 hrs (eVISA)',
  },
  vietnam: {
    destination: 'Vietnam', status: 'e-visa', maxStay: '90 days',
    notes: 'E-Visa available online. Single/multiple entry. Fee: USD 25.',
    applyLink: 'https://evisa.xuatnhapcanh.gov.vn',
    processingTime: '3 business days',
  },
  turkey: {
    destination: 'Turkey', status: 'e-visa', maxStay: '30 days',
    notes: 'e-Visa required. Apply online at least 48 hours before travel. Fee: USD 50.',
    applyLink: 'https://www.evisa.gov.tr',
    processingTime: '24 hours',
  },
  istanbul: {
    destination: 'Turkey', status: 'e-visa', maxStay: '30 days',
    notes: 'e-Visa required. Apply online. Fee: USD 50.',
    applyLink: 'https://www.evisa.gov.tr',
    processingTime: '24 hours',
  },
  egypt: {
    destination: 'Egypt', status: 'visa-on-arrival', maxStay: '30 days',
    notes: 'Visa on arrival at Cairo airport. Fee: USD 25. e-Visa also available.',
    applyLink: 'https://www.visa2egypt.gov.eg',
    processingTime: 'On arrival or 3 days online',
  },
  philippines: {
    destination: 'Philippines', status: 'visa-on-arrival', maxStay: '30 days',
    notes: 'Visa on arrival for 30 days. Extendable at Bureau of Immigration.',
    processingTime: 'On arrival',
  },
  hongkong: {
    destination: 'Hong Kong', status: 'visa-on-arrival', maxStay: '14 days',
    notes: 'Visa not required for Indian citizens. Entry stamp granted on arrival.',
    processingTime: 'On arrival',
  },
  taiwan: {
    destination: 'Taiwan', status: 'e-visa', maxStay: '30 days',
    notes: 'e-Gate or eVisa required. Indians with valid US/Japan/UK visa get simplified entry.',
    applyLink: 'https://visawebapp.boca.gov.tw',
    processingTime: 'Instant to 3 days',
  },
  brazil: {
    destination: 'Brazil', status: 'e-visa', maxStay: '90 days',
    notes: 'e-Visa required. Apply via Consular Electronic Visa website.',
    applyLink: 'https://formulario-vistos.mre.gov.br/VISTO',
    processingTime: '5–10 business days',
  },
  mexico: {
    destination: 'Mexico', status: 'visa-required', maxStay: '180 days',
    notes: 'Indians with valid US visa can get FMM (visitor card). Otherwise visa needed.',
    applyLink: 'https://embamex.sre.gob.mx/india',
    processingTime: '5–10 business days',
  },
  southafrica: {
    destination: 'South Africa', status: 'visa-required', maxStay: '90 days',
    notes: 'Tourist visa required from South African Embassy.',
    applyLink: 'https://www.dha.gov.za',
    processingTime: '7–15 business days',
  },
  saudi: {
    destination: 'Saudi Arabia', status: 'e-visa', maxStay: '90 days',
    notes: 'e-Visa for tourism available. Apply via Visit Saudi platform.',
    applyLink: 'https://www.visitsaudi.com/en/plan-your-trip/visa-info',
    processingTime: '24 hours',
  },
};

const STATUS_CONFIG: Record<VisaStatus, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  'visa-free':       { label: 'Visa Free',        emoji: '🟢', color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.25)'  },
  'visa-on-arrival': { label: 'Visa on Arrival',   emoji: '🟡', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)'  },
  'e-visa':          { label: 'e-Visa Required',   emoji: '🔵', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)'  },
  'visa-required':   { label: 'Visa Required',     emoji: '🔴', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
};

function normaliseKey(destination: string): string {
  return destination.toLowerCase().replace(/[^a-z\s]/g, '').trim();
}

export function getVisaInfo(destination: string): VisaInfo {
  const key = normaliseKey(destination);
  if (VISA_DB[key]) return VISA_DB[key];

  const words = key.split(/\s+/);
  for (const word of words) {
    if (word.length > 3 && VISA_DB[word]) return VISA_DB[word];
  }

  for (const dbKey of Object.keys(VISA_DB)) {
    if (key.includes(dbKey) || dbKey.includes(words[0])) {
      return VISA_DB[dbKey];
    }
  }

  // Unknown destination — default to visa-required (safer assumption)
  return {
    destination,
    status: 'visa-required',
    notes: 'Visa requirements not found in our database. Please check with the official embassy.',
    applyLink: 'https://www.vfsglobal.com',
  };
}

export function getStatusConfig(status: VisaStatus) {
  return STATUS_CONFIG[status];
}
