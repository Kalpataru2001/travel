// src/components/HotelRecommendations.tsx
import { useEffect } from 'react';
import { useDestinationImage } from '../hooks/useDestinationImage';
import type { HotelRecommendation } from '../types/travel';
import { initTiltCards } from '../utils/animations';

interface HotelRecommendationsProps {
  hotels: HotelRecommendation[];
  destination: string;
  travelStyle: string;
}

const FALLBACK_IMG = 'https://picsum.photos/seed/hotel/600/400';

/** Build booking & map URLs from hotel data */
function getHotelLinks(hotel: HotelRecommendation, destination: string) {
  const query = encodeURIComponent(`${hotel.name} ${hotel.area} ${destination}`);
  const mapsQuery = encodeURIComponent(`${hotel.name}, ${hotel.area}`);

  return {
    googleHotels: `https://www.google.com/travel/hotels/entity/search?q=${query}`,
    booking: `https://www.booking.com/search.html?ss=${query}&aid=304142`,
    makemytrip: `https://www.makemytrip.com/hotels/hotel-listing/?city=${encodeURIComponent(destination)}&checkin=&checkout=&searchText=${query}`,
    maps: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
  };
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

// Individual hotel image component with async real photo resolution
function HotelImage({ hotel }: { hotel: HotelRecommendation }) {
  const { src, isLoading, isReal } = useDestinationImage(
    `${hotel.name} ${hotel.area} hotel`,
    600,
    400
  );

  return (
    <div className="hotel-card-img-wrapper">
      <img
        src={src}
        alt={hotel.name}
        className={`hotel-card-img ${isLoading ? 'img-resolving' : ''}`}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = FALLBACK_IMG;
        }}
      />
      {/* Price Badge overlaid on image */}
      <div className="hotel-price-badge">{hotel.priceRange}</div>
      {/* Real photo badge */}
      {isReal && (
        <div className="real-photo-badge hotel-photo-badge" title="Real hotel photo">
          📸
        </div>
      )}
    </div>
  );
}

export default function HotelRecommendations({
  hotels,
  destination,
  travelStyle,
}: HotelRecommendationsProps) {
  if (!hotels || hotels.length === 0) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const timer = setTimeout(() => {
      return initTiltCards('.hotel-card', {
        maxTilt: 10,
        perspective: 900,
        glowColor: 'rgba(245,158,11,0.22)',
        scaleOnHover: 1.04,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [hotels.length]);

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
          {hotels.map((hotel, index) => {
            const links = getHotelLinks(hotel, destination);
            return (
              <div key={hotel.id || index} className="hotel-card">

                {/* Smart async photo */}
                <HotelImage hotel={hotel} />

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

                  {/* ── Booking Links ── */}
                  <div className="hotel-booking-links">
                    <a
                      href={links.googleHotels}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hotel-book-btn hotel-book-primary"
                      title="Search on Google Hotels"
                    >
                      <span className="hotel-book-icon">🏨</span>
                      Google Hotels
                    </a>
                    <a
                      href={links.booking}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hotel-book-btn hotel-book-secondary"
                      title="Search on Booking.com"
                    >
                      <span className="hotel-book-icon">🛏️</span>
                      Booking.com
                    </a>
                    <a
                      href={links.makemytrip}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hotel-book-btn hotel-book-secondary"
                      title="Search on MakeMyTrip"
                    >
                      <span className="hotel-book-icon">✈️</span>
                      MakeMyTrip
                    </a>
                    <a
                      href={links.maps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hotel-book-btn hotel-book-maps"
                      title="View on Google Maps"
                    >
                      <span className="hotel-book-icon">📍</span>
                      View on Map
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
