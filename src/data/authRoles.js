// Authentic Official Profiles for CICR Pink Bollworm Surveillance Portal
// Central Directorate, State Nodal Officers, and District Agricultural Officers

export const USER_ROLES = [
  // Central Directorate
  {
    id: 'central_directorate',
    username: 'admin',
    password: 'admin123',
    name: 'Dr. K. Rameash',
    designation: 'Principal Scientist, ICAR-CICR',
    department: 'ICAR - Central Institute for Cotton Research',
    state: null,
    district: null,
    jurisdiction: 'Central Institute for Cotton Research',
    category: 'Central Directorate',
  },

  // State Nodal Officers
  {
    id: 'state_punjab',
    username: 'punjab',
    password: 'punjab123',
    name: 'State Nodal Officer - Punjab',
    designation: 'Joint Director (Plant Protection)',
    department: 'Department of Agriculture & Farmers Welfare, Punjab',
    state: 'Punjab',
    district: null,
    jurisdiction: 'Fazilka, Bathinda, Sri Muktsar Sahib',
    category: 'State Agriculture Department',
  },
  {
    id: 'state_haryana',
    username: 'haryana',
    password: 'haryana123',
    name: 'State Nodal Officer - Haryana',
    designation: 'Joint Director (Cotton)',
    department: 'Department of Agriculture & Farmers Welfare, Haryana',
    state: 'Haryana',
    district: null,
    jurisdiction: 'Hisar, Sirsa',
    category: 'State Agriculture Department',
  },
  {
    id: 'state_rajasthan',
    username: 'rajasthan',
    password: 'rajasthan123',
    name: 'State Nodal Officer - Rajasthan',
    designation: 'Joint Director (Plant Protection)',
    department: 'Department of Agriculture, Rajasthan',
    state: 'Rajasthan',
    district: null,
    jurisdiction: 'Sri Ganganagar, Hanumangarh',
    category: 'State Agriculture Department',
  },

  // District Agricultural Officers (Fatehabad removed)
  {
    id: 'dist_hisar',
    username: 'hisar',
    password: 'hisar123',
    name: 'Deputy Director of Agriculture (DDA)',
    designation: 'District Agriculture Officer - Hisar',
    department: 'Department of Agriculture & Farmers Welfare, Haryana',
    state: 'Haryana',
    district: 'Hisar',
    jurisdiction: 'Hisar District Automated Traps',
    category: 'District Agriculture Office',
  },
  {
    id: 'dist_sirsa',
    username: 'sirsa',
    password: 'sirsa123',
    name: 'Deputy Director of Agriculture (DDA)',
    designation: 'District Agriculture Officer - Sirsa',
    department: 'Department of Agriculture & Farmers Welfare, Haryana',
    state: 'Haryana',
    district: 'Sirsa',
    jurisdiction: 'Sirsa District Automated Traps',
    category: 'District Agriculture Office',
  },
  {
    id: 'dist_fazilka',
    username: 'fazilka',
    password: 'fazilka123',
    name: 'Chief Agriculture Officer (CAO)',
    designation: 'District Agriculture Officer - Fazilka',
    department: 'Department of Agriculture & Farmers Welfare, Punjab',
    state: 'Punjab',
    district: 'Fazilka',
    jurisdiction: 'Fazilka District Automated Traps',
    category: 'District Agriculture Office',
  },
  {
    id: 'dist_bathinda',
    username: 'bathinda',
    password: 'bathinda123',
    name: 'Chief Agriculture Officer (CAO)',
    designation: 'District Agriculture Officer - Bathinda',
    department: 'Department of Agriculture & Farmers Welfare, Punjab',
    state: 'Punjab',
    district: 'Bathinda',
    jurisdiction: 'Bathinda District Automated Traps',
    category: 'District Agriculture Office',
  },
  {
    id: 'dist_muktsar',
    username: 'muktsar',
    password: 'muktsar123',
    name: 'Chief Agriculture Officer (CAO)',
    designation: 'District Agriculture Officer - Sri Muktsar Sahib',
    department: 'Department of Agriculture & Farmers Welfare, Punjab',
    state: 'Punjab',
    district: 'Muktsar',
    jurisdiction: 'Muktsar District Automated Traps',
    category: 'District Agriculture Office',
  },
  {
    id: 'dist_ganganagar',
    username: 'ganganagar',
    password: 'ganganagar123',
    name: 'Deputy Director of Agriculture (DDA)',
    designation: 'District Agriculture Officer - Sri Ganganagar',
    department: 'Department of Agriculture, Rajasthan',
    state: 'Rajasthan',
    district: 'Sri Ganganagar',
    jurisdiction: 'Sri Ganganagar District Automated Traps',
    category: 'District Agriculture Office',
  },
  {
    id: 'dist_hanumangarh',
    username: 'hanumangarh',
    password: 'hanumangarh123',
    name: 'Deputy Director of Agriculture (DDA)',
    designation: 'District Agriculture Officer - Hanumangarh',
    department: 'Department of Agriculture, Rajasthan',
    state: 'Rajasthan',
    district: 'Hanumangarh',
    jurisdiction: 'Hanumangarh District Automated Traps',
    category: 'District Agriculture Office',
  },
];

// Authenticate user
export function authenticateUser(username, password) {
  const cleanUser = (username || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  const found = USER_ROLES.find(
    (u) => u.username.toLowerCase() === cleanUser
  );

  if (found) {
    if (!cleanPass || found.password === cleanPass) {
      return { success: true, user: found };
    }
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  return {
    success: false,
    error: 'Username not recognized. Enter an authorized officer ID.',
  };
}
