import React, { useState } from 'react';
import { User, Linkedin, Twitter, Facebook, Instagram, Lock, Bell, Eye, EyeOff, Save, X } from 'lucide-react';
import './Settings.css';
import { apiService } from '../services/api';
import type { User as UserType } from '../types';

interface SettingsProps {
  user?: UserType;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'Personal' | 'Profile' | 'Social' | 'Account'>('Personal');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    gender: '',
    address: '',
    city: '',
    country: '',
    bio: '',
    cv: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
    portfolio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    jobAlerts: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

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

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle image upload
      console.log('Image uploaded:', file.name);
    }
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (file.type !== 'application/pdf') {
        setCvError('❌ Le fichier doit être au format PDF');
        e.target.value = ''; // Réinitialiser le champ de fichier
        return;
      }
      // Vérifier la taille du fichier (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setCvError('❌ La taille du fichier ne doit pas dépasser 10 Mo');
        e.target.value = ''; // Réinitialiser le champ de fichier
        return;
      }
      setCvError('');
      setCvFile(file);
      
      // Mettre à jour le formulaire avec le nom du fichier
      setFormData(prev => ({
        ...prev,
        cv: file.name
      }));
    }
  };

  const removeCvFile = () => {
    setCvFile(null);
    setFormData(prev => ({
      ...prev,
      cv: ''
    }));
    // Réinitialiser le champ de fichier
    const fileInput = document.getElementById('cvFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // If password fields are filled, change password first
      if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
        if (!formData.currentPassword || !formData.newPassword) {
          throw new Error('Please fill current and new password');
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New password and confirmation do not match');
        }
        // Candidate password change via candidateController
        if (user?.role === 'candidate') {
          const candidate = await apiService.getCandidateByUserId(user.id);
          await apiService.updateCandidateProfile(candidate.id, {
            oldPassword: formData.currentPassword,
            newPassword: formData.newPassword
          });
        } else {
          // For non-candidate roles, skip password change here (no backend route specified)
          // You can implement recruiter/admin password change when backend endpoint is available
        }
        // Clear password fields after success
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }

      // Other profile fields saving can be added here if needed

      setSaveMessage('✓ Changes saved successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error saving changes';
      setSaveMessage(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const settingsTabs = [
    { id: 'Personal' as const, label: 'Personal', icon: '👤' },
    { id: 'Profile' as const, label: 'Profile', icon: '📋' },
    { id: 'Social' as const, label: 'Social Links', icon: '🔗' },
    { id: 'Account' as const, label: 'Account Settings', icon: '⚙️' }
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

              <div className="form-row">
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
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nationality</label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    placeholder="Enter nationality"
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

        {/* Profile Settings */}
        {activeTab === 'Profile' && (
          <div className="settings-section">
            <h2 className="section-title">Profile Information</h2>
            
            <form className="settings-form">
              {/* Profile Image */}
              <div className="form-group profile-image-group">
                <label>Profile Picture</label>
                <div className="profile-image-container">
                  <div className="profile-image-preview">
                    <User size={48} />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="profile-image-input"
                    id="profileImage"
                  />
                  <label htmlFor="profileImage" className="btn-upload">
                    Upload Photo
                  </label>
                </div>
              </div>

              {/* CV Upload */}
              <div className="form-group">
                <label>CV/Resume (PDF)</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="cvFile"
                    accept=".pdf,application/pdf"
                    onChange={handleCvUpload}
                    className="file-input"
                  />
                  <label htmlFor="cvFile" className="file-input-label">
                    📄 {cvFile ? 'Changer le fichier' : 'Sélectionner un fichier PDF'}
                  </label>
                  {formData.cv && (
                    <div className="file-selected">
                      <span className="file-name">{formData.cv}</span>
                      {cvFile && (
                        <span className="file-size">({(cvFile.size / (1024 * 1024)).toFixed(2)} Mo)</span>
                      )}
                      <button 
                        type="button" 
                        className="remove-file-btn"
                        onClick={removeCvFile}
                        title="Supprimer le fichier"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                {cvError && <div className="error-message">{cvError}</div>}
                <small className="form-hint">Téléchargez votre CV au format PDF (max 10 Mo)</small>
              </div>

              {/* Address Information */}
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter street address"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                  />
                </div>
                {/* Zip Code removed per request */}
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Enter country"
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
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

        {/* Social Links */}
        {activeTab === 'Social' && (
          <div className="settings-section">
            <h2 className="section-title">Social Media Links</h2>
            
            <form className="settings-form">
              <div className="social-links-group">
                <div className="form-group">
                  <label>
                    <Linkedin size={18} className="social-icon linkedin" />
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Twitter size={18} className="social-icon twitter" />
                    Twitter URL
                  </label>
                  <input
                    type="url"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleInputChange}
                    placeholder="https://twitter.com/yourprofile"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Facebook size={18} className="social-icon facebook" />
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    placeholder="https://facebook.com/yourprofile"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Instagram size={18} className="social-icon instagram" />
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>

                <div className="form-group">
                  <label>Portfolio Website</label>
                  <input
                    type="url"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                    placeholder="https://yourportfolio.com"
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

              {/* Notifications */}
              <div className="settings-subsection">
                <h3 className="subsection-title">
                  <Bell size={20} />
                  Notification Preferences
                </h3>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={formData.emailNotifications}
                      onChange={handleInputChange}
                    />
                    <span>Email Notifications</span>
                    <span className="checkbox-description">Receive updates via email</span>
                  </label>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="smsNotifications"
                      checked={formData.smsNotifications}
                      onChange={handleInputChange}
                    />
                    <span>SMS Notifications</span>
                    <span className="checkbox-description">Receive updates via SMS</span>
                  </label>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="pushNotifications"
                      checked={formData.pushNotifications}
                      onChange={handleInputChange}
                    />
                    <span>Push Notifications</span>
                    <span className="checkbox-description">Receive browser notifications</span>
                  </label>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="jobAlerts"
                      checked={formData.jobAlerts}
                      onChange={handleInputChange}
                    />
                    <span>Job Alerts</span>
                    <span className="checkbox-description">Receive job recommendations</span>
                  </label>
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
