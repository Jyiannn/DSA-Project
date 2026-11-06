import { request } from './api';
import { getSession } from './authService';

// The sidebar remounts on every navigation; keep the profile for the current session.
let cached = null;

export async function getCurrentUser() {
  const sessionUser = getSession()?.user ?? null;
  if (cached && cached.id === sessionUser?.id) return cached;
  try {
    const { user } = await request('users/me');
    cached = user;
    return user;
  } catch {
    // The sidebar still renders from the stored session while the API is unreachable.
    return sessionUser;
  }
}
