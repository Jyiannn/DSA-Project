import { useState } from 'react';

const DSAS = [
  {
    name: 'Hash Table',
    use: 'Active license plates during entry/exit verification',
    detail: 'Paper: "average-case lookup of active license plates during entry and exit verification." In the system, when a guard types a plate at check-in/check-out, the hash table returns the saved motorist and their current slot without scanning all records.',
    Visual: HashTableVisual,
  },
  {
    name: 'Min-Heap (Priority Queue)',
    use: 'Automatic selection of the lowest-numbered available slot',
    detail: 'Paper: "automatically managing and retrieving the lowest-numbered or closest available parking slot." In the system, on "Park", the heap extracts the minimum free slot (e.g. A1) and re-heapifies in O(log n); vacating pushes the slot back.',
    Visual: MinHeapVisual,
  },
  {
    name: 'Graph (Adjacency List)',
    use: 'Parking zones and routing between entrance and assigned slot',
    detail: 'Paper: "represent parking lot zones and compute routing paths between entrances and assigned slots." In the system, zones A–D and the gate are nodes; the adjacency list drives a shortest-path (BFS/Dijkstra) to guide the motorist to the assigned slot.',
    Visual: GraphVisual,
  },
  {
    name: 'Merge Sort & Binary Search',
    use: 'Sorting transaction logs and searching historical records',
    detail: 'Paper: "sorting transaction logs by date/fee and searching historical records." In the system, the Records tab merge-sorts the parking log by date/fee, and binary search locates a historical record by date or plate in O(log n).',
    Visual: MergeSortVisual,
  },
];

function HashTableVisual() {
  const rows = [
    ['ABC-1234', 'A1', 'Juan D.'],
    ['XYZ-9876', 'B3', 'Maria S.'],
    ['DEF-5555', 'C2', 'Pedro R.'],
  ];
  return (
    <div className="dsa-visual dsa-hash">
      <div className="dsa-hash__head"><span>Key (plate)</span><span>Hash</span><span>Value (slot / owner)</span></div>
      {rows.map(([k, slot, owner]) => (
        <div key={k} className="dsa-hash__row">
          <span className="dsa-hash__key">{k}</span>
          <span className="dsa-hash__hash">h(key)</span>
          <span className="dsa-hash__val">{slot} · {owner}</span>
        </div>
      ))}
      <div className="dsa-hash__note">hash(plate) → bucket → record; collisions chained in the bucket</div>
      <div className="dsa-caption">O(1) average lookup by plate; O(n) worst case</div>
    </div>
  );
}

function MinHeapVisual() {
  const heap = [1, 3, 2, 7, 4, 5, 6];
  return (
    <div className="dsa-visual dsa-heap">
      <div className="dsa-heap__tree">
        <div className="dsa-heap__node dsa-heap__root">{heap[0]}</div>
        <div className="dsa-heap__level">
          <div className="dsa-heap__node">{heap[1]}</div>
          <div className="dsa-heap__node">{heap[2]}</div>
        </div>
        <div className="dsa-heap__level">
          <div className="dsa-heap__node">{heap[3]}</div>
          <div className="dsa-heap__node">{heap[4]}</div>
          <div className="dsa-heap__node">{heap[5]}</div>
          <div className="dsa-heap__node">{heap[6]}</div>
        </div>
      </div>
      <div className="dsa-heap__array">
        <span className="dsa-heap__array-label">array:</span>
        {heap.map((n, i) => (
          <span key={i} className={`dsa-heap__cell ${i === 0 ? 'dsa-heap__cell--root' : ''}`}>{n}</span>
        ))}
      </div>
      <div className="dsa-heap__ops">
        <span>parent(i) = ⌊(i−1)/2⌋</span>
        <span>left(i) = 2i+1</span>
        <span>right(i) = 2i+2</span>
      </div>
      <div className="dsa-caption">Root = lowest free slot (A1); extract-min bubbles up in O(log n)</div>
    </div>
  );
}

function GraphVisual() {
  const adj = [
    ['Gate', 'A, B'],
    ['A', 'Gate, C'],
    ['B', 'Gate, D'],
    ['C', 'A, Slot'],
    ['D', 'B, Slot'],
    ['Slot', 'C, D'],
  ];
  return (
    <div className="dsa-visual dsa-graph">
      <svg viewBox="0 0 260 150" className="dsa-graph__svg" aria-hidden="true">
        <line x1="40" y1="75" x2="100" y2="30" stroke="#9aa7bf" strokeWidth="2" />
        <line x1="40" y1="75" x2="100" y2="120" stroke="#9aa7bf" strokeWidth="2" />
        <line x1="100" y1="30" x2="170" y2="30" stroke="#314383" strokeWidth="3" />
        <line x1="100" y1="120" x2="170" y2="120" stroke="#9aa7bf" strokeWidth="2" />
        <line x1="170" y1="30" x2="220" y2="75" stroke="#314383" strokeWidth="3" />
        <line x1="170" y1="120" x2="220" y2="75" stroke="#9aa7bf" strokeWidth="2" />
        <circle cx="40" cy="75" r="16" fill="#10182e" />
        <text x="40" y="80" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">Gate</text>
        <circle cx="100" cy="30" r="14" fill="#314383" />
        <text x="100" y="34" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">A</text>
        <circle cx="100" cy="120" r="14" fill="#6b7a99" />
        <text x="100" y="124" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">B</text>
        <circle cx="170" cy="30" r="14" fill="#314383" />
        <text x="170" y="34" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">C</text>
        <circle cx="170" cy="120" r="14" fill="#6b7a99" />
        <text x="170" y="124" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">D</text>
        <circle cx="220" cy="75" r="14" fill="#00865a" />
        <text x="220" y="79" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">Slot</text>
      </svg>
      <div className="dsa-adj">
        <div className="dsa-adj__title">Adjacency list</div>
        {adj.map(([n, e]) => (
          <div key={n} className="dsa-adj__row"><b>{n}</b> → {e}</div>
        ))}
      </div>
      <div className="dsa-caption">Highlighted path = shortest route (BFS/Dijkstra) from gate to assigned slot</div>
    </div>
  );
}

function MergeSortVisual() {
  const sorted = [3, 5, 7, 9, 12, 15, 21];
  const mid = 3;
  const steps = [
    { label: 'Split', text: '[3,5,7,9,12,15,21] → [3,5,7] + [9,12,15,21]' },
    { label: 'Merge', text: '[3,5,7] + [9,12,15,21] → [3,5,7,9,12,15,21]' },
    { label: 'Binary search', text: 'mid = 3 (value 9); target 12 > 9 → search right half' },
  ];
  return (
    <div className="dsa-visual dsa-sort">
      <div className="dsa-sort__array">
        {sorted.map((n, i) => (
          <div
            key={i}
            className={`dsa-sort__cell ${i === mid ? 'dsa-sort__cell--mid' : ''} ${i < mid ? 'dsa-sort__cell--left' : ''} ${i > mid ? 'dsa-sort__cell--right' : ''}`}
          >
            {n}
          </div>
        ))}
      </div>
      <div className="dsa-sort__legend">
        <span className="dsa-sort__swatch dsa-sort__swatch--left" /> left half
        <span className="dsa-sort__swatch dsa-sort__swatch--mid" /> mid (target)
        <span className="dsa-sort__swatch dsa-sort__swatch--right" /> right half
      </div>
      <div className="dsa-steps">
        {steps.map((s) => (
          <div key={s.label} className="dsa-step">
            <b>{s.label}:</b> {s.text}
          </div>
        ))}
      </div>
      <div className="dsa-caption">Merge sort orders logs O(n log n); binary search halves the range each step</div>
    </div>
  );
}

export default function DsaOverlay() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="dsa-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Toggle data structures and algorithms overlay"
        title="How the DSAs work"
      >
        {open ? '×' : 'DSA'}
      </button>

      {open && (
        <div className="modal-overlay" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="modal-card modal-card--form dsa-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dsa-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="dsa-title">Data Structures &amp; Algorithms in ParkGanern</h3>
            <p className="modal-form-sub">
              Aligned with the research paper &quot;ParkGanern: Development of a Motorcycle Parking System for a University Parking Lot&quot; (ITECC 04 – Data Structures and Algorithms). Each structure below maps to a real operation in the system.
            </p>

            <div className="dsa-flow">
              <div className="dsa-flow__title">Parking flow → which DSA is used</div>
              <div className="dsa-flow__row"><span className="dsa-flow__step">1. Check-in (plate)</span><span className="dsa-flow__dsa">Hash Table</span></div>
              <div className="dsa-flow__row"><span className="dsa-flow__step">2. Assign slot</span><span className="dsa-flow__dsa">Min-Heap</span></div>
              <div className="dsa-flow__row"><span className="dsa-flow__step">3. Route to slot</span><span className="dsa-flow__dsa">Graph</span></div>
              <div className="dsa-flow__row"><span className="dsa-flow__step">4. Log &amp; search history</span><span className="dsa-flow__dsa">Merge Sort + Binary Search</span></div>
            </div>

            <div className="dsa-list">
              {DSAS.map((item) => (
                <article key={item.name} className="dsa-item">
                  <b>{item.name}</b>
                  <span className="dsa-use">{item.use}</span>
                  <item.Visual />
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
            <div className="modal-form-actions">
              <button className="park-action" type="button" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}