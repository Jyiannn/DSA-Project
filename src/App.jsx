import { useEffect, useState } from 'react';
import IntroAnimation from './IntroAnimation';
import SignupPage from './SignupPage';

export default function App() {
  const [stage, setStage] = useState('intro');

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) setStage('signin');
  }, []);

  return (
    <main className="app-shell">
      {stage !== 'intro' && <SignupPage entering={stage === 'transition'} />}
      {stage !== 'signin' && <IntroAnimation onStageChange={setStage} />}
    </main>
  );
}
