// src/components/CurrencyConverter.tsx
import { useEffect, useState } from 'react';
import {
  fetchExchangeRates,
  detectLocalCurrency,
  POPULAR_CURRENCIES
} from '../utils/currency';
import type { ExchangeRatesData } from '../utils/currency';

interface CurrencyConverterProps {
  destination: string;
}

export default function CurrencyConverter({ destination }: CurrencyConverterProps) {
  const [homeCurrency, setHomeCurrency] = useState('USD');
  const [destCurrency, setDestCurrency] = useState('EUR');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [homeAmount, setHomeAmount] = useState('1');
  const [destAmount, setDestAmount] = useState('');

  // Auto-detect local currency when destination changes
  useEffect(() => {
    const local = detectLocalCurrency(destination);
    setDestCurrency(local);
  }, [destination]);

  // Fetch exchange rates when base (home) currency changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchExchangeRates(homeCurrency)
      .then((data) => {
        if (!cancelled) {
          setExchangeRates(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Exchange rate fetch error:', err);
        if (!cancelled) {
          setError('Failed to load exchange rates.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [homeCurrency]);

  const getSymbol = (code: string) => {
    return POPULAR_CURRENCIES.find((c) => c.code === code)?.symbol || '';
  };

  const getName = (code: string) => {
    return POPULAR_CURRENCIES.find((c) => c.code === code)?.name || code;
  };

  const getRate = () => {
    if (!exchangeRates || !exchangeRates.rates) return null;
    return exchangeRates.rates[destCurrency] || null;
  };

  const currentRate = getRate();

  // Bi-directional calculation updates
  useEffect(() => {
    if (currentRate !== null && !isNaN(parseFloat(homeAmount))) {
      setDestAmount((parseFloat(homeAmount) * currentRate).toFixed(2));
    } else {
      setDestAmount('');
    }
  }, [homeAmount, exchangeRates, destCurrency]);

  const handleHomeAmountChange = (val: string) => {
    setHomeAmount(val);
    if (currentRate !== null && !isNaN(parseFloat(val))) {
      setDestAmount((parseFloat(val) * currentRate).toFixed(2));
    } else {
      setDestAmount('');
    }
  };

  const handleDestAmountChange = (val: string) => {
    setDestAmount(val);
    if (currentRate !== null && currentRate > 0 && !isNaN(parseFloat(val))) {
      setHomeAmount((parseFloat(val) / currentRate).toFixed(2));
    } else {
      setHomeAmount('');
    }
  };

  const handleSwapCurrencies = () => {
    const temp = homeCurrency;
    setHomeCurrency(destCurrency);
    setDestCurrency(temp);
    setHomeAmount(destAmount);
    setDestAmount(homeAmount);
  };

  if (loading && !exchangeRates) {
    return (
      <div className="currency-widget currency-loading">
        <div className="currency-loading-dot" />
        <span>Loading exchange rates...</span>
      </div>
    );
  }

  if (error && !exchangeRates) {
    return (
      <div className="currency-widget currency-error">
        <span>🪙</span>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="currency-widget">
      {/* Header */}
      <div className="currency-header">
        <div className="currency-title-block">
          <span className="currency-icon-badge">🪙</span>
          <span>Currency Converter</span>
        </div>
        {exchangeRates && (
          <span className="currency-rates-badge">
            {exchangeRates.isMock ? 'Estimated Rates' : 'Live Rates'}
          </span>
        )}
      </div>

      {/* Main Converter Forms */}
      <div className="currency-converter-main">
        {/* Home Currency Input */}
        <div className="currency-input-group">
          <label className="currency-input-label">Home Currency</label>
          <div className="currency-input-wrapper">
            <select
              value={homeCurrency}
              onChange={(e) => setHomeCurrency(e.target.value)}
              className="currency-select"
            >
              {POPULAR_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
            <div className="currency-field-container">
              <span className="currency-symbol-addon">{getSymbol(homeCurrency)}</span>
              <input
                type="number"
                value={homeAmount}
                onChange={(e) => handleHomeAmountChange(e.target.value)}
                placeholder="0.00"
                className="currency-input"
                min="0"
                step="any"
              />
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwapCurrencies}
          className="currency-swap-btn"
          title="Swap currencies"
          type="button"
        >
          ↔️
        </button>

        {/* Destination Currency Input */}
        <div className="currency-input-group">
          <label className="currency-input-label">Destination Currency</label>
          <div className="currency-input-wrapper">
            <select
              value={destCurrency}
              onChange={(e) => setDestCurrency(e.target.value)}
              className="currency-select"
            >
              {POPULAR_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
            <div className="currency-field-container">
              <span className="currency-symbol-addon">{getSymbol(destCurrency)}</span>
              <input
                type="number"
                value={destAmount}
                onChange={(e) => handleDestAmountChange(e.target.value)}
                placeholder="0.00"
                className="currency-input"
                min="0"
                step="any"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Rate Info */}
      {currentRate !== null && (
        <div className="currency-rate-text">
          1 {homeCurrency} ({getName(homeCurrency)}) = {currentRate.toFixed(4)} {destCurrency} ({getName(destCurrency)})
        </div>
      )}

      {/* Quick Cheat Sheet */}
      {currentRate !== null && (
        <div className="currency-cheat-sheet">
          <h4 className="cheat-sheet-title">Conversion Cheat Sheet</h4>
          <div className="cheat-sheet-grid">
            {/* Home to Dest column */}
            <div className="cheat-sheet-col">
              <div className="cheat-sheet-header-row">
                <span>{homeCurrency}</span>
                <span>{destCurrency}</span>
              </div>
              {[1, 10, 50, 100, 250].map((amt) => (
                <div key={`h2d-${amt}`} className="cheat-sheet-row">
                  <span>{getSymbol(homeCurrency)}{amt}</span>
                  <span>{getSymbol(destCurrency)}{(amt * currentRate).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Dest to Home column */}
            <div className="cheat-sheet-col">
              <div className="cheat-sheet-header-row">
                <span>{destCurrency}</span>
                <span>{homeCurrency}</span>
              </div>
              {[1, 10, 50, 100, 250].map((amt) => (
                <div key={`d2h-${amt}`} className="cheat-sheet-row">
                  <span>{getSymbol(destCurrency)}{amt}</span>
                  <span>{getSymbol(homeCurrency)}{(amt / currentRate).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
