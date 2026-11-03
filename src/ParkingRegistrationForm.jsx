import { useState } from 'react';

const classifications = [
  ['Student', 'Student ID required'],
  ['School Staff', 'Department and faculty ID'],
  ['Visitor', 'Walk-in visitor'],
];

export default function ParkingRegistrationForm({ selectedSpace, onUseAuto, onRegistered }) {
  const [classification, setClassification] = useState('Student');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setNotice('');
    try {
      const record = await onRegistered?.({
        motorcycleType: form.get('motorcycleType'),
        plate: form.get('plate'),
        ownerName: form.get('ownerName'),
        classification,
        studentId: form.get('studentId'),
        slot: selectedSpace || 'A4',
      });
      setNotice(record ? `Temporary session record created for ${record.slot}. It is not saved to a database.` : 'Parking record could not be prepared.');
    } catch {
      setNotice('The temporary record could not be prepared. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="motorcycle-form" onSubmit={submit}>
      <div className="form-kicker">NEW RECORD <em>&bull; LIVE</em></div>
      <h2>Park a motorcycle</h2>

      <label>Motorcycle type *
        <select name="motorcycleType" defaultValue="" required>
          <option value="" disabled>Select scooter, underbone, or sport bike</option>
          <option>Scooter</option><option>Underbone</option><option>Sport bike</option>
        </select>
      </label>
      <label>Motorcycle license plate *<input name="plate" required placeholder="ABC-1234" /></label>
      <label>Owner name *<input name="ownerName" required placeholder="Full name" /></label>

      <fieldset>
        <legend>Classification *</legend>
        <div>
          {classifications.map(([label, detail]) => (
            <button key={label} type="button" className={classification === label ? 'chosen' : ''} onClick={() => setClassification(label)} aria-pressed={classification === label}>
              <b>{label}</b><small>{detail}</small>
            </button>
          ))}
        </div>
      </fieldset>

      <label>{classification === 'Student' ? 'Student ID' : `${classification} ID`} *<input name="studentId" placeholder="2024-01234" /></label>
      <div className="auto-slot">
        <i aria-hidden="true">P</i>
        <span><small>SLOT ASSIGNMENT</small><b>Auto - nearest open slot</b><em>Next: {selectedSpace || 'A4'} in row A</em></span>
        <button type="button" onClick={onUseAuto}>Use auto</button>
      </div>
      <button className="park-action" type="submit" disabled={submitting}>{submitting ? 'Preparing record...' : 'Park motorcycle'} <span aria-hidden="true">&rarr;</span></button>
      {notice && <p className="park-notice" role="status">{notice}</p>}
    </form>
  );
}
