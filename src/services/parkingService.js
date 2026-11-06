import { request } from './api';

export function getRecordsPageData() {
  return request('records');
}

export function registerMotorist(payload) {
  return request('registered-motorists', { method: 'POST', body: payload });
}

export function vacateParkingSpace(slot) {
  return request('parking-records/vacate', { method: 'POST', body: { slot } });
}

export function logRevisit(plate, slot) {
  return request('parking-records/revisit', { method: 'POST', body: { plate, ...(slot ? { slot } : {}) } });
}

