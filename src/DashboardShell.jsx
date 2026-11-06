import useAsyncResource from './hooks/useAsyncResource';
import { getCurrentUser } from './services/userService';

export default function DashboardShell({ page, onNavigate, onLogout, children }) {
  const { data: user, loading } = useAsyncResource(getCurrentUser, []);
  return (
    <div className="prototype-shell">
      <aside className="prototype-sidebar">
        <button className="prototype-brand" onClick={() => onNavigate('/dashboard')} aria-label="Go to dashboard">
          <img src="assets/university-seal.png" alt="University of Dagupan" />
          <span><b>PARK</b><strong>GANERN</strong></span>
        </button>
        <div className="prototype-operator" aria-busy={loading}>
          <b>{user?.initials || '...'}</b>
          <span>{user?.fullName || 'Loading user'}<small>{user?.role || 'Loading profile'}</small></span>
          <button className="logout-button" type="button" onClick={onLogout} title="Sign out">Sign out</button>
        </div>
        <nav aria-label="Primary navigation">
          <button className={page === 'dashboard' ? 'is-active' : ''} onClick={() => onNavigate('/dashboard')} aria-current={page === 'dashboard' ? 'page' : undefined}>Dashboard</button>
          <button className={page === 'records' ? 'is-active' : ''} onClick={() => onNavigate('/records')} aria-current={page === 'records' ? 'page' : undefined}>Records</button>
        </nav>
      </aside>
      <main className="prototype-workspace">{children}</main>
    </div>
  );
}
