import type { 
  User, 
  LoginRequest, 
  LoginResponse, 
  ApiResponse, 
  Offer, 
  Application, 
  Notification 
} from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.token || localStorage.getItem('token');
    if (token && !this.token) this.token = token;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) throw new Error(data.message || 'Session expired. Please log in again.');
      // Include error details in development
      const errorMessage = data.error 
        ? `${data.message || 'Erreur API'}: ${data.error}` 
        : data.message || 'Erreur API';
      throw new Error(errorMessage);
    }

    return data;
  }

  // ===== AUTH =====
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data!;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!storedToken || !storedUser) {
      this.token = null;
      return false;
    }
    this.token = storedToken;
    return true;
  }

  // ===== HEALTH CHECK =====
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    return res.json();
  }

  // ===== OFFERS =====
  async getOffers(): Promise<Offer[]> {
    const response = await this.request<Offer[]>('/offers');
    return response.data || [];
  }

  async getOffer(id: number): Promise<Offer> {
    const response = await this.request<Offer>(`/offers/${id}`);
    return response.data!;
  }

  async getJobDetails(id: number): Promise<{ offer: Offer; requirement: any }> {
    const response = await this.request<{ offer: Offer; requirement: any }>(`/offers/${id}`);
    return response.data!;
  }

  async createOfferForRecruiter(
    recruiterId: number,
    offerData: {
      // Offer fields
      title: string;
      date_offer?: string;
      date_expiration?: string;
      // Requirement fields
      jobTitle: string;
      tags?: string;
      jobRole?: string;
      minSalary?: number;
      maxSalary?: number;
      salaryType?: 'Yearly' | 'Monthly' | 'Hourly';
      education?: string;
      experience?: string;
      jobType?: 'CDI' | 'CDD' | 'Stage' | 'Freelance' | 'Part-time';
      vacancies?: number;
      expirationDate?: string;
      jobLevel?: 'Junior' | 'Mid-level' | 'Senior';
      description?: string;
      responsibilities?: string;
    }
  ): Promise<{ message: string; data?: { offer: Offer; requirement: any } }> {
    const response = await this.request<{ message: string; data?: { offer: Offer; requirement: any } }>(
      `/recruiters/${recruiterId}/offers`,
      { method: 'POST', body: JSON.stringify(offerData) }
    );
    return response.data!;
  }

  async updateOffer(
    offerId: number,
    offerData: Partial<{ 
      title: string; 
      date_offer?: string; 
      date_expiration?: string;
      // Requirement fields
      jobTitle?: string;
      tags?: string;
      jobRole?: string;
      minSalary?: number;
      maxSalary?: number;
      salaryType?: 'Yearly' | 'Monthly' | 'Hourly';
      education?: string;
      experience?: string;
      jobType?: 'CDI' | 'CDD' | 'Stage' | 'Freelance' | 'Part-time';
      vacancies?: number;
      expirationDate?: string;
      jobLevel?: 'Junior' | 'Mid-level' | 'Senior';
      description?: string;
      responsibilities?: string;
    }>
  ): Promise<{ message: string; data?: { offer: Offer; requirement: any } }> {
    const response = await this.request<{ message: string; data?: { offer: Offer; requirement: any } }>(`/offers/${offerId}`, {
      method: 'PUT',
      body: JSON.stringify(offerData),
    });
    return response.data!;
  }

  async deleteOffer(offerId: number): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(`/offers/${offerId}`, { method: 'DELETE' });
    return response.data!;
  }

  async getRecruiterOffers(recruiterId: number): Promise<Offer[]> {
    const response = await this.request<Offer[]>(`/recruiters/${recruiterId}/offers`);
    return response.data || [];
  }

  // ===== APPLICATIONS =====
  async getApplications(candidateId: number): Promise<Application[]> {
    const response = await this.request<Application[]>(`/applications/candidate/${candidateId}`);
    return response.data || [];
  }

  async createApplication(offerId: number): Promise<{ id: number; message: string }> {
    const response = await this.request<{ id: number; message: string }>('/applications', {
      method: 'POST',
      body: JSON.stringify({ offer_id: offerId }),
    });
    return response.data!;
  }

  async getOfferApplications(offerId: number): Promise<Application[]> {
    const response = await this.request<Application[]>(`/offers/${offerId}/applications`);
    return response.data || [];
  }

  async updateApplicationStatus(applicationId: number, status: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(`/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return response.data!;
  }

  // ===== RECRUITER PROFILE =====
  async getRecruiterByUserId(userId: number): Promise<{ id: number; user_id: number; [key: string]: any }> {
    const response = await this.request<{ id: number; user_id: number; [key: string]: any }>(`/recruiters/user/${userId}`);
    return response.data!;
  }

  async updateRecruiterProfile(
    recruiterId: number,
    payload: Partial<{ company_name: string; industry: string; description: string; company_email: string; company_address: string }>
  ): Promise<{ message: string; data?: any }> {
    const response = await this.request<{ message: string; data?: any }>(`/recruiters/${recruiterId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return response.data!;
  }

  async updateUserProfile(
    userId: number,
    payload: Partial<{ first_name: string; last_name: string; email: string; oldPassword: string; newPassword: string }>
  ): Promise<{ message: string; data?: any }> {
    const response = await this.request<{ message: string; data?: any }>(`/auth/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return response.data!;
  }

  // ===== NOTIFICATIONS =====
  async getNotifications(): Promise<Notification[]> {
    const response = await this.request<Notification[]>('/notifications');
    return response.data || [];
  }

  async markNotificationAsRead(notificationId: number): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
    return response.data!;
  }
}

export const apiService = new ApiService();
