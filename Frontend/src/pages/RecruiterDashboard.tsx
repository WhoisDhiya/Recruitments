import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './RecruiterDashboard.css';
import type { DashboardProps, PostedJob, RecruiterStats } from '../types';
import Settings from './Settings';
import Homepage from './homepage';
import { apiService } from '../services/api';

const RecruiterDashboard: React.FC<DashboardProps> = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [stats, setStats] = useState<RecruiterStats>({
    openJobs: 0,
    savedCandidates: 0
  });
  const [postedJobs, setPostedJobs] = useState<PostedJob[]>([]);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingJob, setEditingJob] = useState<PostedJob | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<{
    title: string;
    date_expiration?: string;
  }>({ title: '' });

  const navigationItems = [
    { id: 'Home', label: 'Home' },
    { id: 'Find_Candidate', label: 'Find Candidate' },
    { id: 'Dashboard', label: 'Dashboard', active: true },
    { id: 'My_Jobs', label: 'My Jobs' },
    { id: 'Applications', label: 'Applications' },
    { id: 'Customer_Supports', label: 'Customer Support' }
  ];

  const sidebarItems = [
    { id: 'Overview', label: 'Overview', icon: '📊' },
    { id: 'Employers_Profile', label: 'Employer Profile', icon: '👤' },
    { id: 'Post_a_Job', label: 'Post a Job', icon: '➕' },
    { id: 'My_Jobs', label: 'My Jobs', icon: '💼' },
    { id: 'Saved_Candidate', label: 'Saved Candidate', icon: '⭐' },
    { id: 'Plans_Billing', label: 'Plans & Billing', icon: '💳' },
    { id: 'All_Companies', label: 'All Companies', icon: '🏢' },
    { id: 'Settings', label: 'Settings', icon: '⚙️' }
  ];

  const loadDashboardData = async () => {
    try {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      let recruiterId: number;
      try {
        const recruiter = await apiService.getRecruiterByUserId(user.id);
        recruiterId = recruiter.id;
      } catch (error) {
        console.error('Error fetching recruiter profile:', error);
        setIsLoading(false);
        return;
      }

      const offers = await apiService.getRecruiterOffers(recruiterId);

      const openJobs = offers.filter(offer => {
        if (!offer.date_expiration) return true;
        const expirationDate = new Date(offer.date_expiration);
        return expirationDate > new Date();
      }).length;

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

      setStats({
        openJobs,
        savedCandidates: 0
      });
      setPostedJobs(jobs);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
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

  const toggleDropdown = (jobId: number) => {
    setOpenDropdown(openDropdown === jobId ? null : jobId);
  };

  const handleMenuAction = async (action: string, jobId: number) => {
    setOpenDropdown(null);

    if (action === 'edit') {
      const job = postedJobs.find(j => j.id === jobId);
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

  return (
    <div className="recruiter-dashboard">
      
      {/* Top Nav Bar*/}
      <div className="top-nav-bar">
        <nav className="top-nav">
          {navigationItems.map(item => (
            <a
              key={item.id}
              href="#"
              className={`top-nav-link ${item.active ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();

                if (item.id === 'Home') {
                  navigate('/');
                } else if (item.id === 'Dashboard') {
                  setActiveTab('Overview');
                }
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Header */}
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
            onClick={() => navigate('/post-job')}
          >
            Post A Job
          </button>
        </div>
      </header>

      <div className="recruiter-dashboard-content">

        {/* Sidebar */}
        <aside className="recruiter-sidebar">
          <h3 className="sidebar-title">RECRUITER DASHBOARD</h3>
          <nav className="sidebar-nav">
            {sidebarItems.map(item => (
              <a
                key={item.id}
                href="#"
                className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.id === 'Settings') {
                    // Open settings inside recruiter dashboard layout
                    setActiveTab('Settings');
                  } else if (item.id === 'Post_a_Job') {
                    navigate('/post-job');
                  } else if (item.id === 'My_Jobs') {
                    // Open the dedicated My Jobs page
                    navigate('/my-jobs');
                  } else {
                    setActiveTab(item.id);
                  }
                }}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </a>
            ))}
          </nav>

          <div className="logout-section">
            <button onClick={onLogout} className="logout-link">
              <span className="logout-icon">↗️</span>
              Log-out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="recruiter-main">
          
          {/* Home page */}
          {activeTab === 'Home' && (
            <Homepage user={user} isAuthenticated={true} onLogout={onLogout} />
          )}

          {/* Overview */}
          {activeTab === 'Overview' && (
            <>
              <div className="greeting-section">
                <h1 className="greeting-title">
                  Hello, {user?.first_name || 'Recruiter'}
                </h1>
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
                    <div className="card-count">{stats.savedCandidates}</div>
                    <div className="card-title">Saved Candidates</div>
                  </div>
                </div>
              </div>

              {/* Recently Posted Jobs */}
              <div className="recently-posted-jobs">
                <div className="section-header">
                  <h2 className="section-title">Recently Posted Jobs</h2>
                  <a href="#" className="view-all-link">View all →</a>
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
                          <button className="view-applications-btn">
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
            </>
          )}

          {/* Settings tab */}
          {activeTab === 'Settings' && (
            <Settings user={user} />
          )}

          {/* Other tabs */}
          {activeTab !== 'Overview' && activeTab !== 'Home' && activeTab !== 'Settings' && (
            <div className="coming-soon">
              <h2>{sidebarItems.find(item => item.id === activeTab)?.label}</h2>
              <p>This section is coming soon...</p>
            </div>
          )}
        </main>
      </div>

      {/* Edit Modal */}
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

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Delete Job</h2>

            <p className="modal-message">
              Are you sure you want to delete this job? This action cannot be undone.
              {(() => {
                const applicationsCount = postedJobs.find(j => j.id === jobToDelete)?.applications ?? 0;
                return applicationsCount > 0;
              })() && (
                <span className="warning-text">
                  {(() => {
                    const applicationsCount = postedJobs.find(j => j.id === jobToDelete)?.applications ?? 0;
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
                disabled={(postedJobs.find(j => j.id === jobToDelete)?.applications ?? 0) > 0}
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
