import axios, { AxiosInstance, AxiosResponse, AxiosProgressEvent } from 'axios';
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

  // ✅ Student endpoints - ALL using /students/ (plural)
  async getStudentDashboard(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/students/dashboard');
    return response.data;
  }

  async getStudentProfile(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/students/profile');
    return response.data;
  }

  async updateStudentProfile(data: any): Promise<any> {
    const response: AxiosResponse = await this.client.put('/students/profile', data);
    return response.data;
  }

  /**
   * Upload resume with progress tracking
   * @param file - Resume file (PDF/DOCX)
   * @param onProgress - Optional callback for upload progress (0-100)
   * @returns Upload response with file details
   */
  async uploadResume(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse = await this.client.post(
      '/students/resume/upload',  // ✅ /students/
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );
    return response.data;
  }

  /**
   * Get resume status
   * @returns Resume status and details
   */
  async getResumeStatus(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/students/resume/status');  // ✅ /students/
    return response.data;
  }

  /**
   * Get ATS score for uploaded resume
   * @param jobDescription - Optional job description for better matching
   * @returns ATS score analysis with recommendations
   */
  async getATSScore(jobDescription?: string): Promise<any> {
    const params = jobDescription ? { job_description: jobDescription } : {};
    const response: AxiosResponse = await this.client.get('/students/ats-score', { params });  // ✅ /students/
    return response.data;
  }

  /**
   * Get job recommendations based on resume
   * @returns Top 15 job recommendations with match scores
   */
  async getJobRecommendations(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/students/job-recommendations');  // ✅ /students/
    return response.data;
  }

  /**
   * Get student assessments history
   * @param skip - Number of records to skip (pagination)
   * @param limit - Number of records to return (pagination)
   * @returns Assessment history
   */
  // NOTE: See the unified implementation near the bottom of the file.

  /**
   * Get student performance analytics
   * @returns Performance analytics data
   */
  // NOTE: See the unified implementation near the bottom of the file.

  /**
   * Get subscription status and details
   * @returns Subscription information
   */
  async getSubscriptionStatus(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/students/subscription');  // ✅ /students/
    return response.data;
  }

  // Assessment endpoints
  async getJobRoles(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/assessments/job-roles');
    return response.data;
  }

  async startAssessment(jobRoleId: string): Promise<any> {
    const response: AxiosResponse = await this.client.post('/assessments/start', {
      job_role_id: jobRoleId
    });
    return response.data;
  }

  async getAssessmentRound(assessmentId: string, roundNumber: number): Promise<any> {
    const response: AxiosResponse = await this.client.get(`/assessments/${assessmentId}/rounds/${roundNumber}`);
    return response.data;
  }

  async submitRoundResponses(assessmentId: string, roundId: string, responses: any[]): Promise<any> {
    const response: AxiosResponse = await this.client.post(`/assessments/${assessmentId}/rounds/${roundId}/submit`, responses);
    return response.data;
  }

  async submitVoiceResponse(assessmentId: string, roundId: string, formData: FormData): Promise<any> {
    const response: AxiosResponse = await this.client.post(`/assessments/${assessmentId}/rounds/${roundId}/voice-response`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async completeAssessment(assessmentId: string): Promise<any> {
    const response: AxiosResponse = await this.client.post(`/assessments/${assessmentId}/complete`);
    return response.data;
  }

  async getAssessmentStatus(assessmentId: string): Promise<any> {
    const response: AxiosResponse = await this.client.get(`/assessments/${assessmentId}/status`);
    return response.data;
  }

  async getAssessmentReport(assessmentId: string): Promise<any> {
    const response: AxiosResponse = await this.client.get(`/assessments/${assessmentId}/report`);
    return response.data;
  }

  async getAssessmentReportWithQuestions(assessmentId: string): Promise<any> {
    const response: AxiosResponse = await this.client.get(`/assessments/${assessmentId}/report`, {
      params: { include: 'questions' }
    });
    return response.data;
  }

  async getAssessmentQA(assessmentId: string): Promise<any> {
    const response: AxiosResponse = await this.client.get(`/assessments/${assessmentId}/qa`);
    return response.data;
  }

  async getStudentAssessments(skip: number = 0, limit: number = 50): Promise<any> {
    const response: AxiosResponse = await this.client.get('/students/assessments', {
      params: { skip, limit }
    });
    return response.data;
  }

  async getStudentAnalytics(): Promise<any> {
    const response: AxiosResponse = await this.client.get('/students/analytics');
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
