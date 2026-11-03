import { useEffect, useMemo, useState } from 'react';
import DashboardShell from './DashboardShell';
import MotorcycleSlot from './MotorcycleSlot';
import ParkingRegistrationForm from './ParkingRegistrationForm';
import useAsyncResource from './hooks/useAsyncResource';
import { getParkingSpacesPageData, createParkingRecord } from './services/parkingService';

function ResourceState({ error, onRetry }) {
  if (error) return <div className="resource-state resource-state--error"><b>Unable to load parking spaces.</b><span>{error}</span><button onClick={onRetry}>Try again</button></div>;
  return <div className="resource-state"><i /><span>Loading parking spaces...</span></div>;
}

export default function ParkingSpacesPage({ onNavigate, onLogout }) {
  const { data, loading, error, reload } = useAsyncResource(getParkingSpacesPageData, []);
  const [spaces, setSpaces] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState('');
  const [query, setQuery] = useState('');
  const [classification, setClassification] = useState('All classifications');
  const [zone, setZone] = useState('All records');
  const [sortOrder, setSortOrder] = useState('Newest');

  useEffect(() => {
    if (!data) return;
    setSpaces(data.spaces);
    setRecords(data.records);
    setSelectedSpace((current) => current || data.spaces.find((space) => space.status === 'available')?.id || '');
  }, [data]);

  const shownRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...records]
      .filter((record) => !normalizedQuery || Object.values(record).join(' ').toLowerCase().includes(normalizedQuery))
      .filter((record) => classification === 'All classifications' || record.classification === classification)
      .filter((record) => zone === 'All records' || record.slot.startsWith(zone))
      .sort((a, b) => sortOrder === 'Newest' ? b.enteredAt.localeCompare(a.enteredAt) : a.enteredAt.localeCompare(b.enteredAt));
  }, [classification, query, records, sortOrder, zone]);
  const summary = useMemo(() => ({
    available: spaces.filter((space) => space.status === 'available').length,
    occupied: spaces.filter((space) => space.status === 'occupied').length,
  }), [spaces]);

  const addTemporaryRecord = async (payload) => {
    const record = await createParkingRecord(payload);
    setRecords((current) => [record, ...current]);
    setSpaces((current) => current.map((space) => space.id === record.slot ? { ...space, status: 'occupied' } : space));
    setSelectedSpace('');
    return record;
  };

  const clearFilters = () => { setQuery(''); setClassification('All classifications'); setZone('All records'); setSortOrder('Newest'); };

  return (
    <DashboardShell page="parking-spaces" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="prototype-page parking-prototype">
        <header className="page-title"><div><p>SPACE MANAGEMENT</p><h1>Parking Spaces</h1></div><button onClick={() => onNavigate('/overview')}>Back to overview <span>&larr;</span></button></header>
        {loading && !data ? <ResourceState /> : error ? <ResourceState error={error} onRetry={reload} /> : <>
          <section className="parking-stats" aria-label="Parking space summary"><article><span>Available</span><b>{summary.available}</b><small>Spaces ready to assign</small></article><article><span>Occupied</span><b>{summary.occupied}</b><small>Active motorcycle records</small></article></section>
          <section className="parking-spaces-board"><article className="parking-board"><header><div><span>Motorcycle parking</span><small>Tap an available space to select it</small></div><i><b />Live occupancy</i></header><div className="motorcycle-grid">{spaces.map((space) => <MotorcycleSlot key={space.id} space={space} selected={selectedSpace === space.id} onSelect={setSelectedSpace} />)}</div><footer><span><i /> Available</span><span><i /> Occupied</span></footer></article><ParkingRegistrationForm selectedSpace={selectedSpace} onUseAuto={() => setSelectedSpace(spaces.find((space) => space.status === 'available')?.id || '')} onRegistered={addTemporaryRecord} /></section>
          <section className="records-panel"><header className="records-heading"><div><p>RECORD DESK</p><h2>Motorcycle Records</h2></div><span>{shownRecords.length} records shown</span></header><div className="records-controls"><label className="record-search">Search<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Plate, owner, student ID..." /></label><label>Classification<select value={classification} onChange={(event) => setClassification(event.target.value)}><option>All classifications</option><option>Student</option><option>School Staff</option><option>Visitor</option></select></label><label>Status<select value={zone} onChange={(event) => setZone(event.target.value)}><option>All records</option><option>A</option><option>B</option><option>C</option></select></label><label>Sort by<select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option>Newest</option><option>Oldest</option></select></label><button type="button" onClick={clearFilters}>Clear</button></div><div className="records-labels"><span>Motorcycle</span><span>Slot</span><span>Time</span></div>{shownRecords.length ? shownRecords.map((record) => <div className="record-row" key={record.id}><span><i>MC</i><b>{record.plate}<small>{record.model}</small></b></span><span>{record.slot}</span><span>{record.time}</span></div>) : <p className="empty-records">No matching records.</p>}</section>
        </>}
      </div>
    </DashboardShell>
  );
}
