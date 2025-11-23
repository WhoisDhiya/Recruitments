import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PostJobPage.css';
import type { DashboardProps } from '../types';
import { apiService } from '../services/api';

interface PostJobFormData {
  jobTitle: string;
  tags: string;
  jobRole: string;
  minSalary: string;
  maxSalary: string;
  salaryType: string;
  education: string;
  experience: string;
  jobType: string;
  vacancies: string;
  expirationDate: string;
  jobLevel: string;
  description: string;
  responsibilities: string;
}

const PostJobPage: React.FC<DashboardProps> = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editJobId = searchParams.get('edit');
  const isEditMode = !!editJobId;
  const [isLoading, setIsLoading] = useState(isEditMode);
  
  const [formData, setFormData] = useState<PostJobFormData>({
    jobTitle: '',
    tags: '',
    jobRole: '',
    minSalary: '',
    maxSalary: '',
    salaryType: '',
    education: '',
    experience: '',
    jobType: '',
    vacancies: '',
    expirationDate: '',
    jobLevel: '',
    description: '',
    responsibilities: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load job data if in edit mode
  useEffect(() => {
    const loadJobData = async () => {
      if (!isEditMode || !editJobId) return;

      try {
        const jobData = await apiService.getJobDetails(parseInt(editJobId));
        const { offer, requirement } = jobData;

        if (requirement) {
          // Reverse map jobType from backend to frontend
          const jobTypeReverseMap: { [key: string]: string } = {
            'CDI': 'Full Time',
            'CDD': 'Contract',
            'Stage': 'Internship',
            'Freelance': 'Temporary',
            'Part-time': 'Part Time'
          };

          // Reverse map salaryType
          const salaryTypeReverseMap: { [key: string]: string } = {
            'Yearly': 'Annually',
            'Monthly': 'Monthly',
            'Hourly': 'Hourly'
          };

          // Reverse map jobLevel
          const jobLevelReverseMap: { [key: string]: string } = {
            'Mid-level': 'Mid Level',
            'Junior': 'Junior',
            'Senior': 'Senior'
          };

          setFormData({
            jobTitle: requirement.jobTitle || '',
            tags: requirement.tags || '',
            jobRole: requirement.jobRole || '',
            minSalary: requirement.minSalary ? requirement.minSalary.toString() : '',
            maxSalary: requirement.maxSalary ? requirement.maxSalary.toString() : '',
            salaryType: requirement.salaryType ? (salaryTypeReverseMap[requirement.salaryType] || requirement.salaryType) : '',
            education: requirement.education || '',
            experience: requirement.experience || '',
            jobType: requirement.jobType ? (jobTypeReverseMap[requirement.jobType] || requirement.jobType) : '',
            vacancies: requirement.vacancies ? requirement.vacancies.toString() : '',
            expirationDate: requirement.expirationDate || offer.date_expiration || '',
            jobLevel: requirement.jobLevel ? (jobLevelReverseMap[requirement.jobLevel] || requirement.jobLevel) : '',
            description: requirement.description || '',
            responsibilities: requirement.responsibilities || '',
          });
        }
      } catch (error) {
        console.error('Error loading job data:', error);
        alert('Failed to load job data. Redirecting...');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadJobData();
  }, [isEditMode, editJobId, navigate]);

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
    { id: 'Post_a_Job', label: 'Post a Job', icon: '➕', active: true },
    { id: 'My_Jobs', label: 'My Jobs', icon: '💼' },
    { id: 'Saved_Candidate', label: 'Saved Candidate', icon: '⭐' },
    { id: 'Plans_Billing', label: 'Plans & Billing', icon: '💳' },
    { id: 'All_Companies', label: 'All Companies', icon: '🏢' },
    { id: 'Settings', label: 'Settings', icon: '⚙️' }
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Basic validations: salaries positive and max > min; expiration date in the future
      const min = formData.minSalary ? parseFloat(formData.minSalary) : undefined;
      const max = formData.maxSalary ? parseFloat(formData.maxSalary) : undefined;

      if ((min !== undefined && (isNaN(min) || min <= 0)) || (max !== undefined && (isNaN(max) || max <= 0))) {
        alert('Salary values must be positive numbers.');
        setIsSubmitting(false);
        return;
      }

      if (min !== undefined && max !== undefined && max <= min) {
        alert('Max salary must be greater than min salary.');
        setIsSubmitting(false);
        return;
      }

      if (formData.expirationDate) {
        const exp = new Date(formData.expirationDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isNaN(exp.getTime()) || exp <= today) {
          alert('Expiration date must be later than today.');
          setIsSubmitting(false);
          return;
        }
      }

      if (!user?.id) {
        alert('User not authenticated. Please log in again.');
        setIsSubmitting(false);
        navigate('/signin');
        return;
      }

      // First, get the recruiter_id from user_id
      let recruiterId: number;
      try {
        const recruiter = await apiService.getRecruiterByUserId(user.id);
        recruiterId = recruiter.id;
      } catch (error) {
        console.error('Error fetching recruiter profile:', error);
        alert('Could not find recruiter profile. Please ensure you are logged in as a recruiter.');
        setIsSubmitting(false);
        return;
      }

      // Map job type from frontend values to backend expected values
      const jobTypeMap: { [key: string]: string } = {
        'Full Time': 'CDI',
        'Part Time': 'Part-time',
        'Contract': 'CDD',
        'Internship': 'Stage',
        'Temporary': 'Freelance'
      };

      // Map salary type from frontend to backend
      const salaryTypeMap: { [key: string]: string } = {
        'Annually': 'Yearly',
        'Monthly': 'Monthly',
        'Hourly': 'Hourly'
      };

      // Map job level from frontend to backend
      const jobLevelMap: { [key: string]: string } = {
        'Junior': 'Junior',
        'Mid Level': 'Mid-level',
        'Senior': 'Senior',
        'Executive': 'Senior' // Executive maps to Senior as backend doesn't have Executive
      };

      // Parse vacancies - handle ranges like "2-5" by taking the first number
      let vacanciesNumber: number | undefined = undefined;
      if (formData.vacancies) {
        if (formData.vacancies.includes('+')) {
          // For "10+", use 10
          vacanciesNumber = parseInt(formData.vacancies.replace('+', ''));
        } else if (formData.vacancies.includes('-')) {
          // For "2-5", use the first number
          vacanciesNumber = parseInt(formData.vacancies.split('-')[0]);
        } else {
          vacanciesNumber = parseInt(formData.vacancies);
        }
      }

      // Set dates - MySQL DATE columns expect YYYY-MM-DD format
      const today = new Date();
      const dateOffer = today.toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
      // expirationDate is already in YYYY-MM-DD format from the date input
      const dateExpiration = formData.expirationDate || undefined;

      // Debug: Log the date format to verify it's correct
      console.log('Date offer format:', dateOffer, 'Type:', typeof dateOffer);
      console.log('Date expiration format:', dateExpiration, 'Type:', typeof dateExpiration);

      // Create offer data with both Offer and Requirement fields
      const offerData = {
        // Offer fields
        title: formData.jobTitle,
        date_offer: dateOffer,
        date_expiration: dateExpiration,
        // Requirement fields
        jobTitle: formData.jobTitle,
        tags: formData.tags || undefined,
        jobRole: formData.jobRole || undefined,
        minSalary: formData.minSalary ? parseFloat(formData.minSalary) : undefined,
        maxSalary: formData.maxSalary ? parseFloat(formData.maxSalary) : undefined,
        salaryType: formData.salaryType ? (salaryTypeMap[formData.salaryType] || formData.salaryType) as 'Yearly' | 'Monthly' | 'Hourly' : undefined,
        education: formData.education || undefined,
        experience: formData.experience || undefined,
        jobType: formData.jobType ? (jobTypeMap[formData.jobType] || formData.jobType) as 'CDI' | 'CDD' | 'Stage' | 'Freelance' | 'Part-time' : undefined,
        vacancies: vacanciesNumber,
        expirationDate: dateExpiration,
        jobLevel: formData.jobLevel ? (jobLevelMap[formData.jobLevel] || formData.jobLevel) as 'Junior' | 'Mid-level' | 'Senior' : undefined,
        description: formData.description || undefined,
        responsibilities: formData.responsibilities || undefined
      };

      // Call the correct API endpoint based on mode
      if (isEditMode && editJobId) {
        // Update existing job
        const result = await apiService.updateOffer(parseInt(editJobId), offerData);
        alert(result.message || 'Job updated successfully!');
        navigate(`/job-details/${editJobId}`);
      } else {
        // Create new job
        const result = await apiService.createOfferForRecruiter(recruiterId, offerData);
        alert(result.message || 'Job posted successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to post job. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSidebarClick = (itemId: string) => {
    if (itemId === 'Overview') {
      navigate('/dashboard');
    } else if (itemId === 'Post_a_Job') {
      // Already on this page
      return;
    } else if (itemId === 'My_Jobs') {
      navigate('/my-jobs')
    } else if (itemId === 'Settings') {
      navigate('/settings');
    }
    // Handle other navigation items
  };

  return (
    <div className="post-job-page">
      {/* Top Navigation Bar */}
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
                  navigate('/dashboard');
                } else if (item.id === 'My Jobs') {
                  navigate('/my-jobs');
                }
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Header with Logo */}
      <header className="recruiter-header">
        <div className="header-logo">
          <div className="logo-container">
            <div className="logo-icon-briefcase">💼</div>
            <span className="logo-text">RecruPLus</span>
          </div>
        </div>
        <div className="header-actions">
          {/* Removed: notification bell and post job button */}
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
                className={`sidebar-link ${item.active ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleSidebarClick(item.id);
                }}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </a>
            ))}
          </nav>
          <div className="logout-section">
            <button
              onClick={onLogout}
              className="logout-link"
            >
              <span className="logout-icon">↗️</span>
              Log-out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="post-job-main">
          {isLoading ? (
            <div className="loading-state">Loading job data...</div>
          ) : (
            <>
              <h1 className="post-job-title">{isEditMode ? 'Edit Job' : 'Post a job'}</h1>

              <form onSubmit={handleSubmit} className="post-job-form">
            {/* Job Details Section */}
            <div className="form-section">
              <label htmlFor="jobTitle">Job Title</label>
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                placeholder="Add job title, role, vacancies etc"
                value={formData.jobTitle}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-section">
                <label htmlFor="tags">Tags</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  placeholder="Job keyword, tags etc..."
                  value={formData.tags}
                  onChange={handleChange}
                />
              </div>
              <div className="form-section">
                <label htmlFor="jobRole">Job Role</label>
                <select
                  id="jobRole"
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleChange}
                >
                  <option value="">Select...</option>
                  <option value="Software Developer">Software Developer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Marketing Manager">Marketing Manager</option>
                  <option value="Sales Representative">Sales Representative</option>
                </select>
              </div>
            </div>

            {/* Salary Section */}
            <div className="form-section">
              <label className="section-label">Salary</label>
              <div className="form-row salary-row">
                <div className="form-section salary-field">
                  <label htmlFor="minSalary">Min Salary</label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      id="minSalary"
                      name="minSalary"
                      placeholder="Minimum salary..."
                      value={formData.minSalary}
                      onChange={handleChange}
                    />
                    <span className="unit-label">USD</span>
                  </div>
                </div>
                <div className="form-section salary-field">
                  <label htmlFor="maxSalary">Max Salary</label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      id="maxSalary"
                      name="maxSalary"
                      placeholder="Maximum salary..."
                      value={formData.maxSalary}
                      onChange={handleChange}
                    />
                    <span className="unit-label">USD</span>
                  </div>
                </div>
                <div className="form-section salary-field">
                  <label htmlFor="salaryType">Salary Type</label>
                  <select
                    id="salaryType"
                    name="salaryType"
                    value={formData.salaryType}
                    onChange={handleChange}
                  >
                    <option value="">Select...</option>
                    <option value="Hourly">Hourly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Advance Information Section */}
            <div className="form-section">
              <label className="section-label">Advanced Information</label>
              <div className="form-grid">
                <div className="form-section">
                  <label htmlFor="education">Education</label>
                  <select
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                  >
                    <option value="">Select...</option>
                    <option value="High School">High School</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
                <div className="form-section">
                  <label htmlFor="experience">Experience</label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                  >
                    <option value="">Select...</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                    <option value="10+ years">10+ years</option>
                  </select>
                </div>
                <div className="form-section">
                  <label htmlFor="jobType">Job Type</label>
                  <select
                    id="jobType"
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                  >
                    <option value="">Select...</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>
                <div className="form-section">
                  <label htmlFor="vacancies">Vacancies</label>
                  <select
                    id="vacancies"
                    name="vacancies"
                    value={formData.vacancies}
                    onChange={handleChange}
                  >
                    <option value="">Select...</option>
                    <option value="1">1</option>
                    <option value="2-5">2-5</option>
                    <option value="5-10">5-10</option>
                    <option value="10+">10+</option>
                  </select>
                </div>
                <div className="form-section">
                  <label htmlFor="expirationDate">Expiration Date</label>
                  <input
                    type="date"
                    id="expirationDate"
                    name="expirationDate"
                    value={formData.expirationDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-section">
                  <label htmlFor="jobLevel">Job Level</label>
                  <select
                    id="jobLevel"
                    name="jobLevel"
                    value={formData.jobLevel}
                    onChange={handleChange}
                  >
                    <option value="">Select...</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="form-section">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                placeholder="Add your job description..."
                value={formData.description}
                onChange={handleChange}
                rows={8}
                required
              />
              <div className="text-editor-toolbar">
                <button type="button" className="toolbar-btn">B</button>
                <button type="button" className="toolbar-btn">I</button>
                <button type="button" className="toolbar-btn">U</button>
                <button type="button" className="toolbar-btn">S</button>
                <button type="button" className="toolbar-btn">🔗</button>
                <button type="button" className="toolbar-btn">•</button>
                <button type="button" className="toolbar-btn">1.</button>
              </div>
            </div>

            {/* Responsibilities Section */}
            <div className="form-section">
              <label htmlFor="responsibilities">Responsibilities</label>
              <textarea
                id="responsibilities"
                name="responsibilities"
                placeholder="Add your job responsibilities..."
                value={formData.responsibilities}
                onChange={handleChange}
                rows={8}
              />
              <div className="text-editor-toolbar">
                <button type="button" className="toolbar-btn">B</button>
                <button type="button" className="toolbar-btn">I</button>
                <button type="button" className="toolbar-btn">U</button>
                <button type="button" className="toolbar-btn">S</button>
                <button type="button" className="toolbar-btn">🔗</button>
                <button type="button" className="toolbar-btn">•</button>
                <button type="button" className="toolbar-btn">1.</button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="post-job-submit-btn"
              disabled={isSubmitting || isLoading}
            >
              {isEditMode ? 'Update Job →' : 'Post Job →'}
            </button>
          </form>
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="recruiter-footer">
        <p>@2024 MyJob - Job Portal. All rights Reserved</p>
      </footer>
    </div>
  );
};

export default PostJobPage;

