import { parkingRecords, parkingSpaces } from '../data/parkingData';
import { mockResponse } from './api';

export async function getParkingSpacesPageData() {
  return mockResponse({
    summary: {
      available: parkingSpaces.filter((space) => space.status === 'available').length,
      occupied: parkingSpaces.filter((space) => space.status === 'occupied').length,
    },
    spaces: parkingSpaces,
    records: parkingRecords,
  });
}

export async function createParkingRecord(payload) {
  const record = {
    id: `temporary-${Date.now()}`,
    plate: payload.plate.toUpperCase(),
    model: payload.motorcycleType,
    slot: payload.slot,
    time: new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit' }).format(new Date()),
    enteredAt: new Date().toISOString(),
    driver: payload.ownerName,
    contact: 'Not provided',
    classification: payload.classification,
    temporary: true,
  };
  return mockResponse(record);
}
