// src/components/LanguagePhrasebook.tsx
import { useState, useEffect } from 'react';
import type { FullTripItinerary } from '../types/travel';
import { speakPhrase, getFallbackLanguageDetails } from '../utils/language';
import { initScrollReveal } from '../utils/animations';

interface LanguagePhrasebookProps {
  tripData: FullTripItinerary;
}

export default function LanguagePhrasebook({ tripData }: LanguagePhrasebookProps) {
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  // Scroll-reveal phrase items
  useEffect(() => {
    const timer = setTimeout(() => initScrollReveal('.phrase-item, .phrase-card'), 200);
    return () => clearTimeout(timer);
  }, []);

  // Retrieve dynamic or fallback language details
  const fallback = getFallbackLanguageDetails(tripData.metadata.destination);
  const langName = fallback.langName;
  const langCode = tripData.localLanguageCode || fallback.langCode;
  const phrases = tripData.localPhrases || fallback.phrases;

  const handleSpeak = (text: string, idx: number) => {
    setPlayingIdx(idx);
    speakPhrase(text, langCode);
    
    // Reset playing state after a short animation interval
    setTimeout(() => {
      setPlayingIdx(null);
    }, 1500);
  };

  return (
    <div className="phrasebook-section no-print">
      {/* Title */}
      <div className="phrasebook-header">
        <div className="phrasebook-title-block">
          <span className="phrasebook-icon-badge">🗣️</span>
          <h2 className="phrasebook-title">
            Local Language Phrasebook & Pronunciation Guide
          </h2>
        </div>
        <span className="phrasebook-language-badge">
          🗣️ {langName} ({langCode})
        </span>
      </div>

      <p className="phrasebook-subtitle">
        Tap any card below to hear the phrase spoken in a native <strong>{langName}</strong> accent.
      </p>

      {/* Grid */}
      <div className="phrase-grid">
        {phrases.map((phrase, idx) => {
          const isPlaying = playingIdx === idx;
          return (
            <div
              key={idx}
              className={`phrase-card ${isPlaying ? 'playing' : ''}`}
              onClick={() => handleSpeak(phrase.translation, idx)}
              title="Click to speak"
            >
              <div className="phrase-card-top">
                <span className="phrase-english">{phrase.english}</span>
                <button
                  type="button"
                  className={`phrase-speaker-btn ${isPlaying ? 'pulse' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation(); // Avoid double speak trigger from card click
                    handleSpeak(phrase.translation, idx);
                  }}
                >
                  {isPlaying ? '🔊' : '🔈'}
                </button>
              </div>

              <div className="phrase-card-body">
                <span className="phrase-translation">{phrase.translation}</span>
                <span className="phrase-phonetic">[{phrase.phonetic}]</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
