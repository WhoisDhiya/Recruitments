import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './RecruiterDashboard.css';
import type { DashboardProps, PostedJob, RecruiterStats } from '../types';
import Settings from './Settings';
import Homepage from './homepage';
import EmployerProfile from './EmployerProfile';
import PostJobForm from './PostJobForm';
import SubscriptionPlans from './SubscriptionPlans';
import { apiService } from '../services/api';

interface CandidateSummary {
  applicationId: number;
  candidateId?: number;
  name: string;
  email: string;
  appliedOffer: string;
  appliedDate: string;
  status: string;
  resume?: string;
}

interface SavedCandidate extends CandidateSummary {
  savedAt: string;
}

interface ApplicationDetails {
  id: number;
  status: string;
  date_application: string;
  phone?: string;
  address?: string;
  portfolio_url?: string;
  cover_letter?: string;
  cv_file?: string; // CV spécifique à la candidature (base64)
  offer_id: number;
  offer_title: string;
  offer_description?: string;
  offer_location?: string;
  salary_min?: number;
  salary_max?: number;
  salary_type?: string;
  candidate_id: number;
  cv?: string; // CV du profil candidat
  image?: string;
  candidate_first_name: string;
  candidate_last_name: string;
  candidate_email: string;
}

type RecruiterTab =
  | 'Home'
  | 'Overview'
  | 'Employers_Profile'
  | 'Find_Candidate'
  | 'Post_a_Job'
  | 'My_Jobs'
  | 'Saved_Candidate'
  | 'Plans_Billing'
  | 'All_Companies'
  | 'Settings'
  | 'Customer_Supports';

const RecruiterDashboard: React.FC<DashboardProps> = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<RecruiterTab>('Overview');
  const [stats, setStats] = useState<RecruiterStats>({ openJobs: 0, savedCandidates: 0 });
  const [postedJobs, setPostedJobs] = useState<PostedJob[]>([]);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState<boolean>(true);
  const [editingJob, setEditingJob] = useState<PostedJob | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);
  const [showApplicationDetailsModal, setShowApplicationDetailsModal] = useState<boolean>(false);
  const [applicationDetails, setApplicationDetails] = useState<ApplicationDetails | null>(null);
  const [isLoadingApplicationDetails, setIsLoadingApplicationDetails] = useState<boolean>(false);
  const [applicationDetailsError, setApplicationDetailsError] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{ title: string; date_expiration?: string }>({ title: '' });
  const [candidateApplications, setCandidateApplications] = useState<CandidateSummary[]>([]);
  const [savedCandidates, setSavedCandidates] = useState<SavedCandidate[]>([]);
  const [recruiterId, setRecruiterId] = useState<number | null>(null);
  const [paymentsEnabled, setPaymentsEnabled] = useState<boolean>(true);

  const navigationItems = useMemo(
    () => [
      { id: 'Home', label: 'Home' },
      { id: 'Find_Candidate', label: 'Find Candidate' },
      { id: 'Dashboard', label: 'Dashboard' },
      { id: 'My_Jobs', label: 'My Jobs' },
      { id: 'Applications', label: 'Applications' },
      { id: 'Customer_Supports', label: 'Customer Support' }
    ],
    []
  );

  const sidebarItems = useMemo(() => {
    const base = [
      { id: 'Overview', label: 'Overview', icon: '📊' },
      { id: 'Employers_Profile', label: 'Employer Profile', icon: '👤' },
      { id: 'Find_Candidate', label: 'Find Candidates', icon: '🕵️' },
      { id: 'Post_a_Job', label: 'Post a Job', icon: '➕' },
      { id: 'My_Jobs', label: 'My Jobs', icon: '💼' },
      { id: 'Saved_Candidate', label: 'Saved Candidate', icon: '⭐' },
      { id: 'All_Companies', label: 'All Companies', icon: '🏢' },
      { id: 'Settings', label: 'Settings', icon: '⚙️' }
    ];
    if (paymentsEnabled) {
      base.splice(6, 0, { id: 'Plans_Billing', label: 'Plans & Billing', icon: '💳' });
    }
    return base;
  }, [paymentsEnabled]);

  const savedCandidatesKey = recruiterId ? `savedCandidates:${recruiterId}` : null;

  const loadDashboardData = async () => {
    setIsLoading(true);
    setIsLoadingCandidates(true);
    try {
      if (!user?.id) {
        setIsLoading(false);
        setIsLoadingCandidates(false);
        return;
      }

      let recruiterIdentifier: number | null = null;
      try {
        const recruiter = await apiService.getRecruiterByUserId(user.id);
        recruiterIdentifier = recruiter.id;
        setRecruiterId(recruiter.id);
        
        // Check if recruiter has an active subscription
        try {
          const subscriptionCheck = await apiService.checkActiveSubscription(recruiter.id);
          if (!subscriptionCheck.hasActiveSubscription) {
            // No active subscription, redirect to subscription plans
            navigate('/subscription-plans');
            return;
          }
        } catch (subError) {
          console.error('Error checking subscription:', subError);
          // If check fails, allow access but log the error
        }
      } catch (error) {
        console.error('Error fetching recruiter profile:', error);
        setIsLoading(false);
        setIsLoadingCandidates(false);
        return;
      }

      if (!recruiterIdentifier) {
        setIsLoading(false);
        setIsLoadingCandidates(false);
        return;
      }

      // Check payments availability (backend returns 503 when disabled)
      try {
        const status = await apiService.getPaymentsStatus();
        setPaymentsEnabled(!!status.available);
      } catch (err) {
        setPaymentsEnabled(false);
      }

      const offers = await apiService.getRecruiterOffers(recruiterIdentifier);

      const openJobs = offers.filter(offer => {
        if (!offer.date_expiration) return true;
        const expirationDate = new Date(offer.date_expiration);
        return expirationDate > new Date();
      }).length;

      const candidateAccumulator: CandidateSummary[] = [];

      const jobsPromises = offers.map(async (offer) => {
        const expirationDate = offer.date_expiration ? new Date(offer.date_expiration) : null;
        const now = new Date();
        const daysRemaining = expirationDate
          ? Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        let applicationCount = 0;
        try {
          const applications = await apiService.getOfferApplications(offer.id);
          applicationCount = applications.length;

          applications.forEach((app: any) => {
            // Utiliser application_id ou id (selon la structure retournée)
            const applicationId = app.application_id || app.id;
            const candidateInfo = app.candidate || app;
            const name =
              candidateInfo?.first_name && candidateInfo?.last_name
                ? `${candidateInfo.first_name} ${candidateInfo.last_name}`
                : app.candidate_first_name && app.candidate_last_name
                ? `${app.candidate_first_name} ${app.candidate_last_name}`
                : candidateInfo?.name ||
                  `${app.candidate_first_name || 'Candidate'} ${app.candidate_last_name || ''}`.trim();
            const email =
              app.candidate_email ||
              candidateInfo?.email ||
              candidateInfo?.user?.email ||
              app.email ||
              'Not provided';

            console.log('📋 Frontend: Processing application:', {
              applicationId,
              appId: app.id,
              application_id: app.application_id,
              candidate_id: app.candidate_id,
              name,
              email
            });

            candidateAccumulator.push({
              applicationId: applicationId, // Utiliser l'ID de l'application explicitement
              candidateId: app.candidate_id || candidateInfo?.id,
              name: name || `Candidate #${applicationId}`,
              email,
              appliedOffer: offer.title,
              appliedDate: formatDateTime(app.date_application),
              status: app.status || 'pending',
              resume: app.cv || candidateInfo?.cv
            });
          });
        } catch (error) {
          console.warn(`Could not load applications for offer ${offer.id}:`, error);
        }

        const status: 'Active' | 'Expire' = daysRemaining > 0 ? 'Active' : 'Expire';

        return {
          id: offer.id,
          title: offer.title,
          type: 'Full Time',
          daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
          status,
          applications: applicationCount,
          expirationDate: offer.date_expiration || undefined
        };
      });

      const jobs = await Promise.all(jobsPromises);
      jobs.sort((a, b) => b.id - a.id);

      setPostedJobs(jobs);
      setCandidateApplications(candidateAccumulator);
      setStats((prev: RecruiterStats) => ({ ...prev, openJobs }));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingCandidates(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openDropdown]);

  useEffect(() => {
    if (user?.role === 'recruiter') {
      loadDashboardData();
    }
  }, [user, location.pathname]);

  useEffect(() => {
    if (!savedCandidatesKey) return;
    try {
      const stored = localStorage.getItem(savedCandidatesKey);
      if (stored) {
        setSavedCandidates(JSON.parse(stored));
      } else {
        setSavedCandidates([]);
      }
    } catch (error) {
      console.warn('Could not parse saved candidates', error);
      setSavedCandidates([]);
    }
  }, [savedCandidatesKey]);

  useEffect(() => {
    if (!savedCandidatesKey) return;
    localStorage.setItem(savedCandidatesKey, JSON.stringify(savedCandidates));
    setStats((prev: RecruiterStats) => ({ ...prev, savedCandidates: savedCandidates.length }));
  }, [savedCandidates, savedCandidatesKey]);

  const toggleDropdown = (jobId: number) => {
    setOpenDropdown(openDropdown === jobId ? null : jobId);
  };

  const handleMenuAction = async (action: string, jobId: number) => {
    setOpenDropdown(null);

    if (action === 'edit') {
      const job = postedJobs.find((jobItem: PostedJob) => jobItem.id === jobId);
      if (job) {
        setEditingJob(job);
        setEditFormData({
          title: job.title,
          date_expiration: job.expirationDate || undefined
        });
        setShowEditModal(true);
      }
    } else if (action === 'view') {
      navigate(`/job-details/${jobId}`);
    } else if (action === 'delete') {
      setJobToDelete(jobId);
      setShowDeleteConfirm(true);
    } else if (action === 'expire') {
      try {
        await apiService.updateOffer(jobId, {
          date_expiration: new Date().toISOString().split('T')[0]
        });
        setIsLoading(true);
        await loadDashboardData();
      } catch (error) {
        console.error('Error expiring job:', error);
        alert('Failed to expire job');
      }
    }
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;

    try {
      await apiService.updateOffer(editingJob.id, {
        title: editFormData.title,
        date_expiration: editFormData.date_expiration
      });
      setShowEditModal(false);
      setEditingJob(null);
      setIsLoading(true);
      await loadDashboardData();
    } catch (error: any) {
      console.error('Error updating job:', error);
      alert(error?.message || 'Failed to update job.');
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      await apiService.deleteOffer(jobToDelete);
      setShowDeleteConfirm(false);
      setJobToDelete(null);
      setIsLoading(true);
      await loadDashboardData();
    } catch (error: any) {
      console.error('Error deleting job:', error);
      alert(error?.message || 'Failed to delete job.');
      setShowDeleteConfirm(false);
      setJobToDelete(null);
    }
  };
  
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return 'Date unavailable';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isCandidateAlreadySaved = (candidate: CandidateSummary): boolean => {
    const key = candidate.candidateId || candidate.applicationId;
    return savedCandidates.some(saved => (saved.candidateId || saved.applicationId) === key);
  };

  const handleSaveCandidate = (candidate: CandidateSummary) => {
    if (isCandidateAlreadySaved(candidate)) return;
    setSavedCandidates((prev: SavedCandidate[]) => [...prev, { ...candidate, savedAt: new Date().toISOString() }]);
  };

  const handleUnsaveCandidate = (candidate: CandidateSummary) => {
    const key = candidate.candidateId || candidate.applicationId;
    setSavedCandidates((prev: SavedCandidate[]) =>
      prev.filter((saved: SavedCandidate) => (saved.candidateId || saved.applicationId) !== key)
    );
  };

  const updateApplicationStatusInternal = async (
    applicationId: number,
    status: 'accepted' | 'rejected' | 'pending',
    successMessage: string
  ) => {
    try {
      await apiService.updateApplicationStatus(applicationId, status);
      await loadDashboardData();
      setApplicationDetails(prev => (prev && prev.id === applicationId ? { ...prev, status } : prev));
      alert(successMessage);
    } catch (error: any) {
      console.error('Error updating application status:', error);
      alert(error.message || 'Failed to update application status');
    }
  };

  const handleAcceptApplication = async (applicationId: number) => {
    await updateApplicationStatusInternal(applicationId, 'accepted', 'Application accepted successfully!');
  };

  const handleRejectApplication = async (applicationId: number) => {
    await updateApplicationStatusInternal(applicationId, 'rejected', 'Application rejected');
  };

  const handleResetToPending = async (applicationId: number) => {
    await updateApplicationStatusInternal(applicationId, 'pending', 'Application status reset to pending');
  };

  const handleViewApplicationDetails = async (applicationId: number) => {
    console.log('🔍 Frontend: handleViewApplicationDetails called with applicationId:', applicationId);
    setShowApplicationDetailsModal(true);
    setIsLoadingApplicationDetails(true);
    setApplicationDetails(null);
    setApplicationDetailsError(null);
    try {
      console.log('📤 Frontend: Calling apiService.getApplicationDetails with:', applicationId);
      const details = await apiService.getApplicationDetails(applicationId);
      console.log('✅ Frontend: Application details received:', details);
      console.log('📋 Frontend: Details keys:', Object.keys(details || {}));
      setApplicationDetails(details);
    } catch (error: any) {
      console.error('❌ Frontend: Error fetching application details:', error);
      console.error('❌ Frontend: Error message:', error.message);
      console.error('❌ Frontend: Error stack:', error.stack);
      setApplicationDetailsError(error.message || 'Failed to load application details');
    } finally {
      setIsLoadingApplicationDetails(false);
    }
  };

  const handleTopNavClick = (itemId: string) => {
    switch (itemId) {
      case 'Home':
        setActiveTab('Home');
        break;
      case 'Find_Candidate':
        setActiveTab('Find_Candidate');
        break;
      case 'Dashboard':
        setActiveTab('Overview');
        break;
      case 'My_Jobs':
        setActiveTab('My_Jobs');
        break;
      case 'Applications':
        setActiveTab('Find_Candidate');
        break;
      case 'Customer_Supports':
        setActiveTab('Customer_Supports');
        break;
      default:
        break;
    }
  };

  const handleSidebarClick = (itemId: string) => {
    if (itemId === 'Post_a_Job') {
      setActiveTab('Post_a_Job');
      return;
    }
    setActiveTab(itemId as RecruiterTab);
  };

  const isNavActive = (itemId: string): boolean => {
    if (itemId === 'Dashboard') return activeTab === 'Overview';
    if (itemId === 'Applications') return activeTab === 'Find_Candidate';
    return activeTab === itemId;
  };

  const renderJobsTable = (title: string, showViewAll = false) => (
    <div className="recently-posted-jobs">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {showViewAll && <a href="#" className="view-all-link">View all →</a>}
      </div>

      <div className="jobs-table">
        <div className="table-header">
          <div className="table-cell">JOBS</div>
          <div className="table-cell">STATUS</div>
          <div className="table-cell">APPLICATIONS</div>
          <div className="table-cell">ACTIONS</div>
        </div>

        {isLoading ? (
          <div className="loading-state">Loading jobs...</div>
        ) : postedJobs.length === 0 ? (
          <div className="empty-state">No jobs posted yet</div>
        ) : (
          postedJobs.map((job) => (
            <div
              key={job.id}
              className={`table-row ${openDropdown === job.id ? 'selected' : ''}`}
            >
              <div className="table-cell job-cell">
                <div className="job-title-text">{job.title}</div>
                <div className="job-meta-info">
                  {job.type} • {job.daysRemaining > 0 
                    ? `${job.daysRemaining} days remaining`
                    : job.expirationDate 
                    ? formatDate(job.expirationDate)
                    : 'No expiration'}
                </div>
              </div>

              <div className="table-cell status-cell">
                {job.status === 'Active' ? (
                  <span className="status-badge active">✓ Active</span>
                ) : (
                  <span className="status-badge expired">✗ Expire</span>
                )}
              </div>

              <div className="table-cell applications-cell">
                {job.applications} Applications
              </div>

              <div className="table-cell actions-cell">
                <button className="view-applications-btn" onClick={() => setActiveTab('Find_Candidate')}>
                  View Applications
                </button>

                <div className="dropdown-container">
                  <button
                    className="dropdown-trigger"
                    onClick={() => toggleDropdown(job.id)}
                  >
                    ⋯
                  </button>

                  {openDropdown === job.id && (
                    <div className="dropdown-menu">
                      <button
                        className="dropdown-item"
                        onClick={() => handleMenuAction('edit', job.id)}
                      >
                        ✏️ Edit Job
                      </button>

                      <button
                        className="dropdown-item"
                        onClick={() => handleMenuAction('view', job.id)}
                      >
                        👁️ View Detail
                      </button>

                      <button
                        className="dropdown-item"
                        onClick={() => handleMenuAction('promote', job.id)}
                      >
                        ➕ Promote Job
                      </button>

                      <button
                        className="dropdown-item danger"
                        onClick={() => handleMenuAction('expire', job.id)}
                      >
                        ⏰ Mark as expired
                      </button>

                      <button
                        className="dropdown-item danger"
                        onClick={() => handleMenuAction('delete', job.id)}
                      >
                        🗑️ Delete Job
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderCandidateSection = (
    title: string,
    candidates: CandidateSummary[],
    options: { emptyMessage: string; allowSave?: boolean; allowRemove?: boolean }
  ) => (
    <section className="candidate-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
      </div>

      {options.allowSave && (
        <p className="section-description">
          Click "Save candidate" to keep promising profiles handy in your saved list.
        </p>
      )}

      {isLoadingCandidates ? (
        <div className="loading-state">Loading candidates...</div>
      ) : candidates.length === 0 ? (
        <div className="empty-state">{options.emptyMessage}</div>
      ) : (
        <div className="candidate-grid">
          {candidates.map(candidate => {
            const saved = isCandidateAlreadySaved(candidate);
            const initials = candidate.name
              .split(' ')
              .filter(Boolean)
              .map(part => part[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <div key={candidate.applicationId} className="candidate-card">
                <div className="candidate-header">
                  <div className="candidate-initials">{initials || 'C'}</div>
                  <div>
                    <h3>{candidate.name}</h3>
                    <p>{candidate.appliedOffer}</p>
                  </div>
                </div>

                <div className="candidate-meta">
                  <span>{candidate.email}</span>
                  <span>{candidate.appliedDate}</span>
                  <span className={`status-badge ${candidate.status === 'accepted' ? 'accepted' : candidate.status === 'rejected' ? 'rejected' : 'pending'}`}>
                    {candidate.status === 'accepted' ? '✓ Accepted' : candidate.status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                  </span>
                </div>

                <div className="candidate-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      console.log('🔍 Frontend: View Application clicked for candidate:', candidate);
                      console.log('🔍 Frontend: Application ID to send:', candidate.applicationId, 'Type:', typeof candidate.applicationId);
                      handleViewApplicationDetails(candidate.applicationId);
                    }}
                  >
                    View Application
                  </button>
                  {options.allowSave && (
                    <>
                      <button
                        className={`btn-accept ${candidate.status === 'accepted' ? 'btn-active' : ''}`}
                        onClick={() => handleAcceptApplication(candidate.applicationId)}
                        disabled={candidate.status === 'accepted'}
                        title="Accept this application"
                      >
                        {candidate.status === 'accepted' ? '✓ Accepted' : '✓ Accept'}
                      </button>
                      <button
                        className={`btn-reject ${candidate.status === 'rejected' ? 'btn-active' : ''}`}
                        onClick={() => handleRejectApplication(candidate.applicationId)}
                        disabled={candidate.status === 'rejected'}
                        title="Reject this application"
                      >
                        {candidate.status === 'rejected' ? '✗ Rejected' : '✗ Reject'}
                      </button>
                      {(candidate.status === 'accepted' || candidate.status === 'rejected') && (
                        <button
                          className="btn-secondary"
                          onClick={() => handleResetToPending(candidate.applicationId)}
                          title="Reset to pending status"
                        >
                          ↺ Reset to Pending
                        </button>
                      )}
                      <button
                        className={`btn-primary ${saved ? 'btn-disabled' : ''}`}
                        onClick={() => handleSaveCandidate(candidate)}
                        disabled={saved}
                        title="Save candidate for later"
                      >
                        {saved ? '✓ Saved' : '⭐ Save candidate'}
                      </button>
                    </>
                  )}
                  {options.allowRemove && (
                    <button
                      className="btn-secondary"
                      onClick={() => handleUnsaveCandidate(candidate)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );

  const renderComingSoon = (label: string, description = 'This section is coming soon...') => (
    <div className="coming-soon">
      <h2>{label}</h2>
      <p>{description}</p>
    </div>
  );

  const renderMainContent = () => {
    switch (activeTab) {
      case 'Home':
        return <Homepage user={user} isAuthenticated={true} onLogout={onLogout} />;
      case 'Overview':
        return (
          <>
            <div className="greeting-section">
              <h1 className="greeting-title">Hello, {user?.first_name || 'Recruiter'}</h1>
              <p className="greeting-subtitle">
                Here is your daily activities and applications
              </p>
            </div>

            <div className="summary-cards">
              <div className="summary-card blue-card">
                <div className="card-icon-wrapper">
                  <div className="card-icon-blue">💼</div>
                </div>
                <div className="card-content">
                  <div className="card-count">{stats.openJobs}</div>
                  <div className="card-title">Open Jobs</div>
                </div>
              </div>

              <div className="summary-card yellow-card">
                <div className="card-icon-wrapper">
                  <div className="card-icon-yellow">⭐</div>
                </div>
                <div className="card-content">
                  <div className="card-count">{savedCandidates.length}</div>
                  <div className="card-title">Saved Candidates</div>
                </div>
              </div>
            </div>

            {renderJobsTable('Recently Posted Jobs', true)}
          </>
        );
      case 'My_Jobs':
        return (
          <>
            <div className="section-header">
              <h2 className="section-title">Your Posted Jobs</h2>
              <button className="btn-primary" onClick={() => navigate('/post-job')}>
                ➕ Post a Job
              </button>
            </div>
            {renderJobsTable('All Jobs')}
          </>
        );
      case 'Employers_Profile':
        return (
          <div className="embedded-section">
            <EmployerProfile
              user={user}
              onLogout={onLogout}
              embedded
              onBack={() => setActiveTab('Overview')}
              onEditProfile={() => setActiveTab('Settings')}
            />
          </div>
        );
      case 'Settings':
        return (
          <Settings
            user={user}
          />
        );
      case 'Find_Candidate':
        return renderCandidateSection('All Candidates', candidateApplications, {
          emptyMessage: 'No applications have been received yet.',
          allowSave: true
        });
      case 'Saved_Candidate':
        return renderCandidateSection('Saved Candidates', savedCandidates, {
          emptyMessage: 'You have not saved any candidates yet.',
          allowRemove: true
        });
      case 'Post_a_Job':
        return (
          <div className="embedded-section">
            <PostJobForm
              user={user}
              onLogout={onLogout}
              onSuccess={() => {
                loadDashboardData();
                setActiveTab('My_Jobs');
              }}
            />
          </div>
        );
      case 'Plans_Billing':
        return (
          <div className="embedded-section">
            <SubscriptionPlans user={user} />
          </div>
        );
      case 'All_Companies':
        return renderComingSoon('All Companies');
      case 'Customer_Supports':
        return renderComingSoon('Customer Support', 'Support tools are on the way.');
      default:
        return renderComingSoon(sidebarItems.find(item => item.id === activeTab)?.label || 'Coming soon');
    }
  };

  return (
    <div className="recruiter-dashboard">
      <div className="top-nav-bar">
        <nav className="top-nav">
          {navigationItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={`top-nav-link ${isNavActive(item.id) ? 'active' : ''}`}
              onClick={() => handleTopNavClick(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <header className="recruiter-header">
        <div className="header-logo">
          <div className="logo-container">
            <div className="logo-icon-briefcase">💼</div>
            <span className="logo-text">RecruPLus</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="notification-btn-header">🔔</button>
          <button 
            className="post-job-btn"
            onClick={() => setActiveTab('Post_a_Job')}
          >
            Post A Job
          </button>
        </div>
      </header>

      <div className="recruiter-dashboard-content">
        <aside className="recruiter-sidebar">
          <h3 className="sidebar-title">RECRUITER DASHBOARD</h3>
          <nav className="sidebar-nav">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                type="button"
                className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleSidebarClick(item.id)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="logout-section">
            <button onClick={onLogout} className="logout-link">
              <span className="logout-icon">↗️</span>
              Log-out
            </button>
          </div>
        </aside>

        <main className="recruiter-main">
          {renderMainContent()}
        </main>
      </div>

      {showApplicationDetailsModal && (
        <div className="modal-overlay" onClick={() => setShowApplicationDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Application Details</h2>

            {isLoadingApplicationDetails ? (
              <div className="loading-state">Loading application...</div>
            ) : applicationDetailsError ? (
              <div className="error-state">
                <p style={{ color: '#ef4444', marginBottom: '10px' }}>❌ {applicationDetailsError}</p>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  Vérifiez que la candidature existe et appartient à l'une de vos offres.
                </p>
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    setShowApplicationDetailsModal(false);
                    setApplicationDetailsError(null);
                  }}
                  style={{ marginTop: '15px' }}
                >
                  Fermer
                </button>
              </div>
            ) : applicationDetails ? (
              <div className="application-details-modal">
                <div className="detail-block">
                  <h3>Candidate Information</h3>
                  <p><strong>Name:</strong> {applicationDetails.candidate_first_name} {applicationDetails.candidate_last_name}</p>
                  <p><strong>Email:</strong> {applicationDetails.candidate_email}</p>
                  {applicationDetails.phone && (
                    <p><strong>Phone:</strong> {applicationDetails.phone}</p>
                  )}
                  {applicationDetails.address && (
                    <p><strong>Address:</strong> {applicationDetails.address}</p>
                  )}
                  {applicationDetails.portfolio_url && (
                    <p><strong>Portfolio:</strong> <a href={applicationDetails.portfolio_url} target="_blank" rel="noopener noreferrer">{applicationDetails.portfolio_url}</a></p>
                  )}
                  <div style={{ marginTop: '10px' }}>
                    <p><strong>CV:</strong></p>
                    {applicationDetails.cv_file ? (
                      <div>
                        <a 
                          href={applicationDetails.cv_file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          download={`CV_${applicationDetails.candidate_first_name}_${applicationDetails.candidate_last_name}_Application_${applicationDetails.id}.pdf`}
                          style={{ 
                            display: 'inline-block',
                            padding: '8px 16px',
                            background: '#2196F3',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: '500',
                            marginTop: '5px'
                          }}
                        >
                          📄 Télécharger le CV de la candidature
                        </a>
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px', marginBottom: 0 }}>
                          (CV spécifique à cette candidature)
                        </p>
                      </div>
                    ) : applicationDetails.cv ? (
                      <div>
                        <p style={{ margin: '5px 0', color: '#666' }}>{applicationDetails.cv}</p>
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px', marginBottom: 0 }}>
                          (CV du profil candidat)
                        </p>
                      </div>
                    ) : (
                      <p style={{ margin: '5px 0', color: '#999', fontStyle: 'italic' }}>Aucun CV disponible</p>
                    )}
                  </div>
                </div>
                <div className="detail-block">
                  <h3>Application</h3>
                  <p><strong>Status:</strong> {applicationDetails.status}</p>
                  <p><strong>Applied on:</strong> {formatDateTime(applicationDetails.date_application)}</p>
                  {applicationDetails.cover_letter && (
                    <div style={{ marginTop: '15px' }}>
                      <p><strong>Cover Letter:</strong></p>
                      <p style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '10px', borderRadius: '4px', marginTop: '5px' }}>
                        {applicationDetails.cover_letter}
                      </p>
                    </div>
                  )}
                </div>
                <div className="detail-block">
                  <h3>Job Offer</h3>
                  <p><strong>Title:</strong> {applicationDetails.offer_title}</p>
                  {applicationDetails.offer_location && (
                    <p><strong>Location:</strong> {applicationDetails.offer_location}</p>
                  )}
                  {(applicationDetails.salary_min || applicationDetails.salary_max) && (
                    <p>
                      <strong>Salary:</strong>{' '}
                      {applicationDetails.salary_min || applicationDetails.salary_max
                        ? `${applicationDetails.salary_min ?? ''}${
                            applicationDetails.salary_min && applicationDetails.salary_max ? ' - ' : ''
                          }${applicationDetails.salary_max ?? ''} ${applicationDetails.salary_type || ''}`
                        : 'Not specified'}
                    </p>
                  )}
                  {applicationDetails.offer_description && (
                    <p className="modal-message">
                      {applicationDetails.offer_description.length > 400
                        ? `${applicationDetails.offer_description.substring(0, 400)}...`
                        : applicationDetails.offer_description}
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            <div className="modal-actions">
              {applicationDetails && (
                <>
                  <button
                    className="btn-accept"
                    onClick={() => handleAcceptApplication(applicationDetails.id)}
                    disabled={applicationDetails.status === 'accepted'}
                  >
                    {applicationDetails.status === 'accepted' ? '✓ Accepted' : 'Accept'}
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleRejectApplication(applicationDetails.id)}
                    disabled={applicationDetails.status === 'rejected'}
                  >
                    {applicationDetails.status === 'rejected' ? '✗ Rejected' : 'Reject'}
                  </button>
                  {applicationDetails.status !== 'pending' && (
                    <button
                      className="btn-secondary"
                      onClick={() => handleResetToPending(applicationDetails.id)}
                    >
                      Reset to Pending
                    </button>
                  )}
                </>
              )}
              <button className="btn-secondary" onClick={() => setShowApplicationDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingJob && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit Job</h2>

            <div className="modal-form">
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Expiration Date</label>
                <input
                  type="date"
                  value={editFormData.date_expiration || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, date_expiration: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingJob(null);
                }}
              >
                Cancel
              </button>

              <button className="btn-primary" onClick={handleUpdateJob}>
                Update Job
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Delete Job</h2>

            <p className="modal-message">
              Are you sure you want to delete this job? This action cannot be undone.
              {(() => {
                const applicationsCount = postedJobs.find((jobItem: PostedJob) => jobItem.id === jobToDelete)?.applications ?? 0;
                return applicationsCount > 0;
              })() && (
                <span className="warning-text">
                  {(() => {
                    const applicationsCount = postedJobs.find((jobItem: PostedJob) => jobItem.id === jobToDelete)?.applications ?? 0;
                    return <><br />⚠️ This job has {applicationsCount} application(s).</>;
                  })()}
                  You cannot delete jobs with applications.
                </span>
              )}
            </p>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setJobToDelete(null);
                }}
              >
                Cancel
              </button>

              <button
                className="btn-danger"
                onClick={handleDeleteJob}
                disabled={(postedJobs.find((jobItem: PostedJob) => jobItem.id === jobToDelete)?.applications ?? 0) > 0}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="recruiter-footer">
        <p>@2024 MyJob - Job Portal. All rights Reserved</p>
      </footer>
    </div>
  );
};

export default RecruiterDashboard;
