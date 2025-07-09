import axios from "axios";

// API Configuration
const API_BASE_URL = "https://wcapi.irc-enter.tech/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Jangan kirim Authorization untuk GET /api/reports (public)
    const isPublicReportsGet =
      config.method?.toUpperCase() === 'GET' &&
      config.url?.replace(/^https?:\/\/(localhost|127.0.0.1)(:\d+)?/, '').startsWith('/api/reports');
    if (!isPublicReportsGet) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
  }
  return config;
});

// HTTP Request Utilities
export async function fetcher<T>(url: string, options?: { method?: string; data?: any; headers?: any }): Promise<T> {
  const method = options?.method || 'GET';
  try {
    const response = await axiosInstance.request<T>({
      url,
      method,
      data: options?.data,
      headers: options?.headers,
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error(error.message || 'An error occurred');
  }
}

// Main API endpoints
export const api = {
  // Auth endpoints
  auth: {
    register: (data: RegisterData) => fetcher<AuthResponse>('/auth/register', {
      method: 'POST',
      data,
    }),
    login: (data: LoginData) => fetcher<AuthResponse>('/auth/login', {
      method: 'POST',
      data,
    }),
    logout: () => fetcher('/auth/logout', { method: 'POST' }),
  },

  // Check-in endpoints
  checkins: {
    create: (data: CheckInData) => fetcher<CheckInResponse>('/checkins', {
      method: 'POST',
      data,
    }),
    getToday: () => fetcher<CheckInResponse[]>('/checkins/today'),
    getAll: (params?: { page?: number; limit?: number }) => 
      fetcher<{ data: CheckInResponse[]; total: number; page: number }>(`/checkins?${new URLSearchParams(params as Record<string, string>)}`),
    getByDate: (date: string) => fetcher<CheckInResponse[]>(`/checkins/date/${date}`),
  },
  
  // User data endpoints
  user: {
    getProfile: () => fetcher<UserProfile>('/user/profile'),
    updateProfile: (data: Partial<UserProfile>) => fetcher<UserProfile>('/user/profile', {
      method: 'PUT',
      data,
    }),
    getAll: () => fetcher<any[]>('/users'), // Added for fetching all users
  },

  // Project endpoints
  projects: {
    getAll: () => fetcher<any[]>('/projects'),
    getById: (id: string) => fetcher<any>(`/projects/${id}`),
    create: (data: any) => fetcher<any>('/projects', { method: 'POST', data }),
    update: (id: string, data: any) => fetcher<any>(`/projects/${id}`, { method: 'PUT', data }),
    delete: (id: string) => fetcher<any>(`/projects/${id}`, { method: 'DELETE' }),
  },

  // Team endpoints
  teams: {
    getAll: () => fetcher<any[]>('/teams'),
    getById: (id: string) => fetcher<any>(`/teams/${id}`),
    create: (data: any) => fetcher<any>('/teams', { method: 'POST', data }),
    update: (id: string, data: any) => fetcher<any>(`/teams/${id}`, { method: 'PUT', data }),
    delete: (id: string) => fetcher<any>(`/teams/${id}`, { method: 'DELETE' }),
  },

  // ...existing code...
};

// Type Definitions
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
}

export interface CheckInData {
  type: 'checkin' | 'checkout';
  mood: string;
  description?: string;
  selfieImage?: string;
  faceData?: {
    gender?: string;
    age?: number;
    expression?: string;
  };
}

export interface CheckInResponse extends CheckInData {
  id: string;
  userId: string;
  createdAt: string;
  date?: string;
}

// Utility function to handle file uploads (for selfie images)
export async function uploadImage(imageData: string): Promise<string> {
  try {
    const response = await axiosInstance.post('/upload', { image: imageData });
    return response.data.imageUrl;
  } catch (error) {
    throw new Error('Failed to upload image');
  }
}
