import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './JobApplicationPage.css';
import { apiService } from '../services/api';
import type { User, Offer } from '../types';

interface JobApplicationPageProps {
  user?: User;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

const JobApplicationPage: React.FC<JobApplicationPageProps> = ({ user, isAuthenticated = true, onLogout }) => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<Offer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    fullName: user?.first_name ? `${user.first_name} ${user.last_name}` : '',
    email: user?.email || '',
    phone: '',
    address: '',
    cvFile: null as File | null,
    portfolio: '',
    coverLetter: '',
    agreeToTerms: false
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    const loadJobDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!jobId) {
          throw new Error('Job ID not found');
        }

        const jobDetails = await apiService.getOffer(parseInt(jobId));
        setJob(jobDetails);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load job details';
        console.error('❌ Error loading job:', errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadJobDetails();
  }, [jobId, isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement & HTMLTextAreaElement;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setError('❌ Le fichier doit être au format PDF');
        e.target.value = ''; // Reset file input
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('❌ La taille du fichier ne doit pas dépasser 10 Mo');
        e.target.value = ''; // Reset file input
        return;
      }
      setError(null);
      setFormData(prev => ({
        ...prev,
        cvFile: file
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return false;
    }
    if (!formData.cvFile) {
      setError('CV/Resume (PDF) is required');
      return false;
    }
    if (formData.cvFile.type !== 'application/pdf') {
      setError('CV must be in PDF format');
      return false;
    }
    if (formData.cvFile.size > 10 * 1024 * 1024) {
      setError('CV file must be less than 10MB');
      return false;
    }
    if (!formData.coverLetter.trim()) {
      setError('Cover letter is required');
      return false;
    }
    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (!jobId) {
        throw new Error('Missing job ID');
      }

      console.log('📨 Submitting application for job:', jobId);

      // Call backend API to create application (only offer_id required)
      const application = await apiService.createApplication(parseInt(jobId));

      console.log('✅ Application submitted successfully:', application);
      setSuccessMessage('✅ Candidature envoyée avec succès ! Nous examinerons votre candidature et vous recontacterons bientôt.');
      
      // Reset form
      setFormData({
        fullName: user?.first_name ? `${user.first_name} ${user.last_name}` : '',
        email: user?.email || '',
        phone: '',
        address: '',
        cvFile: null,
        portfolio: '',
        coverLetter: '',
        agreeToTerms: false
      });

      // Redirection vers Applied Jobs après 3 secondes
      setTimeout(() => {
        navigate('/applied-jobs');
      }, 3000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit application';
      console.error('❌ Error submitting application:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="application-page error-container">
        <div className="error-box">
          <h2>Authentication Required</h2>
          <p>Please sign in to apply for jobs.</p>
          <button onClick={() => navigate('/signin')} className="btn btn-primary">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="application-page loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="application-page error-container">
        <div className="error-box">
          <h2>Job Not Found</h2>
          <p>The job you're trying to apply for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/find-jobs')} className="btn btn-primary">
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="application-page">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>Job Application</h1>
          <p className="breadcrumb">
            <span onClick={() => navigate('/find-jobs')} className="link">Find Jobs</span>
            {' > '} Apply
          </p>
        </div>
        <button onClick={onLogout} className="btn btn-logout">Logout</button>
      </header>

      {/* Navigation Bar */}
      <nav className="application-nav">
        <div className="nav-buttons">
          <button
            onClick={() => navigate('/')}
            className="nav-btn nav-home"
            title="Go back to home page"
          >
            🏠 Home
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="nav-btn nav-dashboard"
            title="Go to your dashboard"
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => navigate('/find-jobs')}
            className="nav-btn nav-find-jobs"
            title="Browse all available jobs"
          >
            🔍 Find Jobs
          </button>
        </div>
      </nav>

      <div className="application-container">
        <div className="application-wrapper">
          {/* Job Summary */}
          <div className="job-summary">
            <div className="job-summary-card">
              <div className="job-icon">
                {job.company_name?.charAt(0).toUpperCase() || 'J'}
              </div>
              <div className="job-info">
                <h2 className="job-title">{job.title}</h2>
                <p className="company-name">{job.company_name || 'Company'}</p>
                <div className="job-details">
                  <span className="detail-item">📍 {job.location || 'Location not specified'}</span>
                  <span className="detail-item">💼 {job.employment_type || 'Full-time'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="alert alert-success">
              <p>{successMessage}</p>
              <small>Redirection vers Mes Candidatures dans 3 secondes...</small>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-error">
              <p>⚠️ {error}</p>
            </div>
          )}

          {/* Application Form */}
          {!successMessage && (
            <form onSubmit={handleSubmit} className="application-form">
              <h3>Your Information</h3>

              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your email address"
                  disabled={isSubmitting}
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your phone number"
                  disabled={isSubmitting}
                />
              </div>

              {/* Address */}
              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  Address <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your full address (street, city, postal code)"
                  disabled={isSubmitting}
                />
              </div>

              {/* CV/Resume */}
              <div className="form-group">
                <label htmlFor="cv" className="form-label">
                  CV/Resume (PDF) <span className="required">*</span>
                </label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="cv"
                    name="cv"
                    accept=".pdf,application/pdf"
                    onChange={handleCvFileChange}
                    className="file-input"
                    disabled={isSubmitting}
                    required
                  />
                  <label htmlFor="cv" className="file-input-label">
                    📄 {formData.cvFile ? 'Changer le fichier' : 'Sélectionner un fichier PDF'}
                  </label>
                  {formData.cvFile && (
                    <div className="file-selected">
                      <span className="file-name">{formData.cvFile.name}</span>
                      <span className="file-size">({(formData.cvFile.size / (1024 * 1024)).toFixed(2)} Mo)</span>
                      <button 
                        type="button" 
                        className="remove-file-btn"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, cvFile: null }));
                          const fileInput = document.getElementById('cv') as HTMLInputElement;
                          if (fileInput) fileInput.value = '';
                        }}
                        title="Supprimer le fichier"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                <small className="form-hint">Téléchargez votre CV au format PDF (max 10 Mo)</small>
              </div>

              {/* Portfolio */}
              <div className="form-group">
                <label htmlFor="portfolio" className="form-label">
                  Portfolio URL <span className="optional">(optional)</span>
                </label>
                <input
                  type="url"
                  id="portfolio"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="https://your-portfolio.com"
                  disabled={isSubmitting}
                />
              </div>

              {/* Cover Letter */}
              <div className="form-group">
                <label htmlFor="coverLetter" className="form-label">
                  Cover Letter <span className="required">*</span>
                </label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Tell us why you're interested in this position and why you're a great fit..."
                  rows={6}
                  disabled={isSubmitting}
                />
                <small className="char-count">{formData.coverLetter.length} characters</small>
              </div>

              {/* Terms and Conditions */}
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="form-checkbox"
                  disabled={isSubmitting}
                />
                <label htmlFor="agreeToTerms" className="checkbox-label">
                  I agree to the terms and conditions and acknowledge that my application will be reviewed by the recruiter.
                </label>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/find-jobs')}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-small"></span> Submitting...
                    </>
                  ) : (
                    '✓ Submit Application'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Job Description */}
          <div className="job-description-section">
            <h3>Job Description</h3>
            <p className="job-description">
              {job.description || 'No description available for this job.'}
            </p>
          </div>
        </div>

        {/* Sidebar - Application Tips */}
        <aside className="application-sidebar">
          <div className="tips-card">
            <h4>📝 Application Tips</h4>
            <ul className="tips-list">
              <li>Write a personalized cover letter that shows your genuine interest</li>
              <li>Highlight relevant skills and experience</li>
              <li>Keep your application concise and professional</li>
              <li>Ensure your contact information is correct</li>
              <li>Submit your application as soon as possible</li>
            </ul>
          </div>

          <div className="info-card">
            <h4>ℹ️ What Happens Next?</h4>
            <ol className="info-list">
              <li>Your application will be reviewed by our team</li>
              <li>If your profile matches the job requirements, we'll contact you</li>
              <li>You may be invited for an interview</li>
              <li>We'll keep you updated throughout the process</li>
            </ol>
          </div>

          <div className="stats-card">
            <div className="stat">
              <div className="stat-value">24hrs</div>
              <div className="stat-label">Avg. Response</div>
            </div>
            <div className="stat">
              <div className="stat-value">95%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default JobApplicationPage;
