import { useEffect, useState } from 'react';
import DashboardShell from './DashboardShell';
import MotorcycleSlot from './MotorcycleSlot';
import ParkingRegistrationForm from './ParkingRegistrationForm';
import RegisteredMotoristForm from './RegisteredMotoristForm';
import useAsyncResource from './hooks/useAsyncResource';
import LiveClock from './LiveClock';
import { getDashboardOverview } from './services/dashboardService';
import { registerMotorist, logRevisit, vacateParkingSpace } from './services/parkingService';

function ResourceState({ error, onRetry, label }) {
  if (error) return <div className="resource-state resource-state--error"><b>Unable to load {label}.</b><span>{error}</span><button onClick={onRetry}>Try again</button></div>;
  return <div className="resource-state"><i /><span>Loading {label}...</span></div>;
}

export default function DashboardPage({ onNavigate, onLogout }) {
  const { data, loading, error, reload } = useAsyncResource(() => getDashboardOverview(), []);
  const [spaces, setSpaces] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [boardNotice, setBoardNotice] = useState('');

  useEffect(() => {
    if (!data) return;
    setSpaces(data.spaces);
    setRecentActivity(data.recentActivity);
    setSelectedSpace((current) => current || data.spaces.find((space) => space.status === 'available')?.id || '');
  }, [data]);

  const registerNew = async (payload) => {
    // Registration only saves the motorist; parking is a separate action from the Registered box.
    const motorist = await registerMotorist(payload);
    reload(); // Refresh the registered-motorist list and the saved totals.
    return motorist;
  };

  const vacateSpace = async (slot) => {
    try {
      const record = await vacateParkingSpace(slot);
      setSpaces((current) => current.map((space) => space.id === slot ? { ...space, status: 'available' } : space));
      setRecentActivity((current) => current.map((item) => item.id === record.id ? record : item));
      setBoardNotice(`Slot ${slot} vacated at ${record.timeOut}.`);
      reload(); // Refresh the server-side statistics so the totals match the board.
    } catch (vacateError) {
      setBoardNotice(vacateError instanceof Error ? vacateError.message : 'The slot could not be vacated.');
    }
  };

  const logRepeat = async (plate, slot) => {
    const record = await logRevisit(plate, slot);
    setRecentActivity((current) => [record, ...current]);
    setSpaces((current) => current.map((space) => space.id === record.slot ? { ...space, status: 'occupied' } : space));
    // The auto-picked slot may be the one still marked selected; occupied slots can't be selected.
    setSelectedSpace('');
    reload(); // Refresh statistics and the saved-motorist list.
    return record;
  };

  const visibleActivity = showAll ? recentActivity : recentActivity.slice(0, 3);
  return (
    <DashboardShell page="dashboard" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="prototype-page overview-prototype">
        <header className="page-title"><div><p>OPERATIONS CENTER</p><div className="title-row"><h1>Parking Dashboard</h1><LiveClock /></div></div></header>
        {loading && !data ? <ResourceState label="dashboard" /> : error ? <ResourceState error={error} label="dashboard" onRetry={reload} /> : <>
          <section className="overview-stats" aria-label="Parking summary">
            {data.statistics.map((statistic) => <article key={statistic.id} className={statistic.tone === 'success' ? 'available' : ''}><span>{statistic.label}</span><b>{statistic.value}</b><small>{statistic.detail}</small></article>)}
          </section>
          <section className="overview-board" aria-label="Motorcycle parking board">
            <article className="parking-board"><header><div><span>Motorcycle parking</span><small>Choose an available space</small></div><i><b />Live occupancy</i></header>{boardNotice && <p className="board-notice">{boardNotice}</p>}<div className="motorcycle-grid">{spaces.map((space) => <MotorcycleSlot key={space.id} space={space} occupant={(data.occupants || []).find((record) => record.slot === space.id)} selected={selectedSpace === space.id} onSelect={setSelectedSpace} onVacate={vacateSpace} />)}</div><footer><span><i /> Available</span><span><i /> Occupied</span></footer></article>
            <div className="form-stack">
              <RegisteredMotoristForm motorists={data.motorists || []} spaces={spaces} selectedSpace={selectedSpace} onSlotChange={setSelectedSpace} onPark={logRepeat} />
              <ParkingRegistrationForm onRegistered={registerNew} />
            </div>
          </section>
          <section className="activity-panel"><header><div><p>LIVE LOG</p><h2>Recent Parking Activity</h2></div><button onClick={() => setShowAll((current) => !current)}>{showAll ? 'Show less' : 'View all activity'} <span>&rarr;</span></button></header><div className="activity-header"><span>Vehicle</span><span>Driver</span><span>Provided ID</span><span>Classification</span><span>Contact details</span><span>Time in</span><span>Time out</span></div>{visibleActivity.length ? visibleActivity.map((record) => <div className="prototype-activity" key={record.id}><span><i>MC</i><b>{record.plate}<small>{record.model}</small></b></span><span>{record.driver}</span><span>{record.studentId || 'Not provided'}</span><span>{record.classification || 'Not provided'}</span><span>{record.contact}</span><span>{record.timeIn}</span><span>{record.timeOut || '—'}</span></div>) : <p className="empty-records">No parking activity is available.</p>}</section>
        </>}
      </div>
    </DashboardShell>
  );
}
