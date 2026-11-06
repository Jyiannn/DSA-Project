import { request } from './api';

export function getRecordsPageData() {
  return request('records');
}

export function deleteMotorist(id) {
  return request('registered-motorists/delete', { method: 'POST', body: { id } });
}

export function updateMotorist(id, payload) {
  return request('registered-motorists/update', { method: 'POST', body: { id, ...payload } });
}

export function registerMotorist(payload) {
  return request('registered-motorists', { method: 'POST', body: payload });
}

export function vacateParkingSpace(slot) {
  return request('parking-records/vacate', { method: 'POST', body: { slot } });
}

export function reserveSpace(slot, reserve) {
  return request('parking-spaces/reserve', { method: 'POST', body: { slot, reserve } });
}

export function logRevisit(plate, slot) {
  return request('parking-records/revisit', { method: 'POST', body: { plate, ...(slot ? { slot } : {}) } });
}

