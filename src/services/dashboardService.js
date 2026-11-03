import { dashboardOverview } from '../data/dashboardData';
import { parkingRecords, parkingSpaces } from '../data/parkingData';
import { mockResponse } from './api';

export async function getDashboardOverview() {
  return mockResponse({
    ...dashboardOverview,
    spaces: parkingSpaces,
    recentActivity: parkingRecords,
  });
}
