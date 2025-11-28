import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Application, Offer } from '../types';
import './Dashboard.css';

interface ApplicationWithOffer extends Omit<Application, 'status'> {
  id: number;
  offer_id: number;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'interview';
  applied_at: string;
  offer: Offer & {
    company?: string;
    location?: string;
    min_salary?: number;
    max_salary?: number;
    salary_type?: 'Yearly' | 'Monthly' | 'Hourly';
    job_type?: string;
  };
}

const AppliedJobs: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationWithOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        
        // Récupérer les candidatures du candidat
        const apps = await apiService.getApplications(candidate.id);
        
        // Pour chaque candidature, récupérer les détails de l'offre
        const appsWithOffers = await Promise.all(
          apps.map(async (app: any) => {
            try {
              const offer = await apiService.getOffer(app.offer_id);
              return { ...app, offer };
            } catch (err) {
              console.error(`Error fetching offer ${app.offer_id}:`, err);
              return { ...app, offer: null };
            }
          })
        );

        setApplications(appsWithOffers.filter(app => app.offer !== null));
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Erreur lors du chargement des candidatures');
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
    if (offer.min_salary !== undefined && offer.max_salary !== undefined) {
      return `${offer.min_salary} - ${offer.max_salary} DT/${offer.salary_type === 'Yearly' ? 'an' : 'mois'}`;
    }
    return 'Salaire non spécifié';
  };

  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Mes Candidatures</h2>
          <p>Chargement de vos candidatures en cours...</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Mes Candidatures</h2>
          <p>Une erreur est survenue</p>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Mes Candidatures</h2>
          <p>Vous n'avez encore postulé à aucune offre</p>
        </div>
        <div className="no-applications">
          <p>Parcourez les offres disponibles et postulez pour commencer votre recherche d'emploi !</p>
          <button 
            onClick={() => navigate('/find-jobs')} 
            className="btn btn-primary"
          >
            Voir les offres disponibles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h2>Mes Candidatures</h2>
        <p>Voici les offres auxquelles vous avez postulé</p>
      </div>

      <div className="applications-container">
        {applications.map((application) => (
          <div key={application.id} className="application-card">
            <div className="application-header">
              <div className="application-company">
                <span className="company-icon">
                  {getCompanyIcon(application.offer.company || '')}
                </span>
                <div>
                  <h3>{application.offer.title}</h3>
                  <p>{application.offer.company || 'Entreprise non spécifiée'} • {application.offer.location || 'Lieu non spécifié'}</p>
                </div>
              </div>
              <span className="application-salary">
                {getSalaryRange(application.offer as any)}
              </span>
            </div>
            
            <div className="application-details">
              <span className="job-type">
                {application.offer.job_type || 'Type de contrat non spécifié'}
              </span>
              <span className="application-date">
                Postulé le {formatDate(application.applied_at || new Date().toISOString())}
              </span>
            </div>
            
            <div className="application-actions">
              <span className={`status-badge ${getStatusBadgeClass(application.status || 'pending')}`}>
                {application.status || 'En attente'}
              </span>
              <button 
                className="view-details-btn"
                onClick={() => application.offer_id && navigate(`/job-application/${application.offer_id}`)}
              >
                Voir les détails
              </button>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default AppliedJobs;
