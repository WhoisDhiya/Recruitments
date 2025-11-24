import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PostJobPage.css';
import type { DashboardProps } from '../types';
import PostJobForm from './PostJobForm';

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

const PostJobPage: React.FC<DashboardProps> = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editJobParam = searchParams.get('edit');
  const editJobId = editJobParam ? parseInt(editJobParam, 10) : undefined;

  const handleSidebarClick = (itemId: string) => {
    if (itemId === 'Overview') {
      navigate('/dashboard');
    } else if (itemId === 'My_Jobs') {
      navigate('/my-jobs');
    } else if (itemId === 'Settings') {
      navigate('/settings');
    }
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
          <PostJobForm
            user={user}
            onLogout={onLogout}
            editJobId={editJobId}
          />
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

