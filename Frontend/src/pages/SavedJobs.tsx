import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Offer, NavigationItem, SidebarItem } from '../types';
import { apiService } from '../services/api';
import './SavedJobs.css';
import './Dashboard.css';

interface SavedJobsProps {
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  onLogout?: () => void;
}

const SavedJobs: React.FC<SavedJobsProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Saved_Jobs');

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
    if (itemId === 'Applied_Jobs') {
      navigate('/applied-jobs');
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
    const loadSavedJobs = async () => {
      try {
        console.log('📋 Loading saved jobs...');
        const data = await apiService.getSavedJobs();
        console.log('📋 Saved jobs loaded:', data);
        console.log('📋 Number of saved jobs:', data?.length || 0);
        if (data && data.length > 0) {
          console.log('📋 First saved job:', data[0]);
        }
        setSavedJobs(Array.isArray(data) ? data : []);
      } catch (error: any) {
        console.error('❌ Erreur lors du chargement des emplois sauvegardés:', error);
        console.error('❌ Error details:', error.message);
        setSavedJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedJobs();
  }, []);

  const handleUnsaveJob = async (jobId: number) => {
    try {
      await apiService.unsaveJob(jobId);
      setSavedJobs(savedJobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'emploi sauvegardé:', error);
    }
  };

  const handleViewDetails = (jobId: number) => {
    navigate(`/job-details/${jobId}`);
  };

  if (isLoading) {
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
          </aside>

          <main className="dashboard-main">
            <div className="loading">Chargement des emplois sauvegardés...</div>
          </main>
        </div>
      </div>
    );
  }

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
          <div className="welcome-section">
            <h1 className="welcome-title">Emplois Sauvegardés</h1>
            <p className="welcome-subtitle">Voici les offres que vous avez sauvegardées</p>
          </div>
      
          {savedJobs.length > 0 ? (
            <div className="jobs-grid" style={{ padding: '20px' }}>
              {savedJobs.map(job => (
                <div key={job.id} className="job-card" style={{ 
                  background: 'white', 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '8px', 
                  padding: '20px', 
                  marginBottom: '20px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div className="job-card-header" style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '15px' }}>
                    <div className="job-company-icon" style={{ 
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
                      {job.title ? job.title.substring(0, 1).toUpperCase() : 'J'}
                    </div>
                    <div className="job-card-title-section" style={{ flex: 1 }}>
                      <h3 className="job-title" style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '600' }}>
                        {job.title || 'Titre non spécifié'}
                      </h3>
                      <p className="job-company" style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                        {job.company_name || 'Entreprise non spécifiée'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="job-card-body" style={{ marginBottom: '15px' }}>
                    <p className="job-location" style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                      📍 {job.location || 'Localisation non spécifiée'}
                    </p>
                    <p className="job-salary" style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                      💰 {(job.salary_min !== null && job.salary_min !== undefined) && (job.salary_max !== null && job.salary_max !== undefined)
                        ? `${job.salary_min} - ${job.salary_max} DT/${((job as any).salary_type === 'Yearly' ? 'an' : (job as any).salary_type === 'Hourly' ? 'heure' : 'mois')}`
                        : 'Salaire non spécifié'}
                    </p>
                    <p className="job-type" style={{ 
                      margin: '5px 0', 
                      fontSize: '12px', 
                      padding: '4px 8px', 
                      background: '#e3f2fd', 
                      color: '#1976d2',
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}>
                      {job.employment_type || 'Type de contrat non spécifié'}
                    </p>
                    <p className="job-description" style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666' }}>
                      {job.description 
                        ? (job.description.length > 100 ? job.description.substring(0, 100) + '...' : job.description)
                        : 'Description non disponible'}
                    </p>
                  </div>
                  
                  <div className="job-card-footer">
                    <div className="job-actions" style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        className="apply-btn"
                        onClick={() => handleViewDetails(job.id)}
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
                      <button 
                        className="unsave-btn"
                        onClick={() => handleUnsaveJob(job.id)}
                        style={{
                          padding: '8px 16px',
                          background: '#f5f5f5',
                          color: '#666',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ marginBottom: '20px', fontSize: '16px', color: '#666' }}>
                Vous n'avez sauvegardé aucun emploi pour le moment.
              </p>
              <button 
                className="primary-btn"
                onClick={() => navigate('/find-jobs')}
                style={{
                  padding: '12px 24px',
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Parcourir les offres
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SavedJobs;
