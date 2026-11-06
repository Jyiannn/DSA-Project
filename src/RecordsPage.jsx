import { useEffect, useState } from 'react';
import DashboardShell from './DashboardShell';
import useAsyncResource from './hooks/useAsyncResource';
import CalendarPanel from './CalendarPanel';
import { getRecordsPageData, updateMotorist, deleteMotorist } from './services/parkingService';
import EditMotoristModal from './EditMotoristModal';
import RemoveMotoristModal from './RemoveMotoristModal';

function ResourceState({ error, onRetry }) {
  if (error) return <div className="resource-state resource-state--error"><b>Unable to load records.</b><span>{error}</span><button onClick={onRetry}>Try again</button></div>;
  return <div className="resource-state"><i /><span>Loading records...</span></div>;
}

const matchesQuery = (values, query) => values.filter(Boolean).join(' ').toLowerCase().includes(query);

export default function RecordsPage({ onNavigate, onLogout }) {
  const { data, loading, error, reload } = useAsyncResource(getRecordsPageData, []);
  const [motorists, setMotorists] = useState([]);
  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState('');
  const [historyQuery, setHistoryQuery] = useState('');
  const [historySort, setHistorySort] = useState('newest');
  const [ownerOrder, setOwnerOrder] = useState('default');
  const [classFilter, setClassFilter] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const [slotFilter, setSlotFilter] = useState('All');
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (!data) return;
    setMotorists(data.motorists);
    setRecords(data.records);
  }, [data]);

  const normalizedQuery = query.trim().toLowerCase();
  const recordNumber = (motorist) => Number(String(motorist.id || '').replace(/\D/g, '')) || 0;
  const shownMotorists = motorists
    .filter((motorist) => (classFilter === 'All' || motorist.classification === classFilter) && (!normalizedQuery || matchesQuery([motorist.plate, motorist.model, motorist.owner, motorist.studentId, motorist.contact, motorist.classification], normalizedQuery)))
    .sort((a, b) => {
      if (ownerOrder === 'asc') return String(a.owner).localeCompare(String(b.owner), undefined, { numeric: true });
      if (ownerOrder === 'desc') return String(b.owner).localeCompare(String(a.owner), undefined, { numeric: true });
      return recordNumber(a) - recordNumber(b);
    });

  const normalizedHistoryQuery = historyQuery.trim().toLowerCase();
  const slots = [...new Set(records.map((record) => record.slot).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  const shownRecords = records.filter((record) => {
    if (filterDate && !record.enteredAt?.startsWith(filterDate)) return false;
    if (slotFilter !== 'All' && record.slot !== slotFilter) return false;
    const timeIn = record.enteredAt?.slice(11, 16) ?? '';
    if (timeFrom && timeIn < timeFrom) return false;
    if (timeTo && timeIn > timeTo) return false;
    if (normalizedHistoryQuery && !matchesQuery([record.plate, record.model, record.driver, record.studentId, record.contact, record.classification, record.slot], normalizedHistoryQuery)) return false;
    return true;
  })
  .sort((a, b) => {
    const timeOfDay = (record) => record.enteredAt?.slice(11, 16) ?? '';
    if (historySort === 'name-asc') return a.driver.localeCompare(b.driver);
    if (historySort === 'name-desc') return b.driver.localeCompare(a.driver);
    if (historySort === 'time-asc') return timeOfDay(a).localeCompare(timeOfDay(b)) || a.driver.localeCompare(b.driver);
    if (historySort === 'time-desc') return timeOfDay(b).localeCompare(timeOfDay(a)) || a.driver.localeCompare(b.driver);
    return 0;
  });
  const historyFiltered = Boolean(filterDate || normalizedHistoryQuery || slotFilter !== 'All' || timeFrom || timeTo);
  const clearHistoryFilters = () => { setFilterDate(''); setHistoryQuery(''); setHistorySort('newest'); setSlotFilter('All'); setTimeFrom(''); setTimeTo(''); };
  const formatDate = (iso) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };

  return (
    <DashboardShell page="records" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="prototype-page">
        <header className="page-title"><div><p>RECORD DESK</p><h1>Records</h1></div></header>
        {loading && !data ? <ResourceState /> : error ? <ResourceState error={error} onRetry={reload} /> : <>
          <section className="records-panel" aria-label="Saved motorcycles and owners">
            <header className="records-heading"><div><p>SAVED MOTORISTS</p><h2>Motorcycle &amp; Owner Records</h2></div><span>{shownMotorists.length} saved</span></header>
            <div className="records-controls records-controls--records"><label className="record-search">Search<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Motorcycle, name, ID/contact, classification..." />{query && <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setQuery('')}>&times;</button>}</label><label>Owner<select value={ownerOrder} onChange={(event) => setOwnerOrder(event.target.value)}><option value="default">Default (Record ID)</option><option value="asc">Ascending</option><option value="desc">Descending</option></select></label><label>Classification<select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}><option value="All">All</option><option>Student</option><option>School Staff</option><option>Visitor</option></select></label></div>
            <div className="records-table records-table--motorists">
              <div className="records-labels"><span>Record ID</span><span>Motorcycle</span><span>Owner</span><span>Student ID</span><span>Contact</span><span>Classification</span><span>Actions</span></div>
              {shownMotorists.length ? shownMotorists.map((motorist) => (
                <div className="record-row" key={motorist.plate}>
                  <span className="record-id">#{Number(String(motorist.id || '').replace(/\D/g, '')) || 0}</span>
                  <span className="record-bike"><i>MC</i><b>{motorist.plate}<small>{motorist.model}</small></b></span>
                  <span>{motorist.owner}</span>
                  <span>{motorist.studentId || 'Not provided'}</span>
                  <span>{motorist.contact || 'Not provided'}</span>
                  <span>{motorist.classification}</span>
                  <span className="row-actions"><button type="button" className="row-action" onClick={() => setEditing(motorist)} aria-label={`Edit ${motorist.owner} (${motorist.plate})`}>Edit</button><button type="button" className="row-action row-action--danger" onClick={() => setRemoving(motorist)} aria-label={`Remove ${motorist.owner} (${motorist.plate})`}>Remove</button></span>
                </div>
              )) : <p className="empty-records">No saved motorcycles match that search.</p>}
            </div>
          </section>
          <section className="records-panel" aria-label="Logged parking visits">
            <header className="records-heading"><div><p>PARKING HISTORY</p><h2>Logged Visits</h2></div><span>{historyFiltered ? `${shownRecords.length} filtered` : `${records.length} entries`}</span></header>
            <CalendarPanel filterDate={filterDate} onFilterChange={setFilterDate} />
            <div className="records-controls records-controls--history"><label className="record-search">Search<input value={historyQuery} onChange={(event) => setHistoryQuery(event.target.value)} placeholder="Motorcycle, name, ID/contact, slot, classification..." />{historyQuery && <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setHistoryQuery('')}>&times;</button>}</label><label>Slot<select value={slotFilter} onChange={(event) => setSlotFilter(event.target.value)}><option value="All">All</option>{slots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select></label><label>From<input type="time" value={timeFrom} onChange={(event) => setTimeFrom(event.target.value)} aria-label="Time in from" /></label><label>To<input type="time" value={timeTo} onChange={(event) => setTimeTo(event.target.value)} aria-label="Time in to" /></label><label>Sort<select value={historySort} onChange={(event) => setHistorySort(event.target.value)}><option value="newest">Newest first</option><option value="time-asc">Time in (Ascending)</option><option value="time-desc">Time in (Descending)</option><option value="name-asc">Name (Ascending)</option><option value="name-desc">Name (Descending)</option></select></label></div>
            {historyFiltered && <p className="board-notice" role="status">Showing {shownRecords.length} visit{shownRecords.length === 1 ? '' : 's'} on the selected filter. <button className="inline-clear" type="button" onClick={clearHistoryFilters}>Clear filters</button></p>}
            <div className="records-table records-table--history">
              <div className="records-labels"><span>Date</span><span>Motorcycle</span><span>Name</span><span>Slot</span><span>Time in</span><span>Time out</span></div>
              {shownRecords.length ? shownRecords.map((record) => <div className="record-row" key={record.id}><span className="record-date">{formatDate(record.enteredAt)}</span><span className="record-bike"><i>MC</i><b>{record.plate}<small>{record.model}</small></b></span><span>{record.driver}</span><span>{record.slot}</span><span>{record.timeIn}</span><span>{record.timeOut || '—'}</span></div>) : <p className="empty-records">{historyFiltered ? 'No visits match that filter.' : 'No visits logged yet.'}</p>}
            </div>
          </section>
        </>}
        {editing && <EditMotoristModal motorist={editing} onClose={() => setEditing(null)} onSave={async (values) => { await updateMotorist(editing.id, values); setEditing(null); reload(); }} />}
        {removing && <RemoveMotoristModal motorist={removing} onClose={() => setRemoving(null)} onConfirm={async () => { await deleteMotorist(removing.id); setRemoving(null); reload(); }} />}
      </div>
    </DashboardShell>
  );
}
