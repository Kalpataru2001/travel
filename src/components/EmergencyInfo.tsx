// src/components/EmergencyInfo.tsx
import { useState } from 'react';
import { getEmergencyContacts } from '../utils/emergency';

interface EmergencyInfoProps {
  destination: string;
}

interface ContactCardProps {
  emoji: string;
  label: string;
  number: string;
  color: string;
}

function ContactCard({ emoji, label, number, color }: ContactCardProps) {
  return (
    <a
      href={`tel:${number.replace(/[^0-9+]/g, '')}`}
      className="emergency-contact-card"
      style={{ borderColor: `${color}33` }}
      title={`Call ${label}: ${number}`}
    >
      <span className="emergency-card-emoji">{emoji}</span>
      <span className="emergency-card-label">{label}</span>
      <span className="emergency-card-number" style={{ color }}>{number}</span>
      <span className="emergency-card-tap">Tap to call</span>
    </a>
  );
}

export default function EmergencyInfo({ destination }: EmergencyInfoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contacts = getEmergencyContacts(destination);

  return (
    <div className={`emergency-info-section ${isOpen ? 'emergency-open' : ''}`}>
      {/* Toggle Header */}
      <button
        className="emergency-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="emergency-toggle-left">
          <span className="emergency-toggle-icon">🆘</span>
          <div>
            <span className="emergency-toggle-title">Emergency Contacts</span>
            <span className="emergency-toggle-subtitle">
              {contacts.country} · Police, Ambulance, Embassy
            </span>
          </div>
        </div>
        <span className={`emergency-chevron ${isOpen ? 'chevron-up' : ''}`}>▾</span>
      </button>

      {/* Expandable Content */}
      {isOpen && (
        <div className="emergency-content">
          <p className="emergency-disclaimer">
            📱 Tap any card to call directly. Save these numbers before going offline.
          </p>

          <div className="emergency-cards-grid">
            <ContactCard emoji="🚔" label="Police"    number={contacts.police}    color="#60a5fa" />
            <ContactCard emoji="🚑" label="Ambulance" number={contacts.ambulance}  color="#4ade80" />
            <ContactCard emoji="🔥" label="Fire"      number={contacts.fire}       color="#fb923c" />
            {contacts.touristHelpline && (
              <ContactCard emoji="🏖️" label="Tourist Helpline" number={contacts.touristHelpline} color="#c084fc" />
            )}
          </div>

          {contacts.embassyIndia && (
            <div className="emergency-embassy-row">
              <span className="emergency-embassy-flag">🇮🇳</span>
              <div className="emergency-embassy-info">
                <span className="emergency-embassy-title">{contacts.embassyNote || 'Indian Embassy'}</span>
                <a
                  href={`tel:${contacts.embassyIndia.replace(/[^0-9+]/g, '')}`}
                  className="emergency-embassy-number"
                >
                  {contacts.embassyIndia}
                </a>
              </div>
            </div>
          )}

          <p className="emergency-global-note">
            🌐 <strong>International emergency:</strong> Try <strong>112</strong> from any phone anywhere in the world.
          </p>
        </div>
      )}
    </div>
  );
}
