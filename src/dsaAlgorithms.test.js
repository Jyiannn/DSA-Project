import test from 'node:test';
import assert from 'node:assert/strict';
import { hashBucket, heapLinks, sortedActivity } from './dsaAlgorithms.js';

test('hashBucket maps a plate into a stable bucket and handles an empty plate', () => {
  assert.equal(hashBucket('ABC123', 15), 3);
  assert.equal(hashBucket('ABC123', 15), hashBucket('ABC123', 15));
  assert.equal(hashBucket('', 15), 0);
});

test('heapLinks connects each node to its binary-heap parent without dangling pairs', () => {
  assert.deepEqual(heapLinks([]), []);
  assert.deepEqual(heapLinks(['A1', 'A2', 'A3']), [
    { parent: 'A1', child: 'A2' }, { parent: 'A1', child: 'A3' },
  ]);
  assert.equal(heapLinks(['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2']).length, 6);
});

test('sortedActivity orders records by time of day and marks the middle without mutating input', () => {
  const records = [
    { plate: 'Z', timeIn: '9:05am' }, { plate: 'A', timeIn: '8:30am' }, { plate: 'M', timeIn: '8:45am' },
  ];
  const original = structuredClone(records);
  const result = sortedActivity(records);
  assert.deepEqual(result.sorted.map((record) => record.plate), ['A', 'M', 'Z']);
  assert.equal(result.mid, 1);
  assert.deepEqual(sortedActivity([]), { sorted: [], mid: 0 });
  assert.equal(sortedActivity([{ plate: 'A', timeIn: '8:30am' }]).mid, 0);
  assert.deepEqual(records, original);
});
