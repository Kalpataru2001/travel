// src/components/OnboardingModal.tsx
// One-time post-login modal to capture passport nationality + currency.
// Shown only once per device. Never blocks the app — always skippable.

import { useState } from 'react';
import { ISO_COUNTRY_NAMES } from '../utils/detectCountry';
import { POPULAR_CURRENCIES } from '../utils/currency';

interface OnboardingModalProps {
  userName?: string;
  onDone: () => void; // called on Save OR Skip
}

// Sorted country list for the dropdown
const COUNTRY_OPTIONS = Object.entries(ISO_COUNTRY_NAMES)
  .sort((a, b) => a[1].localeCompare(b[1]))
  .map(([iso, name]) => ({ iso, name }));

// Country flag emoji from ISO code
function flagEmoji(iso: string): string {
  return iso
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join('');
}

export default function OnboardingModal({ userName, onDone }: OnboardingModalProps) {
  const [nationality, setNationality] = useState(
    () => localStorage.getItem('travel_profile_nationality') || ''
  );
  const [currency, setCurrency] = useState(
    () => localStorage.getItem('travel_user_preferred_currency') || 'INR'
  );
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    if (nationality) localStorage.setItem('travel_profile_nationality', nationality);
    localStorage.setItem('travel_user_preferred_currency', currency);
    localStorage.setItem('travel_profile_onboarded', 'true');
    setTimeout(() => {
      setSaving(false);
      onDone();
    }, 300);
  };

  const handleSkip = () => {
    localStorage.setItem('travel_profile_onboarded', 'true');
    onDone();
  };

  return (
    // Full-screen overlay — click outside to skip
    <div className="onboarding-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleSkip(); }}>
      <div className="onboarding-modal" role="dialog" aria-modal="true" aria-label="Complete your travel profile">

        {/* Header */}
        <div className="onboarding-header">
          <span className="onboarding-wave">👋</span>
          <div>
            <h2 className="onboarding-title">
              Welcome{userName ? `, ${userName.split(' ')[0]}` : ''}!
            </h2>
            <p className="onboarding-subtitle">
              Set these once for personalised visa &amp; currency info on every trip.
            </p>
          </div>
        </div>

        {/* Optional badge */}
        <div className="onboarding-optional-badge">✨ Optional — you can always update this in Profile</div>

        {/* Passport field */}
        <div className="onboarding-field">
          <label className="onboarding-label" htmlFor="onboarding-nationality">
            🛂 Your Passport / Nationality
          </label>
          <select
            id="onboarding-nationality"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            className="onboarding-select"
          >
            <option value="">— Select your passport country —</option>
            {COUNTRY_OPTIONS.map(({ iso, name }) => (
              <option key={iso} value={iso}>
                {flagEmoji(iso)} {name}
              </option>
            ))}
          </select>
          <span className="onboarding-field-hint">
            Used to show accurate visa requirements. Stays on this device only.
          </span>
        </div>

        {/* Currency field */}
        <div className="onboarding-field">
          <label className="onboarding-label" htmlFor="onboarding-currency">
            🪙 Preferred Currency
          </label>
          <select
            id="onboarding-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="onboarding-select"
          >
            {POPULAR_CURRENCIES.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.symbol} {curr.code} — {curr.name}
              </option>
            ))}
          </select>
          <span className="onboarding-field-hint">
            Used as the default in the budget tracker and currency converter.
          </span>
        </div>

        {/* Actions */}
        <div className="onboarding-actions">
          <button
            className="onboarding-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '✓ Saving...' : '✓ Save & Continue'}
          </button>
          <button className="onboarding-skip-btn" onClick={handleSkip}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
