import { useEffect, useState } from 'react';

export default function RemoveMotoristModal({ motorist, onClose, onConfirm }) {
  const [notice, setNotice] = useState('');
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const confirm = async () => {
    setRemoving(true);
    setNotice('');
    try {
      await onConfirm();
    } catch (removeError) {
      setNotice(removeError instanceof Error ? removeError.message : 'The record could not be removed. Please try again.');
      setRemoving(false);
    }
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div className="modal-card modal-card--danger" role="alertdialog" aria-modal="true" aria-labelledby="remove-motorist-title" onClick={(event) => event.stopPropagation()}>
        <i className="modal-danger" aria-hidden="true">!</i>
        <h3 id="remove-motorist-title">Remove saved record?</h3>
        <p className="modal-form-sub">This permanently deletes the saved profile for <b>{motorist.owner}</b> — {motorist.plate} ({motorist.model}). This cannot be undone.</p>
        <ul className="remove-detail">
          <li><span>Classification</span><b>{motorist.classification}</b></li>
          <li><span>ID number</span><b>{motorist.studentId || 'Not provided'}</b></li>
          <li><span>Contact</span><b>{motorist.contact || 'Not provided'}</b></li>
          <li><span>Visits logged</span><b>{motorist.visits}</b></li>
        </ul>
        <p className="remove-note">Past parking history is kept — only the saved motorist profile is removed.{motorist.currentSlot && ` This motorcycle is currently parked in slot ${motorist.currentSlot}; removing the record does not vacate it.`}</p>
        {notice && <p className="park-notice park-notice--error" role="alert">{notice}</p>}
        <div className="modal-form-actions">
          <button type="button" className="modal-cancel" onClick={onClose} autoFocus>Cancel</button>
          <button type="button" className="danger-action" onClick={confirm} disabled={removing}>{removing ? 'Removing...' : 'Remove record'}</button>
        </div>
      </div>
    </div>
  );
}
