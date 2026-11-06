import { request } from './api';

const SESSION_KEY = 'parkganern.session';
const TAB_SESSION_KEY = 'parkganern.tab-session';

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

export function getSession() {
  return readJson(storageFor('local'), SESSION_KEY, null)
    || readJson(storageFor('session'), TAB_SESSION_KEY, null);
}

export async function startSession({ username, password, remember }) {
  const payload = await request('auth/login', {
    method: 'POST',
    body: { username, password, remember },
  });

  const session = {
    user: payload.user,
    startedAt: payload.startedAt,
    remember: Boolean(remember),
  };
  const storage = storageFor(remember ? 'local' : 'session');
  const key = remember ? SESSION_KEY : TAB_SESSION_KEY;
  if (!writeJson(storage, key, session)) {
    throw new Error('Browser storage is unavailable. Enable storage to start a session.');
  }
  try {
    if (remember) storageFor('session')?.removeItem(TAB_SESSION_KEY);
    else storageFor('local')?.removeItem(SESSION_KEY);
  } catch {
    // Stale local session cleanup is non-critical.
  }
  return session;
}

export function logout() {
  try {
    storageFor('local')?.removeItem(SESSION_KEY);
    storageFor('session')?.removeItem(TAB_SESSION_KEY);
  } catch {
    // Storage may be disabled by the browser.
  }
  request('auth/logout', { method: 'POST' }).catch(() => {
    // The local session is already cleared; the server cookie expires on its own.
  });
}
