// Power BI inspired color palettes

export const POWERBI_COLORS = {
  // Primary palette
  primary: ['#00B4D8', '#0077B6', '#023E8A', '#03045E', '#90E0EF'],
  
  // Vibrant palette
  vibrant: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'],
  
  // Power BI default
  default: ['#118DFF', '#12239E', '#E66C37', '#6B007B', '#E044A7', '#744EC2', '#D9B300', '#D64550'],
  
  // Gradient combinations
  gradients: {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-emerald-500 to-teal-500',
    orange: 'from-orange-500 to-amber-500',
    purple: 'from-purple-500 to-pink-500',
    red: 'from-red-500 to-rose-500',
    teal: 'from-teal-500 to-cyan-500',
    indigo: 'from-indigo-500 to-blue-500',
    lime: 'from-lime-500 to-emerald-500'
  }
};

export const getRoleGradients = (role) => {
  const gradients = {
    'CXO': ['from-blue-600 to-indigo-600', 'from-emerald-600 to-teal-600', 'from-orange-600 to-amber-600', 'from-purple-600 to-pink-600'],
    'Plant Head': ['from-teal-600 to-cyan-600', 'from-blue-600 to-sky-600', 'from-orange-600 to-red-600', 'from-indigo-600 to-purple-600'],
    'Energy Manager': ['from-green-600 to-emerald-600', 'from-yellow-600 to-orange-600', 'from-lime-600 to-green-600', 'from-teal-600 to-emerald-600'],
    'Sales': ['from-pink-600 to-rose-600', 'from-purple-600 to-fuchsia-600', 'from-orange-600 to-pink-600', 'from-blue-600 to-purple-600']
  };
  return gradients[role] || gradients['CXO'];
};

export const getChartColors = (count = 5) => {
  return POWERBI_COLORS.vibrant.slice(0, count);
};
