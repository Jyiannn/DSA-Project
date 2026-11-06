import { useEffect, useState } from 'react';
import IntroAnimation from './IntroAnimation';
import SignupPage from './SignupPage';
import DashboardPage from './DashboardPage';
import RecordsPage from './RecordsPage';
import { getSession, logout } from './services/authService';

// Vite's base is '/DSA-Project/' under XAMPP; strip it so route logic stays app-relative.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const routes = new Set(['/', '/dashboard', '/records']);
// Old links keep working after the tab rename.
const legacy = { '/overview': '/dashboard', '/parking-spaces': '/records' };

function getPathname() {
  const path = window.location.pathname;
  const local = path.startsWith(BASE) ? path.slice(BASE.length) : path;
  const mapped = legacy[local] ?? local;
  return routes.has(mapped) ? mapped : '/';
}

export default function App() {
  const [stage, setStage] = useState(() => getSession() ? 'signin' : 'intro');
  const [path, setPath] = useState(getPathname);
  const [session, setSession] = useState(getSession);

  useEffect(() => {
    const syncPath = () => setPath(getPathname());
    window.addEventListener('popstate', syncPath);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) setStage('signin');
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  const navigate = (to) => {
    if (to === path) return;
    window.history.pushState({}, '', BASE + to);
    setPath(to);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (session && path === '/') navigate('/dashboard');
  }, [path, session]);

  const beginSession = (nextSession) => {
    setSession(nextSession);
    setStage('signin');
    navigate('/dashboard');
  };

  const endSession = () => {
    logout();
    setSession(null);
    setStage('signin');
    window.history.pushState({}, '', BASE + '/');
    setPath('/');
  };

  if ((path === '/dashboard' || path === '/records') && !session) {
    return <main className="app-shell"><SignupPage entering={false} onSuccess={beginSession} /></main>;
  }

  if (path === '/dashboard') return <DashboardPage onNavigate={navigate} onLogout={endSession} />;
  if (path === '/records') return <RecordsPage onNavigate={navigate} onLogout={endSession} />;

  return (
    <main className="app-shell">
      {stage !== 'intro' && <SignupPage entering={stage === 'transition'} onSuccess={beginSession} />}
      {stage !== 'signin' && <IntroAnimation onStageChange={setStage} />}
    </main>
  );
}
