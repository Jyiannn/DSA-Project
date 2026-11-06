import { useState } from 'react';
import NoticeModal from './NoticeModal';

const slotModes = [
  ['auto', 'Auto park', 'Nearest open slot'],
  ['manual', 'Choose slot', 'Pick an available one'],
];

export default function RegisteredMotoristForm({ motorists = [], spaces = [], selectedSpace, onSlotChange, onPark }) {
  const [repeatPlate, setRepeatPlate] = useState('');
  const [logging, setLogging] = useState(false);
  const [notice, setNotice] = useState('');
  const [mode, setMode] = useState('auto');
  const [confirmation, setConfirmation] = useState(null); // { owner, plate, slot }

  const revisitable = motorists.filter((motorist) => !motorist.currentSlot);
  const availableSpaces = spaces.filter((space) => space.status === 'available');
  const nearest = availableSpaces[0]?.id || '';
  const selectedMotorist = revisitable.find((motorist) => motorist.plate === repeatPlate);

  const submit = async (event) => {
    event.preventDefault();
    if (!repeatPlate) return;
    setLogging(true);
    setNotice('');
    try {
      const record = await onPark?.(repeatPlate, mode === 'auto' ? '' : selectedSpace);
      setConfirmation({ owner: selectedMotorist?.owner ?? repeatPlate, plate: repeatPlate, slot: record?.slot });
      setRepeatPlate('');
    } catch (parkError) {
      setNotice(parkError instanceof Error ? parkError.message : 'The motorcycle could not be parked.');
    } finally {
      setLogging(false);
    }
  };

  return (
    <form className="motorcycle-form registered-form" onSubmit={submit}>
      <div className="form-kicker">SAVED DETAILS</div>
      <h2>Registered motorist</h2>
      <label>Motorcycle
        <select value={repeatPlate} onChange={(event) => setRepeatPlate(event.target.value)}>
          <option value="">{revisitable.length ? 'Select a registered motorist' : 'All registered motorists are parked'}</option>
          {revisitable.map((motorist) => <option key={motorist.plate} value={motorist.plate}>{motorist.owner} &mdash; {motorist.plate}</option>)}
        </select>
      </label>

      <fieldset>
        <legend>Slot assignment</legend>
        <div>
          {slotModes.map(([value, label, detail]) => (
            <button key={value} type="button" className={mode === value ? 'chosen' : ''} onClick={() => setMode(value)} aria-pressed={mode === value}>
              <b>{label}</b><small>{detail}</small>
            </button>
          ))}
        </div>
      </fieldset>
      {mode === 'auto' ? (
        <div className="auto-slot">
          <i aria-hidden="true">P</i>
          <span><small>SLOT ASSIGNMENT</small><b>Auto - nearest open slot</b><em>Next: {nearest || 'none available'}</em></span>
        </div>
      ) : (
        <label>Slot *
          <select value={selectedSpace || ''} onChange={(event) => onSlotChange?.(event.target.value)} required>
            <option value="" disabled>{availableSpaces.length ? `Select an available slot (${availableSpaces.length})` : 'No available slots'}</option>
            {availableSpaces.map((space) => <option key={space.id} value={space.id}>{space.id} — Row {space.id[0]}</option>)}
          </select>
        </label>
      )}
      <button className="park-action" type="submit" disabled={!repeatPlate || logging}>{logging ? 'Parking...' : 'Park motorcycle'} <span aria-hidden="true">&rarr;</span></button>
      {notice && <p className="park-notice park-notice--error" role="alert">{notice}</p>}
      {confirmation && <NoticeModal title="Parked" message={`Motorcycle is parked successfully in slot ${confirmation.slot}.`} onClose={() => setConfirmation(null)} />}
    </form>
  );
}
