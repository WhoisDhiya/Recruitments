import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Offer } from '../types';
import './SavedJobs.css';

const SavedJobs = () => {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSavedJobs = async () => {
      try {
        // Remplacer par un appel API réel
        // const response = await apiService.getSavedJobs();
        // setSavedJobs(response.data);
        
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
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des emplois sauvegardés:', error);
        setIsLoading(false);
      }
    };

    loadSavedJobs();
  }, []);

  const handleUnsaveJob = async (jobId: number) => {
    try {
      // Remplacer par un appel API réel
      // await apiService.unsaveJob(jobId);
      setSavedJobs(savedJobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'emploi sauvegardé:', error);
    }
  };

  const handleViewDetails = (jobId: number) => {
    navigate(`/job/${jobId}`);
  };

  if (isLoading) {
    return (
      <div className="saved-jobs-container">
        <div className="loading">Chargement des emplois sauvegardés...</div>
      </div>
    );
  }

  return (
    <div className="saved-jobs-container">
      <div className="section-header">
        <h1 className="section-title">Emplois Sauvegardés</h1>
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
                <p className="job-location">📍 {job.location || 'Localisation non spécifiée'}</p>
                <p className="job-salary">
                  💰 {job.salary_min && job.salary_max 
                    ? `${job.salary_min} - ${job.salary_max} DT/mois` 
                    : 'Salaire non spécifié'}
                </p>
                <p className="job-type">{job.employment_type || 'Type de contrat non spécifié'}</p>
                <p className="job-description">{job.description?.substring(0, 100)}...</p>
              </div>
              
              <div className="job-card-footer">
                <div className="job-actions">
                  <button 
                    className="apply-btn"
                    onClick={() => handleViewDetails(job.id)}
                  >
                    Voir les détails
                  </button>
                  <button 
                    className="unsave-btn"
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
        <div className="empty-state">
          <p>Vous n'avez sauvegardé aucun emploi pour le moment.</p>
          <button 
            className="primary-btn"
            onClick={() => navigate('/find-jobs')}
          >
            Parcourir les offres
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
