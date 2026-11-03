import { currentUser } from '../data/userData';
import { mockResponse } from './api';

export async function getCurrentUser() {
  return mockResponse(currentUser);
}
