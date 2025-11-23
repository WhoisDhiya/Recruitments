import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Building2, Mail, MapPin, Briefcase, User } from 'lucide-react';
import './EmployerProfile.css';
import type { DashboardProps } from '../types';
import { apiService } from '../services/api';

const EmployerProfile: React.FC<DashboardProps> = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const [recruiterData, setRecruiterData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id || user?.role !== 'recruiter') {
        navigate('/dashboard');
        return;
      }

      try {
        const recruiter = await apiService.getRecruiterByUserId(user.id);
        setRecruiterData(recruiter);
      } catch (error) {
        console.error('Error loading employer profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="employer-profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!recruiterData) {
    return (
      <div className="employer-profile-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>Could not load employer profile</p>
          <button onClick={() => navigate('/dashboard')} className="back-button">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="employer-profile-page">
      {/* Header */}
      <header className="employer-profile-header">
        <div className="header-content">
          <button onClick={() => navigate('/dashboard')} className="back-button-header">
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

      <div className="employer-profile-content">
        <main className="employer-profile-main">
          {/* Profile Header */}
          <div className="profile-header-section">
            <div className="profile-avatar">
              <Building2 size={64} />
            </div>
            <div className="profile-header-info">
              <h1 className="profile-name">
                {user?.first_name} {user?.last_name}
              </h1>
              <p className="profile-role">Recruiter</p>
              <button 
                onClick={() => navigate('/settings')}
                className="edit-profile-btn"
              >
                <Edit2 size={18} />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Personal Information Card */}
          <div className="info-card">
            <h2 className="card-title">
              <User size={24} />
              Personal Information
            </h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">First Name</span>
                <span className="info-value">{user?.first_name || 'Not set'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Name</span>
                <span className="info-value">{user?.last_name || 'Not set'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{user?.email || 'Not set'}</span>
              </div>
            </div>
          </div>

          {/* Company Information Card */}
          <div className="info-card">
            <h2 className="card-title">
              <Building2 size={24} />
              Company Information
            </h2>
            <div className="info-grid">
              <div className="info-item full-width">
                <span className="info-label">Company Name</span>
                <span className="info-value">{recruiterData.company_name || 'Not set'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <Briefcase size={18} />
                  Industry
                </span>
                <span className="info-value">{recruiterData.industry || 'Not set'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <Mail size={18} />
                  Company Email
                </span>
                <span className="info-value">{recruiterData.company_email || 'Not set'}</span>
              </div>
              <div className="info-item full-width">
                <span className="info-label">
                  <MapPin size={18} />
                  Company Address
                </span>
                <span className="info-value">{recruiterData.company_address || 'Not set'}</span>
              </div>
              <div className="info-item full-width">
                <span className="info-label">Company Description</span>
                <div className="info-value description-text">
                  {recruiterData.description || 'No description provided'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              onClick={() => navigate('/settings')}
              className="btn-primary"
            >
              <Edit2 size={18} />
              Edit Profile
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>

      <footer className="employer-profile-footer">
        <p>@2024 MyJob - Job Portal. All rights Reserved</p>
      </footer>
    </div>
  );
};

export default EmployerProfile;

