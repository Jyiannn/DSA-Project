import { useEffect } from 'react';

export default function NoticeModal({ title, message, onClose }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="notice-title" onClick={(event) => event.stopPropagation()}>
        <i className="modal-check" aria-hidden="true">&#10003;</i>
        <h3 id="notice-title">{title}</h3>
        <p>{message}</p>
        <button className="park-action" type="button" onClick={onClose} autoFocus>OK</button>
      </div>
    </div>
  );
}
