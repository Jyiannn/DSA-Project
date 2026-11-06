import { useState } from 'react';

const STATUS = {
  available: { label: 'Available' },
  occupied: { label: 'Occupied' },
  reserved: { label: 'Reserved' },
};

function ActionIcon({ name }) {
  const paths = {
    vacate: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
    reserve: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
    release: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>
  );
}

export default function MotorcycleSlot({ space, occupant, selected, onSelect, onVacate, onReserve }) {
  const available = space.status === 'available';
  const reserved = space.status === 'reserved';
  const occupied = space.status === 'occupied';
  const [tip, setTip] = useState(null);

  // Fixed positioning keeps the card clear of the board's overflow clipping and inside the viewport.
  const showTip = (event) => {
    if (!occupant) return;
    const box = event.currentTarget.getBoundingClientRect();
    setTip({
      top: Math.max(12, box.top - 10),
      left: Math.min(Math.max(122, box.left + box.width / 2), window.innerWidth - 122),
    });
  };

  return (
    <div className="motorcycle-slot-wrap" onMouseEnter={showTip} onMouseLeave={() => setTip(null)} onFocus={showTip} onBlur={() => setTip(null)}>
      <button
        type="button"
        className={`motorcycle-slot is-${space.status} ${selected ? 'is-selected' : ''}`}
        disabled={!available}
        onClick={() => onSelect?.(space.id)}
        aria-pressed={selected}
        aria-label={`${space.id}, ${STATUS[space.status].label}`}
      >
        <span className="slot-id">{space.id}</span>
        <img
          className="motorcycle-slot__icon"
          src={occupied ? 'assets/occupied.png' : 'assets/available_space.png'}
          alt=""
          aria-hidden="true"
        />
        <span className={`slot-status slot-status--${space.status}`}>{STATUS[space.status].label}</span>
        {occupied && occupant && <em className="slot-plate">{occupant.plate}</em>}
      </button>
      <div className="slot-actions">
        {available && (
          <button
            type="button"
            className="slot-action slot-action--reserve"
            onClick={() => onReserve?.(space.id, true)}
            aria-label={`Reserve slot ${space.id}`}
            data-tip={`Reserve ${space.id} · hold it for an arrival`}
          >
            <ActionIcon name="reserve" />
          </button>
        )}
        {reserved && (
          <button
            type="button"
            className="slot-action slot-action--release"
            onClick={() => onReserve?.(space.id, false)}
            aria-label={`Release reservation on slot ${space.id}`}
            data-tip={`Release ${space.id} · make it available again`}
          >
            <ActionIcon name="release" />
          </button>
        )}
        {occupied && (
          <button
            type="button"
            className="slot-action slot-action--vacate"
            onClick={() => onVacate?.(space.id)}
            aria-label={`Vacate slot ${space.id}`}
            data-tip={`Vacate ${space.id} · log the motorcycle out`}
          >
            <ActionIcon name="vacate" />
          </button>
        )}
      </div>
      {tip && occupant && (
        <div className="slot-tip" style={tip} role="tooltip">
          <strong>{occupant.plate}</strong>
          <span>{occupant.model}</span>
          <p>{occupant.driver}</p>
          <p>{occupant.classification} &middot; {occupant.contact}</p>
          <p>In since {occupant.timeIn}</p>
        </div>
      )}
    </div>
  );
}
