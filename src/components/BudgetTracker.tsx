// src/components/BudgetTracker.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { FullTripItinerary, ExpenseItem } from '../types/travel';
import { POPULAR_CURRENCIES, getFallbackRatesForBase } from '../utils/currency';
import { generateDefaultBudget } from '../utils/budget';
import { initTiltCards } from '../utils/animations';

interface BudgetTrackerProps {
  tripData: FullTripItinerary;
  onUpdateTripData: (trip: FullTripItinerary) => void;
  isSaved?: boolean;
  isOffline?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Accommodation: '#3b82f6',
  Transport:     '#8b5cf6',
  Food:          '#f59e0b',
  Activities:    '#10b981',
  Shopping:      '#ec4899',
  Others:        '#64748b'
};

// Default proportional distribution per travel style
const DISTRIBUTIONS: Record<string, Record<string, number>> = {
  Budget:     { Accommodation: 0.35, Transport: 0.20, Food: 0.30, Activities: 0.10, Shopping: 0.05, Others: 0.00 },
  Luxury:     { Accommodation: 0.45, Transport: 0.15, Food: 0.20, Activities: 0.10, Shopping: 0.08, Others: 0.02 },
  Adventure:  { Accommodation: 0.30, Transport: 0.15, Food: 0.25, Activities: 0.25, Shopping: 0.03, Others: 0.02 },
  Relaxation: { Accommodation: 0.45, Transport: 0.10, Food: 0.25, Activities: 0.15, Shopping: 0.03, Others: 0.02 },
  Culture:    { Accommodation: 0.35, Transport: 0.15, Food: 0.25, Activities: 0.20, Shopping: 0.03, Others: 0.02 },
  Default:    { Accommodation: 0.40, Transport: 0.15, Food: 0.25, Activities: 0.15, Shopping: 0.05, Others: 0.00 },
};

const CATEGORY_ICONS: Record<string, string> = {
  Accommodation: '🏨',
  Transport:     '🚗',
  Food:          '🍽️',
  Activities:    '🧗',
  Shopping:      '🛍️',
  Others:        '📦'
};

const ALL_CATEGORIES = Object.keys(CATEGORY_COLORS) as ExpenseItem['category'][];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrencySymbol(code: string): string {
  return POPULAR_CURRENCIES.find((c) => c.code === code)?.symbol || code;
}

function formatAmount(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  // Use locale formatting: Indian locale for INR, else default
  if (currencyCode === 'INR') {
    return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BudgetTracker({
  tripData,
  onUpdateTripData,
  isSaved = false,
  isOffline = false
}: BudgetTrackerProps) {
  const budgetData = tripData.budgetData;
  if (!budgetData) return null;

  const preferredCurrency = localStorage.getItem('travel_user_preferred_currency') || 'INR';

  // ── Stale-cache guard ─────────────────────────────────────────────────────
  // Old trips saved before the INR update have no `currency` field, meaning
  // their categoryBudgets are in raw USD cents (e.g. ₹53 instead of ₹4,400).
  // Detect this and regenerate the budget fresh in the user's preferred currency.
  const categoryBudgetSum = Object.values(budgetData.categoryBudgets).reduce((a, b) => a + b, 0);
  const totalBudget = budgetData.totalBudget;
  const isStaleUSDData =
    !budgetData.currency &&
    totalBudget > 500 &&
    categoryBudgetSum > 0 &&
    categoryBudgetSum < totalBudget * 0.05; // category sum < 5% of total ⟹ USD-era mismatch

  if (isStaleUSDData) {
    // Regenerate immediately so the user never sees broken values
    const fresh = generateDefaultBudget(
      tripData.metadata.durationInDays,
      tripData.metadata.travelStyle,
      tripData.metadata.destination,
      preferredCurrency
    );
    // Preserve existing manually-set totalBudget if it looks intentional
    fresh.expenses = budgetData.expenses;
    onUpdateTripData({ ...tripData, budgetData: fresh });
    return null; // will re-render immediately with correct data
  }

  const currentCurrency = budgetData.currency || preferredCurrency;

  // ── Form States ──
  const [isEditingBudgets, setIsEditingBudgets] = useState(false);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseItem['category']>('Food');
  const [dayNumber, setDayNumber] = useState<string>('');

  // ── Filter States ──
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterDay, setFilterDay] = useState<string>('All');

  // ── UI States ──
  const [activeSegment, setActiveSegment] = useState<{
    category: string; amount: number; percent: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'categories'>('overview');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isCurrencyConverting, setIsCurrencyConverting] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 3D tilt on KPI cards
  useEffect(() => {
    const cleanup = initTiltCards('.budget-kpi-card', {
      maxTilt: 10,
      perspective: 700,
      glowColor: 'rgba(14,165,233,0.18)',
    });
    return cleanup;
  }, [activeTab]);

  // ── Computed Totals ──
  const categoryTotals: Record<string, number> = {
    Accommodation: 0, Transport: 0, Food: 0, Activities: 0, Shopping: 0, Others: 0
  };
  budgetData.expenses.forEach((e) => {
    if (categoryTotals[e.category] !== undefined) {
      categoryTotals[e.category] += e.amount;
    } else {
      categoryTotals.Others += e.amount;
    }
  });

  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const remaining = budgetData.totalBudget - totalSpent;
  const spentPercent = budgetData.totalBudget > 0 ? Math.min((totalSpent / budgetData.totalBudget) * 100, 100) : 0;

  const isOverBudget = totalSpent > budgetData.totalBudget;
  const savingsPercent = budgetData.totalBudget > 0 ? Math.round(((budgetData.totalBudget - totalSpent) / budgetData.totalBudget) * 100) : 0;


  // ── Filtered Expenses ──
  const filteredExpenses = useMemo(() => {
    return budgetData.expenses.filter((exp) => {
      const catMatch = filterCategory === 'All' || exp.category === filterCategory;
      const dayMatch = filterDay === 'All' || String(exp.dayNumber) === filterDay;
      return catMatch && dayMatch;
    });
  }, [budgetData.expenses, filterCategory, filterDay]);

  // ── Daily Spending Data ──
  const dailySpending = useMemo(() => {
    const map: Record<number, number> = {};
    budgetData.expenses.forEach((exp) => {
      const d = exp.dayNumber ?? 0;
      map[d] = (map[d] || 0) + exp.amount;
    });
    return map;
  }, [budgetData.expenses]);

  const maxDailySpend = Math.max(...Object.values(dailySpending), 1);

  // ── Donut Chart Segments ──
  let cumulativePercent = 0;
  const chartSegments = Object.entries(categoryTotals).map(([cat, amt]) => {
    const percent = totalSpent > 0 ? amt / totalSpent : 0;
    const segmentLength = percent * 314.159;
    const offset = 314.159 - cumulativePercent * 314.159;
    cumulativePercent += percent;
    return {
      category: cat, amount: amt, percent: percent * 100,
      strokeDasharray: `${segmentLength} 314.159`,
      strokeDashoffset: offset
    };
  });

  // ── Handlers ──
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || parseFloat(amount) <= 0) return;

    const newExpense: ExpenseItem = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      description,
      amount: parseFloat(amount),
      category,
      dayNumber: dayNumber ? parseInt(dayNumber) : undefined
    };

    onUpdateTripData({
      ...tripData,
      budgetData: { ...budgetData, expenses: [...budgetData.expenses, newExpense] }
    });
    setDescription('');
    setAmount('');
    setActiveTab('transactions');
  };

  const handleDeleteExpense = (id: string) => {
    onUpdateTripData({
      ...tripData,
      budgetData: { ...budgetData, expenses: budgetData.expenses.filter((e) => e.id !== id) }
    });
  };

  const handleTotalBudgetChange = (val: string) => {
    const parsed = parseFloat(val) || 0;
    const newTotal = Math.max(parsed, 0);

    // Auto-redistribute category budgets proportionally based on travel style
    const dist = DISTRIBUTIONS[tripData.metadata.travelStyle] || DISTRIBUTIONS.Default;
    const newCategoryBudgets: Record<string, number> = {};
    for (const [cat, ratio] of Object.entries(dist)) {
      newCategoryBudgets[cat] = Math.round(newTotal * ratio);
    }

    onUpdateTripData({
      ...tripData,
      budgetData: {
        ...budgetData,
        totalBudget: newTotal,
        categoryBudgets: newCategoryBudgets
      }
    });
  };

  const handleCategoryBudgetChange = (cat: string, val: string) => {
    const parsed = parseFloat(val) || 0;
    onUpdateTripData({
      ...tripData,
      budgetData: {
        ...budgetData,
        categoryBudgets: { ...budgetData.categoryBudgets, [cat]: Math.max(parsed, 0) }
      }
    });
  };

  const handleClearAll = () => {
    if (!showClearConfirm) {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 4000);
      return;
    }
    onUpdateTripData({
      ...tripData,
      budgetData: { ...budgetData, expenses: [] }
    });
    setShowClearConfirm(false);
  };

  const handleExportCSV = () => {
    const headers = ['Description', 'Amount', 'Currency', 'Category', 'Day'];
    const rows = budgetData.expenses.map((e) => [
      `"${e.description}"`,
      e.amount.toFixed(2),
      currentCurrency,
      e.category,
      e.dayNumber ?? 'N/A'
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tripData.metadata.destination.replace(/\s+/g, '_')}_expenses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    if (newCurrency === currentCurrency) {
      setCurrencyDropdownOpen(false);
      return;
    }
    setIsCurrencyConverting(true);
    setCurrencyDropdownOpen(false);

    try {
      // Get rates based on old currency
      const rates = getFallbackRatesForBase(currentCurrency);
      const rate = rates[newCurrency] ?? 1;

      const convertedTotalBudget = Math.round(budgetData.totalBudget * rate);
      const convertedCategoryBudgets: Record<string, number> = {};
      for (const [cat, val] of Object.entries(budgetData.categoryBudgets)) {
        convertedCategoryBudgets[cat] = Math.round(val * rate);
      }
      const convertedExpenses: ExpenseItem[] = budgetData.expenses.map((exp) => ({
        ...exp,
        amount: Math.round(exp.amount * rate * 100) / 100
      }));

      onUpdateTripData({
        ...tripData,
        budgetData: {
          ...budgetData,
          totalBudget: convertedTotalBudget,
          categoryBudgets: convertedCategoryBudgets,
          expenses: convertedExpenses,
          currency: newCurrency
        }
      });

      localStorage.setItem('travel_user_preferred_currency', newCurrency);
    } finally {
      setIsCurrencyConverting(false);
    }
  };

  // ── Category Status ──
  const getCategoryStatus = (cat: string) => {
    const spent = categoryTotals[cat];
    const limit = budgetData.categoryBudgets[cat] || 0;
    if (limit === 0) return 'none';
    const pct = (spent / limit) * 100;
    if (pct >= 100) return 'critical';
    if (pct >= 80) return 'warning';
    return 'ok';
  };

  // ── Spending Trend & Insights ──
  const avgDailySpend = budgetData.expenses.length > 0
    ? totalSpent / tripData.itinerary.length
    : 0;
  const topCategory = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .find(([, v]) => v > 0);

  return (
    <div className="budget-section no-print">
      {/* ─── Header ──────────────────────────────── */}
      <div className="budget-header-panel">
        <div className="budget-title-block">
          <span className="budget-icon-badge">📊</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 className="budget-title" style={{ margin: 0 }}>Travel Expense & Budget Tracker</h2>
              {/* Sync Status Badge */}
              {!isSaved ? (
                <span className="budget-sync-badge budget-sync-badge--unsaved" title="Plan your trip and save it to synchronize your expenses online.">
                  ⚠️ Unsaved (Local Only)
                </span>
              ) : isOffline ? (
                <span className="budget-sync-badge budget-sync-badge--offline" title="Stored in this browser's local storage. Will sync when online.">
                  💾 Local Cache (Offline)
                </span>
              ) : (
                <span className="budget-sync-badge budget-sync-badge--synced" title="Successfully saved and synchronized with your Firebase cloud database.">
                  ☁️ Cloud Synced
                </span>
              )}
            </div>
            <p className="budget-subtitle" style={{ margin: '4px 0 0 0' }}>{tripData.metadata.destination} · {tripData.metadata.durationInDays} Days</p>
          </div>
        </div>

        <div className="budget-header-actions">
          {/* Currency Selector */}
          <div className="budget-currency-selector" ref={dropdownRef}>
            <button
              className="budget-currency-btn"
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              disabled={isCurrencyConverting}
              title="Change budget currency"
            >
              <span className="currency-flag">{getCurrencySymbol(currentCurrency)}</span>
              <span>{currentCurrency}</span>
              {isCurrencyConverting
                ? <span className="currency-spinner">⟳</span>
                : <span className="currency-chevron">▾</span>}
            </button>
            {currencyDropdownOpen && (
              <div className="budget-currency-dropdown">
                <div className="currency-dropdown-search-header">Select Currency</div>
                <div className="currency-dropdown-list">
                  {POPULAR_CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      className={`currency-dropdown-item ${c.code === currentCurrency ? 'active' : ''}`}
                      onClick={() => handleCurrencyChange(c.code)}
                    >
                      <span className="currency-item-symbol">{c.symbol}</span>
                      <span className="currency-item-code">{c.code}</span>
                      <span className="currency-item-name">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsEditingBudgets(!isEditingBudgets)}
            className="budget-edit-toggle-btn"
          >
            {isEditingBudgets ? '✅ Done' : '⚙️ Set Targets'}
          </button>
        </div>
      </div>

      {/* ─── Budget Edit Panel ──────────────────── */}
      {isEditingBudgets && (
        <div className="budget-edit-panel">
          <h3 className="budget-sub-title">💰 Configure Budget Targets</h3>
          <div className="budget-fields-grid">
            <div className="budget-field-group total-budget-field">
              <label className="budget-field-label">Total Budget ({currentCurrency})</label>
              <input
                type="number"
                value={totalBudget || ''}
                onChange={(e) => handleTotalBudgetChange(e.target.value)}
                className="budget-edit-input"
                placeholder="0"
              />
            </div>
            {ALL_CATEGORIES.map((cat) => (
              <div key={cat} className="budget-field-group">
                <label className="budget-field-label">{CATEGORY_ICONS[cat]} {cat}</label>
                <input
                  type="number"
                  value={budgetData.categoryBudgets[cat] || ''}
                  onChange={(e) => handleCategoryBudgetChange(cat, e.target.value)}
                  className="budget-edit-input"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Overview KPI Cards ─────────────────── */}
      <div className="budget-kpi-grid">
        <div className={`budget-kpi-card ${isOverBudget ? 'kpi-danger' : 'kpi-neutral'}`}>
          <div className="kpi-icon">💸</div>
          <div className="kpi-content">
            <span className="kpi-label">Total Spent</span>
            <span className="kpi-value">{formatAmount(totalSpent, currentCurrency)}</span>
            <span className="kpi-sub">{spentPercent.toFixed(1)}% of budget</span>
          </div>
        </div>
        <div className="budget-kpi-card kpi-neutral">
          <div className="kpi-icon">🎯</div>
          <div className="kpi-content">
            <span className="kpi-label">Total Budget</span>
            <span className="kpi-value">{formatAmount(totalBudget, currentCurrency)}</span>
            <span className="kpi-sub">{tripData.metadata.durationInDays} days planned</span>
          </div>
        </div>
        <div className={`budget-kpi-card ${isOverBudget ? 'kpi-danger' : 'kpi-success'}`}>
          <div className="kpi-icon">{isOverBudget ? '🚨' : '💎'}</div>
          <div className="kpi-content">
            <span className="kpi-label">{isOverBudget ? 'Over Budget By' : 'Remaining'}</span>
            <span className="kpi-value">{formatAmount(Math.abs(remaining), currentCurrency)}</span>
            <span className="kpi-sub">{isOverBudget ? 'Exceeded limit!' : `${savingsPercent}% saved`}</span>
          </div>
        </div>
        <div className="budget-kpi-card kpi-info">
          <div className="kpi-icon">📅</div>
          <div className="kpi-content">
            <span className="kpi-label">Avg / Day</span>
            <span className="kpi-value">{formatAmount(Math.round(avgDailySpend), currentCurrency)}</span>
            <span className="kpi-sub">{budgetData.expenses.length} transactions</span>
          </div>
        </div>
      </div>

      {/* ─── Master Progress Bar ────────────────── */}
      <div className="budget-master-progress">
        <div className="budget-progress-labels">
          <span>Budget Used</span>
          <span style={{ color: isOverBudget ? '#ef4444' : '#10b981' }}>{spentPercent.toFixed(1)}%</span>
        </div>
        <div className="budget-progress-track">
          <div
            className={`budget-progress-fill ${isOverBudget ? 'danger-glow' : 'success-glow'}`}
            style={{ width: `${spentPercent}%` }}
          />
          {/* 80% warning marker */}
          <div className="budget-progress-marker" style={{ left: '80%' }} title="80% threshold" />
        </div>
      </div>

      {/* ─── Tabs ───────────────────────────────── */}
      <div className="budget-tabs">
        {(['overview', 'transactions', 'categories'] as const).map((tab) => (
          <button
            key={tab}
            className={`budget-tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && '📊 Overview'}
            {tab === 'transactions' && `🧾 Transactions (${budgetData.expenses.length})`}
            {tab === 'categories' && '🏷️ Categories'}
          </button>
        ))}
      </div>

      {/* ─── TAB: OVERVIEW ──────────────────────── */}
      {activeTab === 'overview' && (
        <div className="budget-overview-tab">
          <div className="budget-dashboard-split">
            {/* Left: Log Expense Form */}
            <div className="budget-controls-col">
              <form onSubmit={handleAddExpense} className="budget-expense-form">
                <h3 className="budget-sub-title">➕ Log New Expense</h3>
                <div className="budget-form-grid">
                  <div className="budget-field-group full-width">
                    <label className="budget-field-label">Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Dinner at Taj Restaurant"
                      className="budget-form-input"
                      required
                    />
                  </div>
                  <div className="budget-form-row">
                    <div className="budget-field-group">
                      <label className="budget-field-label">Amount ({currentCurrency})</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="budget-form-input"
                        min="0.01"
                        step="any"
                        required
                      />
                    </div>
                    <div className="budget-field-group">
                      <label className="budget-field-label">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ExpenseItem['category'])}
                        className="budget-form-select"
                      >
                        {ALL_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{CATEGORY_ICONS[cat]} {cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="budget-field-group">
                      <label className="budget-field-label">Day</label>
                      <select
                        value={dayNumber}
                        onChange={(e) => setDayNumber(e.target.value)}
                        className="budget-form-select"
                      >
                        <option value="">N/A</option>
                        {tripData.itinerary.map((d) => (
                          <option key={d.dayNumber} value={d.dayNumber}>Day {d.dayNumber}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <button type="submit" className="budget-add-btn">
                  ➕ Log Expense
                </button>
              </form>

              {/* Insights Panel */}
              {budgetData.expenses.length > 0 && (
                <div className="budget-insights-panel">
                  <h3 className="budget-sub-title">💡 Smart Insights</h3>
                  <div className="budget-insights-list">
                    {topCategory && (
                      <div className="budget-insight-row">
                        <span className="insight-dot" style={{ background: CATEGORY_COLORS[topCategory[0]] }} />
                        <span>Top spend: <strong>{CATEGORY_ICONS[topCategory[0]]} {topCategory[0]}</strong> — {formatAmount(topCategory[1], currentCurrency)}</span>
                      </div>
                    )}
                    <div className="budget-insight-row">
                      <span className="insight-dot" style={{ background: '#3b82f6' }} />
                      <span>Daily average: <strong>{formatAmount(Math.round(avgDailySpend), currentCurrency)}/day</strong></span>
                    </div>
                    {isOverBudget && (
                      <div className="budget-insight-row insight-danger">
                        <span className="insight-dot" style={{ background: '#ef4444' }} />
                        <span>🚨 You're <strong>{formatAmount(Math.abs(remaining), currentCurrency)}</strong> over budget!</span>
                      </div>
                    )}
                    {!isOverBudget && remaining > 0 && (
                      <div className="budget-insight-row insight-success">
                        <span className="insight-dot" style={{ background: '#10b981' }} />
                        <span>✅ On track! You can spend <strong>{formatAmount(Math.round(remaining / Math.max(1, tripData.itinerary.length)), currentCurrency)}/day</strong> more.</span>
                      </div>
                    )}
                    {/* Category alerts */}
                    {ALL_CATEGORIES.map((cat) => {
                      const status = getCategoryStatus(cat);
                      if (status === 'none') return null;
                      const spent = categoryTotals[cat];
                      const limit = budgetData.categoryBudgets[cat] || 0;
                      if (status === 'critical') return (
                        <div key={cat} className="budget-insight-row insight-danger">
                          <span className="insight-dot" style={{ background: '#ef4444' }} />
                          <span>🚨 {CATEGORY_ICONS[cat]} <strong>{cat}</strong> over limit! ({formatAmount(spent, currentCurrency)} / {formatAmount(limit, currentCurrency)})</span>
                        </div>
                      );
                      if (status === 'warning') return (
                        <div key={cat} className="budget-insight-row insight-warning">
                          <span className="insight-dot" style={{ background: '#f59e0b' }} />
                          <span>⚠️ {CATEGORY_ICONS[cat]} <strong>{cat}</strong> at {Math.round((spent / limit) * 100)}% of target</span>
                        </div>
                      );
                      return null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Donut Chart */}
            <div className="budget-chart-col">
              <div className="budget-chart-wrapper">
                <svg width="220" height="220" viewBox="0 0 140 140" className="budget-donut-chart">
                  <circle cx="70" cy="70" r="50" fill="transparent" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="16" />
                  {totalSpent === 0 && (
                    <circle cx="70" cy="70" r="50" fill="transparent" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="16"
                      strokeDasharray="314.159" strokeDashoffset="0" transform="rotate(-90 70 70)" />
                  )}
                  {chartSegments.map((seg) => {
                    if (seg.amount === 0) return null;
                    return (
                      <circle
                        key={seg.category}
                        cx="70" cy="70" r="50"
                        fill="transparent"
                        stroke={CATEGORY_COLORS[seg.category]}
                        strokeWidth="16"
                        strokeDasharray={seg.strokeDasharray}
                        strokeDashoffset={seg.strokeDashoffset}
                        transform="rotate(-90 70 70)"
                        className={`budget-donut-segment ${activeSegment?.category === seg.category ? 'active' : ''}`}
                        onMouseEnter={() => setActiveSegment({ category: seg.category, amount: seg.amount, percent: seg.percent })}
                        onMouseLeave={() => setActiveSegment(null)}
                      />
                    );
                  })}
                  <text x="70" y="60" textAnchor="middle" className="budget-donut-text-label">
                    {activeSegment ? activeSegment.category : 'Total Spent'}
                  </text>
                  <text x="70" y="79" textAnchor="middle" className="budget-donut-text-value">
                    {getCurrencySymbol(currentCurrency)}{(activeSegment ? activeSegment.amount : totalSpent).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </text>
                  <text x="70" y="94" textAnchor="middle" className="budget-donut-text-sub">
                    {activeSegment
                      ? `${activeSegment.percent.toFixed(1)}%`
                      : `${spentPercent.toFixed(0)}% of budget`}
                  </text>
                </svg>
              </div>

              {/* Chart Legend */}
              <div className="budget-chart-legend">
                {Object.entries(categoryTotals).map(([cat, amt]) => (
                  amt > 0 && (
                    <div key={cat} className="legend-item">
                      <span className="legend-dot" style={{ background: CATEGORY_COLORS[cat] }} />
                      <span className="legend-label">{CATEGORY_ICONS[cat]} {cat}</span>
                      <span className="legend-amount">{formatAmount(Math.round(amt), currentCurrency)}</span>
                    </div>
                  )
                ))}
                {totalSpent === 0 && (
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', textAlign: 'center', marginTop: 12 }}>
                    No expenses logged yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Daily Spend Bar Chart ── */}
          {Object.keys(dailySpending).length > 0 && (
            <div className="budget-daily-chart">
              <h3 className="budget-sub-title">📅 Daily Spending</h3>
              <div className="daily-bar-grid">
                {tripData.itinerary.map((day) => {
                  const spent = dailySpending[day.dayNumber] || 0;
                  const pct = maxDailySpend > 0 ? (spent / maxDailySpend) * 100 : 0;
                  return (
                    <div key={day.dayNumber} className="daily-bar-col">
                      <div className="daily-bar-track">
                        <div
                          className="daily-bar-fill"
                          style={{ height: `${Math.max(pct, 2)}%`, background: spent > 0 ? '#6366f1' : 'rgba(255,255,255,0.05)' }}
                          title={`Day ${day.dayNumber}: ${formatAmount(spent, currentCurrency)}`}
                        />
                      </div>
                      <div className="daily-bar-label">D{day.dayNumber}</div>
                      {spent > 0 && (
                        <div className="daily-bar-amount">{getCurrencySymbol(currentCurrency)}{Math.round(spent).toLocaleString('en-IN')}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: TRANSACTIONS ──────────────────── */}
      {activeTab === 'transactions' && (
        <div className="budget-transactions-tab">
          {/* Filter Bar */}
          <div className="budget-filter-bar">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="budget-filter-select"
            >
              <option value="All">All Categories</option>
              {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
            </select>
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="budget-filter-select"
            >
              <option value="All">All Days</option>
              {tripData.itinerary.map((d) => <option key={d.dayNumber} value={String(d.dayNumber)}>Day {d.dayNumber}</option>)}
              <option value="undefined">No Day</option>
            </select>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <button
                className="budget-utility-btn export-btn"
                onClick={handleExportCSV}
                disabled={budgetData.expenses.length === 0}
                title="Download as CSV"
              >
                📥 Export CSV
              </button>
              <button
                className={`budget-utility-btn clear-btn ${showClearConfirm ? 'confirm-state' : ''}`}
                onClick={handleClearAll}
                disabled={budgetData.expenses.length === 0}
                title="Clear all transactions"
              >
                {showClearConfirm ? '⚠️ Confirm Clear?' : '🧹 Clear All'}
              </button>
            </div>
          </div>

          {/* Transaction Summary Strip */}
          {filteredExpenses.length > 0 && (
            <div className="budget-filter-summary">
              <span>{filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''}</span>
              <span style={{ marginLeft: 'auto', fontWeight: 600 }}>
                Total: {formatAmount(filteredExpenses.reduce((s, e) => s + e.amount, 0), currentCurrency)}
              </span>
            </div>
          )}

          {/* List */}
          {filteredExpenses.length === 0 ? (
            <div className="budget-expenses-empty">
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🧾</div>
              <p>{budgetData.expenses.length === 0 ? 'No expenses logged yet.' : 'No expenses match your filters.'}</p>
            </div>
          ) : (
            <div className="budget-expenses-list">
              {[...filteredExpenses].reverse().map((exp) => {
                const pct = budgetData.categoryBudgets[exp.category]
                  ? ((categoryTotals[exp.category] / budgetData.categoryBudgets[exp.category]) * 100)
                  : 0;
                return (
                  <div key={exp.id} className="budget-expense-item">
                    <span
                      className="budget-expense-category-dot"
                      style={{ background: CATEGORY_COLORS[exp.category] }}
                      title={exp.category}
                    >
                      {CATEGORY_ICONS[exp.category]}
                    </span>
                    <div className="budget-expense-details">
                      <span className="budget-expense-desc">{exp.description}</span>
                      <span className="budget-expense-meta">
                        {exp.category}
                        {exp.dayNumber ? ` · Day ${exp.dayNumber}` : ''}
                        {pct >= 100 && <span className="expense-badge badge-danger"> 🚨 Over</span>}
                        {pct >= 80 && pct < 100 && <span className="expense-badge badge-warning"> ⚠️ Near</span>}
                      </span>
                    </div>
                    <span className="budget-expense-amount">{formatAmount(exp.amount, currentCurrency)}</span>
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="budget-expense-delete-btn"
                      title="Delete transaction"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: CATEGORIES ────────────────────── */}
      {activeTab === 'categories' && (
        <div className="budget-categories-tab">
          <div className="budget-categories-grid">
            {ALL_CATEGORIES.map((cat) => {
              const spent = categoryTotals[cat];
              const limit = budgetData.categoryBudgets[cat] || 0;
              const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
              const status = getCategoryStatus(cat);
              const isOverLimit = spent > limit && limit > 0;

              return (
                <div key={cat} className={`budget-category-card cat-status-${status}`}>
                  <div className="cat-card-header">
                    <span className="cat-card-icon" style={{ color: CATEGORY_COLORS[cat] }}>
                      {CATEGORY_ICONS[cat]}
                    </span>
                    <span className="cat-card-name" style={{ color: CATEGORY_COLORS[cat] }}>{cat}</span>
                    {status === 'critical' && <span className="cat-badge badge-critical">🚨 Over</span>}
                    {status === 'warning' && <span className="cat-badge badge-warn">⚠️ High</span>}
                  </div>
                  <div className="cat-card-amounts">
                    <span className="cat-spent" style={{ color: isOverLimit ? '#ef4444' : '#f1f5f9' }}>
                      {formatAmount(spent, currentCurrency)}
                    </span>
                    {limit > 0 && (
                      <span className="cat-limit">/ {formatAmount(limit, currentCurrency)}</span>
                    )}
                  </div>
                  {limit > 0 && (
                    <div className="cat-card-progress-track">
                      <div
                        className={`cat-card-progress-fill ${isOverLimit ? 'fill-over' : ''}`}
                        style={{
                          width: `${percent}%`,
                          background: isOverLimit ? '#ef4444' : CATEGORY_COLORS[cat]
                        }}
                      />
                    </div>
                  )}
                  {limit > 0 && (
                    <div className="cat-card-meta">
                      <span>{percent.toFixed(0)}% used</span>
                      {!isOverLimit && <span>{formatAmount(Math.max(limit - spent, 0), currentCurrency)} left</span>}
                    </div>
                  )}
                  {limit === 0 && (
                    <div className="cat-no-limit">No target set</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
