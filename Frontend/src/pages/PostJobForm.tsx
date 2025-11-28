import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export interface PostJobSuccessPayload {
  mode: 'create' | 'edit';
  offerId?: number;
}

interface PostJobFormProps extends DashboardProps {
  editJobId?: number | null;
  onSuccess?: (payload: PostJobSuccessPayload) => void;
  onCancel?: () => void;
}

const defaultFormState: PostJobFormData = {
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
};

const PostJobForm: React.FC<PostJobFormProps> = ({ user, onLogout, editJobId, onSuccess }) => {
  const navigate = useNavigate();
  const isEditMode = !!editJobId;
  const [isLoading, setIsLoading] = useState<boolean>(!!editJobId);
  const [formData, setFormData] = useState<PostJobFormData>(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNavigateAway = (path: string) => {
    navigate(path);
  };

  useEffect(() => {
    const loadJobData = async () => {
      if (!isEditMode || !editJobId) return;

      try {
        const jobData = await apiService.getJobDetails(editJobId);
        const { offer, requirement } = jobData;

        if (requirement) {
          const jobTypeReverseMap: Record<string, string> = {
            'CDI': 'Full Time',
            'CDD': 'Contract',
            'Stage': 'Internship',
            'Freelance': 'Temporary',
            'Part-time': 'Part Time'
          };

          const salaryTypeReverseMap: Record<string, string> = {
            'Yearly': 'Annually',
            'Monthly': 'Monthly',
            'Hourly': 'Hourly'
          };

          const jobLevelReverseMap: Record<string, string> = {
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
        handleNavigateAway('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadJobData();
  }, [isEditMode, editJobId]);

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
        handleNavigateAway('/signin');
        return;
      }

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

      const jobTypeMap: Record<string, string> = {
        'Full Time': 'CDI',
        'Part Time': 'Part-time',
        'Contract': 'CDD',
        'Internship': 'Stage',
        'Temporary': 'Freelance'
      };

      const salaryTypeMap: Record<string, string> = {
        'Annually': 'Yearly',
        'Monthly': 'Monthly',
        'Hourly': 'Hourly'
      };

      const jobLevelMap: Record<string, string> = {
        'Junior': 'Junior',
        'Mid Level': 'Mid-level',
        'Senior': 'Senior',
        'Executive': 'Senior'
      };

      let vacanciesNumber: number | undefined = undefined;
      if (formData.vacancies) {
        if (formData.vacancies.includes('+')) {
          vacanciesNumber = parseInt(formData.vacancies.replace('+', ''));
        } else if (formData.vacancies.includes('-')) {
          vacanciesNumber = parseInt(formData.vacancies.split('-')[0]);
        } else {
          vacanciesNumber = parseInt(formData.vacancies);
        }
      }

      const today = new Date();
      const dateOffer = today.toISOString().split('T')[0];
      const dateExpiration = formData.expirationDate || undefined;

      const offerData = {
        title: formData.jobTitle,
        date_offer: dateOffer,
        date_expiration: dateExpiration,
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

      if (isEditMode && editJobId) {
        const result = await apiService.updateOffer(editJobId, offerData);
        alert(result.message || 'Job updated successfully!');
        if (onSuccess) {
          onSuccess({ mode: 'edit', offerId: editJobId });
        } else {
          handleNavigateAway(`/job-details/${editJobId}`);
        }
      } else {
        const result = await apiService.createOfferForRecruiter(recruiterId, offerData);
        // Show backend message if present
        if (result.message) {
          alert(result.message);
        }

        // If backend returned warnings (e.g. missing subscription), show them but allow creation
        const warnings = result.data?.warnings;
        if (warnings && warnings.length > 0) {
          alert(warnings.join('\n'));
        }

        if (onSuccess) {
          onSuccess({ mode: 'create' });
        } else {
          handleNavigateAway('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error posting job:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to post job. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="loading-state">Loading job data...</div>;
  }

  return (
    <>
      <h1 className="post-job-title">{isEditMode ? 'Edit Job' : 'Post a job'}</h1>

      <form onSubmit={handleSubmit} className="post-job-form">
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

        <button 
          type="submit" 
          className="post-job-submit-btn"
          disabled={isSubmitting || isLoading}
        >
          {isEditMode ? 'Update Job →' : 'Post Job →'}
        </button>
      </form>
    </>
  );
};

export default PostJobForm;

