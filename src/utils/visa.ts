// src/utils/visa.ts
// Bidirectional visa requirements: FROM (passport ISO) → TO (destination)
// Covers 10 major passport origins × 50+ destinations

export type VisaStatus =
  | 'visa-free'
  | 'visa-on-arrival'
  | 'e-visa'
  | 'visa-required'
  | 'domestic';

export interface VisaInfo {
  destination: string;
  fromCountry: string;
  status: VisaStatus;
  maxStay?: string;
  notes?: string;
  applyLink?: string;
  processingTime?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DB key format: "ISO_FROM→ISO_TO"  (both uppercase ISO-2 codes)
// ─────────────────────────────────────────────────────────────────────────────
const VISA_DB: Record<string, Omit<VisaInfo, 'destination' | 'fromCountry'>> = {

  // ══════════════════════════════════════════════════
  // 🇮🇳  INDIA (IN) — travelling to
  // ══════════════════════════════════════════════════
  'IN→IN':  { status: 'domestic' },
  'IN→NP':  { status: 'visa-free', maxStay: 'Unlimited', notes: 'No visa. Passport or Voter ID accepted.' },
  'IN→BT':  { status: 'visa-free', maxStay: 'Unlimited', notes: 'No visa. SDF fee USD 100/day applies.' },
  'IN→MU':  { status: 'visa-free', maxStay: '60 days', notes: 'Visa-free entry. Extension available on arrival.' },
  'IN→ID':  { status: 'visa-free', maxStay: '30 days', notes: 'Visa-free as of 2023 (includes Bali).' },
  'IN→MV':  { status: 'visa-on-arrival', maxStay: '30 days', notes: 'Free visa on arrival. Hotel booking required.', processingTime: 'On arrival' },
  'IN→TH':  { status: 'visa-on-arrival', maxStay: '15 days', notes: 'VOA at major airports. Fee: THB 2,000.', applyLink: 'https://www.thaievisa.go.th', processingTime: 'On arrival (1–2 hrs)' },
  'IN→KH':  { status: 'visa-on-arrival', maxStay: '30 days', notes: 'VOA at Phnom Penh & Siem Reap. Fee: USD 30.', applyLink: 'https://www.evisa.gov.kh', processingTime: 'On arrival' },
  'IN→EG':  { status: 'visa-on-arrival', maxStay: '30 days', notes: 'VOA at Cairo airport. Fee: USD 25.', applyLink: 'https://www.visa2egypt.gov.eg', processingTime: 'On arrival' },
  'IN→QA':  { status: 'visa-on-arrival', maxStay: '30 days', notes: 'Free VOA for Indians holding valid US/UK/Schengen visa. Otherwise apply online.', processingTime: 'On arrival' },
  'IN→ET':  { status: 'visa-on-arrival', maxStay: '30 days', notes: 'VOA at Addis Ababa airport.', processingTime: 'On arrival' },
  'IN→PH':  { status: 'visa-on-arrival', maxStay: '30 days', notes: 'Entry stamp on arrival. Extendable at Bureau of Immigration.', processingTime: 'On arrival' },
  'IN→HK':  { status: 'visa-on-arrival', maxStay: '14 days', notes: 'Entry stamp granted on arrival, no visa needed.', processingTime: 'On arrival' },
  'IN→LK':  { status: 'e-visa', maxStay: '30 days', notes: 'ETA (Electronic Travel Authorization) required before travel.', applyLink: 'https://www.eta.gov.lk', processingTime: '24–48 hours' },
  'IN→VN':  { status: 'e-visa', maxStay: '90 days', notes: 'E-Visa required. Fee: USD 25. Single/multiple entry.', applyLink: 'https://evisa.xuatnhapcanh.gov.vn', processingTime: '3 business days' },
  'IN→TR':  { status: 'e-visa', maxStay: '30 days', notes: 'e-Visa required. Apply min 48 hrs before. Fee: USD 50.', applyLink: 'https://www.evisa.gov.tr', processingTime: '24 hours' },
  'IN→AU':  { status: 'e-visa', maxStay: '3 months', notes: 'eVisitor (651) or ETA (601) required.', applyLink: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/evisitor-651', processingTime: '1–3 days' },
  'IN→NZ':  { status: 'e-visa', maxStay: '9 months', notes: 'NZeTA required. Apply via NZeTA app.', applyLink: 'https://www.immigration.govt.nz', processingTime: '72 hours' },
  'IN→TW':  { status: 'e-visa', maxStay: '30 days', notes: 'eVisa required. Indians with valid US/Japan/UK visa get simplified entry.', applyLink: 'https://visawebapp.boca.gov.tw', processingTime: '1–3 days' },
  'IN→MY':  { status: 'e-visa', maxStay: '30 days', notes: 'eNTRI (15 days) or eVISA (30 days) available online.', applyLink: 'https://entri.gov.my', processingTime: 'Instant (eNTRI)' },
  'IN→SA':  { status: 'e-visa', maxStay: '90 days', notes: 'e-Visa for tourism.', applyLink: 'https://www.visitsaudi.com', processingTime: '24 hours' },
  'IN→BR':  { status: 'e-visa', maxStay: '90 days', notes: 'e-Visa required.', applyLink: 'https://formulario-vistos.mre.gov.br/VISTO', processingTime: '5–10 days' },
  'IN→KE':  { status: 'e-visa', maxStay: '90 days', notes: 'ETA required before travel.', applyLink: 'https://www.etakenya.go.ke', processingTime: '3 business days' },
  'IN→AE':  { status: 'visa-on-arrival', maxStay: '14 days', notes: 'Indians with valid US/UK/Schengen visa get VOA. Otherwise apply UAE e-Visa.', applyLink: 'https://icp.gov.ae', processingTime: '2–3 working days' },
  'IN→JP':  { status: 'visa-required', maxStay: '30 days', notes: 'Tourist visa (single/multiple entry). Apply via VFS or Japan Embassy.', applyLink: 'https://www.vfsglobal.com/japan/india', processingTime: '5–7 business days' },
  'IN→CN':  { status: 'visa-required', maxStay: 'Per visa', notes: 'L (tourist) visa required. Apply via Chinese Embassy/VFS.', applyLink: 'https://www.vfsglobal.com/china/india', processingTime: '4 business days' },
  'IN→KR':  { status: 'visa-required', maxStay: '30 days', notes: 'Tourist visa required.', applyLink: 'https://www.vfsglobal.com/korea/india', processingTime: '3–5 business days' },
  'IN→SG':  { status: 'visa-required', maxStay: '30 days', notes: 'Tourist visa required. Apply via ICA Singapore.', applyLink: 'https://www.ica.gov.sg', processingTime: '3–5 working days' },
  'IN→US':  { status: 'visa-required', maxStay: 'Per visa', notes: 'B1/B2 tourist visa required. Apply at US Embassy/VFS.', applyLink: 'https://ceac.state.gov/genniv', processingTime: '4–8 weeks' },
  'IN→GB':  { status: 'visa-required', maxStay: '6 months', notes: 'Standard Visitor Visa required. Apply via VFS UK.', applyLink: 'https://www.gov.uk/standard-visitor', processingTime: '3 weeks' },
  'IN→CA':  { status: 'visa-required', maxStay: 'Per visa', notes: 'Visitor Visa (TRV) required. Apply online at IRCC.', applyLink: 'https://ircc.canada.ca', processingTime: '2–8 weeks' },
  'IN→FR':  { status: 'visa-required', maxStay: '90 days', notes: 'Schengen tourist visa required.', applyLink: 'https://france-visas.gouv.fr', processingTime: '15 business days' },
  'IN→DE':  { status: 'visa-required', maxStay: '90 days', notes: 'Schengen visa required.', applyLink: 'https://www.vfsglobal.com/germany/india', processingTime: '15 business days' },
  'IN→IT':  { status: 'visa-required', maxStay: '90 days', notes: 'Schengen visa required.', applyLink: 'https://www.vfsglobal.com/italy/india', processingTime: '15 business days' },
  'IN→ES':  { status: 'visa-required', maxStay: '90 days', notes: 'Schengen visa required.', applyLink: 'https://www.vfsglobal.com/spain/india', processingTime: '15 business days' },
  'IN→PT':  { status: 'visa-required', maxStay: '90 days', notes: 'Schengen visa required.', applyLink: 'https://www.vfsglobal.com/portugal/india', processingTime: '15 business days' },
  'IN→CH':  { status: 'visa-required', maxStay: '90 days', notes: 'Schengen visa required.', applyLink: 'https://www.vfsglobal.com/switzerland/india', processingTime: '15 business days' },
  'IN→GR':  { status: 'visa-required', maxStay: '90 days', notes: 'Schengen visa required.', applyLink: 'https://www.vfsglobal.com/greece/india', processingTime: '15 business days' },
  'IN→NL':  { status: 'visa-required', maxStay: '90 days', notes: 'Schengen visa required.', applyLink: 'https://www.vfsglobal.com/netherlands/india', processingTime: '15 business days' },
  'IN→AT':  { status: 'visa-required', maxStay: '90 days', notes: 'Schengen visa required.', applyLink: 'https://www.vfsglobal.com/austria/india', processingTime: '15 business days' },
  'IN→ZA':  { status: 'visa-required', maxStay: '90 days', notes: 'Tourist visa required.', applyLink: 'https://www.dha.gov.za', processingTime: '7–15 business days' },
  'IN→MX':  { status: 'visa-required', maxStay: 'Per visa', notes: 'Indians with valid US visa can get FMM. Otherwise visa required.', applyLink: 'https://embamex.sre.gob.mx/india', processingTime: '5–10 business days' },

  // ══════════════════════════════════════════════════
  // 🇺🇸  UNITED STATES (US) — travelling to
  // ══════════════════════════════════════════════════
  'US→US':  { status: 'domestic' },
  'US→JP':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa needed for US passport.' },
  'US→TH':  { status: 'visa-free', maxStay: '30 days', notes: 'Visa-free entry for US citizens.' },
  'US→ID':  { status: 'visa-free', maxStay: '30 days', notes: 'Visa-free (includes Bali).' },
  'US→MY':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa required.' },
  'US→VN':  { status: 'e-visa', maxStay: '90 days', notes: 'e-Visa recommended for easy entry. Fee: USD 25.', applyLink: 'https://evisa.xuatnhapcanh.gov.vn', processingTime: '3 business days' },
  'US→IN':  { status: 'e-visa', maxStay: '60 days', notes: 'India e-Visa (eTV) required. Apply online.', applyLink: 'https://indianvisaonline.gov.in', processingTime: '3–5 days' },
  'US→CN':  { status: 'visa-required', maxStay: 'Per visa', notes: 'Chinese tourist visa required.', applyLink: 'https://www.visaforchina.cn', processingTime: '4 business days' },
  'US→AU':  { status: 'e-visa', maxStay: '3 months', notes: 'ETA (subclass 601) required. Apply online.', applyLink: 'https://immi.homeaffairs.gov.au', processingTime: 'Instant–24 hrs' },
  'US→GB':  { status: 'visa-free', maxStay: '6 months', notes: 'No visa required for US citizens.' },
  'US→FR':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa for Schengen zone.' },
  'US→DE':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa for Schengen zone.' },
  'US→IT':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa for Schengen zone.' },
  'US→ES':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa for Schengen zone.' },
  'US→AE':  { status: 'visa-free', maxStay: '30 days', notes: 'No visa required for US passport holders.' },
  'US→SG':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa required.' },
  'US→NP':  { status: 'visa-on-arrival', maxStay: '90 days', notes: 'VOA at Tribhuvan Int\'l Airport.', processingTime: 'On arrival' },
  'US→TR':  { status: 'e-visa', maxStay: '90 days', notes: 'e-Visa required. Fee: USD 50.', applyLink: 'https://www.evisa.gov.tr', processingTime: '24 hours' },
  'US→CA':  { status: 'visa-free', maxStay: '180 days', notes: 'No visa required for US citizens.' },
  'US→MX':  { status: 'visa-free', maxStay: '180 days', notes: 'No visa required. FMM tourist card issued on arrival.' },
  'US→BR':  { status: 'visa-free', maxStay: '90 days', notes: 'Visa-free since 2023.' },
  'US→KR':  { status: 'visa-free', maxStay: '90 days', notes: 'Visa-free for US passport.' },
  'US→HK':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa required.' },
  'US→ZA':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa required.' },
  'US→EG':  { status: 'visa-on-arrival', maxStay: '30 days', notes: 'VOA available. Fee: USD 25.', processingTime: 'On arrival' },
  'US→QA':  { status: 'visa-free', maxStay: '180 days', notes: 'No visa required.' },

  // ══════════════════════════════════════════════════
  // 🇬🇧  UNITED KINGDOM (GB) — travelling to
  // ══════════════════════════════════════════════════
  'GB→GB':  { status: 'domestic' },
  'GB→JP':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa required for UK passport.' },
  'GB→TH':  { status: 'visa-free', maxStay: '30 days', notes: 'Visa-free for UK citizens.' },
  'GB→ID':  { status: 'visa-free', maxStay: '30 days', notes: 'Visa-free (includes Bali).' },
  'GB→SG':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa required.' },
  'GB→AE':  { status: 'visa-free', maxStay: '30 days', notes: 'No visa required.' },
  'GB→IN':  { status: 'e-visa', maxStay: '60 days', notes: 'India e-Visa (eTV) required.', applyLink: 'https://indianvisaonline.gov.in', processingTime: '3–5 days' },
  'GB→AU':  { status: 'e-visa', maxStay: '3 months', notes: 'ETA required.', applyLink: 'https://immi.homeaffairs.gov.au', processingTime: 'Instant' },
  'GB→US':  { status: 'e-visa', maxStay: '90 days', notes: 'ESTA required. Fee: USD 21.', applyLink: 'https://esta.cbp.dhs.gov', processingTime: '72 hours' },
  'GB→FR':  { status: 'visa-free', maxStay: '90 days/180 days', notes: 'No visa required post-Brexit for tourism (< 90 days).' },
  'GB→DE':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa required.' },
  'GB→TR':  { status: 'e-visa', maxStay: '90 days', notes: 'e-Visa required. Fee: USD 50.', applyLink: 'https://www.evisa.gov.tr', processingTime: '24 hours' },
  'GB→CN':  { status: 'visa-free', maxStay: '15 days', notes: 'Visa-free transit/short stay introduced 2024. Check latest guidance.' },
  'GB→CA':  { status: 'e-visa', maxStay: '6 months', notes: 'eTA required. Fee: CAD 7.', applyLink: 'https://ircc.canada.ca/english/visit/eta.asp', processingTime: 'Minutes' },
  'GB→NZ':  { status: 'e-visa', maxStay: '6 months', notes: 'NZeTA required.', applyLink: 'https://www.immigration.govt.nz', processingTime: '72 hours' },

  // ══════════════════════════════════════════════════
  // 🇦🇺  AUSTRALIA (AU) — travelling to
  // ══════════════════════════════════════════════════
  'AU→AU':  { status: 'domestic' },
  'AU→JP':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa required.' },
  'AU→TH':  { status: 'visa-free', maxStay: '30 days', notes: 'Visa-free for Australian passport.' },
  'AU→ID':  { status: 'visa-free', maxStay: '30 days', notes: 'Visa-free (includes Bali).' },
  'AU→SG':  { status: 'visa-free', maxStay: '30 days', notes: 'No visa required.' },
  'AU→NZ':  { status: 'visa-free', maxStay: 'Indefinite', notes: 'Trans-Tasman Travel Agreement.' },
  'AU→IN':  { status: 'e-visa', maxStay: '60 days', notes: 'India e-Visa (eTV) required.', applyLink: 'https://indianvisaonline.gov.in', processingTime: '3–5 days' },
  'AU→US':  { status: 'e-visa', maxStay: '90 days', notes: 'ESTA required. Fee: USD 21.', applyLink: 'https://esta.cbp.dhs.gov', processingTime: '72 hours' },
  'AU→GB':  { status: 'visa-free', maxStay: '6 months', notes: 'No visa required.' },
  'AU→FR':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa for Schengen.' },
  'AU→AE':  { status: 'visa-free', maxStay: '30 days', notes: 'No visa required.' },
  'AU→CA':  { status: 'e-visa', maxStay: '6 months', notes: 'eTA required. Fee: CAD 7.', applyLink: 'https://ircc.canada.ca/english/visit/eta.asp', processingTime: 'Minutes' },
  'AU→CN':  { status: 'visa-free', maxStay: '15 days', notes: 'Visa-free short stay introduced 2024.' },

  // ══════════════════════════════════════════════════
  // 🇸🇬  SINGAPORE (SG) — travelling to
  // ══════════════════════════════════════════════════
  'SG→SG':  { status: 'domestic' },
  'SG→JP':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa required.' },
  'SG→TH':  { status: 'visa-free', maxStay: '30 days', notes: 'No visa required.' },
  'SG→ID':  { status: 'visa-free', maxStay: '30 days', notes: 'Visa-free (includes Bali).' },
  'SG→MY':  { status: 'visa-free', maxStay: 'Unlimited', notes: 'No visa. Cross-border freely.' },
  'SG→IN':  { status: 'e-visa', maxStay: '60 days', notes: 'India e-Visa required.', applyLink: 'https://indianvisaonline.gov.in', processingTime: '3–5 days' },
  'SG→AU':  { status: 'e-visa', maxStay: '3 months', notes: 'ETA required.', applyLink: 'https://immi.homeaffairs.gov.au', processingTime: 'Instant' },
  'SG→US':  { status: 'visa-free', maxStay: '90 days', notes: 'Visa-free under US–Singapore agreement.' },
  'SG→GB':  { status: 'visa-free', maxStay: '6 months', notes: 'No visa required.' },
  'SG→FR':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa for Schengen.' },
  'SG→CN':  { status: 'visa-free', maxStay: '15 days', notes: 'Visa-free short stay 2024.' },
  'SG→KR':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa required.' },
  'SG→AE':  { status: 'visa-free', maxStay: '30 days', notes: 'No visa required.' },

  // ══════════════════════════════════════════════════
  // 🇦🇪  UAE (AE) — travelling to
  // ══════════════════════════════════════════════════
  'AE→AE':  { status: 'domestic' },
  'AE→JP':  { status: 'visa-free', maxStay: '90 days', notes: 'UAE passport visa-free to Japan.' },
  'AE→TH':  { status: 'visa-free', maxStay: '30 days', notes: 'Visa-free.' },
  'AE→ID':  { status: 'visa-free', maxStay: '30 days', notes: 'Visa-free (includes Bali).' },
  'AE→IN':  { status: 'e-visa', maxStay: '60 days', notes: 'India e-Visa required.', applyLink: 'https://indianvisaonline.gov.in', processingTime: '3–5 days' },
  'AE→US':  { status: 'visa-free', maxStay: '90 days', notes: 'UAE passport visa-free to USA.' },
  'AE→GB':  { status: 'visa-free', maxStay: '6 months', notes: 'No visa required.' },
  'AE→FR':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa for Schengen.' },
  'AE→AU':  { status: 'e-visa', maxStay: '3 months', notes: 'ETA required.', applyLink: 'https://immi.homeaffairs.gov.au', processingTime: 'Instant' },
  'AE→SG':  { status: 'visa-free', maxStay: '30 days', notes: 'No visa required.' },

  // ══════════════════════════════════════════════════
  // 🇩🇪  GERMANY (DE) — travelling to
  // ══════════════════════════════════════════════════
  'DE→DE':  { status: 'domestic' },
  'DE→JP':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa required.' },
  'DE→US':  { status: 'e-visa', maxStay: '90 days', notes: 'ESTA required.', applyLink: 'https://esta.cbp.dhs.gov', processingTime: '72 hours' },
  'DE→IN':  { status: 'e-visa', maxStay: '60 days', notes: 'India e-Visa required.', applyLink: 'https://indianvisaonline.gov.in', processingTime: '3–5 days' },
  'DE→AU':  { status: 'e-visa', maxStay: '3 months', notes: 'ETA required.', applyLink: 'https://immi.homeaffairs.gov.au', processingTime: 'Instant' },
  'DE→TH':  { status: 'visa-free', maxStay: '30 days', notes: 'No visa required.' },
  'DE→ID':  { status: 'visa-free', maxStay: '30 days', notes: 'Visa-free (includes Bali).' },
  'DE→SG':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa required.' },
  'DE→AE':  { status: 'visa-free', maxStay: '30 days', notes: 'No visa required.' },

  // ══════════════════════════════════════════════════
  // 🇹🇭  THAILAND (TH) — travelling to
  // ══════════════════════════════════════════════════
  'TH→TH':  { status: 'domestic' },
  'TH→ID':  { status: 'visa-free', maxStay: '30 days', notes: 'Visa-free for Thai passport (includes Bali).' },
  'TH→JP':  { status: 'visa-free', maxStay: '15 days', notes: 'Visa-free for Thai passport.' },
  'TH→SG':  { status: 'visa-free', maxStay: '30 days', notes: 'No visa required.' },
  'TH→MY':  { status: 'visa-free', maxStay: '30 days', notes: 'No visa required.' },
  'TH→IN':  { status: 'e-visa', maxStay: '60 days', notes: 'India e-Visa required.', applyLink: 'https://indianvisaonline.gov.in', processingTime: '3–5 days' },
  'TH→US':  { status: 'visa-required', maxStay: 'Per visa', notes: 'B1/B2 visa required.', applyLink: 'https://th.usembassy.gov', processingTime: '2–8 weeks' },
  'TH→GB':  { status: 'visa-free', maxStay: '6 months', notes: 'No visa required.' },
  'TH→AU':  { status: 'e-visa', maxStay: '3 months', notes: 'ETA required.', applyLink: 'https://immi.homeaffairs.gov.au', processingTime: '1–3 days' },
  'TH→AE':  { status: 'visa-free', maxStay: '30 days', notes: 'No visa required.' },
  'TH→KR':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa required.' },

  // ══════════════════════════════════════════════════
  // 🇨🇦  CANADA (CA) — travelling to
  // ══════════════════════════════════════════════════
  'CA→CA':  { status: 'domestic' },
  'CA→US':  { status: 'visa-free', maxStay: '180 days', notes: 'No visa required.' },
  'CA→JP':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa required.' },
  'CA→TH':  { status: 'visa-free', maxStay: '30 days', notes: 'No visa required.' },
  'CA→IN':  { status: 'e-visa', maxStay: '60 days', notes: 'India e-Visa required.', applyLink: 'https://indianvisaonline.gov.in', processingTime: '3–5 days' },
  'CA→GB':  { status: 'visa-free', maxStay: '6 months', notes: 'No visa required.' },
  'CA→AU':  { status: 'e-visa', maxStay: '3 months', notes: 'ETA required.', applyLink: 'https://immi.homeaffairs.gov.au', processingTime: 'Instant' },
  'CA→FR':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa for Schengen.' },
  'CA→AE':  { status: 'visa-free', maxStay: '30 days', notes: 'No visa required.' },
  'CA→ID':  { status: 'visa-free', maxStay: '30 days', notes: 'Visa-free (includes Bali).' },

  // ══════════════════════════════════════════════════
  // 🇯🇵  JAPAN (JP) — travelling to
  // ══════════════════════════════════════════════════
  'JP→JP':  { status: 'domestic' },
  'JP→US':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa required.' },
  'JP→GB':  { status: 'visa-free', maxStay: '6 months', notes: 'No visa required.' },
  'JP→FR':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa for Schengen.' },
  'JP→AU':  { status: 'e-visa', maxStay: '3 months', notes: 'ETA required.', applyLink: 'https://immi.homeaffairs.gov.au', processingTime: 'Instant' },
  'JP→IN':  { status: 'e-visa', maxStay: '60 days', notes: 'India e-Visa required.', applyLink: 'https://indianvisaonline.gov.in', processingTime: '3–5 days' },
  'JP→TH':  { status: 'visa-free', maxStay: '30 days', notes: 'No visa required.' },
  'JP→ID':  { status: 'visa-free', maxStay: '30 days', notes: 'Visa-free (includes Bali).' },
  'JP→SG':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa required.' },
  'JP→KR':  { status: 'visa-free', maxStay: '90 days', notes: 'No visa required.' },
  'JP→AE':  { status: 'visa-free', maxStay: '30 days', notes: 'No visa required.' },
  'JP→CN':  { status: 'visa-free', maxStay: '15 days', notes: 'Visa-free short stay 2024.' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Status display config
// ─────────────────────────────────────────────────────────────────────────────
export const STATUS_CONFIG: Record<VisaStatus, {
  label: string; emoji: string; color: string; bg: string; border: string;
}> = {
  'visa-free':       { label: 'Visa Free',        emoji: '🟢', color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.25)'  },
  'visa-on-arrival': { label: 'Visa on Arrival',   emoji: '🟡', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)'  },
  'e-visa':          { label: 'e-Visa Required',   emoji: '🔵', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)'  },
  'visa-required':   { label: 'Visa Required',     emoji: '🔴', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
  'domestic':        { label: 'Domestic Travel',   emoji: '🏠', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Destination name normaliser — maps common city/region names to ISO codes
// ─────────────────────────────────────────────────────────────────────────────
const DEST_TO_ISO: Record<string, string> = {
  'india': 'IN', 'nepal': 'NP', 'bhutan': 'BT', 'mauritius': 'MU',
  'indonesia': 'ID', 'bali': 'ID', 'maldives': 'MV', 'thailand': 'TH',
  'cambodia': 'KH', 'egypt': 'EG', 'qatar': 'QA', 'ethiopia': 'ET',
  'philippines': 'PH', 'hong kong': 'HK', 'sri lanka': 'LK', 'vietnam': 'VN',
  'turkey': 'TR', 'australia': 'AU', 'new zealand': 'NZ', 'taiwan': 'TW',
  'malaysia': 'MY', 'saudi arabia': 'SA', 'brazil': 'BR', 'kenya': 'KE',
  'uae': 'AE', 'dubai': 'AE', 'abu dhabi': 'AE', 'japan': 'JP',
  'china': 'CN', 'south korea': 'KR', 'korea': 'KR', 'singapore': 'SG',
  'usa': 'US', 'united states': 'US', 'america': 'US', 'uk': 'GB',
  'united kingdom': 'GB', 'england': 'GB', 'britain': 'GB',
  'canada': 'CA', 'france': 'FR', 'germany': 'DE', 'italy': 'IT',
  'spain': 'ES', 'portugal': 'PT', 'switzerland': 'CH', 'greece': 'GR',
  'netherlands': 'NL', 'austria': 'AT', 'south africa': 'ZA', 'mexico': 'MX',
  'myanmar': 'MM', 'israel': 'IL', 'argentina': 'AR', 'colombia': 'CO',
  'peru': 'PE', 'morocco': 'MA',
  // Cities → ISO
  'tokyo': 'JP', 'osaka': 'JP', 'kyoto': 'JP', 'paris': 'FR', 'london': 'GB',
  'berlin': 'DE', 'rome': 'IT', 'madrid': 'ES', 'lisbon': 'PT', 'amsterdam': 'NL',
  'vienna': 'AT', 'zurich': 'CH', 'athens': 'GR', 'istanbul': 'TR',
  'bangkok': 'TH', 'phuket': 'TH', 'jakarta': 'ID', 'denpasar': 'ID',
  'kuala lumpur': 'MY', 'hanoi': 'VN', 'ho chi minh city': 'VN',
  'manila': 'PH', 'seoul': 'KR', 'beijing': 'CN', 'shanghai': 'CN',
  'sydney': 'AU', 'melbourne': 'AU', 'toronto': 'CA', 'new york': 'US',
  'los angeles': 'US', 'miami': 'US', 'cairo': 'EG', 'doha': 'QA',
  'riyadh': 'SA', 'cape town': 'ZA', 'nairobi': 'KE', 'colombo': 'LK',
  'kathmandu': 'NP', 'male': 'MV', 'taipei': 'TW',
};

function destToISO(destination: string): string | null {
  const key = destination.toLowerCase().trim().replace(/[^a-z\s]/g, '');
  if (DEST_TO_ISO[key]) return DEST_TO_ISO[key];
  const words = key.split(/\s+/);
  for (const word of words) {
    if (word.length > 3 && DEST_TO_ISO[word]) return DEST_TO_ISO[word];
  }
  for (const k of Object.keys(DEST_TO_ISO).sort((a, b) => b.length - a.length)) {
    if (key.includes(k)) return DEST_TO_ISO[k];
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Look up visa requirements.
 * @param fromISO  Passport country ISO-2 code (e.g. "IN", "US")
 * @param destination  Free-form destination string (city or country name)
 */
export function getVisaInfo(fromISO: string, destination: string): VisaInfo & {
  confident: boolean;
  passportCountry: string;
} {
  const toISO = destToISO(destination);
  const from = fromISO.toUpperCase();

  // Domestic check: same country
  if (toISO && toISO === from) {
    return {
      destination,
      fromCountry: from,
      status: 'domestic',
      notes: 'This is a domestic trip — no passport or visa needed.',
      confident: true,
      passportCountry: from,
    };
  }

  const key = toISO ? `${from}→${toISO}` : null;

  if (key && VISA_DB[key]) {
    return {
      destination,
      fromCountry: from,
      confident: true,
      passportCountry: from,
      ...VISA_DB[key],
    };
  }

  // Fallback: destination not in DB for this passport
  return {
    destination,
    fromCountry: from,
    status: 'visa-required',
    notes: 'Requirements not found in our database. Please verify with the official embassy or visaindex.com.',
    applyLink: 'https://www.visaindex.com',
    confident: false,
    passportCountry: from,
  };
}

export function getStatusConfig(status: VisaStatus) {
  return STATUS_CONFIG[status];
}
