import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { DashboardProps } from '../types';
import { apiService } from '../services/api';
import './JobDetails.css';
// 
interface JobDetailsData {
  offer: {
    id: number;
    title: string;
    date_offer: string;
    date_expiration?: string;
    company_name?: string;
    industry?: string;
  };
  requirement: {
    jobTitle: string;
    tags?: string;
    jobRole?: string;
    minSalary?: number;
    maxSalary?: number;
    salaryType?: string;
    education?: string;
    experience?: string;
    jobType?: string;
    vacancies?: number;
    expirationDate?: string;
    jobLevel?: string;
    description?: string;
    responsibilities?: string;
  } | null;
}

const JobDetails: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [jobDetails, setJobDetails] = useState<JobDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  // Vérifier si on vient de applied-jobs et récupérer le statut
  const fromAppliedJobs = searchParams.get('from') === 'applied-jobs';
  const statusFromQuery = searchParams.get('status');

  useEffect(() => {
    const loadJobDetails = async () => {
      if (!id) {
        setError('Job ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        const data = await apiService.getJobDetails(parseInt(id));
        setJobDetails(data);

        // Si on vient de applied-jobs, on sait déjà qu'on a postulé
        if (fromAppliedJobs && statusFromQuery) {
          setHasApplied(true);
          setApplicationStatus(statusFromQuery);
        } else if (user?.role === 'candidate') {
          // Sinon, vérifier si le candidat a déjà postulé
          try {
            const currentUser = apiService.getCurrentUser();
            if (currentUser) {
              const candidate = await apiService.getCandidateByUserId(currentUser.id);
              if (candidate && candidate.id) {
                const applications = await apiService.getApplications(candidate.id);
                const application = applications.find((app: any) => app.offer_id === parseInt(id));
                if (application) {
                  setHasApplied(true);
                  setApplicationStatus(application.status || 'pending');
                }
              }
            }
          } catch (err) {
            console.error('Error checking application status:', err);
          }
        }
      } catch (err: any) {
        console.error('Error loading job details:', err);
        setError(err.message || 'Failed to load job details');
      } finally {
        setIsLoading(false);
      }
    };

    loadJobDetails();
  }, [id, user, fromAppliedJobs, statusFromQuery]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatSalary = (min?: number, max?: number, type?: string): string => {
    if (!min && !max) return 'Not specified';
    const typeLabel = type || '';
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()} ${typeLabel}`;
    } else if (min) {
      return `$${min.toLocaleString()}+ ${typeLabel}`;
    } else if (max) {
      return `Up to $${max.toLocaleString()} ${typeLabel}`;
    }
    return 'Not specified';
  };

  const formatJobType = (type?: string): string => {
    const typeMap: { [key: string]: string } = {
      'CDI': 'Full Time',
      'CDD': 'Contract',
      'Stage': 'Internship',
      'Freelance': 'Temporary',
      'Part-time': 'Part Time'
    };
    return type ? (typeMap[type] || type) : 'Not specified';
  };

  if (isLoading) {
    return (
      <div className="job-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !jobDetails) {
    return (
      <div className="job-details-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Job not found'}</p>
          <button onClick={() => navigate('/dashboard')} className="back-button">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { offer, requirement } = jobDetails;

  return (
    <div className="job-details-page">
      {/* Header */}
      <header className="job-details-header">
        <div className="header-content">
          <button onClick={() => navigate(-1)} className="back-button-header">
            ← Back
          </button>
          <div className="header-logo">
            <div className="logo-container">
              <div className="logo-icon-briefcase">💼</div>
              <span className="logo-text">RecruPLus</span>
            </div>
          </div>
        </div>
      </header>

      <div className="job-details-content">
        {/* Main Content */}
        <main className="job-details-main">
          {/* Job Header */}
          <div className="job-header-section">
            <h1 className="job-title-main">{requirement?.jobTitle || offer.title}</h1>
            {offer.company_name && (
              <p className="company-name">{offer.company_name}</p>
            )}
            <div className="job-meta-tags">
              {requirement?.tags && (
                <span className="tag">{requirement.tags}</span>
              )}
              {requirement?.jobRole && (
                <span className="tag">{requirement.jobRole}</span>
              )}
            </div>
          </div>

          {/* Job Info Grid */}
          <div className="job-info-grid">
            <div className="info-card">
              <div className="info-icon">💰</div>
              <div className="info-content">
                <h3>Salary</h3>
                <p>{formatSalary(requirement?.minSalary, requirement?.maxSalary, requirement?.salaryType)}</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">📅</div>
              <div className="info-content">
                <h3>Job Type</h3>
                <p>{formatJobType(requirement?.jobType)}</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">🎓</div>
              <div className="info-content">
                <h3>Education</h3>
                <p>{requirement?.education || 'Not specified'}</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">💼</div>
              <div className="info-content">
                <h3>Experience</h3>
                <p>{requirement?.experience || 'Not specified'}</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">📊</div>
              <div className="info-content">
                <h3>Job Level</h3>
                <p>{requirement?.jobLevel || 'Not specified'}</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">👥</div>
              <div className="info-content">
                <h3>Vacancies</h3>
                <p>{requirement?.vacancies ? `${requirement.vacancies} position(s)` : 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Dates Section */}
          <div className="dates-section">
            <div className="date-item">
              <span className="date-label">Posted on:</span>
              <span className="date-value">{formatDate(offer.date_offer)}</span>
            </div>
            {offer.date_expiration && (
              <div className="date-item">
                <span className="date-label">Expires on:</span>
                <span className="date-value">{formatDate(offer.date_expiration)}</span>
              </div>
            )}
          </div>

          {/* Description Section */}
          {requirement?.description && (
            <div className="description-section">
              <h2 className="section-title">Job Description</h2>
              <div className="description-content">
                {requirement.description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}

          {/* Responsibilities Section */}
          {requirement?.responsibilities && (
            <div className="responsibilities-section">
              <h2 className="section-title">Responsibilities</h2>
              <div className="responsibilities-content">
                {requirement.responsibilities.split('\n').map((item, index) => (
                  <p key={index}>{item}</p>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            {user?.role === 'recruiter' ? (
              <>
                <button 
                  onClick={() => navigate(`/post-job?edit=${offer.id}`)}
                  className="btn-edit"
                >
                  ✏️ Edit Job
                </button>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="btn-back"
                >
                  Back to Dashboard
                </button>
              </>
            ) : (
              <>
                {hasApplied ? (
                  <>
                    <div style={{
                      padding: '12px 24px',
                      background: applicationStatus === 'accepted' ? '#4caf50' :
                                   applicationStatus === 'rejected' ? '#f44336' :
                                   applicationStatus === 'reviewed' ? '#ff9800' :
                                   '#2196F3',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '16px',
                      fontWeight: '500',
                      display: 'inline-block',
                      marginRight: '10px'
                    }}>
                      {applicationStatus === 'accepted' ? '✅ Candidature acceptée' :
                       applicationStatus === 'rejected' ? '❌ Candidature refusée' :
                       applicationStatus === 'reviewed' ? '👀 En cours d\'examen' :
                       '⏳ En attente de traitement'}
                    </div>
                    <button 
                      onClick={() => navigate('/applied-jobs')}
                      className="btn-back"
                    >
                      ← Retour aux candidatures
                    </button>
                    <button 
                      onClick={() => navigate('/find-jobs')}
                      className="btn-back"
                    >
                      Retour aux offres
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => navigate(`/job-application/${offer.id}`)}
                      className="btn-apply"
                      style={{
                        background: '#2196F3',
                        color: 'white',
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '500'
                      }}
                    >
                      Postuler maintenant
                    </button>
                    <button 
                      onClick={() => navigate('/applied-jobs')}
                      className="btn-back"
                    >
                      ← Retour aux candidatures
                    </button>
                    <button 
                      onClick={() => navigate('/find-jobs')}
                      className="btn-back"
                    >
                      Retour aux offres
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <footer className="job-details-footer">
        <p>@2024 MyJob - Job Portal. All rights Reserved</p>
      </footer>
    </div>
  );
};

export default JobDetails;
