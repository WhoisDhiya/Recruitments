import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import AppliedJobs from './AppliedJobs';
import Settings from './Settings';
import type { 
  DashboardProps, 
  NavigationItem, 
  SidebarItem, 
  SummaryCard, 
  Country, 
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
  const [selectedCountry, setSelectedCountry] = useState<string>('Tunisia');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState<boolean>(false);
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

  const countries: Country[] = [
    { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
    { code: 'PS', name: 'Palestine', flag: '🇵🇸' },
    { code: 'AE', name: 'UAE', flag: '🇦🇪' }
  ];

  const handleCountrySelect = (countryName: string): void => {
    setSelectedCountry(countryName);
    setIsCountryDropdownOpen(false);
  };

  // Charger les statistiques du dashboard
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        // Simuler des statistiques pour le moment
        setSummaryStats({
          appliedJobs: 5,
          savedJobs: 3,
          jobAlerts: 2
        });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'candidate') {
      loadDashboardStats();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Debug: Afficher l'onglet actif
  console.log('Active tab:', activeTab);

  const navigationItems: NavigationItem[] = [
    { id: 'Home', label: 'Home' },
    { id: 'Find_Job', label: 'Find Job', path: '/find-jobs' },
    { id: 'Find_Employers', label: 'Find Employers' },
    { id: 'Dashboard', label: 'Dashboard', active: true },
    { id: 'Job_Alerts', label: 'Job Alerts' },
    { id: 'Customer_Supports', label: 'Customer Supports' }
  ];

  // État pour les emplois sauvegardés
  const [savedJobs, setSavedJobs] = useState<Offer[]>([]);
  
  // Fonction pour charger les emplois sauvegardés
  const loadSavedJobs = async () => {
    if (user?.id) {
      try {
        // Données de démonstration
        const demoJobs: Offer[] = [
          {
            id: 1,
            recruiter_id: 1,
            title: 'Développeur Full Stack',
            date_offer: new Date().toISOString(),
            description: 'Description du poste de développeur Full Stack',
            location: 'Tunis',
            company_name: 'TechCorp',
            employment_type: 'Temps plein',
            salary_min: 3000,
            salary_max: 4000,
            category: 'Développement',
            requirements: []
          },
          {
            id: 2,
            recruiter_id: 2,
            title: 'Designer UX/UI',
            date_offer: new Date().toISOString(),
            description: 'Description du poste de Designer UX/UI',
            location: 'Sousse',
            company_name: 'DesignHub',
            employment_type: 'Temps plein',
            salary_min: 2500,
            salary_max: 3500,
            category: 'Design',
            requirements: []
          }
        ];
        
        setSavedJobs(demoJobs);
      } catch (error) {
        console.error('Erreur lors du chargement des emplois sauvegardés:', error);
      }
    }
  };
  
  // Charger les emplois sauvegardés au chargement du composant
  useEffect(() => {
    loadSavedJobs();
  }, [user]);

  const handleSidebarClick = (id: string) => {
    console.log('Sidebar item clicked:', id);
    
    // Mettre à jour l'onglet actif
    setActiveTab(id as ActiveTab);
    
    // Si c'est Saved_Jobs, charger les emplois sauvegardés
    if (id === 'Saved_Jobs') {
      loadSavedJobs();
    }
  };
  
  // Fonction pour afficher les détails d'un emploi
  const handleViewJobDetails = (jobId: number) => {
    navigate(`/job-details/${jobId}`);
  };
  
  // Fonction pour retirer un emploi des favoris
  const handleUnsaveJob = async (jobId: number) => {
    try {
      // Remplacer par un appel API réel
      // await apiService.unsaveJob(jobId);
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

  const sidebarItems: SidebarItem[] = [
    { id: 'Overview', label: 'Overview', icon: '📊' },
    { id: 'Applied_Jobs', label: 'Applied Jobs', icon: '💼' },
    { id: 'Saved_Jobs', label: 'Saved Jobs', icon: '💾' },
    { id: 'Job_Alert', label: 'Job Alert', icon: '🔔', badge: '09' },
    { id: 'Settings', label: 'Settings', icon: '⚙️' }
  ];

  const summaryCards: SummaryCard[] = [
    { title: 'Applied jobs', count: summaryStats.appliedJobs.toString(), icon: '💼', color: 'blue' },
    { title: 'Saved jobs', count: savedJobs.length.toString(), icon: '💾', color: 'yellow' },
    { title: 'Job Alerts', count: summaryStats.jobAlerts.toString(), icon: '🔔', color: 'green' }
  ];

  // Données des candidatures pour la page Overview (candidatures récentes)
  const recentApplications: ApplicationUI[] = [
    {
      id: 1,
      job: {
        title: 'Networking Engineer',
        company: 'Up',
        location: 'Sousse',
        salary: '1500-2000 DT/month',
        type: 'Remote',
        icon: '📈',
        iconColor: 'green'
      },
      dateApplied: 'Feb 2, 2019 19:28',
      status: 'Active',
      action: 'View Details'
    },
    {
      id: 2,
      job: {
        title: 'Product Designer',
        company: 'DesignStudio',
        location: 'Mahdia',
        salary: '1500-1800 DT/month',
        type: 'Full Time',
        icon: '⚙️',
        iconColor: 'pink'
      },
      dateApplied: 'Dec 7, 2019 23:26',
      status: 'Active',
      action: 'View Details'
    },
    {
      id: 3,
      job: {
        title: 'Junior Graphic Designer',
        company: 'Apple Inc',
        location: 'Monastir',
        salary: '1400-1800 DT/month',
        type: 'Temporary',
        icon: '🍎',
        iconColor: 'black'
      },
      dateApplied: 'Feb 2, 2019 19:28',
      status: 'Active',
      action: 'View Details'
    },
    {
      id: 4,
      job: {
        title: 'Visual Designer',
        company: 'Microsoft',
        location: 'Tunis',
        salary: '2000-2500 DT/month',
        type: 'Contract Base',
        icon: '🪟',
        iconColor: 'multicolor'
      },
      dateApplied: 'Dec 7, 2019 23:26',
      status: 'Active',
      action: 'View Details'
    }
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
                  }
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        
        <div className="header-center">
          <div className="search-container">
            <div className="location-selector-container">
              <div 
                className="location-selector"
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
              >
                <div className="selected-country">
                  <span className="flag">{countries.find(c => c.name === selectedCountry)?.flag}</span>
                  <span>{selectedCountry}</span>
                </div>
                <span className="dropdown-arrow">▼</span>
              </div>
              
              {isCountryDropdownOpen && (
                <div className="country-dropdown">
                  <div className="country-list">
                    {countries.map(country => (
                      <div 
                        key={country.code}
                        className={`country-option ${selectedCountry === country.name ? 'selected' : ''}`}
                        onClick={() => handleCountrySelect(country.name)}
                      >
                        <span className="country-flag">{country.flag}</span>
                        <span className="country-name">{country.name}</span>
                        {selectedCountry === country.name && (
                          <span className="checkmark">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <input 
              type="text" 
              placeholder="Job title, keyword, company"
              className="search-input"
            />
          </div>
        </div>
        
        <div className="header-right">
          <div className="contact-info">
            <span className="phone">+216 23 235 891</span>
          </div>
          <div className="language-selector">
            <span className="flag">🇺🇸</span>
            <span>English</span>
          </div>
          <div className="header-icons">
            <button className="icon-btn notification-btn">🔔</button>
            <button className="icon-btn profile-btn">⚫</button>
          </div>
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
                  <h2 className="section-title">Recently Applied</h2>
                  <a href="#" className="view-all-link">View all →</a>
                </div>
                
                <div className="applications-table">
                  <div className="table-header">
                    <div className="table-cell">Job</div>
                    <div className="table-cell">Date Applied</div>
                    <div className="table-cell">Status</div>
                    <div className="table-cell">Action</div>
                  </div>
                  
                  {recentApplications.map(application => (
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
                        <button className="action-button">
                          {application.action}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
