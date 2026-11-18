// Detailed Trap Codes, Locations, Daily, Weekly, and Monthly PBW Counts
// Directly reflects the structure in the user's reference screenshots

export const TRAP_CODES_BY_DISTRICT = {
  Hisar: [
    { code: 'Hisar BHR', village: 'Behal Road', daily: 0, weeklyTotal: 316, status: 'Active' },
    { code: 'Hisar HAU', village: 'HAU Research Farm', daily: 35, weeklyTotal: 480, status: 'Active' },
    { code: 'Hisar KHR', village: 'Kheri', daily: 7, weeklyTotal: 122, status: 'Active' },
    { code: 'Hisar RWK', village: 'Rawalwas Khurd', daily: 10, weeklyTotal: 195, status: 'Active' },
    { code: 'Hisar SSW', village: 'Siswal', daily: 0, weeklyTotal: 98, status: 'Active' },
  ],
  Sirsa: [
    { code: 'Sirsa AMD', village: 'Alikan Mandi', daily: 0, weeklyTotal: 84, status: 'Active' },
    { code: 'Sirsa DBI', village: 'Dabwali', daily: 0, weeklyTotal: 65, status: 'Active' },
    { code: 'Sirsa JRI', village: 'Jhorar Nali', daily: 0, weeklyTotal: 72, status: 'Active' },
    { code: 'Sirsa LKW', village: 'Luharu Kalan', daily: 9, weeklyTotal: 178, status: 'Active' },
    { code: 'Sirsa MEK', village: 'Mangiana', daily: 1, weeklyTotal: 45, status: 'Active' },
  ],
  Fazilka: [
    { code: 'Fazilka ABH', village: 'Abohar Central', daily: 28, weeklyTotal: 395, status: 'Active' },
    { code: 'Fazilka KHR', village: 'Khuian Sarwar', daily: 18, weeklyTotal: 290, status: 'Active' },
    { code: 'Fazilka SIT', village: 'Sito Guno', daily: 14, weeklyTotal: 240, status: 'Active' },
    { code: 'Fazilka ARW', village: 'Arniwala', daily: 8, weeklyTotal: 165, status: 'Active' },
  ],
  Bathinda: [
    { code: 'Bathinda GID', village: 'Giddarbaha Border', daily: 16, weeklyTotal: 260, status: 'Active' },
    { code: 'Bathinda RMP', village: 'Rampura Phul', daily: 12, weeklyTotal: 210, status: 'Active' },
    { code: 'Bathinda TLW', village: 'Talwandi Sabo', daily: 9, weeklyTotal: 185, status: 'Active' },
  ],
  Muktsar: [
    { code: 'Muktsar GDW', village: 'Gidderbaha North', daily: 11, weeklyTotal: 175, status: 'Active' },
    { code: 'Muktsar MLT', village: 'Malout East', daily: 7, weeklyTotal: 140, status: 'Active' },
    { code: 'Muktsar BARI', village: 'Bariwala', daily: 4, weeklyTotal: 95, status: 'Active' },
  ],
  'Sri Ganganagar': [
    { code: 'SGN SAD', village: 'Sadulshahar', daily: 24, weeklyTotal: 380, status: 'Active' },
    { code: 'SGN KRN', village: 'Karanpur', daily: 19, weeklyTotal: 310, status: 'Active' },
    { code: 'SGN SRG', village: 'Suratgarh Farm', daily: 15, weeklyTotal: 275, status: 'Active' },
  ],
  Hanumangarh: [
    { code: 'HMG TBI', village: 'Tibbi Farm', daily: 14, weeklyTotal: 220, status: 'Active' },
    { code: 'HMG RAW', village: 'Rawatsar', daily: 9, weeklyTotal: 165, status: 'Active' },
    { code: 'HMG NOH', village: 'Nohar Rural', daily: 6, weeklyTotal: 125, status: 'Active' },
  ],
};

// District mapping by state (Fatehabad removed)
export const DISTRICTS_BY_STATE = {
  Punjab: ['Fazilka', 'Bathinda', 'Muktsar'],
  Haryana: ['Hisar', 'Sirsa'],
  Rajasthan: ['Sri Ganganagar', 'Hanumangarh'],
};

// Weekly dates (Matching screenshot: 2026-11-05 to 2026-11-12)
export const WEEKLY_DATES = [
  '2026-11-05',
  '2026-11-06',
  '2026-11-07',
  '2026-11-08',
  '2026-11-09',
  '2026-11-10',
  '2026-11-11',
  '2026-11-12',
];

// Generator for a trap's 8-day weekly counts matching the screenshot style
export const getTrapWeeklyData = (trapCode) => {
  // Exact seed matching screenshot for Hisar BHR
  if (trapCode === 'Hisar BHR') {
    return [
      { date: '2026-11-05', count: 130 },
      { date: '2026-11-06', count: 0 },
      { date: '2026-11-07', count: 0 },
      { date: '2026-11-08', count: 0 },
      { date: '2026-11-09', count: 0 },
      { date: '2026-11-10', count: 0 },
      { date: '2026-11-11', count: 82 },
      { date: '2026-11-12', count: 87 },
    ];
  }

  // Consistent realistic mock for other traps
  let seed = 0;
  for (let i = 0; i < trapCode.length; i++) seed += trapCode.charCodeAt(i);
  return WEEKLY_DATES.map((date, idx) => {
    let count = 0;
    if (idx === 0) count = (seed * 7) % 190;
    else if (idx === 1) count = (seed * 3) % 45;
    else if (idx === 2) count = (seed * 5) % 115;
    else if (idx === 3) count = (seed * 2) % 30;
    else count = 0;
    return { date, count };
  });
};

// Monthly weeks / months timeline
export const MONTHLY_TIMELINE = [
  { period: 'Aug W1-W2', label: 'Early Vegetative' },
  { period: 'Aug W3-W4', label: 'Squaring Phase' },
  { period: 'Sep W1-W2', label: 'Early Flowering' },
  { period: 'Sep W3-W4', label: 'Peak Flowering' },
  { period: 'Oct W1-W2', label: 'Boll Formation' },
  { period: 'Oct W3-W4', label: 'Peak Boll Bursting' },
  { period: 'Nov W1-W2', label: 'Late Harvest' },
];

export const getTrapMonthlyData = (trapCode) => {
  let seed = 0;
  for (let i = 0; i < trapCode.length; i++) seed += trapCode.charCodeAt(i);
  const base = 25 + (seed % 40);
  return MONTHLY_TIMELINE.map((t, idx) => ({
    period: t.period,
    label: t.label,
    count: Math.round(base * (1 + idx * 0.45 + (idx === 5 ? 1.8 : 0))),
  }));
};

// 24-Hour Moth Catch Timeline (Realistic Nocturnal PBW Flight Activity)
export const getDistrictHourlyData = (districtName) => {
  const hourlySlots = [
    { hour: '00:00', label: '12 AM', ratio: 0.14 },
    { hour: '02:00', label: '2 AM', ratio: 0.22 },
    { hour: '04:00', label: '4 AM', ratio: 0.16 },
    { hour: '06:00', label: '6 AM', ratio: 0.04 },
    { hour: '08:00', label: '8 AM', ratio: 0.00 },
    { hour: '10:00', label: '10 AM', ratio: 0.00 },
    { hour: '12:00', label: '12 PM', ratio: 0.00 },
    { hour: '14:00', label: '2 PM', ratio: 0.00 },
    { hour: '16:00', label: '4 PM', ratio: 0.00 },
    { hour: '18:00', label: '6 PM', ratio: 0.02 },
    { hour: '20:00', label: '8 PM', ratio: 0.18 },
    { hour: '22:00', label: '10 PM', ratio: 0.24 },
  ];

  const traps = TRAP_CODES_BY_DISTRICT[districtName] || [];
  const totalMoths = traps.reduce((sum, t) => sum + (t.daily || 0), 0) || 52;

  return hourlySlots.map((slot) => ({
    hour: slot.hour,
    label: slot.label,
    count: Math.round(totalMoths * slot.ratio),
  }));
};

