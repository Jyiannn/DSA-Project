import { useEffect, useState } from 'react';

export default function IntroAnimation({ onStageChange }) {
  const [phase, setPhase] = useState('ready');

  useEffect(() => {
    const schedule = [
      [80, () => setPhase('driving')],
      [1640, () => setPhase('revealing')],
      [2240, () => {
        setPhase('splitting');
        onStageChange('transition');
      }],
      [2860, () => onStageChange('signin')],
    ];
    const timers = schedule.map(([delay, callback]) => window.setTimeout(callback, delay));
    return () => timers.forEach(window.clearTimeout);
  }, [onStageChange]);

  return (
    <section className={`intro intro--${phase}`} aria-label="Parkganern introduction">
      <div className="intro__roadway" aria-hidden="true">
        <span className="intro__road" />
        <img className="intro__car" src="/assets/car.png" alt="" />
      </div>
      <img className="intro__seal" src="/assets/university-seal.png" alt="" />
    </section>
  );
}
