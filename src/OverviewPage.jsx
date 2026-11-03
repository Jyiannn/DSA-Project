import { useEffect, useState } from 'react';
import DashboardShell from './DashboardShell';
import MotorcycleSlot from './MotorcycleSlot';
import ParkingRegistrationForm from './ParkingRegistrationForm';
import useAsyncResource from './hooks/useAsyncResource';
import { getDashboardOverview } from './services/dashboardService';
import { createParkingRecord } from './services/parkingService';

function ResourceState({ error, onRetry, label }) {
  if (error) return <div className="resource-state resource-state--error"><b>Unable to load {label}.</b><span>{error}</span><button onClick={onRetry}>Try again</button></div>;
  return <div className="resource-state"><i /><span>Loading {label}...</span></div>;
}

export default function OverviewPage({ onNavigate, onLogout }) {
  const { data, loading, error, reload } = useAsyncResource(getDashboardOverview, []);
  const [spaces, setSpaces] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!data) return;
    setSpaces(data.spaces);
    setRecentActivity(data.recentActivity);
    setSelectedSpace((current) => current || data.spaces.find((space) => space.status === 'available')?.id || '');
  }, [data]);

  const addTemporaryRecord = async (payload) => {
    const record = await createParkingRecord(payload);
    setRecentActivity((current) => [record, ...current]);
    setSpaces((current) => current.map((space) => space.id === record.slot ? { ...space, status: 'occupied' } : space));
    setSelectedSpace('');
    return record;
  };

  const visibleActivity = showAll ? recentActivity : recentActivity.slice(0, 3);

  return (
    <DashboardShell page="overview" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="prototype-page overview-prototype">
        <header className="page-title"><div><p>OPERATIONS CENTER</p><h1>Parking Overview</h1></div><button onClick={() => onNavigate('/parking-spaces')}>Manage spaces <span>&rarr;</span></button></header>
        {loading && !data ? <ResourceState label="dashboard" /> : error ? <ResourceState error={error} label="dashboard" onRetry={reload} /> : <>
          <section className="overview-stats" aria-label="Parking summary">
            {data.statistics.map((statistic) => <article key={statistic.id} className={statistic.tone === 'success' ? 'available' : ''}><span>{statistic.label}</span><b>{statistic.value}</b><small>{statistic.detail}</small></article>)}
          </section>
          <section className="overview-board" aria-label="Motorcycle parking board">
            <article className="parking-board"><header><div><span>Motorcycle parking</span><small>Choose an available space</small></div><i><b />Live occupancy</i></header><div className="motorcycle-grid">{spaces.map((space) => <MotorcycleSlot key={space.id} space={space} selected={selectedSpace === space.id} onSelect={setSelectedSpace} />)}</div><footer><span><i /> Available</span><span><i /> Occupied</span></footer></article>
            <ParkingRegistrationForm selectedSpace={selectedSpace} onUseAuto={() => setSelectedSpace(spaces.find((space) => space.status === 'available')?.id || '')} onRegistered={addTemporaryRecord} />
          </section>
          <section className="activity-panel"><header><div><p>LIVE LOG</p><h2>Recent Parking Activity</h2></div><button onClick={() => setShowAll((current) => !current)}>{showAll ? 'Show less' : 'View all activity'} <span>&rarr;</span></button></header><div className="activity-header"><span>Vehicle</span><span>Driver</span><span>Contact details</span></div>{visibleActivity.length ? visibleActivity.map((record) => <div className="prototype-activity" key={record.id}><span><i>MC</i><b>{record.plate}<small>{record.model}</small></b></span><span>{record.driver}</span><span>{record.contact}</span></div>) : <p className="empty-records">No parking activity is available.</p>}</section>
        </>}
      </div>
    </DashboardShell>
  );
}
