// src/mock/mockBerths.js
export const mockBerths = [
  { id: 1, name: "XL-1", size: "XL", currentAssignment: null },
  { id: 2, name: "L-1",  size: "L",  currentAssignment: null },
  { id: 3, name: "M-1",  size: "M",  currentAssignment: {
    shipName: "Adriatic Queen", startDay: 1, endDay: 5, shipStatus: "Assigned"
  }},
  { id: 4, name: "M-2",  size: "M",  currentAssignment: null },
  { id: 5, name: "S-1",  size: "S",  currentAssignment: null },
  { id: 6, name: "S-2",  size: "S",  currentAssignment: null },
  { id: 7, name: "S-3",  size: "S",  currentAssignment: null },
  { id: 8, name: "S-4",  size: "S",  currentAssignment: null },
];

export const mockPendingShips = [
  { id: 1, name: "MSC Aurora",   size: "XL", arrivalDay: 2, occupationDuration: 10 },
  { id: 4, name: "BlueWave M2",  size: "M",  arrivalDay: 3, occupationDuration: 6  },
  { id: 5, name: "Harbor Swift", size: "S",  arrivalDay: 1, occupationDuration: 4  },
];