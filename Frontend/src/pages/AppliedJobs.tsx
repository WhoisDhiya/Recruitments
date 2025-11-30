import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Offer, NavigationItem, SidebarItem } from '../types';
import './Dashboard.css';

interface AppliedJobsProps {
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  onLogout?: () => void;
}

interface ApplicationWithOffer {
  id: number;
  candidate_id?: number;
  offer_id: number;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'interview';
  applied_at: string;
  date_application?: string;
  offer: Offer & {
    company?: string;
    company_name?: string;
    location?: string;
    min_salary?: number;
    max_salary?: number;
    salary_type?: 'Yearly' | 'Monthly' | 'Hourly';
    job_type?: string;
    employment_type?: string;
  };
}

const AppliedJobs: React.FC<AppliedJobsProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationWithOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Applied_Jobs');

  // Navigation items for the top navigation bar
  const navigationItems: NavigationItem[] = [
    { id: 'Home', label: 'Home' },
    { id: 'Find_Job', label: 'Find Job', path: '/find-jobs' },
    { id: 'Dashboard', label: 'Dashboard', path: '/dashboard' },
    { id: 'Job_Alerts', label: 'Job Alerts' },
    { id: 'Customer_Supports', label: 'Customer Supports' }
  ];

  // Sidebar items for the dashboard
  const sidebarItems: SidebarItem[] = [
    { id: 'Overview', label: 'Overview', icon: '📊' },
    { id: 'Applied_Jobs', label: 'Applied Jobs', icon: '💼' },
    { id: 'Saved_Jobs', label: 'Saved Jobs', icon: '💾' },
    { id: 'Job_Alert', label: 'Job Alert', icon: '🔔', badge: '09' },
    { id: 'Settings', label: 'Settings', icon: '⚙️' }
  ];

  // Handle navigation between pages
  const handleNavigation = (itemId: string) => {
    if (itemId === 'Dashboard') {
      navigate('/dashboard');
    } else if (itemId === 'Home') {
      navigate('/');
    } else if (itemId === 'Find_Job') {
      navigate('/find-jobs');
    } else if (itemId === 'Job_Alerts') {
      navigate('/notifications');
    } else if (itemId === 'Customer_Supports') {
      navigate('/customer-support');
    }
  };

  // Handle sidebar item clicks
  const handleSidebarClick = (itemId: string) => {
    if (itemId === 'Saved_Jobs') {
      navigate('/saved-jobs');
      return;
    }
    if (itemId === 'Settings') {
      navigate('/settings');
      return;
    }
    if (itemId === 'Overview' || itemId === 'Dashboard') {
      navigate('/dashboard');
      return;
    }
    setActiveTab(itemId);
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const user = apiService.getCurrentUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Récupérer le profil candidat
        const candidate = await apiService.getCandidateByUserId(user.id);
        
        if (!candidate || !candidate.id) {
          throw new Error('Candidate profile not found');
        }

        console.log('📋 Fetching applications for candidate:', candidate.id);
        
        // Récupérer les candidatures du candidat
        const apps = await apiService.getApplications(candidate.id);
        
        console.log('📋 Applications received:', apps);
        
        // Le backend retourne déjà offer_title et company_name dans chaque application
        // On va construire un objet offer simplifié ou récupérer les détails complets
        const appsWithOffers = await Promise.all(
          apps.map(async (app: any) => {
            try {
              // Essayer de récupérer les détails complets de l'offre
              const offer = await apiService.getOffer(app.offer_id);
              
              // Construire l'objet application avec l'offre complète
              return {
                id: app.id,
                candidate_id: app.candidate_id,
                offer_id: app.offer_id,
                status: (app.status || 'pending') as 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'interview',
                applied_at: app.date_application || app.created_at || new Date().toISOString(),
                date_application: app.date_application || app.created_at,
                offer: {
                  ...offer,
                  title: offer.title || app.offer_title,
                  company_name: offer.company_name || app.company_name || 'Entreprise non spécifiée',
                  // S'assurer que les salaires sont bien présents
                  min_salary: (offer as any).min_salary ?? (offer as any).salary_min,
                  max_salary: (offer as any).max_salary ?? (offer as any).salary_max,
                  salary_type: (offer as any).salary_type,
                } as any
              };
            } catch (err) {
              console.error(`Error fetching offer ${app.offer_id}:`, err);
              // Si on ne peut pas récupérer l'offre complète, utiliser les données de base
              return {
                id: app.id,
                candidate_id: app.candidate_id,
                offer_id: app.offer_id,
                status: (app.status || 'pending') as 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'interview',
                applied_at: app.date_application || app.created_at || new Date().toISOString(),
                date_application: app.date_application || app.created_at,
                offer: {
                  id: app.offer_id,
                  recruiter_id: app.recruiter_id || 0,
                  title: app.offer_title || 'Offre non disponible',
                  date_offer: app.date_offer || new Date().toISOString(),
                  company_name: app.company_name || 'Entreprise non spécifiée',
                  location: app.location,
                  employment_type: app.job_type || app.employment_type,
                  salary_min: app.min_salary,
                  salary_max: app.max_salary,
                } as Offer
              };
            }
          })
        );

        console.log('📋 Applications with offers:', appsWithOffers);
        setApplications(appsWithOffers.filter(app => app && app.offer));
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des candidatures');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'interview':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompanyIcon = (companyName: string) => {
    // Simple mapping d'icônes basé sur le nom de l'entreprise
    const icons: Record<string, string> = {
      'microsoft': '🪟',
      'apple': '🍎',
      'google': '🔍',
      'facebook': '📘',
      'twitter': '🐦',
      'amazon': '📦',
      'netflix': '🎬',
      'spotify': '🎵',
      'adobe': '🎨',
      'slack': '💬',
      'zoom': '📹',
      'linkedin': '💼',
      'github': '🐙',
      'gitlab': '🦊',
      'docker': '🐳',
      'kubernetes': '☸️'
    };

    const lowerName = companyName.toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
      if (lowerName.includes(key)) {
        return icon;
      }
    }
    
    // Retourne une icône par défaut basée sur la première lettre du nom de l'entreprise
    return companyName.charAt(0).toUpperCase();
  };

  const getSalaryRange = (offer: ApplicationWithOffer['offer']) => {
    // Vérifier les deux formats possibles (min_salary/max_salary ou salary_min/salary_max)
    const minSalary = (offer as any).min_salary ?? (offer as any).salary_min;
    const maxSalary = (offer as any).max_salary ?? (offer as any).salary_max;
    const salaryType = (offer as any).salary_type || (offer as any).salaryType;
    
    if (minSalary !== undefined && minSalary !== null && maxSalary !== undefined && maxSalary !== null) {
      const typeLabel = salaryType === 'Yearly' ? 'an' : salaryType === 'Hourly' ? 'heure' : 'mois';
      return `${minSalary} - ${maxSalary} DT/${typeLabel}`;
    } else if (minSalary !== undefined && minSalary !== null) {
      const typeLabel = salaryType === 'Yearly' ? 'an' : salaryType === 'Hourly' ? 'heure' : 'mois';
      return `À partir de ${minSalary} DT/${typeLabel}`;
    } else if (maxSalary !== undefined && maxSalary !== null) {
      const typeLabel = salaryType === 'Yearly' ? 'an' : salaryType === 'Hourly' ? 'heure' : 'mois';
      return `Jusqu'à ${maxSalary} DT/${typeLabel}`;
    }
    return 'Salaire non spécifié';
  };

  return (
    <div className="dashboard">
      {/* Header with navigation */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">💼</span>
            <span className="logo-text">RecruPlus</span>
          </div>
          <nav className="main-nav">
            {navigationItems.map(item => (
              <a 
                key={item.id}
                href="#" 
                className={`nav-link ${item.id === 'Dashboard' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation(item.id);
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        
      </header>

      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <h3 className="sidebar-title">CANDIDATE DASHBOARD</h3>
          <nav className="sidebar-nav">
            <ul>
              {sidebarItems.map((item) => (
                <li key={item.id}>
                  <a
                    href="#"
                    className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSidebarClick(item.id);
                    }}
                  >
                    <span className="sidebar-icon">{item.icon}</span>
                    <span className="sidebar-label">{item.label}</span>
                    {item.badge && <span className="badge">{item.badge}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="logout-section">
            <button 
              onClick={onLogout}
              className="logout-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}
            >
              <span className="logout-icon">↗️</span>
              Log-out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {loading ? (
            <div>
              <div className="welcome-section">
                <h1 className="welcome-title">Mes Candidatures</h1>
                <p className="welcome-subtitle">Chargement de vos candidatures en cours...</p>
              </div>
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            </div>
          ) : error ? (
            <div>
              <div className="welcome-section">
                <h1 className="welcome-title">Mes Candidatures</h1>
                <p className="welcome-subtitle">Une erreur est survenue</p>
              </div>
              <div className="error-message" style={{ padding: '20px', textAlign: 'center' }}>
                <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>
                <button onClick={() => window.location.reload()} className="btn btn-primary">
                  Réessayer
                </button>
              </div>
            </div>
          ) : applications.length === 0 ? (
            <div>
              <div className="welcome-section">
                <h1 className="welcome-title">Mes Candidatures</h1>
                <p className="welcome-subtitle">Vous n'avez encore postulé à aucune offre</p>
              </div>
              <div className="no-applications" style={{ padding: '40px', textAlign: 'center' }}>
                <p style={{ marginBottom: '20px', fontSize: '16px', color: '#666' }}>
                  Parcourez les offres disponibles et postulez pour commencer votre recherche d'emploi !
                </p>
                <button 
                  onClick={() => navigate('/find-jobs')} 
                  className="btn btn-primary"
                  style={{ padding: '12px 24px', fontSize: '16px' }}
                >
                  Voir les offres disponibles
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="welcome-section">
                <h1 className="welcome-title">Mes Candidatures</h1>
                <p className="welcome-subtitle">Voici les offres auxquelles vous avez postulé</p>
              </div>

              <div className="applications-container" style={{ padding: '20px' }}>
                {applications.map((application) => (
                  <div key={application.id} className="application-card" style={{ 
                    background: 'white', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '8px', 
                    padding: '20px', 
                    marginBottom: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <div className="application-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                      <div className="application-company" style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                        <span className="company-icon" style={{ 
                          width: '50px', 
                          height: '50px', 
                          borderRadius: '50%', 
                          background: '#e3f2fd', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '24px',
                          fontWeight: 'bold',
                          flexShrink: 0
                        }}>
                          {getCompanyIcon(application.offer.company_name || application.offer.company || '')}
                        </span>
                        <div>
                          <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '600' }}>{application.offer.title}</h3>
                          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                            {application.offer.company_name || 'Entreprise non spécifiée'} • {application.offer.location || 'Lieu non spécifié'}
                          </p>
                        </div>
                      </div>
                      <span className="application-salary" style={{ color: '#2196F3', fontWeight: '500' }}>
                        {getSalaryRange(application.offer as any)}
                      </span>
                    </div>
                    
                    <div className="application-details" style={{ display: 'flex', gap: '20px', marginBottom: '15px', fontSize: '14px', color: '#666' }}>
                      <span className="job-type">
                        {application.offer.employment_type || application.offer.job_type || 'Type de contrat non spécifié'}
                      </span>
                      <span className="application-date">
                        Postulé le {formatDate(application.applied_at || new Date().toISOString())}
                      </span>
                    </div>
                    
                    <div className="application-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`status-badge ${getStatusBadgeClass(application.status || 'pending')}`} style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {application.status === 'pending' ? 'En attente' : 
                         application.status === 'accepted' ? 'Accepté' :
                         application.status === 'rejected' ? 'Refusé' :
                         application.status === 'interview' ? 'Entretien' : 
                         application.status || 'En attente'}
                      </span>
                      <button 
                        className="view-details-btn"
                        onClick={() => application.offer_id && navigate(`/job-details/${application.offer_id}?from=applied-jobs&status=${application.status || 'pending'}`)}
                        style={{
                          padding: '8px 16px',
                          background: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Voir les détails
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AppliedJobs;
