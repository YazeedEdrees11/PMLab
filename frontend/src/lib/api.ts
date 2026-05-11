const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Token management
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pmlab_token');
}

export function setToken(token: string) {
  localStorage.setItem('pmlab_token', token);
}

export function removeToken() {
  localStorage.removeItem('pmlab_token');
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('pmlab_user');
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user: any) {
  localStorage.setItem('pmlab_user', JSON.stringify(user));
}

export function removeUser() {
  localStorage.removeItem('pmlab_user');
}

// API fetch wrapper
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Something went wrong' }));
    throw new Error(error.message || `Error ${res.status}`);
  }

  return res.json();
}

// ========== AUTH ==========
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { email: string; password: string; name: string; phone?: string; nationalId?: string }) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () => apiFetch('/auth/profile'),
  updateAvatar: (avatarUrl: string) =>
    apiFetch('/auth/avatar', {
      method: 'PATCH',
      body: JSON.stringify({ avatarUrl }),
    }),
  updateProfile: (data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) =>
    apiFetch('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

export const settingsApi = {
  getSettings: () => apiFetch('/settings'),
  updateSettings: (data: Record<string, any>) =>
    apiFetch('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ========== TESTS ==========
export const testsApi = {
  getAll: () => apiFetch("/tests"),
  getById: (id: string) => apiFetch(`/tests/${id}`),
  create: (data: any) => apiFetch("/tests", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiFetch(`/tests/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiFetch(`/tests/${id}`, { method: "DELETE" }),
};

// ========== BRANCHES ==========
export const branchesApi = {
  getAll: () => apiFetch('/branches'),
};

// ========== APPOINTMENTS ==========
export const appointmentsApi = {
  create: (data: { patientId?: string; branchId?: string | null; date: string; time?: string; homeVisit?: boolean; testIds: string[]; address?: string | null }) =>
    apiFetch('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMine: () => apiFetch('/appointments/my'),
  getAll: (filters: { status?: string; branchId?: string; date?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.branchId) params.append('branchId', filters.branchId);
    if (filters.date) params.append('date', filters.date);
    const query = params.toString();
    return apiFetch(`/appointments${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => apiFetch(`/appointments/${id}`),
  update: (id: string, data: any) =>
    apiFetch(`/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) => 
    apiFetch(`/appointments/${id}`, {
      method: 'DELETE',
    }),
};

// ========== RESULTS ==========
// Result management API methods
export const resultsApi = {
  create: (data: { patientId: string; testId: string; appointmentId?: string; fileUrl: string; status: string }) =>
    apiFetch('/results', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMine: () => apiFetch('/results/my'),
  getAll: () => apiFetch('/results'),
  getOne: (id: string) => apiFetch(`/results/${id}`),
  update: (id: string, data: any) =>
    apiFetch(`/results/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch(`/results/${id}`, {
      method: 'DELETE',
    }),
};

// ========== PATIENTS ==========
export const patientsApi = {
  getAll: () => apiFetch('/patients'),
  getById: (id: string) => apiFetch(`/patients/${id}`),
  create: (data: any) => apiFetch('/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiFetch(`/patients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiFetch(`/patients/${id}`, {
    method: 'DELETE',
  }),
};

// ========== NOTIFICATIONS ==========
export const notificationsApi = {
  getMine: () => apiFetch('/notifications/my'),
  markAllRead: () => apiFetch('/notifications/mark-all-read', { method: 'PATCH' }),
  broadcast: (message: string) => 
    apiFetch('/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};



// ========== FAMILY ==========
export const familyApi = {
  getAll: () => apiFetch('/family'),
  create: (data: { name: string; relation: string; nationalId?: string; dob?: string; gender?: string }) =>
    apiFetch('/family', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch(`/family/${id}`, {
      method: 'DELETE',
    }),
};

// ========== ADMIN STATS ==========
export const getFinancialStats = (branchId?: string) => 
  apiFetch(`/stats/finance${branchId ? `?branchId=${branchId}` : ''}`);

export const getBranches = () => branchesApi.getAll();
