import useAsyncResource from './hooks/useAsyncResource';
import { getCurrentUser } from './services/userService';

export default function DashboardShell({ page, onNavigate, onLogout, children }) {
  const { data: user, loading } = useAsyncResource(getCurrentUser, []);
  return (
    <div className="prototype-shell">
      <aside className="prototype-sidebar">
        <button className="prototype-brand" onClick={() => onNavigate('/overview')} aria-label="Go to overview">
          <img src="/assets/university-seal.png" alt="University of Dagupan" />
          <span><b>PARK</b><strong>GANERN</strong></span>
        </button>
        <nav aria-label="Primary navigation">
          <button className={page === 'overview' ? 'is-active' : ''} onClick={() => onNavigate('/overview')} aria-current={page === 'overview' ? 'page' : undefined}>Overview</button>
          <button className={page === 'parking-spaces' ? 'is-active' : ''} onClick={() => onNavigate('/parking-spaces')} aria-current={page === 'parking-spaces' ? 'page' : undefined}>Parking Spaces</button>
        </nav>
        <div className="prototype-operator" aria-busy={loading}>
          <b>{user?.initials || '...'}</b>
          <span>{user?.fullName || 'Loading user'}<small>{user?.role || 'Loading profile'}</small></span>
          <button className="logout-button" type="button" onClick={onLogout} title="Sign out">Sign out</button>
        </div>
      </aside>
      <main className="prototype-workspace">{children}</main>
    </div>
  );
}
