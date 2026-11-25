import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGraph } from './graphLayout.js';

const spaces = Array.from({ length: 15 }, (_, i) => ({
  id: `${String.fromCharCode(65 + Math.floor(i / 5))}${i % 5 + 1}`,
  status: i === 0 ? 'available' : 'occupied',
}));

test('buildGraph lays out a full 5x3 board', () => {
  const { nodes } = buildGraph(spaces);
  assert.equal(nodes.length, 15);
  assert.deepEqual({ x: nodes[0].x, y: nodes[0].y }, { x: 90, y: 70 });
  assert.deepEqual({ x: nodes[1].x, y: nodes[1].y }, { x: 230, y: 70 });
  assert.deepEqual({ x: nodes[5].x, y: nodes[5].y }, { x: 90, y: 200 });
});

test('buildGraph connects only right and down neighbours', () => {
  const { edges } = buildGraph(spaces);
  assert.equal(edges.length, 22); // 12 horizontal + 10 vertical
  assert.ok(edges.some((e) => e.from === 'A1' && e.to === 'A2'));
  assert.ok(edges.some((e) => e.from === 'A1' && e.to === 'B1'));
  assert.ok(!edges.some((e) => e.from === 'A5' && e.to === 'B1'));
  assert.ok(!edges.some((e) => e.from === 'A1' && e.to === 'B2'));
  const right = edges.find((e) => e.from === 'A1' && e.to === 'A2');
  assert.deepEqual({ x1: right.x1, y1: right.y1, x2: right.x2, y2: right.y2 }, { x1: 90, y1: 70, x2: 230, y2: 70 });
});

test('buildGraph handles a partial row without dangling edges', () => {
  const { nodes, edges } = buildGraph(spaces.slice(0, 7));
  assert.equal(nodes.length, 7);
  assert.equal(edges.length, 7); // 5 horizontal + 2 vertical
  assert.ok(!edges.some((e) => e.to === 'A6' || e.from === 'B3'));
});

test('buildGraph preserves spaces and statuses', () => {
  const original = structuredClone(spaces);
  const { nodes } = buildGraph(spaces);
  assert.deepEqual(nodes.map((n) => n.space), original);
  assert.deepEqual(spaces, original);
});
