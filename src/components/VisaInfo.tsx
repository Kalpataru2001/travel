// src/components/VisaInfo.tsx
import { getVisaInfo, getStatusConfig } from '../utils/visa';

interface VisaInfoProps {
  destination: string;
}

export default function VisaInfo({ destination }: VisaInfoProps) {
  const info = getVisaInfo(destination);
  const config = getStatusConfig(info.status);

  return (
    <div
      className="visa-info-banner"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
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
          {info.notes && (
            <p className="visa-info-notes">{info.notes}</p>
          )}
          {info.processingTime && (
            <p className="visa-processing">
              ⏱️ Processing: <strong>{info.processingTime}</strong>
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
