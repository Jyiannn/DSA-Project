import { useState } from 'react';

export default function MotorcycleSlot({ space, occupant, selected, onSelect, onVacate }) {
  const available = space.status === 'available';
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
        className={`motorcycle-slot ${available ? 'is-available' : 'is-occupied'} ${selected ? 'is-selected' : ''}`}
        disabled={!available}
        onClick={() => onSelect?.(space.id)}
        aria-pressed={selected}
        aria-label={`${space.id}, ${available ? 'available' : 'occupied'}`}
      >
        <span>{space.id}</span>
        <img
          className="motorcycle-slot__icon"
          src={available ? 'assets/available_space.png' : 'assets/occupied.png'}
          alt=""
          aria-hidden="true"
        />
        <small>{available ? 'Available' : 'Occupied'}</small>
      </button>
      {space.status === 'occupied' && (
        <button
          type="button"
          className="motorcycle-slot__vacate"
          onClick={() => onVacate?.(space.id)}
          aria-label={`Vacate slot ${space.id}`}
        >
          Vacate
        </button>
      )}
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
