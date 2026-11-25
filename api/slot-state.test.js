import test from 'node:test';
import assert from 'node:assert/strict';

// Run with: SMOKE=1 node --test api/slot-state.test.js (needs XAMPP running).
test('reserving and releasing a slot changes the dashboard status', { skip: process.env.SMOKE !== '1' }, async () => {
  const base = 'http://localhost/DSA-Project/api';
  const login = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'demo', password: 'password123' }),
  });
  assert.equal(login.status, 200);
  const cookies = login.headers.get('set-cookie')?.match(/parkganern=[^;,\s]+/g) ?? [];
  const cookie = cookies.at(-1); // session_regenerate_id sends an old and a new cookie; use the last.
  assert.ok(cookie, 'login must issue a session cookie');
  const headers = { Cookie: cookie, 'Content-Type': 'application/json' };

  const dashboard = await fetch(`${base}/dashboard`, { headers }).then((response) => response.json());
  const slot = dashboard.spaces.find((space) => space.status === 'available')?.id;
  assert.ok(slot, 'the seed board must have an available slot');

  const change = async (reserve) => {
    const response = await fetch(`${base}/parking-spaces/reserve`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ slot, reserve }),
    });
    assert.equal(response.status, 200);
  };
  const status = async () => {
    const snapshot = await fetch(`${base}/dashboard`, { headers }).then((response) => response.json());
    return snapshot.spaces.find((space) => space.id === slot).status;
  };

  await change(true);
  assert.equal(await status(), 'reserved');
  await change(false);
  assert.equal(await status(), 'available');
});
