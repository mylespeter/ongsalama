//utils/auth.ts
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const logout = () => {
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

export const isStudent = () => {
  const user = getCurrentUser();
  return user?.role === 'student';
};

export const getMatricule = () => {
  const user = getCurrentUser();
  return user?.matricule || '';
};

export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || '';
};