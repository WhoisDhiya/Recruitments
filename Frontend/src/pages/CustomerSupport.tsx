import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, NavigationItem, SidebarItem } from '../types';
import './Dashboard.css';

interface CustomerSupportProps {
  user?: User;
  onLogout?: () => void;
}

const CustomerSupport: React.FC<CustomerSupportProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    message: '',
    email: user?.email || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

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
    { id: 'Job_Alert', label: 'Job Alert', icon: '🔔' },
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
    if (itemId === 'Settings') {
      navigate('/settings');
      return;
    }
    if (itemId === 'Job_Alert') {
      navigate('/notifications');
      return;
    }
    if (itemId === 'Overview' || itemId === 'Dashboard') {
      navigate('/dashboard');
      return;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Simuler l'envoi du formulaire (à remplacer par un vrai appel API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitMessage('✅ Votre message a été envoyé avec succès ! Notre équipe vous répondra dans les plus brefs délais.');
      setFormData({
        subject: '',
        category: 'general',
        message: '',
        email: user?.email || ''
      });
    } catch (error) {
      setSubmitMessage('❌ Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqItems = [
    {
      question: 'Comment puis-je postuler à une offre d\'emploi ?',
      answer: 'Pour postuler à une offre, connectez-vous à votre compte, recherchez l\'offre qui vous intéresse, puis cliquez sur "Postuler maintenant". Remplissez le formulaire de candidature et soumettez-le.'
    },
    {
      question: 'Comment puis-je sauvegarder des offres d\'emploi ?',
      answer: 'Lorsque vous parcourez les offres d\'emploi, cliquez sur le bouton "Save" pour sauvegarder une offre. Vous pourrez ensuite la consulter dans la section "Saved Jobs" de votre tableau de bord.'
    },
    {
      question: 'Comment modifier mon profil ?',
      answer: 'Allez dans la section "Settings" de votre tableau de bord. Là, vous pourrez modifier vos informations personnelles, votre CV, et vos préférences de compte.'
    },
    {
      question: 'Comment recevoir des notifications sur les nouvelles offres ?',
      answer: 'Activez les alertes d\'emploi dans les paramètres de votre compte. Vous recevrez des notifications par email ou dans l\'application lorsque de nouvelles offres correspondant à vos critères sont publiées.'
    },
    {
      question: 'Que faire si j\'ai oublié mon mot de passe ?',
      answer: 'Sur la page de connexion, cliquez sur "Mot de passe oublié" et suivez les instructions pour réinitialiser votre mot de passe. Un email vous sera envoyé avec les instructions.'
    }
  ];

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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
                className={`nav-link ${item.id === 'Customer_Supports' ? 'active' : ''}`}
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
                    className="sidebar-link"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSidebarClick(item.id);
                    }}
                  >
                    <span className="sidebar-icon">{item.icon}</span>
                    <span className="sidebar-label">{item.label}</span>
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
            <h1 className="welcome-title">Support Client</h1>
            <p className="welcome-subtitle">Nous sommes là pour vous aider. Contactez-nous ou consultez nos FAQ.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px' }}>
            {/* Contact Form */}
            <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: '600', color: '#333' }}>
                📧 Contactez-nous
              </h2>
              
              {submitMessage && (
                <div style={{
                  padding: '12px 16px',
                  marginBottom: '20px',
                  borderRadius: '4px',
                  background: submitMessage.startsWith('✅') ? '#d4edda' : '#f8d7da',
                  color: submitMessage.startsWith('✅') ? '#155724' : '#721c24',
                  fontSize: '14px'
                }}>
                  {submitMessage}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                    Catégorie *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      background: 'white'
                    }}
                  >
                    <option value="general">Question générale</option>
                    <option value="technical">Problème technique</option>
                    <option value="account">Problème de compte</option>
                    <option value="payment">Question de paiement</option>
                    <option value="application">Question sur les candidatures</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                    Sujet *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="Résumé de votre question"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    placeholder="Décrivez votre question ou problème en détail..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: isSubmitting ? '#ccc' : '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'background 0.3s'
                  }}
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                </button>
              </form>
            </div>

            {/* FAQ Section */}
            <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: '600', color: '#333' }}>
                ❓ Questions Fréquentes
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {faqItems.map((faq, index) => (
                  <div
                    key={index}
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      transition: 'all 0.3s'
                    }}
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      style={{
                        width: '100%',
                        padding: '15px 20px',
                        background: expandedFaq === index ? '#f5f5f5' : 'white',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#333'
                      }}
                    >
                      <span>{faq.question}</span>
                      <span style={{ fontSize: '18px', color: '#666' }}>
                        {expandedFaq === index ? '−' : '+'}
                      </span>
                    </button>
                    {expandedFaq === index && (
                      <div style={{
                        padding: '15px 20px',
                        background: '#f9f9f9',
                        borderTop: '1px solid #e0e0e0',
                        fontSize: '14px',
                        color: '#666',
                        lineHeight: '1.6'
                      }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Contact Info */}
              <div style={{ marginTop: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: '600', color: '#333' }}>
                  📞 Autres moyens de contact
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#666' }}>
                  <div>
                    <strong>Téléphone:</strong> +216 23 235 891
                  </div>
                  <div>
                    <strong>Email:</strong> support@recruplus.com
                  </div>
                  <div>
                    <strong>Heures d'ouverture:</strong> Lun-Ven, 9h-17h
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerSupport;

