import type { 
  User, 
  LoginRequest, 
  LoginResponse, 
  ApiResponse, 
  Offer, 
  Application, 
  Notification,
  Candidate as CandidateType, // Renommer pour éviter le conflit
  Recruiter as RecruiterType,
  User as UserType,
  AdminStats // Ajoutez cette ligne
} from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    // Toujours récupérer le token depuis localStorage (pour gérer les refreshes de page)
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token; // Mettre à jour this.token si on le récupère de localStorage

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
      // Si l'utilisateur a été supprimé ou le token est invalide, déconnecter automatiquement
      if (response.status === 401 || response.status === 403) {
        const errorMessage = data.message || 'Session expired. Please log in again.';
        
        // Vérifier si c'est une erreur de suppression d'utilisateur
        if (errorMessage.includes('supprimé') || errorMessage.includes('Utilisateur supprimé')) {
          console.log('🚪 User deleted, logging out...');
          this.logout();
          // Déclencher un événement pour que App.tsx puisse réagir
          window.dispatchEvent(new CustomEvent('userDeleted'));
        }
        
        throw new Error(errorMessage);
      }
      
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
    // Faire la requête directement pour éviter la transformation par request()
    const url = `${API_BASE_URL}/auth/login`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    console.log('🔐 Login response:', data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Le backend retourne { status: 'SUCCESS', message: '...', data: { user: {...}, token: '...' } }
    if (data.status === 'SUCCESS' && data.data) {
      const { token, user } = data.data;
      if (token && user) {
        this.token = token;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        console.log('✅ Token and user saved to localStorage:', { tokenLength: token.length, userEmail: user.email });
        return { user, token };
      } else {
        console.error('❌ Missing token or user in response.data:', data.data);
        throw new Error('Invalid login response: missing token or user');
      }
    } else {
      console.error('❌ Login failed or invalid response:', data);
      throw new Error(data.message || 'Login failed');
    }
  }

  async signup(userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'name' | 'status' | 'lastActive' | 'avatar'>): Promise<{ user: UserType; token: string }> {
    const url = `${API_BASE_URL}/auth/signup`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    if (data.status === 'SUCCESS' && data.data) {
      return data.data; // Should contain { user, token }
    }
    throw new Error(data.message || 'Registration failed: invalid response');
  }

  logout(): void {
    console.log('🚪 LOGOUT called - clearing token and user');
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): UserType | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    console.log('🔍 isAuthenticated check:', { 
      hasToken: !!storedToken, 
      hasUser: !!storedUser,
      tokenLength: storedToken?.length || 0
    });
    
    if (!storedToken || !storedUser) {
      this.token = null;
      console.log('❌ Not authenticated: missing token or user');
      return false;
    }
    this.token = storedToken;
    console.log('✅ Authenticated: token and user found');
    return true;
  }

  // Vérifier que l'utilisateur existe toujours dans la base de données
  async verifyUser(): Promise<{ valid: boolean; user?: UserType }> {
    try {
      const response = await this.request<{ id: number; first_name: string; last_name: string; email: string; role: string }>('/auth/verify');
      if (response.data) {
        // Mettre à jour les informations utilisateur dans localStorage
        const updatedUser = {
          id: response.data.id,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          email: response.data.email,
          role: response.data.role
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { valid: true, user: updatedUser as UserType };
      }
      return { valid: false };
    } catch (error) {
      console.error('❌ User verification failed:', error);
      // Si l'utilisateur a été supprimé, déconnecter
      if (error instanceof Error && (error.message.includes('supprimé') || error.message.includes('Utilisateur supprimé'))) {
        this.logout();
        window.dispatchEvent(new CustomEvent('userDeleted'));
      }
      return { valid: false };
    }
  }

  // ===== ADMIN ROUTES =====
  async getUsers(): Promise<UserType[]> {
    const response = await this.request<UserType[]>('/admin/users');
    return response.data || [];
  }

  async getUserById(id: number): Promise<UserType> {
    const response = await this.request<UserType>(`/admin/users/${id}`);
    return response.data!;
  }

  async updateUserRole(id: number, role: string): Promise<{ message: string; data: UserType }> {
    const response = await this.request<{ message: string; data: UserType }>(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
    return response.data!;
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE' });
    return response.data!;
  }

  async getAdminCandidates(): Promise<CandidateType[]> {
    const response = await this.request<CandidateType[]>('/admin/candidates');
    return response.data || [];
  }

  async getCandidateById(id: number): Promise<CandidateType> {
    const response = await this.request<CandidateType>(`/admin/candidates/${id}`);
    return response.data!;
  }

  async deleteCandidate(id: number): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(`/admin/candidates/${id}`, { method: 'DELETE' });
    return response.data!;
  }

  async getAdminRecruiters(): Promise<RecruiterType[]> {
    const response = await this.request<RecruiterType[]>('/admin/recruiters');
    return response.data || [];
  }

  async getRecruiterById(id: number): Promise<RecruiterType> {
    const response = await this.request<RecruiterType>(`/admin/recruiters/${id}`);
    return response.data!;
  }

  async deleteRecruiter(id: number): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(`/admin/recruiters/${id}`, { method: 'DELETE' });
    return response.data!;
  }

  async getAdminApplications(): Promise<Application[]> {
    const response = await this.request<Application[]>('/admin/applications');
    return response.data || [];
  }

  // Note: application status update and delete are already in the main application section
  // We can reuse updateApplicationStatus and deleteApplication if they are secured by isAdmin middleware
  // If not, we might need admin-specific versions.

  // Reusing existing updateApplicationStatus and deleteApplication for admin context
  // assuming they are protected by auth and isAdmin middleware on the backend
  async updateApplicationStatusAdmin(id: number, status: string): Promise<{ message: string }> {
    // The admin route is PUT /admin/applications/:id/status
    const response = await this.request<{ message: string }>(`/admin/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return response.data!;
  }

  async deleteApplicationAdmin(id: number): Promise<{ message: string }> {
    // The admin route is DELETE /admin/applications/:id
    const response = await this.request<{ message: string }>(`/admin/applications/${id}`, { method: 'DELETE' });
    return response.data!;
  }

  async getAdminStats(): Promise<AdminStats> {
    const response = await this.request<AdminStats>('/admin/stats');
    return response.data!;
  }

  // ===== HEALTH CHECK =====
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    return res.json();
  }

  // ===== PAYMENTS STATUS =====
  async getPaymentsStatus(): Promise<{ available: boolean; message?: string }> {
    // The backend exposes /api/payments which returns 503 when payments are disabled
    const url = `${API_BASE_URL}/payments`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        return { available: false, message: 'Payments disabled' };
      }
      return { available: true };
    } catch (err) {
      return { available: false, message: 'Payments unavailable' };
    }
  }

  // ===== OFFERS =====
  async getOffers(): Promise<Offer[]> {
    const response = await this.request<Offer[]>('/offers');
    return response.data || [];
  }

  async getOffer(id: number): Promise<Offer> {
    // Le backend retourne { status: 'SUCCESS', data: { offer: {...}, requirement: {...} } }
    const url = `${API_BASE_URL}/offers/${id}`;
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch offer');
    }
    
    // Le backend retourne { status: 'SUCCESS', data: { offer: {...}, requirement: {...} } }
    if (data.status === 'SUCCESS' && data.data && data.data.offer) {
      // Enrichir l'offre avec les données du requirement si disponible
      const offer = data.data.offer;
      const requirement = data.data.requirement;
      
      if (requirement) {
        return {
          ...offer,
          description: requirement.description || offer.description,
          location: requirement.location || offer.location,
          employment_type: requirement.jobType || offer.employment_type,
          // Ajouter les deux formats pour compatibilité
          salary_min: requirement.minSalary || offer.salary_min,
          salary_max: requirement.maxSalary || offer.salary_max,
          min_salary: requirement.minSalary || offer.min_salary || offer.salary_min,
          max_salary: requirement.maxSalary || offer.max_salary || offer.salary_max,
          salary_type: requirement.salaryType || offer.salary_type,
          job_level: requirement.jobLevel || offer.job_level,
          education_level: requirement.education || offer.education_level,
        };
      }
      return offer;
    }
    throw new Error('Invalid response format');
  }

  async getJobDetails(id: number): Promise<{ offer: Offer; requirement: any }> {
    // Le backend retourne { status: 'SUCCESS', data: { offer: {...}, requirement: {...} } }
    const url = `${API_BASE_URL}/offers/${id}`;
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch job details');
    }
    
    // Le backend retourne { status: 'SUCCESS', data: { offer: {...}, requirement: {...} } }
    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }
    throw new Error('Invalid response format');
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
  ): Promise<{ message?: string; data?: { offer: Offer; requirement: any; warnings?: string[] } } & { success?: boolean } > {
    const response = await this.request<{ offer?: Offer; requirement?: any; warnings?: string[] }>(
      `/recruiters/${recruiterId}/offers`,
      { method: 'POST', body: JSON.stringify(offerData) }
    );
    // Ensure offer exists before returning
    if (!response.data?.offer) {
      throw new Error('Offer creation failed: no offer returned');
    }
    // Type assertion: we know offer exists after the check above
    const data = response.data as { offer: Offer; requirement: any; warnings?: string[] };
    // Return the full response (message + data) so caller can access warnings and message
    return { message: response.message, data, success: response.success };
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
    // Faire la requête directement car le backend retourne { status: 'SUCCESS', data: [...] }
    const url = `${API_BASE_URL}/candidates/${candidateId}/applications`;
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch applications');
    }
    
    // Le backend retourne { status: 'SUCCESS', data: [...] }
    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }
    return [];
  }

  async createApplication(
    offerId: number,
    applicationData?: {
      phone?: string;
      address?: string;
      portfolio_url?: string;
      cover_letter?: string;
      cv_file?: string; // Base64 data URI format
    }
  ): Promise<{ id: number; message: string }> {
    const payload: any = { offer_id: offerId };
    
    // Toujours envoyer tous les champs avec leurs valeurs réelles
    // Le backend normalisera les chaînes vides en null
    if (applicationData) {
      // Envoyer les valeurs telles qu'elles sont (même si vides)
      // Le backend convertira les chaînes vides en null
      payload.phone = applicationData.phone !== undefined && applicationData.phone !== null ? String(applicationData.phone).trim() : null;
      payload.address = applicationData.address !== undefined && applicationData.address !== null ? String(applicationData.address).trim() : null;
      payload.portfolio_url = applicationData.portfolio_url !== undefined && applicationData.portfolio_url !== null && String(applicationData.portfolio_url).trim() !== '' ? String(applicationData.portfolio_url).trim() : null;
      payload.cover_letter = applicationData.cover_letter !== undefined && applicationData.cover_letter !== null ? String(applicationData.cover_letter).trim() : null;
      // Le CV est envoyé en base64 (data URI), on l'envoie tel quel
      payload.cv_file = applicationData.cv_file !== undefined && applicationData.cv_file !== null && String(applicationData.cv_file).trim() !== '' ? String(applicationData.cv_file).trim() : null;
    } else {
      // Si applicationData n'est pas fourni, initialiser avec null
      payload.phone = null;
      payload.address = null;
      payload.portfolio_url = null;
      payload.cover_letter = null;
      payload.cv_file = null;
    }
    
    console.log('📤 API: Sending application data:', JSON.stringify(payload, null, 2));
    
    const response = await this.request<{ id: number; message: string }>('/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data!;
  }

  async getOfferApplications(offerId: number): Promise<Application[]> {
    const response = await this.request<Application[]>(`/offers/${offerId}/applications`);
    return response.data || [];
  }

  async updateApplicationStatus(applicationId: number, status: string): Promise<{ message: string }> {
    console.log('🔄 API: Updating application status', { applicationId, status });
    try {
      const response = await this.request<{ message: string }>(`/applications/${applicationId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      console.log('✅ API: Application status updated successfully');
      return response.data!;
    } catch (error: any) {
      console.error('❌ API: Error updating application status:', error);
      throw error;
    }
  }

  async getApplicationDetails(applicationId: number): Promise<any> {
    // Route pour les recruteurs : /applications/:id/details
    const url = `${API_BASE_URL}/applications/${applicationId}/details`;
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token;
    
    console.log('🔍 API: Fetching application details for recruiter, applicationId:', applicationId);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    console.log('🔍 API: Response status:', response.status);
    console.log('🔍 API: Response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      const errorMessage = data.message || data.error || 'Failed to fetch application details';
      console.error('❌ API: Error fetching application details:', errorMessage);
      throw new Error(errorMessage);
    }
    
    // Le backend retourne { status: "SUCCESS", data: {...} }
    if (data.status === 'SUCCESS' && data.data) {
      console.log('✅ API: Successfully retrieved application details');
      return data.data;
    }
    
    // Si le backend retourne directement les données sans wrapper
    if (data.id && data.status) {
      console.log('✅ API: Data found directly in response');
      return data;
    }
    
    console.error('❌ API: Unexpected response format:', data);
    throw new Error(data.message || 'Application details not found');
  }

  async getApplicationById(applicationId: number): Promise<any> {
    // Route pour les candidats : /applications/:id
    const url = `${API_BASE_URL}/applications/${applicationId}`;
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token;
    
    console.log('🔍 API: Fetching application', applicationId, 'from', url);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    console.log('🔍 API: Response status', response.status, response.statusText);
    
    const data = await response.json();
    console.log('🔍 API: Response data', JSON.stringify(data, null, 2));
    console.log('🔍 API: data.status =', data.status);
    console.log('🔍 API: data.data =', data.data);
    console.log('🔍 API: typeof data =', typeof data);
    console.log('🔍 API: data keys =', Object.keys(data));
    
    if (!response.ok) {
      // Si le backend retourne un status ERROR dans le body même avec un status HTTP non-ok
      if (data.status === 'ERROR') {
        console.error('❌ API: Backend returned ERROR status:', data.message);
        console.error('❌ API: Error details:', data.error);
        console.error('❌ API: Full error response:', JSON.stringify(data, null, 2));
        // Inclure les détails de l'erreur si disponibles
        const errorMessage = data.error ? `${data.message || 'Erreur serveur'}: ${data.error}` : (data.message || 'Erreur serveur');
        throw new Error(errorMessage);
      }
      console.error('❌ API: HTTP error:', response.status, data.message);
      console.error('❌ API: Error data:', JSON.stringify(data, null, 2));
      const errorMessage = data.error ? `${data.message || 'Erreur serveur'}: ${data.error}` : (data.message || `Failed to fetch application: ${response.status}`);
      throw new Error(errorMessage);
    }
    
    // Le backend retourne { status: "SUCCESS", data: {...} }
    if (data.status === 'SUCCESS') {
      if (data.data) {
        console.log('✅ API: Successfully retrieved application data');
        return data.data;
      } else {
        console.warn('⚠️ API: Backend returned SUCCESS but data is null/undefined');
        // Si data.data est null/undefined, peut-être que les données sont directement dans data
        if (data.id || data.application_id) {
          console.log('✅ API: Data found directly in response object');
          return data;
        }
        throw new Error('Application data is missing in response');
      }
    }
    
    // Si le backend retourne directement les données sans wrapper (fallback)
    if (data.id && (data.status || data.application_status) && (data.date_application || data.applied_at)) {
      console.log('✅ API: Backend returned data directly (without wrapper), using it');
      return data;
    }
    
    // Si le backend retourne un status ERROR même avec un status HTTP ok
    if (data.status === 'ERROR') {
      console.error('❌ API: Backend returned ERROR status with HTTP 200:', data.message);
      console.error('❌ API: Error details:', data.error);
      console.error('❌ API: Full error response:', JSON.stringify(data, null, 2));
      throw new Error(data.message || data.error || 'Application not found');
    }
    
    // Si la structure n'est pas celle attendue, logger pour debug
    console.error('❌ API: Unexpected response format:', data);
    console.error('❌ API: Full response object:', JSON.stringify(data, null, 2));
    throw new Error(data.message || 'Application not found - unexpected response format');
  }

  // ===== CANDIDATE PROFILE =====
  async getCandidateByUserId(userId: number): Promise<{ id: number; user_id: number; [key: string]: any }> {
    // La route backend est /candidates/profile/user/:userId
    const url = `${API_BASE_URL}/candidates/profile/user/${userId}`;
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch candidate profile');
    }
    
    // Le backend retourne { status: 'SUCCESS', data: {...} }
    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }
    throw new Error('Invalid response format');
  }

  async updateCandidateProfile(
    candidateId: number,
    payload: Partial<{ oldPassword: string; newPassword: string; cv: string; image: string }>
  ): Promise<{ message: string; data?: any }> {
    // La route backend est /candidates/profile/:candidateId
    const url = `${API_BASE_URL}/candidates/profile/${candidateId}`;
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update candidate profile');
    }
    
    // Le backend retourne { status: 'SUCCESS', message: '...' }
    if (data.status === 'SUCCESS') {
      return { message: data.message || 'Candidate profile updated successfully', data: data.data };
    }
    throw new Error(data.message || 'Failed to update candidate profile');
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
    const url = `${API_BASE_URL}/auth/users/${userId}/profile`;
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user profile');
    }
    
    // Le backend retourne { status: 'SUCCESS', message: '...', data: {...} }
    if (data.status === 'SUCCESS') {
      return { message: data.message || 'Profile updated successfully', data: data.data };
    }
    throw new Error(data.message || 'Failed to update user profile');
  }

  // ===== NOTIFICATIONS =====
  async getNotifications(): Promise<Notification[]> {
    // Le backend retourne { status: 'SUCCESS', data: [...] }
    const url = `${API_BASE_URL}/notifications`;
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch notifications');
    }
    
    // Le backend retourne { status: 'SUCCESS', data: [...] }
    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }
    return [];
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    const url = `${API_BASE_URL}/notifications/unread`;
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch unread notifications');
    }
    
    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }
    return [];
  }

  async getUnreadNotificationsCount(): Promise<number> {
    const url = `${API_BASE_URL}/notifications/unread/count`;
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return 0;
    }
    
    if (data.status === 'SUCCESS' && data.data) {
      return data.data.unreadCount || 0;
    }
    return 0;
  }

  async markNotificationAsRead(notificationId: number): Promise<{ message: string }> {
    const url = `${API_BASE_URL}/notifications/${notificationId}/read`;
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to mark notification as read');
    }
    
    if (data.status === 'SUCCESS') {
      return { message: data.message || 'Notification marked as read' };
    }
    throw new Error(data.message || 'Failed to mark notification as read');
  }

  async markAllNotificationsAsRead(): Promise<{ message: string }> {
    const url = `${API_BASE_URL}/notifications/read-all`;
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to mark all notifications as read');
    }
    
    if (data.status === 'SUCCESS') {
      return { message: data.message || 'All notifications marked as read' };
    }
    throw new Error(data.message || 'Failed to mark all notifications as read');
  }

  async deleteNotification(notificationId: number): Promise<{ message: string }> {
    const url = `${API_BASE_URL}/notifications/${notificationId}`;
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete notification');
    }
    
    if (data.status === 'SUCCESS') {
      return { message: data.message || 'Notification deleted' };
    }
    throw new Error(data.message || 'Failed to delete notification');
  }

  // ===== SAVED JOBS =====
  async getSavedJobs(): Promise<Offer[]> {
    // Le backend retourne { status: 'SUCCESS', data: [...] }
    const url = `${API_BASE_URL}/saved-jobs`;
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token;
    
    console.log('📋 Fetching saved jobs from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    
    console.log('📋 Saved jobs response:', data);
    
    if (!response.ok) {
      console.error('❌ Error fetching saved jobs:', data);
      throw new Error(data.message || 'Failed to fetch saved jobs');
    }
    
    // Le backend retourne { status: 'SUCCESS', data: [...] }
    if (data.status === 'SUCCESS') {
      if (data.data && Array.isArray(data.data)) {
        console.log(`✅ Retrieved ${data.data.length} saved jobs`);
        if (data.data.length > 0) {
          console.log('📋 First saved job in response:', data.data[0]);
        }
        return data.data;
      } else {
        console.warn('⚠️ data.data is not an array:', data.data);
        return [];
      }
    }
    console.warn('⚠️ Response status is not SUCCESS:', data);
    return [];
  }

  async saveJob(offerId: number): Promise<{ message: string }> {
    const url = `${API_BASE_URL}/saved-jobs`;
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token;
    
    console.log('💾 Saving job:', offerId);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ offer_id: offerId }),
    });
    
    const data = await response.json();
    
    console.log('💾 Save job response:', data);
    
    if (!response.ok) {
      console.error('❌ Error saving job:', data);
      throw new Error(data.message || 'Failed to save job');
    }
    
    // Le backend retourne { status: 'SUCCESS', message: '...' }
    if (data.status === 'SUCCESS') {
      console.log('✅ Job saved successfully');
      return { message: data.message || 'Job saved successfully' };
    }
    throw new Error(data.message || 'Failed to save job');
  }

  async unsaveJob(offerId: number): Promise<{ message: string }> {
    // Le backend retourne { status: 'SUCCESS', message: '...' }
    const url = `${API_BASE_URL}/saved-jobs/${offerId}`;
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to unsave job');
    }
    
    if (data.status === 'SUCCESS') {
      return { message: data.message || 'Job removed from saved jobs' };
    }
    throw new Error(data.message || 'Failed to unsave job');
  }

  // Récupérer les IDs des offres sauvegardées pour vérifier rapidement
  async getSavedJobIds(): Promise<number[]> {
    const url = `${API_BASE_URL}/saved-jobs/ids`;
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return [];
    }
    
    if (data.status === 'SUCCESS' && data.data) {
      return data.data;
    }
    return [];
  }

  // ===== SUBSCRIPTION & PAYMENT =====
  async getPacks(): Promise<any[]> {
    const url = `${API_BASE_URL}/payments/packs`;
    console.log('Fetching packs from:', url);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Packs response status:', response.status);
      
      const data = await response.json();
      console.log('Packs response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to fetch packs: ${response.status}`);
      }
      
      if (data.status === 'SUCCESS' && data.data) {
        return data.data;
      }
      
      if (data.status === 'ERROR') {
        throw new Error(data.message || 'Failed to fetch packs');
      }
      
      return [];
    } catch (error: any) {
      console.error('Error in getPacks:', error);
      throw error;
    }
  }

  /**
   * Create a checkout session.
   * recruiterOrPayload can be a recruiterId (number) or a recruiter payload object (to create after payment)
   */
  async createCheckoutSession(recruiterOrPayload: number | Record<string, any> | null, packId: number): Promise<{ url: string }> {
    const url = `${API_BASE_URL}/payments/create-checkout-session`;
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token;

    const bodyPayload: Record<string, any> = { pack_id: packId };
    if (typeof recruiterOrPayload === 'number') {
      // Ambiguous number - assume it's an existing recruiter id
      bodyPayload.recruiter_id = recruiterOrPayload;
    } else if (recruiterOrPayload && typeof recruiterOrPayload === 'object') {
      // If object includes pending_id, forward as pending_id, otherwise forward as recruiter_payload
      if ('pending_id' in recruiterOrPayload) bodyPayload.pending_id = (recruiterOrPayload as any).pending_id;
      else bodyPayload.recruiter_payload = recruiterOrPayload;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(bodyPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      // Gérer spécifiquement les erreurs Stripe
      if (response.status === 503 && (data.status === 'UNAVAILABLE' || data.message?.includes('disabled'))) {
        throw new Error(data.message || 'Payments are temporarily disabled or Stripe is not configured');
      }
      throw new Error(data.message || 'Failed to create checkout session');
    }

    // Vérifier que l'URL est présente
    if (!data.url) {
      throw new Error('No payment URL received from server. Stripe may not be configured.');
    }

    return { url: data.url };
  }

  // Create a pending recruiter on the server (stores hashed password) and return pending_id
  async createPendingRecruiter(payload: Record<string, any>): Promise<{ pending_id: number }> {
    const url = `${API_BASE_URL}/payments/pending-recruiters`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create pending recruiter');
    }
    return { pending_id: data.pending_id };
  }

  async handlePaymentSuccess(sessionId: string): Promise<{ success: boolean; message: string }> {
    const url = `${API_BASE_URL}/payments/payment-success`;
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ session_id: sessionId }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Payment verification failed');
    }
    // If backend returned a token/user, save it so the user is authenticated after payment
    if (data.token && data.user) {
      this.token = data.token;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return { success: data.success, message: data.message };
  }

  async checkActiveSubscription(recruiterId: number): Promise<{ hasActiveSubscription: boolean; data?: any }> {
    const url = `${API_BASE_URL}/payments/subscription/${recruiterId}`;
    const token = localStorage.getItem('token') || this.token;
    if (token) this.token = token;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to check subscription');
    }
    
    return { hasActiveSubscription: data.hasActiveSubscription, data: data.data };
  }
}

export const apiService = new ApiService();
