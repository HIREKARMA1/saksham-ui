import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from './config';

class ApiClient {
  public client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.api.fullUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('access_token', response.access_token);
              localStorage.setItem('refresh_token', response.refresh_token);
              
              originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/auth/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async registerStudent(data: any): Promise<any> {
    const response: AxiosResponse = await this.client.post('/auth/register/student', data);
    return response.data;
  }

  async login(data: any): Promise<any> {
    const response: AxiosResponse = await this.client.post('/auth/login', data);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<any> {
    const response: AxiosResponse = await this.client.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  }

  async logout(): Promise<any> {
    const response: AxiosResponse = await this.client.post('/auth/logout');
    return response.data;
  }

  async getCurrentUser(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/auth/me');
    return response.data;
  }

  // Helper methods
  setAuthTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  clearAuthTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Admin endpoints
  async getAdminDashboard(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/admin/dashboard');
    return response.data;
  }

  async getColleges(params?: any): Promise<any> {
    const response: AxiosResponse = await this.client.get('/admin/colleges', { params });
    return response.data;
  }

  async createCollege(data: any): Promise<any> {
    const response: AxiosResponse = await this.client.post('/admin/colleges', data);
    return response.data;
  }

  async updateCollege(id: string, data: any): Promise<any> {
    const response: AxiosResponse = await this.client.put(`/admin/colleges/${id}`, data);
    return response.data;
  }

  async deleteCollege(id: string): Promise<any> {
    const response: AxiosResponse = await this.client.delete(`/admin/colleges/${id}`);
    return response.data;
  }

  async createStudent(data: any): Promise<any> {
    const response: AxiosResponse = await this.client.post('/admin/students', data);
    return response.data;
  }

  // College endpoints
  async getCollegeDashboard(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/college/dashboard');
    return response.data;
  }

  async getCollegeProfile(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/college/profile');
    return response.data;
  }

  async updateCollegeProfile(data: any): Promise<any> {
    const response: AxiosResponse = await this.client.put('/college/profile', data);
    return response.data;
  }

  async getCollegeStudents(params?: any): Promise<any> {
    const response: AxiosResponse = await this.client.get('/college/students', { params });
    return response.data;
  }

  // Student endpoints
  async getStudentDashboard(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/student/dashboard');
    return response.data;
  }

  async getStudentProfile(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/student/profile');
    return response.data;
  }

  async updateStudentProfile(data: any): Promise<any> {
    const response: AxiosResponse = await this.client.put('/student/profile', data);
    return response.data;
  }

  async uploadResume(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse = await this.client.post('/student/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
