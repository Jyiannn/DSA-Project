import { request } from './api';

export function getDashboardOverview(date) {
  return request('dashboard' + (date ? '?date=' + encodeURIComponent(date) : ''));
}
