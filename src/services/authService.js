import { mockResponse } from './api';

const REMEMBERED_SESSION_KEY = 'parkganern.demo.session';
const TAB_SESSION_KEY = 'parkganern.demo.tab-session';

function storageFor(kind) {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function readJson(storage, key, fallback) {
  try {
    if (!storage) return fallback;
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(storage, key, value) {
  try {
    if (!storage) return false;
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function createUser(username) {
  const cleanUsername = username.trim();
  const displayName = cleanUsername.includes('@') ? cleanUsername.split('@')[0] : cleanUsername;
  return {
    id: `demo-user-${cleanUsername.toLowerCase()}`,
    username: cleanUsername,
    fullName: displayName,
    initials: displayName.split(/[.\s_-]+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'PG',
    role: 'Demo parking manager',
    email: cleanUsername.includes('@') ? cleanUsername : '',
  };
}

export function getDemoSession() {
  return readJson(storageFor('local'), REMEMBERED_SESSION_KEY, null)
    || readJson(storageFor('session'), TAB_SESSION_KEY, null);
}

// Frontend-only temporary login. Replace this function with a PHP authentication request later.
export async function startDemoSession({ username, password, remember }) {
  if (!username?.trim()) throw new Error('Enter your username or email address.');
  if (!password || password.length < 6) throw new Error('Password must contain at least 6 characters.');

  const session = {
    user: createUser(username),
    startedAt: new Date().toISOString(),
    remember: Boolean(remember),
  };
  const storage = storageFor(remember ? 'local' : 'session');
  const key = remember ? REMEMBERED_SESSION_KEY : TAB_SESSION_KEY;
  if (!writeJson(storage, key, session)) {
    throw new Error('Browser storage is unavailable. Enable storage to start a session.');
  }
  try {
    if (remember) storageFor('session')?.removeItem(TAB_SESSION_KEY);
    else storageFor('local')?.removeItem(REMEMBERED_SESSION_KEY);
  } catch {
    // There is no remote session; stale local session cleanup is non-critical.
  }
  return mockResponse(session);
}

export function logoutDemoAccount() {
  try {
    storageFor('local')?.removeItem(REMEMBERED_SESSION_KEY);
    storageFor('session')?.removeItem(TAB_SESSION_KEY);
  } catch {
    // Storage may be disabled by the browser. There is no remote session to revoke.
  }
}
