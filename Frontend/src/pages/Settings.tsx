import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Bell, Eye, EyeOff, Save, X } from 'lucide-react';
import './Settings.css';
import { apiService } from '../services/api';



interface SettingsProps {
  user?: any;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Personal' | 'Profile' | 'Social' | 'Account'>('Personal');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [recruiterData, setRecruiterData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    // Recruiter fields
    companyName: '',
    industry: '',
    companyDescription: '',
    companyEmail: '',
    companyAddress: '',
    // Password fields
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load recruiter data if user is a recruiter
  useEffect(() => {
    const loadRecruiterData = async () => {
      if (user?.role === 'recruiter' && user?.id) {
        try {
          const recruiter = await apiService.getRecruiterByUserId(user.id);
          setRecruiterData(recruiter);
          setFormData(prev => ({
            ...prev,
            companyName: recruiter.company_name || '',
            industry: recruiter.industry || '',
            companyDescription: recruiter.description || '',
            companyEmail: recruiter.company_email || '',
            companyAddress: recruiter.company_address || '',
          }));
        } catch (error) {
          console.error('Error loading recruiter data:', error);
        }
      }
    };

    loadRecruiterData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
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

  // Removed dedicated change password handler; integrated into handleSave

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Update user profile (first_name, last_name, email)
      const userUpdateData: any = {};
      if (formData.firstName !== user?.first_name) userUpdateData.first_name = formData.firstName;
      if (formData.lastName !== user?.last_name) userUpdateData.last_name = formData.lastName;
      if (formData.email !== user?.email) userUpdateData.email = formData.email;

      // Handle password change if provided
      if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
        if (!formData.currentPassword || !formData.newPassword) {
          throw new Error('Please fill current and new password');
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New password and confirmation do not match');
        }
        userUpdateData.oldPassword = formData.currentPassword;
        userUpdateData.newPassword = formData.newPassword;
      }

      // Update user profile if there are changes
      if (Object.keys(userUpdateData).length > 0) {
        await apiService.updateUserProfile(user.id, userUpdateData);
      }

      // Update recruiter profile if user is a recruiter
      if (user?.role === 'recruiter' && recruiterData) {
        const recruiterUpdateData: any = {};
        if (formData.companyName !== recruiterData.company_name) recruiterUpdateData.company_name = formData.companyName;
        if (formData.industry !== recruiterData.industry) recruiterUpdateData.industry = formData.industry;
        if (formData.companyDescription !== recruiterData.description) recruiterUpdateData.description = formData.companyDescription;
        if (formData.companyEmail !== recruiterData.company_email) recruiterUpdateData.company_email = formData.companyEmail;
        if (formData.companyAddress !== recruiterData.company_address) recruiterUpdateData.company_address = formData.companyAddress;

        if (Object.keys(recruiterUpdateData).length > 0) {
          await apiService.updateRecruiterProfile(recruiterData.id, recruiterUpdateData);
        }
      }

      // Clear password fields after success
      if (userUpdateData.newPassword) {
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }

      setSaveMessage('✓ Changes saved successfully');
      
      // Redirect to employer profile if recruiter
      if (user?.role === 'recruiter') {
        setTimeout(() => {
          navigate('/employer-profile');
        }, 1000);
      } else {
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      setSaveMessage((error as any)?.message || 'Error saving changes');
    } finally {
      setIsSaving(false);
    }
  };

  const settingsTabs = user?.role === 'recruiter' 
    ? [
        { id: 'Personal', label: 'Personal Information', icon: '👤' },
        { id: 'Account', label: 'Account Settings', icon: '⚙️' }
      ]
    : [
        { id: 'Personal', label: 'Personal', icon: '👤' },
        { id: 'Profile', label: 'Profile', icon: '📋' },
        { id: 'Social', label: 'Social Links', icon: '🔗' },
        { id: 'Account', label: 'Account Settings', icon: '⚙️' }
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
            onClick={() => setActiveTab(tab.id as any)}
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
        {/* Personal Settings */}
        {activeTab === 'Personal' && (
          <div className="settings-section">
            <h2 className="section-title">Personal Information</h2>
            
            <form className="settings-form">
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

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                />
              </div>

              {/* Recruiter-specific fields */}
              {user?.role === 'recruiter' && (
                <>
                  <div className="settings-subsection" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                    <h3 className="subsection-title">Company Information</h3>
                  </div>

                  <div className="form-group">
                    <label>Company Name *</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Enter company name"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Industry *</label>
                      <input
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        placeholder="Enter industry"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Company Email *</label>
                      <input
                        type="email"
                        name="companyEmail"
                        value={formData.companyEmail}
                        onChange={handleInputChange}
                        placeholder="Enter company email"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Company Address *</label>
                    <input
                      type="text"
                      name="companyAddress"
                      value={formData.companyAddress}
                      onChange={handleInputChange}
                      placeholder="Enter company address"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Company Description *</label>
                    <textarea
                      name="companyDescription"
                      value={formData.companyDescription}
                      onChange={handleInputChange}
                      placeholder="Describe your company"
                      rows={4}
                      required
                    />
                  </div>
                </>
              )}

              <div className="form-actions">
                <button type="button" onClick={handleSave} className="btn-save" disabled={isSaving}>
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}


        {/* Account Settings */}
        {activeTab === 'Account' && (
          <div className="settings-section">
            <h2 className="section-title">Account Settings</h2>
            
            <form className="settings-form">
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

              {/* Notifications - Only for candidates */}
              {user?.role === 'candidate' && (
                <div className="settings-subsection">
                  <h3 className="subsection-title">
                    <Bell size={20} />
                    Notification Preferences
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Notification preferences are not yet implemented in the backend.
                  </p>
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={handleSave} className="btn-save" disabled={isSaving}>
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
