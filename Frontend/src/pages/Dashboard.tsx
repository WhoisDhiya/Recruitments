import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import AppliedJobs from './AppliedJobs';
import Settings from './Settings';
import { apiService } from '../services/api';
import type { 
  DashboardProps, 
  NavigationItem, 
  SidebarItem, 
  SummaryCard, 
  ApplicationUI, 
  ActiveTab,
  Offer
} from '../types';
interface DashboardPropsExtended extends DashboardProps {
  isAuthenticated: boolean;
}

const Dashboard: React.FC<DashboardPropsExtended> = ({ onLogout, user }) => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<ActiveTab | string>('Overview');
  const [summaryStats, setSummaryStats] = useState<{
    appliedJobs: number;
    savedJobs: number;
    jobAlerts: number;
  }>({
    appliedJobs: 0,
    savedJobs: 0,
    jobAlerts: 0
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isLoading, setIsLoading] = useState<boolean>(true);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [recentApplications, setRecentApplications] = useState<ApplicationUI[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;


  // Charger les statistiques du dashboard
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        // Les statistiques seront mises à jour par d'autres useEffect
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        setIsLoading(false);
      }
    };

    if (user?.role === 'candidate') {
      loadDashboardStats();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Charger le nombre de notifications non lues (Job Alerts)
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await apiService.getUnreadNotificationsCount();
        setUnreadNotificationsCount(count);
        // Mettre à jour le nombre de Job Alerts dans les statistiques
        setSummaryStats(prev => ({
          ...prev,
          jobAlerts: count
        }));
      } catch (error) {
        console.error('Error loading unread notifications count:', error);
      }
    };
    
    if (user?.role === 'candidate') {
      loadUnreadCount();
      // Recharger le compte toutes les 30 secondes
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Debug: Afficher l'onglet actif
  console.log('Active tab:', activeTab);

  const navigationItems: NavigationItem[] = [
    { id: 'Home', label: 'Home' },
    { id: 'Find_Job', label: 'Find Job', path: '/find-jobs' },
    { id: 'Dashboard', label: 'Dashboard', active: true },
    { id: 'Job_Alerts', label: 'Job Alerts' },
    { id: 'Customer_Supports', label: 'Customer Supports' }
  ];

  // État pour les emplois sauvegardés
  const [savedJobs, setSavedJobs] = useState<Offer[]>([]);
  
  // Charger les emplois sauvegardés au chargement du composant
  useEffect(() => {
    const loadSavedJobs = async () => {
      if (user?.role !== 'candidate') {
        return;
      }

      try {
        // Charger les emplois sauvegardés depuis l'API
        const savedJobsData = await apiService.getSavedJobs();
        setSavedJobs(savedJobsData || []);
        
        // Mettre à jour le nombre de Saved Jobs dans les statistiques
        setSummaryStats(prev => ({
          ...prev,
          savedJobs: savedJobsData?.length || 0
        }));
      } catch (error) {
        console.error('Erreur lors du chargement des emplois sauvegardés:', error);
        setSavedJobs([]);
      }
    };

    loadSavedJobs();
  }, [user]);

  const handleSidebarClick = (id: string) => {
    console.log('Sidebar item clicked:', id);
    
    // Mettre à jour l'onglet actif
    setActiveTab(id as ActiveTab);
    
    // Si c'est Saved_Jobs, naviguer vers la page SavedJobs
    if (id === 'Saved_Jobs') {
      navigate('/saved-jobs');
      return;
    }
    
    // Si c'est Settings, naviguer vers la page Settings
    if (id === 'Settings') {
      navigate('/settings');
      return;
    }
    
    // Si c'est Applied_Jobs, naviguer vers la page AppliedJobs
    if (id === 'Applied_Jobs') {
      navigate('/applied-jobs');
      return;
    }
    
    // Si c'est Job_Alert, naviguer vers la page Notifications
    if (id === 'Job_Alert') {
      navigate('/notifications');
      return;
    }
  };
  
  // Fonction pour afficher les détails d'un emploi
  const handleViewJobDetails = (jobId: number) => {
    navigate(`/job-details/${jobId}`);
  };
  
  // Fonction pour retirer un emploi des favoris
  const handleUnsaveJob = async (jobId: number) => {
    try {
      await apiService.unsaveJob(jobId);
      setSavedJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      
      // Mettre à jour le compteur dans les cartes de résumé
      setSummaryStats(prev => ({
        ...prev,
        savedJobs: prev.savedJobs - 1
      }));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'emploi sauvegardé:', error);
    }
  };

  // Charger les 3 candidatures les plus récentes
  useEffect(() => {
    const loadRecentApplications = async () => {
      if (user?.role !== 'candidate') {
        return;
      }

      try {
        const currentUser = apiService.getCurrentUser();
        if (!currentUser) {
          return;
        }

        // Récupérer le profil candidat
        const candidate = await apiService.getCandidateByUserId(currentUser.id);
        if (!candidate || !candidate.id) {
          return;
        }

        // Récupérer les candidatures du candidat
        const apps = await apiService.getApplications(candidate.id);
        
        // Trier par date (plus récentes en premier)
        const sortedApps = [...apps].sort((a: any, b: any) => {
          const dateA = new Date(a.date_application || a.applied_at || 0).getTime();
          const dateB = new Date(b.date_application || b.applied_at || 0).getTime();
          return dateB - dateA;
        });

        // Transformer TOUTES les candidatures en format ApplicationUI (pas seulement 3)
        const formattedApps = await Promise.all(
          sortedApps.map(async (app: any): Promise<(ApplicationUI & { offerId?: number }) | null> => {
            try {
              // Récupérer les détails de l'offre
              let offerDetails = app.offer;
              if (!offerDetails && app.offer_id) {
                offerDetails = await apiService.getOffer(app.offer_id);
              }

              const getSalaryRange = (offer: any) => {
                const minSalary = offer?.min_salary ?? offer?.salary_min ?? offer?.requirement?.minSalary;
                const maxSalary = offer?.max_salary ?? offer?.salary_max ?? offer?.requirement?.maxSalary;
                const salaryType = offer?.salary_type ?? offer?.salaryType ?? offer?.requirement?.salaryType;
                
                if (minSalary !== null && minSalary !== undefined && maxSalary !== null && maxSalary !== undefined) {
                  const typeLabel = salaryType === 'Yearly' ? 'an' : salaryType === 'Hourly' ? 'heure' : 'mois';
                  return `${minSalary} - ${maxSalary} DT/${typeLabel}`;
                } else if (minSalary !== null && minSalary !== undefined) {
                  const typeLabel = salaryType === 'Yearly' ? 'an' : salaryType === 'Hourly' ? 'heure' : 'mois';
                  return `À partir de ${minSalary} DT/${typeLabel}`;
                }
                return 'Salaire non spécifié';
              };

              const formatDate = (dateString: string) => {
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              };

              const getStatusLabel = (status: string) => {
                const statusMap: Record<string, string> = {
                  'pending': 'En attente',
                  'reviewed': 'En cours d\'examen',
                  'accepted': 'Acceptée',
                  'rejected': 'Refusée',
                  'interview': 'Entretien'
                };
                return statusMap[status] || status;
              };

              const getIconForJob = (title: string) => {
                const lowerTitle = title.toLowerCase();
                if (lowerTitle.includes('engineer') || lowerTitle.includes('developer')) return { icon: '⚙️', color: 'blue' };
                if (lowerTitle.includes('designer')) return { icon: '🎨', color: 'pink' };
                if (lowerTitle.includes('manager')) return { icon: '📊', color: 'green' };
                if (lowerTitle.includes('analyst')) return { icon: '📈', color: 'orange' };
                return { icon: '💼', color: 'gray' };
              };

              const iconData = getIconForJob(offerDetails?.title || '');

              return {
                id: app.id,
                offerId: app.offer_id, // Conserver l'ID de l'offre pour la navigation
                job: {
                  title: offerDetails?.title || 'Titre non spécifié',
                  company: offerDetails?.company_name || offerDetails?.company || 'Entreprise non spécifiée',
                  location: offerDetails?.location || offerDetails?.company_address || 'Localisation non spécifiée',
                  salary: getSalaryRange(offerDetails || {}),
                  type: offerDetails?.employment_type || offerDetails?.job_type || 'Type non spécifié',
                  icon: iconData.icon,
                  iconColor: iconData.color
                },
                dateApplied: formatDate(app.date_application || app.applied_at || new Date().toISOString()),
                status: getStatusLabel(app.status || 'pending'),
                action: 'View Details'
              };
            } catch (error) {
              console.error('Error formatting application:', error);
              return null;
            }
          })
        );

        // Filtrer les nulls et mettre à jour le state
        const validApps = formattedApps.filter((app): app is ApplicationUI & { offerId?: number } => app !== null);
        setRecentApplications(validApps as ApplicationUI[]);
        
        // Réinitialiser la page à 1 si on a moins de candidatures que la page actuelle
        const totalPages = Math.ceil(validApps.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(1);
        }

        // Mettre à jour le compteur de candidatures
        setSummaryStats(prev => ({
          ...prev,
          appliedJobs: apps.length
        }));
      } catch (error) {
        console.error('Error loading recent applications:', error);
        setRecentApplications([]);
      }
    };

    loadRecentApplications();
  }, [user]);

  const sidebarItems: SidebarItem[] = [
    { id: 'Overview', label: 'Overview', icon: '📊' },
    { id: 'Applied_Jobs', label: 'Applied Jobs', icon: '💼' },
    { id: 'Saved_Jobs', label: 'Saved Jobs', icon: '💾' },
    { id: 'Job_Alert', label: 'Job Alert', icon: '🔔', badge: unreadNotificationsCount > 0 ? unreadNotificationsCount.toString() : undefined },
    { id: 'Settings', label: 'Settings', icon: '⚙️' }
  ];

  const summaryCards: SummaryCard[] = [
    { title: 'Applied jobs', count: summaryStats.appliedJobs.toString(), icon: '💼', color: 'blue' },
    { title: 'Saved jobs', count: summaryStats.savedJobs.toString(), icon: '💾', color: 'yellow' },
    { title: 'Job Alerts', count: summaryStats.jobAlerts.toString(), icon: '🔔', color: 'green' }
  ];


  return (
    <div className="dashboard">
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
                className={`nav-link ${item.active ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.id === 'Home') {
                    navigate('/');
                    return;
                  } else if (item.id === 'Dashboard') {
                    setActiveTab('Overview');
                  } else if (item.id === 'Find_Job') {
                    navigate('/find-jobs');
                  } else if (item.id === 'Job_Alerts') {
                    navigate('/notifications');
                  } else if (item.id === 'Customer_Supports') {
                    navigate('/customer-support');
                  }
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
          {/* La page d'accueil est maintenant gérée par la route racine */}

          {activeTab === 'Overview' && (
            <>
              <div className="welcome-section">
                <h1 className="welcome-title">
                  Hello {user?.first_name} {user?.last_name}
                </h1>
                <p className="welcome-subtitle">Here is your daily activities and job alerts</p>
              </div>

              {/* Summary Cards */}
              <div className="summary-cards">
                {summaryCards.map((card, index) => (
                  <div key={index} className={`summary-card ${card.color}`}>
                    <div className="card-icon">{card.icon}</div>
                    <div className="card-content">
                      <div className="card-count">{card.count}</div>
                      <div className="card-title">{card.title}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recently Applied Section */}
              <div className="recently-applied">
                <div className="section-header">
                  <h2 className="section-title">Recently Applied Jobs</h2>
                  <a 
                    href="#" 
                    className="view-all-link"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/applied-jobs');
                    }}
                  >
                    View all →
                  </a>
                </div>
                
                <div className="applications-table">
                  <div className="table-header">
                    <div className="table-cell">Job</div>
                    <div className="table-cell">Date Applied</div>
                    <div className="table-cell">Status</div>
                    <div className="table-cell">Action</div>
                  </div>
                  
                  {/* Pagination: afficher seulement les 3 candidatures de la page actuelle */}
                  {recentApplications
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map(application => (
                    <div key={application.id} className="table-row">
                      <div className="table-cell job-cell">
                        <div className="job-info">
                          <div className="job-icon-container">
                            <span className={`job-icon ${application.job.iconColor}`}>
                              {application.job.icon}
                            </span>
                            <span className={`trend-icon ${application.job.iconColor}`}>↗️</span>
                          </div>
                          <div className="job-details">
                            <div className="job-title">{application.job.title}</div>
                            <div className="job-meta">
                              <span className="job-type">{application.job.type}</span>
                              <span className="job-location">{application.job.location}</span>
                              <span className="job-salary">{application.job.salary}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="table-cell date-cell">
                        {application.dateApplied}
                      </div>
                      
                      <div className="table-cell status-cell">
                        <span className="status-badge">✓ {application.status}</span>
                      </div>
                      
                      <div className="table-cell action-cell">
                        <button 
                          className="action-button"
                          onClick={() => {
                            const app = recentApplications.find(a => a.id === application.id) as any;
                            if (app && app.offerId) {
                              navigate(`/job-details/${app.offerId}`);
                            } else {
                              navigate('/applied-jobs');
                            }
                          }}
                        >
                          {application.action}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {recentApplications.length > itemsPerPage && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '20px',
                    padding: '15px',
                    background: '#f5f5f5',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, recentApplications.length)} sur {recentApplications.length} candidatures
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        style={{
                          padding: '8px 16px',
                          background: currentPage === 1 ? '#e0e0e0' : '#2196F3',
                          color: currentPage === 1 ? '#999' : 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        ← Précédent
                      </button>
                      
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {Array.from({ length: Math.ceil(recentApplications.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            style={{
                              padding: '8px 12px',
                              background: currentPage === page ? '#2196F3' : 'white',
                              color: currentPage === page ? 'white' : '#666',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: currentPage === page ? '600' : '400',
                              minWidth: '36px'
                            }}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(recentApplications.length / itemsPerPage), prev + 1))}
                        disabled={currentPage === Math.ceil(recentApplications.length / itemsPerPage)}
                        style={{
                          padding: '8px 16px',
                          background: currentPage === Math.ceil(recentApplications.length / itemsPerPage) ? '#e0e0e0' : '#2196F3',
                          color: currentPage === Math.ceil(recentApplications.length / itemsPerPage) ? '#999' : 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: currentPage === Math.ceil(recentApplications.length / itemsPerPage) ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        Suivant →
                      </button>
                    </div>
                  </div>
                )}

                {/* Message si aucune candidature */}
                {recentApplications.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#666',
                    fontSize: '16px'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>📭</div>
                    <p>Aucune candidature récente. Commencez à postuler dès maintenant !</p>
                    <button
                      onClick={() => navigate('/find-jobs')}
                      style={{
                        marginTop: '20px',
                        padding: '12px 24px',
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '500'
                      }}
                    >
                      Parcourir les offres
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'Applied_Jobs' && (
            <AppliedJobs />
          )}

          {activeTab === 'Settings' && (
            <Settings user={user} />
          )}
          
          {activeTab === 'Saved_Jobs' && (
            <div className="saved-jobs-section">
              <div className="section-header">
                <h2 className="section-title">Emplois Sauvegardés</h2>
              </div>
              
              {savedJobs.length > 0 ? (
                <div className="jobs-grid">
                  {savedJobs.map(job => (
                    <div key={job.id} className="job-card">
                      <div className="job-card-header">
                        <div className="job-company-icon">
                          {job.title ? job.title.substring(0, 1).toUpperCase() : 'J'}
                        </div>
                        <div className="job-card-title-section">
                          <h3 className="job-title">{job.title}</h3>
                          <p className="job-company">{job.company_name || 'Entreprise non spécifiée'}</p>
                        </div>
                      </div>
                      <div className="job-card-body">
                        <div className="job-meta">
                          <span className="job-location">📍 {job.location}</span>
                          <span className="job-salary">💰 {job.salary_min} - {job.salary_max} DT</span>
                          <span className="job-type">🏢 {job.employment_type}</span>
                        </div>
                        <div className="job-actions">
                          <button 
                            className="action-button"
                            onClick={() => handleViewJobDetails(job.id)}
                          >
                            Voir les détails
                          </button>
                          <button 
                            className="action-button secondary"
                            onClick={() => handleUnsaveJob(job.id)}
                          >
                            Retirer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-jobs-message">
                  <p>Vous n'avez aucun emploi sauvegardé pour le moment.</p>
                  <button 
                    className="browse-jobs-button"
                    onClick={() => navigate('/find-jobs')}
                  >
                    Parcourir les offres d'emploi
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
