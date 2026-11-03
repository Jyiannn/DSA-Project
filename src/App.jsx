import { useEffect, useState } from 'react';
import IntroAnimation from './IntroAnimation';
import SignupPage from './SignupPage';
import OverviewPage from './OverviewPage';
import ParkingSpacesPage from './ParkingSpacesPage';
import { getDemoSession, logoutDemoAccount } from './services/authService';

const routes = new Set(['/', '/overview', '/parking-spaces']);

function getPathname() {
  return routes.has(window.location.pathname) ? window.location.pathname : '/';
}

export default function App() {
  const [stage, setStage] = useState(() => getDemoSession() ? 'signin' : 'intro');
  const [path, setPath] = useState(getPathname);
  const [session, setSession] = useState(getDemoSession);

  useEffect(() => {
    const syncPath = () => setPath(getPathname());
    window.addEventListener('popstate', syncPath);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) setStage('signin');
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  const navigate = (to) => {
    if (to === path) return;
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (session && path === '/') navigate('/overview');
  }, [path, session]);

  const beginSession = (nextSession) => {
    setSession(nextSession);
    setStage('signin');
    navigate('/overview');
  };

  const endSession = () => {
    logoutDemoAccount();
    setSession(null);
    setStage('signin');
    window.history.pushState({}, '', '/');
    setPath('/');
  };

  if ((path === '/overview' || path === '/parking-spaces') && !session) {
    return <main className="app-shell"><SignupPage entering={false} onSuccess={beginSession} /></main>;
  }

  if (path === '/overview') return <OverviewPage onNavigate={navigate} onLogout={endSession} />;
  if (path === '/parking-spaces') return <ParkingSpacesPage onNavigate={navigate} onLogout={endSession} />;

  return (
    <main className="app-shell">
      {stage !== 'intro' && <SignupPage entering={stage === 'transition'} onSuccess={beginSession} />}
      {stage !== 'signin' && <IntroAnimation onStageChange={setStage} />}
    </main>
  );
}
