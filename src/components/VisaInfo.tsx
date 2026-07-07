// src/components/VisaInfo.tsx
import { useMemo } from 'react';
import { getVisaInfo, getStatusConfig } from '../utils/visa';
import { resolvePassportCountry, ISO_COUNTRY_NAMES } from '../utils/detectCountry';

interface VisaInfoProps {
  destination: string;
  startingPoint?: string;  // from TripQuery
  homeCity?: string;       // from localStorage profile
}

export default function VisaInfo({ destination, startingPoint, homeCity }: VisaInfoProps) {
  // Resolve passport country from context — no guessing
  const passport = useMemo(() => resolvePassportCountry({ homeCity, startingPoint }), [homeCity, startingPoint]);
  const info = useMemo(() => getVisaInfo(passport.iso, destination), [passport.iso, destination]);
  const config = getStatusConfig(info.status);

  const passportLabel = ISO_COUNTRY_NAMES[passport.iso] ?? passport.iso;

  // Domestic trip — simplified card
  if (info.status === 'domestic') {
    return (
      <div
        className="visa-info-banner"
        style={{ background: config.bg, border: `1px solid ${config.border}` }}
      >
        <div className="visa-info-left">
          <div className="visa-status-badge" style={{ color: config.color, borderColor: config.border, background: config.bg }}>
            <span className="visa-status-emoji">{config.emoji}</span>
            <span className="visa-status-label">{config.label}</span>
          </div>
          <div className="visa-info-details">
            <p className="visa-info-title">🏠 Domestic Trip — No visa needed</p>
            <p className="visa-info-notes">You're travelling within {passportLabel}. No passport or visa required for this trip.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="visa-info-banner"
      style={{ background: config.bg, border: `1px solid ${config.border}` }}
    >
      {/* Left: status badge + details */}
      <div className="visa-info-left">
        <div className="visa-status-badge" style={{ color: config.color, borderColor: config.border, background: config.bg }}>
          <span className="visa-status-emoji">{config.emoji}</span>
          <span className="visa-status-label">{config.label}</span>
        </div>

        <div className="visa-info-details">
          <p className="visa-info-title">
            🛂 Visa for <strong>{info.destination}</strong>
            {info.maxStay && (
              <span className="visa-maxstay"> · Up to {info.maxStay}</span>
            )}
          </p>

          {/* Passport context line */}
          <p className="visa-passport-context">
            <span className="visa-passport-flag">🛂</span> Based on{' '}
            <strong>{passportLabel} passport</strong>
            {!passport.confident && (
              <span className="visa-passport-notice">
                {' '}· <em>Assumed — <a href="#profile">update your Home City in Profile</a> for accuracy</em>
              </span>
            )}
            {passport.confident && passport.source !== 'default (update Home City in Profile)' && (
              <span className="visa-passport-source"> ({passport.source})</span>
            )}
          </p>

          {info.notes && (
            <p className="visa-info-notes">{info.notes}</p>
          )}
          {info.processingTime && (
            <p className="visa-processing">
              ⏱️ Processing: <strong>{info.processingTime}</strong>
            </p>
          )}

          {/* Not in DB warning */}
          {!info.confident && (
            <p className="visa-unconfirmed-note">
              ⚠️ This destination isn't in our database for your passport. Always verify with the official embassy.
            </p>
          )}
        </div>
      </div>

      {/* Right: Apply button */}
      {info.applyLink && (
        <a
          href={info.applyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="visa-apply-btn"
          style={{ background: config.bg, border: `1px solid ${config.border}`, color: config.color }}
        >
          Apply Now →
        </a>
      )}
    </div>
  );
}
