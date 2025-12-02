import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Save, X } from 'lucide-react';
import { apiService } from '../services/api';
import type { User as UserType, NavigationItem, SidebarItem } from '../types';
import './Settings.css';
import './Dashboard.css';

interface CandidateSettingsProps {
  user?: UserType;
  onLogout?: () => void;
}

const CandidateSettings: React.FC<CandidateSettingsProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Personal' | 'Profile' | 'Account'>('Personal');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [candidateProfile, setCandidateProfile] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Navigation items for the top navigation bar
  const navigationItems: NavigationItem[] = [
    { id: 'Home', label: 'Home' },
    { id: 'Find_Job', label: 'Find Job', path: '/find-jobs' },
    { id: 'Dashboard', label: 'Dashboard', path: '/dashboard' },
    { id: 'Job_Alerts', label: 'Job Alerts' },
    { id: 'Customer_Supports', label: 'Customer Supports' }
  ];

  // Sidebar items for the dashboard
  const sidebarItems: SidebarItem[] = [
    { id: 'Overview', label: 'Overview', icon: '📊' },
    { id: 'Applied_Jobs', label: 'Applied Jobs', icon: '💼' },
    { id: 'Saved_Jobs', label: 'Saved Jobs', icon: '💾' },
    { id: 'Job_Alert', label: 'Job Alert', icon: '🔔', badge: '09' },
    { id: 'Settings', label: 'Settings', icon: '⚙️' }
  ];

  // Handle navigation between pages
  const handleNavigation = (itemId: string) => {
    if (itemId === 'Dashboard') {
      navigate('/dashboard');
    } else if (itemId === 'Home') {
      navigate('/');
    } else if (itemId === 'Find_Job') {
      navigate('/find-jobs');
    } else if (itemId === 'Job_Alerts') {
      navigate('/notifications');
    } else if (itemId === 'Customer_Supports') {
      navigate('/customer-support');
    }
  };

  // Handle sidebar item clicks
  const handleSidebarClick = (itemId: string) => {
    if (itemId === 'Applied_Jobs') {
      navigate('/applied-jobs');
      return;
    }
    if (itemId === 'Saved_Jobs') {
      navigate('/saved-jobs');
      return;
    }
    if (itemId === 'Overview' || itemId === 'Dashboard') {
      navigate('/dashboard');
      return;
    }
    // Reste sur Settings (cette page)
  };

  // Load candidate profile data
  useEffect(() => {
    const loadCandidateProfile = async () => {
      if (user?.id) {
        try {
          const candidate = await apiService.getCandidateByUserId(user.id);
          setCandidateProfile(candidate);
          setIsLoading(false);
        } catch (error) {
          console.error('Error loading candidate profile:', error);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    loadCandidateProfile();
  }, [user]);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string>('');

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


  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (file.type !== 'application/pdf') {
        setCvError('❌ Le fichier doit être au format PDF');
        e.target.value = '';
        return;
      }
      // Vérifier la taille du fichier (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setCvError('❌ La taille du fichier ne doit pas dépasser 10 Mo');
        e.target.value = '';
        return;
      }
      setCvError('');
      setCvFile(file);
    }
  };

  const removeCvFile = () => {
    setCvFile(null);
    const fileInput = document.getElementById('cvFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Update user profile (first_name, last_name, email)
      if (formData.firstName || formData.lastName || formData.email) {
        await apiService.updateUserProfile(user.id, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email
        });
      }

      // Update candidate profile (CV, image)
      if (candidateProfile?.id) {
        const updateData: any = {};
        
        // Pour l'instant, on envoie juste le nom du fichier
        // En production, il faudrait uploader les fichiers vers un service de stockage
        if (cvFile) {
          updateData.cv = cvFile.name;
        }

        if (Object.keys(updateData).length > 0) {
          await apiService.updateCandidateProfile(candidateProfile.id, updateData);
        }
      }

      // Change password if provided
      if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
        if (!formData.currentPassword || !formData.newPassword) {
          throw new Error('Veuillez remplir le mot de passe actuel et le nouveau mot de passe');
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('Le nouveau mot de passe et la confirmation ne correspondent pas');
        }
        if (candidateProfile?.id) {
          await apiService.updateCandidateProfile(candidateProfile.id, {
            oldPassword: formData.currentPassword,
            newPassword: formData.newPassword
          });
        }
        // Clear password fields after success
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }

      setSaveMessage('✓ Modifications enregistrées avec succès');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      let errorMessage = 'Erreur lors de l\'enregistrement';
      if (error instanceof Error) {
        // Check if it's an email already used error
        if (error.message.toLowerCase().includes('email') && 
            (error.message.toLowerCase().includes('déjà utilisé') || 
             error.message.toLowerCase().includes('already used') ||
             error.message.toLowerCase().includes('déjà existant'))) {
          errorMessage = 'Cet email est déjà utilisé. Veuillez choisir un autre email.';
        } else {
          errorMessage = error.message;
        }
      }
      setSaveMessage(`❌ ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const settingsTabs = [
    { id: 'Personal' as const, label: 'Informations Personnelles', icon: '👤' },
    { id: 'Profile' as const, label: 'Profil', icon: '📋' },
    { id: 'Account' as const, label: 'Paramètres du Compte', icon: '⚙️' }
  ];

  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="dashboard-content">
          <main className="dashboard-main">
            <div className="loading">Chargement des paramètres...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header with navigation */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">💼</span>
            <span className="logo-text">RecruPlus</span>
          </div>
          <nav className="main-nav">
            {navigationItems.map(item => (
              <a 
                key={item.id}
                href="#" 
                className={`nav-link ${item.id === 'Dashboard' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation(item.id);
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        
      </header>

      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <h3 className="sidebar-title">CANDIDATE DASHBOARD</h3>
          <nav className="sidebar-nav">
            <ul>
              {sidebarItems.map((item) => (
                <li key={item.id}>
                  <a
                    href="#"
                    className={`sidebar-link ${item.id === 'Settings' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSidebarClick(item.id);
                    }}
                  >
                    <span className="sidebar-icon">{item.icon}</span>
                    <span className="sidebar-label">{item.label}</span>
                    {item.badge && <span className="badge">{item.badge}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="logout-section">
            <button 
              onClick={onLogout}
              className="logout-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}
            >
              <span className="logout-icon">↗️</span>
              Log-out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          <div className="welcome-section">
            <h1 className="welcome-title">Paramètres</h1>
            <p className="welcome-subtitle">Gérez vos informations et préférences de compte</p>
          </div>

          {/* Tabs */}
          <div className="settings-tabs" style={{ marginBottom: '20px', display: 'flex', gap: '10px', borderBottom: '2px solid #e0e0e0' }}>
            {settingsTabs.map(tab => (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #2196F3' : '2px solid transparent',
                  color: activeTab === tab.id ? '#2196F3' : '#666',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: activeTab === tab.id ? '600' : '400'
                }}
              >
                <span style={{ marginRight: '8px' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className="save-message" style={{
              padding: '12px 16px',
              marginBottom: '20px',
              borderRadius: '4px',
              background: saveMessage.startsWith('✓') ? '#d4edda' : '#f8d7da',
              color: saveMessage.startsWith('✓') ? '#155724' : '#721c24',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{saveMessage}</span>
              <button onClick={() => setSaveMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="settings-content" style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {/* Personal Settings */}
            {activeTab === 'Personal' && (
              <div className="settings-section">
                <h2 className="section-title" style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>Informations Personnelles</h2>
                
                <form className="settings-form">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Prénom</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Entrez votre prénom"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Nom</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Entrez votre nom"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Entrez votre email"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div className="form-actions" style={{ marginTop: '30px' }}>
                    <button 
                      type="button" 
                      onClick={handleSave} 
                      className="btn-save" 
                      disabled={isSaving}
                      style={{
                        padding: '12px 24px',
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Save size={18} />
                      {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Profile Settings */}
            {activeTab === 'Profile' && (
              <div className="settings-section">
                <h2 className="section-title" style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>Profil</h2>
                
                <form className="settings-form">
                  {/* CV Upload */}
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>CV/Resume (PDF)</label>
                    <div style={{ marginBottom: '10px' }}>
                      <input
                        type="file"
                        id="cvFile"
                        accept=".pdf,application/pdf"
                        onChange={handleCvUpload}
                        style={{ display: 'none' }}
                      />
                      <label 
                        htmlFor="cvFile" 
                        style={{
                          padding: '10px 20px',
                          background: '#f5f5f5',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'inline-block'
                        }}
                      >
                        📄 {cvFile ? 'Changer le fichier' : 'Sélectionner un fichier PDF'}
                      </label>
                      {cvFile && (
                        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '14px' }}>{cvFile.name}</span>
                          <span style={{ fontSize: '12px', color: '#666' }}>({(cvFile.size / (1024 * 1024)).toFixed(2)} Mo)</span>
                          <button 
                            type="button" 
                            onClick={removeCvFile}
                            style={{
                              background: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                    {cvError && <div style={{ color: '#f44336', fontSize: '14px', marginTop: '5px' }}>{cvError}</div>}
                    <small style={{ fontSize: '12px', color: '#666' }}>Téléchargez votre CV au format PDF (max 10 Mo)</small>
                  </div>

                  <div className="form-actions" style={{ marginTop: '30px' }}>
                    <button 
                      type="button" 
                      onClick={handleSave} 
                      className="btn-save" 
                      disabled={isSaving}
                      style={{
                        padding: '12px 24px',
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Save size={18} />
                      {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Account Settings */}
            {activeTab === 'Account' && (
              <div className="settings-section">
                <h2 className="section-title" style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>Paramètres du Compte</h2>
                
                <form className="settings-form">
                  {/* Password Change */}
                  <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Lock size={20} />
                      Changer le mot de passe
                    </h3>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Mot de passe actuel</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          placeholder="Entrez votre mot de passe actuel"
                          style={{
                            width: '100%',
                            padding: '10px 40px 10px 10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Nouveau mot de passe</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          placeholder="Entrez votre nouveau mot de passe"
                          style={{
                            width: '100%',
                            padding: '10px 40px 10px 10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Confirmer le mot de passe</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirmez votre nouveau mot de passe"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-actions" style={{ marginTop: '30px' }}>
                    <button 
                      type="button" 
                      onClick={handleSave} 
                      className="btn-save" 
                      disabled={isSaving}
                      style={{
                        padding: '12px 24px',
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Save size={18} />
                      {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CandidateSettings;

