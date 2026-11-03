import { parkingHistory } from '../data/parkingHistoryData';
import { mockResponse } from './api';

export async function getParkingHistory() {
  return mockResponse(parkingHistory);
}
