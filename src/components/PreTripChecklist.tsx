// src/components/PreTripChecklist.tsx
// Smart pre-trip checklist — tasks grouped by how many days before the trip.
// Persisted in localStorage per tripId. Fully offline. No API needed.

import { useState, useEffect, useMemo } from 'react';

interface ChecklistTask {
  id: string;
  daysBeforeMin: number;  // task becomes relevant from this many days before
  daysBeforeMax: number;  // task is urgent by this many days before
  category: 'documents' | 'booking' | 'health' | 'money' | 'packing' | 'tech' | 'dayof';
  icon: string;
  task: string;
  tip?: string;
}

interface PreTripChecklistProps {
  tripId?: string;
  destination: string;
  startDate?: string;
  durationDays?: number;
  requiresVisa?: boolean;
}

const CATEGORY_META: Record<ChecklistTask['category'], { label: string; color: string }> = {
  documents: { label: 'Documents',    color: '#60a5fa' },
  booking:   { label: 'Bookings',     color: '#a78bfa' },
  health:    { label: 'Health',       color: '#4ade80' },
  money:     { label: 'Money',        color: '#fbbf24' },
  packing:   { label: 'Packing',      color: '#f87171' },
  tech:      { label: 'Tech & Apps',  color: '#38bdf8' },
  dayof:     { label: 'Day Of',       color: '#fb923c' },
};

// ── Base tasks — always shown ──────────────────────────────────────────────
const BASE_TASKS: ChecklistTask[] = [
  // 30+ days before
  { id: 'passport',   daysBeforeMin: 999, daysBeforeMax: 30, category: 'documents', icon: '📘', task: 'Check passport validity (must be valid 6+ months beyond return date)',  tip: 'Most countries require at least 6 months validity. Renew early if needed.' },
  { id: 'visa_check', daysBeforeMin: 999, daysBeforeMax: 30, category: 'documents', icon: '🛂', task: 'Research visa requirements for your destination',                        tip: 'Use the Visa Info section above for your passport country.' },
  { id: 'insurance',  daysBeforeMin: 999, daysBeforeMax: 21, category: 'health',    icon: '🏥', task: 'Purchase travel insurance',                                              tip: 'Cover: medical, trip cancellation, baggage loss. Compare at InsureMyTrip.com.' },
  { id: 'flights',    daysBeforeMin: 999, daysBeforeMax: 30, category: 'booking',   icon: '✈️', task: 'Book flights',                                                           tip: 'Prices tend to drop 3–6 weeks before departure for domestic; 2–3 months for international.' },
  { id: 'hotels',     daysBeforeMin: 999, daysBeforeMax: 21, category: 'booking',   icon: '🏨', task: 'Confirm hotel / accommodation bookings',                                 tip: 'Screenshot or print confirmation emails in case of no internet at destination.' },
  { id: 'vaccinations', daysBeforeMin: 999, daysBeforeMax: 30, category: 'health', icon: '💉', task: 'Check recommended vaccinations for destination',                         tip: 'Some vaccines (Hepatitis A/B, Yellow Fever) require 2–4 weeks to take effect.' },

  // 14–21 days before
  { id: 'notify_bank',daysBeforeMin: 21,  daysBeforeMax: 7,  category: 'money',    icon: '💳', task: 'Notify your bank/card provider of travel dates',                        tip: 'Prevent card being blocked for unusual foreign transactions.' },
  { id: 'forex',      daysBeforeMin: 21,  daysBeforeMax: 7,  category: 'money',    icon: '💵', task: 'Exchange some local currency / order forex card',                        tip: 'Carry a mix of cash and card. Airport forex is expensive — exchange beforehand.' },
  { id: 'offline_maps', daysBeforeMin: 14, daysBeforeMax: 3, category: 'tech',     icon: '🗺️', task: 'Download offline maps for destination (Google Maps / Maps.me)',          tip: 'Download 2 days before — maps can be large. Saves data and works without internet.' },
  { id: 'transport_apps', daysBeforeMin: 14, daysBeforeMax: 3, category: 'tech',   icon: '📱', task: 'Install local transport apps (Grab, Ola, Gojek, etc.)',                  tip: 'Check the Transport Guide above for which apps are relevant to your destination.' },
  { id: 'accommodation_addr', daysBeforeMin: 14, daysBeforeMax: 3, category: 'documents', icon: '📋', task: 'Save hotel address in local language on your phone',           tip: 'Useful when showing taxi drivers. Translate via Google Translate or hotel website.' },

  // 7 days before
  { id: 'check_weather', daysBeforeMin: 7, daysBeforeMax: 1, category: 'packing',  icon: '⛅', task: 'Check weather forecast for destination',                               tip: 'Use the Weather section above for a 5-day forecast.' },
  { id: 'pack_bags',  daysBeforeMin: 7,  daysBeforeMax: 2,  category: 'packing',   icon: '🎒', task: 'Start packing — check Packing List section',                            tip: 'Pack 2 days early to avoid rushing. Lay everything out first to see if it fits.' },
  { id: 'travel_docs_folder', daysBeforeMin: 7, daysBeforeMax: 1, category: 'documents', icon: '📁', task: 'Create a travel documents folder (physical + digital)',          tip: 'Include: passport, visa, insurance, hotel booking, flight tickets, emergency contacts.' },
  { id: 'power_adapter', daysBeforeMin: 7, daysBeforeMax: 2, category: 'tech',     icon: '🔌', task: 'Pack universal power adapter / check plug type at destination',         tip: 'Power plug types vary. UK uses Type G, Europe uses Type C/F, US uses Type A.' },
  { id: 'power_bank', daysBeforeMin: 7,  daysBeforeMax: 2,  category: 'tech',      icon: '🔋', task: 'Charge power bank fully',                                               tip: 'Airlines restrict power banks >100Wh in checked luggage. Carry in hand luggage.' },
  { id: 'copy_docs',  daysBeforeMin: 7,  daysBeforeMax: 1,  category: 'documents', icon: '📸', task: 'Photograph / scan all important documents',                             tip: 'Store copies in cloud (Google Drive) and email them to yourself. Backup saves the day.' },

  // 1–3 days before
  { id: 'online_checkin', daysBeforeMin: 3, daysBeforeMax: 0, category: 'booking', icon: '🛫', task: 'Check in online for your flight (usually opens 24–48h before)',         tip: 'Online check-in lets you choose seats and avoid airport queues.' },
  { id: 'boarding_pass', daysBeforeMin: 2, daysBeforeMax: 0, category: 'documents', icon: '🎫', task: 'Download or print boarding pass',                                      tip: 'Screenshot your boarding pass in case you lose internet at the airport.' },
  { id: 'emergency_contacts', daysBeforeMin: 3, daysBeforeMax: 0, category: 'documents', icon: '📞', task: 'Share trip itinerary and emergency contacts with family',        tip: 'Share your hotel address, flight details, and local SIM number with someone at home.' },
  { id: 'sim_card',   daysBeforeMin: 3,  daysBeforeMax: 0,  category: 'tech',      icon: '📶', task: 'Arrange local SIM card / international roaming plan',                   tip: 'Local SIMs are cheapest. Buy at airport or convenience store on arrival.' },
  { id: 'luggage_lock', daysBeforeMin: 3, daysBeforeMax: 0, category: 'packing',   icon: '🔐', task: 'Lock your luggage with TSA-approved locks',                             tip: 'TSA locks can be opened by security without breaking them.' },

  // Day of travel
  { id: 'arrive_early', daysBeforeMin: 1, daysBeforeMax: 0, category: 'dayof',     icon: '⏰', task: 'Arrive at airport 2–3 hours before international departure',            tip: 'International flights: 3 hours. Domestic: 1.5–2 hours. Allow extra for peak times.' },
  { id: 'passport_hand', daysBeforeMin: 1, daysBeforeMax: 0, category: 'dayof',    icon: '✋', task: 'Keep passport in hand luggage, never checked baggage',                  tip: 'Also keep phone charger, medications, and valuables in carry-on.' },
  { id: 'currency_small', daysBeforeMin: 1, daysBeforeMax: 0, category: 'dayof',   icon: '💰', task: 'Have some local currency ready for arrival (taxi, tip, SIM)',            tip: 'The first 30 minutes at a new destination is when you need cash most.' },
  { id: 'turn_off_home', daysBeforeMin: 1, daysBeforeMax: 0, category: 'dayof',    icon: '🏠', task: 'Turn off home appliances, lock windows/doors, set security',             tip: 'Unplug electronics, turn off water heater, ask a neighbour to check in.' },
];

// ── Days-before → urgency label ────────────────────────────────────────────
function getUrgencyLabel(days: number): { label: string; emoji: string; cls: string } {
  if (days < 0)  return { label: 'Trip is here!', emoji: '🛫', cls: 'urgency-now' };
  if (days === 0) return { label: 'Today', emoji: '🚨', cls: 'urgency-now' };
  if (days <= 3)  return { label: `${days} day${days > 1 ? 's' : ''} to go`, emoji: '🔴', cls: 'urgency-critical' };
  if (days <= 7)  return { label: `${days} days to go`, emoji: '🟠', cls: 'urgency-soon' };
  if (days <= 14) return { label: `${days} days to go`, emoji: '🟡', cls: 'urgency-upcoming' };
  return { label: `${days} days to go`, emoji: '🟢', cls: 'urgency-ok' };
}

// ── Filter tasks relevant to current days-remaining ─────────────────────────
function getRelevantTasks(tasks: ChecklistTask[], daysUntil: number): ChecklistTask[] {
  return tasks.filter(t => daysUntil <= t.daysBeforeMin);
}

export default function PreTripChecklist({
  tripId,
  destination,
  startDate,
  requiresVisa,
}: PreTripChecklistProps) {
  const storageKey = `ptc_${tripId || destination.replace(/\s+/g, '_').toLowerCase()}`;

  const daysUntil = useMemo(() => {
    if (!startDate) return 30; // default show mid-range tasks
    const diff = Math.ceil((new Date(startDate).getTime() - Date.now()) / 86400000);
    return diff;
  }, [startDate]);

  const urgency = getUrgencyLabel(daysUntil);

  // All tasks + visa task if needed
  const allTasks = useMemo(() => {
    const tasks = [...BASE_TASKS];
    if (requiresVisa) {
      tasks.push({
        id: 'apply_visa',
        daysBeforeMin: 999, daysBeforeMax: 45,
        category: 'documents', icon: '📮',
        task: `Apply for ${destination} visa as soon as possible`,
        tip: 'Visa processing can take 2–8 weeks. Apply early. Check embassy website for exact requirements.',
      });
    }
    return tasks;
  }, [destination, requiresVisa]);

  const relevantTasks = useMemo(() => getRelevantTasks(allTasks, daysUntil), [allTasks, daysUntil]);

  // Load persisted checked state
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [expanded, setExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ChecklistTask['category'] | 'all'>('all');

  // Persist checked state
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(checked));
  }, [checked, storageKey]);

  const toggleTask = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTasks = useMemo(() =>
    activeFilter === 'all'
      ? relevantTasks
      : relevantTasks.filter(t => t.category === activeFilter),
    [relevantTasks, activeFilter]
  );

  const completedCount = relevantTasks.filter(t => checked[t.id]).length;
  const totalCount = relevantTasks.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const categories = useMemo(() => {
    const cats = new Set(relevantTasks.map(t => t.category));
    return Array.from(cats) as ChecklistTask['category'][];
  }, [relevantTasks]);

  const urgentPending = relevantTasks.filter(t => !checked[t.id] && t.daysBeforeMax >= (daysUntil - 2) && daysUntil <= t.daysBeforeMax);

  return (
    <div className="ptc-card">
      {/* Header */}
      <button
        className="ptc-header"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <span className="ptc-header-icon">🗒️</span>
        <div className="ptc-header-text">
          <h3 className="ptc-title">Pre-Trip Checklist</h3>
          <p className="ptc-subtitle">
            <span className={`ptc-urgency ${urgency.cls}`}>{urgency.emoji} {urgency.label}</span>
            {' · '}
            {completedCount}/{totalCount} tasks done
          </p>
        </div>
        <div className="ptc-progress-ring-wrap">
          <svg width="44" height="44" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
            <circle
              cx="22" cy="22" r="18" fill="none"
              stroke={progressPct === 100 ? '#4ade80' : '#0ea5e9'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 18}`}
              strokeDashoffset={`${2 * Math.PI * 18 * (1 - progressPct / 100)}`}
              transform="rotate(-90 22 22)"
              style={{ transition: 'stroke-dashoffset 0.4s ease' }}
            />
          </svg>
          <span className="ptc-ring-pct">{progressPct}%</span>
        </div>
        <span className={`ptc-chevron ${expanded ? 'open' : ''}`}>›</span>
      </button>

      {/* Progress bar (always visible) */}
      <div className="ptc-progress-bar-wrap">
        <div
          className="ptc-progress-bar-fill"
          style={{
            width: `${progressPct}%`,
            background: progressPct === 100 ? '#4ade80' : 'linear-gradient(90deg, #0ea5e9, #8b5cf6)',
          }}
        />
      </div>

      {/* Urgent pending banner */}
      {!expanded && urgentPending.length > 0 && (
        <div className="ptc-urgent-banner">
          🔴 {urgentPending.length} urgent task{urgentPending.length > 1 ? 's' : ''} overdue:{' '}
          <strong>{urgentPending[0].task.split('(')[0].trim()}{urgentPending.length > 1 ? '…' : ''}</strong>
          <button className="ptc-urgent-cta" onClick={() => setExpanded(true)}>View</button>
        </div>
      )}

      {expanded && (
        <div className="ptc-body">
          {/* Category filter pills */}
          <div className="ptc-filter-pills">
            <button
              className={`ptc-filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All ({totalCount})
            </button>
            {categories.map(cat => {
              const meta = CATEGORY_META[cat];
              const catCount = relevantTasks.filter(t => t.category === cat).length;
              const catDone = relevantTasks.filter(t => t.category === cat && checked[t.id]).length;
              return (
                <button
                  key={cat}
                  className={`ptc-filter-pill ${activeFilter === cat ? 'active' : ''}`}
                  style={activeFilter === cat ? { borderColor: meta.color, color: meta.color } : {}}
                  onClick={() => setActiveFilter(cat)}
                >
                  {meta.label} ({catDone}/{catCount})
                </button>
              );
            })}
          </div>

          {/* Task list */}
          <div className="ptc-task-list">
            {filteredTasks.map(task => {
              const isChecked = !!checked[task.id];
              const isOverdue = !isChecked && daysUntil <= task.daysBeforeMax;
              const catMeta = CATEGORY_META[task.category];
              return (
                <div
                  key={task.id}
                  className={`ptc-task-item ${isChecked ? 'done' : ''} ${isOverdue ? 'overdue' : ''}`}
                  onClick={() => toggleTask(task.id)}
                >
                  <span className="ptc-task-check" aria-checked={isChecked} role="checkbox">
                    {isChecked ? '✓' : ''}
                  </span>
                  <span className="ptc-task-icon">{task.icon}</span>
                  <div className="ptc-task-content">
                    <span className="ptc-task-text">{task.task}</span>
                    {task.tip && !isChecked && (
                      <span className="ptc-task-tip">💡 {task.tip}</span>
                    )}
                  </div>
                  <span
                    className="ptc-task-cat"
                    style={{ color: catMeta.color }}
                  >
                    {catMeta.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Reset button */}
          {completedCount > 0 && (
            <button
              className="ptc-reset-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Reset all checklist progress?')) setChecked({});
              }}
            >
              ↺ Reset Progress
            </button>
          )}
        </div>
      )}
    </div>
  );
}
