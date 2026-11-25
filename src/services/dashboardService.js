import { request } from './api';

export function getDashboardOverview() {
  return request('dashboard');
}
