export const dashboardOverview = {
  statistics: [
    { id: 'capacity', label: 'Total Capacity', value: 69, detail: 'Across the campus' },
    { id: 'available', label: 'Available', value: 24, detail: 'Ready to use now', tone: 'success' },
    { id: 'occupied', label: 'Occupied', value: 42, detail: 'Currently in use' },
    { id: 'reserved', label: 'Reserved', value: 0, detail: 'Awaiting arrival' },
  ],
  notifications: [
    { id: 'notice-001', type: 'info', message: 'Parking availability was refreshed just now.', read: false },
  ],
};
