// src/components/TransportGuide.tsx
import { useState } from 'react';
import { getTransportGuide } from '../utils/transport';
import type { AirportOption, LocalApp } from '../utils/transport';

interface TransportGuideProps {
  destination: string;
}

function AppBadge({ app }: { app: LocalApp }) {
  const typeColors: Record<string, string> = {
    rideshare: '#22c55e',
    taxi: '#f59e0b',
    maps: '#60a5fa',
    transit: '#a78bfa',
    food: '#f87171',
  };
  return (
    <div className="tg-app-badge" style={{ borderColor: `${typeColors[app.type]}40` }}>
      <span className="tg-app-emoji">{app.emoji}</span>
      <div className="tg-app-info">
        <span className="tg-app-name">{app.name}</span>
        {app.notes && <span className="tg-app-note">{app.notes}</span>}
      </div>
      <span className="tg-app-type" style={{ color: typeColors[app.type] }}>
        {app.type}
      </span>
    </div>
  );
}

function AirportCard({ opt }: { opt: AirportOption }) {
  return (
    <div className="tg-airport-option">
      <span className="tg-airport-emoji">{opt.emoji}</span>
      <div className="tg-airport-details">
        <span className="tg-airport-mode">{opt.mode}</span>
        {opt.notes && <span className="tg-airport-notes">{opt.notes}</span>}
      </div>
      <div className="tg-airport-meta">
        <span className="tg-airport-duration">⏱ {opt.duration}</span>
        <span className="tg-airport-cost">💰 {opt.costRange}</span>
      </div>
    </div>
  );
}

export default function TransportGuide({ destination }: TransportGuideProps) {
  const [expanded, setExpanded] = useState(false);
  const guide = getTransportGuide(destination);

  if (!guide) {
    return (
      <div className="tg-card tg-not-found">
        <div className="tg-header">
          <span className="tg-icon">🚇</span>
          <div>
            <h3 className="tg-title">Getting Around {destination}</h3>
            <p className="tg-subtitle">Transport guide not available for this destination yet.</p>
          </div>
        </div>
        <a
          href={`https://www.google.com/search?q=how+to+get+around+${encodeURIComponent(destination)}+transport+guide`}
          target="_blank"
          rel="noopener noreferrer"
          className="tg-search-btn"
        >
          Search Transport Guide →
        </a>
      </div>
    );
  }

  return (
    <div className="tg-card">
      {/* Header — always visible */}
      <button
        className="tg-header tg-toggle-btn"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <span className="tg-icon">🚇</span>
        <div className="tg-header-text">
          <h3 className="tg-title">Getting Around {guide.city}</h3>
          <p className="tg-subtitle">
            {guide.airportName && `✈️ ${guide.airportName} · `}
            {guide.apps.filter(a => a.available).slice(0, 3).map(a => a.name).join(' · ')}
          </p>
        </div>
        <span className={`tg-chevron ${expanded ? 'open' : ''}`}>›</span>
      </button>

      {/* Quick pill row — always visible */}
      <div className="tg-quick-pills">
        {guide.airportToCity.slice(0, 3).map((opt, i) => (
          <span key={i} className="tg-quick-pill">
            {opt.emoji} {opt.mode} {opt.costRange}
          </span>
        ))}
      </div>

      {/* Expandable content */}
      {expanded && (
        <div className="tg-body">

          {/* Airport Options */}
          {guide.airportToCity.length > 0 && (
            <div className="tg-section">
              <h4 className="tg-section-title">✈️ Airport → City</h4>
              <div className="tg-airport-list">
                {guide.airportToCity.map((opt, i) => (
                  <AirportCard key={i} opt={opt} />
                ))}
              </div>
            </div>
          )}

          {/* Local Transport */}
          {guide.localTransport.length > 0 && (
            <div className="tg-section">
              <h4 className="tg-section-title">🗺️ Getting Around the City</h4>
              <ul className="tg-local-list">
                {guide.localTransport.map((tip, i) => (
                  <li key={i} className="tg-local-item">
                    <span className="tg-bullet">›</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Apps to Download */}
          {guide.apps.length > 0 && (
            <div className="tg-section">
              <h4 className="tg-section-title">📱 Apps to Download Before You Land</h4>
              <div className="tg-apps-grid">
                {guide.apps.filter(a => a.available).map((app, i) => (
                  <AppBadge key={i} app={app} />
                ))}
              </div>
            </div>
          )}

          {/* Tips row */}
          {(guide.drivingTip || guide.taxiTip) && (
            <div className="tg-tips-row">
              {guide.drivingTip && (
                <div className="tg-tip-card tg-tip-drive">
                  <span className="tg-tip-icon">🚗</span>
                  <div>
                    <span className="tg-tip-label">Driving</span>
                    <p className="tg-tip-text">{guide.drivingTip}</p>
                  </div>
                </div>
              )}
              {guide.taxiTip && (
                <div className="tg-tip-card tg-tip-taxi">
                  <span className="tg-tip-icon">🚕</span>
                  <div>
                    <span className="tg-tip-label">Taxi Tip</span>
                    <p className="tg-tip-text">{guide.taxiTip}</p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
