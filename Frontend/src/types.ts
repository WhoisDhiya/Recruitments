// ===== TYPES DE BASE DE DONNÉES =====

// Types pour les utilisateurs
export interface User {
  id: number;
  last_name: string;
  first_name: string;
  email: string;
  password: string;
  role: 'recruiter' | 'candidate' | 'admin';
  created_at: string;
  updated_at: string;
}

// Types pour les recruteurs
export interface Recruiter {
  id: number;
  user_id: number;
  company_name: string;
  industry?: string;
  description?: string;
  company_email?: string;
  company_address?: string;
}

// Types pour les candidats
export interface Candidate {
  id: number;
  user_id: number;
  cv?: string;
  image?: string;
}

// Types pour les administrateurs
export interface Admin {
  id: number;
  user_id: number;
}

// Types pour les offres d'emploi
export interface Offer {
  id: number;
  recruiter_id: number;
  title: string;
  date_offer: string;
  date_expiration?: string;
  requirements?: Requirement[];
  recruiter?: Recruiter;
  // Additional properties used in FindJobsList and JobApplicationPage
  description?: string;
  location?: string;
  company_name?: string;
  employment_type?: string;
  education_level?: string;
  job_level?: string;
  salary_min?: number;
  salary_max?: number;
  category?: string;
  created_at?: string;
}

// Types pour les exigences d'offre
export interface Requirement {
  id: number;
  offer_id: number;
  description: string;
}

// Types pour les candidatures
export interface Application {
  id: number;
  candidate_id: number;
  offer_id: number;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  date_application: string;
  candidate?: Candidate;
  offer?: Offer;
}

// Types pour les notifications
export interface Notification {
  id: number;
  user_id: number;
  application_id?: number;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read';
  sent_at: string;
}

// Types pour les paiements
export interface Payment {
  id: number;
  recruiter_id: number;
  offer_id?: number;
  amount: number;
  payment_method: string;
  status: string;
  transaction_id?: string;
  payment_date: string;
}

// ===== TYPES POUR L'INTERFACE =====

// Types pour les éléments de navigation
export interface NavigationItem {
  id: string;
  label: string;
  active?: boolean;
  path?: string;
}

// Types pour les éléments de la sidebar
export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
}

// Types pour les cartes de résumé
export interface SummaryCard {
  title: string;
  count: string;
  icon: string;
  color: string;
}

// Types pour les pays
export interface Country {
  code: string;
  name: string;
  flag: string;
}

// Types pour les emplois (interface simplifiée)
export interface Job {
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  icon: string;
  iconColor: string;
}

// Type pour les candidatures dans l'interface (différent de la DB)
export interface ApplicationUI {
  id: number;
  job: Job;
  dateApplied: string;
  status: string;
  action: string;
}

// Types pour les props des composants
export interface DashboardProps {
  onLogout: () => void;
  user?: User;
}

export interface SignInProps {
  onLogin: (user: User) => void;
}

// Types pour les états
export type ActiveTab = 'Home' | 'Overview' | 'Applied_Jobs' | 'Saved_Jobs' | 'Job_Alert' | 'Settings';
export type RecruiterActiveTab = 'Overview' | 'Employers_Profile' | 'Post_a_Job' | 'My_Jobs' | 'Saved_Candidate' | 'Plans_Billing' | 'All_Companies' | 'Settings';
export type UserRole = 'recruiter' | 'candidate' | 'admin';
export type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected';

// Types pour les emplois postés par les recruteurs
export interface PostedJob {
  id: number;
  title: string;
  type: string;
  daysRemaining: number;
  status: 'Active' | 'Expire';
  applications: number;
  expirationDate?: string;
}

// Types pour les statistiques recruteur
export interface RecruiterStats {
  openJobs: number;
  savedCandidates: number;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Types pour l'authentification
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
