import { request } from './api';

export function getParkingHistory() {
  return request('parking-history');
}
