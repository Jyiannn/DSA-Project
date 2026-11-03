import { getDemoSession } from './authService';
import { mockResponse } from './api';

export async function getCurrentUser() {
  return mockResponse(getDemoSession()?.user || null);
}
