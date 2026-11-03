import { useEffect, useState } from 'react';
import IntroAnimation from './IntroAnimation';
import SignupPage from './SignupPage';
import OverviewPage from './OverviewPage';
import ParkingSpacesPage from './ParkingSpacesPage';

const routes = new Set(['/', '/overview', '/parking-spaces']);

function getPathname() {
  return routes.has(window.location.pathname) ? window.location.pathname : '/';
}

export default function App() {
  const [stage, setStage] = useState('intro');
  const [path, setPath] = useState(getPathname);

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

  if (path === '/overview') return <OverviewPage onNavigate={navigate} />;
  if (path === '/parking-spaces') return <ParkingSpacesPage onNavigate={navigate} />;

  return (
    <main className="app-shell">
      {stage !== 'intro' && <SignupPage entering={stage === 'transition'} onSuccess={() => navigate('/overview')} />}
      {stage !== 'signin' && <IntroAnimation onStageChange={setStage} />}
    </main>
  );
}
