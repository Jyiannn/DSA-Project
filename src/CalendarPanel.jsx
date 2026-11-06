import { useState } from 'react';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const iso = (year, month, day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
export const prettyDate = (value) => new Date(value + 'T00:00:00').toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });

export default function CalendarPanel({ filterDate, onFilterChange }) {
  const now = new Date();
  const [view, setView] = useState(() => ({ year: now.getFullYear(), month: now.getMonth() }));

  const todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate());
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const shiftMonth = (delta) => setView(({ year, month }) => { const d = new Date(year, month + delta, 1); return { year: d.getFullYear(), month: d.getMonth() }; });

  return (
    <section className="clock-panel clock-panel--calendar-only" aria-label="Calendar">
      <div className="calendar-card">
        <header>
          <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month">&larr;</button>
          <b>{new Date(view.year, view.month, 1).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}</b>
          <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month">&rarr;</button>
        </header>
        <div className="calendar-weekdays" aria-hidden="true">{WEEKDAYS.map((day, index) => <i key={index}>{day}</i>)}</div>
        <div className="calendar-days" role="grid">
          {Array.from({ length: firstWeekday }, (_, index) => <span key={`blank-${index}`} />)}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const value = iso(view.year, view.month, day);
            const classes = [value === todayIso ? 'is-today' : '', value === filterDate ? 'is-selected' : ''].filter(Boolean).join(' ');
            return <button key={value} type="button" className={classes} role="gridcell" aria-pressed={value === filterDate} aria-label={prettyDate(value)} onClick={() => onFilterChange(value === filterDate ? '' : value)}>{day}</button>;
          })}
        </div>
        <footer>
          <span>{filterDate ? `Showing ${prettyDate(filterDate)}` : 'Showing all visits'}</span>
          {filterDate && <button type="button" onClick={() => onFilterChange('')}>Clear</button>}
        </footer>
      </div>
    </section>
  );
}
