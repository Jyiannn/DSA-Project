export default function MotorcycleSlot({ space, selected, onSelect }) {
  const available = space.status === 'available';
  return (
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
        src={available ? '/assets/available_space.png' : '/assets/occupied.png'}
        alt=""
        aria-hidden="true"
      />
      <small>{available ? 'Available' : 'Occupied'}</small>
    </button>
  );
}
