// src/components/BudgetTracker.tsx
import React, { useState } from 'react';
import type { FullTripItinerary, ExpenseItem } from '../types/travel';

interface BudgetTrackerProps {
  tripData: FullTripItinerary;
  onUpdateTripData: (trip: FullTripItinerary) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Accommodation: '#3b82f6', // blue
  Transport: '#8b5cf6',     // purple
  Food: '#f59e0b',          // amber
  Activities: '#10b981',    // emerald
  Shopping: '#ec4899',      // pink
  Others: '#64748b'         // slate
};

const CATEGORY_ICONS: Record<string, string> = {
  Accommodation: '🏨',
  Transport: '🚗',
  Food: '🍽️',
  Activities: '🧗',
  Shopping: '🛍️',
  Others: '📦'
};

export default function BudgetTracker({ tripData, onUpdateTripData }: BudgetTrackerProps) {
  const budgetData = tripData.budgetData;

  // Render nothing if budget data hasn't initialized
  if (!budgetData) return null;

  const [isEditingBudgets, setIsEditingBudgets] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseItem['category']>('Food');
  const [dayNumber, setDayNumber] = useState<string>('1');

  // SVG Chart hover states
  const [activeSegment, setActiveSegment] = useState<{
    category: string;
    amount: number;
    percent: number;
  } | null>(null);

  // Compute category totals
  const categoryTotals: Record<string, number> = {
    Accommodation: 0,
    Transport: 0,
    Food: 0,
    Activities: 0,
    Shopping: 0,
    Others: 0
  };

  budgetData.expenses.forEach((e) => {
    if (categoryTotals[e.category] !== undefined) {
      categoryTotals[e.category] += e.amount;
    } else {
      categoryTotals.Others += e.amount;
    }
  });

  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const totalBudget = budgetData.totalBudget;
  const remaining = totalBudget - totalSpent;
  const spentPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const isOverBudget = totalSpent > totalBudget;

  // Chart segment coordinates calculation
  let cumulativePercent = 0;
  const chartSegments = Object.entries(categoryTotals).map(([cat, amt]) => {
    const percent = totalSpent > 0 ? amt / totalSpent : 0;
    const segmentLength = percent * 314.159; // Circumference of radius 50
    const offset = 314.159 - cumulativePercent * 314.159;
    cumulativePercent += percent;
    return {
      category: cat,
      amount: amt,
      percent: percent * 100,
      strokeDasharray: `${segmentLength} 314.159`,
      strokeDashoffset: offset
    };
  });

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
      budgetData: {
        ...budgetData,
        expenses: [...budgetData.expenses, newExpense]
      }
    });

    setDescription('');
    setAmount('');
  };

  const handleDeleteExpense = (id: string) => {
    onUpdateTripData({
      ...tripData,
      budgetData: {
        ...budgetData,
        expenses: budgetData.expenses.filter((e) => e.id !== id)
      }
    });
  };

  const handleTotalBudgetChange = (val: string) => {
    const parsed = parseFloat(val) || 0;
    onUpdateTripData({
      ...tripData,
      budgetData: {
        ...budgetData,
        totalBudget: Math.max(parsed, 0)
      }
    });
  };

  const handleCategoryBudgetChange = (cat: string, val: string) => {
    const parsed = parseFloat(val) || 0;
    onUpdateTripData({
      ...tripData,
      budgetData: {
        ...budgetData,
        categoryBudgets: {
          ...budgetData.categoryBudgets,
          [cat]: Math.max(parsed, 0)
        }
      }
    });
  };

  return (
    <div className="budget-section no-print">
      <div className="budget-header-panel">
        <div className="budget-title-block">
          <span className="budget-icon-badge">📊</span>
          <h2 className="budget-title">Travel Expense & Budget Tracker</h2>
        </div>
        <button
          onClick={() => setIsEditingBudgets(!isEditingBudgets)}
          className="budget-edit-toggle-btn"
        >
          {isEditingBudgets ? '⚙️ Done' : '⚙️ Adjust Budgets'}
        </button>
      </div>

      {/* Overview Cards & Progress bar */}
      <div className="budget-overview-grid">
        <div className="budget-overview-card spent">
          <span className="budget-overview-label">Total Spent</span>
          <span className="budget-overview-val">${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="budget-overview-card limit">
          <span className="budget-overview-label">Total Budget</span>
          <span className="budget-overview-val">${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className={`budget-overview-card remaining ${isOverBudget ? 'negative' : 'positive'}`}>
          <span className="budget-overview-label">{isOverBudget ? 'Over Budget By' : 'Remaining Funds'}</span>
          <span className="budget-overview-val">
            {isOverBudget ? '-' : ''}${Math.abs(remaining).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="budget-progress-container">
        <div
          className={`budget-progress-fill ${isOverBudget ? 'danger-glow' : 'success-glow'}`}
          style={{ width: `${spentPercent}%` }}
        />
      </div>

      <div className="budget-dashboard-split">
        {/* Left Column: Log Expenses / Allocations */}
        <div className="budget-controls-col">
          {/* Allocations editor */}
          {isEditingBudgets ? (
            <div className="budget-allocations-editor">
              <h3 className="budget-sub-title">Set Category Targets</h3>
              <div className="budget-fields-grid">
                <div className="budget-field-group">
                  <label className="budget-field-label">Total Budget</label>
                  <input
                    type="number"
                    value={totalBudget || ''}
                    onChange={(e) => handleTotalBudgetChange(e.target.value)}
                    className="budget-edit-input"
                    placeholder="0.00"
                  />
                </div>
                {Object.keys(CATEGORY_COLORS).map((cat) => (
                  <div key={cat} className="budget-field-group">
                    <label className="budget-field-label">
                      {CATEGORY_ICONS[cat]} {cat}
                    </label>
                    <input
                      type="number"
                      value={budgetData.categoryBudgets[cat] || ''}
                      onChange={(e) => handleCategoryBudgetChange(cat, e.target.value)}
                      className="budget-edit-input"
                      placeholder="0.00"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Log New Expense Form */
            <form onSubmit={handleAddExpense} className="budget-expense-form">
              <h3 className="budget-sub-title">Log New Expense</h3>
              <div className="budget-form-grid">
                <div className="budget-field-group">
                  <label className="budget-field-label">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Dinner at Bistro"
                    className="budget-form-input"
                    required
                  />
                </div>
                <div className="budget-form-row">
                  <div className="budget-field-group">
                    <label className="budget-field-label">Amount ($)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
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
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="budget-form-select"
                    >
                      {Object.keys(CATEGORY_COLORS).map((cat) => (
                        <option key={cat} value={cat}>
                          {CATEGORY_ICONS[cat]} {cat}
                        </option>
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
                        <option key={d.dayNumber} value={d.dayNumber}>
                          Day {d.dayNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <button type="submit" className="budget-add-btn">
                ➕ Log Expense
              </button>
            </form>
          )}

          {/* List of logged expenses */}
          <div className="budget-expenses-list-container">
            <h3 className="budget-sub-title">Recent Transactions</h3>
            {budgetData.expenses.length === 0 ? (
              <div className="budget-expenses-empty">No expenses logged yet.</div>
            ) : (
              <div className="budget-expenses-list">
                {[...budgetData.expenses].reverse().map((exp) => (
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
                        {exp.category} {exp.dayNumber ? `· Day ${exp.dayNumber}` : ''}
                      </span>
                    </div>
                    <span className="budget-expense-amount">${exp.amount.toFixed(2)}</span>
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="budget-expense-delete-btn"
                      title="Delete transaction"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Custom Donut Chart & Targets */}
        <div className="budget-chart-col">
          <div className="budget-chart-wrapper">
            <svg width="220" height="220" viewBox="0 0 140 140" className="budget-donut-chart">
              {/* Background circle track */}
              <circle
                cx="70"
                cy="70"
                r="50"
                fill="transparent"
                stroke="rgba(255, 255, 255, 0.04)"
                strokeWidth="16"
              />
              {/* Colored segment circles */}
              {chartSegments.map((seg) => {
                if (seg.amount === 0) return null;
                return (
                  <circle
                    key={seg.category}
                    cx="70"
                    cy="70"
                    r="50"
                    fill="transparent"
                    stroke={CATEGORY_COLORS[seg.category]}
                    strokeWidth="16"
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    transform="rotate(-90 70 70)"
                    className={`budget-donut-segment ${activeSegment?.category === seg.category ? 'active' : ''}`}
                    onMouseEnter={() =>
                      setActiveSegment({
                        category: seg.category,
                        amount: seg.amount,
                        percent: seg.percent
                      })
                    }
                    onMouseLeave={() => setActiveSegment(null)}
                  />
                );
              })}
              {/* Centered label */}
              <text x="70" y="62" textAnchor="middle" className="budget-donut-text-label">
                {activeSegment ? activeSegment.category : 'Total Spent'}
              </text>
              <text x="70" y="82" textAnchor="middle" className="budget-donut-text-value">
                ${(activeSegment ? activeSegment.amount : totalSpent).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </text>
              <text x="70" y="96" textAnchor="middle" className="budget-donut-text-sub">
                {activeSegment
                  ? `${activeSegment.percent.toFixed(1)}%`
                  : `${spentPercent.toFixed(0)}% of budget`}
              </text>
            </svg>
          </div>

          {/* Category breakdown rows showing spent vs target limit */}
          <div className="budget-categories-breakdown">
            <h3 className="budget-sub-title">Category Targets & Status</h3>
            <div className="budget-categories-list">
              {Object.keys(CATEGORY_COLORS).map((cat) => {
                const spent = categoryTotals[cat];
                const limit = budgetData.categoryBudgets[cat] || 0;
                const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                const isOverLimit = spent > limit;

                return (
                  <div key={cat} className="budget-category-row">
                    <div className="budget-category-row-header">
                      <span className="budget-category-name" style={{ color: CATEGORY_COLORS[cat] }}>
                        {CATEGORY_ICONS[cat]} {cat}
                      </span>
                      <span className="budget-category-numbers">
                        <strong>${spent.toFixed(0)}</strong> / ${limit.toFixed(0)}
                      </span>
                    </div>
                    <div className="budget-category-bar-bg">
                      <div
                        className={`budget-category-bar-fill ${isOverLimit ? 'over' : ''}`}
                        style={{
                          width: `${percent}%`,
                          background: isOverLimit ? '#ef4444' : CATEGORY_COLORS[cat]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
