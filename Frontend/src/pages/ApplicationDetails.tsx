import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { DashboardProps } from '../types';
import './Dashboard.css';

interface ApplicationDetailsData {
  id: number;
  status: string;
  date_application: string;
  phone?: string;
  address?: string;
  portfolio_url?: string;
  cover_letter?: string;
  offer_id: number;
  offer_title: string;
  offer_description?: string;
  offer_location?: string;
  salary_min?: number;
  salary_max?: number;
  salary_type?: string;
  company_name?: string;
  jobType?: string;
  jobLevel?: string;
  cv?: string;
  cv_file?: string; // CV spécifique à la candidature (base64)
  image?: string;
  first_name: string;
  last_name: string;
  email: string;
}

const ApplicationDetails: React.FC<DashboardProps> = ({ onLogout }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<ApplicationDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      if (!id) {
        setError('Application ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const details = await apiService.getApplicationById(parseInt(id));
        setApplication(details);
      } catch (err: any) {
        setError(err.message || 'Failed to load application details');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [id]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'En attente';
      case 'accepted':
        return 'Accepté';
      case 'rejected':
        return 'Refusé';
      case 'reviewed':
        return 'En cours d\'examen';
      case 'interview':
        return 'Entretien';
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction utilitaire pour vérifier si une valeur est valide (non null, non undefined, non vide)
  const isValidValue = (value: any): boolean => {
    return value !== null && value !== undefined && String(value).trim() !== '';
  };

  // Fonction utilitaire pour obtenir une valeur ou un texte par défaut
  const getValueOrDefault = (value: any, defaultValue: string = 'Non renseigné'): string => {
    return isValidValue(value) ? String(value).trim() : defaultValue;
  };

  const getSalaryRange = () => {
    if (!application) return 'Non spécifié';
    const min = application.salary_min;
    const max = application.salary_max;
    const type = application.salary_type;
    
    if (min !== undefined && min !== null && max !== undefined && max !== null) {
      const typeLabel = type === 'Yearly' ? 'an' : type === 'Hourly' ? 'heure' : 'mois';
      return `${min} - ${max} DT/${typeLabel}`;
    } else if (min !== undefined && min !== null) {
      const typeLabel = type === 'Yearly' ? 'an' : type === 'Hourly' ? 'heure' : 'mois';
      return `À partir de ${min} DT/${typeLabel}`;
    } else if (max !== undefined && max !== null) {
      const typeLabel = type === 'Yearly' ? 'an' : type === 'Hourly' ? 'heure' : 'mois';
      return `Jusqu'à ${max} DT/${typeLabel}`;
    }
    return 'Non spécifié';
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="welcome-section">
          <h1 className="welcome-title">Détails de la candidature</h1>
          <p className="welcome-subtitle">Chargement en cours...</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="welcome-section">
          <h1 className="welcome-title">Erreur</h1>
          <p className="welcome-subtitle">{error}</p>
        </div>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <button onClick={() => navigate('/applied-jobs')} className="btn btn-primary">
            Retour aux candidatures
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="dashboard">
        <div className="welcome-section">
          <h1 className="welcome-title">Candidature introuvable</h1>
          <p className="welcome-subtitle">La candidature demandée n'existe pas ou n'est plus disponible.</p>
        </div>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <button onClick={() => navigate('/applied-jobs')} className="btn btn-primary">
            Retour aux candidatures
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">💼</span>
            <span className="logo-text">RecruPlus</span>
          </div>
          <nav className="main-nav">
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
              Home
            </a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/find-jobs'); }}>
              Find Job
            </a>
            <a href="#" className="nav-link active" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
              Dashboard
            </a>
          </nav>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="dashboard-sidebar">
          <h3 className="sidebar-title">CANDIDATE DASHBOARD</h3>
          <nav className="sidebar-nav">
            <ul>
              <li>
                <a href="#" className="sidebar-link" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
                  <span className="sidebar-icon">📊</span>
                  <span className="sidebar-label">Overview</span>
                </a>
              </li>
              <li>
                <a href="#" className="sidebar-link active" onClick={(e) => { e.preventDefault(); navigate('/applied-jobs'); }}>
                  <span className="sidebar-icon">💼</span>
                  <span className="sidebar-label">Applied Jobs</span>
                </a>
              </li>
              <li>
                <a href="#" className="sidebar-link" onClick={(e) => { e.preventDefault(); navigate('/saved-jobs'); }}>
                  <span className="sidebar-icon">💾</span>
                  <span className="sidebar-label">Saved Jobs</span>
                </a>
              </li>
            </ul>
          </nav>
          <div className="logout-section">
            <button onClick={onLogout} className="logout-link">
              <span className="logout-icon">↗️</span>
              Log-out
            </button>
          </div>
        </aside>

        <main className="dashboard-main">
          <div className="welcome-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h1 className="welcome-title">Détails de la candidature</h1>
              <button 
                onClick={() => navigate('/applied-jobs')}
                style={{
                  padding: '8px 16px',
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ← Retour
              </button>
            </div>
          </div>

          <div style={{ padding: '20px' }}>
            {/* Status Badge */}
            <div style={{ marginBottom: '30px' }}>
              <span 
                className={`status-badge ${getStatusBadgeClass(application.status)}`}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {getStatusLabel(application.status)}
              </span>
            </div>

            {/* Application Information Card */}
            <div style={{ 
              background: 'white', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              padding: '24px', 
              marginBottom: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', color: '#333' }}>
                Informations de candidature
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
                    Date de candidature
                  </p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>
                    {formatDate(application.date_application)}
                  </p>
                </div>

                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
                    Téléphone
                  </p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>
                    {getValueOrDefault(application.phone)}
                  </p>
                </div>

                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
                    Email
                  </p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>
                    {getValueOrDefault(application.email)}
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
                  Adresse
                </p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>
                  {getValueOrDefault(application.address)}
                </p>
              </div>

              <div style={{ marginTop: '20px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
                  Portfolio
                </p>
                {isValidValue(application.portfolio_url) ? (
                  <a 
                    href={String(application.portfolio_url)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      fontSize: '16px', 
                      color: '#2196F3', 
                      textDecoration: 'none',
                      wordBreak: 'break-all'
                    }}
                  >
                    {String(application.portfolio_url)}
                  </a>
                ) : (
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 500, color: '#999' }}>
                    Non renseigné
                  </p>
                )}
              </div>

              <div style={{ marginTop: '20px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
                  Lettre de motivation
                </p>
                {isValidValue(application.cover_letter) ? (
                  <div style={{
                    background: '#f5f5f5',
                    padding: '16px',
                    borderRadius: '4px',
                    whiteSpace: 'pre-wrap',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#333'
                  }}>
                    {String(application.cover_letter)}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 500, color: '#999' }}>
                    Non renseigné
                  </p>
                )}
              </div>

              <div style={{ marginTop: '20px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
                  CV
                </p>
                {isValidValue(application.cv_file) ? (
                  <div>
                    <a 
                      href={String(application.cv_file)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      download={`CV_Candidature_${application.id}.pdf`}
                      style={{ 
                        fontSize: '16px', 
                        color: '#2196F3', 
                        textDecoration: 'none',
                        display: 'inline-block',
                        padding: '8px 16px',
                        background: '#f5f5f5',
                        borderRadius: '4px',
                        marginRight: '10px'
                      }}
                    >
                      📄 Télécharger le CV de la candidature
                    </a>
                    <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '8px' }}>
                      (CV spécifique à cette candidature)
                    </small>
                  </div>
                ) : isValidValue(application.cv) ? (
                  <div>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>
                      {String(application.cv)}
                    </p>
                    <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '8px' }}>
                      (CV du profil candidat)
                    </small>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 500, color: '#999' }}>
                    Non renseigné
                  </p>
                )}
              </div>
            </div>

            {/* Job Offer Information Card */}
            <div style={{ 
              background: 'white', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              padding: '24px', 
              marginBottom: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', color: '#333' }}>
                Détails de l'offre d'emploi
              </h2>

              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600, color: '#2196F3' }}>
                  {application.offer_title}
                </h3>
                {application.company_name && (
                  <p style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#666' }}>
                    {application.company_name}
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                {application.offer_location && (
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
                      Localisation
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>
                      📍 {application.offer_location}
                    </p>
                  </div>
                )}

                {(application.salary_min || application.salary_max) && (
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
                      Salaire
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>
                      💰 {getSalaryRange()}
                    </p>
                  </div>
                )}

                {application.jobType && (
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
                      Type de contrat
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>
                      💼 {application.jobType}
                    </p>
                  </div>
                )}

                {application.jobLevel && (
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
                      Niveau
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>
                      📊 {application.jobLevel}
                    </p>
                  </div>
                )}
              </div>

              {application.offer_description && (
                <div style={{ marginTop: '20px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
                    Description de l'offre
                  </p>
                  <div style={{
                    background: '#f9f9f9',
                    padding: '16px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#333',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {application.offer_description}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => navigate('/applied-jobs')}
                style={{
                  padding: '10px 20px',
                  background: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Retour aux candidatures
              </button>
              <button
                onClick={() => navigate(`/job-details/${application.offer_id}`)}
                style={{
                  padding: '10px 20px',
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Voir l'offre complète
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApplicationDetails;

