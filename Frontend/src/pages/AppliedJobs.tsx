import React from 'react';
import './Dashboard.css';
import type { ApplicationUI } from '../types';

const AppliedJobs: React.FC = () => {
  // Données des candidatures
  const recentApplications: ApplicationUI[] = [
    {
      id: 1,
      job: {
        title: 'Networking Engineer',
        company: 'Up',
        location: 'Sousse',
        salary: '1500-2000 DT/month',
        type: 'Remote',
        icon: '📈',
        iconColor: 'green'
      },
      dateApplied: 'Feb 2, 2019 19:28',
      status: 'Active',
      action: 'View Details'
    },
    {
      id: 2,
      job: {
        title: 'Product Designer',
        company: 'DesignStudio',
        location: 'Mahdia',
        salary: '1500-1800 DT/month',
        type: 'Full Time',
        icon: '⚙️',
        iconColor: 'pink'
      },
      dateApplied: 'Dec 7, 2019 23:26',
      status: 'Active',
      action: 'View Details'
    },
    {
      id: 3,
      job: {
        title: 'Junior Graphic Designer',
        company: 'Apple Inc',
        location: 'Monastir',
        salary: '1400-1800 DT/month',
        type: 'Temporary',
        icon: '🍎',
        iconColor: 'black'
      },
      dateApplied: 'Feb 2, 2019 19:28',
      status: 'Active',
      action: 'View Details'
    },
    {
      id: 4,
      job: {
        title: 'Visual Designer',
        company: 'Microsoft',
        location: 'Tunis',
        salary: '2000-2500 DT/month',
        type: 'Contract Base',
        icon: '🪟',
        iconColor: 'multicolor'
      },
      dateApplied: 'Dec 7, 2019 23:26',
      status: 'Active',
      action: 'View Details'
    },
    {
      id: 5,
      job: {
        title: 'Marketing Officer',
        company: 'Twitter',
        location: 'Ben Arous',
        salary: '1500-1800 DT/month',
        type: 'Full Time',
        icon: '🐦',
        iconColor: 'blue'
      },
      dateApplied: 'Dec 4, 2019 21:42',
      status: 'Active',
      action: 'View Details'
    },
    {
      id: 6,
      job: {
        title: 'UI/UX Designer',
        company: 'Facebook',
        location: 'Nabeul',
        salary: '1500-1800 DT/month',
        type: 'Full Time',
        icon: '📘',
        iconColor: 'blue'
      },
      dateApplied: 'Dec 30, 2019 07:52',
      status: 'Active',
      action: 'View Details'
    },
    {
      id: 7,
      job: {
        title: 'Software Engineer',
        company: 'Google',
        location: 'Ariana',
        salary: '1500-1800 DT/month',
        type: 'Full Time',
        icon: '🔍',
        iconColor: 'multicolor'
      },
      dateApplied: 'Dec 30, 2019 05:18',
      status: 'Active',
      action: 'View Details'
    },
    {
      id: 8,
      job: {
        title: 'Front End Developer',
        company: 'Reddit',
        location: 'Sfax',
        salary: '1500-1800 DT/month',
        type: 'Full Time',
        icon: '🔴',
        iconColor: 'red'
      },
      dateApplied: 'Mar 20, 2019 23:14',
      status: 'Active',
      action: 'View Details'
    }
  ];

  return (
    <div className="applied-jobs-section">
      <div className="section-header">
        <h1 className="section-title">Applied Jobs (589)</h1>
      </div>
      
      <div className="applications-table">
        <div className="table-header">
          <div className="table-cell">JOBS</div>
          <div className="table-cell">DATE APPLIED</div>
          <div className="table-cell">STATUS</div>
          <div className="table-cell">ACTION</div>
        </div>
        
        {recentApplications.map(application => (
          <div key={application.id} className="table-row">
            <div className="table-cell job-cell">
              <div className="job-info">
                <div className="job-icon-container">
                  <span className={`job-icon ${application.job.iconColor}`}>
                    {application.job.icon}
                  </span>
                  <span className={`trend-icon ${application.job.iconColor}`}>↗️</span>
                </div>
                <div className="job-details">
                  <div className="job-title">{application.job.title}</div>
                  <div className="job-company">{application.job.company}</div>
                  <div className="job-meta">
                    <span className="job-type">{application.job.type}</span>
                    <span className="job-location">{application.job.location}</span>
                    <span className="job-salary">{application.job.salary}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="table-cell date-cell">
              {application.dateApplied}
            </div>
            
            <div className="table-cell status-cell">
              <span className="status-badge">✓ {application.status}</span>
            </div>
            
            <div className="table-cell action-cell">
              <button className="action-button">
                {application.action}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div className="pagination">
        <button className="pagination-btn">←</button>
        <button className="pagination-btn active">01</button>
        <button className="pagination-btn">02</button>
        <button className="pagination-btn">03</button>
        <button className="pagination-btn">04</button>
        <button className="pagination-btn">05</button>
        <button className="pagination-btn">→</button>
      </div>
    </div>
  );
};

export default AppliedJobs;
