import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Eye, EyeOff, Save, X, Building2 } from 'lucide-react';
import './Settings.css';
import { apiService } from '../services/api';
import type { User as UserType } from '../types';

interface SettingsProps {
  user?: UserType;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const isRecruiter = user?.role === 'recruiter';
  const [activeTab, setActiveTab] = useState<'Account' | 'Company'>('Account');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    // Keep only password-related fields and basic user info relevant for admin settings
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    // Remove notification settings as per instruction to keep only 'Account Settings'
  });

  // Company information for recruiters
  const [companyData, setCompanyData] = useState({
    company_name: '',
    industry: '',
    description: '',
    company_email: '',
    company_address: '',
  });

  const [recruiterId, setRecruiterId] = useState<number | null>(null);
  const [isLoadingRecruiter, setIsLoadingRecruiter] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [companyEmailError, setCompanyEmailError] = useState<string>('');

  // Fonction de validation d'email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email.trim());
  };

  // Load recruiter profile data when component mounts
  useEffect(() => {
    const loadRecruiterProfile = async () => {
      if (isRecruiter && user?.id) {
        setIsLoadingRecruiter(true);
        try {
          const recruiterProfile = await apiService.getRecruiterByUserId(user.id);
          if (recruiterProfile) {
            setRecruiterId(recruiterProfile.id);
            setCompanyData({
              company_name: recruiterProfile.company_name || '',
              industry: recruiterProfile.industry || '',
              description: recruiterProfile.description || '',
              company_email: recruiterProfile.company_email || '',
              company_address: recruiterProfile.company_address || '',
            });
          }
        } catch (error) {
          console.error('Error loading recruiter profile:', error);
        } finally {
          setIsLoadingRecruiter(false);
        }
      }
    };

    loadRecruiterProfile();
  }, [isRecruiter, user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompanyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Removed CV and image upload handlers as they are not part of 'Account Settings'
  
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      if (!user?.id) {
        throw new Error('User ID is missing.');
      }

      // Only handle password change for admin in Account Settings
      if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
        if (!formData.currentPassword || !formData.newPassword) {
          throw new Error('Please fill current and new password');
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New password and confirmation do not match');
        }

        await apiService.updateUserProfile(user.id, {
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword
        });
        setSaveMessage('✓ Password updated successfully');
        // Clear password fields after success
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        // If only name is updated (email removed for recruiters)
        await apiService.updateUserProfile(user.id, {
          first_name: formData.firstName,
          last_name: formData.lastName,
        });
        setSaveMessage('✓ Personal info updated successfully');
      }
      
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error saving changes';
      setSaveMessage(`❌ ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCompany = async () => {
    setIsSaving(true);
    setSaveMessage('');
    setCompanyEmailError('');
    
    try {
      if (!recruiterId) {
        throw new Error('Recruiter ID is missing.');
      }

      // Validation de l'email de l'entreprise
      if (companyData.company_email && !validateEmail(companyData.company_email)) {
        setCompanyEmailError("Format d'email invalide (ex: contact@company.com)");
        setSaveMessage("❌ Veuillez corriger l'email de l'entreprise");
        setIsSaving(false);
        return;
      }

      await apiService.updateRecruiterProfile(recruiterId, {
        company_name: companyData.company_name,
        industry: companyData.industry,
        description: companyData.description,
        company_email: companyData.company_email ? companyData.company_email.trim().toLowerCase() : '',
        company_address: companyData.company_address,
      });
      
      setSaveMessage('✓ Company information updated successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error saving company information';
      setSaveMessage(`❌ ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const settingsTabs = [
    { id: 'Account' as const, label: 'Account Settings', icon: '⚙️' },
    ...(isRecruiter ? [{ id: 'Company' as const, label: 'Company Information', icon: '🏢' }] : [])
  ];

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your account preferences and information</p>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        {settingsTabs.map(tab => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className="save-message">
          {saveMessage}
          <button onClick={() => setSaveMessage('')} className="close-message">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="settings-content">
        {/* Account Settings Content */}
        {activeTab === 'Account' && (
          <div className="settings-section">
            <h2 className="section-title">Account Settings</h2>
            
            <form className="settings-form">
              {/* Personal Information for Admin (if needed, e.g., for name/email update) */}
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              {/* Email field removed for recruiters - they cannot change their email */}

              {/* Password Change */}
              <div className="settings-subsection">
                <h3 className="subsection-title">
                  <Lock size={20} />
                  Change Password
                </h3>

                <div className="form-group">
                  <label>Current Password</label>
                  <div className="password-input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <div className="password-input-group">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="password-toggle"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleSave} className="btn-save" disabled={isSaving}>
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Company Information for Recruiters */}
        {activeTab === 'Company' && isRecruiter && (
          <div className="settings-section">
            <h2 className="section-title">
              <Building2 size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Company Information
            </h2>
            
            {isLoadingRecruiter ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Loading company information...</p>
              </div>
            ) : (
              <form className="settings-form">
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="company_name"
                    value={companyData.company_name}
                    onChange={handleCompanyInputChange}
                    placeholder="Enter company name"
                  />
                </div>

                <div className="form-group">
                  <label>Industry</label>
                  <input
                    type="text"
                    name="industry"
                    value={companyData.industry}
                    onChange={handleCompanyInputChange}
                    placeholder="Enter industry"
                  />
                </div>

                <div className="form-group">
                  <label>Company Description</label>
                  <textarea
                    name="description"
                    value={companyData.description}
                    onChange={handleCompanyInputChange}
                    placeholder="Enter company description"
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Company Email</label>
                  <input
                    type="email"
                    name="company_email"
                    value={companyData.company_email}
                    onChange={(e) => {
                      handleCompanyInputChange(e);
                      // Validation en temps réel
                      if (e.target.value && !validateEmail(e.target.value)) {
                        setCompanyEmailError("Format d'email invalide (ex: contact@company.com)");
                      } else {
                        setCompanyEmailError('');
                      }
                    }}
                    onBlur={(e) => {
                      // Validation au blur
                      if (e.target.value && !validateEmail(e.target.value)) {
                        setCompanyEmailError("Format d'email invalide (ex: contact@company.com)");
                      } else {
                        setCompanyEmailError('');
                      }
                    }}
                    className={companyEmailError ? 'error' : ''}
                    placeholder="Enter company email"
                  />
                  {companyEmailError && (
                    <p className="error-message" style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {companyEmailError}
                    </p>
                  )}
                  {companyData.company_email && !companyEmailError && validateEmail(companyData.company_email) && (
                    <p style={{ color: 'green', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      ✓ Email valide
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label>Company Address</label>
                  <input
                    type="text"
                    name="company_address"
                    value={companyData.company_address}
                    onChange={handleCompanyInputChange}
                    placeholder="Enter company address"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={handleSaveCompany} className="btn-save" disabled={isSaving}>
                    <Save size={18} />
                    {isSaving ? 'Saving...' : 'Save Company Information'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
