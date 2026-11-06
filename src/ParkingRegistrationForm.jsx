import { useState } from 'react';
import NoticeModal from './NoticeModal';

const classifications = [
  ['Student', 'Student ID required'],
  ['School Staff', 'Department and faculty ID'],
  ['Visitor', 'Walk-in visitor'],
];

export default function ParkingRegistrationForm({ onRegistered }) {
  const [classification, setClassification] = useState('Student');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null); // { owner, plate }

  const submit = async (event) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    setSubmitting(true);
    setNotice('');
    try {
      const clean = (key) => String(form.get(key) ?? '').trim().replace(/\s+/g, ' ');
      // One string keeps the bike visible everywhere: "Underbone · Honda Click 125 - Silver".
      const model = `${clean('motorcycleType')} · ${clean('brand')} ${clean('bikeModel')} - ${clean('color')}`;
      const owner = clean('ownerName');
      const plate = clean('plate');
      await onRegistered?.({
        motorcycleType: model,
        plate,
        ownerName: owner,
        classification,
        studentId: clean('studentId'),
        contact: clean('contact'),
      });
      setConfirmation({ owner, plate });
      formEl.reset();
    } catch (registerError) {
      setNotice(registerError instanceof Error ? registerError.message : 'The motorist could not be registered. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="motorcycle-form" onSubmit={submit}>
      <div className="form-kicker">NEW RECORD</div>
      <h2>New Motorist</h2>

      <div className="form-grid">
        <label>Motorcycle type *<input name="motorcycleType" required maxLength={20} placeholder="e.g. Scooter" /></label>
        <label>Motorcycle brand *<input name="brand" required maxLength={25} placeholder="e.g. Honda" /></label>
        <label>Motorcycle color *<input name="color" required maxLength={15} placeholder="e.g. Silver" /></label>
        <label>Motorcycle model *<input name="bikeModel" required maxLength={40} placeholder="e.g. Click 125" /></label>
        <label>License plate *<input name="plate" required maxLength={20} placeholder="ABC-1234" /></label>
      </div>
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
      <label>Owner contact *<input name="contact" type="tel" required placeholder="0917 000 0000" /></label>

      <button className="park-action" type="submit" disabled={submitting}>{submitting ? 'Registering...' : 'Register motorist'} <span aria-hidden="true">&rarr;</span></button>
      {notice && <p className="park-notice park-notice--error" role="alert">{notice}</p>}
      {confirmation && <NoticeModal title="Registration complete" message={`New motorist is now registered — ${confirmation.plate} (${confirmation.owner}).`} onClose={() => setConfirmation(null)} />}
    </form>
  );
}
