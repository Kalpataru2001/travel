// src/components/HotelRecommendations.tsx
import type { HotelRecommendation } from '../types/travel';

interface HotelRecommendationsProps {
  hotels: HotelRecommendation[];
  destination: string;
  travelStyle: string;
}

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';

function getHotelImage(keyword: string): string {
  return `https://source.unsplash.com/featured/600x400/?${encodeURIComponent(keyword)}`;
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="hotel-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{
            color: i < full ? '#f59e0b' : i === full && half ? '#f59e0b' : 'rgba(255,255,255,0.2)',
            fontSize: i === full && half ? '0.85em' : '1em',
          }}
        >
          ★
        </span>
      ))}
      <span className="hotel-rating-num">{rating.toFixed(1)}</span>
    </div>
  );
}

const STYLE_ICON: Record<string, string> = {
  Adventure: '🏕️',
  Relaxation: '🛁',
  Culture: '🏛️',
  Luxury: '👑',
  Budget: '🎒',
};

export default function HotelRecommendations({
  hotels,
  destination,
  travelStyle,
}: HotelRecommendationsProps) {
  if (!hotels || hotels.length === 0) return null;

  return (
    <section className="hotels-section">
      {/* Section Header */}
      <div className="hotels-header">
        <div className="hotels-header-left">
          <div className="hotels-icon">🏨</div>
          <div>
            <h2 className="hotels-title">Where to Stay in {destination}</h2>
            <p className="hotels-subtitle">
              {STYLE_ICON[travelStyle] || '✈️'} Curated for{' '}
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{travelStyle}</span> travellers
            </p>
          </div>
        </div>
        <div className="hotels-count-badge">{hotels.length} picks</div>
      </div>

      {/* Horizontal Scroll Cards */}
      <div className="hotels-scroll-container">
        <div className="hotels-scroll-track">
          {hotels.map((hotel, index) => (
            <div key={hotel.id || index} className="hotel-card">

              {/* Photo */}
              <div className="hotel-card-img-wrapper">
                <img
                  src={getHotelImage(hotel.imageKeyword)}
                  alt={hotel.name}
                  className="hotel-card-img"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMG;
                  }}
                />
                {/* Price Badge overlaid on image */}
                <div className="hotel-price-badge">{hotel.priceRange}</div>
              </div>

              {/* Body */}
              <div className="hotel-card-body">
                {/* Name + Rating */}
                <h3 className="hotel-name">{hotel.name}</h3>
                <StarRating rating={hotel.rating} />

                {/* Area */}
                <div className="hotel-area">
                  📍 {hotel.area}
                </div>

                {/* Tags */}
                <div className="hotel-tags">
                  {hotel.tags.map((tag) => (
                    <span key={tag} className="hotel-tag">{tag}</span>
                  ))}
                </div>

                {/* Why Recommended */}
                <p className="hotel-why">
                  <span className="hotel-why-icon">💡</span>
                  {hotel.whyRecommended}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
