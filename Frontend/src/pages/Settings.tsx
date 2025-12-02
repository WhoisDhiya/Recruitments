import React, { useState } from 'react';
import { User, Lock, Bell, Eye, EyeOff, Save, X } from 'lucide-react';
import './Settings.css';
import { apiService } from '../services/api';
import type { User as UserType } from '../types';

interface SettingsProps {
  user?: UserType;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'Account'>('Account'); // Keep only 'Account'
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

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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

  const settingsTabs = [
    { id: 'Account' as const, label: 'Account Settings', icon: '⚙️' } // Keep only 'Account'
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
      </div>
    </div>
  );
};

export default Settings;
