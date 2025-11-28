import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FindJobsList.css';
import { apiService } from '../services/api';
import type { Offer, NavigationItem, SidebarItem } from '../types';
import type { User } from '../types';
import './Dashboard.css';

interface FindJobsListProps {
  user?: User;
  isAuthenticated: boolean;
  onLogout?: () => void;
}

interface FilterOptions {
  keyword: string;
  location: string;
  category: string;
  sortBy: 'latest' | 'oldest' | 'salary-high' | 'salary-low' | 'most-relevant';
  salaryRange?: string;
  jobTypes?: string[];
  educations?: string[];
  jobLevel?: string;
}

interface JobCardProps {
  job: Offer;
  viewMode: 'list' | 'grid';
  isAuthenticated: boolean;
  onApplyClick: (jobId: number) => void;
  onSaveJob: (job: Offer) => void;
  isSaved?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  viewMode, 
  isAuthenticated, 
  onApplyClick,
  onSaveJob,
  isSaved = false
}) => {
  const handleApply = () => {
    onApplyClick(job.id);
  };

  const salaryDisplay = job.salary_min && job.salary_max 
    ? `${job.salary_min} - ${job.salary_max} DT/month`
    : 'Salary not specified';

  if (viewMode === 'grid') {
    return (
      <div className="job-card job-card-grid">
        <div className="job-card-header">
          <div className="job-company-icon">
            {job.title ? job.title.substring(0, 1).toUpperCase() : 'J'}
          </div>
          <div className="job-card-title-section">
            <h3 className="job-title">{job.title}</h3>
            <p className="job-company">{job.company_name || 'Company Name'}</p>
          </div>
        </div>
        
        <div className="job-card-body">
          <p className="job-location">📍 {job.location || 'Location not specified'}</p>
          <p className="job-salary">💰 {salaryDisplay}</p>
          <p className="job-type">{job.employment_type || 'Full-time'}</p>
          <p className="job-description">{job.description?.substring(0, 100)}...</p>
        </div>
        
        <div className="job-card-footer">
          <div className="job-actions">
            <button 
              className={`apply-btn ${!isAuthenticated ? 'login-required' : ''}`}
              onClick={handleApply}
              title={!isAuthenticated ? 'Sign in to apply' : 'Apply for this job'}
            >
              {!isAuthenticated ? '🔒 Sign in to Apply' : 'Apply Now'}
            </button>
            <button 
              className={`save-btn ${isSaved ? 'saved' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (isAuthenticated) {
                  onSaveJob(job);
                } else {
                  // Rediriger vers la page de connexion
                  window.location.href = '/signin';
                }
              }}
              title={isSaved ? 'Remove from saved jobs' : 'Save this job'}
            >
              {isSaved ? '💾 Saved' : '💾 Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="job-card job-card-list">
      <div className="job-card-list-content">
        <div className="job-company-icon">{job.title ? job.title.substring(0, 1).toUpperCase() : 'J'}</div>
        
        <div className="job-list-info">
          <div className="job-title-section">
            <h3 className="job-title">{job.title}</h3>
            <p className="job-company">{job.company_name || 'Company Name'}</p>
          </div>
          
          <div className="job-meta-info">
            <span className="job-location">📍 {job.location || 'Location not specified'}</span>
            <span className="job-type">{job.employment_type || 'Full-time'}</span>
            <span className="job-salary">💰 {salaryDisplay}</span>
          </div>
          
          <p className="job-description">{job.description?.substring(0, 150)}...</p>
        </div>
      </div>
      
      <div className="job-card-list-actions">
        <div className="job-actions">
          <button 
            className={`apply-btn ${!isAuthenticated ? 'login-required' : ''}`}
            onClick={handleApply}
            title={!isAuthenticated ? 'Sign in to apply' : 'Apply for this job'}
          >
            {!isAuthenticated ? '🔒 Sign in' : 'Apply'}
          </button>
          <button 
            className={`save-btn ${isSaved ? 'saved' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (isAuthenticated) {
                onSaveJob(job);
              } else {
                window.location.href = '/signin';
              }
            }}
            title={isSaved ? 'Remove from saved jobs' : 'Save this job'}
          >
            {isSaved ? '💾 Saved' : '💾 Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

const FindJobsList: React.FC<FindJobsListProps> = ({ user, isAuthenticated, onLogout }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Offer[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    keyword: '',
    location: '',
    category: '',
    sortBy: 'latest',
    salaryRange: '',
    jobTypes: ['All'],
    educations: ['All'],
    jobLevel: ''
  });
  const [showAdvancedFilter, setShowAdvancedFilter] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('Overview');

  const handleApplyJob = (jobId: number) => {
    if (!isAuthenticated) {
      navigate('/signin', { state: { from: `/find-jobs` } });
      return;
    }
    navigate(`/job-application/${jobId}`);
  };

  const handleSaveJob = async (job: Offer) => {
    try {
      // Vérifier si l'offre est déjà sauvegardée
      const isCurrentlySaved = savedJobs.includes(job.id);
      
      if (isCurrentlySaved) {
        // Supprimer l'offre des sauvegardes
        // await apiService.unsaveJob(job.id, user?.id);
        setSavedJobs(savedJobs.filter(id => id !== job.id));
      } else {
        // Sauvegarder l'offre
        // await apiService.saveJob(job.id, user?.id);
        setSavedJobs([...savedJobs, job.id]);
      }
      
      // Mettre à jour les statistiques du tableau de bord si nécessaire
      // updateDashboardStats();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'offre:', error);
    }
  };

  const categories = [
    'All Categories', 'Technology', 'Design', 'Marketing', 'Sales', 
    'Finance', 'Human Resources', 'Operations', 'Other'
  ];

  const locations = [
    'All Locations', 'Tunisia', 'France', 'United States', 'Canada', 
    'Germany', 'United Kingdom', 'Italy', 'Spain', 'Remote'
  ];

  const educationLevels = ['All', 'High School', 'Intermediate', 'Graduation', 'Master degree', 'Bachelor degree'];
  const salaryOptions = ['1000-2000', '3000-4000', '4000-5000'];
  const jobTypeOptions = ['All', 'Full time', 'Part time', 'Internship', 'Remote', 'Temporary', 'Contract base'];

  // Navigation items for the top navigation bar
  const navigationItems: NavigationItem[] = [
    { id: 'Home', label: 'Home' },
    { id: 'Find_Job', label: 'Find Job', active: true },
    { id: 'Find_Employers', label: 'Find Employers' },
    { id: 'Dashboard', label: 'Dashboard' },
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
    }
  };

  // Load jobs from API
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getOffers();
        setJobs(data);
        setFilteredJobs(data);
      } catch (error) {
        console.error('Error loading jobs:', error);
        setJobs([]);
        setFilteredJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...jobs];

    if (filters.keyword.trim()) {
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        job.description?.toLowerCase().includes(filters.keyword.toLowerCase())
      );
    }

    if (filters.location && filters.location !== 'All Locations') {
      filtered = filtered.filter(job =>
        job.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.category && filters.category !== 'All Categories') {
      filtered = filtered.filter(job =>
        job.category?.toLowerCase().includes(filters.category.toLowerCase()) ||
        job.title?.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    if (filters.salaryRange) {
      const [minStr, maxStr] = filters.salaryRange.split('-');
      const min = Number(minStr || 0);
      const max = Number(maxStr || 0);
      filtered = filtered.filter(job => {
        const jmin = job.salary_min ?? 0;
        const jmax = job.salary_max ?? jmin ?? 0;
        return jmax >= min && jmin <= max;
      });
    }

    if (filters.jobTypes && !(filters.jobTypes.length === 1 && filters.jobTypes[0] === 'All')) {
      const selected = filters.jobTypes.map(s => s.toLowerCase());
      filtered = filtered.filter(job => selected.some(sel => (job.employment_type || '').toLowerCase().includes(sel)));
    }

    if (filters.educations && !(filters.educations.length === 1 && filters.educations[0] === 'All')) {
      const selectedEdu = filters.educations.map(s => s.toLowerCase());
      filtered = filtered.filter(job => selectedEdu.some(sel => (job.education_level || '').toLowerCase().includes(sel)));
    }

    if (filters.jobLevel && filters.jobLevel !== '') {
      const jl = filters.jobLevel.toLowerCase();
      filtered = filtered.filter(job => (job.job_level || '').toLowerCase().includes(jl));
    }

    switch (filters.sortBy) {
      case 'latest':
        filtered.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        break;
      case 'oldest':
        filtered.sort((a, b) => 
          new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        );
        break;
      case 'salary-high':
        filtered.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0));
        break;
      case 'salary-low':
        filtered.sort((a, b) => (a.salary_min || 0) - (b.salary_min || 0));
        break;
      default:
        break;
    }

    setFilteredJobs(filtered);
  }, [filters, jobs]);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filters are applied automatically via useEffect
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
                className={`nav-link ${item.id === 'Find_Job' ? 'active' : ''}`}
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
            <button className="icon-btn profile-btn">
              {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
            </button>
            {onLogout && (
              <button 
                onClick={onLogout} 
                className="logout-btn"
                title="Logout"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <h3 className="sidebar-title">CANDIDATE DASHBOARD</h3>
          <nav className="sidebar-nav">
            {sidebarItems.map(item => (
              <a 
                key={item.id}
                href="#" 
                className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(item.id);
                  if (item.id === 'Settings') {
                    navigate('/settings');
                  } else if (item.id === 'Applied_Jobs') {
                    navigate('/applied-jobs');
                  }
                }}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
                {item.badge && <span className="badge">{item.badge}</span>}
              </a>
            ))}
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
        <main className="dashboard-main" style={{ padding: '20px' }}>
          <div className="find-jobs-container">
            {/* Search and Filter Section */}
            <div className="search-section">
              <form className="search-form" onSubmit={handleSearch}>
                <div className="search-row">
                  <div className="search-input-group">
                    <input
                      type="text"
                      placeholder="Job title, keyword, company..."
                      className="search-input"
                      value={filters.keyword}
                      onChange={(e) => handleFilterChange('keyword', e.target.value)}
                    />
                  </div>

                  <div className="location-input-group">
                    <select
                      className="location-select"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                    >
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  <div className="category-input-group">
                    <select
                      className="category-select"
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="advanced-toggle-btn"
                      onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                      title="Advanced filters"
                    >
                      <span className="advanced-icon">⚙️</span>
                      <span className="advanced-label">Advanced Filter</span>
                    </button>
                  </div>

                  <button type="submit" className="find-job-btn">Find Job</button>
                </div>
              </form>

              {/* Advanced Filters Modal */}
              {showAdvancedFilter && (
                <div className="advanced-modal-overlay" onClick={() => setShowAdvancedFilter(false)}>
                  <div className="advanced-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="advanced-filters">
                      <h4 className="advanced-title">Advanced filters</h4>
                      
                      {/* Salary Range */}
                      <div className="advanced-group">
                        <label className="block font-medium mb-2">Salary Range</label>
                        <div className="radio-list">
                          {['', ...salaryOptions].map((r) => (
                            <label key={r} style={{display:'block', marginBottom:'0.4rem'}}>
                              <input
                                type="radio"
                                name="salaryRange"
                                value={r}
                                checked={filters.salaryRange === r}
                                onChange={() => setFilters(prev => ({ ...prev, salaryRange: r }))}
                              />
                              <span style={{marginLeft:'0.5rem'}}>{r ? `${r} DT` : 'Any'}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Job Type */}
                      <div className="advanced-group">
                        <label className="block font-medium mb-2">Job Type</label>
                        <div className="checkbox-list">
                          {jobTypeOptions.map(opt => (
                            <label key={opt} style={{display:'block', marginBottom:'0.4rem'}}>
                              <input
                                type="checkbox"
                                value={opt}
                                checked={filters.jobTypes?.includes(opt)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setFilters(prev => {
                                    const current = prev.jobTypes || ['All'];
                                    let next: string[] = [...current];
                                    if (opt === 'All') {
                                      next = checked ? ['All'] : [];
                                    } else {
                                      next = next.filter(x => x !== 'All');
                                      if (checked) next.push(opt);
                                      else next = next.filter(x => x !== opt);
                                    }
                                    if (next.length === 0) next = ['All'];
                                    return { ...prev, jobTypes: next };
                                  });
                                }}
                              />
                              <span style={{marginLeft:'0.5rem'}}>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Education Level */}
                      <div className="advanced-group">
                        <label className="block font-medium mb-2">Education Level</label>
                        <div className="checkbox-list">
                          {educationLevels.map(opt => (
                            <label key={opt} style={{display:'block', marginBottom:'0.4rem'}}>
                              <input
                                type="checkbox"
                                value={opt}
                                checked={filters.educations?.includes(opt)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setFilters(prev => {
                                    const current = prev.educations || ['All'];
                                    let next: string[] = [...current];
                                    if (opt === 'All') {
                                      next = checked ? ['All'] : [];
                                    } else {
                                      next = next.filter(x => x !== 'All');
                                      if (checked) next.push(opt);
                                      else next = next.filter(x => x !== opt);
                                    }
                                    if (next.length === 0) next = ['All'];
                                    return { ...prev, educations: next };
                                  });
                                }}
                              />
                              <span style={{marginLeft:'0.5rem'}}>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="advanced-actions">
                        <button 
                          type="button" 
                          className="btn btn-outline"
                          onClick={() => setShowAdvancedFilter(false)}
                        >
                          Close
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-primary"
                          onClick={() => setShowAdvancedFilter(false)}
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div className="results-section">
              <div className="results-header">
                <h2 className="results-title">Available Jobs</h2>
                <div className="view-options">
                  <span className="results-count">{filteredJobs.length} jobs found</span>
                  <div className="view-toggle">
                    <button
                      className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                      title="List View"
                    >
                      ☰
                    </button>
                    <button
                      className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                      title="Grid View"
                    >
                      ⬜
                    </button>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading jobs...</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="no-results">
                  <p>No jobs found matching your criteria. Try adjusting your filters.</p>
                </div>
              ) : (
                <div className={`jobs-container ${viewMode === 'grid' ? 'grid-view' : 'list-view'}`}>
                  {filteredJobs.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      viewMode={viewMode}
                      isAuthenticated={isAuthenticated}
                      onApplyClick={handleApplyJob}
                      onSaveJob={handleSaveJob}
                      isSaved={savedJobs.includes(job.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FindJobsList;
