import { useEffect, useState } from 'react';

const classifications = ['Student', 'School Staff', 'Visitor'];

export default function EditMotoristModal({ motorist, onClose, onSave }) {
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const clean = (key) => String(form.get(key) ?? '').trim().replace(/\s+/g, ' ');
    setSaving(true);
    setNotice('');
    try {
      await onSave({
        plate: clean('plate'),
        model: clean('model'),
        owner: clean('owner'),
        studentId: clean('studentId'),
        contact: clean('contact'),
        classification: String(form.get('classification') ?? 'Student'),
      });
    } catch (saveError) {
      setNotice(saveError instanceof Error ? saveError.message : 'The motorist could not be saved. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <form className="modal-card modal-card--form" role="dialog" aria-modal="true" aria-labelledby="edit-motorist-title" onClick={(event) => event.stopPropagation()} onSubmit={submit}>
        <h3 id="edit-motorist-title">Edit saved motorist</h3>
        <p className="modal-form-sub">Changes apply to {motorist.plate}. Editing the plate re-links visit history to the new plate.</p>
        <div className="modal-form-grid">
          <label>License plate *<input name="plate" required maxLength={20} defaultValue={motorist.plate} /></label>
          <label>Owner name *<input name="owner" required maxLength={150} defaultValue={motorist.owner} /></label>
        </div>
        <label>Motorcycle *<input name="model" required maxLength={100} defaultValue={motorist.model} /></label>
        <div className="modal-form-grid">
          <label>ID number<input name="studentId" maxLength={40} defaultValue={motorist.studentId || ''} placeholder="2024-01234" /></label>
          <label>Contact *<input name="contact" required maxLength={40} type="tel" defaultValue={motorist.contact || ''} /></label>
        </div>
        <label>Classification<select name="classification" defaultValue={motorist.classification}>{classifications.map((option) => <option key={option}>{option}</option>)}</select></label>
        {notice && <p className="park-notice park-notice--error" role="alert">{notice}</p>}
        <div className="modal-form-actions">
          <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="park-action" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
        </div>
      </form>
    </div>
  );
}
